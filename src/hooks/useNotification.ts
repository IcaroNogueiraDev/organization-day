import { useCallback, useState } from "react";

export type NotificationStatus = 'unsupported' | 'default' | 'granted' | 'denied'

function getStatus(): NotificationStatus {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        return 'unsupported'
    }
    return Notification.permission
}


/**
 * Permissão e disparo de notificações via service worker.
 * No iOS, `Notification` só existe com o PWA instalado na tela inicial.
 */
export function useNotifications() {
    const [status, setStatus] = useState<NotificationStatus>(getStatus)

    const enable = useCallback(async () => {
        if (getStatus() === 'unsupported') return
        // precisa ser chamado direto de um toque do usuário (regra do iOS)
        const result = await Notification.requestPermission()
        setStatus(result)
        if (result === 'granted') await sendTest()
    }, [])

    const sendTest = useCallback(async () => {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification('Organization Day', {
            body: 'Notificações ativadas! Os lembretes vão aparecer aqui.',
            icon: '/web-app-manifest-192x192.png',
            tag: 'teste',
        })
    }, [])

    return { status, enable, sendTest }
}
