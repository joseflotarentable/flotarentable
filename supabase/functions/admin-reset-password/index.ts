// Edge Function: admin-reset-password
// Permite a un gerente asignar una nueva contraseña a un chofer/trafico de su equipo
// (las cuentas internas @flotarentable.local no tienen email real para usar el flujo normal).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { requesterId, targetUserId, newPassword } = await req.json();
    if (!requesterId || !targetUserId || !newPassword) {
      return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400, headers: corsHeaders });
    }
    if (String(newPassword).length < 6) {
      return new Response(JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }), { status: 400, headers: corsHeaders });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: target } = await admin.from("perfiles").select("empresa_id").eq("id", targetUserId).single();
    if (!target?.empresa_id) return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404, headers: corsHeaders });

    const { data: empresa } = await admin.from("empresas").select("gerente_id").eq("id", target.empresa_id).single();
    if (empresa?.gerente_id !== requesterId) {
      return new Response(JSON.stringify({ error: "No tienes permiso para modificar este usuario" }), { status: 403, headers: corsHeaders });
    }

    const { error } = await admin.auth.admin.updateUserById(targetUserId, { password: newPassword });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
