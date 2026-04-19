// src/database/repositories/index.ts
import { SupabaseUserRepository } from '../supabase/SupabaseUserRepository';
import type { UserRepository } from './UserRepository';


// Aquí decides que la implementación real es Supabase
export const userRepository: UserRepository = SupabaseUserRepository;