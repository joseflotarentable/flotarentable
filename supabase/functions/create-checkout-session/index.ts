// Edge Function: create-checkout-session
// Crea una sesion de Stripe Checkout para que el gerente contrate el plan mensual o anual.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const APP_URL = "https://www.flotarentable.com";

const PRICE_IDS: Record<string, string> = {
  mensual: "price_1Tgx5nHutHYU16KfeZHoWasq",
  anual: "price_1TgxEPHutHYU16KfNsgt0t4l",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId, plan } = await req.json();
    if (!userId || !PRICE_IDS[plan]) {
      return new Response(JSON.stringify({ error: "Datos invalidos" }), { status: 400, headers: corsHeaders });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: perfil } = await admin.from("perfiles").select("email,stripe_customer_id").eq("id", userId).single();
    if (!perfil) return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404, headers: corsHeaders });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      client_reference_id: userId,
      ...(perfil.stripe_customer_id
        ? { customer: perfil.stripe_customer_id }
        : { customer_email: perfil.email || undefined }),
      success_url: `${APP_URL}/?checkout=success`,
      cancel_url: `${APP_URL}/?checkout=cancel`,
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
