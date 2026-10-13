import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'

export const NAME_MIN = 2
export const NAME_MAX = 60

/** Tira espaços das pontas e reduz espaços repetidos a um só. */
function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

/**
 * Nome de exibição do usuário logado.
 * - Lido da tabela `profiles` (preenchida pelo cadastro ou pelo Google).
 * - Sem nome salvo, cai nos metadados da conta e, por fim, na parte local do e-mail.
 * - `saveName` valida o tamanho e grava em `profiles.full_name`; erros são lançados.
 * `enabled` evita buscar enquanto o Perfil está fechado.
 */
export function useProfile(enabled: boolean) {
  const { user } = useAuth()
  const userId = user?.id
  const [profileName, setProfileName] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !userId) return
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => setProfileName(data?.full_name ?? null))
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

  return { name, saveName }
}
