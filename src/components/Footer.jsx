import React from 'react';

export default function Footer({ 
  gridHealth = "Nominal", 
  lat = "37.7749", 
  lon = "-122.4194" 
}) {
  return (
    <footer className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-outline-variant/30 text-on-surface-variant font-data-mono text-[11px] gap-4 mt-8">
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim pulse-dot"></span>
          <span>Grid Health: {gridHealth}</span>
        </div>
        <span>Lat: {lat}° N, Lon: {Math.abs(lon)}° W</span>
      </div>
      <div>© 2024 GridFlow AI. Built for Sustainable Infrastructure.</div>
    </footer>
  );
}
