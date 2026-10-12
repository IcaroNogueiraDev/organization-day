import { useNotifications } from "../../hooks/useNotification";

export function NotificationButton() {
  const { status, enable, sendTest } = useNotifications();

  if (status === "unsupported") {
    return (
      <span
        className="text-xs opacity-60"
        title="Instale o app na Tela de Início para ativar"
      >
        Notificações indisponíveis
      </span>
    );
  }

  if (status === "denied") {
    return (
      <span className="text-xs opacity-60">
        Bloqueadas: ative em Ajustes &gt; Notificações &gt; Org Day
      </span>
    );
  }

  if (status === "granted") {
    return (
      <button className="btn btn-sm btn-ghost" onClick={sendTest}>
        🔔 Testar
      </button>
    );
  }

  return (
    <button className="btn btn-sm btn-primary" onClick={enable}>
      🔔 Ativar notificações
    </button>
  );
}
