import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This check helps you find bugs faster if you forget to set the keys
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);