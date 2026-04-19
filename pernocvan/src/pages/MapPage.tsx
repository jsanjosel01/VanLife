import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// CONFIGURACIÓN DE ICONOS 
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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

export const MapPage = () => {
  const mapRef = useRef<any>(null);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [puntos, setPuntos] = useState<any[]>([]);
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]); 
  const [mensajeFlotante, setMensajeFlotante] = useState("");

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
        tipo: tipoAsignado
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

  return (
    <div className="relative h-screen w-full bg-zinc-100 overflow-hidden font-sans">
      
      {/* BUSCADOR + BOTÓN AFINAR  */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-3 w-[340px] pointer-events-auto">
        <form onSubmit={buscarCiudad} className="bg-white rounded-full px-6 py-4 flex items-center shadow-lg border border-zinc-100">
          <input 
            type="text" placeholder="¿A dónde vamos?" 
            className="flex-1 outline-none text-base bg-transparent font-medium" 
            value={textoBusqueda} onChange={(e) => setTextoBusqueda(e.target.value)} 
          />
          <button type="submit" className="text-zinc-400">🔍</button>
        </form>
        
        <button 
          onClick={() => setMostrarFiltros(!mostrarFiltros)} 
          className="bg-white rounded-full px-6 py-4 flex items-center justify-between shadow-lg text-zinc-800 font-bold hover:bg-zinc-50 transition-all"
        >
          <span>Afinar la búsqueda</span>
          <span className={`transition-transform duration-300 ${mostrarFiltros ? 'rotate-180' : ''}`}>⚙️</span>
        </button>

        {/* MODAL COMPACTO ALINEADO */}
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
             // Buscamos la configuración del filtro para saber el color y el icono
             const config = tiposLugar.find(t => t.id === p.tipo) || tiposLugar[0];
             return (
              <Marker key={p.id} position={[p.lat, p.lon]} icon={L.divIcon({
                className: '',
                html: `<div class="flex items-center justify-center w-8 h-8 rounded-full ${config.color} text-white shadow-lg border-2 border-white text-base">${config.icono}</div>`,
                iconSize: [32, 32], iconAnchor: [16, 16]
              })}>
                <Popup><div className="font-black text-zinc-900 text-xs">{p.nombre}</div></Popup>
              </Marker>
             );
          })}
        </MapContainer>
      </div>
    </div>
  );
};