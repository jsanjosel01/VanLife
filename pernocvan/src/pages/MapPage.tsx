import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// CONFIGURACIÓN DE ICONOS 
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { supabase } from '../database/supabase/client';
import { useAuthStore } from '../store/useAuthStore';


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
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


  const mapRef = useRef<any>(null);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [puntos, setPuntos] = useState<any[]>([]);
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]); 
  const [mensajeFlotante, setMensajeFlotante] = useState("");

  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [viewMode, setViewMode] = useState('preview'); 

  const [isWritingComment, setIsWritingComment] = useState(false);

  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");


  useEffect(() => {
  fetchComentarios();
}, []);


  // 2. Función para cargar los comentarios
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
  

  // función que gestiona el clic
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

  const mostrarNotificacion = (mensaje: string) => {
    setMensajeFlotante(mensaje);
    setTimeout(() => setMensajeFlotante(""), 4500);
  };

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






  return (
    <div className="relative h-screen w-full bg-zinc-100 overflow-hidden font-sans">
      
      {/* BUSCADOR + BOTÓN AFINAR  */}
      <div className="fixed top-40 left-10 z-[50] flex flex-col gap-3 w-[340px] pointer-events-auto">
        <form onSubmit={buscarCiudad} className="bg-white rounded-full px-6 py-4 flex items-center shadow-lg border border-zinc-100">
          <input 
            type="text" placeholder="¿A dónde vamos?" 
            className="flex-1 outline-none text-base bg-transparent font-medium" 
            value={textoBusqueda} onChange={(e) => setTextoBusqueda(e.target.value)} 
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
          <div className="bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-200 border border-zinc-100">
            <div className="p-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Tipos de lugar</h3>
              <div className="flex flex-col gap-1.5">
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

            <div className="p-4 bg-white border-t border-zinc-50">
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

      {cargando && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3000] bg-white/95 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-zinc-100">
          <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-[10px] uppercase">Buscando lugares...</p>
        </div>
      )}



      
      {/* MAPA CON PINTADO DINÁMICO */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={[38.878, -6.970]} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Fondo oscuro con desenfoque */}
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setSelectedPoint(null)} />

      {/* --- VISTA PREVIEW --- */}
      {viewMode === 'preview' ? (
        <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-6 animate-in zoom-in-95 duration-300">
          <button onClick={() => setSelectedPoint(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
          <h2 className="text-xl font-black text-zinc-900 pr-8 leading-tight">{selectedPoint.nombre}</h2>
          <p className="inline-block bg-zinc-100 text-zinc-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2 mb-6">
            {selectedPoint.tipo}
          </p>
          <button 
            onClick={() => setViewMode('full')}
            className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all"
          >
            Ver ficha
          </button>
        </div>

      ) : (

        /* VISTA FULL */
        <div className="relative bg-white w-full max-w-5xl rounded-[32px] shadow-2xl animate-in slide-in-from-bottom-8 duration-300 h-[85vh] flex flex-col md:flex-row overflow-hidden border border-zinc-100">
          
          <button onClick={() => setSelectedPoint(null)} className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-all">✕</button>

          {/* COLUMNA IZQUIERDA: Info detallada */}
          <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white">
            
            <div className="text-[10px] text-zinc-400 mb-4 font-medium uppercase tracking-wider">
              Inicio &gt; {selectedPoint.tipo} &gt; {selectedPoint.nombre}
            </div>

          <h1 className="text-3xl font-black text-zinc-950 mb-2 leading-tight">{selectedPoint.nombre}</h1>
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">3,0/5</span>
            <span className="text-zinc-400 text-xs">· 1 comentario</span>
          </div>
          
          {selectedPoint.descripcion && (
            <div className="mb-8">
              <h3 className="font-bold text-zinc-900 mb-2">Descripción</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">{selectedPoint.descripcion}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 mb-8">
            {selectedPoint.web && <a href={selectedPoint.web} target="_blank" rel="noreferrer" className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-bold text-sm text-center hover:bg-zinc-800 transition-colors">Web</a>}
            {selectedPoint.telefono && <a href={`tel:${selectedPoint.telefono}`} className="flex-1 bg-zinc-100 text-zinc-900 py-3 rounded-xl font-bold text-sm text-center hover:bg-zinc-200 transition-colors">Llamar</a>}
          </div>

          {/* Ubicación y GPS */}
          <div className="mb-8 space-y-2 text-sm text-zinc-600">
            <p className="font-medium">{selectedPoint.direccion || "Dirección no disponible"}</p>
            <div className="bg-zinc-50 p-3 rounded-lg font-mono text-xs border border-zinc-100">
              <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Coordenadas GPS</p>
              {selectedPoint.lat.toFixed(6)}, {selectedPoint.lon.toFixed(6)}
            </div>
          </div>

          {/* Servicios Dinámicos */}
          <div className="mb-8">
            <h3 className="font-bold text-zinc-900 mb-4 uppercase text-xs tracking-wider">Servicios encontrados</h3>
            <div className="flex flex-wrap gap-2">
              {getServicios(selectedPoint.tags || {}).length > 0 ? (
                getServicios(selectedPoint.tags || {}).map((serv) => (
                  <span key={serv} className="bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-700">
                    ✓ {serv}
                  </span>
                ))
              ) : (
                <p className="text-xs text-zinc-400 italic">No hay servicios registrados.</p>
              )}
            </div>
          </div>

          {/* Opiniones: Sección Opiniones */}
          <div className="mt-8 border-t border-zinc-100 pt-8">
            <h3 className="font-black text-zinc-900 mb-6 uppercase text-xs tracking-widest">Opiniones</h3>
                
            {isWritingComment ? (
                <div className="animate-in slide-in-from-bottom-2 duration-300">
                  <textarea 
                      className="w-full p-4 border border-zinc-200 rounded-xl mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      placeholder="Escribe tu opinión aquí..."
                      rows={3}
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                    />
                    <div className="flex gap-2">

                      {/* LLAMADA A SUPABASE */}
                      <button onClick={handleEnviarComentario} className="bg-zinc-900 text-white font-bold text-xs px-6 py-3 rounded-lg hover:bg-zinc-800">
                        Enviar comentario
                      </button>
                      <button onClick={() => setIsWritingComment(false)} className="text-zinc-500 font-bold text-xs px-4 py-3 hover:text-zinc-900">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 text-center">
                    <p className="text-sm text-zinc-500 mb-4">{comentarios.length === 0 ? "Todavía no hay opiniones." : "Comparte tu opinión."}</p>
                    <button onClick={handleComentar} className="bg-zinc-900 text-white font-bold text-xs px-6 py-3 rounded-lg hover:bg-zinc-800">
                      Sé el primero en valorar
                    </button>
                  </div>
                )}

                {/* Lista de comentarios */}
                <div className="space-y-4 mt-6">
                  {comentarios.map((c) => (
                    <div key={c.id} className="p-4 border border-zinc-100 rounded-xl bg-white shadow-sm">
                      <p className="text-sm text-zinc-800">{c.contenido}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        

        {/* COLUMNA DERECHA: Mapa Vivo */}
        <div className="w-full md:w-1/2 h-64 md:h-full bg-zinc-100 z-10 relative">
          <MapContainer 
            key={`${selectedPoint.lat}-${selectedPoint.lon}`} 
            center={[selectedPoint.lat, selectedPoint.lon]} 
            zoom={16} 
            style={{ height: '100%', width: '100%' }}
          >
            <ResizeMap /> 
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[selectedPoint.lat, selectedPoint.lon]} />
          </MapContainer>
        </div>
      </div>
    )}
  </div>
)}

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