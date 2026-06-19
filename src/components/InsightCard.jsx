import React from 'react';
import GlassPanel from './GlassPanel';

export default function InsightCard({
  id,
  type, // e.g. "Optimization Opportunity", "Weather Anomaly", "Maintenance Window"
  priority, // "High" | "Med" | "Critical"
  conf, // Confidence percentage e.g., 98
  title, // e.g., "Store excess solar at 2 PM" or "RT-442"
  message,
  actionLabel,
  onAction,
  onDismiss,
  variant = "simple" // "simple" (Dashboard insights) | "priority" (Forecast AI block) | "recommendation" (Energy sharing)
}) {
  if (variant === "simple") {
    const isActionable = !!actionLabel;
    const bgContainerClass = isActionable 
      ? "bg-secondary-container/5 border border-secondary-fixed-dim/20" 
      : "bg-surface-variant/20 border border-outline-variant";
    const titleColorClass = isActionable ? "text-secondary-fixed-dim" : "text-on-surface";

    return (
      <div className={`p-3 rounded-lg ${bgContainerClass}`}>
        <p className={`font-body-sm ${titleColorClass} font-bold mb-1`}>{type}</p>
        <p className="text-[13px] text-on-surface-variant leading-relaxed">{message}</p>
        {isActionable && (
          <button 
            onClick={onAction}
            className="mt-2 text-[12px] font-bold text-on-surface underline underline-offset-4 decoration-secondary-fixed-dim/50 hover:text-secondary-fixed-dim transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  if (variant === "priority") {
    const iconColorMap = {
      "high": "text-secondary-fixed-dim bg-secondary-fixed-dim/10",
      "med": "text-primary-fixed-dim bg-primary-fixed-dim/10",
      "critical": "text-error bg-error/10"
    };
    const currentPriority = (priority || 'med').toLowerCase();

    return (
      <GlassPanel className="flex items-start gap-4 h-full">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconColorMap[currentPriority] || iconColorMap.med}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {currentPriority === "high" ? "battery_charging_full" : currentPriority === "critical" ? "bolt" : "hub"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] font-label-uppercase text-outline">Priority: {priority}</span>
            {conf && <span className="text-[10px] font-data-mono text-secondary-fixed-dim">{conf}% Conf.</span>}
          </div>
          <h4 className="font-headline-sm text-primary mb-1 truncate">{title}</h4>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">{message}</p>
          <div className="mt-4 flex gap-2">
            {actionLabel && (
              <button 
                onClick={onAction}
                className={`px-4 py-1.5 text-[11px] font-bold rounded ${
                  currentPriority === 'high' ? 'bg-secondary-fixed-dim text-on-secondary-fixed' : 
                  currentPriority === 'critical' ? 'bg-error text-on-error' :
                  'bg-primary-fixed-dim text-on-primary-fixed'
                }`}
              >
                {actionLabel}
              </button>
            )}
            <button 
              onClick={onDismiss}
              className="px-4 py-1.5 glass-panel text-[11px] font-bold rounded hover:bg-white/10 transition-colors"
            >
              DISMISS
            </button>
          </div>
        </div>
      </GlassPanel>
    );
  }

  // Energy Routing Recommendations (Energy sharing page variant)
  if (variant === "recommendation") {
    const isCritical = (priority || '').toLowerCase() === 'critical';
    return (
      <div className="bg-surface-container-highest/40 p-4 rounded-lg border border-white/5 flex flex-col justify-between h-full min-h-[160px]">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-primary-fixed-dim uppercase tracking-tighter">Optimization ID: {title}</span>
            <span className="bg-secondary-fixed-dim/10 text-secondary-fixed-dim px-2 py-0.5 rounded-[2px] text-[10px]">{conf}% CONF.</span>
          </div>
          <p className="font-body-sm text-on-surface mb-4 leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-on-surface-variant">
            Priority:{' '}
            <span className={isCritical ? 'text-error font-bold' : 'text-secondary-fixed-dim'}>
              {priority}
            </span>
          </span>
          <button 
            onClick={onAction}
            className={`text-[10px] font-bold px-4 py-1.5 rounded uppercase tracking-wider hover:scale-105 transition-transform active:scale-95 duration-200 ${
              isCritical ? 'bg-error text-on-error' : 'bg-primary-fixed-dim text-on-primary'
            }`}
          >
            {actionLabel || 'Execute'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
