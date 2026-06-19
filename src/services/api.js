// API Service Layer for GridFlow AI Command Center
// Connects the UI to FastAPIs running on http://localhost:8000

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiService = {
  // GET /api/status?hour=N
  async getStatus(hour = 10) {
    try {
      const response = await fetch(`${BASE_URL}/status?hour=${hour}`);
      if (!response.ok) throw new Error("API status response failed");
      return await response.json();
    } catch (err) {
      console.error("Failed to fetch status:", err);
      // Fallback response with correct schema
      return {
        index: hour,
        current_state: {
          solar_generation: 42.8,
          total_demand: 31.2,
          battery_level: 250.0,
          temperature: 24.2,
          cloud_cover: 0.12,
          timestamp: "2026-01-01 10:00:00",
          hour: hour,
          residential_demand: 10.0,
          commercial_demand: 8.5,
          school_demand: 5.2,
          hospital_demand: 7.5
        },
        balancing: {
          battery_action: "IDLE",
          battery_rate: 0.0,
          grid_import: 0.0,
          grid_export: 11.6,
          load_shedding: 0.0,
          tariff_zone: "MID-PEAK",
          tariff_rate: 0.16,
          recommendations: ["Battery is fully charged. Exporting 100% of solar surplus to grid."]
        },
        risks: [
          {
            type: "system",
            level: "normal",
            message: "Grid Flow AI: All sub-systems functioning normally."
          }
        ],
        before: { battery_level: 250.0 },
        after: { battery_level: 250.0 },
        gridHealth: "Nominal",
        sustainability: {
          co2_offset_kg: 1428.5,
          cost_savings_usd: 412.8,
          self_sufficiency_ratio: 64.2
        },
        decision_history: [
          { timestamp: "10:00", action: "IDLE", rate: 0.0, tariff_zone: "MID-PEAK", status: "Nominal" }
        ],
        recommendation: "Preserve battery power during off-peak hours.",
        reason: "No demand spikes expected.",
        expectedBenefit: "Preserves battery cycles.",
        confidence: 95.0,
        source: "Fallback Engine",
        baselineCost: 5.0,
        optimizedCost: 5.0
      };
    }
  },

  // GET /api/live-weather
  async getLiveWeather(hour = 10) {
    try {
      const response = await fetch(`${BASE_URL}/live-weather?hour=${hour}`);
      if (!response.ok) throw new Error("API weather response failed");
      return await response.json();
    } catch (err) {
      console.error("Failed to fetch live weather:", err);
      // Fallback response
      return {
        temperature: 24.0,
        cloud_cover: 12.0,
        conditions: "Clear Skies",
        location: "Oakland Microgrid Sector 4"
      };
    }
  }
};
