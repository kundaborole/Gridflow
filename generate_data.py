import json
import os
import random

# Ensure data directory exists
data_dir = r"c:\Users\kunda\OneDrive\Desktop\data\data"
os.makedirs(data_dir, exist_ok=True)

hours = list(range(24))

def get_base_temp(hour):
    # Temp is lowest at 4AM, highest at 15
    if 4 <= hour <= 15:
        return 15 + (hour - 4) * 1.5
    elif hour > 15:
        return 31.5 - (hour - 15) * 1.0
    else:
        return 19.0 - hour * 1.0

# 1. Microgrid Dataset & 2. Weather Dataset
microgrid_data = []
weather_data = []

battery_level = 100.0 # start full

for hour in hours:
    timestamp = f"2026-06-19T{hour:02d}:00:00Z"
    
    # Temperature and weather
    temp = round(get_base_temp(hour) + random.uniform(-1, 1), 1)
    
    if 6 <= hour <= 18:
        cloud_cover = round(random.uniform(10, 40), 1)
        conditions = "Sunny" if cloud_cover < 20 else "Partly Cloudy"
    else:
        cloud_cover = round(random.uniform(0, 80), 1)
        conditions = "Clear" if cloud_cover < 30 else "Cloudy"
        
    weather_data.append({
        "timestamp": timestamp,
        "temperature": temp,
        "cloud_cover": cloud_cover,
        "conditions": conditions
    })
    
    # Solar generation (peaks at 12-14)
    if 6 <= hour <= 18:
        # Simple curve
        peak_solar = 500 # kW
        dist_from_noon = abs(12 - hour)
        solar_generation = max(0, peak_solar - (dist_from_noon ** 2) * 10)
        solar_generation = round(solar_generation * (1 - cloud_cover/200), 1) # cloud cover reduces solar
    else:
        solar_generation = 0.0

    # Demand (peaks around 18-21 and 7-9)
    base_demand = 200
    if 17 <= hour <= 22:
        demand_spike = 400
    elif 7 <= hour <= 10:
        demand_spike = 200
    else:
        demand_spike = 0
    
    total_demand = round(base_demand + demand_spike + random.uniform(-20, 20), 1)
    
    # Battery level
    net_energy = solar_generation - total_demand
    
    if net_energy > 0:
        # charge battery
        battery_level = min(100.0, battery_level + (net_energy / 100))
    else:
        # deplete battery
        battery_level = max(0.0, battery_level + (net_energy / 50))
        
    battery_level = round(battery_level, 1)

    microgrid_data.append({
        "timestamp": timestamp,
        "temperature": temp,
        "cloud_cover": cloud_cover,
        "solar_generation": solar_generation,
        "total_demand": total_demand,
        "battery_level": battery_level
    })

# 3. Sustainability Dataset
sustainability_data = {
    "cost_saved": 15420.50, # USD
    "co2_reduced": 2450.0,  # kg
    "blackouts_prevented": 12
}

# 4. Baseline Comparison Dataset
# Showing cost difference for a week
baseline_data = []
for day in range(1, 8):
    without_cost = round(random.uniform(5000, 7000), 2)
    with_cost = round(without_cost * random.uniform(0.7, 0.85), 2)
    baseline_data.append({
        "day": day,
        "without_gridflow_cost": without_cost,
        "with_gridflow_cost": with_cost
    })

# Save datasets
with open(os.path.join(data_dir, "microgridData.json"), "w") as f:
    json.dump(microgrid_data, f, indent=2)

with open(os.path.join(data_dir, "weatherData.json"), "w") as f:
    json.dump(weather_data, f, indent=2)

with open(os.path.join(data_dir, "sustainabilityData.json"), "w") as f:
    json.dump(sustainability_data, f, indent=2)

with open(os.path.join(data_dir, "baselineComparisonData.json"), "w") as f:
    json.dump(baseline_data, f, indent=2)

print("Datasets generated successfully.")
