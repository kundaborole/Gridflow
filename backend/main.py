from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data_manager import DataManager
from engines.prediction_engine import PredictionEngine
from engines.risk_engine import RiskEngine
from engines.balancing_engine import BalancingEngine
from engines.sustainability import SustainabilityCalculator

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

@app.get("/api/config")
def get_config():
    if not data_manager:
        raise HTTPException(status_code=500, detail="Data manager not initialized. Please run dataset generator.")
    return {
        "total_records": data_manager.get_length(),
        "battery_capacity_kwh": 500.0,
        "solar_capacity_kw": 350.0
    }

@app.get("/api/status")
def get_status(hour: int = 0):
    print("Requested Hour:", hour)
    if not data_manager:
        raise HTTPException(status_code=500, detail="Data manager not initialized. Please run dataset generator.")
        
    # Wrap index around dataset length
    total_len = data_manager.get_length()
    safe_index = hour % total_len
    
    current_row = data_manager.get_row(safe_index)
    if not current_row:
        raise HTTPException(status_code=404, detail="Data record not found")
        
    # 1. Run forecast heuristic for next 24 hours
    forecast = prediction_engine.forecast_24h(safe_index)
    
    # 2. Run risk analyzer
    risks = risk_engine.analyze_risks(current_row, forecast)
    
    # 3. Run balancing engine to determine optimal storage/grid actions
    balancing = balancing_engine.balance_grid(current_row)
    
    # 4. Calculate sustainability outcomes
    sustainability = sustainability_calculator.calculate_metrics(current_row, balancing)
    
    return {
        "index": safe_index,
        "current_state": current_row,
        "forecast": forecast,
        "risks": risks,
        "balancing": balancing,
        "sustainability": sustainability
    }
