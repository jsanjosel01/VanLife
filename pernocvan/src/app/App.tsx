import React from 'react';
import { Routes, Route } from 'react-router-dom'; // <-- Importamos los componentes de ruta
import { AppLayout } from '../layouts/AppLayout';
import { LandingPage } from '../pages/LandingPage';
import { MapPage } from '../pages/MapPage';
import LoginPage from '../pages/LoginPage';

function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Ruta principal: muestra la Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;