import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionUser } from '../interfaces/SessionUser';
import { userRepository } from '../database/repositories';


interface AuthState {
  sessionUser: SessionUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  setSession: (sessionUser: SessionUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sessionUser: null,
      isAuthenticated: false,
      isAdmin: false,

      // Al establecer la sesión, verificamos automáticamente el rol del usuario
      setSession: async (sessionUser: SessionUser) => {
        let isAdmin = false;
        
        if (sessionUser.profile?.id) {
          const { data: role } = await userRepository.fetchRole(sessionUser.profile.id);
          isAdmin = role === 'admin';
        }

        set({
          sessionUser,
          isAuthenticated: true,
          isAdmin
        });
      },

      clearSession: () => set({
        sessionUser: null,
        isAuthenticated: false,
        isAdmin: false
      }),
    }),
    {
      name: 'auth-v1', // Nombre para el localStorage
      version: 1,
      partialize: (state) => ({
        sessionUser: state.sessionUser,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);