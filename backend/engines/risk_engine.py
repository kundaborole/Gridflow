class RiskEngine:
    def __init__(self):
        pass
        
    def analyze_risks(self, current_row: dict, forecast: list):
        risks = []
        
        # 1. Battery State of Charge (SoC) Risk (Capacity: 500 kWh)
        battery_soc = (current_row["battery_level"] / 500.0) * 100.0
        
        if battery_soc < 10.0:
            risks.append({
                "type": "battery",
                "level": "critical",
                "message": f"Critical battery level: {battery_soc:.1f}% ({current_row['battery_level']} kWh). Grid support or load-shedding required immediately."
            })
        elif battery_soc < 25.0:
            risks.append({
                "type": "battery",
                "level": "warning",
                "message": f"Low battery level: {battery_soc:.1f}% ({current_row['battery_level']} kWh). Charge from solar or off-peak grid."
            })
        elif battery_soc > 95.0:
            risks.append({
                "type": "battery",
                "level": "info",
                "message": f"Battery near full capacity: {battery_soc:.1f}%. Excess solar will be exported or curtailed."
            })
            
        # 2. Extreme Temperature Risks
        temp = current_row["temperature"]
        if temp < 2.0:
            risks.append({
                "type": "temperature",
                "level": "warning",
                "message": f"Extreme cold detected ({temp:.1f}°C). Expect high heating electrical demand."
            })
        elif temp > 34.0:
            risks.append({
                "type": "temperature",
                "level": "warning",
                "message": f"Extreme heat detected ({temp:.1f}°C). High AC cooling demand expected."
            })
            
        # 3. Forecast Analysis (Demand and Solar Deficits)
        # Look ahead at the next 6 hours
        forecast_6h = forecast[:6]
        total_forecasted_solar = sum(f["predicted_solar"] for f in forecast_6h)
        total_forecasted_demand = sum(f["predicted_demand"] for f in forecast_6h)
        
        # Solar Deficit Alert during high load
        if total_forecasted_solar < 20.0 and current_row["hour"] in range(6, 18):
            # It's daytime, but solar is extremely low (high cloud cover expected)
            avg_cloud = sum(f["cloud_cover"] for f in forecast_6h) / len(forecast_6h)
            if avg_cloud > 0.8:
                risks.append({
                    "type": "solar",
                    "level": "warning",
                    "message": f"Heavy cloud cover forecast ({avg_cloud*100:.0f}% avg). Solar generation will be severely restricted."
                })
                
        # Peak Demand Surcharge Risk
        has_extreme_peak = any(f["predicted_demand"] > 160.0 for f in forecast_6h)
        if has_extreme_peak:
            risks.append({
                "type": "demand",
                "level": "warning",
                "message": "High peak demand forecasted in the next 6 hours. Surcharge pricing may apply if grid import is unmanaged."
            })
            
        # If battery is low and demand is high with no solar
        if battery_soc < 20.0 and current_row["solar_generation"] < 5.0 and current_row["total_demand"] > 100.0:
            risks.append({
                "type": "balancing",
                "level": "critical",
                "message": "Double deficit: High demand and no solar generation while battery is depleted. Grid import critical."
            })
            
        # If no risks found, add a clean state status
        if not risks:
            risks.append({
                "type": "system",
                "level": "normal",
                "message": "Grid Flow AI: All sub-systems functioning normally. Battery storage and solar generation within safe operating margins."
            })
            
        return risks
