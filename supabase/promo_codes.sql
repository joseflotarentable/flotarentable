-- Codigos promocionales de un solo uso (X meses gratis) y campo de acceso extendido.

alter table public.perfiles add column if not exists acceso_hasta timestamptz;

create table if not exists public.codigos_promo (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  meses int not null,
  usado boolean not null default false,
  usado_por uuid references auth.users(id),
  usado_en timestamptz,
  creado_en timestamptz not null default now()
);

alter table public.codigos_promo enable row level security;

-- Solo se accede a esta tabla a traves de la funcion canjear_codigo_promo (security definer),
-- por lo que no se necesita ninguna policy de select/insert para usuarios normales.

create or replace function public.canjear_codigo_promo(p_codigo text)
returns table(ok boolean, mensaje text, meses int)
language plpgsql
security definer
as $$
declare v_promo record; v_base timestamptz;
begin
  select * into v_promo from public.codigos_promo where codigo = upper(p_codigo) for update;
  if v_promo is null then
    return query select false, 'Codigo no valido', 0;
    return;
  end if;
  if v_promo.usado then
    return query select false, 'Este codigo ya ha sido utilizado', 0;
    return;
  end if;
  select greatest(now(), coalesce(acceso_hasta, now())) into v_base from public.perfiles where id = auth.uid();
  update public.perfiles set acceso_hasta = v_base + (v_promo.meses || ' months')::interval where id = auth.uid();
  update public.codigos_promo set usado = true, usado_por = auth.uid(), usado_en = now() where id = v_promo.id;
  return query select true, 'Codigo aplicado correctamente', v_promo.meses;
end;
$$;

-- Ejemplo para crear codigos (ejecutar manualmente cuando se necesite):
-- insert into public.codigos_promo (codigo, meses) values ('REGALO1MES', 1), ('REGALO6MESES', 6), ('REGALO1ANIO', 12);
