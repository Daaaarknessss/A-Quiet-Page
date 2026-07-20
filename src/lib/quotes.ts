const QUOTES = [
  'Every day leaves behind a single sentence.',
  'Write what the light looked like today.',
  'A quiet mind fills an empty page.',
  'Some days are best kept in a few lines.',
  'Let today settle into words before it goes.',
  'Not every thought needs an audience.',
  'The blank page is only waiting.',
  'Small words can hold a whole day.',
]

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function quoteOfTheDay(date: Date = new Date()): string {
  return QUOTES[dayOfYear(date) % QUOTES.length]
}
