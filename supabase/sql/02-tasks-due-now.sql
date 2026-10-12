-- Tarefas que começam AGORA, na hora local de cada aparelho inscrito.
-- Chamada só pela Edge Function (service_role).
create or replace function public.tasks_due_now()
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
  where to_char(time_start, 'HH24:MI') = to_char(local_now, 'HH24:MI');
$$;

revoke all on function public.tasks_due_now() from public, anon, authenticated;
grant execute on function public.tasks_due_now() to service_role;
