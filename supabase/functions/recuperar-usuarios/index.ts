// Edge Function: recuperar-usuarios
// Un gerente que olvida los nombres de usuario de sus choferes/trafico introduce su email
// y le enviamos por correo la lista de usuarios de su equipo.

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

    const { data: gerente } = await admin.from("perfiles").select("id,nombre,empresa_id,rol").eq("email", email).eq("rol", "gerente").single();

    // Respuesta generica siempre, para no revelar si el email existe o no.
    const respuestaOk = new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    if (!gerente?.empresa_id) return respuestaOk;

    const { data: empleados } = await admin.from("perfiles").select("nombre,rol,email").eq("empresa_id", gerente.empresa_id).neq("id", gerente.id);

    const filas = (empleados || []).map((e) => {
      const usuario = (e.email || "").split("@")[0];
      const rolLabel = e.rol === "trafico" ? "Trafico" : "Chofer";
      return `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${e.nombre || "-"}</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${rolLabel}</td><td style="padding:6px 12px;border-bottom:1px solid #eee"><strong>${usuario}</strong></td></tr>`;
    }).join("");

    const html = `
      <div style="font-family:sans-serif;color:#222;line-height:1.6">
        <h2>Usuarios de tu equipo en FlotaRentable</h2>
        <p>Has solicitado recuperar los nombres de usuario de tu equipo. Tu propio acceso como gerente es tu email: <strong>${email}</strong>.</p>
        ${filas ? `<table style="border-collapse:collapse;margin-top:1rem"><thead><tr><th style="padding:6px 12px;text-align:left;border-bottom:2px solid #ccc">Nombre</th><th style="padding:6px 12px;text-align:left;border-bottom:2px solid #ccc">Rol</th><th style="padding:6px 12px;text-align:left;border-bottom:2px solid #ccc">Usuario</th></tr></thead><tbody>${filas}</tbody></table>` : "<p>Aun no has creado ningun usuario de chofer/trafico.</p>"}
        <p style="margin-top:2rem"><a href="https://kmrentable.vercel.app" style="background:#FF3D5A;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Abrir FlotaRentable</a></p>
      </div>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FlotaRentable <contacto@flotarentable.com>",
        to: email,
        subject: "Usuarios de tu equipo en FlotaRentable",
        html,
      }),
    });

    return respuestaOk;
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
