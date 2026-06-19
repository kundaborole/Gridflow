import React from 'react';

export default function Header({ 
  title = "GridFlow AI", 
  subtext = "Enterprise Intelligence",
  avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDDZF6qeGgQjN2UeAiO-UdOZchIQ0Lip6Jg4P6b3PQ5wqYrQi007kvOqU5njGYzdgV58x4v2_PnqHQCQ6p-9_gNxdTZso9sDA_UztryLYgRY0m6ako6kDnyEhrND7Qwqke6HWQhEu2MXceF4GS4eCQRw1rwc_CMK2Il1hq2NTngfhsFw0uwWNybYD-O1Y6M7Kl5321QuKDklJ7rXwSC9QpEbdw-MUc_bHI2Gl_ibCucA1IQqVLi29ut9H5PWuv0AgyB_JRf8AiofMQ",
  children
}) {
  return (
    <header className="h-16 fixed top-0 right-0 left-20 z-30 flex justify-between items-center px-margin-desktop bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant">
      
      {/* Title & Subtext */}
      <div className="flex items-center gap-4">
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface whitespace-nowrap">{title}</h1>
        <div className="h-4 w-[1px] bg-outline-variant mx-2"></div>
        <span className="font-data-mono text-data-mono text-on-surface-variant hidden sm:inline whitespace-nowrap">{subtext}</span>
      </div>

      {/* Actions, Status & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Custom Actions (e.g. simulation controls, confidence meters, search) */}
        {children}

        <div className="h-6 w-[1px] bg-outline-variant"></div>

        {/* Notifications */}
        <button className="text-on-surface-variant hover:text-primary-container transition-transform active:scale-95 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-secondary-fixed-dim rounded-full"></span>
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full border border-primary/20 p-0.5 overflow-hidden">
          <img 
            className="w-full h-full object-cover rounded-full" 
            alt="Profile Avatar" 
            src={avatarUrl}
          />
        </div>
      </div>
    </header>
  );
}
