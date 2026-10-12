/** Traduz as mensagens em inglês do Supabase Auth para algo que o usuário entenda. */
export function authErrorMessage(err: unknown, fallback: string): string {
    const message = err instanceof Error ? err.message : ''
    const known: [RegExp, string][] = [
        [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
        [/email not confirmed/i, 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).'],
        [/already registered|already been registered/i, 'Este e-mail já tem uma conta. Tente entrar.'],
        [/password should be at least/i, 'A senha precisa ter pelo menos 6 caracteres.'],
        [/rate limit|too many requests|after \d+ seconds/i, 'Muitas tentativas. Aguarde um pouco e tente de novo.'],
        [/failed to fetch|network/i, 'Sem conexão com o servidor. Verifique sua internet.'],
        [/same password|different from the old/i, 'A nova senha precisa ser diferente da atual.'],
    ]
    for (const [pattern, text] of known) if (pattern.test(message)) return text
    return message || fallback
}
