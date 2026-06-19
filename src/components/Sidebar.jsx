import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ activeNodes = 124 }) {
  return (
    <aside className="fixed left-0 h-full w-20 hover:w-64 transition-all duration-300 z-40 bg-surface-container-lowest/80 backdrop-blur-2xl border-r border-white/5 flex flex-col py-panel-padding group pt-20">
      
      {/* Brand Title (Visible on hover) */}
      <div className="px-5 mb-8 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h2 className="font-headline-md text-headline-md text-primary-fixed-dim">Microgrid HQ</h2>
        <p className="text-label-uppercase font-label-uppercase text-secondary-fixed-dim flex items-center mt-1">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim mr-2 pulse-dot"></span>
          Active Nodes: {activeNodes}
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2 px-3">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center p-3 rounded-lg text-on-surface-variant transition-all ${
              isActive
                ? 'bg-primary-container/20 text-primary-fixed-dim border-r-4 border-primary-fixed-dim'
                : 'opacity-70 hover:bg-white/5 hover:opacity-100'
            }`
          }
        >
          <span className="material-symbols-outlined min-w-[32px]">dashboard</span>
          <span className="ml-4 font-label-uppercase text-label-uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Dashboard
          </span>
        </NavLink>

        <NavLink
          to="/forecast"
          className={({ isActive }) =>
            `flex items-center p-3 rounded-lg text-on-surface-variant transition-all ${
              isActive
                ? 'bg-primary-container/20 text-primary-fixed-dim border-r-4 border-primary-fixed-dim'
                : 'opacity-70 hover:bg-white/5 hover:opacity-100'
            }`
          }
        >
          <span className="material-symbols-outlined min-w-[32px]">query_stats</span>
          <span className="ml-4 font-label-uppercase text-label-uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Forecast
          </span>
        </NavLink>

        <NavLink
          to="/sharing"
          className={({ isActive }) =>
            `flex items-center p-3 rounded-lg text-on-surface-variant transition-all ${
              isActive
                ? 'bg-primary-container/20 text-primary-fixed-dim border-r-4 border-primary-fixed-dim'
                : 'opacity-70 hover:bg-white/5 hover:opacity-100'
            }`
          }
        >
          <span className="material-symbols-outlined min-w-[32px]">swap_horiz</span>
          <span className="ml-4 font-label-uppercase text-label-uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Energy Sharing
          </span>
        </NavLink>

        <NavLink
          to="/sustainability"
          className={({ isActive }) =>
            `flex items-center p-3 rounded-lg text-on-surface-variant transition-all ${
              isActive
                ? 'bg-primary-container/20 text-primary-fixed-dim border-r-4 border-primary-fixed-dim'
                : 'opacity-70 hover:bg-white/5 hover:opacity-100'
            }`
          }
        >
          <span className="material-symbols-outlined min-w-[32px]">eco</span>
          <span className="ml-4 font-label-uppercase text-label-uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Sustainability
          </span>
        </NavLink>

        <a
          href="#config"
          className="flex items-center p-3 rounded-lg text-on-surface-variant opacity-70 hover:bg-white/5 hover:opacity-100 transition-all"
        >
          <span className="material-symbols-outlined min-w-[32px]">settings_input_component</span>
          <span className="ml-4 font-label-uppercase text-label-uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            System Config
          </span>
        </a>
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="px-3 space-y-4">
        <button className="w-full bg-error/20 text-error border border-error/30 py-2 rounded font-label-uppercase text-label-uppercase hidden group-hover:block transition-all hover:bg-error hover:text-on-error duration-200">
          EMERGENCY SHUTDOWN
        </button>
        <div className="pt-4 border-t border-white/5">
          <a
            href="#support"
            className="flex items-center p-3 rounded-lg text-on-surface-variant opacity-70 hover:bg-white/5 hover:opacity-100 transition-all"
          >
            <span className="material-symbols-outlined min-w-[32px]">help_outline</span>
            <span className="ml-4 font-label-uppercase text-label-uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Support
            </span>
          </a>
          <a
            href="#logs"
            className="flex items-center p-3 rounded-lg text-on-surface-variant opacity-70 hover:bg-white/5 hover:opacity-100 transition-all"
          >
            <span className="material-symbols-outlined min-w-[32px]">terminal</span>
            <span className="ml-4 font-label-uppercase text-label-uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Logs
            </span>
          </a>
        </div>
      </div>
    </aside>
  );
}
