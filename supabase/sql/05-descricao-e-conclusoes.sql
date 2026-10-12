-- Novo frontend: descrição da tarefa + tarefa concluída por dia.
-- Só mudanças aditivas (nada é apagado). Pode ser rodado de novo (idempotente).
-- A função antiga get_tasks_for_day continua existindo; o app novo usa get_day_agenda.

alter table public.recurring_tasks add column if not exists description text;
alter table public.task_overrides  add column if not exists description text;

-- Conclusões: uma linha por tarefa concluída em uma data.
-- task_key = 'r:<id da recorrente>' (recorrentes e editadas só no dia) ou 'o:<id do override>' (avulsas)
create table if not exists public.task_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  task_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, date, task_key)
);

alter table public.task_completions enable row level security;

drop policy if exists "completions_select" on public.task_completions;
drop policy if exists "completions_insert" on public.task_completions;
drop policy if exists "completions_delete" on public.task_completions;
create policy "completions_select" on public.task_completions for select using (auth.uid() = user_id);
create policy "completions_insert" on public.task_completions for insert with check (auth.uid() = user_id);
create policy "completions_delete" on public.task_completions for delete using (auth.uid() = user_id);

-- Agenda do dia já mesclada (recorrentes + overrides) com descrição e conclusão.
-- security invoker: respeita o RLS do usuário logado.
create or replace function public.get_day_agenda(target_date date)
returns table (
  id text,
  title text,
  description text,
  time_start time,
  time_end time,
  source text,
  recurring_task_id text,
  task_key text,
  completed boolean
)
language sql
stable
set search_path = public
as $$
  with items as (
    -- recorrentes do dia da semana, exceto as que têm override no dia (editadas ou puladas)
    select r.id::text as id, r.title, r.description,
           r.time_start::time as time_start, r.time_end::time as time_end,
           'recurring'::text as source, r.id::text as recurring_task_id,
           'r:' || r.id::text as task_key
    from recurring_tasks r
    where r.user_id = auth.uid()
      and r.active
      and r.day_of_week = extract(dow from target_date)::int
      and not exists (
        select 1 from task_overrides o
        where o.recurring_task_id = r.id and o.date = target_date and o.user_id = auth.uid()
      )
    union all
    -- avulsas (added) e editadas só para o dia (edited); skipped fica de fora
    select o.id::text, coalesce(o.title, r.title), coalesce(o.description, r.description),
           coalesce(o.time_start, r.time_start)::time, coalesce(o.time_end, r.time_end)::time,
           'override'::text, o.recurring_task_id::text,
           case when o.recurring_task_id is not null
                then 'r:' || o.recurring_task_id::text
                else 'o:' || o.id::text end
    from task_overrides o
    left join recurring_tasks r on r.id = o.recurring_task_id
    where o.user_id = auth.uid()
      and o.date = target_date
      and o.status in ('added', 'edited')
  )
  select i.id, i.title, i.description, i.time_start, i.time_end, i.source,
         i.recurring_task_id, i.task_key,
         exists (
           select 1 from task_completions c
           where c.user_id = auth.uid() and c.date = target_date and c.task_key = i.task_key
         ) as completed
  from items i
  order by i.time_start, i.title;
$$;

grant execute on function public.get_day_agenda(date) to authenticated;
