import { useNotifications } from '@/hooks/useNotification'
import { Button } from '@/components/ui/button'

/** Bloco de lembretes do Perfil: ativar, estado da inscrição e notificação de teste. */
export function NotificationSection() {
  const { status, subscribed, subscriptionError, enable, sendTest } = useNotifications()

  let body
  if (status === 'unsupported') {
    body = <p>Indisponível neste navegador. No iPhone, instale o app na Tela de Início para ativar.</p>
  } else if (status === 'denied') {
    body = <p>Bloqueadas. Ative em Ajustes &gt; Notificações &gt; Org Day.</p>
  } else if (status === 'granted') {
    body = (
      <>
        {subscriptionError ? (
          <p className="profile-section-error">Lembretes com erro: {subscriptionError}</p>
        ) : (
          <p>{subscribed ? '✓ Lembretes ativos. Você é avisado 10 minutos antes de cada tarefa.' : 'Ativando lembretes…'}</p>
        )}
        <div className="profile-section-row">
          <Button variant="secondary" onClick={sendTest}>Enviar teste</Button>
        </div>
      </>
    )
  } else {
    body = (
      <>
        <p>Receba um aviso no celular antes de cada tarefa.</p>
        <div className="profile-section-row">
          <Button className="submit-button" variant="submit" onClick={enable}>Ativar notificações</Button>
        </div>
      </>
    )
  }

  return (
    <section className="profile-section" aria-label="Notificações">
      <h3>Notificações</h3>
      {body}
    </section>
  )
}
