import math

class PredictionEngine:
    def __init__(self, data_manager):
        self.data_manager = data_manager
        
    def forecast_24h(self, start_index: int):
        forecasts = []
        current_row = self.data_manager.get_row(start_index)
        if not current_row:
            return []
            
        current_demand = current_row["total_demand"]
        max_records = self.data_manager.get_length()
        
        for offset in range(1, 25):
            target_idx = (start_index + offset) % max_records
            future_row = self.data_manager.get_row(target_idx)
            
            h = future_row["hour"]
            temp = future_row["temperature"]
            cloud_cover = future_row["cloud_cover"]
            
            # --- Demand Prediction Heuristic ---
            # Hourly pattern multiplier
            if 18 <= h <= 22:
                pattern_factor = 1.30  # Evening peak (matches user rule: >= 18 has high demand)
            elif 6 <= h <= 9:
                pattern_factor = 1.15  # Morning peak
            elif 10 <= h <= 17:
                pattern_factor = 1.20  # Midday peak (school & commercial)
            else:
                pattern_factor = 0.70  # Night minimum
                
            # Temperature HVAC impact
            hvac_factor = 1.0
            if temp < 16.0:
                hvac_factor += 0.02 * (16.0 - temp)
            elif temp > 24.0:
                hvac_factor += 0.03 * (temp - 24.0)
                
            predicted_demand = round(current_demand * pattern_factor * hvac_factor * 0.75, 2)
            
            # --- Solar Prediction Heuristic ---
            # Rule: if 6 <= hour <= 18: solar_generation = base_solar * cloud_factor else: 0
            if 6 <= h <= 18:
                # Bell shape base solar capacity (350kW peak)
                t_rel = (h - 6) / 12.0
                base_solar = 350.0 * math.sin(math.pi * t_rel)
                cloud_factor = 1.0 - 0.8 * cloud_cover
                predicted_solar = round(base_solar * cloud_factor, 2)
            else:
                predicted_solar = 0.0
                
            forecasts.append({
                "hour": h,
                "timestamp": future_row["timestamp"],
                "predicted_demand": predicted_demand,
                "predicted_solar": predicted_solar,
                "temperature": temp,
                "cloud_cover": cloud_cover
            })
            
        return forecasts
