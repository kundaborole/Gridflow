from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data_manager import DataManager
from engines.prediction_engine import PredictionEngine
from engines.risk_engine import RiskEngine
from engines.balancing_engine import BalancingEngine
from engines.sustainability import SustainabilityCalculator
from engines.simulation_engine import SimulationEngine
from engines.weather_service import WeatherService

app = FastAPI(title="GridFlow AI Backend API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize systems
try:
    data_manager = DataManager()
except FileNotFoundError as e:
    # Fail gracefully if dataset hasn't been generated
    print(f"Error initializing data manager: {e}")
    data_manager = None

prediction_engine = PredictionEngine(data_manager) if data_manager else None
risk_engine = RiskEngine()
balancing_engine = BalancingEngine()
sustainability_calculator = SustainabilityCalculator()
weather_service = WeatherService()

simulation_engine = SimulationEngine(
    data_manager=data_manager,
    balancing_engine=balancing_engine,
    risk_engine=risk_engine,
    prediction_engine=prediction_engine,
    sustainability_calculator=sustainability_calculator
) if data_manager else None

@app.get("/api/config")
def get_config():
    if not data_manager:
        raise HTTPException(status_code=500, detail="Data manager not initialized. Please run dataset generator.")
    return {
        "total_records": data_manager.get_length(),
        "battery_capacity_kwh": 500.0,
        "solar_capacity_kw": 350.0
    }

@app.get("/api/live-weather")
def get_live_weather(hour: int = 0):
    if not data_manager:
        return {
            "temperature": 24.0,
            "cloud_cover": 12.0,
            "conditions": "Clear Skies",
            "location": "Oakland Microgrid Sector 4"
        }
    total_len = data_manager.get_length()
    safe_index = hour % total_len
    row = data_manager.get_row(safe_index)
    
    cloud_cover_pct = round(row.get("cloud_cover", 0.12) * 100.0, 1)
    if cloud_cover_pct < 20:
        cond = "Sunny"
    elif cloud_cover_pct < 60:
        cond = "Partly Cloudy"
    else:
        cond = "Overcast"

    return {
        "temperature": round(row.get("temperature", 24.0), 1),
        "cloud_cover": cloud_cover_pct,
        "conditions": cond,
        "location": "Oakland Microgrid Sector 4"
    }

@app.get("/api/status")
def get_status(hour: int = 0):
    try:
        print("Requested Hour:", hour)
        if not simulation_engine:
            raise HTTPException(status_code=500, detail="Data manager not initialized. Please run dataset generator.")
            
        # Wrap index around dataset length
        total_len = data_manager.get_length()
        safe_index = hour % total_len
        
        state = simulation_engine.get_state(safe_index)
        if not state:
            raise HTTPException(status_code=404, detail="Data record not found")
            
        current_row = state["current_state"]
        balancing = state["balancing"]
        risks = state["risks"]
        sustainability = state["sustainability"]
        forecast = state["forecast"]
        
        before_level = state["before"]["battery_level"]
        after_level = state["after"]["battery_level"]
        
        # Grid Health string
        criticals = [r for r in risks if r.get("level") == "critical"]
        warnings = [r for r in risks if r.get("level") == "warning"]
        if criticals:
            gridHealth = "Critical"
        elif warnings:
            gridHealth = "Warning"
        else:
            gridHealth = "Nominal"

        # Generate dynamic decision history from state
        decision_history = []
        for hist in state.get("decision_history", []):
            decision_history.append({
                "timestamp": f"Hour {hist['hour']}",
                "action": hist["action"],
                "rate": 0.0,
                "tariff_zone": "OFF-PEAK",
                "status": "Nominal" if hist["action"] != "LOAD_SHED" else "Load Shedding"
            })

        # Gemini Advisor Fields
        recs = balancing.get("recommendations", [])
        if recs and len(recs) > 0:
            primary_rec = recs[0]
            if isinstance(primary_rec, dict):
                rec = primary_rec.get("recommendation", "MONITOR")
                reason = primary_rec.get("reason", "")
                benefit = primary_rec.get("expectedBenefit", "")
                conf = primary_rec.get("confidence", "High")
                source = primary_rec.get("source", "Gemini")
            else:
                rec = "MONITOR"
                reason = str(primary_rec)
                benefit = "N/A"
                conf = "High"
                source = "Heuristic"
        else:
            rec = "MONITOR"
            reason = "No active recommendation."
            benefit = "N/A"
            conf = "High"
            source = "Heuristic"

        # Cost Comparison Chart fields
        baseline_cost = current_row.get("total_demand", 0.0) * balancing.get("tariff_rate", 0.16)
        if balancing.get("battery_action") == "DISCHARGE":
            optimized_cost = max(0.0, current_row.get("total_demand", 0.0) - balancing.get("battery_rate", 0.0)) * balancing.get("tariff_rate", 0.16)
        else:
            optimized_cost = baseline_cost

        return {
            "current_state": current_row,
            "balancing": balancing,
            "risks": risks,
            "before": {"battery_level": round(before_level, 2)},
            "after": {"battery_level": round(after_level, 2)},
            "gridHealth": gridHealth,
            "sustainability": sustainability,
            "decision_history": decision_history,
            "recommendation": rec,
            "reason": reason,
            "expectedBenefit": benefit,
            "confidence": conf,
            "source": source,
            "baselineCost": round(baseline_cost, 2),
            "optimizedCost": round(optimized_cost, 2),
            "costSaved": round(sustainability.get("cost_savings_usd", 0.0), 2),
            "co2Reduced": round(sustainability.get("co2_offset_kg", 0.0), 1),
            "blackoutsPrevented": sustainability.get("blackouts_prevented", 0),
            "forecast": forecast
        }
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.get("/api/live-weather")
def get_live_weather():
    return weather_service.get_live_weather()
