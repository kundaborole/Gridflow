import React from 'react';

export default function GlassPanel({ children, className = "", onClick }) {
  return (
    <div 
      className={`glass-panel p-panel-padding rounded-xl transition-all duration-300 hover:bg-[rgba(30,35,45,0.4)] hover:border-[rgba(255,255,255,0.25)] ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
