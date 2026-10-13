import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { resizeToSquareJpeg } from '@/lib/avatarImage'
import { useAuth } from '@/hooks/useAuth'

export const NAME_MIN = 2
export const NAME_MAX = 60

const AVATAR_BUCKET = 'avatars'
const AVATAR_SIZE = 256
const MAX_INPUT_BYTES = 10 * 1024 * 1024

/** Tira espaços das pontas e reduz espaços repetidos a um só. */
function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

/** Caminho do arquivo no bucket, quando a URL é de uma foto nossa (fotos do Google retornam null). */
function avatarPathFromUrl(url: string | null) {
  if (!url) return null
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`
  const index = url.indexOf(marker)
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length))
}

/**
 * Nome e foto do usuário logado, guardados na tabela `profiles`.
 * - Nome: sem valor salvo, cai nos metadados da conta e, por fim, na parte local do e-mail.
 * - Foto: arquivo no bucket `avatars` (pasta do usuário); `profiles.avatar_url` guarda a URL.
 * - Todas as escritas lançam `Error` com o motivo, para a tela mostrar.
 * `enabled` evita buscar enquanto o Perfil está fechado.
 */
export function useProfile(enabled: boolean) {
  const { user } = useAuth()
  const userId = user?.id
  const [profileName, setProfileName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !userId) return
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setProfileName(data?.full_name ?? null)
        setAvatarUrl(data?.avatar_url ?? null)
      })
  }, [enabled, userId])

  const metaName = user?.user_metadata?.full_name ?? user?.user_metadata?.name
  const name =
    profileName || (typeof metaName === 'string' && metaName ? metaName : user?.email?.split('@')[0] ?? 'Usuário')

  const saveName = useCallback(
    async (value: string) => {
      if (!userId) throw new Error('Sessão expirada. Entre novamente.')
      const clean = normalizeName(value)
      if (clean.length < NAME_MIN || clean.length > NAME_MAX) {
        throw new Error(`O nome precisa ter de ${NAME_MIN} a ${NAME_MAX} caracteres.`)
      }
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, full_name: clean }, { onConflict: 'id' })
      if (error) throw new Error(error.message)
      setProfileName(clean)
    },
    [userId],
  )

  const saveAvatar = useCallback(
    async (file: File) => {
      if (!userId) throw new Error('Sessão expirada. Entre novamente.')
      if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.')
      if (file.size > MAX_INPUT_BYTES) throw new Error('Imagem muito grande (máximo de 10 MB).')

      const blob = await resizeToSquareJpeg(file, AVATAR_SIZE)
      // nome novo a cada envio: evita foto antiga presa no cache do navegador e do CDN
      const path = `${userId}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
      if (uploadError) throw new Error(uploadError.message)

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, avatar_url: data.publicUrl }, { onConflict: 'id' })
      if (error) {
        await supabase.storage.from(AVATAR_BUCKET).remove([path])
        throw new Error(error.message)
      }

      // a foto antiga só é apagada depois de a nova estar salva
      const oldPath = avatarPathFromUrl(avatarUrl)
      if (oldPath) await supabase.storage.from(AVATAR_BUCKET).remove([oldPath])
      setAvatarUrl(data.publicUrl)
    },
    [userId, avatarUrl],
  )

  const removeAvatar = useCallback(async () => {
    if (!userId) throw new Error('Sessão expirada. Entre novamente.')
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, avatar_url: null }, { onConflict: 'id' })
    if (error) throw new Error(error.message)

    const oldPath = avatarPathFromUrl(avatarUrl)
    if (oldPath) await supabase.storage.from(AVATAR_BUCKET).remove([oldPath])
    setAvatarUrl(null)
  }, [userId, avatarUrl])

  return { name, avatarUrl, saveName, saveAvatar, removeAvatar }
}
