import React from 'react';
import Sidebar from '../components/Sidebar';

export default function CommandCenterLayout({ children, activeNodes }) {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#0a0e15] text-[#dfe2ec]">
      {/* Persistant Slim/Hover-expanding Sidebar */}
      <Sidebar activeNodes={activeNodes} />
      
      {/* Main Page Area */}
      <div className="flex-1 ml-20 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
