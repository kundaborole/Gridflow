import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import AreaChartCard from '../components/AreaChartCard';
import InsightCard from '../components/InsightCard';
import BatteryProgress from '../components/BatteryProgress';
import GlassPanel from '../components/GlassPanel';
import Footer from '../components/Footer';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [toast, setToast] = useState(null);
  const [showEngineModal, setShowEngineModal] = useState(false);
  const [hour, setHour] = useState(10); // Simulated time index (Hour 10 is default)

  // Load status and weather data dynamically based on selected hour
  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const statusData = await apiService.getStatus(hour);
        const weatherData = await apiService.getLiveWeather(hour);
        setData({
          ...statusData,
          weather: weatherData
        });
      } catch (err) {
        console.error("Error loading data from API:", err);
        setError("Backend API is offline. Running with fallback data.");
        showToast("Error connecting to backend API. Using local fallback.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [hour]);

  // Simulating time advancement
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setHour(prev => (prev + 1) % 8760);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Show a toast message that auto-dismisses
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleApplyLogic = (insightType) => {
    showToast(`Successfully applied optimization rules for: "${insightType}"`);
  };

  const handlePlayPause = (play) => {
    setIsPlaying(play);
    showToast(play ? "Simulation started. Live telemetry sync active." : "Simulation paused. Telemetry feed frozen.");
  };

  const handleStep = () => {
    setHour(prev => (prev + 1) % 8760);
    showToast("Simulation stepped. Telemetry advanced by 1 hour.");
  };

  if (loading && !data) {
    return (
      <div className="flex-1 p-margin-desktop flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-body-sm text-on-surface-variant font-semibold">Synchronizing with Oakland Microgrid Telemetry...</p>
        </div>
      </div>
    );
  }

  // Deconstruct API payload
  const cur = data?.current_state || {};
  const bal = data?.balancing || {};
  const risks = data?.risks || [];
  const before = data?.before || { battery_level: 0.0 };
  const after = data?.after || { battery_level: 0.0 };
  const gridHealth = data?.gridHealth || "Nominal";
  const sustain = data?.sustainability || {};
  const history = data?.decision_history || [];
  const weather = data?.weather || {};

  // Standard metrics
  const solarGeneration = cur.solar_generation || 0;
  const demand = cur.total_demand || 0;
  const batteryLevel = cur.battery_level || 0;
  const batterySoC = batteryLevel ? Math.round((batteryLevel / 500.0) * 100.0) : 0;
  const gridReliance = bal.grid_import ? parseFloat(((bal.grid_import / (demand || 1)) * 100).toFixed(1)) : 0;

  // Weather variables
  const temp = weather.temperature || 0;
  const cloudCover = weather.cloud_cover || 0;
  const conditions = weather.conditions || "Sunny";
  const location = weather.location || "Oakland Microgrid Sector 4";

  // Business metrics
  const costSaved = data?.costSaved || 0;
  const co2Reduced = data?.co2Reduced || 0;
  const blackoutsPrevented = data?.blackoutsPrevented || 0;

  // Cost compare
  const baselineCost = data?.baselineCost || 0;
  const optimizedCost = data?.optimizedCost || 0;

  // Battery intelligence derived metrics
  const cycleCount = Math.round((hour / 8760) * 1200 + 312); // approx cycle progression
  const dischargeRate = Math.abs(bal.battery_rate || 0).toFixed(1);
  const batteryEfficiency = batterySoC > 80 ? 97.4 : batterySoC > 50 ? 95.2 : 91.8;

  // Geographic coordinates for Oakland Microgrid
  const lat = "37.8044";
  const lon = "-122.2712";

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-surface-container-high border border-primary-fixed-dim/30 px-4 py-3 rounded-lg shadow-[0_0_15px_rgba(0,218,243,0.25)] flex items-center gap-3 animate-fade-in font-body-sm text-[13px] text-on-surface">
          <span className="material-symbols-outlined text-primary-fixed-dim animate-pulse">info</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Insight Engine Modal */}
      {showEngineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="glass-panel p-8 rounded-xl max-w-md w-full border border-primary-fixed-dim/20 relative">
            <button 
              onClick={() => setShowEngineModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-md text-primary-fixed-dim mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">psychology</span>
              AI Insight Engine
            </h3>
            <p className="text-[14px] text-on-surface-variant mb-6 leading-relaxed">
              The Insight Engine is actively monitoring the smart microgrid. It cross-references current weather patterns, battery storage thresholds, and sector loads to recommend real-time grid adjustments.
            </p>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/5 mb-6">
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Active Model:</span>
                <span className="text-primary-fixed-dim font-bold">GridForce-v2.5</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Model Confidence:</span>
                <span className="text-secondary-fixed-dim font-bold">{data?.confidence || '98.4'}%</span>
              </div>
            </div>
            <button 
              onClick={() => setShowEngineModal(false)}
              className="w-full py-2 bg-primary-fixed-dim text-on-primary-fixed font-bold rounded-lg"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Header with simulation action items */}
      <Header title="GridFlow AI" subtext="Enterprise Intelligence">
        <div className="flex items-center gap-4 text-on-surface-variant">
          <button 
            onClick={() => handlePlayPause(true)}
            className={`hover:text-primary-container transition-transform active:scale-95 ${isPlaying ? 'text-primary-fixed-dim' : ''}`}
            title="Resume Live Simulation"
          >
            <span className="material-symbols-outlined">play_arrow</span>
          </button>
          <button 
            onClick={() => handlePlayPause(false)}
            className={`hover:text-primary-container transition-transform active:scale-95 ${!isPlaying ? 'text-primary-fixed-dim' : ''}`}
            title="Pause Simulation"
          >
            <span className="material-symbols-outlined">pause</span>
          </button>
          <button 
            onClick={handleStep}
            className="hover:text-primary-container transition-transform active:scale-95"
            title="Step Advance Simulation"
          >
            <span className="material-symbols-outlined">step_over</span>
          </button>
        </div>
      </Header>

      {/* Main dashboard content container */}
      <div className="p-margin-desktop pt-24 space-y-gutter max-w-[1600px] mx-auto w-full flex-1">
        
        {/* Page title row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
          <div>
            <p className="font-label-uppercase text-label-uppercase text-secondary-fixed-dim mb-1">REAL-TIME TELEMETRY</p>
            <h2 className="font-headline-md text-headline-md text-on-surface">Performance Overview</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {error && (
              <span className="text-[11px] bg-error-container/20 text-error px-2.5 py-1 rounded border border-error/25 font-bold uppercase tracking-wider animate-pulse">
                {error}
              </span>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
              <span className="text-[11px] text-outline uppercase font-bold">Simulated Hour:</span>
              <span className="font-data-mono text-[12px] text-primary-fixed-dim font-bold">Hour {hour}/8759</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
              <div className="w-2 h-2 rounded-full bg-secondary-fixed-dim pulse-dot"></div>
              <span className="font-data-mono text-[12px] text-on-surface">Live Grid Sync</span>
            </div>
          </div>
        </div>

        {/* 1. Grid Status Banner */}
        <div className="glass-panel p-4 rounded-xl border border-primary-fixed-dim/20 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-primary-container/10 to-transparent">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`w-3.5 h-3.5 rounded-full status-pulse shrink-0 ${gridHealth === 'Nominal' ? 'bg-secondary-fixed-dim shadow-[0_0_10px_#2ae500]' : gridHealth === 'Warning' ? 'bg-tertiary-fixed-dim shadow-[0_0_10px_#ffb778]' : 'bg-error shadow-[0_0_10px_#ffb4ab]'}`} />
            <div>
              <h3 className="font-label-uppercase text-label-uppercase text-on-surface-variant">Grid Security Health: <span className="text-white font-extrabold">{gridHealth}</span></h3>
              <p className="text-body-sm text-on-surface-variant font-medium">Dispatch Action: <span className="text-primary-fixed-dim font-bold">{bal.battery_action || 'IDLE'}</span> ({bal.battery_rate || 0} kW)</p>
            </div>
          </div>
          <div className="flex-1 max-w-2xl text-left md:text-right bg-white/5 md:bg-transparent p-3 md:p-0 rounded border border-white/5 md:border-none w-full">
            <p className="text-[13px] font-medium text-on-surface leading-snug">
              {risks.length > 0 ? risks[0].message : "All sub-systems operating within safe design tolerances. Active battery charge/discharge cycles synchronized with microgrid load."}
            </p>
          </div>
        </div>

        {/* KPI metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <KPICard
            title="Solar Generation"
            value={solarGeneration}
            unit="kW"
            icon="wb_sunny"
            trend={{ value: `${cloudCover}%`, text: `Cover (${conditions})`, type: "stable" }}
          />
          <KPICard
            title="Total Demand"
            value={demand}
            unit="kW"
            icon="bolt"
            trend={{ value: `${temp}°C`, text: `${location}`, type: "stable" }}
          />
          <KPICard
            title="Battery State"
            value={`${batterySoC}%`}
            unit="SoC"
            icon="battery_very_low"
            trend={{ value: `${batteryLevel.toFixed(1)}`, text: `Available kWh`, type: "up" }}
          />
          <KPICard
            title="Grid Exchange"
            value={bal.grid_import || -bal.grid_export || 0}
            unit="kW"
            icon="grid_view"
            trend={{ value: `${gridReliance}%`, text: "Demand share", type: "down" }}
          />
        </div>

        {/* Main Analytics Graph and Intelligence insights panel */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Reusable AreaChart component */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            <AreaChartCard
              title="Net Energy Performance"
              subtitle="Integrated Flow Analysis"
              type="dashboard"
              legend={[
                { name: "Generation", colorClass: "bg-primary-fixed-dim" },
                { name: "Efficiency", colorClass: "bg-secondary-fixed-dim" }
              ]}
            />
          </div>

          {/* 6. Cost Comparison Chart Card */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <GlassPanel className="h-full flex flex-col justify-between min-h-[352px]">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary-fixed-dim">payments</span>
                  <span className="font-label-uppercase text-label-uppercase text-on-surface">Cost Comparison Chart</span>
                </div>
                <p className="text-body-sm text-on-surface-variant mb-6">Real-time cost reduction comparing baseline grid fees vs optimized microgrid dispatch.</p>
              </div>
              
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                {/* Baseline Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant font-medium">Baseline Grid Cost:</span>
                    <span className="font-data-mono font-bold text-white">${baselineCost.toFixed(2)}</span>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-outline-variant rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                
                {/* Optimized Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant font-medium">Optimized Cost:</span>
                    <span className="font-data-mono font-bold text-secondary-fixed-dim">${optimizedCost.toFixed(2)}</span>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-secondary-fixed-dim rounded-full shadow-[0_0_8px_#2ae500] transition-all duration-500" 
                      style={{ width: `${baselineCost > 0 ? (optimizedCost / baselineCost) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <span className="text-[12px] text-secondary-fixed-dim font-bold uppercase tracking-wider">
                  {baselineCost > 0 ? `${((1 - optimizedCost / baselineCost) * 100).toFixed(1)}% savings achieved` : '100% self-sufficient'}
                </span>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Lower sections: Battery intelligence & Sustainability */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Battery Intelligence & 3. Battery Impact Card */}
          <div className="col-span-12 lg:col-span-5 flex flex-col">
            <GlassPanel className="h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="font-label-uppercase text-label-uppercase text-on-surface-variant">Battery Intelligence</span>
                  <button className="text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 mb-4">
                  <BatteryProgress percentage={batterySoC} label="Health" size={128} />
                  
                  <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                    <div>
                      <p className="font-label-uppercase text-[10px] text-on-surface-variant mb-1">Cycle Count</p>
                      <p className="font-data-mono text-on-surface">{cycleCount.toLocaleString()} / 5,000</p>
                    </div>
                    <div>
                      <p className="font-label-uppercase text-[10px] text-on-surface-variant mb-1">Avg. Temp</p>
                      <p className="font-data-mono text-on-surface">24.2 °C</p>
                    </div>
                    <div>
                      <p className="font-label-uppercase text-[10px] text-on-surface-variant mb-1">Discharge Rate</p>
                      <p className="font-data-mono text-secondary-fixed-dim">{dischargeRate} kW/h</p>
                    </div>
                    <div>
                      <p className="font-label-uppercase text-[10px] text-on-surface-variant mb-1">Efficiency</p>
                      <p className="font-data-mono text-on-surface">{batteryEfficiency}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Battery Impact Card */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/5 space-y-2 mt-4">
                <p className="text-[10px] font-label-uppercase text-primary-fixed-dim tracking-wider font-bold">Battery Impact Assessment</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="border-r border-white/5">
                    <p className="text-[9px] text-on-surface-variant">BEFORE ACTION</p>
                    <p className="font-data-mono text-body-lg font-bold text-white">{before.battery_level} kWh</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-on-surface-variant">AFTER ACTION</p>
                    <p className="font-data-mono text-body-lg font-bold text-secondary-fixed-dim">{after.battery_level} kWh</p>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Sustainability Impact summary & 4. Business Impact Metrics */}
          <div className="col-span-12 lg:col-span-7 flex flex-col">
            <GlassPanel className="relative overflow-hidden h-full flex flex-col justify-between">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">eco</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <span className="font-label-uppercase text-label-uppercase text-on-surface-variant">Sustainability Impact</span>
                  <span className="px-2 py-0.5 rounded bg-secondary-container/20 text-secondary-fixed-dim text-[10px] font-bold uppercase">
                    ESG Certified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
                  <div className="space-y-2">
                    <h4 className="font-body-sm text-on-surface-variant">CO2 Offset</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display-lg text-[32px] text-on-surface">1,402</span>
                      <span className="font-data-mono text-on-surface-variant">Tons</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-secondary-fixed-dim" style={{ width: '72%' }} />
                    </div>
                    <p className="text-[11px] text-on-surface-variant">72% of annual target reached</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-body-sm text-on-surface-variant">Green Share</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display-lg text-[32px] text-on-surface">84.2</span>
                      <span className="font-data-mono text-on-surface-variant">%</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      <div className="h-1.5 flex-1 bg-secondary-fixed-dim rounded-full" />
                      <div className="h-1.5 flex-1 bg-secondary-fixed-dim rounded-full" />
                      <div className="h-1.5 flex-1 bg-secondary-fixed-dim rounded-full" />
                      <div className="h-1.5 flex-1 bg-surface-variant rounded-full" />
                    </div>
                    <p className="text-[11px] text-on-surface-variant">Carbon-neutral trajectory</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-body-sm text-on-surface-variant">Trees Equivalent</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display-lg text-[32px] text-on-surface">42k</span>
                      <span className="font-data-mono text-on-surface-variant">Units</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border border-background bg-secondary-fixed-dim flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-on-secondary">forest</span>
                        </div>
                        <div className="w-6 h-6 rounded-full border border-background bg-secondary-fixed-dim flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-on-secondary">forest</span>
                        </div>
                        <div className="w-6 h-6 rounded-full border border-background bg-secondary-fixed-dim flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-on-secondary">forest</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-on-surface-variant">Restoration impact</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Business Impact Metrics */}
              <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 bg-white/5 p-4 rounded-lg border border-white/5 relative z-10">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Financial Saved</p>
                  <p className="font-data-mono text-[18px] text-secondary-fixed-dim font-bold">${costSaved.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">CO2 Reduced</p>
                  <p className="font-data-mono text-[18px] text-primary-fixed-dim font-bold">{co2Reduced.toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Blackouts Avoided</p>
                  <p className="font-data-mono text-[18px] text-white font-bold">{blackoutsPrevented}</p>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* 2. Gemini Advisor Card & Timeline Row */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Gemini Advisor Card Wrapper */}
          <div className="col-span-12 lg:col-span-5">
            <GlassPanel className="h-full flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary-fixed-dim">psychology</span>
                <span className="font-label-uppercase text-label-uppercase text-on-surface">Gemini Advisor</span>
              </div>
              
              <div className="bg-primary/5 p-5 rounded-lg border border-primary-fixed-dim/30 relative overflow-hidden flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-primary-fixed-dim uppercase tracking-wider font-bold">Optimization Advice</span>
                    <span className="text-[10px] bg-secondary-fixed-dim/20 text-secondary-fixed-dim px-2.5 py-0.5 rounded font-data-mono font-bold">{data?.confidence || '98.4'}% CONF.</span>
                  </div>
                  <h4 className="font-headline-sm text-body-lg text-primary font-bold mb-2">{data?.recommendation}</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed mb-4">{data?.reason}</p>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-white/5 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Expected Benefit:</span>
                    <span className="text-secondary-fixed-dim font-bold">{data?.expectedBenefit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Advisory Model:</span>
                    <span className="text-primary-fixed-dim font-bold">{data?.source}</span>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* 5. Decision Timeline Component */}
          <div className="col-span-12 lg:col-span-7">
            <GlassPanel className="h-full">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary-fixed-dim">timeline</span>
                <span className="font-label-uppercase text-label-uppercase text-on-surface">Decision Timeline</span>
              </div>
              <div className="space-y-4">
                {history.map((item, idx) => (
                  <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center justify-between hover:border-primary-fixed-dim/25 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        <span className="font-data-mono text-body-sm text-primary-fixed-dim font-bold">{idx + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-body-sm font-bold text-white">{item.action}</span>
                          <span className="text-[10px] text-outline-variant font-data-mono">({item.timestamp})</span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">Dispatched rate of {item.rate} kW</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${item.status === 'Nominal' ? 'bg-secondary-container/20 text-secondary-fixed-dim' : 'bg-error-container/20 text-error'}`}>
                        {item.status}
                      </span>
                      <p className="text-[11px] text-outline-variant mt-1">{item.tariff_zone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Unified footer metadata */}
        <Footer gridHealth={gridHealth} lat={lat} lon={lon} />
      </div>
    </>
  );
}
