import React from 'react';
import GlassPanel from './GlassPanel';

export default function AreaChartCard({
  title,
  subtitle,
  heightClass = "h-[400px]",
  type = "dashboard", // "dashboard" | "sustainability" | "forecast"
  legend = [],
  tab = "", // e.g. "24H", "7D", "30D", "Monthly", "Quarterly"
  children
}) {
  // Dynamic paths for Forecast screen based on tab selection
  const getForecastPaths = () => {
    switch (tab) {
      case '7D':
        return {
          demand: "M0 160 Q 100 80, 200 130 T 400 90 T 600 140 T 800 80",
          solar: "M0 190 Q 100 150, 200 90 T 400 70 T 600 110 T 800 150"
        };
      case '30D':
        return {
          demand: "M0 130 Q 200 120, 400 110 T 800 120",
          solar: "M0 150 Q 200 140, 400 130 T 800 140"
        };
      case '24H':
      default:
        return {
          demand: "M0 160 Q 200 40, 400 130 T 800 100",
          solar: "M0 190 Q 200 120, 400 60 T 800 170"
        };
    }
  };

  // Dynamic paths for Sustainability screen
  const getSustainabilityPaths = () => {
    if (tab === 'Monthly') {
      return {
        co2Area: "M0,200 L0,150 L100,140 L200,160 L300,120 L400,110 L500,90 L600,70 L700,80 L800,50 L900,40 L1000,30 L1000,200 Z",
        co2Line: "M0,150 L100,140 L200,160 L300,120 L400,110 L500,90 L600,70 L700,80 L800,50 L900,40 L1000,30",
        renew: "M0,180 L100,170 L200,150 L300,160 L400,140 L500,120 L600,100 L700,110 L800,90 L900,70 L1000,60"
      };
    }
    // Quarterly (Default)
    return {
      co2Area: "M0,200 L0,170 C 150 160, 300 150, 450 110 S 750 90, 1000,40 L 1000,200 Z",
      co2Line: "M0,170 C 150 160, 300 150, 450 110 S 750 90, 1000,40",
      renew: "M0,190 C 150 180, 300 160, 450 130 S 750 110, 1000,70"
    };
  };

  const forecastPaths = getForecastPaths();
  const sustainabilityPaths = getSustainabilityPaths();

  return (
    <GlassPanel className={`relative overflow-hidden ${heightClass} flex flex-col`}>
      {/* Chart Headers */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <span className="font-label-uppercase text-label-uppercase text-on-surface-variant">{title}</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{subtitle}</h3>
        </div>
        
        {/* Custom Legend elements */}
        <div className="flex gap-4">
          {legend.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.colorClass}`} />
              <span className="font-data-mono text-[12px] text-on-surface-variant">{item.name}</span>
            </div>
          ))}
          {children}
        </div>
      </div>

      {/* SVG Chart Layout matching original Stitch designs exactly */}
      <div className="flex-1 relative flex items-end pb-6">
        {type === "dashboard" && (
          <svg className="w-full h-full chart-glow" viewBox="0 0 800 240" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" x1="0" x2="800" y1="40" y2="40" />
            <line stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" x1="0" x2="800" y1="120" y2="120" />
            <line stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" x1="0" x2="800" y1="200" y2="200" />
            
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#00daf3" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#00daf3" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Filled area */}
            <path 
              d="M0 240 C 100 180, 200 200, 300 120 S 500 80, 600 140 S 750 100, 800 120 L 800 240 L 0 240 Z" 
              fill="url(#areaGradient)" 
            />
            {/* Curve path */}
            <path 
              d="M0 240 C 100 180, 200 200, 300 120 S 500 80, 600 140 S 750 100, 800 120" 
              fill="none" 
              stroke="#00daf3" 
              strokeLinecap="round" 
              strokeWidth="3" 
            />
            {/* Active Node Marker */}
            <circle cx="300" cy="120" fill="#00daf3" r="4" />
            <circle cx="300" cy="120" fill="none" opacity="0.5" r="10" stroke="#00daf3" strokeWidth="1" />
          </svg>
        )}

        {type === "sustainability" && (
          <div className="absolute inset-x-0 bottom-6 top-0 flex items-end justify-between gap-1">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-white/5 w-full h-0" />
              <div className="border-b border-white/5 w-full h-0" />
              <div className="border-b border-white/5 w-full h-0" />
              <div className="border-b border-white/5 w-full h-0" />
              <div className="border-b border-white/5 w-full h-0" />
            </div>
            
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
              <defs>
                <linearGradient id="grad-carbon" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#00e5ff', stopOpacity: 0.5 }} />
                  <stop offset="100%" style={{ stopColor: '#00e5ff', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              
              {/* Carbon Reduction */}
              <path d={sustainabilityPaths.co2Area} fill="url(#grad-carbon)" opacity="0.3" />
              <path d={sustainabilityPaths.co2Line} fill="none" stroke="#00e5ff" strokeWidth="2" />
              
              {/* Renewable Usage */}
              <path d={sustainabilityPaths.renew} fill="none" stroke="#2ff801" strokeDasharray="8 4" strokeWidth="3" />
            </svg>
            
            {/* X Axis Labels */}
            <div className="absolute -bottom-6 inset-x-0 flex justify-between px-2 font-label-uppercase text-[10px] text-on-surface-variant">
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
              <span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
            </div>
          </div>
        )}

        {type === "forecast" && (
          <div className="w-full h-full flex flex-col justify-end">
            <svg className="w-full h-5/6" viewBox="0 0 800 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" x1="0" x2="800" y1="30" y2="30" />
              <line stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" x1="0" x2="800" y1="80" y2="80" />
              <line stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" x1="0" x2="800" y1="130" y2="130" />
              <line stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" x1="0" x2="800" y1="180" y2="180" />
              
              <defs>
                <linearGradient id="demandGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00daf3" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#00daf3" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="solarGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2ae500" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#2ae500" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Demand Area & Path */}
              {tab === '30D' ? (
                <path d={`${forecastPaths.demand} L 800 200 L 0 200 Z`} fill="url(#demandGrad)" />
              ) : (
                <path d={`${forecastPaths.demand} L 800 200 L 0 200 Z`} fill="url(#demandGrad)" />
              )}
              <path d={forecastPaths.demand} fill="none" stroke="#00daf3" strokeWidth="2.5" />
              
              {/* Solar Output Area & Path */}
              {tab === '30D' ? (
                <path d={`${forecastPaths.solar} L 800 200 L 0 200 Z`} fill="url(#solarGrad)" />
              ) : (
                <path d={`${forecastPaths.solar} L 800 200 L 0 200 Z`} fill="url(#solarGrad)" />
              )}
              <path d={forecastPaths.solar} fill="none" stroke="#2ae500" strokeWidth="2.5" />

              {/* Vertical line for NOW */}
              {tab === '24H' && (
                <line stroke="#2ae500" strokeDasharray="4" strokeWidth="1.5" x1="400" x2="400" y1="0" y2="200" />
              )}
            </svg>
            
            {/* Time labels below chart */}
            <div className="w-full flex justify-between px-2 pt-4 border-t border-white/10 mt-2">
              <span className="font-data-mono text-[10px] text-outline-variant">{tab === '30D' ? 'Day 1' : tab === '7D' ? 'Mon' : '00:00'}</span>
              <span className="font-data-mono text-[10px] text-outline-variant">{tab === '30D' ? 'Day 5' : tab === '7D' ? 'Tue' : '04:00'}</span>
              <span className="font-data-mono text-[10px] text-outline-variant">{tab === '30D' ? 'Day 10' : tab === '7D' ? 'Wed' : '08:00'}</span>
              <span className="font-data-mono text-[10px] text-secondary-fixed-dim font-bold">{tab === '30D' ? 'Day 15' : tab === '7D' ? 'Thu (NOW)' : 'NOW'}</span>
              <span className="font-data-mono text-[10px] text-outline-variant">{tab === '30D' ? 'Day 20' : tab === '7D' ? 'Fri' : '16:00'}</span>
              <span className="font-data-mono text-[10px] text-outline-variant">{tab === '30D' ? 'Day 25' : tab === '7D' ? 'Sat' : '20:00'}</span>
              <span className="font-data-mono text-[10px] text-outline-variant">{tab === '30D' ? 'Day 30' : tab === '7D' ? 'Sun' : '23:59'}</span>
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
