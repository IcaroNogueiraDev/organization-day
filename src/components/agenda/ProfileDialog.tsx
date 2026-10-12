import { useEffect, useState } from 'react'
import { UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NotificationSection } from '@/components/user/NotificationSection'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profileName, setProfileName] = useState<string | null>(null)
  const userId = user?.id

  // nome guardado na tabela profiles (cadastro por e-mail ou Google)
  useEffect(() => {
    if (!open || !userId) return
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => setProfileName(data?.full_name ?? null))
  }, [open, userId])

  const metaName = user?.user_metadata?.full_name ?? user?.user_metadata?.name
  const name =
    profileName || (typeof metaName === 'string' && metaName ? metaName : user?.email?.split('@')[0] ?? 'Usuário')

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // o listener de auth ainda reflete o estado real da sessão
      console.error('Falha ao sair da conta')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="profile-dialog">
        <DialogHeader>
          <div>
            <p className="task-dialog-eyebrow">SUA CONTA</p>
            <DialogTitle>Perfil</DialogTitle>
            <DialogDescription>Seus dados de acesso e lembretes.</DialogDescription>
          </div>
          <DialogClose asChild>
            <Button className="dialog-close" variant="icon" aria-label="Fechar perfil"><X aria-hidden="true" /></Button>
          </DialogClose>
        </DialogHeader>
        <Card className="profile-card">
          <div className="profile-avatar" aria-hidden="true"><UserRound /></div>
          <div className="profile-copy">
            <strong>{name}</strong>
            <span>{user?.email ?? 'E-mail não informado'}</span>
          </div>
        </Card>
        <NotificationSection />
        <DialogFooter className="profile-actions">
          <Button variant="secondary" onClick={() => navigate('/nova-senha')}>Alterar senha</Button>
          <Button className="profile-logout" variant="secondary" onClick={handleSignOut}>Sair da conta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
