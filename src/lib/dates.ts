/** 'YYYY-MM-DD' na data LOCAL (toISOString usa UTC e erra o dia perto da meia-noite). */
export function toLocalDateString(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

/** 'HH:mm' no horário local. */
export function toLocalTimeString(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function isSameDay(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString()
}
