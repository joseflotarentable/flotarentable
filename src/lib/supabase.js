import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ktfrzckzxnqsqfvglwfh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZnJ6Y2t6eG5xc3Fmdmdsd2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzY0MTQsImV4cCI6MjA5MTQxMjQxNH0.3O4ZZ53Ww6s5hLXiaPBFlpswTkYWKSS5BRMTjWt-A34";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
