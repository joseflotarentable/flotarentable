import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ktfrzckzxnqsqfvglwfh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZnJ6Y2t6eG5xc3Fmdmdsd2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzY0MTQsImV4cCI6MjA5MTQxMjQxNH0.3O4ZZ53Ww6s5hLXiaPBFlpswTkYWKSS5BRMTjWt-A34";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cliente "desechable" para crear cuentas de empleados (chofer/trafico) desde Ajustes
// sin que se cierre la sesion del gerente. Cada llamada crea un cliente nuevo
// con su propio almacenamiento en memoria (no toca localStorage de la sesion principal).
export function crearClienteTemporal(){
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
}

// Dominio interno para usuarios sin email real (chofer/trafico creados por el gerente)
export const DOMINIO_USUARIO = "flotarentable.local";
