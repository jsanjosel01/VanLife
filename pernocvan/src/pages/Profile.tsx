import { useEffect, useState } from "react";
import { supabase } from "../database/supabase/client";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { AvatarUploader } from "../components/avatar/AvatarUploader";
import { ArrowRight, Edit2, Fuel, Heart, Loader2, MapPin, Route, Navigation, X, Save, Trash2, Truck, Info, Tent, Trees, ShowerHead, Droplets, Toilet, Wifi, Utensils, PawPrint, Zap, HeartPulse, User} from "lucide-react";
import { JSX } from "react/jsx-runtime";

export default function Profile() {
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [editando, setEditando] = useState(false); // Modo lectura/edición
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // Estados para secciones dinámicas
    const [favoritos, setFavoritos] = useState<any[]>([]);
    const [rutas, setRutas] = useState<any[]>([]);
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [memberSince, setMemberSince] = useState("");

    async function fetchAllData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);
        setEmail(user.email || "");

        if (user.created_at) {
            setMemberSince(new Date(user.created_at).toLocaleDateString('es-ES'));
        }

        // Cargar Perfil
        const { data: pData } = await supabase.from("perfiles").select("*").eq("id", user.id).maybeSingle();
        if (pData) {
            setProfile(pData);
            setFormData(pData);
        }

        // Cargar Sitios Favoritos
        const { data: favs } = await supabase.from("sitios_favoritos").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        if (favs) setFavoritos(favs);

        // Cargar Rutas
        const { data: rData } = await supabase.from("rutas_guardadas").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        if (rData) setRutas(rData);

        setLoading(false);
    }

    useEffect(() => { fetchAllData(); }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("perfiles").update(formData).eq("id", user.id);
        
        if (error) toast.error("Error al guardar: " + error.message);
        else {
            toast.success("Perfil actualizado");
            setProfile(formData);
            setEditando(false);
        }
        setUpdating(false);
    };

    const eliminarFavorito = async (id: number) => {
        const { error } = await supabase.from("sitios_favoritos").delete().eq("id", id);
        if (!error) {
            toast.success("Sitio eliminado");
            setFavoritos(favoritos.filter(f => f.id !== id));
        }
    };

    const eliminarRuta = async (id: number) => {
        const { error } = await supabase.from("rutas_guardadas").delete().eq("id", id);
        if (!error) {
            toast.success("Ruta eliminada");
            setRutas(rutas.filter(r => r.id !== id));
        }
    };

    const renderIconoTipo = (id: string) => {
    // Definimos el mapeo de iconos
    const iconos: Record<string, JSX.Element> = {
        area_ac: <Truck className="h-5 w-5" />,
        camping: <Tent className="h-5 w-5" />,
        parking: <MapPin className="h-5 w-5" />,
        gasolinera: <Fuel className="h-5 w-5" />,
        spot: <Trees className="h-5 w-5" />,
        servicio_agua: <Droplets className="h-5 w-5" />,
        servicio_ducha: <ShowerHead className="h-5 w-5" />,
        servicio_wc: <Toilet className="h-5 w-5" />,
        servicio_wifi: <Wifi className="h-5 w-5" />,
        servicio_picnic: <Utensils className="h-5 w-5" />,
        servicio_basura: <Trash2 className="h-5 w-5" />,
        servicio_mascotas: <PawPrint className="h-5 w-5" />,
        servicio_salud: <HeartPulse className="h-5 w-5" />,
        servicio_carga: <Zap className="h-5 w-5" />,
    };

    return iconos[id as keyof typeof iconos] || <Navigation className="h-5 w-5" />;
};

    if (loading) return <div className="p-8 text-center min-h-screen flex items-center justify-center">Cargando perfil...</div>;

    return (
        <div className="flex justify-center bg-background pt-10 pb-40 px-4">
            <div className="max-w-3xl mx-auto w-full space-y-8">
            
                {/* FORMULARIO */}
                <form onSubmit={handleUpdate} className="bg-card p-10 rounded-2xl border shadow-sm space-y-8 animate-in fade-in duration-500">
                    {/* CABECERA */}
                    <div className="flex justify-between items-start pb-8">
                        
                        {/* Parte izquierda */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-3xl font-bold tracking-tight text-foreground">
                                    {profile.username || "Viajero"}
                                </h3>

                                {memberSince && <p className="text-sm text-muted-foreground pt-1">Miembro desde {memberSince}</p>}
                            </div>

                            {/* Botón Editar Perfil */}
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditando(!editando)}
                                // Añadimos clases para forzar el color de texto y borde en modo oscuro
                                className="cursor-pointer transition-transform hover:scale-105 active:scale-95 text-foreground border-border hover:bg-accent"
                            >
                                {editando ? "Cancelar" : "Editar perfil"}
                            </Button>
                        </div>

                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-2">
                            <AvatarUploader 
                                uid={userId} 
                                url={formData.avatar_url} 
                                onUpload={(url) => setFormData({ ...formData, avatar_url: url })} 
                            />
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider text-center max-w-[100px]">
                                Haz clic para editar
                            </span>
                        </div>
                    </div>
        
                    {/* CAMPOS DE DATOS */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 mb-6 border-b pb-4">
                            <User className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-bold text-foreground">Datos personales </h3>
                        </div>

                        {/* USUARIO */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground flex items-center gap-2"> Usuario</label>
                            {editando ? (
                                <Input className="text-foreground" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                            ) : (
                                <p className="p-3 bg-secondary rounded-lg border border-transparent text-foreground">{profile.username || "No definido"}</p>
                            )}
                        </div>
                        
                        {/* NOMBRE */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground flex items-center gap-2"> Nombre completo</label>
                            {editando ? (
                                <Input className="text-foreground" value={formData.full_name || ""} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                            ) : (
                                <p className="p-3 bg-secondary rounded-lg text-foreground">{profile?.full_name || "No definido"}</p>
                            )}
                        </div>

                        {/* DIRECCIÓN */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Dirección
                            </label>
                            {editando ? (
                                <Input 
                                    className="text-foreground"
                                    value={formData.address || ""} 
                                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                />
                            ) : (
                                <p className="p-3 bg-secondary rounded-lg font-medium text-foreground">
                                    {profile?.address || "No especificada"}
                                </p>
                            )}
                        </div>

                        {/* MODELO CAMPER */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <Truck className="h-4 w-4" /> Modelo
                            </label>
                            {editando ? (
                                <Input 
                                    className="text-foreground"
                                    value={formData.van_model || ""} 
                                    onChange={(e) => setFormData({...formData, van_model: e.target.value})} 
                                />
                            ) : (
                                <p className="p-3 bg-secondary rounded-lg font-medium text-foreground">
                                    {profile?.van_model || "Sin modelo"}
                                </p>
                            )}
                        </div>

                        {/* BIOGRAFÍA */}
                        <div className="col-span-full space-y-2">
                            <label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <Info className="h-4 w-4" /> Biografía
                            </label>
                            {editando ? (
                                <textarea 
                                    value={formData.bio || ""} 
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                                    className="w-full p-3 bg-background border rounded-lg min-h-[100px] text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Cuéntanos un poco sobre ti y tus viajes..."
                                />
                            ) : (
                                <p className="p-3 bg-secondary rounded-lg min-h-[100px] text-foreground">
                                    {profile?.bio || "Sin biografía."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Boton de guardar los cambios */}
                    {editando && (
                        <Button type="submit" disabled={updating} size="lg" 
                            className="w-full h-14 text-lg font-bold cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] mt-4"
                        >
                            {updating ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                "Guardar cambios"
                            )}
                        </Button>
                    )}

                </form>

                {/* MIS SITIOS FAVORITOS */}
                    <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                            <Heart className="h-6 w-6 text-red-500" />
                            {/* HE AÑADIDO text-foreground AQUÍ ABAJO */}
                            <h3 className="text-xl font-bold text-foreground">Mis sitios favoritos</h3>
                        </div>
                        {favoritos.length === 0 ? <p className="text-muted-foreground italic">Aún no has guardado sitios.</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {favoritos.map((f) => (
                                        <div key={f.id}
                                            className="group p-4 border border-border bg-background rounded-xl flex items-center justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/30 relative hover:z-10"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden pr-2">
                                                <div className="transition-transform duration-300 group-hover:scale-110 shrink-0">
                                                    {renderIconoTipo(f.tipo)}
                                                </div>
                                                <span className="font-semibold text-foreground truncate">{f.nombre}</span>
                                            </div>
                                            <button 
                                                onClick={() => eliminarFavorito(f.id)} 
                                                className="text-muted-foreground hover:text-red-500 transition-all duration-300 hover:scale-110 active:scale-95 p-1 shrink-0"
                                                title="Eliminar favorito"
                                            >
                                                <Trash2 className="h-4 w-4 cursor-pointer" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                {/* MIS RUTAS */}
                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                        <Route className="h-6 w-6 text-primary" />
                        {/* Aquí está el cambio */}
                        <h3 className="text-xl font-bold text-foreground">Mis rutas</h3>
                    </div>
                
                    {rutas.length === 0 ? <p className="text-muted-foreground italic">No tienes rutas guardadas.</p> : (
                        <div className="space-y-3">
                            {rutas.map((r) => (
                                <div key={r.id}
                                    className="group p-4 border border-border bg-background rounded-xl flex justify-between items-center transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/30 relative hover:z-10"
                                >
                                    <div className="flex items-center gap-3 font-semibold text-foreground">
                                        {r.origen} 
                                        
                                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" /> 
                                        {r.destino}
                                    </div>
                                    <button 
                                        onClick={() => eliminarRuta(r.id)} 
                                        className="text-muted-foreground hover:text-red-500 transition-all duration-300 hover:scale-110 active:scale-95 p-1"
                                        title="Eliminar ruta"
                                    >
                                        <Trash2 className="h-4 w-4 cursor-pointer" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}





