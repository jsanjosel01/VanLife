import { createClient } from '@supabase/supabase-js';

// Obtenemos las variables de entorno definidas en tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación básica para asegurarnos de que las claves están configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan las variables de entorno de Supabase. Revisa tu archivo .env");
}

// Creamos y exportamos la instancia de supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);