import type { SessionUser } from "../../interfaces/SessionUser";
import type { UserRepository } from "../repositories/UserRepository";
import { supabase } from "./client";


export const SupabaseUserRepository: UserRepository = {
    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return { data: null, error };

        // Aquí transformamos el usuario de Supabase a tu formato 'SessionUser'
        const user: SessionUser = {
            profile: {
                id: data.user.id,
                email: data.user.email!,
            }
        };

        return { data: user, error: null };
    },

    fetchRole: async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
        
        return { data: data?.role || null };
    }
};