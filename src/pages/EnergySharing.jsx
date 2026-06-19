import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import BatteryProgress from '../components/BatteryProgress';
import GlassPanel from '../components/GlassPanel';
import InsightCard from '../components/InsightCard';
import Footer from '../components/Footer';

export default function EnergySharing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([
    { time: "14:22:01", msg: "[OK] Battery-02 Balance event complete", type: "text-secondary-fixed-dim" },
    { time: "14:21:45", msg: "[FLOW] 12kW Routing: Alpha -> Comm_B", type: "text-primary-fixed-dim" },
    { time: "14:21:12", msg: "[INIT] Optimization cycle #4028 triggered", type: "text-on-surface-variant" },
    { time: "14:20:55", msg: "[OK] Node Comm_C handshake verified", type: "text-secondary-fixed-dim" },
    { time: "14:20:30", msg: "[INFO] Cloud cover detected - Solar -5%", type: "text-on-surface-variant" },
    { time: "14:19:58", msg: "[OK] Transfer Hub-01 to Comm_A completed", type: "text-secondary-fixed-dim" }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const balanceData = await apiService.getBalance();
        setData(balanceData);
      } catch (err) {
        console.error("Error loading balance data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Simulate logging background updates as in the original Stitch javascript
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      const msgs = [
        { msg: "[FLOW] Balancing Phase-3 distribution", type: "text-primary-fixed-dim" },
        { msg: "[OK] Efficiency target met: 94.2%", type: "text-secondary-fixed-dim" },
        { msg: "[SCAN] Routine node health check: All clear", type: "text-on-surface-variant" }
      ];
      const selected = msgs[Math.floor(Math.random() * msgs.length)];
      const now = new Date().toLocaleTimeString();
      setActivityLogs(prev => [
        { time: now, msg: selected.msg, type: selected.type },
        ...prev.slice(0, 8)
      ]);
    }, 8000);

    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex-1 p-margin-desktop flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const {
    activeTransfers = 42,
    transfersChange = 5.2,
    energySharedToday = 1248,
    energySharedChange = 12.4,
    communityEfficiency = 94.2,
    communityEfficiencyChange = -0.8,
    successRate = 99.98,
    stability = 99.4,
    loadBalance = 88,
    renewableRate = 72.4,
    sources = [],
    demands = [],
    recommendations = []
  } = data || {};

  return (
    <>
      {/* Top sticky app bar with search element */}
      <Header title="GridForce OS" subtext="Energy Sharing">
        <div className="hidden lg:flex items-center bg-surface-container-highest/40 rounded-full px-4 py-1.5 border border-white/5">
          <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-body-sm w-48 text-on-surface placeholder:text-outline outline-none text-[13px]" 
            placeholder="Search grid assets..." 
            type="text"
          />
        </div>
      </Header>

      {/* Main page content area */}
      <main className="pl-20 pt-20 min-h-screen">
        <div className="p-8 max-w-[1600px] mx-auto space-y-10">
          
          {/* Header Section */}
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2 text-[32px] font-bold">
              Energy Sharing & Distribution Center
            </h1>
            <p className="text-on-surface-variant font-body-lg text-[15px]">
              Real-time monitoring and optimization of energy transfer across the microgrid community.
            </p>
          </div>

          {/* TOP KPI SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <KPICard
              title="Active Energy Transfers"
              value={`${activeTransfers} Nodes`}
              trend={{ value: `+${transfersChange}%`, text: "", type: "up" }}
              icon="bolt"
              iconColor="text-primary-fixed-dim"
            />
            <KPICard
              title="Energy Shared Today"
              value={`${energySharedToday} kWh`}
              trend={{ value: `+${energySharedChange}%`, text: "", type: "up" }}
              icon="share_reviews"
              iconColor="text-primary-fixed-dim"
            />
            <KPICard
              title="Community Efficiency"
              value={`${communityEfficiency}%`}
              trend={{ value: `${communityEfficiencyChange}%`, text: "", type: "down" }}
            />
            <KPICard
              title="Transfer Success Rate"
              value={`${successRate}%`}
              trend={{ value: "NOMINAL", text: "", type: "stable" }}
            />
          </div>

          {/* Core Analytics Grid */}
          <div className="grid grid-cols-12 gap-gutter">
            
            {/* Left panel: Energy sources & Grid Stability ring */}
            <div className="col-span-12 lg:col-span-3 space-y-gutter">
              {/* Energy sources */}
              <GlassPanel className="border border-primary-fixed-dim/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-label-uppercase text-label-uppercase text-primary-fixed-dim">Energy Sources</h3>
                  <span className="material-symbols-outlined text-primary-fixed-dim text-lg">solar_power</span>
                </div>
                <div className="space-y-6">
                  {sources.map((source) => (
                    <div key={source.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-primary-fixed-dim/30 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-body-sm font-bold text-on-surface text-[13px]">{source.name}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          source.status === "OUTPUTTING" ? "bg-secondary-fixed-dim/20 text-secondary-fixed-dim" :
                          source.status === "DISCHARGING" ? "bg-primary-fixed-dim/20 text-primary-fixed-dim" :
                          "bg-white/10 text-on-surface-variant"
                        }`}>
                          {source.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-[9px] text-on-surface-variant uppercase">Output</p>
                          <p className="font-data-mono text-primary-fixed-dim text-[13px]">{source.output} kW</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-on-surface-variant uppercase">Potential</p>
                          <p className="font-data-mono text-on-surface text-[13px]">{source.potential} kW</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              {/* Grid Health Progress Ring */}
              <GlassPanel>
                <h3 className="font-label-uppercase text-label-uppercase text-on-surface-variant mb-6">Grid Balance Health</h3>
                <div className="flex items-center justify-center py-4">
                  <BatteryProgress percentage={stability} label="STABILITY" size={128} color="#2ae500" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center text-body-sm text-[13px]">
                    <span className="text-on-surface-variant">Load Balance</span>
                    <span className="text-primary-fixed-dim font-data-mono">{loadBalance}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm text-[13px]">
                    <span className="text-on-surface-variant">Renewable Rate</span>
                    <span className="text-secondary-fixed-dim font-data-mono">{renewableRate}%</span>
                  </div>
                </div>
              </GlassPanel>
            </div>

            {/* Central node flow map visualization panel */}
            <div className="col-span-12 lg:col-span-6">
              <div className="glass-panel h-full rounded-xl relative overflow-hidden flex flex-col border border-white/5 min-h-[480px]">
                <div className="absolute top-0 left-0 w-full p-gutter flex justify-between items-center z-10">
                  <span className="bg-primary-fixed-dim text-on-primary px-3 py-1 rounded font-label-uppercase text-[10px]">
                    LIVE DISTRIBUTION MAP
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-on-surface-variant text-base">zoom_in</span>
                    </button>
                    <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-on-surface-variant text-base">layers</span>
                    </button>
                  </div>
                </div>

                {/* SVG Energy flow connectivity lines */}
                <div className="flex-1 relative flex items-center justify-center p-8">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #849396 1px, transparent 0)', backgroundColor: 'transparent', backgroundSize: '24px 24px' }} />
                  <svg className="w-full h-full max-h-[500px]" viewBox="0 0 800 600">
                    <path className="flow-line opacity-50" d="M400 300 L200 150" stroke="#00daf3" strokeWidth="2" />
                    <path className="flow-line opacity-50" d="M400 300 L600 150" stroke="#2ae500" strokeWidth="2" />
                    <path className="flow-line opacity-50" d="M400 300 L200 450" stroke="#00daf3" strokeWidth="2" />
                    <path className="flow-line opacity-50" d="M400 300 L600 450" stroke="#2ae500" strokeWidth="2" />
                    
                    <circle cx="400" cy="300" fill="#0f141a" r="40" stroke="#00daf3" strokeWidth="1" />
                    <circle cx="400" cy="300" fill="#00daf3" fillOpacity="0.1" r="30" />
                    <text fill="#00daf3" fontFamily="Geist" fontSize="12" fontWeight="bold" textAnchor="middle" x="400" y="305">HUB-01</text>
                    
                    <g className="node">
                      <rect fill="#0f141a" height="60" rx="4" stroke="#00daf3" strokeWidth="1" width="100" x="150" y="100" />
                      <text fill="#dfe2ec" fontFamily="Geist" fontSize="10" textAnchor="middle" x="200" y="130">Community A</text>
                      <text fill="#00daf3" fontFamily="Geist" fontSize="12" fontWeight="bold" textAnchor="middle" x="200" y="145">120kW OUT</text>
                      <circle className="pulse-dot" cx="200" cy="100" fill="#2ae500" r="4" />
                    </g>
                    <g className="node">
                      <rect fill="#0f141a" height="60" rx="4" stroke="#00daf3" strokeWidth="1" width="100" x="550" y="100" />
                      <text fill="#dfe2ec" fontFamily="Geist" fontSize="10" textAnchor="middle" x="600" y="130">Community B</text>
                      <text fill="#2ae500" fontFamily="Geist" fontSize="12" fontWeight="bold" textAnchor="middle" x="600" y="145">85kW IN</text>
                    </g>
                    <g className="node">
                      <rect fill="#0f141a" height="60" rx="4" stroke="#00daf3" strokeWidth="1" width="100" x="150" y="420" />
                      <text fill="#dfe2ec" fontFamily="Geist" fontSize="10" textAnchor="middle" x="200" y="450">Community C</text>
                      <text fill="#00daf3" fontFamily="Geist" fontSize="12" fontWeight="bold" textAnchor="middle" x="200" y="465">45kW OUT</text>
                    </g>
                    <g className="node">
                      <rect fill="#0f141a" height="60" rx="4" stroke="#00daf3" strokeWidth="1" width="100" x="550" y="420" />
                      <text fill="#dfe2ec" fontFamily="Geist" fontSize="10" textAnchor="middle" x="600" y="450">Community D</text>
                      <text fill="#2ae500" fontFamily="Geist" fontSize="12" fontWeight="bold" textAnchor="middle" x="600" y="465">62kW IN</text>
                    </g>
                  </svg>

                  <div className="absolute bottom-6 left-6 right-6 flex justify-between pointer-events-none">
                    <div className="bg-surface-container-highest/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/5 pointer-events-auto">
                      <p className="text-[10px] text-on-surface-variant uppercase">Primary Corridor</p>
                      <p className="font-data-mono text-primary-fixed-dim text-[13px]">Load: 72%</p>
                    </div>
                    <div className="bg-surface-container-highest/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/5 pointer-events-auto">
                      <p className="text-[10px] text-on-surface-variant uppercase">Line Latency</p>
                      <p className="font-data-mono text-primary-fixed-dim text-[13px]">12ms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel: Energy demand & real-time log list */}
            <div className="col-span-12 lg:col-span-3 space-y-gutter flex flex-col justify-between">
              {/* Energy demands */}
              <GlassPanel className="border border-secondary-fixed-dim/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-label-uppercase text-label-uppercase text-secondary-fixed-dim">Energy Demand</h3>
                  <span className="material-symbols-outlined text-secondary-fixed-dim text-lg">home_work</span>
                </div>
                <div className="space-y-6">
                  {demands.map((demand) => (
                    <div key={demand.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-body-sm font-bold text-on-surface text-[13px]">{demand.name}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          demand.priority === "HIGH PRIORITY" ? "bg-error/20 text-error" :
                          demand.priority === "NORMAL" ? "bg-secondary-fixed-dim/20 text-secondary-fixed-dim" :
                          "bg-white/10 text-on-surface-variant"
                        }`}>
                          {demand.priority}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-on-surface-variant">Demand</span>
                          <span className="text-on-surface">{demand.demand} kW</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full">
                          <div 
                            className={`h-full rounded-full ${demand.priority === 'HIGH PRIORITY' ? 'bg-error' : 'bg-secondary-fixed-dim'}`} 
                            style={{ width: `${demand.capacityPercentage}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-on-surface-variant font-data-mono">
                          <span>{demand.deficit > 0 ? `Deficit: ${demand.deficit}kW` : 'Stabilized'}</span>
                          <span className="text-primary-fixed-dim">{demand.statusText}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              {/* Running log */}
              <GlassPanel className="flex-1 flex flex-col max-h-[300px]">
                <h3 className="font-label-uppercase text-label-uppercase text-on-surface-variant mb-4">Transfer Activity Log</h3>
                <div className="overflow-y-auto space-y-3 font-data-mono text-[11px] flex-1 pr-1">
                  {activityLogs.map((log, idx) => (
                    <div key={idx} className={`flex gap-3 ${log.type}`}>
                      <span className="opacity-50">{log.time}</span>
                      <span>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          </div>

          {/* AI Routing Recommendations */}
          <div className="col-span-12">
            <GlassPanel className="border border-primary-fixed-dim/20 bg-gradient-to-r from-primary-container/5 to-transparent">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary-fixed-dim">psychology</span>
                <h3 className="font-label-uppercase text-label-uppercase text-primary-fixed-dim">AI Energy Routing Recommendations</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {recommendations.map((rec) => (
                  <InsightCard
                    key={rec.id}
                    title={rec.optId}
                    conf={rec.conf}
                    message={rec.text}
                    priority={rec.priority}
                    actionLabel={rec.actionLabel}
                    variant="recommendation"
                  />
                ))}
              </div>
            </GlassPanel>
          </div>

          {/* Plus floating add action button */}
          <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary-fixed-dim text-on-primary rounded-full shadow-[0_0_20px_rgba(0,218,243,0.4)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50 duration-200">
            <span className="material-symbols-outlined text-3xl text-[#00363d] font-bold">add</span>
          </button>

          {/* Global Footer */}
          <Footer gridHealth="Nominal" lat="37.7749" lon="-122.4194" />
        </div>
      </main>
    </>
  );
}
