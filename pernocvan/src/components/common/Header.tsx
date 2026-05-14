
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { supabase } from '../../database/supabase/client';
import type { Session } from '@supabase/supabase-js';

import { Map, Globe, Sun, Moon, Truck} from 'lucide-react';

export const Header = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Comprobar si ya hay una sesión al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Escuchar cambios de autenticación (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
  <header className="sticky top-0 z-50 bg-background border-b border-border">
    
    <div className="flex justify-between items-center py-4 px-6">
      
      <div className="logo-section">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* <img 
            src="img/logovan.png" 
            alt="VanLife Logo" 
            className="h-16 w-auto object-contain" 
          /> */}

          {/* ICONO */}
          <Truck 
            className="w-7 h-7 text-primary" 
            strokeWidth={2.5} 
          />
          <h3 className="text-2xl font-bold text-primary">VanLife</h3>
        </Link>
      </div>

      {/* SECCIÓN DERECHA: TODO JUNTO */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* BLOQUE DE HERRAMIENTAS */}
        <div className="flex items-center gap-1">

          {/* Botón Mapa*/}
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

          {/* Botón Idiomas*/}
          <Button 
            variant="ghost" 
            className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground transition-colors h-9 px-3"
            title="Cambiar idioma"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">ES</span>
          </Button>

          {/* Botón DARK/LIGHT*/}
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

        {/* Separador "LINEA" */}
        <div className="hidden sm:block h-5 w-[1px] bg-border mx-1" />


        {/* Acciones botones */}
        <div className="auth-actions flex gap-3">
          {session ? (
            <>
              {/* Botón de Perfil */}
              <Button variant="outline" className="cursor-pointer border-border text-foreground h-9 px-4 transition-all duration-300 ease-in-out hover:bg-accent hover:border-foreground/30 hover:shadow-sm">
                <Link to="/profile">Mi Perfil</Link>
              </Button>

              {/* El botón cerrar sesión */}
              <Button variant="destructive" onClick={handleLogout} 
                className="cursor-pointer h-9 px-4 transition-all duration-300 hover:opacity-90 hover:shadow-md active:scale-95"
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
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
      </div>
    </header>
  );
};