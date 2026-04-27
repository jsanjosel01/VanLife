import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { supabase } from '../../database/supabase/client';
import type { Session } from '@supabase/supabase-js';


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
    <header className="sticky top-0 z-50 bg-slate-50 border-b border-border">
      <div className="flex justify-between items-center p-4">
        
        <div className="logo-section">
          
          <Link to="/" className="flex items-center py-2 gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="img/logo.png" 
              alt="Pernocvan Logo" 
              className="h-16 w-16 object-contain" 
            />
            <h1 className="text-2xl font-bold text-primary">Pernocvan</h1>
          </Link>
        </div>

        <div className="auth-actions flex gap-3">
          {session ? (
            // SI HAY SESIÓN: Mostrar Perfil y Cerrar Sesión
            <>
              <Link to="/profile">
                <Button variant="ghost">Mi Perfil</Button>
              </Link>
              <Button variant="destructive" onClick={handleLogout}>
                Salir
              </Button>
            </>
          ) : (
            // SI NO HAY SESIÓN: Mostrar Login y Registro
            <>
              <Link to="/login">
                <Button variant="outline" className="border-primary text-primary">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/signup">
                <Button>Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};