import os
import json
import logging
try:
    import google.generativeai as genai
except ImportError:
    genai = None

# Set up basic logging for developer transparency
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMAdvisor:
    """
    Gemini AI Integration Module for GridFlow
    
    This module fetches dynamic, natural language reasoning from the Google Gemini LLM.
    It is designed for hackathon credibility: it proves the platform is AI-native.
    
    Features:
    1. Prompt Engineering: Passes state variables to the LLM to generate recommendations.
    2. In-Memory Caching: Never calls the API repeatedly for the same state/hour, ensuring demo speed.
    3. Graceful Fallback: If the API key is missing or rate limits hit, it falls back to heuristics.
    """
    
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.model = None
        self.cache = {}
        
        if self.api_key and genai:
            genai.configure(api_key=self.api_key)
            # Use gemini-pro for text generation
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("Gemini LLM successfully initialized.")
        else:
            logger.warning("No GEMINI_API_KEY found or google-generativeai not installed. LLM Advisor will run in Fallback Mode.")

    def get_recommendation(self, grid_state: dict) -> dict:
        """
        Analyzes the grid state using Gemini and returns a JSON recommendation.
        """
        # 1. Cache Strategy
        # We cache based on the hour to guarantee O(1) response time during rapid demo slider movement.
        hour = grid_state.get('hour', 0)
        if hour in self.cache:
            logger.info(f"LLM Cache hit for hour {hour}")
            return self.cache[hour]

        # 2. API / Fallback Execution
        if not self.model:
            response = self._get_fallback_recommendation(grid_state)
        else:
            response = self._call_gemini_api(grid_state)
            
        # Store in cache
        self.cache[hour] = response
        return response

    def _call_gemini_api(self, state: dict) -> dict:
        prompt = self._build_prompt(state)
        try:
            # We enforce JSON output conceptually in the prompt. 
            response = self.model.generate_content(prompt)
            # Clean up the markdown JSON fences if present
            response_text = response.text.replace("```json", "").replace("```", "").strip()
            
            ai_data = json.loads(response_text)
            ai_data["source"] = "Gemini"
            return ai_data
            
        except Exception as e:
            logger.error(f"Gemini API Error: {str(e)}. Triggering fallback.")
            return self._get_fallback_recommendation(state)

    def _build_prompt(self, state: dict) -> str:
        return f"""
        You are an expert micro-grid energy operator AI.
        
        Analyze the following grid state:
        - Battery Level: {state.get('battery_level', 0)} kWh
        - Demand: {state.get('total_demand', 0)} kW
        - Solar Generation: {state.get('solar_generation', 0)} kW
        - Tariff Zone: {state.get('tariff_zone', 'OFF-PEAK')}
        - Grid Health: {state.get('grid_health', 100)}/100
        - Risks: {state.get('risks', 'None')}

        Provide the optimal grid balancing action.
        
        Return ONLY valid JSON with no markdown formatting. The JSON must have exactly these keys:
        "recommendation": (e.g. "CHARGE", "DISCHARGE", "GRID_CHARGE", "LOAD_SHED", "MONITOR"),
        "reason": (A 1-sentence analytical reason),
        "expectedBenefit": (A 1-sentence expected business or grid outcome),
        "confidence": (e.g. "High", "Medium", "Low")
        """

    def _get_fallback_recommendation(self, state: dict) -> dict:
        """
        Fallback strategy guarantees the demo never crashes.
        It uses simple heuristics if the LLM is offline.
        """
        battery = state.get('battery_level', 0)
        solar = state.get('solar_generation', 0)
        demand = state.get('total_demand', 0)
        
        if battery < 20 and demand > solar:
            rec = "LOAD_SHED"
            reason = "Battery depleted during peak demand deficit."
            benefit = "Prevent cascading grid instability and blackouts."
            conf = "High"
        elif solar > demand:
            rec = "CHARGE"
            reason = "Solar surplus exceeds current microgrid demand."
            benefit = "Capture free renewable energy for peak hours."
            conf = "High"
        else:
            rec = "DISCHARGE"
            reason = "Utilizing stored energy to offset grid import."
            benefit = "Minimize peak tariff expenditures."
            conf = "Medium"
            
        return {
            "recommendation": rec,
            "reason": reason,
            "expectedBenefit": benefit,
            "confidence": conf,
            "source": "fallback"
        }
