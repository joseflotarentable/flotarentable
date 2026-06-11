-- Columnas para gestionar la suscripcion de pago tras el periodo de prueba
alter table public.perfiles add column if not exists subscription_status text not null default 'trial';
alter table public.perfiles add column if not exists stripe_customer_id text;
