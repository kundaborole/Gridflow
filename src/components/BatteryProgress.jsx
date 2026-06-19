import React from 'react';

export default function BatteryProgress({
  percentage = 88,
  label = "Health",
  size = 128,
  strokeWidth = 8,
  color = "#00daf3" // default electric blue
}) {
  const radius = (size / 2) - (strokeWidth);
  const circumference = 2 * Math.PI * radius;
  // Calculate dash offset representing the percentage
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Foreground dynamic circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Centered text overlays */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display-lg text-[24px] text-on-surface leading-tight">
          {percentage}%
        </span>
        <span className="font-label-uppercase text-[10px] text-on-surface-variant mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}
