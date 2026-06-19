import os
import requests
import time

class WeatherService:
    def __init__(self):
        self.api_key = os.environ.get("OPENWEATHER_API_KEY", "")
        # Default to a generic location for the demo if not specified
        self.city = "San Francisco"
        self.cache = {}
        self.cache_ttl = 1800  # 30 minutes in seconds

    def get_live_weather(self):
        current_time = time.time()
        
        # Check cache
        if "weather" in self.cache:
            cached_data, timestamp = self.cache["weather"]
            if current_time - timestamp < self.cache_ttl:
                return cached_data

        # Fallback if no API key
        if not self.api_key:
            return self._get_fallback_weather()

        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?q={self.city}&units=metric&appid={self.api_key}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            weather_data = {
                "temperature": data["main"]["temp"],
                "cloud_cover": data["clouds"]["all"],  # percentage
                "conditions": data["weather"][0]["description"].title(),
                "location": f"{data['name']}, {data['sys']['country']}"
            }
            
            # Update cache
            self.cache["weather"] = (weather_data, current_time)
            return weather_data
            
        except Exception as e:
            print(f"Weather API Error: {e}")
            return self._get_fallback_weather()

    def _get_fallback_weather(self):
        # Graceful fallback so demo never crashes
        return {
            "temperature": 18.5,
            "cloud_cover": 45,
            "conditions": "Scattered Clouds (Fallback)",
            "location": "San Francisco, US"
        }
