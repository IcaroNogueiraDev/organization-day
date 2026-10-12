import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

export type NotificationStatus = 'unsupported' | 'default' | 'granted' | 'denied'

function getStatus(): NotificationStatus {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        return 'unsupported'
    }
    return Notification.permission
}

function urlBase64ToUint8Array(base64: string) {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

/** Inscreve o aparelho no push e grava/atualiza a inscrição (com o fuso atual) no Supabase. */
async function saveSubscription(userId: string) {
    const registration = await navigator.serviceWorker.ready
    let sub = await registration.pushManager.getSubscription()
    if (!sub) {
        sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
        })
    }
    const json = sub.toJSON()
    const { error } = await supabase.from('push_subscriptions').upsert(
        {
            user_id: userId,
            endpoint: sub.endpoint,
            p256dh: json.keys!.p256dh,
            auth: json.keys!.auth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        { onConflict: 'endpoint' },
    )
    if (error) throw new Error(error.message)
}

/**
 * Permissão e disparo de notificações via service worker.
 * No iOS, `Notification` só existe com o PWA instalado na tela inicial.
 */
export function useNotifications() {
    const [status, setStatus] = useState<NotificationStatus>(getStatus)
    const { user } = useAuth()
    const userId = user?.id

    // grava/atualiza a inscrição sempre que o app abre com permissão concedida
    // (também atualiza o fuso quando mudar de país)
    useEffect(() => {
        if (status !== 'granted' || !userId) return
        saveSubscription(userId).catch(console.error)
    }, [status, userId])

    const sendTest = useCallback(async () => {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification('Organization Day', {
            body: 'Notificações ativadas! Os lembretes vão aparecer aqui.',
            icon: '/web-app-manifest-192x192.png',
            tag: 'teste',
        })
    }, [])

    const enable = useCallback(async () => {
        if (getStatus() === 'unsupported') return
        // precisa ser chamado direto de um toque do usuário (regra do iOS)
        const result = await Notification.requestPermission()
        setStatus(result)
        if (result === 'granted') await sendTest()
    }, [sendTest])

    return { status, enable, sendTest }
}
