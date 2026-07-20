export interface Poem {
  id: string
  title: string | null
  content: string
  created_at: string
  updated_at: string
}

export function firstLine(content: string): string {
  const line = content.split('\n').find((l) => l.trim().length > 0)
  return line?.trim() ?? 'An empty page'
}

export function wordCount(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean)
  return words.length
}

export function readingTimeMinutes(content: string): number {
  const words = wordCount(content)
  return Math.max(1, Math.round(words / 130))
}
