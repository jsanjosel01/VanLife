import { supabase } from "@/database/supabase/client";
import { RefreshCw, Search, Trash2, Save, X, MapPin, Truck, Info, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "sonner";

export const AdminPage = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any | null>(null);
  const [editando, setEditando] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modoCrear, setModoCrear] = useState(false);

  const cargarUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('perfiles').select('*').order('created_at', { ascending: false });
    if (!error) setUsuarios(data || []);
    setLoading(false);
  };

  useEffect(() => { cargarUsuarios(); }, []);

  
  // Función para crear o actualizar un usuario
  const gestionarGuardado = async () => {
    if (!usuarioSeleccionado?.username) {
      return toast.error("El nombre de usuario es obligatorio");
    }

    setLoading(true);
    const datosPerfil = {
      username: usuarioSeleccionado.username.trim(),
      full_name: usuarioSeleccionado.full_name || "",
      address: usuarioSeleccionado.address || "",
      van_model: usuarioSeleccionado.van_model || "",
      bio: usuarioSeleccionado.bio || "",
      avatar_url: usuarioSeleccionado.avatar_url || "",
      rol: 'usuario'
    };

    try {
      if (modoCrear) {
        const { error } = await supabase.from('perfiles').insert([datosPerfil]);
        if (error) throw error;
        toast.success("¡Viajero creado con éxito!");
      } else {
        const { error } = await supabase.from('perfiles').update(datosPerfil).eq('id', usuarioSeleccionado.id);
        if (error) throw error;
        toast.success("Perfil actualizado correctamente");
      }
      
      setUsuarioSeleccionado(null);
      setModoCrear(false);
      setEditando(false);
      cargarUsuarios();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id: string) => {
    const { error } = await supabase.from('perfiles').delete().eq('id', id);
    if (!error) {
      toast.success("Usuario y acceso eliminados");
      setUsuarioSeleccionado(null);
      cargarUsuarios();
    }
  };

  // Estadísticas 
  const totalViajeros = usuarios.length;
  const conFurgoneta = usuarios.filter(u => u.van_model).length;
  const administradores = usuarios.filter(u => u.rol === 'administrador').length;
  
  return (
    <div className="bg-background pt-10 pb-40 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      
        {/* CABECERA */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Control de la Comunidad</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona los perfiles viajeros y sus furgonetas
            </p>
          </div>
      
          <button onClick={cargarUsuarios} className="p-3 bg-secondary rounded-xl hover:rotate-180 transition-all duration-500 cursor-pointer">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* TARJETAS DE CONTADORES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-black">{totalViajeros}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Total Viajeros</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-600"><Truck className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-black">{conFurgoneta}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Con Furgoneta</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-600"><Save className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-black">{administradores}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Admins</p>
            </div>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="group relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Filtrar por nombre, usuario, modelo o ciudad..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-muted bg-card focus:border-primary outline-none transition-all shadow-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* TABLA */}
        <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-border bg-card shadow-sm custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6">Viajero</th>
                <th className="py-4 px-6 hidden sm:table-cell">Vehículo</th>
                <th className="py-4 px-6 hidden md:table-cell">Ubicación</th>
                <th className="py-4 px-6">Rol</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm font-medium">
              {usuarios
                .filter(u => JSON.stringify(u).toLowerCase().includes(busqueda.toLowerCase()))
                .map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/10 transition-colors">
                    {/* Celda Perfil */}
                    <td className="py-4 px-6 flex items-center gap-4">
                      <img 
                        src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}`} 
                        className="h-10 w-10 rounded-xl object-cover shadow-sm border border-border" 
                        alt=""
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-base leading-tight">@{u.username}</span>
                        <span className="text-xs text-muted-foreground">{u.full_name || 'Sin nombre completo'}</span>
                      </div>
                    </td>

                    {/* Celda Vehículo */}
                    <td className="py-4 px-6 text-muted-foreground hidden sm:table-cell">
                      {u.van_model ? (
                        <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
                          <Truck className="h-4 w-4 opacity-70 text-primary" />
                          {u.van_model}
                        </span>
                      ) : (
                        <span className="text-xs italic opacity-40">No registrado</span>
                      )}
                    </td>

                    {/* Celda Ubicación */}
                    <td className="py-4 px-6 text-muted-foreground hidden md:table-cell">
                      {u.address ? (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 opacity-70 text-primary" />
                          {u.address}
                        </span>
                      ) : (
                        <span className="text-xs italic opacity-40">No especificada</span>
                      )}
                    </td>

                    {/* Celda Rol */}
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider ${u.rol === 'administrador' ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>
                        {u.rol}
                      </span>
                    </td>

                    {/* Celda Acción */}
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => { setUsuarioSeleccionado(u); setModoCrear(false); setEditando(false); }}
                        className="bg-foreground text-background px-4 py-2 rounded-xl font-bold text-xs hover:bg-primary hover:text-white cursor-pointer transition-all active:scale-95 shadow-sm"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Menu lateral (CREATE/READ/UPDATE/DELETE) */}  
        {usuarioSeleccionado && (
          <>
            <div className="fixed inset-0 h-screen w-screen bg-background/60 backdrop-blur-sm z-40" onClick={() => { setUsuarioSeleccionado(null); setModoCrear(false); setEditando(false); }} />

            <div className="fixed top-0 right-0 h-screen max-h-screen w-full max-w-sm bg-card border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                  
              <div className="flex justify-end items-center p-2.5 pb-0">
                <button onClick={() => { setUsuarioSeleccionado(null); setModoCrear(false); setEditando(false); }} className="p-1 hover:bg-muted rounded-full cursor-pointer transition-colors">
                    <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar text-foreground flex flex-col justify-between">
                <header className="text-center space-y-2 py-2">
                  <img 
                    src={usuarioSeleccionado.avatar_url || `https://ui-avatars.com/api/?name=${usuarioSeleccionado.username}`} 
                    className="h-20 w-20 rounded-2xl mx-auto shadow-lg border-2 border-primary object-cover" 
                    alt=""
                  />
                  <div>
                     <p className="text-xs text-primary font-mono">@{usuarioSeleccionado.username}</p>
                  </div>
                </header>

                <section className="flex flex-col gap-4">
                  {/* Nombre */}
                  <div className={`p-4 rounded-xl border transition-all duration-200 ${(editando || modoCrear) ? 'bg-background border-primary shadow-sm ring-1 ring-primary/20' : 'bg-secondary/40 border-border/50'}`}>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary/70 uppercase tracking-tight mb-1">
                          Nombre Completo
                      </div>
                      <input 
                          disabled={!editando && !modoCrear}
                          className="w-full bg-transparent text-sm font-semibold outline-none focus:text-primary disabled:cursor-default"
                          placeholder="Ej: Julia Pérez..."
                          value={usuarioSeleccionado.full_name || ""}
                          onChange={(e) => setUsuarioSeleccionado({...usuarioSeleccionado, full_name: e.target.value})}
                      />
                  </div>

                  {/* Ubicación */}
                  <div className={`p-4 rounded-xl border transition-all duration-200 ${editando ? 'bg-background border-primary shadow-sm ring-1 ring-primary/20' : 'bg-secondary/40 border-border/50'}`}>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary/70 uppercase tracking-tight mb-1">
                          <MapPin className="h-3 w-3"/> Ubicación
                      </div>
                      <input 
                          disabled={!editando}
                          className="w-full bg-transparent text-sm font-semibold outline-none focus:text-primary disabled:cursor-default"
                          placeholder="Ej: Madrid, España..."
                          value={usuarioSeleccionado.address || ""}
                          onChange={(e) => setUsuarioSeleccionado({...usuarioSeleccionado, address: e.target.value})}
                      />
                  </div>

                  {/* Vehículo */}
                  <div className={`p-4 rounded-xl border transition-all duration-200 ${editando ? 'bg-background border-primary shadow-sm ring-1 ring-primary/20' : 'bg-secondary/40 border-border/50'}`}>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary/70 uppercase tracking-tight mb-1">
                          <Truck className="h-3 w-3"/> Vehículo
                      </div>
                      <input 
                          disabled={!editando}
                          className="w-full bg-transparent text-sm font-semibold outline-none focus:text-primary disabled:cursor-default placeholder:italic"
                          placeholder="Ej: Renault Kangoo..."
                          value={usuarioSeleccionado.van_model || ""}
                          onChange={(e) => setUsuarioSeleccionado({...usuarioSeleccionado, van_model: e.target.value})}
                      />
                  </div>

                  {/* Biografía */}
                  <div className={`p-4 rounded-xl border transition-all duration-200 ${editando ? 'bg-background border-primary shadow-sm ring-1 ring-primary/20' : 'bg-secondary/40 border-border/50'}`}>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary/70 uppercase tracking-tight mb-1">
                          <Info className="h-3 w-3"/> Biografía
                      </div>
                      <textarea 
                          disabled={!editando}
                          className="w-full bg-transparent text-sm font-semibold outline-none focus:text-primary resize-none h-24 disabled:cursor-default placeholder:italic custom-scrollbar"
                          placeholder="Cuéntanos algo sobre este viajero..."
                          value={usuarioSeleccionado.bio || ""}
                          onChange={(e) => setUsuarioSeleccionado({...usuarioSeleccionado, bio: e.target.value})}
                      />
                  </div>
                </section>

                <footer className="pt-4 space-y-2">
                  {!editando ? (
                    <button onClick={() => setEditando(true)} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 cursor-pointer">
                      Editar Perfil
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={gestionarGuardado} 
                        disabled={loading}
                        className="py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 cursor-pointer transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4"/> Guardar
                      </button>
                      <button 
                        onClick={() => { setEditando(false); setModoCrear(false); }} 
                        className="py-2.5 bg-secondary/50 border border-border text-foreground rounded-xl text-sm font-bold active:scale-95 cursor-pointer hover:bg-secondary transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  <button onClick={() => setShowDeleteConfirm(true)} className="w-full mt-4 py-2.5 border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" /> Borrar Usuario
                  </button>

                  {/* MODAL DE CONFIRMACIÓN */}
                  {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDeleteConfirm(false)} />
                      <div className="relative bg-card border border-border w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-4">
                          <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-destructive">
                            <Trash2 className="h-8 w-8" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-black tracking-tight">¿Quieres eliminar al viajero?</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Estás a punto de borrar a <span className="font-bold text-foreground">@{usuarioSeleccionado.username}</span>. 
                              ¿Estás seguro? Eliminará todos sus datos.
                            </p>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <button onClick={() => { eliminarUsuario(usuarioSeleccionado.id); setShowDeleteConfirm(false); }}
                              className="w-full py-3 bg-destructive text-white border border-white/10 rounded-2xl font-bold hover:bg-red-600 transition-all active:scale-95 cursor-pointer shadow-lg shadow-red-900/20"
                            >
                              Sí, eliminar definitivamente
                            </button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-3 bg-secondary/50 text-foreground border border-border rounded-2xl font-bold hover:bg-secondary transition-all active:scale-95 cursor-pointer">
                              No, cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </footer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};