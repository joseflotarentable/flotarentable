// Edge Function: notify-password-reset
// Cuando un chofer/trafico (cuenta interna @flotarentable.local) pulsa "He olvidado mi contraseña",
// el frontend llama a esta funcion en vez de auth.resetPasswordForEmail (que no sirve porque
// esos usuarios no tienen un email real al que pueda llegar el enlace).
// Esta funcion busca el gerente de la empresa de ese usuario y le envia un email avisando.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "Falta el email" }), { status: 400, headers: corsHeaders });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: perfil } = await admin.from("perfiles").select("nombre,rol,empresa_id").eq("email", email).single();
    if (!perfil) return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404, headers: corsHeaders });

    if (!perfil.empresa_id) return new Response(JSON.stringify({ error: "Este usuario no pertenece a ninguna empresa" }), { status: 404, headers: corsHeaders });

    const { data: empresa } = await admin.from("empresas").select("gerente_id,nombre").eq("id", perfil.empresa_id).single();
    if (!empresa?.gerente_id) return new Response(JSON.stringify({ error: "No se encontro el gerente de la empresa" }), { status: 404, headers: corsHeaders });

    const { data: gerente } = await admin.from("perfiles").select("nombre,email").eq("id", empresa.gerente_id).single();
    if (!gerente?.email) return new Response(JSON.stringify({ error: "El gerente no tiene email registrado" }), { status: 404, headers: corsHeaders });

    const rolLabel = perfil.rol === "trafico" ? "Trafico" : "Chofer";
    const username = email.split("@")[0];

    const html = `
      <div style="font-family:sans-serif;color:#222;line-height:1.6">
        <h2>Solicitud de recuperacion de contraseña</h2>
        <p>El usuario <strong>${perfil.nombre || username}</strong> (${rolLabel}, usuario: <strong>${username}</strong>) de tu equipo en <strong>${empresa.nombre || "tu empresa"}</strong> ha solicitado restablecer su contraseña en FlotaRentable.</p>
        <p>Para asignarle una nueva contraseña, entra en la app, ve a <strong>Ajustes → Equipo</strong> y restablece su acceso.</p>
        <p style="margin-top:2rem"><a href="https://kmrentable.vercel.app" style="background:#FF3D5A;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Abrir FlotaRentable</a></p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FlotaRentable <notificaciones@flotarentable.com>",
        to: gerente.email,
        subject: `Recuperacion de contraseña: ${perfil.nombre || username}`,
        html,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: "No se pudo enviar el email", detail: txt }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
