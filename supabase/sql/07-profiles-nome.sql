-- Nome de exibição editável: o usuário passa a gravar o próprio nome em profiles.
-- Pode ser rodado de novo (idempotente). Nada é apagado.

-- permite o usuário criar a própria linha (o app usa upsert, caso o trigger não tenha criado)
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);

-- tamanho do nome (2 a 60 caracteres). NOT VALID: vale para gravações novas
-- e não reprova nomes antigos que já estavam na tabela.
alter table public.profiles drop constraint if exists profiles_full_name_length;
alter table public.profiles
  add constraint profiles_full_name_length
  check (full_name is null or char_length(trim(full_name)) between 2 and 60) not valid;
