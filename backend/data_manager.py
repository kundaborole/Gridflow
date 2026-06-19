import os
import csv

class DataManager:
    def __init__(self):
        # Resolve csv path relative to this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.csv_path = os.path.join(current_dir, "microgrid_data.csv")
        self.records = []
        self.load_data()
        
    def load_data(self):
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(f"Dataset not found at {self.csv_path}. Please run generate_data.py first.")
            
        with open(self.csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                self.records.append({
                    "id": idx,
                    "timestamp": row["timestamp"],
                    "hour": int(row["hour"]),
                    "day_of_week": int(row["day_of_week"]),
                    "month": int(row["month"]),
                    "temperature": float(row["temperature"]),
                    "cloud_cover": float(row["cloud_cover"]),
                    "solar_generation": float(row["solar_generation"]),
                    "residential_demand": float(row["residential_demand"]),
                    "commercial_demand": float(row["commercial_demand"]),
                    "hospital_demand": float(row["hospital_demand"]),
                    "school_demand": float(row["school_demand"]),
                    "total_demand": float(row["total_demand"]),
                    "battery_level": float(row["battery_level"]),
                })
                
    def get_row(self, index: int):
        if 0 <= index < len(self.records):
            return self.records[index]
        return None
        
    def get_length(self):
        return len(self.records)

    def get_slice(self, start: int, end: int):
        # Return records in range [start, end), wrapping around if needed
        # Or just clamp within valid boundaries
        start_idx = max(0, min(start, len(self.records) - 1))
        end_idx = max(0, min(end, len(self.records)))
        return self.records[start_idx:end_idx]
