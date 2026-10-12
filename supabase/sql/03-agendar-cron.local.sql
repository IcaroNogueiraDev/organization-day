-- Agenda o envio de lembretes a cada minuto. CONTÉM SEGREDO: não commitar (.local é ignorado).
create extension if not exists pg_cron;
create extension if not exists pg_net;

select vault.create_secret('b07b9ec49571f19f32b069ed6ce12ee5f736755217d63bd9', 'cron_secret');

select cron.schedule('send-reminders', '* * * * *', $$
  select net.http_post(
    url := 'https://vsrscljbnmbwnvuajida.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
$$);
