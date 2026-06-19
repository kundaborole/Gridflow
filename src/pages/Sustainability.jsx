import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import AreaChartCard from '../components/AreaChartCard';
import GlassPanel from '../components/GlassPanel';
import Footer from '../components/Footer';

export default function Sustainability() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const susData = await apiService.getSustainability();
        setData(susData);
      } catch (err) {
        console.error("Error loading sustainability data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-margin-desktop flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const {
    co2EmissionsAvoided = 1428.5,
    co2Change = 12.4,
    co2TargetPercentage = 78,
    renewableUtilization = 64.2,
    renewableChange = 3.1,
    sustainabilityScore = 88,
    sustainabilityTarget = 90,
    annualCostSavings = 412.8,
    savingsChange = 18,
    esgCertified = true,
    co2AnnualOffset = 1402,
    co2AnnualOffsetTargetPercentage = 72,
    greenShare = 84.2,
    treesEquivalent = "42k"
  } = data || {};

  return (
    <>
      {/* Top sticky app bar with live status simulation */}
      <Header title="GridFlow AI" subtext="Sustainability & ESG Intelligence">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-label-uppercase text-label-uppercase text-on-surface-variant text-[10px]">Live Grid Simulation</span>
            <div className="w-2 h-2 rounded-full bg-secondary ml-1 pulse-dot"></div>
          </div>
          <button className="bg-primary-fixed text-on-primary-fixed px-6 py-2 rounded-lg font-headline-sm text-body-sm button-glow hover:brightness-110 transition-all active:scale-95 text-[12px] font-bold">
            Run Simulation
          </button>
        </div>
      </Header>

      {/* Main page content area */}
      <main className="pt-24 px-margin-desktop pb-12 max-w-[1600px] mx-auto w-full flex-1">
        
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="font-display-lg text-display-lg text-primary text-glow-primary mb-2 text-[32px] font-bold">
            Sustainability & ESG Intelligence
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-3xl leading-relaxed text-[15px]">
            Monitor environmental impact, renewable utilization, carbon reduction, and long-term sustainability performance. GridFlow AI optimizes your energy portfolio for maximum ESG alignment.
          </p>
        </header>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
          <KPICard
            title="CO2 Emissions Avoided"
            value={co2EmissionsAvoided}
            unit="tCO2e"
            icon="eco"
            iconColor="text-secondary"
            progress={{ value: co2TargetPercentage, label: "" }}
            trend={{ value: `+${co2Change}%`, text: "", type: "up" }}
          />
          <KPICard
            title="Renewable Utilization"
            value={`${renewableUtilization}%`}
            unit=""
            icon="solar_power"
            iconColor="text-primary"
            progress={{ value: renewableUtilization, label: "" }}
            trend={{ value: `+${renewableChange}%`, text: "", type: "up" }}
          />
          <KPICard
            title="Sustainability Score"
            value={sustainabilityScore}
            unit="/ 100"
            icon="verified"
            iconColor="text-tertiary-container"
            progress={{ value: sustainabilityScore, label: `Target: ${sustainabilityTarget}` }}
          />
          <KPICard
            title="Annual Cost Savings"
            value={`$${annualCostSavings}k`}
            unit=""
            icon="payments"
            iconColor="text-secondary"
            progress={{ value: 92, label: "" }}
            trend={{ value: `+${savingsChange}%`, text: "", type: "up" }}
          />
        </div>

        {/* Main Carbon Graph */}
        <div className="mb-gutter">
          <AreaChartCard
            title="Carbon Reduction & Renewable Usage Trend"
            subtitle="Comparative historical performance over the last 12 months"
            type="sustainability"
            heightClass="h-96"
            legend={[
              { name: "Carbon Reduction (tons)", colorClass: "bg-primary" },
              { name: "Renewable Usage (%)", colorClass: "bg-secondary-container" }
            ]}
          >
            <div className="flex gap-2">
              <button className="bg-white/10 border border-white/10 px-3 py-1 rounded text-body-sm hover:bg-white/20 text-[12px]">Monthly</button>
              <button className="bg-primary/20 border border-primary/30 px-3 py-1 rounded text-body-sm text-primary text-[12px]">Quarterly</button>
            </div>
          </AreaChartCard>
        </div>

        {/* Middle Row: Donut Chart & AI insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
          
          {/* Renewable breakdown donut */}
          <div className="glass-panel p-panel-padding rounded-xl flex flex-col min-h-[350px]">
            <h3 className="font-label-uppercase text-label-uppercase text-on-surface-variant mb-6">Renewable Energy Breakdown</h3>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="relative w-40 h-40 rounded-full border-[16px] border-white/5 flex items-center justify-center">
                {/* Visual donut slices */}
                <div className="absolute inset-0 rounded-full border-[16px] border-primary" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 50% 100%)' }} />
                <div className="absolute inset-0 rounded-full border-[16px] border-secondary-container" style={{ clipPath: 'polygon(50% 50%, 0 100%, 0 0, 50% 0)' }} />
                
                <div className="flex flex-col items-center z-10">
                  <span className="font-data-mono text-headline-md text-primary font-bold text-xl">84%</span>
                  <span className="font-label-uppercase text-[9px] text-on-surface-variant">Green Mix</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-body-sm text-on-surface-variant text-[13px]">Solar (42%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary-container" />
                <span className="font-body-sm text-on-surface-variant text-[13px]">Wind (31%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-tertiary-container" />
                <span className="font-body-sm text-on-surface-variant text-[13px]">Battery (11%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="font-body-sm text-on-surface-variant text-[13px]">Grid (16%)</span>
              </div>
            </div>
          </div>

          {/* AI Sustainability insights */}
          <div className="glass-panel p-panel-padding rounded-xl lg:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-label-uppercase text-label-uppercase text-on-surface-variant">AI Sustainability Insights</h3>
              <span className="material-symbols-outlined text-primary animate-pulse">auto_awesome</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex gap-4 items-center hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">battery_charging_full</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline-sm text-body-lg text-on-surface mb-1 truncate text-[14px] font-bold">Increase battery charging during solar surplus</h4>
                  <p className="font-body-sm text-on-surface-variant text-[12px] leading-normal">Forecasted 14:00 peak solar production exceeds demand. Automate storage for evening peak.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-secondary font-data-mono text-body-lg text-[13px] font-bold">-4.2 tCO2</div>
                  <div className="bg-primary/20 text-primary text-[9px] px-2 py-0.5 rounded font-label-uppercase mt-1 inline-block">High Priority</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex gap-4 items-center hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded bg-tertiary-container/10 flex items-center justify-center text-tertiary-container shrink-0">
                  <span className="material-symbols-outlined">share_reviews</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline-sm text-body-lg text-on-surface mb-1 truncate text-[14px] font-bold">Optimize Energy Sharing in Community B</h4>
                  <p className="font-body-sm text-on-surface-variant text-[12px] leading-normal">Neighborhood peer-to-peer sharing could reduce grid dependence by 8% this week.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-secondary font-data-mono text-body-lg text-[13px] font-bold">-1.8 tCO2</div>
                  <div className="bg-white/10 text-on-surface-variant text-[9px] px-2 py-0.5 rounded font-label-uppercase mt-1 inline-block">Strategic</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex gap-4 items-center hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined">electric_bolt</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline-sm text-body-lg text-on-surface mb-1 truncate text-[14px] font-bold">EV Fleet Smart-Charging Window</h4>
                  <p className="font-body-sm text-on-surface-variant text-[12px] leading-normal">Shift charging window from 22:00 to 02:00 to utilize low-carbon wind energy surplus.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-secondary font-data-mono text-body-lg text-[13px] font-bold">-2.5 tCO2</div>
                  <div className="bg-secondary/20 text-secondary text-[9px] px-2 py-0.5 rounded font-label-uppercase mt-1 inline-block">Medium</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom details section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="glass-panel p-panel-padding rounded-xl flex flex-col justify-between">
            <h3 className="font-label-uppercase text-label-uppercase text-on-surface-variant mb-6">Community Impact</h3>
            <div className="space-y-6">
              <div>
                <p className="font-body-sm text-on-surface-variant mb-2">Households Supported</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-data-mono text-headline-md text-primary text-xl font-bold">12,850</span>
                  <span className="material-symbols-outlined text-secondary text-body-sm">trending_up</span>
                </div>
              </div>
              <div>
                <p className="font-body-sm text-on-surface-variant mb-2">Energy Independence Score</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-primary" style={{ width: '72%' }} />
                  </div>
                  <span className="font-data-mono text-body-lg text-primary font-bold">72%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <Footer gridHealth="Nominal" lat="37.7749" lon="-122.4194" />
      </main>
    </>
  );
}
