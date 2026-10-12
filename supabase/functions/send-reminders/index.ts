import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

interface DueRow {
  endpoint: string
  p256dh: string
  auth: string
  title: string
  time_start: string
}

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('unauthorized', { status: 401 })
  }

  const { data, error } = await supabase.rpc('tasks_due_now')
  if (error) return new Response(error.message, { status: 500 })

  const rows = (data ?? []) as DueRow[]
  let sent = 0
  const dead: string[] = []
  const failed: { status?: number; body?: string }[] = []

  await Promise.all(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          JSON.stringify({
            title: row.title,
            body: `Agora, ${String(row.time_start).slice(0, 5)}`,
            tag: `${row.title}-${row.time_start}`,
          }),
        )
        sent++
      } catch (e) {
        const { statusCode, body } = e as { statusCode?: number; body?: string }
        // 404/410 = aparelho não existe mais: limpa a inscrição
        if (statusCode === 404 || statusCode === 410) dead.push(row.endpoint)
        else {
          console.error(e)
          failed.push({ status: statusCode, body })
        }
      }
    }),
  )

  if (dead.length) await supabase.from('push_subscriptions').delete().in('endpoint', dead)

  return Response.json({ due: rows.length, sent, removed: dead.length, failed })
})
