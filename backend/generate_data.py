import csv
import math
import random
from datetime import datetime, timedelta

def generate_microgrid_data(output_file="microgrid_data.csv"):
    random.seed(42)
    start_time = datetime(2026, 1, 1, 0, 0, 0)
    hours_in_year = 8760
    
    max_battery_capacity = 500.0  
    battery_level = 250.0        
    charger_efficiency = 0.92    
    discharger_efficiency = 0.92 
    max_charge_rate = 120.0       
    max_discharge_rate = 120.0    
    max_solar_capacity = 350.0   
    
    temp_anomaly = 0.0
    cloud_state = 0.0
    
    headers = [
        "timestamp", "hour", "day_of_week", "month", "temperature", "cloud_cover",
        "solar_generation", "residential_demand", "commercial_demand", 
        "hospital_demand", "school_demand", "total_demand", "battery_level"
    ]
    
    records = []
    
    for t in range(hours_in_year):
        dt = start_time + timedelta(hours=t)
        hour = dt.hour
        day_of_week = dt.weekday()
        month = dt.month
        day_of_year = dt.timetuple().tm_yday
        
        T_seasonal = 18.0 - 12.0 * math.cos(2 * math.pi * (day_of_year - 15) / 365)
        T_daily = 5.0 * math.sin(2 * math.pi * (hour - 9) / 24)
        temp_anomaly = 0.95 * temp_anomaly + random.normalvariate(0, 0.4)
        temperature = round(T_seasonal + T_daily + temp_anomaly, 2)
        
        cloud_state = 0.92 * cloud_state + random.normalvariate(0, 0.25)
        cloud_cover = round(1.0 / (1.0 + math.exp(-cloud_state)), 3)
        
        if 6 <= hour <= 18:
            t_rel = (hour - 6) / 12.0
            solar_potential = math.sin(math.pi * t_rel)
            solar_generation = max_solar_capacity * solar_potential * (1.0 - 0.8 * cloud_cover)
            solar_generation += random.normalvariate(0, 3.0)
            solar_generation = round(max(0.0, solar_generation), 2)
        else:
            solar_generation = 0.0
            
        p_morning = math.exp(-((hour - 7.5) ** 2) / (2 * 1.2 ** 2))
        p_evening = math.exp(-((hour - 20.0) ** 2) / (2 * 1.8 ** 2))
        res_shape = 0.2 + 0.3 * p_morning + 0.5 * p_evening
        res_hvac = 0.04 * max(0.0, 16.0 - temperature) + 0.06 * max(0.0, temperature - 24.0)
        res_weekend = 1.15 if day_of_week >= 5 else 1.00
        residential_demand = 40.0 * res_shape * (1.0 + res_hvac) * res_weekend
        residential_demand += random.normalvariate(0, 1.5)
        residential_demand = round(max(3.0, residential_demand), 2)
        
        if day_of_week < 5:
            if 7 <= hour <= 17:
                t_school = (hour - 7) / 10.0
                school_shape = math.sin(math.pi * t_school)
                school_demand = 5.0 + 55.0 * school_shape
                school_hvac = 0.03 * max(0.0, 15.0 - temperature) + 0.05 * max(0.0, temperature - 24.0)
                school_demand *= (1.0 + school_hvac)
            else:
                school_demand = 5.0
        else:
            school_demand = 1.5
            
        school_demand += random.normalvariate(0, 0.8)
        school_demand = round(max(1.0, school_demand), 2)
        
        is_weekend = day_of_week >= 5
        comm_peak_load = 30.0 if is_weekend else 85.0
        comm_base_load = 8.0 if is_weekend else 12.0
        
        if 8 <= hour <= 21:
            t_comm = (hour - 8) / 13.0
            comm_shape = math.sin(math.pi * t_comm)
            commercial_demand = comm_base_load + comm_peak_load * comm_shape
            comm_hvac = 0.03 * max(0.0, 16.0 - temperature) + 0.05 * max(0.0, temperature - 23.0)
            commercial_demand *= (1.0 + comm_hvac)
        else:
            commercial_demand = comm_base_load
            
        commercial_demand += random.normalvariate(0, 2.0)
        commercial_demand = round(max(3.0, commercial_demand), 2)
        
        hospital_demand = 50.0
        hosp_hvac = 0.015 * max(0.0, 17.0 - temperature) + 0.02 * max(0.0, temperature - 22.0)
        hospital_demand *= (1.0 + hosp_hvac)
        hospital_demand += random.normalvariate(0, 1.8)
        hospital_demand = round(max(35.0, hospital_demand), 2)
        
        total_demand = round(residential_demand + school_demand + commercial_demand + hospital_demand, 2)
        
        net_power = solar_generation - total_demand
        if net_power > 0:
            charge_power = min(net_power, max_charge_rate)
            energy_added = charge_power * charger_efficiency
            battery_level = min(max_battery_capacity, battery_level + energy_added)
        else:
            discharge_power = min(abs(net_power), max_discharge_rate)
            energy_removed = discharge_power / discharger_efficiency
            battery_level = max(0.0, battery_level - energy_removed)
            
        battery_level = round(battery_level, 2)
        
        records.append([
            dt.strftime("%Y-%m-%d %H:%M:%S"), hour, day_of_week, month, temperature, cloud_cover,
            solar_generation, residential_demand, commercial_demand, hospital_demand, school_demand, total_demand, battery_level
        ])
        
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(records)

if __name__ == "__main__":
    generate_microgrid_data()
