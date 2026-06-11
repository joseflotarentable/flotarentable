// Edge Function: create-checkout-session
// Crea una sesion de Stripe Checkout para que el gerente contrate su plan (starter, pro o flota).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const APP_URL = "https://www.flotarentable.com";

const PRICE_IDS: Record<string, string> = {
  starter: Deno.env.get("STRIPE_PRICE_STARTER")!,
  pro: Deno.env.get("STRIPE_PRICE_PRO")!,
  flota: Deno.env.get("STRIPE_PRICE_FLOTA_BASE")!,
};
const PRICE_FLOTA_EXTRA = Deno.env.get("STRIPE_PRICE_FLOTA_EXTRA")!;
const FLOTA_INCLUIDAS = 10;

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

    const lineItems: { price: string; quantity: number }[] = [{ price: PRICE_IDS[plan], quantity: 1 }];

    if (plan === "flota") {
      const { count } = await admin.from("tractoras").select("id", { count: "exact", head: true }).eq("user_id", userId).neq("activa", false);
      const extra = Math.max((count || 0) - FLOTA_INCLUIDAS, 0);
      if (extra > 0) lineItems.push({ price: PRICE_FLOTA_EXTRA, quantity: extra });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: lineItems,
      client_reference_id: userId,
      allow_promotion_codes: true,
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
