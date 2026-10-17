const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function weekdayName(date: Date): string {
  return WEEKDAYS[date.getDay()]
}

export function monthName(date: Date): string {
  return MONTHS[date.getMonth()]
}

export function formatLongDate(date: Date): string {
  return `${monthName(date)} ${date.getDate()}`
}

export function formatCardDate(date: Date): { day: string; month: string; year: string } {
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: MONTHS[date.getMonth()].slice(0, 3),
    year: String(date.getFullYear()),
  }
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((utcA - utcB) / msPerDay)
}

export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0
  const uniqueDays = Array.from(
    new Set(dates.map((d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)),
  )
    .map((key) => {
      const [y, m, d] = key.split('-').map(Number)
      return new Date(y, m, d)
    })
    .sort((a, b) => b.getTime() - a.getTime())

  const today = new Date()
  let streak = 0
  let cursor = today

  if (daysBetween(today, uniqueDays[0]) > 1) return 0

  for (const day of uniqueDays) {
    const diff = daysBetween(cursor, day)
    if (diff === 0 || diff === 1) {
      streak += 1
      cursor = day
    } else {
      break
    }
  }

  return streak
}

// Stable local-calendar key (YYYY-MM-DD) for a date, used to match poems
// to calendar days and to keep the selected day in the URL.
export function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}
