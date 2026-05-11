
import { Compass, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


export const Hero = () => {
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!busqueda.trim()) return;
    // Redirigimos al mapa pasando la ciudad como parámetro en la URL
    navigate(`/mapa?search=${encodeURIComponent(busqueda)}`);
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* IMAGEN DE FONDO A TODA PANTALLA */}
      <div className="absolute inset-0 z-0">
        <img
          src="/img/cochepareja.jpg" 
          alt="Pernocvan Background"
          className="w-full h-full object-cover"
        />
        {/* Capa de contraste gris oscuro/negro para que el buscador resalte */}
        <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[2px]" />
      </div>

      {/* CONTENIDO CENTRAL */}
      <div className="relative z-10 w-full max-w-4xl px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter shadow-sm">
          TU VIAJE EMPIEZA <span className="text-zinc-950">AQUÍ</span>
        </h1>
        <p className="text-xl text-zinc-200 mb-10 max-w-2xl mx-auto font-medium">
          Encuentra el rincón perfecto para pernoctar hoy mismo.
        </p>

        {/* BUSCADOR ESTILO "BARRA DE BÚSQUEDA" */}
        <form 
          onSubmit={handleBuscar}
          className="relative group max-w-2xl mx-auto"
        >
          <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 p-2 transition-all focus-within:ring-4 focus-within:ring-green-500/30">
            <div className="pl-4 text-zinc-400">
              <MapPin className="w-6 h-6" />
            </div>
            
            <input 
              type="text" 
              placeholder="¿A dónde vamos? (Ej: Cabo de Gata, Asturias...)" 
              className="flex-1 px-4 py-4 bg-transparent outline-none text-zinc-800 text-lg font-semibold placeholder:text-zinc-400"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            {/* <button 
              type="submit"
              className="bg-zinc-900 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95"
            >
              <Search className="w-5 h-5" />
              <span>Buscar</span>
            </button> */}
          </div>

          
        </form>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <p className="text-zinc-400 text-sm font-medium">¿Prefieres ver todo?</p>
        
        <Link 
          to="/mapa"
          className="group flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-zinc-950 border border-white/20 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 backdrop-blur-sm"
        >
          <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
          Ver todos los puntos
        </Link>
      </div>

            </div>
    </section>
  );
};