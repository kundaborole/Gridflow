import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CommandCenterLayout from './layouts/CommandCenterLayout';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Sustainability from './pages/Sustainability';
import EnergySharing from './pages/EnergySharing';

export default function App() {
  return (
    <Router>
      <CommandCenterLayout activeNodes={124}>
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/sharing" element={<EnergySharing />} />
          <Route path="/sustainability" element={<Sustainability />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CommandCenterLayout>
    </Router>
  );
}
