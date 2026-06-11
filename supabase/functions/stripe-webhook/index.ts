// Edge Function: stripe-webhook
// Recibe eventos de Stripe y actualiza el estado de suscripcion del gerente en perfiles.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const PRICE_FLOTA_BASE = Deno.env.get("STRIPE_PRICE_FLOTA_BASE")!;
const PRICE_FLOTA_EXTRA = Deno.env.get("STRIPE_PRICE_FLOTA_EXTRA")!;
const FLOTA_INCLUIDAS = 10;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });

// Si la suscripcion incluye el plan Flota, calcula cuantas tractoras tiene contratadas (base + extras).
function tractorasContratadas(items: any[]): number | null {
  let base = false, extra = 0;
  for (const it of items) {
    if (it.price?.id === PRICE_FLOTA_BASE) base = true;
    if (it.price?.id === PRICE_FLOTA_EXTRA) extra = it.quantity || 0;
  }
  return base ? FLOTA_INCLUIDAS + extra : null;
}

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return new Response(`Webhook signature error: ${e}`, { status: 400 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.client_reference_id;
        if (userId) {
          const update: Record<string, unknown> = {
            subscription_status: "active",
            stripe_customer_id: session.customer,
          };
          if (session.subscription) {
            const sub = await stripe.subscriptions.retrieve(session.subscription as string, { expand: ["items.data.price"] });
            const contratadas = tractorasContratadas(sub.items.data as any[]);
            if (contratadas !== null) update.tractoras_contratadas = contratadas;
          }
          await admin.from("perfiles").update(update).eq("id", userId);
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const status = sub.status === "active" || sub.status === "trialing" ? "active" : "inactive";
        const update: Record<string, unknown> = { subscription_status: status };
        const contratadas = tractorasContratadas(sub.items?.data || []);
        if (contratadas !== null) update.tractoras_contratadas = contratadas;
        await admin.from("perfiles").update(update).eq("stripe_customer_id", sub.customer);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        await admin.from("perfiles").update({ subscription_status: "inactive" }).eq("stripe_customer_id", sub.customer);
        break;
      }
    }
  } catch (e) {
    return new Response(`Error procesando evento: ${e}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
