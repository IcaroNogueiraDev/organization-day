import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Camera, Pencil, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NotificationSection } from '@/components/user/NotificationSection'
import { useAuth } from '@/hooks/useAuth'
import { NAME_MAX, useProfile } from '@/hooks/useProfile'
import { useNavigate } from 'react-router-dom'

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { name, avatarUrl, saveName, saveAvatar, removeAvatar } = useProfile(open)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const runPhotoAction = async (action: () => Promise<void>, fallback: string) => {
    setPhotoBusy(true)
    setPhotoError(null)
    try {
      await action()
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : fallback)
    } finally {
      setPhotoBusy(false)
    }
  }

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // permite escolher o mesmo arquivo de novo
    if (file) void runPhotoAction(() => saveAvatar(file), 'Erro ao enviar a foto')
  }

  const startEditing = () => {
    setDraft(name)
    setNameError(null)
    setEditing(true)
  }

  const handleSaveName = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setNameError(null)
    try {
      await saveName(draft)
      setEditing(false)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Erro ao salvar o nome')
    } finally {
      setSaving(false)
    }
  }

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
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Sua foto de perfil" referrerPolicy="no-referrer" />
              ) : (
                <UserRound aria-hidden="true" />
              )}
            </div>
            <button
              className="profile-avatar-edit"
              type="button"
              aria-label={avatarUrl ? 'Trocar foto' : 'Adicionar foto'}
              disabled={photoBusy}
              onClick={() => fileInput.current?.click()}
            >
              <Camera aria-hidden="true" />
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handlePhotoChange}
            />
          </div>
          <div className="profile-copy">
            {editing ? (
              <form className="profile-name-form" onSubmit={handleSaveName}>
                <Input
                  className="profile-name-input"
                  aria-label="Nome de exibição"
                  value={draft}
                  maxLength={NAME_MAX}
                  autoFocus
                  autoComplete="name"
                  disabled={saving}
                  onChange={(event) => setDraft(event.target.value)}
                />
                {nameError && <span className="profile-section-error" role="alert">{nameError}</span>}
                <div className="profile-name-actions">
                  <Button variant="submit" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                  <Button variant="secondary" disabled={saving} onClick={() => setEditing(false)}>Cancelar</Button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-name-row">
                  <strong>{name}</strong>
                  <button className="profile-edit" type="button" aria-label="Editar nome" onClick={startEditing}>
                    <Pencil aria-hidden="true" />
                  </button>
                </div>
                <span>{user?.email ?? 'E-mail não informado'}</span>
                {photoBusy && <span>Enviando foto...</span>}
                {photoError && <span className="profile-section-error" role="alert">{photoError}</span>}
                {avatarUrl && !photoBusy && (
                  <button
                    className="profile-photo-remove"
                    type="button"
                    onClick={() => void runPhotoAction(removeAvatar, 'Erro ao remover a foto')}
                  >
                    Remover foto
                  </button>
                )}
              </>
            )}
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
