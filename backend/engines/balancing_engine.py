class BalancingEngine:
    def __init__(self):
        # Battery constants
        self.max_capacity = 500.0  # kWh
        self.max_charge_rate = 120.0  # kW
        self.max_discharge_rate = 120.0  # kW
        self.efficiency = 0.92
        
    def balance_grid(self, current_row: dict):
        hour = current_row["hour"]
        solar = current_row["solar_generation"]
        demand = current_row["total_demand"]
        battery = current_row["battery_level"]
        
        net_power = solar - demand
        battery_action = "IDLE"
        battery_rate = 0.0
        grid_import = 0.0
        grid_export = 0.0
        load_shedding = 0.0
        recommendations = []
        
        # Determine Time-of-Use Grid Tariff Zone
        if (6 <= hour <= 9) or (18 <= hour <= 22):
            tariff_zone = "PEAK"
            tariff_rate = 0.28  # $/kWh
        elif 10 <= hour <= 17:
            tariff_zone = "MID-PEAK"
            tariff_rate = 0.16  # $/kWh
        else:
            tariff_zone = "OFF-PEAK"
            tariff_rate = 0.08  # $/kWh
            
        # 1. Surplus Solar Case
        if net_power > 0:
            # We have excess local solar power
            space_in_battery = self.max_capacity - battery
            if space_in_battery > 1.0:
                # We can charge the battery
                # Charge rate is limited by max charge rate and remaining storage capacity
                charge_power = min(net_power, self.max_charge_rate, space_in_battery / self.efficiency)
                battery_action = "CHARGE"
                battery_rate = round(charge_power, 2)
                
                # Any leftover goes to grid
                excess_solar = net_power - charge_power
                if excess_solar > 0.1:
                    grid_export = round(excess_solar, 2)
                    recommendations.append("Battery is charging with solar surplus. Exporting excess solar to utility grid.")
                else:
                    recommendations.append("Battery is absorbing full solar surplus. Zero grid exchange.")
            else:
                # Battery full, export everything to grid
                grid_export = round(net_power, 2)
                recommendations.append("Battery is fully charged. Exporting 100% of solar surplus to grid.")
                
        # 2. Deficit Case (Demand > Solar)
        else:
            deficit = abs(net_power)
            
            # Off-Peak Grid Charging Opportunity (Arbitrage)
            # If battery is low (< 50%) and it is off-peak night hours, charge from grid
            if tariff_zone == "OFF-PEAK" and battery < 250.0:
                space_in_battery = self.max_capacity - battery
                charge_power = min(self.max_charge_rate, space_in_battery / self.efficiency)
                battery_action = "GRID_CHARGE"
                battery_rate = round(charge_power, 2)
                grid_import = round(deficit + charge_power, 2)
                recommendations.append("Grid charging active: Storing cheap off-peak power to prepare for morning peak demand.")
                
            # Otherwise, discharge battery to cover the deficit
            elif battery > 5.0:
                # Battery has charge, let's discharge
                available_power = min(battery * self.efficiency, self.max_discharge_rate)
                discharge_power = min(deficit, available_power)
                
                battery_action = "DISCHARGE"
                battery_rate = round(discharge_power, 2)
                
                remaining_deficit = deficit - discharge_power
                if remaining_deficit > 0.1:
                    grid_import = round(remaining_deficit, 2)
                    # If peak hour, warn about grid imports and trigger load shedding if high
                    if tariff_zone == "PEAK":
                        recommendations.append("Battery capacity insufficient for peak demand. Importing remainder from grid.")
                        # Hackathon feature: load shedding recommendations during high grid imports
                        if grid_import > 80.0:
                            load_shedding = round(0.15 * demand, 2)  # shed 15% of load
                            recommendations.append(f"Peak demand alert: Suggest shedding non-essential school/commercial load by {load_shedding} kW to reduce peak charges.")
                    else:
                        recommendations.append("Discharging battery to cover deficit. Supplementing from grid.")
                else:
                    recommendations.append("Local microgrid fully self-sustained. Deficit fully covered by battery storage.")
            
            # If battery is empty
            else:
                grid_import = round(deficit, 2)
                if tariff_zone == "PEAK":
                    recommendations.append("Battery depleted. High grid import during peak hours. High cost surcharge active.")
                    load_shedding = round(0.20 * demand, 2)  # shed 20% of load
                    recommendations.append(f"ACTION REQUIRED: Shed {load_shedding} kW of commercial/school load to save energy fees.")
                else:
                    recommendations.append("Battery depleted. Drawing power from grid to cover demand.")
                    
        return {
            "tariff_zone": tariff_zone,
            "tariff_rate": tariff_rate,
            "battery_action": battery_action,
            "battery_rate": battery_rate,
            "grid_import": grid_import,
            "grid_export": grid_export,
            "load_shedding": load_shedding,
            "recommendations": recommendations
        }
