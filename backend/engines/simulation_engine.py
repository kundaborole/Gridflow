from engines.llm_advisor import LLMAdvisor

class SimulationEngine:
    def __init__(self, data_manager, balancing_engine, risk_engine, prediction_engine, sustainability_calculator):
        self.data_manager = data_manager
        self.balancing_engine = balancing_engine
        self.risk_engine = risk_engine
        self.prediction_engine = prediction_engine
        self.sustainability_calculator = sustainability_calculator
        self.llm_advisor = LLMAdvisor()
        
        # Smart Caching: hour -> dict of state
        self.computed_states = {}
        
        # Cumulative tracking
        self.cumulative_savings = 0.0
        self.cumulative_co2 = 0.0
        self.blackouts_prevented = 0
        self.decision_history = []
        
    def _compute_grid_health(self, battery_soc, balance, risks):
        """Generates a 0-100 score for grid health"""
        score = 100
        
        # Factor 1: Battery reserve
        if battery_soc < 10:
            score -= 25
        elif battery_soc < 25:
            score -= 10
            
        # Factor 2: Demand vs Supply Balance
        if balance < -50:
            score -= 15
        elif balance < 0:
            score -= 5
            
        # Factor 3: Risk Level
        has_critical = any(r['level'] == 'critical' for r in risks)
        has_warning = any(r['level'] == 'warning' for r in risks)
        
        if has_critical:
            score -= 30
        elif has_warning:
            score -= 10
            
        return max(0, min(100, int(score)))

    def get_state(self, hour: int):
        """Returns the fully simulated state for a given hour."""
        if hour in self.computed_states:
            return self.computed_states[hour]
            
        # Compute only missing hours sequentially up to `hour`
        for h in range(hour + 1):
            if h not in self.computed_states:
                self._compute_hour(h)
                
        return self.computed_states[hour]
        
    def _compute_hour(self, hour: int):
        # 1. Fetch raw row from CSV (this is our base ground truth for weather/solar/base demand)
        raw_row = self.data_manager.get_row(hour)
        if not raw_row: 
            return None
            
        # We need independent copies to track before/after state
        current_row = dict(raw_row)
        before_state = dict(raw_row)
        
        # 2. Inherit state from previous hour (if available)
        if hour > 0 and (hour - 1) in self.computed_states:
            prev_state = self.computed_states[hour - 1]
            prev_row = prev_state['current_state']
            prev_balancing = prev_state['balancing']
            
            # Carry over battery level from previous hour
            battery = prev_row['battery_level']
            action = prev_balancing['battery_action']
            rate = prev_balancing['battery_rate']
            
            # Apply AI Decisions to future state
            if action in ("CHARGE", "GRID_CHARGE"):
                # battery += solar_surplus or imported_energy (rate is the power applied)
                # assuming 1 hour duration, energy = power * 1
                battery = min(500.0, battery + rate * 0.92) # charger efficiency
            elif action == "DISCHARGE":
                # battery -= demand_offset
                battery = max(0.0, battery - rate / 0.92) # discharger efficiency
                
            current_row['battery_level'] = round(battery, 2)
            # The 'before_state' for this hour should reflect the battery level inherited from the past
            before_state['battery_level'] = current_row['battery_level']

        # 3. Predict & Risks (before balancing actions)
        forecast = self.prediction_engine.forecast_24h(hour)
        risks = self.risk_engine.analyze_risks(current_row, forecast)
        
        # 4. AI Decision (Balancing & LLM Reasoning)
        balancing = self.balancing_engine.balance_grid(current_row)
        
        # Generate the LLM insight
        llm_input = {
            "hour": hour,
            "battery_level": current_row['battery_level'],
            "total_demand": current_row['total_demand'],
            "solar_generation": current_row['solar_generation'],
            "tariff_zone": balancing.get('tariff_zone', 'UNKNOWN'),
            "grid_health": self._compute_grid_health((current_row['battery_level']/500.0)*100, current_row['solar_generation'] - current_row['total_demand'], risks),
            "risks": [r['message'] for r in risks]
        }
        llm_rec = self.llm_advisor.get_recommendation(llm_input)
        
        # Overwrite the first heuristic recommendation with the intelligent LLM one
        if balancing.get('recommendations'):
            balancing['recommendations'].insert(0, llm_rec)
        else:
            balancing['recommendations'] = [llm_rec]
        
        # 5. Apply Decisions (Load Shedding)
        if balancing['load_shedding'] > 0:
            current_row['total_demand'] -= balancing['load_shedding']
            current_row['total_demand'] = round(max(0, current_row['total_demand']), 2)
            self.blackouts_prevented += 1
            
        # 6. Post-Action Risk & Grid Health
        battery_soc = (current_row['battery_level'] / 500.0) * 100
        balance = current_row['solar_generation'] - current_row['total_demand']
        health_score = self._compute_grid_health(battery_soc, balance, risks)
        
        # 7. Sustainability Tracking
        sustainability = self.sustainability_calculator.calculate_metrics(current_row, balancing)
        self.cumulative_savings += sustainability['cost_savings_usd']
        self.cumulative_co2 += sustainability['co2_offset_kg']
        
        # 8. Record AI Decision History
        for rec in balancing['recommendations']:
            # Expecting dict: { action, reason, expectedBenefit }
            if isinstance(rec, dict):
                self.decision_history.append({
                    "hour": hour,
                    "action": rec.get("action", "INFO"),
                    "reason": rec.get("reason", ""),
                    "impact": rec.get("expectedBenefit", "")
                })
            else:
                self.decision_history.append({
                    "hour": hour,
                    "action": "INFO",
                    "reason": "System note",
                    "impact": str(rec)
                })
            
        # 9. Cache computed state
        self.computed_states[hour] = {
            "index": hour,
            "before": before_state,
            "after": current_row,
            "current_state": current_row,  # For backwards compatibility with dashboard.js
            "forecast": forecast,
            "risks": risks,
            "balancing": balancing,
            "grid_health": health_score,
            "sustainability": {
                **sustainability,
                "cumulative_savings_usd": round(self.cumulative_savings, 2),
                "cumulative_co2_kg": round(self.cumulative_co2, 2),
                "blackouts_prevented": self.blackouts_prevented
            },
            "decision_history": self.decision_history[-15:] # Keep last 15 decisions
        }
        
        return self.computed_states[hour]
