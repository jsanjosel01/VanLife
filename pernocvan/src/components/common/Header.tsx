
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { supabase } from '../../database/supabase/client';
import type { Session } from '@supabase/supabase-js';

import { Map, Globe, Sun, Moon, Truck, LayoutDashboard, Users, Menu, X, User, LogOut, LogIn, UserPlus} from 'lucide-react';

export const Header = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  
  const navigate = useNavigate();
  const location = useLocation();

  // Verificación del ROL
  const verificarRolAdmin = async (currentSession: Session | null) => {
    if (!currentSession || !currentSession.user) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', currentSession.user.id)
        .single();

      if (!error && data?.rol === 'administrador') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Error al verificar el rol:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      verificarRolAdmin(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSession(null);
        setIsAdmin(false);
        return;
      }
      setSession(currentSession);
      verificarRolAdmin(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      verificarRolAdmin(session);
    }
    // Cerramos el menú móvil automáticamente al cambiar de página
    setIsMenuOpen(false); 
  }, [location.pathname, session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  const ocultarPorRuta = location.pathname.includes('reset-password');

  return (
    <header className="sticky top-0 z-[9999] bg-background border-b border-border relative">
      
      <div className="flex justify-between items-center py-4 px-4 md:px-6 relative">
        
        {/* SECCIÓN IZQUIERDA: LOGO */}
        <div className="logo-section">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Truck className="w-7 h-7 text-primary" strokeWidth={2.5} />
            <h3 className="text-2xl font-bold text-primary">VanLife</h3>
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA visible en móvil */}
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-foreground cursor-pointer"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* SECCIÓN DERECHA: COMPONENTES DE ESCRITORIO  */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" asChild className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground h-9 px-3">
              <Link to="/mapa"><Map className="h-4 w-4" /><span className="text-sm font-medium">Mapa</span></Link>
            </Button>
            {/* <Button variant="ghost" className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground h-9 px-3" title="Cambiar idioma">
              <Globe className="h-4 w-4" /><span className="text-sm font-medium">ES</span>
            </Button>
            <Button variant="ghost" size="icon" className="cursor-pointer text-muted-foreground hover:text-foreground h-9 w-9" title="Cambiar tema">
              <Sun className="h-4 w-4 dark:hidden" /><Moon className="h-4 w-4 hidden dark:block" />
            </Button> */}
          </div>

          {session ? (
            <>
              <div className="h-5 w-[1px] bg-border mx-2 self-center opacity-80" />
              {isAdmin && !ocultarPorRuta && (
                <>
                  <Button variant="ghost" asChild className="cursor-pointer gap-2 text-[#e03b4b] hover:text-red-700 font-bold h-9 px-3 bg-red-500/5 hover:bg-red-500/10 rounded-full">
                    <Link to="/admin/dashboard"><LayoutDashboard className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" asChild className="cursor-pointer gap-2 text-[#e03b4b] hover:text-red-700 font-bold h-9 px-3 bg-red-500/5 hover:bg-red-500/10 rounded-full">
                    <Link to="/admin"><Users className="h-4 w-4" /></Link>
                  </Button>
                </>
              )}
              <Button variant="outline" className="cursor-pointer border-border text-foreground h-9 px-4 hover:bg-accent">
                <Link to="/profile">Mi Perfil</Link>
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="cursor-pointer h-9 px-4 active:scale-95">
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <div className="h-5 w-[1px] bg-border mx-2 self-center opacity-80" />
              <Button variant="outline" asChild className="cursor-pointer border-border text-foreground h-9 px-4 hover:bg-accent">
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild className="cursor-pointer bg-primary text-primary-foreground h-9 px-5 font-medium shadow-sm hover:opacity-90">
                <Link to="/signup">Registrarse</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* MENÚ DESPLEGABLE PARA MÓVIL */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col px-4 pt-4 pb-6 border-t border-border bg-background space-y-4 shadow-lg absolute w-full left-0 top-[100%]">
          
        {/* HERRAMIENTAS AGRUPADAS (Mapa, Idioma, Tema) */}
        <div className="flex flex-col gap-3">
            <Button variant="outline" asChild className="w-full justify-start  cursor-pointer">
                <Link to="/mapa"><Map className="h-5 w-5" />Ir al mapa</Link>
            </Button>
            
            {/* <Button variant="outline" className="w-full justify-start h-10 px-4 gap-3 cursor-pointer" title="Cambiar idioma">
                <Globe className="h-5 w-5" /> Cambiar idioma (ES)
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-10 px-4 gap-3 cursor-pointer" title="Cambiar tema">
                <Sun className="h-5 w-5 dark:hidden" />
                <Moon className="h-5 w-5 hidden dark:block" />
                Cambiar apariencia
            </Button> */}
        </div>

          <div className="w-full h-[1px] bg-border opacity-50" />

          {session ? (
            <div className="flex flex-col gap-3">
              {isAdmin && !ocultarPorRuta && (
                <div className="flex flex-col gap-3 pb-2 border-b border-border/50">
                  <Button variant="outline" asChild 
                    className="w-full justify-start text-[#e03b4b] cursor-pointer hover:bg-red-500/10"
                  >
                    <Link to="/admin/dashboard"><LayoutDashboard className="h-5 w-5" />Panel Admin</Link>
                  </Button>
                  
                  <Button variant="outline" asChild 
                    className="w-full justify-start text-[#e03b4b] cursor-pointer hover:bg-red-500/10"
                  >
                    <Link to="/admin"><Users className="h-5 w-5" />Gestión de Usuarios</Link>
                  </Button>
                </div>
              )}
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/profile"><User className="h-5 w-5" />Mi Perfil</Link>
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="w-full justify-start cursor-pointer">
                <LogOut className="h-5 w-5" />Cerrar Sesión
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/login"><LogIn className="h-5 w-5" />Iniciar Sesión</Link>
              </Button>
              <Button asChild className="w-full justify-start">
                <Link to="/signup"><UserPlus className="h-5 w-5" />Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};