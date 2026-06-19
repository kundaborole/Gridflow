class SustainabilityCalculator:
    def __init__(self):
        # Emission factors (kg CO2 per kWh)
        # Average grid emissions: 0.385 kg CO2/kWh (coal/gas heavy utility grid)
        # Solar emissions: 0.0 kg CO2/kWh
        self.grid_emission_factor = 0.385
        
        # Grid feed-in tariff (export rate)
        self.feed_in_tariff = 0.06  # $/kWh
        
    def calculate_metrics(self, current_row: dict, balancing_actions: dict):
        solar = current_row["solar_generation"]
        demand = current_row["total_demand"]
        
        grid_import = balancing_actions["grid_import"]
        grid_export = balancing_actions["grid_export"]
        tariff_rate = balancing_actions["tariff_rate"]
        
        # 1. Carbon CO2 Offset
        # Local solar generation offset (excluding exported solar which offsets grid elsewhere)
        local_solar_consumed = max(0.0, solar - grid_export)
        co2_offset_kg = round((local_solar_consumed + grid_export) * self.grid_emission_factor, 2)
        
        # 2. Financial Cost Savings
        # What it would have costed if we only bought grid power
        baseline_cost = demand * tariff_rate
        # Actual cost including feed-in revenue
        actual_cost = (grid_import * tariff_rate) - (grid_export * self.feed_in_tariff)
        cost_savings = round(max(0.0, baseline_cost - actual_cost), 2)
        
        # 3. Self-Sufficiency Ratio (%)
        # What percentage of our demand is met by local generation + storage (not grid imports)
        local_energy_used = max(0.0, demand - grid_import)
        if demand > 0:
            self_sufficiency_ratio = round((local_energy_used / demand) * 100.0, 1)
        else:
            self_sufficiency_ratio = 100.0
            
        return {
            "co2_offset_kg": co2_offset_kg,
            "cost_savings_usd": cost_savings,
            "self_sufficiency_ratio": self_sufficiency_ratio,
            "actual_cost_usd": round(actual_cost, 2),
            "baseline_cost_usd": round(baseline_cost, 2)
        }
