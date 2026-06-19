import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import AreaChartCard from '../components/AreaChartCard';
import InsightCard from '../components/InsightCard';
import GlassPanel from '../components/GlassPanel';
import Footer from '../components/Footer';

export default function Forecast() {
  const [data, setData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('24H');
  const [toast, setToast] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [forecastRes, riskRes] = await Promise.all([
          apiService.getPredict(),
          apiService.getAnalyzeRisks()
        ]);
        setData(forecastRes);
        setRiskData(riskRes);
      } catch (err) {
        console.error("Error loading forecast data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    showToast("Re-running neural network forecasting model...");
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Randomize forecast values slightly to simulate actual regeneration
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        predictedPeakDemand: parseFloat((prev.predictedPeakDemand + (Math.random() - 0.5) * 40).toFixed(1)),
        forecastSolarOutput: parseFloat((prev.forecastSolarOutput + (Math.random() - 0.5) * 20).toFixed(1)),
        forecastAccuracyScore: parseFloat((Math.min(99.8, prev.forecastAccuracyScore + (Math.random() - 0.5) * 2)).toFixed(1))
      };
    });
    
    setIsRegenerating(false);
    showToast("Forecast regenerated successfully. High-accuracy curve updated.");
  };

  const handleInsightAction = (title) => {
    showToast(`Executed mitigation workflow: "${title}"`);
  };

  const handleInsightDismiss = (title) => {
    showToast(`Dismissed insight: "${title}"`);
  };

  if (loading) {
    return (
      <div className="flex-1 p-margin-desktop flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const {
    forecastConfidence = 98.4,
    predictedPeakDemand = 842.5,
    peakDemandChange = 12.4,
    peakDemandConf = 94,
    forecastSolarOutput = 512.0,
    solarOutputChange = -4.2,
    solarOutputConf = 97,
    expectedBatteryUtil = 68.5,
    batteryUtilState = "STABLE",
    batteryUtilConf = 91,
    forecastAccuracyScore = 96.2,
    weather = {},
    insights = []
  } = data || {};

  const {
    peakTime = "19:24 PM",
    riskLevel = "HIGH RISK",
    drivers = [],
    mitigations = [],
    monitor = {}
  } = riskData || {};

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-surface-container-high border border-primary-fixed-dim/30 px-4 py-3 rounded-lg shadow-[0_0_15px_rgba(0,218,243,0.25)] flex items-center gap-3 animate-fade-in font-body-sm text-[13px] text-on-surface">
          <span className="material-symbols-outlined text-primary-fixed-dim animate-pulse">info</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header with forecast confidence meter */}
      <Header title="GridFlow AI" subtext="Energy Forecast & Predictive Intelligence">
        <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10 gap-4">
          <span className="font-label-uppercase text-label-uppercase text-outline text-[10px]">Forecast Confidence</span>
          <span className="font-data-mono text-primary-fixed-dim flex items-center gap-2 text-[13px]">
            {forecastConfidence}%
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim status-pulse shadow-[0_0_8px_#2ae500]" />
          </span>
        </div>
      </Header>

      {/* Main page content area */}
      <main className="pt-24 px-margin-desktop pb-12 max-w-[1600px] mx-auto w-full flex-1">
        
        {/* Date Filter & Action Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex gap-2 bg-surface-container-low/50 p-1 rounded-lg border border-white/5">
            {['24H', '7D', '30D'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  showToast(`Switched forecast view window to: ${tab}`);
                }}
                className={`px-4 py-1.5 font-label-uppercase text-label-uppercase text-[11px] rounded transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-primary-fixed-dim text-on-primary-fixed font-bold shadow-lg shadow-primary-fixed-dim/20' 
                    : 'text-outline hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 glass-panel rounded-lg text-body-sm font-medium border border-white/10 hover:bg-white/5 transition-all text-[13px]">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              Oct 24 - Oct 25, 2024
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
            
            <button 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-6 py-2 bg-primary-fixed-dim text-on-primary-fixed font-bold rounded-lg neon-glow-primary hover:scale-105 active:scale-95 transition-all text-[13px] disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[20px] ${isRegenerating ? 'animate-spin' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {isRegenerating ? 'autorenew' : 'auto_awesome'}
              </span>
              {isRegenerating ? 'REGENERATING...' : 'REGENERATE FORECAST'}
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
          <KPICard
            title="Predicted Peak Demand"
            value={predictedPeakDemand}
            unit="kW"
            stripColor="bg-primary-fixed-dim"
            trend={{ value: `+${peakDemandChange}%`, text: "", type: "up" }}
            confidence={`Conf: ${peakDemandConf}%`}
          />
          <KPICard
            title="Forecast Solar Output"
            value={forecastSolarOutput}
            unit="kW"
            stripColor="bg-secondary-fixed-dim"
            trend={{ value: `${solarOutputChange}%`, text: "", type: "down" }}
            confidence={`Conf: ${solarOutputConf}%`}
          />
          <KPICard
            title="Expected Battery Util."
            value={`${expectedBatteryUtil}%`}
            unit=""
            stripColor="bg-tertiary-fixed-dim"
            trend={{ value: batteryUtilState, text: "", type: "stable" }}
            confidence={`Conf: ${batteryUtilConf}%`}
          />
          <KPICard
            title="Forecast Accuracy Score"
            value={`${forecastAccuracyScore}%`}
            unit=""
            stripColor="bg-white/30"
            confidence="Accuracy Indicator"
          />
        </div>

        {/* Forecast chart & details section */}
        <div className="grid grid-cols-12 gap-gutter mb-8">
          <div className="col-span-12 lg:col-span-8">
            <AreaChartCard
              title="Demand vs. Generation Prediction"
              subtitle="Current vs Projected Energy Path"
              type="forecast"
              heightClass="h-[480px]"
              legend={[
                { name: "Demand Forecast", colorClass: "bg-primary-fixed-dim" },
                { name: "Solar Output", colorClass: "bg-secondary-fixed-dim" }
              ]}
            />
          </div>

          {/* Peak Demand Insights card */}
          <div className="col-span-12 lg:col-span-4">
            <GlassPanel className="h-full flex flex-col min-h-[480px]">
              <h3 className="font-label-uppercase text-label-uppercase text-on-surface mb-6">Peak Demand Insights</h3>
              
              <div className="space-y-6 flex-1">
                {/* Time & risk indicators */}
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                  <div>
                    <p className="text-[10px] font-label-uppercase text-outline mb-1">Peak Time</p>
                    <p className="font-headline-sm text-primary-fixed-dim">{peakTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-label-uppercase text-outline mb-1">Risk Level</p>
                    <span className="px-2 py-1 bg-error-container text-error text-[10px] font-bold rounded-full">
                      {riskLevel}
                    </span>
                  </div>
                </div>

                {/* Impact Drivers */}
                <div>
                  <p className="font-label-uppercase text-[10px] text-outline mb-3">Impact Drivers</p>
                  <div className="space-y-3">
                    {drivers.map((driver, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-body-sm">
                          <span className="text-on-surface-variant">{driver.label}</span>
                          <span className="font-data-mono text-primary-fixed">+{driver.value}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full">
                          <div 
                            className={`h-full rounded-full ${idx === 0 ? 'bg-primary-fixed-dim' : 'bg-secondary-fixed-dim'}`}
                            style={{ width: `${driver.value}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mitigations */}
                <div className="pt-4 border-t border-white/5">
                  <p className="font-label-uppercase text-[10px] text-outline mb-3">Recommended Mitigation</p>
                  <ul className="space-y-3">
                    {mitigations.map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-[13px] text-on-surface-variant items-start">
                        <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px]">verified</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button className="w-full mt-6 py-3 border border-primary-fixed-dim/30 text-primary-fixed-dim font-bold font-label-uppercase text-[11px] rounded-lg hover:bg-primary-fixed-dim/10 transition-all duration-200">
                VIEW FULL RISK ASSESSMENT
              </button>
            </GlassPanel>
          </div>
        </div>

        {/* AI Priorities section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-8">
          {insights.map(item => (
            <InsightCard
              key={item.id}
              title={item.title}
              priority={item.priority}
              conf={item.conf}
              message={item.message}
              actionLabel={item.actionLabel}
              variant="priority"
            />
          ))}
        </div>

        {/* Weather & Grid Risk details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Weather Analysis Panel */}
          <div className="lg:col-span-7">
            <GlassPanel className="h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-label-uppercase text-label-uppercase text-on-surface">Weather Impact Analysis</h3>
                <span className="text-[10px] font-data-mono text-outline">Last Updated: 14:32</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-lg text-center border border-white/5">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim mb-2">thermostat</span>
                  <p className="text-[10px] font-label-uppercase text-outline mb-1">Temp</p>
                  <p className="font-data-mono text-lg">{weather.temp}°C</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg text-center border border-white/5">
                  <span className="material-symbols-outlined text-primary-fixed-dim mb-2">cloud</span>
                  <p className="text-[10px] font-label-uppercase text-outline mb-1">Cloud Cover</p>
                  <p className="font-data-mono text-lg">{weather.cloudCover}%</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg text-center border border-white/5">
                  <span className="material-symbols-outlined text-secondary-fixed-dim mb-2">light_mode</span>
                  <p className="text-[10px] font-label-uppercase text-outline mb-1">Irradiance</p>
                  <p className="font-data-mono text-lg">{weather.irradiance} W/m²</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg text-center border border-white/5">
                  <span className="material-symbols-outlined text-outline mb-2">air</span>
                  <p className="text-[10px] font-label-uppercase text-outline mb-1">Wind</p>
                  <p className="font-data-mono text-lg">{weather.wind} km/h</p>
                </div>
              </div>
              <div className="bg-primary-fixed-dim/5 p-4 rounded-lg border border-primary-fixed-dim/20">
                <p className="text-body-sm text-on-surface-variant leading-relaxed text-[13px]">
                  <strong className="text-primary-fixed-dim">Analysis:</strong> {weather.analysis}
                </p>
              </div>
            </GlassPanel>
          </div>

          {/* Grid Risk Monitor */}
          <div className="lg:col-span-5">
            <GlassPanel className="h-full flex flex-col justify-between">
              <div>
                <h3 className="font-label-uppercase text-label-uppercase text-on-surface mb-6">Grid Risk Monitor</h3>
                <div className="space-y-5">
                  {[
                    { label: "Demand Spike Probability", val: monitor.demandSpikeProb, color: "bg-error", glow: "shadow-[0_0_8px_rgba(255,180,171,0.5)]" },
                    { label: "Battery Thermal Stress", val: monitor.batteryThermalStress, color: "bg-secondary-fixed-dim", glow: "shadow-[0_0_8px_rgba(42,229,0,0.5)]" },
                    { label: "Supply Shortage Risk", val: monitor.supplyShortageRisk, color: "bg-primary-fixed-dim", glow: "shadow-[0_0_8px_rgba(0,218,243,0.5)]" },
                    { label: "Grid Stability Forecast", val: monitor.gridStabilityForecast, color: "bg-secondary-fixed-dim", glow: "shadow-[0_0_8px_rgba(42,229,0,0.5)]" }
                  ].map((monitorItem, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-body-sm text-on-surface-variant text-[13px]">{monitorItem.label}</span>
                        <span className={`font-data-mono ${monitorItem.color === 'bg-error' ? 'text-error' : monitorItem.color === 'bg-primary-fixed-dim' ? 'text-primary-fixed-dim' : 'text-secondary-fixed-dim'}`}>
                          {monitorItem.val}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${monitorItem.color} ${monitorItem.glow}`} 
                          style={{ width: `${monitorItem.val}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-secondary-fixed-dim status-pulse">verified_user</span>
                <span className="font-label-uppercase text-label-uppercase text-on-surface text-[10px]">
                  ALL SYSTEMS OPERATING WITHIN MARGINS
                </span>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Global Footer */}
        <Footer gridHealth="Nominal" lat="37.7749" lon="-122.4194" />
      </main>
    </>
  );
}
