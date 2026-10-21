import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { dayKey, monthName } from '@/lib/date'
import { useMagnetic } from '@/hooks/useMagnetic'
import { SPRING } from '@/lib/motion'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type Tone = 'paper' | 'romance'

// The studio uses the paper palette; her page uses the candlelit one.
const TONES = {
  paper: {
    day: 'disabled:text-ink-faint/50',
    idle: 'text-ink-soft enabled:hover:bg-paper-soft enabled:hover:text-ink',
    selectedText: 'text-paper',
    selectedBg: 'bg-ink',
    today: 'font-medium text-bronze',
    dot: 'bg-bronze/70',
    title: 'text-ink',
    faint: 'text-ink-faint',
    arrow: 'text-ink-faint hover:text-ink disabled:opacity-25',
  },
  romance: {
    day: 'disabled:text-romance-faint/35',
    idle: 'text-romance-soft enabled:hover:bg-romance-candle/10 enabled:hover:text-romance-ink',
    selectedText: 'text-romance-night',
    selectedBg: 'bg-romance-candle shadow-[0_0_18px_2px_rgb(var(--r-candle)/0.35)]',
    today: 'font-medium text-romance-rose',
    dot: 'bg-romance-rose/80',
    title: 'text-romance-ink',
    faint: 'text-romance-faint',
    arrow: 'text-romance-faint hover:text-romance-ink disabled:opacity-25',
  },
} as const

function monthOf(key: string) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1)
}

function CalendarDay({
  day,
  hasPoem,
  isToday,
  isSelected,
  label,
  onSelect,
  tone,
}: {
  tone: Tone
  day: number
  hasPoem: boolean
  isToday: boolean
  isSelected: boolean
  label: string
  onSelect: () => void
}) {
  const magneticRef = useMagnetic<HTMLButtonElement>(0.3, 5)
  const t = TONES[tone]

  return (
    <button
      ref={magneticRef}
      type="button"
      disabled={!hasPoem}
      aria-pressed={isSelected}
      aria-label={label}
      data-cursor={hasPoem ? 'hover' : undefined}
      onClick={onSelect}
      className={cn(
        'relative mx-auto flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-full text-sm transition-colors duration-300',
        t.day,
        isSelected ? t.selectedText : t.idle,
      )}
    >
      {isSelected && (
        <motion.span
          layoutId="calendar-selected-day"
          transition={SPRING.snappy}
          className={cn('absolute inset-0 rounded-full', t.selectedBg)}
        />
      )}
      <span className={cn('relative', isToday && !isSelected && t.today)}>{day}</span>
      {hasPoem && !isSelected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.gentle}
          className={cn('h-1 w-1 rounded-full', t.dot)}
        />
      )}
    </button>
  )
}

interface CalendarProps {
  /** Day keys (YYYY-MM-DD) that have a poem. */
  poemDays: ReadonlySet<string>
  selectedKey: string | null
  onSelect: (key: string) => void
  tone?: Tone
  /** Month arrows jump straight to the nearest month that has a poem. */
  skipEmptyMonths?: boolean
}

export function Calendar({ poemDays, selectedKey, onSelect, tone = 'paper', skipEmptyMonths = false }: CalendarProps) {
  const t = TONES[tone]
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(() =>
    selectedKey ? monthOf(selectedKey) : new Date(today.getFullYear(), today.getMonth(), 1),
  )

  // Follow the selection across months (e.g. stepping with the arrow keys
  // from Oct 1 back to Sep 30), but leave manual month browsing alone.
  useEffect(() => {
    if (selectedKey) setCursor(monthOf(selectedKey))
  }, [selectedKey])

  const firstWeekday = cursor.getDay()
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`
  const todayKey = dayKey(today)

  // First-of-month dates that hold at least one poem, oldest first.
  const poemMonths = useMemo(() => {
    const seen = new Set<string>()
    for (const key of poemDays) seen.add(key.slice(0, 7))
    return Array.from(seen)
      .sort()
      .map((ym) => monthOf(`${ym}-01`))
  }, [poemDays])

  const step = (dir: -1 | 1) => {
    if (!skipEmptyMonths) {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1))
      return
    }
    const target = dir < 0 ? [...poemMonths].reverse().find((m) => m < cursor) : poemMonths.find((m) => m > cursor)
    if (target) setCursor(target)
  }
  const canStep = (dir: -1 | 1) =>
    !skipEmptyMonths || (dir < 0 ? poemMonths.some((m) => m < cursor) : poemMonths.some((m) => m > cursor))

  const pagesThisMonth = useMemo(() => {
    let n = 0
    for (let d = 1; d <= daysInMonth; d++) {
      if (poemDays.has(dayKey(new Date(cursor.getFullYear(), cursor.getMonth(), d)))) n++
    }
    return n
  }, [poemDays, cursor, daysInMonth])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={!canStep(-1)}
          aria-label="Previous month"
          data-cursor="hover"
          className={cn('p-1 transition-colors duration-300', t.arrow)}
        >
          <ChevronLeft size={17} strokeWidth={1.5} />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <div className={cn('font-display text-lg italic', t.title)}>
              {monthName(cursor)} {cursor.getFullYear()}
            </div>
            <div className={cn('mt-0.5 text-[10px] uppercase tracking-[0.12em]', t.faint)}>
              {pagesThisMonth === 0 ? 'No pages' : pagesThisMonth === 1 ? '1 page' : `${pagesThisMonth} pages`}
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={!canStep(1)}
          aria-label="Next month"
          data-cursor="hover"
          className={cn('p-1 transition-colors duration-300', t.arrow)}
        >
          <ChevronRight size={17} strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-3 text-center">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i} className={cn('text-[10px] uppercase tracking-[0.1em]', t.faint)}>
            {w}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${monthKey}-${i}`} />
          const date = new Date(cursor.getFullYear(), cursor.getMonth(), day)
          const key = dayKey(date)
          const hasPoem = poemDays.has(key)

          return (
            <CalendarDay
              key={key}
              day={day}
              hasPoem={hasPoem}
              isToday={key === todayKey}
              isSelected={key === selectedKey}
              label={`${monthName(date)} ${day}${hasPoem ? '' : ', no poem'}`}
              onSelect={() => onSelect(key)}
              tone={tone}
            />
          )
        })}
      </div>
    </div>
  )
}
