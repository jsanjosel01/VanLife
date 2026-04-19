import React from 'react';
import { Link } from 'react-router-dom';


export const Header = () => {
  return (
    <header className="header-container">
      <div className="header-content flex justify-between items-center p-4 bg-white shadow-md">
        
        {/* Logo / Nombre de la App */}
        <div className="logo-section">
          
            <h1 className="text-2xl font-bold text-green-700">
              Prenocvan 
            </h1>
          
        </div>


        {/* Acciones de Usuario (Autenticación) */}
        <div className="auth-actions flex gap-3">
        
        <Link to="/login">
          <button className="px-4 py-2 text-green-700 bg-white border border-green-700 rounded hover:bg-green-50 transition">
            Iniciar Sesión
          </button>
        </Link>

          <button className="px-4 py-2 text-white bg-green-700 rounded hover:bg-green-800 transition">
            Registrarse
          </button>
        </div>

      </div>
    </header>
  );
};