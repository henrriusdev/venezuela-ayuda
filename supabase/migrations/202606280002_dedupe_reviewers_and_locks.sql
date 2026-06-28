-- 202606280002 · Revisores de deduplicación + locks de grupo
--
-- Problema: la consola /deduplicar lista miles de grupos (GRP-xxxxx) idénticos
-- para todos. Sin coordinación, dos revisores abren el MISMO grupo y duplican
-- el trabajo (o colisionan al confirmar/quitar registros).
--
-- Solución en dos partes:
--   1. `reviewer_emails` — allowlist de quién puede entrar a /deduplicar
--      (mismo patrón que admin_emails: server-only, sin policies → RLS lo cierra).
--   2. `group_locks` — un "claim" por grupo. Cuando un revisor abre un grupo,
--      lo reclama; mientras lo tenga, a los demás les aparece tomado. El lock
--      EXPIRA (expires_at) para que un revisor que cierra la pestaña sin liberar
--      no deje el grupo bloqueado para siempre: la consola hace heartbeat y, si
--      deja de hacerlo, el lock caduca y otro lo puede tomar.
--
-- Todas las escrituras van por el service key (RPC/SDK que bypassa RLS), igual
-- que el resto del proyecto — por eso no definimos policies para anon/auth.

-- Allowlist de revisores. Un email aquí + contraseña propia (Supabase Auth) =
-- acceso a /deduplicar. Reusa el mismo flujo de "primera vez crea contraseña"
-- que /admin.
create table if not exists reviewer_emails (
  email      text primary key,
  added_by   text,
  created_at timestamptz not null default now()
);
alter table reviewer_emails enable row level security; -- no policies → server-only

-- Un admin ya autorizado también es revisor por defecto (se evalúa en la app),
-- pero sembramos al menos uno explícito para arrancar.
insert into reviewer_emails (email, added_by)
  values ('shinji.256@gmail.com', 'seed')
  on conflict (email) do nothing;

-- Lock por grupo. group_id es el GRP-xxxxx que sirve la API externa de dedup;
-- es la clave natural y única, así que sirve de PK (un grupo = a lo sumo un
-- lock activo).
create table if not exists group_locks (
  group_id        text primary key,
  locked_by       text not null,          -- user.id del revisor (auth.users.id)
  locked_by_email text,                    -- email para mostrar "tomado por X"
  locked_at       timestamptz not null default now(),
  expires_at      timestamptz not null    -- el heartbeat lo empuja hacia adelante
);
create index if not exists group_locks_expires_idx on group_locks (expires_at);

alter table group_locks enable row level security; -- writes via service key only

-- Toma (o renueva) el lock de un grupo de forma ATÓMICA. Devuelve true si el
-- llamante se queda con el lock, false si otro revisor lo tiene y aún no expira.
--
-- Lógica:
--   · Si no hay lock, o el lock existente ya expiró, o es del mismo revisor →
--     (re)asigna el lock a este revisor y empuja expires_at → true.
--   · Si lo tiene OTRO revisor y sigue vigente → no toca nada → false.
--
-- Concurrencia: bajo READ COMMITTED un `insert ... on conflict do update` cuyo
-- WHERE descarta la fila es un no-op SILENCIOSO — no bloquea la fila existente,
-- así que un `select` posterior es una carrera (puede leer un estado a medias de
-- otro claim simultáneo). Para que sea de verdad atómico tomamos primero un row
-- lock explícito (`for update`) sobre la fila del grupo: eso SERIALIZA a los
-- claimers del mismo group_id. El que entra primero decide y libera el lock de
-- fila al hacer commit; el segundo espera, re-lee el estado YA actualizado y
-- decide sobre datos consistentes.
create or replace function claim_group_lock(
  p_group_id text,
  p_user_id  text,
  p_email    text,
  p_ttl_seconds integer default 180
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner text;
begin
  -- Serializa a los claimers del mismo grupo: el segundo espera aquí hasta que
  -- el primero haga commit, y entonces ve el estado definitivo. (Si la fila aún
  -- no existe no hay nada que bloquear; el INSERT de abajo serializa ese caso
  -- vía la PK única de group_id.)
  perform 1
    from group_locks
   where group_id = p_group_id
   for update;

  -- (Re)asigna el lock SOLO si está libre, expirado o ya es de este revisor.
  -- El WHERE en el DO UPDATE evita robarle un lock vigente a otro revisor; si la
  -- condición falla, el upsert es no-op y abajo descubrimos quién lo tiene.
  insert into group_locks (group_id, locked_by, locked_by_email, locked_at, expires_at)
    values (p_group_id, p_user_id, p_email, now(), now() + make_interval(secs => p_ttl_seconds))
  on conflict (group_id) do update
    set locked_by       = excluded.locked_by,
        locked_by_email = excluded.locked_by_email,
        locked_at       = now(),
        expires_at      = excluded.expires_at
    where group_locks.locked_by = excluded.locked_by   -- mismo revisor: renueva
       or group_locks.expires_at < now();              -- o el anterior ya caducó

  -- Tras el upsert (y con la fila ya serializada) lee el dueño real: true solo
  -- si quedó a nombre de este revisor.
  select locked_by into v_owner
    from group_locks
   where group_id = p_group_id;
  return coalesce(v_owner = p_user_id, false);
end;
$$;

-- Libera el lock SOLO si lo tiene este revisor (no puede soltar el de otro).
create or replace function release_group_lock(
  p_group_id text,
  p_user_id  text
) returns void
language sql
security definer
set search_path = public
as $$
  delete from group_locks
   where group_id = p_group_id and locked_by = p_user_id;
$$;

-- Lista los locks vigentes (no expirados) para pintar el estado de la cola.
create or replace function active_group_locks()
returns table (group_id text, locked_by text, locked_by_email text, expires_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select group_id, locked_by, locked_by_email, expires_at
    from group_locks
   where expires_at > now();
$$;

-- Las funciones corren con el service key (security definer); revoca el execute
-- de los roles públicos para que solo el servidor las invoque.
revoke all on function claim_group_lock(text, text, text, integer) from anon, authenticated;
revoke all on function release_group_lock(text, text) from anon, authenticated;
revoke all on function active_group_locks() from anon, authenticated;

insert into applied_migrations (version) values ('202606280002') on conflict do nothing;
