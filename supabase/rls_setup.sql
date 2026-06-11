-- Funcion auxiliar: ids de todos los perfiles de mi misma empresa (incluyendome)
create or replace function public.mi_equipo_ids()
returns text[]
language sql
security definer
stable
as $$
  select coalesce(
    (select array_agg(p.id::text) from public.perfiles p
       where p.empresa_id = (select empresa_id from public.perfiles where id = auth.uid())
         and (select empresa_id from public.perfiles where id = auth.uid()) is not null),
    array[auth.uid()::text]
  )
$$;

-- Funcion auxiliar: empresa_id del usuario autenticado
create or replace function public.mi_empresa_id()
returns uuid
language sql
security definer
stable
as $$
  select empresa_id from public.perfiles where id = auth.uid()
$$;

-- ============ PERFILES ============
alter table public.perfiles enable row level security;

drop policy if exists "perfiles_select_propia_empresa" on public.perfiles;
create policy "perfiles_select_propia_empresa" on public.perfiles
  for select using (id = auth.uid() or empresa_id = public.mi_empresa_id());

drop policy if exists "perfiles_update_propio" on public.perfiles;
create policy "perfiles_update_propio" on public.perfiles
  for update using (id = auth.uid());

drop policy if exists "perfiles_insert_propio" on public.perfiles;
create policy "perfiles_insert_propio" on public.perfiles
  for insert with check (id = auth.uid());

-- ============ EMPRESAS ============
alter table public.empresas enable row level security;

drop policy if exists "empresas_select_propia" on public.empresas;
create policy "empresas_select_propia" on public.empresas
  for select using (id = public.mi_empresa_id() or gerente_id = auth.uid());

drop policy if exists "empresas_update_gerente" on public.empresas;
create policy "empresas_update_gerente" on public.empresas
  for update using (gerente_id = auth.uid());

-- ============ TABLAS CON user_id (viajes, clientes, gastos, gastos_fijos, tractoras, semirremolques) ============
do $$
declare t text;
begin
  foreach t in array array['viajes','clientes','gastos','gastos_fijos','tractoras','semirremolques']
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "%1$s_select" on public.%1$I', t);
    execute format('create policy "%1$s_select" on public.%1$I for select using (user_id::text = any(public.mi_equipo_ids()))', t);

    execute format('drop policy if exists "%1$s_insert" on public.%1$I', t);
    execute format('create policy "%1$s_insert" on public.%1$I for insert with check (user_id::text = any(public.mi_equipo_ids()))', t);

    execute format('drop policy if exists "%1$s_update" on public.%1$I', t);
    execute format('create policy "%1$s_update" on public.%1$I for update using (user_id::text = any(public.mi_equipo_ids()))', t);

    execute format('drop policy if exists "%1$s_delete" on public.%1$I', t);
    execute format('create policy "%1$s_delete" on public.%1$I for delete using (user_id::text = any(public.mi_equipo_ids()))', t);
  end loop;
end $$;
