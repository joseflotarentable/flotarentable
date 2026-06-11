-- Cierra el leak: cualquier usuario autenticado podia leer nombre/codigo/miembros
-- de empresas ajenas. Eliminamos cualquier policy de select existente en "empresas"
-- y dejamos solo el acceso a la propia empresa. Para el alta de choferes (que
-- necesitan consultar una empresa por codigo antes de pertenecer a ella) se usan
-- funciones RPC con permisos controlados, sin exponer toda la fila.

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname='public' and tablename='empresas'
  loop
    execute format('drop policy if exists %I on public.empresas', pol.policyname);
  end loop;
end $$;

create policy "empresas_select_propia" on public.empresas
  for select using (id = public.mi_empresa_id() or gerente_id = auth.uid());

create policy "empresas_insert_propio" on public.empresas
  for insert with check (gerente_id = auth.uid());

create policy "empresas_update_gerente" on public.empresas
  for update using (gerente_id = auth.uid());

-- Devuelve solo id y nombre de una empresa a partir de su codigo (para validar
-- el codigo FR-XXXX al registrarse como chofer/trafico).
create or replace function public.empresa_por_codigo(p_codigo text)
returns table(id uuid, nombre text)
language sql
security definer
stable
as $$
  select id, nombre from public.empresas where codigo = p_codigo
$$;

-- Anade al usuario autenticado a los miembros de la empresa con ese codigo
-- y devuelve el id de la empresa (o null si el codigo no existe).
create or replace function public.unirse_empresa_por_codigo(p_codigo text)
returns uuid
language plpgsql
security definer
as $$
declare v_empresa_id uuid; v_miembros text[];
begin
  select id, miembros into v_empresa_id, v_miembros from public.empresas where codigo = p_codigo;
  if v_empresa_id is null then return null; end if;
  if not (auth.uid()::text = any(coalesce(v_miembros, '{}'))) then
    update public.empresas set miembros = array_append(coalesce(v_miembros,'{}'), auth.uid()::text) where id = v_empresa_id;
  end if;
  return v_empresa_id;
end;
$$;
