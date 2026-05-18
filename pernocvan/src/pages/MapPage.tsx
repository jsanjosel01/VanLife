import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';

// CONFIGURACIÓN DE ICONOS 
import { supabase } from '../database/supabase/client';
import { useAuthStore } from '../store/useAuthStore';
import { useSearchParams, useNavigate  } from 'react-router-dom';
import { LocateFixed, MapIcon, MapPin, Minus, Plus, Satellite, Search, Settings2, X } from 'lucide-react';


// Función para capitalizar 
const capitalizar = (str: string) => {
  if (!str) return "";
  
  return str
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
};

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


// TIPOS DE LUGAR (Definimos colores y queries)
const tiposLugar = [
  // Sección 1: Lugares principales
  { id: 'area_ac', icono: '🚐', nombre: 'Área AC', color: 'bg-zinc-900', seccion: 'principal', query: 'node["amenity"="motorhome_stopover"]; way["amenity"="motorhome_stopover"]; node["tourism"="caravan_site"]; way["tourism"="caravan_site"];' },
  { id: 'camping', icono: '🏕️', nombre: 'Camping', color: 'bg-green-600', seccion: 'principal', query: 'node["tourism"="camp_site"]; way["tourism"="camp_site"];' },
  { id: 'parking', icono: '🅿️', nombre: 'Parking', color: 'bg-blue-600', seccion: 'principal', query: 'node["amenity"="parking"]; way["amenity"="parking"];' }, 
  { id: 'gasolinera', icono: '⛽', nombre: 'Gasolinera', color: 'bg-red-600', seccion: 'principal', query: 'node["amenity"="fuel"]; way["amenity"="fuel"];' },
  { id: 'spot', icono: '🌲', nombre: 'Naturaleza', color: 'bg-emerald-700', seccion: 'principal', query: 'node["leisure"="park"]; way["leisure"="park"]; node["leisure"="garden"]; way["leisure"="garden"]; node["tourism"="viewpoint"];' },
  
  // Sección 2: Servicios adicionales
  { id: 'servicio_agua', icono: '💧', nombre: 'Agua Potable', color: 'bg-sky-600', seccion: 'servicio', query: 'node["amenity"="drinking_water"];' },
  { id: 'servicio_ducha', icono: '🚿', nombre: 'Duchas', color: 'bg-cyan-500', seccion: 'servicio', query: 'node["amenity"="shower"]; way["amenity"="shower"];' },
  // { id: 'servicio_electricidad', icono: '⚡', nombre: 'Electricidad', color: 'bg-yellow-500', seccion: 'servicio', query: 'node["power"="outlet"];' },
  { id: 'servicio_wc', icono: '🚻', nombre: 'Baños / WC', color: 'bg-stone-500', seccion: 'servicio', query: 'node["amenity"="toilets"]; way["amenity"="toilets"];' },
  { id: 'servicio_wifi', icono: '📶', nombre: 'Wifi', color: 'bg-indigo-500', seccion: 'servicio', query: 'node["internet_access"="wlan"];' },
  // { id: 'servicio_lavanderia', icono: '🧺', nombre: 'Lavandería', color: 'bg-pink-500', seccion: 'servicio', query: 'node["amenity"="launderette"]; way["amenity"="launderette"]; node["washing_machine"="yes"]; way["washing_machine"="yes"];' },
  { id: 'servicio_picnic', icono: '🪵', nombre: 'Zona de Pícnic', color: 'bg-orange-700', seccion: 'servicio', query: 'node["leisure"="picnic_table"]; way["leisure"="picnic_table"]; node["tourism"="picnic_site"]; way["tourism"="picnic_site"];' },
  { id: 'servicio_basura', icono: '🗑️', nombre: 'Basuras', color: 'bg-teal-600', seccion: 'servicio', query: 'node["amenity"="waste_disposal"]; node["amenity"="waste_basket"];' },
  // { id: 'servicio_vaciado', icono: '🚰', nombre: 'Vaciado de Aguas', color: 'bg-lime-600', seccion: 'servicio', query: 'node["amenity"="sanitary_dump_station"]; way["amenity"="sanitary_dump_station"];' },
  { id: 'servicio_mascotas', icono: '🐾', nombre: 'Admite Mascotas', color: 'bg-amber-700', seccion: 'servicio', query: 'node["dog"="yes"]; way["dog"="yes"];' },
  { id: 'servicio_salud', icono: '🏥', nombre: 'Farmacias y Salud', color: 'bg-rose-600', seccion: 'servicio', query: 'node["amenity"="pharmacy"]; node["amenity"="hospital"];' },
  { id: 'servicio_carga', icono: '🔌', nombre: 'Puntos de Carga EV', color: 'bg-cyan-600', seccion: 'servicio', query: 'node["amenity"="charging_station"]; way["amenity"="charging_station"];' }
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
  const [posicionMapa, setPosicionMapa] = useState<[number, number]>([40.4167, -3.70325]); // Madrid por defecto
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [verMasFiltros, setVerMasFiltros] = useState(false);
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

  // ESTADOS PARA EL PANEL DE RUTA 
  const navigate = useNavigate();
  const [mostrarPanelRuta, setMostrarPanelRuta] = useState(false);
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");

  // RUTAS Estado para almacenar los puntos de la línea de la ruta (Carretera) 
  const [coordenadasRuta, setCoordenadasRuta] = useState<[number, number][]>([]);
  // Guarda si la ruta está registrada y a qué hora (Ej: "14:32")
  const [infoGuardado, setInfoGuardado] = useState<{ registrado: boolean; hora: string }>({ registrado: false, hora: "" });

  //  ESTADOS EXCLUSIVOS PARA EL AUTOCOMPLETADO DE LA RUTA
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState<any[]>([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<any[]>([]);
  const [mostrarSugOrigen, setMostrarSugOrigen] = useState(false);
  const [mostrarSugDestino, setMostrarSugDestino] = useState(false);

  const [rutaPintada, setRutaPintada] = useState(false);

  // FAVORITOS
  const [listaFavoritosIds, setListaFavoritosIds] = useState<string[]>([]);


  // Sincronización de sesión (Rutas y Comentarios dependen de esto)
  useEffect(() => {
  const sincronizarSesion = async () => {
    // Preguntamos a Supabase por la sesión en caché
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Solo actualizamos la propiedad que tu mapa lee: isAuthenticated
      useAuthStore.setState({ isAuthenticated: true });
      
    }

    // Escuchamos cambios de sesión en vivo (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        useAuthStore.setState({ isAuthenticated: true });
      } else {
        useAuthStore.setState({ isAuthenticated: false });
      }
    });

    return () => subscription.unsubscribe();
  };

  sincronizarSesion();
}, []);


// Función para trazar la ruta por carretera usando OSRM
const trazarRutaPorCarretera = async (latOrigen: number, lonOrigen: number, latDestino: number, lonDestino: number) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lonOrigen},${latOrigen};${lonDestino},${latDestino}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      // OSRM devuelve las coordenadas como [longitud, latitud], Leaflet las necesita al revés [latitud, longitud]
      const puntosCarretera = data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
      setCoordenadasRuta(puntosCarretera);

      if (mapRef.current) {
        mapRef.current.fitBounds(puntosCarretera, { padding: [50, 50] });
      }
    } else {
      // Mensaje humanizado
      mostrarNotificacion(" No hemos podido calcular el trayecto por carretera entre estos puntos.");
    }
  } catch (error) {
    console.error(error);
    mostrarNotificacion(" Ha ocurrido un error al conectar con el servidor de rutas.");
  }
};

// Función para procesar el origen y destino, obtener sus coordenadas y trazar la ruta
const procesarYMostrarRuta = async () => {
  // Si el usuario NO está autenticado, cortamos el grifo de raíz
  if (!isAuthenticated) {
    mostrarNotificacion("Debes iniciar sesión para poder planificar y guardar rutas.");
    return; 
  }

  if (!origen.trim() || !destino.trim()) return;

  try {
    // 1. Obtener coordenadas del Origen (forzando España 🇪🇸)
    const resOrigen = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(origen)}&limit=1&countrycodes=es`
    );
    const dataOrigen = await resOrigen.json();

    // 2. Obtener coordenadas del Destino (forzando España 🇪🇸)
    const resDestino = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destino)}&limit=1&countrycodes=es`
    );
    const dataDestino = await resDestino.json();

    if (dataOrigen.length > 0 && dataDestino.length > 0) {
      const latOrg = parseFloat(dataOrigen[0].lat);
      const lonOrg = parseFloat(dataOrigen[0].lon);
      const latDst = parseFloat(dataDestino[0].lat);
      const lonDst = parseFloat(dataDestino[0].lon);

      // Fetch a la API de OSRM para calcular la carretera
      const resRuta = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${lonOrg},${latOrg};${lonDst},${latDst}?overview=full&geometries=geojson`
      );
      const dataRuta = await resRuta.json();

      if (dataRuta.routes && dataRuta.routes.length > 0) {
        // Mapeamos las coordenadas para Leaflet [lat, lon]
        const coordenadas = dataRuta.routes[0].geometry.coordinates.map(
          (coord: number[]) => [coord[1], coord[0]] as [number, number]
        );
        
        setCoordenadasRuta(coordenadas);
        setRutaPintada(true);

        // Hace que el mapa se encuadre y enfoque la ruta
        if (mapRef.current) {
          mapRef.current.fitBounds(coordenadas);
        }
      }
    } else {
      mostrarNotificacion("No se pudieron encontrar las localizaciones en España");
    }
  } catch (error) {
    console.error("Error al procesar la ruta:", error);
    mostrarNotificacion("Hubo un error al calcular la ruta");
  }
};

// Si el usuario cambia el origen o el destino, reiniciamos el botón para que pueda volver a guardar
useEffect(() => {
  setInfoGuardado({ registrado: false, hora: "" });
}, [origen, destino]);


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


  // 2) Vuelo inmersivo si venimos desde el buscador del Hero
  useEffect(() => {
    // Si no hay ciudad en la URL, no hacemos nada
    if (!locationParam)
      return;
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

  
// Esperamos un poco para no saturar la API con cada letra que el usuario escribe
  const timeoutId = setTimeout(buscarSugerencias, 300);
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


// const handleEnviarComentario = async () => {
//     if (!nuevoComentario.trim()) return; // No enviar vacío

//     const { error } = await supabase
//       .from('comentarios')
//       .insert([{ contenido: nuevoComentario }]);

//     if (error) {
//       console.error("Error al publicar:", error);
//       mostrarNotificacion(" Error al publicar.");
//     } else {
//       mostrarNotificacion(" ¡Comentario publicado!");
//       setNuevoComentario(""); // Limpiar el input
//       setIsWritingComment(false); // Cerrar el formulario
//       fetchComentarios(); // Refrescar la lista automáticamente
//     }
//   };
  

  // función que gestiona el clicK
  const handleComentar = () => {
    // Antes decía !isLoggedIn, ahora debe decir !isAuthenticated
    if (!isAuthenticated) { 
      mostrarNotificacion("Debes estar registrado para poder opinar.");
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
      setTimeout(() => setMensajeFlotante(""), 3500);
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

        if (tags.amenity === 'shower') { 
          tipoAsignado = 'servicio_ducha';
        }
        else if (tags.amenity === 'drinking_water') {
          tipoAsignado = 'servicio_agua';
        }
        // else if (tags.power === 'outlet') {
        //   tipoAsignado = 'servicio_electricidad';
        // }
        else if (tags.amenity === 'toilets') {
          tipoAsignado = 'servicio_wc';
        }
        else if (tags.internet_access === 'wlan' || tags.internet_access === 'yes') {
          tipoAsignado = 'servicio_wifi';
        }
        else if (tags.amenity === 'fuel') {
          tipoAsignado = 'gasolinera';
        } 
        else if (tags.amenity === 'parking') {
          tipoAsignado = 'parking';
        } 
        else if (tags.tourism === 'camp_site') {
          tipoAsignado = 'camping';
        } 
        else if (tags.amenity === 'motorhome_stopover' || tags.tourism === 'caravan_site') {
          tipoAsignado = 'area_ac';
        } 
        else if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.tourism === 'viewpoint') {
          tipoAsignado = 'spot';
        } 
        else if (tags.leisure === 'picnic_table' || tags.tourism === 'picnic_site') tipoAsignado = 'servicio_picnic';
        else if (tags.amenity === 'waste_disposal' || tags.amenity === 'waste_basket') tipoAsignado = 'servicio_basura';
        // else if (tags.amenity === 'sanitary_dump_station') tipoAsignado = 'servicio_vaciado';
        else if (tags.dog === 'yes') tipoAsignado = 'servicio_mascotas';

        else if (tags.amenity === 'pharmacy' || tags.amenity === 'hospital') tipoAsignado = 'servicio_salud';
        else if (tags.amenity === 'charging_station') tipoAsignado = 'servicio_carga';
        // else if (tags.amenity === 'launderette') { tipoAsignado = 'servicio_lavanderia';}

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
      console.error("Error al cargar los puntos:", error);
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
  const panelRutaRef = useRef<HTMLDivElement>(null);

  // Función para cerrar paneles al hacer clic fuera de ellos
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    // 1. Control del panel de filtros
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      setPuntos([]); // Limpiamos los puntos
      setMostrarFiltros(false); // Cerramos los filtros
    }

    // 2. Control del panel de Planificar Viaje
    if (panelRutaRef.current && !panelRutaRef.current.contains(event.target as Node)) {
      setMostrarPanelRuta(false); // ...se cierra limpiamente el buscador de rutas
    }
  };
 
  // Añadimos el event listener al montar el componente
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


// Funcion para localizar al usuario usando el GPS del navegador
  const localizarUsuario = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nuevaPos: [number, number] = [position.coords.latitude, position.coords.longitude];
        setPosicionMapa(nuevaPos);
        mapRef.current?.flyTo(nuevaPos, 14);
      },
      (error) => {
        if (error.code === 1) {
          mostrarNotificacion(" Permiso denegado. Actívalo el GPS.");
        }
      }
    );
  }
};

// Función sugerencia de busqueda
const seleccionarSugerenciaBusqueda = (sug: any) => {
  
  const nombreCorto = capitalizar(sug.display_name.split(',')[0]);
  
  // Guardamos el texto en el input y cerramos la lista desplegable
  setTextoBusqueda(nombreCorto);
  setMostrarListaSugerencias(false);

  // Volamos de forma fluida hacia las coordenadas de la ciudad seleccionada
  if (mapRef.current) {
    mapRef.current.flyTo([parseFloat(sug.lat), parseFloat(sug.lon)], 14);
    
    // Si el usuario ya tenía filtros activos (ej: gasolineras), relanzamos la búsqueda automáticamente al llegar
    if (filtrosActivos.length > 0) {
      setTimeout(() => ejecutarBusquedaSitios(true), 1500);
    }
  }
};


useEffect(() => {
  const buscarCiudadesRuta = async () => {
    // 1. Sugerencias para el origen (Salida) + Filtro de España
    if (origen.length >= 3 && mostrarSugOrigen) {
      try {
        // 🇪🇸 Añadimos &countrycodes=es al final de la URL
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(origen)}&limit=4&countrycodes=es`);
        const data = await res.json();
        setSugerenciasOrigen(data);
      } catch (e) { console.error(e); }
    } else if (origen.length < 3) {
      setSugerenciasOrigen([]);
    }

    // 2. Sugerencias para el destino (Llegada) + Filtro de España
    if (destino.length >= 3 && mostrarSugDestino) {
      try {
        // 🇪🇸 Añadimos &countrycodes=es al final de la URL
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destino)}&limit=4&countrycodes=es`);
        const data = await res.json();
        setSugerenciasDestino(data);
      } catch (e) { console.error(e); }
    } else if (destino.length < 3) {
      setSugerenciasDestino([]);
    }
  };

// Esperamos un poco para no saturar la API con cada letra que el usuario escribe
  const delayDebounce = setTimeout(buscarCiudadesRuta, 300);
  return () => clearTimeout(delayDebounce);
}, [origen, destino, mostrarSugOrigen, mostrarSugDestino]);



// FAVORITOS 
useEffect(() => {
  const cargarFavoritosIds = async () => {
    if (!isAuthenticated) {
      setListaFavoritosIds([]);
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('sitios_favoritos')
      .select('sitio_id')
      .eq('user_id', user.id);

    if (data && !error) {
      setListaFavoritosIds(data.map(f => f.sitio_id.toString()));
    }
  };

  cargarFavoritosIds();
}, [isAuthenticated, selectedPoint]);

// Función para alternar el favorito (Añadir/Quitar)
const toggleFavorito = async (sitio: any) => {
  if (!isAuthenticated) {
    mostrarNotificacion("Inicia sesión para guardar tus sitios favoritos.");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const idString = sitio.id.toString();
  const esFavorito = listaFavoritosIds.includes(idString);

  if (esFavorito) {
    // Si ya es favorito, lo borramos
    const { error } = await supabase
      .from('sitios_favoritos')
      .delete()
      .eq('user_id', user.id)
      .eq('sitio_id', idString);

    if (!error) {
      setListaFavoritosIds(prev => prev.filter(id => id !== idString));
      mostrarNotificacion("Sitio eliminado de tus favoritos.");
    }
  } else {
    // Si no es favorito, lo guardamos con todos sus datos básicos
    const { error } = await supabase
      .from('sitios_favoritos')
      .insert({
        user_id: user.id,
        sitio_id: idString,
        nombre: sitio.nombre || "Lugar sin nombre",
        tipo: sitio.tipo,
        lat: sitio.lat,
        lon: sitio.lon,
        direccion: sitio.direccion || null
      });

    if (!error) {
      setListaFavoritosIds(prev => [...prev, idString]);
      mostrarNotificacion("¡Guardado en tus favoritos!");
    } else {
      console.error(error);
    }
  }
};


// Quitar el SCROLL DE LA WEB 
  useEffect(() => {
    // Guardamos cómo estaba el scroll original
    const overflowOriginal = document.body.style.overflow;
    const heightOriginal = document.body.style.height;

    // Forzamos a que la web mida exactamente el monitor y bloquee el scroll
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    // Limpieza: Cuando el usuario se vaya a otra página (Home, Login...), le devolvemos el scroll normal
    return () => {
      document.body.style.overflow = overflowOriginal;
      document.body.style.height = heightOriginal;
    };
  }, []);



  return (
    <div className="relative h-screen w-full bg-zinc-100 overflow-hidden font-sans select-none">
      
    {/* BUSCADOR + BOTÓN AFINAR */}
    <div className="fixed top-40 left-10 z-[50] flex flex-col gap-3 w-[340px] pointer-events-auto max-h-[calc(100vh-180px)] overflow-hidden">
    
      <div className="relative">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (sugerencias.length > 0) {
              seleccionarSugerenciaBusqueda(sugerencias[0]);
            } else {
              buscarCiudad();
            }
          }} 
          className="bg-white rounded-full px-6 py-4 flex items-center shadow-lg border border-zinc-100 transition-all focus-within:border-zinc-300 focus-within:ring-4 focus-within:ring-zinc-600/5 cursor-pointer"
        >
          <input 
            type="text" 
            placeholder="¿A dónde vamos?" 
            className="flex-1 outline-none text-base bg-transparent font-medium text-zinc-800 placeholder:text-zinc-400" 
            value={textoBusqueda} 
            onChange={(e) => setTextoBusqueda(capitalizar(e.target.value))}
            onFocus={() => setMostrarListaSugerencias(true)} 
          />
          
          <button type="submit" className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* LISTA FLOTANTE DE SUGERENCIAS */}
        {mostrarListaSugerencias && sugerencias.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-[100] max-h-52 overflow-y-auto">
            {sugerencias.map((sug, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left px-5 py-3 text-xs hover:bg-zinc-50 border-b border-zinc-50 last:border-0 truncate font-semibold text-zinc-700 flex items-center gap-3 transition-colors cursor-pointer"
                onClick={() => seleccionarSugerenciaBusqueda(sug)} 
              >
                <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{sug.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
        
        {/* BOTÓN PARA MOSTRAR LOS FILTROS */}
        <button 
          onClick={() => setMostrarFiltros(!mostrarFiltros)} 
          className="bg-white rounded-full px-6 py-4 flex items-center justify-between shadow-lg text-zinc-800 font-bold hover:bg-zinc-50 transition-all w-full cursor-pointer"
        >
          <span className="text-sm tracking-tight">Afinar la búsqueda</span>
          
          <Settings2 
            className={`w-4 h-4 text-zinc-600 transition-transform duration-300 cursor-pointer ${
              mostrarFiltros ? 'rotate-180 text-[#e03b4b]' : 'rotate-0'
            }`} 
          />
        </button>

        {/* MODAL FILTROS */}
        {mostrarFiltros && (
          <div 
            ref={panelRef} 
            className="bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-200 border border-zinc-100"
            style={{ maxHeight: 'calc(100vh - 420px)' }}
          >
            {/* SCROLL INTERNO */}
            <div className="p-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar"> 
              
              {/*  TIPOS DE LUGAR PRINCIPALES */}
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                Tipos de lugar
              </h3>
              <div className="flex flex-col gap-1.5 pb-2">
                {tiposLugar.filter(t => t.seccion === 'principal').map(f => (
                  <label 
                    key={f.id} 
                    className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] ${
                      filtrosActivos.includes(f.id) 
                        ? 'border-zinc-900 bg-zinc-50/80 shadow-sm' 
                        : 'border-zinc-100 bg-white hover:border-zinc-200'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={filtrosActivos.includes(f.id)} 
                      onChange={() => toggleFiltroVisual(f.id)} 
                    />
                    
                    <span className="text-xl flex-shrink-0 select-none">{f.icono}</span>
                    <span className="flex-1 font-bold text-zinc-700 text-xs tracking-tight">{f.nombre}</span>
                    
                    {/* Check redondo e interactivo original */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      filtrosActivos.includes(f.id) 
                        ? 'bg-zinc-900 border-zinc-900 scale-110 shadow-sm' 
                        : 'border-zinc-300 bg-white'
                    }`}>
                      {filtrosActivos.includes(f.id) && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-in zoom-in-50 duration-150"></div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              
              {/* SERVICIOS E INSTALACIONES */}
              {verMasFiltros && (
                <div className="flex flex-col gap-1.5 pb-2 animate-in fade-in-50 duration-200">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 mt-2">
                    Servicios e instalaciones
                  </h3>
                  {tiposLugar.filter(t => t.seccion === 'servicio').map(f => (
                    <label 
                      key={f.id} 
                      className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] ${
                        filtrosActivos.includes(f.id) 
                          ? 'border-zinc-900 bg-zinc-50/80 shadow-sm' 
                          : 'border-zinc-100 bg-white hover:border-zinc-200'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={filtrosActivos.includes(f.id)} 
                        onChange={() => toggleFiltroVisual(f.id)} 
                      />
                      
                      <span className="text-xl flex-shrink-0 select-none">{f.icono}</span>
                      <span className="flex-1 font-bold text-zinc-700 text-xs tracking-tight">{f.nombre}</span>
                      
                      {/* Check redondo e interactivo idéntico */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        filtrosActivos.includes(f.id) 
                          ? 'bg-zinc-900 border-zinc-900 scale-110 shadow-sm' 
                          : 'border-zinc-300 bg-white'
                      }`}>
                        {filtrosActivos.includes(f.id) && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-in zoom-in-50 duration-150"></div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

            </div>

            {/* BOTÓN EXPANDIBLE DE SERVICIOS */}
            <div className="flex gap-3 w-[92%] mx-auto my-4">
              
              {/* BOTÓN EXPANDIBLE (+ / -) */}
              <button 
                type="button"
                onClick={() => setVerMasFiltros(!verMasFiltros)}
                className="flex-1 text-center py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-dashed border-zinc-200/70 text-[#e03b4b] hover:text-red-700 rounded-xl cursor-pointer active:scale-95"
              >
                <span>{verMasFiltros ? '−' : '+'}</span>
                <span>{verMasFiltros ? 'Ocultar filtros' : 'Más filtros'}</span>
              </button>

              {/* BOTÓN RESTABLECER */}
              <button 
                type="button"
                onClick={() => {
                  setFiltrosActivos([]); // Limpia el array de filtros activos de golpe
                  setVerMasFiltros(false); // Opcional: cierra la sección de servicios
                }}
                className="flex-1 text-center py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-xl cursor-pointer active:scale-95"
              >
                <span>🔄</span>
                <span>Restablecer</span>
              </button>

            </div>

            {/* BOTÓN FIJO ABAJO */}
            <div className="p-4 bg-white border-t border-zinc-100 mt-auto shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <button 
                onClick={() => ejecutarBusquedaSitios()}
                className="w-full bg-[#e03b4b] hover:bg-red-600 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}


      {/* PLANIFICAR VIAJE */}
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => {
            setMostrarPanelRuta(!mostrarPanelRuta);
            setMostrarFiltros(false); 
          }} 
          className="bg-white rounded-full px-6 py-4 flex items-center justify-between shadow-lg text-zinc-800 font-bold hover:bg-zinc-50 transition-all w-full cursor-pointer"
        >
          <span className="text-sm tracking-tight">Planificar un viaje</span>
          <MapIcon size={18} className="text-[#e03b4b]" />
        </button>

        {/* BUSCADOR INTELIGENTE */}
        {mostrarPanelRuta && (
          <div 
            ref={panelRutaRef}
            className="bg-white p-6 rounded-[32px] shadow-2xl animate-in slide-in-from-top-2 duration-300 border border-zinc-100 flex flex-col gap-4"
          >
            
            <div className="space-y-3 relative">
              {/* Texto informativo */}
            <p className="text-xs text-zinc-600 font-semibold leading-relaxed px-2 text-justify w-full">
              <span>
                Por favor, seleccione un punto de partida y un punto de llegada para crear la ruta.
              </span>
            </p>

              {/* INPUT SALIDA */}
              <div className="relative flex items-center group">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 z-10 pointer-events-none" />
                <input 
                  placeholder="Salida..." 
                  className="w-full bg-zinc-50 pl-10 pr-10 py-3 rounded-xl border border-zinc-100 outline-none text-sm font-medium focus:border-zinc-300 focus:bg-white transition-all" 
                  value={origen}
                  onChange={(e) => { 
                    setOrigen(capitalizar(e.target.value)); 
                    setRutaPintada(false); 
                  }}
                  onFocus={() => {
                    setMostrarSugOrigen(true);
                    setMostrarSugDestino(false);
                    setMostrarListaSugerencias(false);
                  }}
                />

                {/* Botón de limpiar, de cierre */}
                {origen && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Evita activar el input al borrar
                      setOrigen("");
                      setRutaPintada(false);
                      setCoordenadasRuta([]);
                      setInfoGuardado({ registrado: false, hora: "" });
                    }}
                    className="absolute right-3 z-20 p-1 bg-zinc-200 hover:bg-zinc-300 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 cursor-pointer flex items-center justify-center text-zinc-900"
                    style={{ minWidth: '22px', minHeight: '22px' }}
                  >
                    <X size={12} strokeWidth={4} className="text-zinc-900" />
                  </button>
                )}
                
                {/* Desplegable Salida */}
                {mostrarSugOrigen && sugerenciasOrigen.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-[100] max-h-48 overflow-y-auto">
                    {sugerenciasOrigen.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-zinc-50 border-b border-zinc-50 last:border-0 truncate font-semibold text-zinc-700 flex items-center gap-3 transition-colors"
                        onClick={() => {
                          setOrigen(capitalizar(sug.display_name.split(',')[0]));
                          setMostrarSugOrigen(false);
                        }}
                      >
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                        <span className="truncate">{sug.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* INPUT LLEGADA */}
              <div className="relative flex items-center group">
                <MapPin className="w-4 h-4 text-[#e03b4b] absolute left-3.5 z-10 pointer-events-none" />
                <input 
                  placeholder="Llegada..." 
                  className="w-full bg-zinc-50 pl-10 pr-10 py-3 rounded-xl border border-zinc-100 outline-none text-sm font-medium focus:border-zinc-300 focus:bg-white transition-all" 
                  value={destino}
                  onChange={(e) => { 
                    setDestino(capitalizar(e.target.value)); 
                    setRutaPintada(false); 
                  }}
                  onFocus={() => {
                    setMostrarSugDestino(true);
                    setMostrarSugOrigen(false);
                    setMostrarListaSugerencias(false);
                  }}
                />

                {/* Botón de limpiar, de cierre*/}
                {destino && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Evita activar el input al borrar
                      setDestino("");
                      setRutaPintada(false);
                      setCoordenadasRuta([]);
                      setInfoGuardado({ registrado: false, hora: "" });
                    }}
                    className="absolute right-3 z-20 p-1 bg-zinc-200 hover:bg-zinc-300 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 cursor-pointer flex items-center justify-center text-zinc-900"
                    style={{ minWidth: '22px', minHeight: '22px' }}
                  >
                    <X size={12} strokeWidth={4} className="text-zinc-900" />
                  </button>
                )}

                {/* Desplegable Llegada */}
                {mostrarSugDestino && sugerenciasDestino.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-[100] max-h-48 overflow-y-auto">
                    {sugerenciasDestino.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-zinc-50 border-b border-zinc-50 last:border-0 truncate font-semibold text-zinc-700 flex items-center gap-3 transition-colors"
                        onClick={() => {
                          setDestino(capitalizar(sug.display_name.split(',')[0]));
                          setMostrarSugDestino(false);
                        }}
                      >
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                        <span className="truncate">{sug.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div> 

            {/* Boton de ruta para iniciar sesion o registro */}
            <button 
              onClick={() => {
                // CANDADO DE SESIÓN CON REDIRECCIÓN INSTANTÁNEA
                if (!isAuthenticated) {
                  navigate('/login'); 
                  return; 
                }

                // Si tiene sesión, el flujo sigue su camino normal:
                if (!rutaPintada) {
                  procesarYMostrarRuta();
                } else if (!infoGuardado.registrado) {
                  const ahora = new Date();
                  const horas = ahora.getHours().toString().padStart(2, '0');
                  const minutos = ahora.getMinutes().toString().padStart(2, '0');
                  setInfoGuardado({ registrado: true, hora: `${horas}:${minutos}` });
                }
              }}
              disabled={!origen.trim() || !destino.trim()}
              className={`w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 ${
                !origen.trim() || !destino.trim()
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none active:scale-100' 
                  : infoGuardado.registrado
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer' 
                    : 'bg-[#e03b4b] hover:bg-red-600 text-white shadow-red-600/20 cursor-pointer' 
              }`}
            >
              {infoGuardado.registrado 
                ? `Registrado a las ${infoGuardado.hora}` 
                : !isAuthenticated
                  ? 'Iniciar sesión' 
                  : rutaPintada 
                    ? 'Guardar ruta' 
                    : 'Mostrar ruta'
              }
            </button>
          </div>
        )}
      </div>
      </div>

      {/* LISTA DE RESULTADOS (Solo aparece si hay puntos) */}
      {puntos.length > 0 && (
        <div className="flex-1 overflow-y-auto mt-2 bg-white rounded-[24px] p-4 border border-zinc-100 shadow-xl custom-scrollbar min-h-0">

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

          {/* Rutas */}
          {coordenadasRuta.length > 0 && (
            <Polyline 
              positions={coordenadasRuta} 
              pathOptions={{ 
                color: '#e03b4b',
                weight: 5,
                opacity: 0.85,   
                lineJoin: 'round'
              }} 
            />
          )}

          {/* Marcadores dinámicos según la búsqueda y filtros */}
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
        
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" onClick={() => setSelectedPoint(null)} 
        />

        {/* Contenedor */}
        <div 
          className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row border border-zinc-100"
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

                {/* Corazón de Favorito */}
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h2 className="text-2xl font-black text-zinc-950 truncate">
                    {capitalizar(selectedPoint.nombre)}
                  </h2>
                  <button 
                    type="button"
                    onClick={() => toggleFavorito(selectedPoint)}

                    //  Si está en la lista de favoritos, se vuelve rojo, si no, se queda gris
                    className={`transition-all shrink-0 text-2xl cursor-pointer active:scale-125 duration-150 ${
                      listaFavoritosIds.includes(selectedPoint.id.toString())
                        ? 'text-[#e03b4b] scale-110' 
                        : 'text-zinc-300 hover:text-[#e03b4b]/60'
                    }`}
                  >
                    ♥
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Ubicación Estilizada */}
                      {/* {selectedPoint.direccion && 

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100">
                      <span className="text-xs">📍</span>
                    </div>
                  </div>
                  } */}

                  {/* Coordenadas */}
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

          {/* 2. PARTE DERECHA: IMAGEN / ICONO */}
          <div className="w-full md:w-64 bg-zinc-50 flex items-center justify-center relative overflow-hidden border-l border-zinc-100 shrink-0">
            
            <img 
              src={`https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=60&w=400`} 
              className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
              alt="background"
            />
            
            {/* Icono */}
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

      {/* Botón de Mi Ubicación */}
        <button 
          onClick={localizarUsuario}
          className="w-14 h-14 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all border-2 border-transparent bg-white/90 text-zinc-400 hover:text-[#e03b4b] hover:bg-white active:scale-90 cursor-pointer"
        >
          <LocateFixed size={20} strokeWidth={2.5} />
          <span className="text-[7px] font-black uppercase mt-1">Mi posición</span>
        </button>

      
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => setModoMapa('calle')}
          className={`w-14 h-14 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all border-2 cursor-pointer ${
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
          className={`w-14 h-14 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all border-2 cursor-pointer ${
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
          className="w-14 h-12 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-white transition-colors border-b border-zinc-100 active:bg-zinc-50 cursor-pointer  "
        >
          <Plus size={18} strokeWidth={3} />
        </button>
        <button 
          onClick={() => mapRef.current?.zoomOut()}
          className="w-14 h-12 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-white transition-colors active:bg-zinc-50 cursor-pointer"
        >
          <Minus size={18} strokeWidth={3} />
        </button>
      </div>
    </div>


      {/* TOAST DE NOTIFICACIÓN */}
      {mensajeFlotante && (
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white text-zinc-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-zinc-100">
              
            <p className="font-bold text-sm">{mensajeFlotante}</p>
            <button onClick={() => setMensajeFlotante("")} className="ml-2 text-zinc-400 hover:text-white">✕</button>
          </div>
        </div>
      )}

  </div>
  );

};