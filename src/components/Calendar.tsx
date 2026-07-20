import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { monthName } from '@/lib/date'
import { useMagnetic } from '@/hooks/useMagnetic'
import { SPRING } from '@/lib/motion'
import type { Poem } from '@/types/poem'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function CalendarDay({
  day,
  poem,
  isToday,
  onOpen,
}: {
  day: number
  poem: Poem | undefined
  isToday: boolean
  onOpen: (poem: Poem) => void
}) {
  const magneticRef = useMagnetic<HTMLButtonElement>(0.3, 5)

  return (
    <button
      ref={magneticRef}
      type="button"
      disabled={!poem}
      data-cursor={poem ? 'hover' : undefined}
      onClick={() => poem && onOpen(poem)}
      className="mx-auto flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-full text-sm text-ink-soft transition-colors duration-300 enabled:hover:bg-paper-soft enabled:hover:text-ink disabled:text-ink-faint/50"
    >
      <span className={isToday ? 'font-medium text-bronze' : ''}>{day}</span>
      {poem && (
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

export function Calendar({ poems }: { poems: Poem[] }) {
  const navigate = useNavigate()
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const poemsByDay = useMemo(() => {
    const map = new Map<string, Poem>()
    for (const poem of poems) {
      const d = new Date(poem.created_at)
      if (d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth()) {
        map.set(String(d.getDate()), poem)
      }
    }
    return map
  }, [poems, cursor])

  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay()
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`

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

        <AnimatePresence mode="wait">
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-lg italic text-ink"
          >
            {monthName(cursor)} {cursor.getFullYear()}
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
          const poem = poemsByDay.get(String(day))
          const isToday =
            today.getFullYear() === cursor.getFullYear() &&
            today.getMonth() === cursor.getMonth() &&
            today.getDate() === day

          return (
            <CalendarDay
              key={`${monthKey}-${day}`}
              day={day}
              poem={poem}
              isToday={isToday}
              onOpen={(p) => navigate(`/write/${p.id}`)}
            />
          )
        })}
      </div>
    </div>
  )
}
