
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { supabase } from '../../database/supabase/client';
import type { Session } from '@supabase/supabase-js';

import { Map, Globe, Sun, Moon, Truck, LayoutDashboard, Info, Users} from 'lucide-react';

export const Header = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); 
  const navigate = useNavigate();
  
  // Funcion para verificar el rol
  const verificarRolAdmin = async (currentSession: Session | null) => {
    if (!currentSession) {
      setIsAdmin(false);
      return;
    }
    
    setIsAdmin(true); 
  };

  useEffect(() => {
    // Comprobar la sesión inicial al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      verificarRolAdmin(session);
    });

    // Escuchar cambios de autenticación con control de eventos específicos
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {

      //  Si el evento es de recuperación de contraseña, bloqueamos los privilegios de Admin
      if (event === 'PASSWORD_RECOVERY') {
        setSession(null); // Oculta las opciones de usuario logueado
        setIsAdmin(false); // Oculta los iconos de administración
        return;
      }

      // Para el resto de estados normales (Login, Logout, etc.)
      setSession(currentSession);
      verificarRolAdmin(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    navigate('/login');
  };


  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex justify-between items-center py-4 px-6">
        
        {/* SECCIÓN IZQUIERDA: LOGO */}
        <div className="logo-section">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Truck className="w-7 h-7 text-primary" strokeWidth={2.5} />
            <h3 className="text-2xl font-bold text-primary">VanLife</h3>
          </Link>
        </div>

        {/* SECCIÓN DERECHA: COMPONENTES */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* BLOQUE DE HERRAMIENTAS GENERALES */}
          <div className="flex items-center gap-1">
            {/* Botón Mapa */}
            <Button 
              variant="ghost" 
              asChild 
              className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground transition-colors h-9 px-3"
            >
              <Link to="/mapa">
                <Map className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">Mapa</span>
              </Link>
            </Button>

            {/* Botón Idiomas */}
            <Button 
              variant="ghost" 
              className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground transition-colors h-9 px-3"
              title="Cambiar idioma"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">ES</span>
            </Button>

            {/* Botón DARK/LIGHT */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="cursor-pointer text-muted-foreground hover:text-foreground h-9 w-9"
              title="Cambiar tema"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </Button>
          </div>

          {/* CONTROL DE FLUJO POR SESIÓN */}
          {session ? (
            <>
              {/* LÍNEA DIVISORIA */}
              <div className="h-5 w-[1px] bg-border mx-2 self-center opacity-80" />

              {/* BOTÓN DEL DASHBOARD */}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  asChild 
                  className="cursor-pointer gap-2 text-[#e03b4b] hover:text-red-700 font-bold transition-colors h-9 px-3 bg-red-500/5 hover:bg-red-500/10 rounded-full animate-in fade-in duration-200"
                  title="Ir al Dashboard"
                >
                  <Link to="/admin/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                </Button>
              )}

              {/* BOTÓN GESTIÓN DE USUARIOS */}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  asChild 
                  className="cursor-pointer gap-2 text-[#e03b4b] hover:text-red-700 font-bold transition-colors h-9 px-3 bg-red-500/5 hover:bg-red-500/10 rounded-full animate-in fade-in duration-200"
                  title="Gestión de la Comunidad"
                >
                  <Link to="/admin" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                  </Link>
                </Button>
              )}

              {/* Botón de Perfil */}
              <Button variant="outline" className="cursor-pointer border-border text-foreground h-9 px-4 transition-all duration-300 ease-in-out hover:bg-accent hover:border-foreground/30 hover:shadow-sm">
                <Link to="/profile">Mi Perfil</Link>
              </Button>

              {/* Botón cerrar sesión */}
              <Button variant="destructive" onClick={handleLogout} 
                className="cursor-pointer h-9 px-4 transition-all duration-300 hover:opacity-90 hover:shadow-md active:scale-95"
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              {/* LÍNEA DIVISORIA */}
              <div className="h-5 w-[1px] bg-border mx-2 self-center opacity-80" />

              {/* Botón de Iniciar Sesión */}
              <Button 
                variant="outline" 
                asChild 
                className="cursor-pointer border-border text-foreground h-9 px-4 transition-all duration-300 ease-in-out hover:bg-accent hover:border-foreground/30 hover:shadow-sm"
              >
                <Link to="/login">Iniciar Sesión</Link>
              </Button>

              {/* Botón de Registro */}
              <Button 
                asChild 
                className="cursor-pointer bg-primary text-primary-foreground h-9 px-5 font-medium shadow-sm transition-all duration-300 hover:opacity-90 hover:shadow-md"
              >
                <Link to="/signup">Registrarse</Link>
              </Button>
            </>
          )}

        </div>
      </div>
    </header>
  );
};