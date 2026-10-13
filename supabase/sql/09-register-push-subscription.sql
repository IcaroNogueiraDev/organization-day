-- Registra (ou "adota") a inscrição push do aparelho para o usuário logado.
-- Motivo: o endpoint identifica o APARELHO. Se o mesmo celular já foi usado por outra conta
-- (e-mail e Google, por exemplo), o upsert direto na tabela é barrado pela RLS, porque a linha
-- pertence à outra conta. Esta função troca o dono para quem está logado agora.
-- Pode ser rodada de novo (idempotente).

create or replace function public.register_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_timezone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, timezone)
  values (uid, p_endpoint, p_p256dh, p_auth, p_timezone)
  on conflict (endpoint) do update
    set user_id = excluded.user_id,
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        timezone = excluded.timezone;
end;
$$;

revoke all on function public.register_push_subscription(text, text, text, text) from public, anon;
grant execute on function public.register_push_subscription(text, text, text, text) to authenticated;

notify pgrst, 'reload schema';
