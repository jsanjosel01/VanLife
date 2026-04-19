import React from 'react';
import { Link } from 'react-router-dom'; // <-- 1. IMPORTANTE: Añadimos esta línea

export const Hero = () => {
  return (
    <section className="relative bg-green-50 pt-16 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
        
          {/* Texto y Botones */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Libertad para</span>
              <span className="block text-green-600">pernoctar donde quieras</span>
            </h1>
            <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Descubre y comparte los mejores lugares para dormir con tu furgoneta o autocaravana. Sitios en la naturaleza, áreas de servicio y parkings verificados por la comunidad.
            </p>
            
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              
              <Link 
                to="/mapa"
                className="px-8 py-3 border border-transparent text-base font-bold rounded-full text-white bg-green-600 hover:bg-green-700 transition-all shadow-md flex items-center justify-center"
              >
                Explorar Mapa
              </Link>
              
              <button className="px-8 py-3 border-2 border-green-600 text-base font-bold rounded-full text-green-700 bg-white hover:bg-green-50 transition-all shadow-sm">
                Añadir un sitio
              </button>
            </div>
          </div>
          
          {/* Imagen */}
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6">
            <div className="relative mx-auto w-full rounded-3xl shadow-xl overflow-hidden aspect-video bg-green-200 flex flex-col items-center justify-center border-4 border-white">
              
              {/* IMAGEN DE FONDO */}
            <img
              src="/img/cochepareja.jpg" 
              alt="Furgoneta camper en la naturaleza - Pernocvan"
              className="absolute inset-0 w-full h-full object-cover object-center z-0"
            />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};