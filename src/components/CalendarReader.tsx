import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, PenLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Calendar } from '@/components/Calendar'
import { PaperContainer } from '@/components/PaperContainer'
import { dayKey, formatLongDate, weekdayName } from '@/lib/date'
import { EASE } from '@/lib/motion'
import { wordCount, type Poem } from '@/types/poem'

interface CalendarReaderProps {
  /** Newest first, already filtered by search/year. */
  poems: Poem[]
  selectedKey: string | null
  onSelect: (key: string) => void
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

// Pick a day on the calendar and read that day's poem beside it, without
// scrolling through the whole archive or opening the editor.
export function CalendarReader({ poems, selectedKey, onSelect }: CalendarReaderProps) {
  const { byDay, keys } = useMemo(() => {
    const map = new Map<string, Poem>()
    for (const poem of poems) {
      const key = dayKey(new Date(poem.created_at))
      if (!map.has(key)) map.set(key, poem)
    }
    return { byDay: map, keys: Array.from(map.keys()) } // newest first
  }, [poems])

  const activeKey = selectedKey && byDay.has(selectedKey) ? selectedKey : (keys[0] ?? null)
  const poem = activeKey ? byDay.get(activeKey)! : null
  const index = activeKey ? keys.indexOf(activeKey) : -1
  const olderKey = index >= 0 ? keys[index + 1] : undefined
  const newerKey = index > 0 ? keys[index - 1] : undefined

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      if (e.key === 'ArrowLeft' && olderKey) onSelect(olderKey)
      if (e.key === 'ArrowRight' && newerKey) onSelect(newerKey)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [olderKey, newerKey, onSelect])

  const poemDays = useMemo(() => new Set(keys), [keys])

  return (
    <div className="grid gap-10 md:grid-cols-[260px_minmax(0,1fr)] md:gap-12">
      <div className="md:sticky md:top-10 md:self-start">
        <Calendar poemDays={poemDays} selectedKey={activeKey} onSelect={onSelect} />
        <p className="mt-6 hidden text-center text-[11px] text-ink-faint md:block">← → to turn the pages</p>
      </div>

      <PaperContainer className="min-h-[340px] px-7 py-9 sm:px-10 sm:py-11">
        <AnimatePresence mode="wait" initial={false}>
          {poem ? (
            <motion.article
              key={poem.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: EASE.quiet }}
              className="flex h-full flex-col"
            >
              <div className="mb-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                {weekdayName(new Date(poem.created_at))}
              </div>
              <h2 className="font-display text-3xl font-light text-ink">
                {formatLongDate(new Date(poem.created_at))}, {new Date(poem.created_at).getFullYear()}
              </h2>

              <p className="drop-cap mt-8 flex-1 whitespace-pre-line font-serif text-[21px] leading-[1.8] text-ink sm:text-[22px]">
                {poem.content}
              </p>

              <div className="mt-10 flex items-center justify-between border-t border-line/70 pt-5 text-xs text-ink-faint">
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => olderKey && onSelect(olderKey)}
                    disabled={!olderKey}
                    data-cursor="hover"
                    aria-label="Previous poem"
                    className="flex items-center gap-1.5 transition-colors duration-300 hover:text-ink disabled:opacity-30"
                  >
                    <ArrowLeft size={13} strokeWidth={1.5} /> Older
                  </button>
                  <button
                    type="button"
                    onClick={() => newerKey && onSelect(newerKey)}
                    disabled={!newerKey}
                    data-cursor="hover"
                    aria-label="Next poem"
                    className="flex items-center gap-1.5 transition-colors duration-300 hover:text-ink disabled:opacity-30"
                  >
                    Newer <ArrowRight size={13} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex items-center gap-5">
                  <span className="hidden sm:inline">{wordCount(poem.content)} words</span>
                  <Link
                    to={`/studio/write/${poem.id}`}
                    data-cursor="hover"
                    className="flex items-center gap-1.5 transition-colors duration-300 hover:text-ink"
                  >
                    <PenLine size={13} strokeWidth={1.5} /> Edit
                  </Link>
                </div>
              </div>
            </motion.article>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center font-display italic text-ink-faint"
            >
              No pages match your search.
            </motion.p>
          )}
        </AnimatePresence>
      </PaperContainer>
    </div>
  )
}
