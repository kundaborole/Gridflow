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
                    recommendations.append({
                        "action": "CHARGE & EXPORT",
                        "reason": "High solar surplus detected.",
                        "expectedBenefit": "Battery is charging. Exporting excess to grid."
                    })
                else:
                    recommendations.append({
                        "action": "CHARGE",
                        "reason": "Solar surplus perfectly matches battery capacity.",
                        "expectedBenefit": "Battery is absorbing full surplus. Zero grid exchange."
                    })
            else:
                # Battery full, export everything to grid
                grid_export = round(net_power, 2)
                recommendations.append({
                    "action": "EXPORT",
                    "reason": "Solar surplus but battery is fully charged.",
                    "expectedBenefit": "Exporting 100% of surplus to grid."
                })
                
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
                recommendations.append({
                    "action": "GRID_CHARGE",
                    "reason": "Off-peak night hours detected and battery is low.",
                    "expectedBenefit": "Storing cheap power to prepare for morning peak demand."
                })
                
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
                        recommendations.append({
                            "action": "GRID_IMPORT",
                            "reason": "Battery capacity insufficient for peak demand.",
                            "expectedBenefit": "Importing remainder from grid to prevent blackout."
                        })
                        # Hackathon feature: load shedding recommendations during high grid imports
                        if grid_import > 80.0:
                            load_shedding = round(0.15 * demand, 2)  # shed 15% of load
                            recommendations.append({
                                "action": "LOAD_SHED",
                                "reason": "High grid import during peak tariff.",
                                "expectedBenefit": f"Shed {load_shedding} kW of non-essential load to reduce peak charges."
                            })
                    else:
                        recommendations.append({
                            "action": "DISCHARGE & IMPORT",
                            "reason": "Deficit exceeds battery capability.",
                            "expectedBenefit": "Discharging battery and supplementing from grid."
                        })
                else:
                    recommendations.append({
                        "action": "DISCHARGE",
                        "reason": "Microgrid deficit.",
                        "expectedBenefit": "Local microgrid fully self-sustained by battery."
                    })
            
            # If battery is empty
            else:
                grid_import = round(deficit, 2)
                if tariff_zone == "PEAK":
                    recommendations.append({
                        "action": "CRITICAL_IMPORT",
                        "reason": "Battery depleted during peak hours.",
                        "expectedBenefit": "High cost surcharge active."
                    })
                    load_shedding = round(0.20 * demand, 2)  # shed 20% of load
                    recommendations.append({
                        "action": "LOAD_SHED",
                        "reason": "Battery depleted and peak tariff active.",
                        "expectedBenefit": f"Shed {load_shedding} kW of commercial/school load to save fees."
                    })
                else:
                    recommendations.append({
                        "action": "GRID_IMPORT",
                        "reason": "Battery depleted.",
                        "expectedBenefit": "Drawing power from grid to cover demand."
                    })
                    
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
