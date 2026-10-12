-- Tarefas que começam daqui a `lead_minutes` minutos, na hora local de cada aparelho inscrito.
-- Chamada só pela Edge Function (service_role). Pode ser rodado de novo (idempotente).

-- remove a versão antiga (sem parâmetro) para não ficar duas funções com o mesmo nome
drop function if exists public.tasks_due_now();

create or replace function public.tasks_due_now(lead_minutes int default 10)
returns table (endpoint text, p256dh text, auth text, title text, time_start time)
language sql
security definer
set search_path = public
as $$
  with subs as (
    select s.user_id, s.endpoint, s.p256dh, s.auth,
           (now() at time zone s.timezone) as local_now
    from push_subscriptions s
  ),
  due as (
    -- recorrentes do dia da semana, exceto as que têm override no dia
    select s.endpoint, s.p256dh, s.auth, r.title, r.time_start::time as time_start, s.local_now
    from subs s
    join recurring_tasks r on r.user_id = s.user_id
    where r.active
      and r.day_of_week = extract(dow from s.local_now)::int
      and not exists (
        select 1 from task_overrides o
        where o.recurring_task_id = r.id and o.date = s.local_now::date
      )
    union all
    -- avulsas e editadas só para o dia (skipped fica de fora)
    select s.endpoint, s.p256dh, s.auth,
           coalesce(o.title, r.title), coalesce(o.time_start, r.time_start)::time, s.local_now
    from subs s
    join task_overrides o on o.user_id = s.user_id
    left join recurring_tasks r on r.id = o.recurring_task_id
    where o.status in ('added', 'edited') and o.date = s.local_now::date
  )
  select endpoint, p256dh, auth, title, time_start
  from due
  -- hora de avisar = horário da tarefa menos a antecedência
  where to_char(time_start - make_interval(mins => lead_minutes), 'HH24:MI')
        = to_char(local_now, 'HH24:MI');
$$;

revoke all on function public.tasks_due_now(int) from public, anon, authenticated;
grant execute on function public.tasks_due_now(int) to service_role;
