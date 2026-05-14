import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';

// CONFIGURACIÓN DE ICONOS 
import { supabase } from '../database/supabase/client';
import { useAuthStore } from '../store/useAuthStore';
import { useSearchParams } from 'react-router-dom';
import { MapIcon, Minus, Plus, Satellite } from 'lucide-react';

// Función para capitalizar cada palabra (Ej: "LISBOA, PORTUGAL" -> "Lisboa, Portugal")
const capitalizar = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// TIPOS DE LUGAR (Definimos colores y queries)
const tiposLugar = [
  { id: 'area_ac', icono: '🚐', nombre: 'Área AC', color: 'bg-zinc-900', query: 'node["amenity"="motorhome_stopover"]; way["amenity"="motorhome_stopover"]; node["tourism"="caravan_site"]; way["tourism"="caravan_site"];' },
  { id: 'camping', icono: '🏕️', nombre: 'Camping', color: 'bg-green-600', query: 'node["tourism"="camp_site"]; way["tourism"="camp_site"];' },
  { id: 'parking', icono: '🅿️', nombre: 'Parking', color: 'bg-blue-600', query: 'node["amenity"="parking"]; way["amenity"="parking"];' }, 
  { id: 'gasolinera', icono: '⛽', nombre: 'Gasolinera', color: 'bg-red-600', query: 'node["amenity"="fuel"]; way["amenity"="fuel"];' },
  { id: 'spot', icono: '🌲', nombre: 'Naturaleza', color: 'bg-emerald-700', query: 'node["leisure"="park"]; way["leisure"="park"]; node["leisure"="garden"]; way["leisure"="garden"]; node["tourism"="viewpoint"];' },
  { id: 'privado', icono: '🏡', nombre: 'Privado', color: 'bg-purple-600', query: 'node["leisure"="garden"];' },
];

// FUNCION PARA EL TAMAÑO DEL MAPA
function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    // Damos un poco de tiempo
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// FUNCIÓN "TRADUCTORA" DE SERVICIOS (Basada en las etiquetas OSM)
const getServicios = (tags: any) => {
  const servicios = [];
  if (tags.amenity === 'waste_basket') servicios.push('Basura');
  if (tags.amenity === 'drinking_water') servicios.push('Agua');
  if (tags.amenity === 'parking') servicios.push('Parking');
  if (tags.tourism === 'camp_site' || tags.amenity === 'motorhome_stopover') servicios.push('Dormir');
  return servicios;
};


export const MapPage = () => {
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Parámetros de URL y Referencias
  const [searchParams] = useSearchParams();
  const locationParam = searchParams.get('location');
  const mapRef = useRef<any>(null);

  // Estados de Ubicación y Mapa
  const [posicionMapa, setPosicionMapa] = useState<[number, number]>([40.4167, -3.70325]); // Centro de España por defecto
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [puntos, setPuntos] = useState<any[]>([]);
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]); 
  const [mensajeFlotante, setMensajeFlotante] = useState("");

  // Estados de Detalle y Comentarios
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [viewMode, setViewMode] = useState('preview'); 
  const [isWritingComment, setIsWritingComment] = useState(false);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");

  // Estado para el modo de mapa (calle o satélite)
  const [modoMapa, setModoMapa] = useState<'calle' | 'satelite'>('calle');

  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarListaSugerencias, setMostrarListaSugerencias] = useState(false);

  

  // 1) Obtener ubicación GPS del usuario al entrar
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nuevaPos: [number, number] = [latitude, longitude];
          setPosicionMapa(nuevaPos);
          
          // Solo centramos el mapa en el GPS si NO venimos buscando algo del Hero
          if (!locationParam && mapRef.current) {
            mapRef.current.setView(nuevaPos, 13);
          }
        },
        (error) => {
          console.log("El usuario denegó el GPS o hubo un error.");
        }
      );
    }
  }, [locationParam]);


  //  2) Vuelo inmersivo si venimos desde el buscador del Hero
  useEffect(() => {
    // Si no hay ciudad en la URL, no hacemos nada
    if (!locationParam) return;

    setTextoBusqueda(locationParam);

    const irALaCiudad = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationParam)}`
        );
        const data = await res.json();
        
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const destino: [number, number] = [parseFloat(lat), parseFloat(lon)];

          // Usamos un intervalo pequeño para comprobar si mapRef.current ya existe
          const checkMapReady = setInterval(() => {
            if (mapRef.current) {
              // Una vez que el mapa existe, volamos
              mapRef.current.flyTo(destino, 14, {
                duration: 3, // Un pelín más lento para que se aprecie el viaje
                animate: true
              });
              clearInterval(checkMapReady); // Paramos de comprobar
            }
          }, 100);

          // Seguridad: Si en 5 segundos no ha volado, limpiamos el intervalo
          setTimeout(() => clearInterval(checkMapReady), 5000);
        }
      } catch (error) {
        console.error("Error en el vuelo:", error);
      }
    };

    irALaCiudad();
  }, [locationParam]); // Solo cuando cambie la ciudad en la URL

  // 3) Cargar comentarios de Supabase
  useEffect(() => {
    fetchComentarios();
  }, []);

  useEffect(() => {
  const buscarSugerencias = async () => {
    if (textoBusqueda.length < 3) {
      setSugerencias([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusqueda)}&limit=5`);
      const data = await res.json();
      setSugerencias(data);
    } catch (e) {
      console.error("Error buscando sugerencias", e);
    }
  };

  

  const timeoutId = setTimeout(buscarSugerencias, 300); // Esperamos un poco para no saturar la API
  return () => clearTimeout(timeoutId);
}, [textoBusqueda]);



  // Función para cargar los comentarios
const fetchComentarios = async () => {
  const { data, error } = await supabase
    .from('comentarios')
    .select('*') // Podrías añadir nombres de usuario aquí después
    .order('created_at', { ascending: false });

  if (error) console.error("Error al cargar:", error);
  else setComentarios(data || []);
};


const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) return; // No enviar vacío

    const { error } = await supabase
      .from('comentarios')
      .insert([{ contenido: nuevoComentario }]);

    if (error) {
      console.error("Error al publicar:", error);
      mostrarNotificacion("❌ Error al publicar.");
    } else {
      mostrarNotificacion("✅ ¡Comentario publicado!");
      setNuevoComentario(""); // Limpiar el input
      setIsWritingComment(false); // Cerrar el formulario
      fetchComentarios(); // Refrescar la lista automáticamente
    }
  };
  

  // función que gestiona el clicK
const handleComentar = () => {
  // Antes decía !isLoggedIn, ahora debe decir !isAuthenticated
  if (!isAuthenticated) { 
    mostrarNotificacion("⚠️ Debes estar registrado para poder opinar.");
  } else {
    setIsWritingComment(true); 
  }
};

  useEffect(() => {
  if (selectedPoint) {
    setViewMode('preview');
  }
}, [selectedPoint]);// Puede ser 'preview' o 'full'

  {/* Función para mostrar notificaciones temporales */}
  const mostrarNotificacion = (mensaje: string) => {
    setMensajeFlotante(mensaje);
    setTimeout(() => setMensajeFlotante(""), 4500);
  };

  {/* Función para buscar la ciudad usando Nominatim y volar el mapa */}
  const buscarCiudad = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textoBusqueda.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusqueda + ", España")}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        if (mapRef.current) {
          mapRef.current.flyTo([parseFloat(lat), parseFloat(lon)], 14);
          if (filtrosActivos.length > 0) setTimeout(() => ejecutarBusquedaSitios(true), 1500);
        }
      }
    } catch (error) { mostrarNotificacion("Error de búsqueda."); }
  };

  { /* Función para ejecutar la búsqueda de sitios */ }
  const ejecutarBusquedaSitios = async (desdeBuscador = false) => {
    if (!desdeBuscador) setMostrarFiltros(false);
    const map = mapRef.current;
    if (!map || filtrosActivos.length === 0) {
      setPuntos([]);
      return;
    }
    
    setCargando(true);
    const bounds = map.getBounds();
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
    
    // Construimos la query combinando todos los filtros seleccionados
    let queryBody = "";
    filtrosActivos.forEach(id => {
      const filtro = tiposLugar.find(f => f.id === id);
      if (filtro) {
        const partes = filtro.query.split(';').filter(p => p.trim() !== "");
        partes.forEach(p => { queryBody += `${p}(${bbox});`; });
      }
    });

    { /* Si no hay filtros activos, no hacemos la consulta */ }
    const query = `[out:json][timeout:25];(${queryBody});out center;`;
    const url = `https://lz4.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const nuevosPuntos = data.elements.filter((el: any) => el.lat || el.center).map((el: any) => {
      const tags = el.tags || {};
      let tipoAsignado = '';

      // 1. PRIORIDAD MÁXIMA: Si es gasolinera, que sea roja.
      if (tags.amenity === 'fuel') {
        tipoAsignado = 'gasolinera';
      } 
      // 2. Si es un parque o jardín
      else if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.tourism === 'viewpoint') {
        tipoAsignado = 'spot';
      } 
      // 3. Si es aparcamiento
      else if (tags.amenity === 'parking') {
        tipoAsignado = 'parking';
      } 
      // 4. Si es camping
      else if (tags.tourism === 'camp_site') {
        tipoAsignado = 'camping';
      } 
      // 5. Si es área AC
      else if (tags.amenity === 'motorhome_stopover' || tags.tourism === 'caravan_site') {
        tipoAsignado = 'area_ac';
      } 
      else {
        tipoAsignado = 'spot'; // Por defecto
      }


      return {
        id: el.id,
        lat: el.lat || el.center.lat,
        lon: el.lon || el.center.lon,
        nombre: tags.name || (tiposLugar.find(t => t.id === tipoAsignado)?.nombre || "Lugar"),
        tipo: tipoAsignado,
        telefono: tags.phone,
        web: tags.website,
        descripcion: tags.description || tags["description:es"] || tags.note,
        tags: tags,

        direccion: [
        tags["addr:housenumber"],
        tags["addr:street"],
        tags["addr:postcode"],
        tags["addr:city"]
      ].filter(Boolean).join(", ")

      };
      
}); 


      setPuntos(nuevosPuntos);
    } catch (error) {
      mostrarNotificacion("Error al cargar los puntos.");
    } finally {
      setCargando(false);
    }
  };

  { /* Función para alternar filtros visualmente */ }
  const toggleFiltroVisual = (id: string) => {
    setFiltrosActivos(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si el panel existe y el clic está FUERA del panel
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPuntos([]); // Limpiamos los puntos
        setMostrarFiltros(false); // Cerramos los filtros
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // Definimos las capas
    const capas = {
      calle: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      satelite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    };

    {/* BOTONES ZOOM */}
    function CapturadorDeMapa({ setMapa }: { setMapa: (map: any) => void }) {
      const map = useMap(); // Hook oficial de Leaflet
      useEffect(() => {
        if (map) setMapa(map);
      }, [map, setMapa]);
      return null;
    }



  return (
    <div className="relative h-screen w-full bg-zinc-100 overflow-hidden font-sans">
      
      {/* BUSCADOR + BOTÓN AFINAR  */}
      <div className="fixed top-40 left-10 z-[50] flex flex-col gap-3 w-[340px] pointer-events-auto">
        
        <form onSubmit={buscarCiudad} className="bg-white rounded-full px-6 py-4 flex items-center shadow-lg border border-zinc-100">
          <input 
            type="text" placeholder="¿A dónde vamos?" 
            className="flex-1 outline-none text-base bg-transparent font-medium" 
            value={textoBusqueda} 
            onChange={(e) => setTextoBusqueda(capitalizar(e.target.value))}
          />
          <button type="submit" className="text-zinc-400">🔍</button>
        </form>
        
        {/* BOTÓN PARA MOSTRAR LOS FILTROS */}
        <button 
          onClick={() => setMostrarFiltros(!mostrarFiltros)} 
          className="bg-white rounded-full px-6 py-4 flex items-center justify-between shadow-lg text-zinc-800 font-bold hover:bg-zinc-50 transition-all"
        >
          <span>Afinar la búsqueda</span>
          <span className={`transition-transform duration-300 ${mostrarFiltros ? 'rotate-180' : ''}`}>⚙️</span>
        </button>

        {/* MODAL FILTROS */}
        {mostrarFiltros && (
          <div 
            ref={panelRef} 
            className="bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-200 border border-zinc-100"
            style={{ maxHeight: 'calc(100vh - 280px)' }}
          >
            {/*  SCROLL INTERNO */}
            <div className="p-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar"> 
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                Tipos de lugar
              </h3>
              <div className="flex flex-col gap-1.5 pb-2">
                {tiposLugar.map(f => (
                  <label key={f.id} className={`cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${filtrosActivos.includes(f.id) ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'}`}>
                    <input type="checkbox" className="hidden" checked={filtrosActivos.includes(f.id)} onChange={() => toggleFiltroVisual(f.id)} />
                    <span className="text-lg">{f.icono}</span>
                    <span className="flex-1 font-bold text-zinc-700 text-xs tracking-tight">{f.nombre}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${filtrosActivos.includes(f.id) ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300'}`}>
                      {filtrosActivos.includes(f.id) && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* BOTÓN FIJO ABAJO */}
            <div className="p-4 bg-white border-t border-zinc-100 mt-auto shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <button 
                onClick={() => ejecutarBusquedaSitios()}
                className="w-full bg-[#e03b4b] hover:bg-red-600 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-95"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}


      {/* LISTA DE RESULTADOS (Solo aparece si hay puntos) */}
      {puntos.length > 0 && (
        <div className="relative flex-1 overflow-y-auto mt-4 border-t border-zinc-100 pt-4 max-h-[50vh] bg-zinc-50 rounded-b-3xl p-4">
          
          {/* Botón X para cerrar la lista */}
          <button
            onClick={() => setPuntos([])}
            className="absolute top-2 right-2 z-10 bg-zinc-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-lg hover:bg-zinc-700 transition-colors active:scale-90"
          >
            ✕
          </button>

          <div className="flex flex-col gap-3">
            {puntos.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.flyTo([p.lat, p.lon], 15);
                  }
                }}
                className="text-left bg-white p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 transition-all shadow-sm w-full group"
              >
                <p className="font-bold text-sm">{capitalizar(p.nombre)} </p>
                <p className="font-bold text-sm text-zinc-900 group-hover:text-[#e03b4b] transition-colors">
                  {p.nombre}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase font-black mt-0.5 tracking-wider">
                  {p.tipo}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      </div>
      {/* Cargando, mensaje */}
      {cargando && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3000] bg-white/95 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-zinc-100">
          <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-[10px] uppercase">Buscando lugares...</p>
        </div>
      )}

      {/* MAPA CON PINTADO DINÁMICO */}
      <div className="absolute inset-0 z-0">

        <MapContainer 
          center={posicionMapa} 
          zoom={13} 
          ref={mapRef} 
          style={{ height: '100%', width: '100%' }} 
          zoomControl={false}

        >

          <TileLayer 
            url={modoMapa === 'calle' 
              ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
              : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            } 
          />

          {puntos.map(p => {
            const config = tiposLugar.find(t => t.id === p.tipo) || tiposLugar[0];
            return (
              <Marker 
                key={p.id} 
                position={[p.lat, p.lon]} 
                eventHandlers={{
                  click: () => setSelectedPoint(p),
                }}
                icon={L.divIcon({
                  className: '',
                  html: `<div class="flex items-center justify-center w-8 h-8 rounded-full ${config.color} text-white shadow-lg border-2 border-white text-base">${config.icono}</div>`,
                  iconSize: [32, 32], 
                  iconAnchor: [16, 16]
                })}
              />
            );
          })}
        </MapContainer>
      </div>

    {/* MODAL DE INFORMACIÓN */}
    {selectedPoint && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        
        <div 
          className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" 
          onClick={() => setSelectedPoint(null)} 
        />

        {/* Contenedor */}
        <div 
          className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row border border-zinc-100"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/*  PARTE IZQUIERDA: INFORMACIÓN */}
          <div className="flex-1 p-8 flex flex-col justify-between">

            {/* BOTÓN CIERRE (Cruz en la esquina superior) */}
            <button 
              onClick={() => setSelectedPoint(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all z-20 cursor-pointer"
            >
              <span className="text-xl font-light">✕</span>
            </button>

            <div>
                <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-zinc-950 uppercase tracking-[0.2em]">
                  VanLife
                </span>
                <span className="text-zinc-300">|</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {selectedPoint.tipo}
                </span>
              </div>

              <div className="space-y-4">
                {/* Título Principal con Corazón de Favorito */}
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h2 className="text-2xl font-black text-zinc-950">
                    {capitalizar(selectedPoint.nombre)}
                  </h2>
                  <button className="text-zinc-300 hover:text-[#e03b4b] transition-colors shrink-0 text-2xl">
                    ♥
                  </button>
                </div>

                {/* Estrellas ficticias para que la ficha no se vea "vacía" */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-[#e03b4b] text-sm">★★★★★</div>
                  <span className="text-[10px] font-bold text-zinc-400">4.5</span>
                </div>

                <div className="space-y-6">
                  {/* Ubicación Estilizada */}

                      {selectedPoint.direccion && 

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100">
                      <span className="text-xs">📍</span>
                    </div>
                  </div>
                  }

                  {/* Enlaces dinámicos: Solo aparecen si hay información */}
                  {(selectedPoint.web || selectedPoint.telefono) && (
                    <div className="flex gap-4 pt-2">
                      {selectedPoint.web && (
                        <a href={selectedPoint.web} target="_blank" rel="noreferrer" className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-bold text-[10px] uppercase text-center tracking-widest hover:bg-zinc-800 transition-all">
                          Sitio Web
                        </a>
                      )}
                      {selectedPoint.telefono && (
                        <a href={`tel:${selectedPoint.telefono}`} className="flex-1 bg-zinc-100 text-zinc-900 py-3 rounded-xl font-bold text-[10px] uppercase text-center tracking-widest hover:bg-zinc-200 transition-all">
                          Llamar
                        </a>
                      )}
                    </div>
                  )}

                  {/* Coordenadas Técnicas al pie */}
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-400 uppercase">Latitud</span>
                        <span className="text-[11px] font-mono font-bold text-zinc-800">{selectedPoint.lat.toFixed(6)}</span>
                      </div>
                      <div className="w-px h-6 bg-zinc-200"></div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-400 uppercase">Longitud</span>
                        <span className="text-[11px] font-mono font-bold text-zinc-800">{selectedPoint.lon.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 2. PARTE DERECHA: IMAGEN / ICONO GIGANTE */}
          <div className="w-full md:w-64 bg-zinc-50 flex items-center justify-center relative overflow-hidden border-l border-zinc-100 shrink-0">
            {/* Imagen de fondo opcional (Unsplash dinámico) */}
            <img 
              src={`https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=60&w=400`} 
              className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
              alt="background"
            />
            
            {/* Icono central grande */}
            <div className="relative z-10 text-7xl filter drop-shadow-2xl">
              {tiposLugar.find(t => t.id === selectedPoint.tipo)?.icono || "📍"}
            </div>

            {/* Cierre en la esquina superior para la versión móvil */}
            <button 
              onClick={() => setSelectedPoint(null)}
              className="absolute top-4 right-4 z-20 md:hidden bg-white/80 p-2 rounded-full text-zinc-600"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    )}


    {/* SELECTOR DE CAPA Y ZOOM (Derecha) */}
    <div className="fixed top-40 right-10 z-[50] flex flex-col gap-5 pointer-events-auto">
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => setModoMapa('calle')}
          className={`w-14 h-14 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all border-2 ${
            modoMapa === 'calle' 
            ? 'border-zinc-900 bg-white text-zinc-900 scale-105' 
            : 'border-transparent bg-white/90 text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <MapIcon size={20} strokeWidth={2.5} />
          <span className="text-[7px] font-black uppercase mt-1 tracking-tighter">Mapa</span>
        </button>

        <button 
          onClick={() => setModoMapa('satelite')}
          className={`w-14 h-14 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all border-2 ${
            modoMapa === 'satelite' 
            ? 'border-zinc-900 bg-white text-zinc-900 scale-105' 
            : 'border-transparent bg-white/90 text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Satellite size={20} strokeWidth={2.5} />
          <span className="text-[7px] font-black uppercase mt-1 tracking-tighter">Satélite</span>
        </button>
      </div>

      {/* Bloque Zoom */}
      <div className="flex flex-col shadow-xl rounded-2xl overflow-hidden border border-zinc-100 bg-white/90">
        <button 
          onClick={() => mapRef.current?.zoomIn()}
          className="w-14 h-12 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-white transition-colors border-b border-zinc-100 active:bg-zinc-50"
        >
          <Plus size={18} strokeWidth={3} />
        </button>
        <button 
          onClick={() => mapRef.current?.zoomOut()}
          className="w-14 h-12 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-white transition-colors active:bg-zinc-50"
        >
          <Minus size={18} strokeWidth={3} />
        </button>
      </div>
    </div>


      {/* TOAST DE NOTIFICACIÓN */}
      {mensajeFlotante && (
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-zinc-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-zinc-700">
              
            <p className="font-bold text-sm">{mensajeFlotante}</p>
            <button onClick={() => setMensajeFlotante("")} className="ml-2 text-zinc-400 hover:text-white">✕</button>
          </div>
        </div>
      )}

  </div>
  );

  
};