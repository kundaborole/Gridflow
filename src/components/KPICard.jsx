import React from 'react';
import GlassPanel from './GlassPanel';

export default function KPICard({
  title,
  value,
  unit,
  icon,
  iconColor = "text-primary-fixed-dim",
  stripColor, // e.g. "bg-primary-fixed-dim", "bg-secondary-fixed-dim"
  trend, // e.g., { value: "+12.4%", text: "vs last peak", type: "up"|"down"|"stable" }
  progress, // e.g., { value: 78, label: "78% target" }
  confidence
}) {
  return (
    <GlassPanel className="relative overflow-hidden flex flex-col min-w-0">
      {/* Left indicator strip if specified */}
      {stripColor && <div className={`absolute top-0 left-0 w-1 h-full ${stripColor}`} />}
      
      {/* Card Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-label-uppercase text-label-uppercase text-on-surface-variant truncate mr-2">{title}</span>
        {icon && <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>}
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2">
        <span className="font-display-lg text-[32px] text-on-surface leading-none">{value}</span>
        {unit && <span className="font-data-mono text-on-surface-variant text-[14px]">{unit}</span>}
      </div>

      {/* Trend or Progress row */}
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-[12px]">
          {trend.type === "up" && (
            <span className="material-symbols-outlined text-[16px] text-error">trending_up</span>
          )}
          {trend.type === "down" && (
            <span className="material-symbols-outlined text-[16px] text-secondary-fixed-dim">trending_down</span>
          )}
          {trend.type === "stable" && (
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">horizontal_rule</span>
          )}
          <span className={trend.type === "up" ? "text-error font-data-mono" : trend.type === "down" ? "text-secondary-fixed-dim font-data-mono" : "text-on-surface-variant"}>
            {trend.value}
          </span>
          <span className="text-on-surface-variant"> {trend.text}</span>
          {confidence && (
            <>
              <span className="mx-2 w-px h-3 bg-white/10" />
              <span className="font-label-uppercase text-[10px] text-outline">{confidence}</span>
            </>
          )}
        </div>
      )}

      {/* Progress Bar (Sustainability card styles) */}
      {progress && (
        <div className="mt-4 space-y-2">
          <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
            <div 
              className={`h-full ${stripColor || 'bg-secondary-fixed-dim'}`} 
              style={{ width: `${progress.value}%` }} 
            />
          </div>
          {progress.label && (
            <p className="text-[11px] text-on-surface-variant font-data-mono">{progress.label}</p>
          )}
        </div>
      )}

      {/* Accuracy progress visual */}
      {!trend && !progress && confidence && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary-fixed-dim w-[96.2%] rounded-full shadow-[0_0_8px_#00daf3]" />
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
