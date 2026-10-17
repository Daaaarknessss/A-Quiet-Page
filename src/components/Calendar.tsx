import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { dayKey, monthName } from '@/lib/date'
import { useMagnetic } from '@/hooks/useMagnetic'
import { SPRING } from '@/lib/motion'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

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
}: {
  day: number
  hasPoem: boolean
  isToday: boolean
  isSelected: boolean
  label: string
  onSelect: () => void
}) {
  const magneticRef = useMagnetic<HTMLButtonElement>(0.3, 5)

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
        'relative mx-auto flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-full text-sm transition-colors duration-300 disabled:text-ink-faint/50',
        isSelected ? 'text-paper' : 'text-ink-soft enabled:hover:bg-paper-soft enabled:hover:text-ink',
      )}
    >
      {isSelected && (
        <motion.span
          layoutId="calendar-selected-day"
          transition={SPRING.snappy}
          className="absolute inset-0 rounded-full bg-ink"
        />
      )}
      <span className={cn('relative', isToday && !isSelected && 'font-medium text-bronze')}>{day}</span>
      {hasPoem && !isSelected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.gentle}
          className="h-1 w-1 rounded-full bg-bronze/70"
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
}

export function Calendar({ poemDays, selectedKey, onSelect }: CalendarProps) {
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
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          aria-label="Previous month"
          data-cursor="hover"
          className="text-ink-faint transition-colors duration-300 hover:text-ink"
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
            <div className="font-display text-lg italic text-ink">
              {monthName(cursor)} {cursor.getFullYear()}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              {pagesThisMonth === 0 ? 'No pages' : pagesThisMonth === 1 ? '1 page' : `${pagesThisMonth} pages`}
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          aria-label="Next month"
          data-cursor="hover"
          className="text-ink-faint transition-colors duration-300 hover:text-ink"
        >
          <ChevronRight size={17} strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-3 text-center">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i} className="text-[10px] uppercase tracking-[0.1em] text-ink-faint">
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
            />
          )
        })}
      </div>
    </div>
  )
}
