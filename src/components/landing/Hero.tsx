
import { Compass, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


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
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[3px]" />
    </div>

    <div className="relative z-10 w-full max-w-2xl px-6 text-center">
      {/* TÍTULO AJUSTADO */}
      {/* TÍTULO AJUSTADO PARA MÓVIL Y DESKTOP */}
      {/* Añadimos leading-[1.1] en móvil para que respire, y md:leading-[0.9] en ordenador */}
      <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter leading-[1.1] md:leading-[0.9] drop-shadow-2xl">
        
        {/* Usamos "block" en móvil para que cada palabra sea una fila perfecta */}
        <span className="block md:inline">TU VIAJE</span> 
        <br className="hidden md:block" />
        
        <span className="block md:inline">EMPIEZA</span> 
        <br className="hidden md:block" />
        
        {/* Caja blanca */}
        <span className="text-zinc-950 bg-white py-1 md:py-2 px-6 rounded-xl md:rounded-2xl inline-block shadow-2xl mt-4 md:mt-5">
          AQUÍ
        </span>
      </h2>
      
      <p className="text-lg md:text-xl text-zinc-200 mb-5 font-medium opacity-90 max-w-[280px] sm:max-w-none mx-auto md:mx-0">
        Encuentra todo lo necesario para disfrutar del camino.
      </p>

    

      {/* BUSCADOR INTELIGENTE */}
      <div className="relative w-full">
        <form 
          onSubmit={(e) => { e.preventDefault(); if (sugerencias.length > 0) seleccionarSugerencia(sugerencias[0]); }}
          className="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden p-2 transition-all duration-300 focus-within:ring-4 focus-within:ring-white/20 border border-white/10"
        >
          <div className="pl-3 text-zinc-400"> <MapPin className="w-5 h-5" /></div>
          
          <input 
            type="text" 
            placeholder="¿A dónde vamos?..." 
            className="flex-1 px-3 py-4 bg-transparent outline-none text-zinc-900 text-[16px] font-bold placeholder:text-zinc-400"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </form>

        {/* LISTA DE SUGERENCIAS */}
        {sugerencias.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-[100] border border-zinc-100 text-left">
            {sugerencias.map((sug, index) => (
              <button
                key={index}
                onClick={() => seleccionarSugerencia(sug)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-zinc-50 border-b border-zinc-50 last:border-0 transition-colors group text-left cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-zinc-400 group-hover:text-[#e03b4b] transition-colors" />
                <div>
                  <p className="text-sm font-bold text-zinc-900">{sug.display_name.split(',')[0]}</p>
                  <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{sug.display_name.split(',').slice(1, 3).join(',')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* BOTÓN */}
      <div className="mt-12">
        <button 
          onClick={() => navigate('/mapa')}
          className="group inline-flex items-center gap-2 bg-black/30 hover:bg-white text-white hover:text-black border border-white/20 px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
        >
          <Compass className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
          Ver todos los puntos
        </button>
      </div>
    </div>
  </section>

  );
};