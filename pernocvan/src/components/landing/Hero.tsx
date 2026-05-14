
import { Compass, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


export const Hero = () => {
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const navigate = useNavigate();

  // BUSCADOR GLOBAL: Buscamos sugerencias en todo el mundo
  useEffect(() => {
    const buscarSugerencias = async () => {
      if (busqueda.length < 3) {
        setSugerencias([]);
        return;
      }

      try {
        // busca por todos los países
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setSugerencias(data);
      } catch (error) {
        console.error("Error buscando sugerencias", error);
      }
    };

    const timer = setTimeout(buscarSugerencias, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const seleccionarSugerencia = (sug: any) => {
    // Si es un texto manual, al dar Enter sin elegir de la lista
    if (typeof sug === 'string') {
      navigate(`/mapa?location=${encodeURIComponent(sug)}`);
      return;
    }

    // Si es un objeto de la API clic en la lista
    const nombreCompleto = sug.display_name;
    // Extraemos solo la ciudad para el input, pero mandamos TODO al mapa
    const nombreCorto = sug.display_name.split(',')[0];
    
    setBusqueda(nombreCorto);
    setSugerencias([]);
    
    // Enviamos el nombre completo (ej: "Paris, Île-de-France, France") para que el mapa no se pierda
    navigate(`/mapa?location=${encodeURIComponent(nombreCompleto)}`);
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* IMAGEN DE FONDO */}
      <div className="absolute inset-0 z-0">
        <img
          src="/img/cochepareja.jpg" 
          alt="Pernocvan Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter shadow-sm">
          TU VIAJE EMPIEZA <span className="text-zinc-950 bg-zinc-100/90 py-1 px-4 rounded-2xl mx-1 inline-block shadow-xl border border-zinc-300">
            AQUÍ
            </span>
        </h1>
        <p className="text-xl text-zinc-200 mb-10 max-w-2xl mx-auto font-medium">
          Encuentra el rincón perfecto para pernoctar hoy mismo.
        </p>

        {/* BUSCADOR INTELIGENTE */}
        <div className="relative max-w-xl mx-auto">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (sugerencias.length > 0) {
                seleccionarSugerencia(sugerencias[0]);
              } else if (busqueda.trim() !== "") {
                seleccionarSugerencia(busqueda);
              }
            }}
            
            className="flex items-center bg-white/95 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border-2 border-transparent p-1.5 transition-all duration-300 focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-600/20"
          >
            <div className="pl-4 text-zinc-400">
              <MapPin className="w-5 h-5" /> 
            </div>
            
            <input 
              type="text" 
              placeholder="¿A dónde vamos? (Ciudad, país, dirección ...)" 
              className="flex-1 px-3 py-2.5 bg-transparent outline-none text-zinc-800 text-base font-semibold placeholder:text-zinc-400"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          
          </form>

          {/* LISTA DE SUGERENCIAS */}
          {sugerencias.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-[100] border border-zinc-100 text-left cursor-pointer">
              {sugerencias.map((sug, index) => {
                const partes = sug.display_name.split(',');
                const ciudad = partes[0];
                const infoExtra = partes.slice(1, 4).join(','); // Región y País

                return (
                  <button
                    key={index}
                    onClick={() => seleccionarSugerencia(sug)}
                    className="w-full px-6 py-4 flex items-center gap-3 hover:bg-zinc-50 border-b border-zinc-50 last:border-0 transition-colors group text-left cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                    <div>
                      <p className="text-sm font-bold text-zinc-900 group-hover:text-zinc-950">
                        {ciudad}
                      </p>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none mt-1">
                        {infoExtra}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTÓN DE VER TODO */}
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