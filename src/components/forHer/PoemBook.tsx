import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Calendar } from '@/components/Calendar'
import { dayKey, formatLongDate, weekdayName } from '@/lib/date'
import { EASE, prefersReducedMotion } from '@/lib/motion'
import { getScrollY, scrollToY } from '@/lib/scroll'
import type { SharedPoem } from '@/types/forHer'

const SWIPE_PX = 60

// Ink timing: when the first line starts, the gap between lines, and how
// long a whole poem may take however long it is.
const INK_START = 0.35
const INK_STEP = 0.14
const INK_MAX = 3
const INK_GAP = 0.4

function poemLines(content: string) {
  return content.trim().split('\n')
}

function inkStep(lineCount: number) {
  return Math.min(INK_STEP, INK_MAX / Math.max(lineCount, 1))
}

function inkDuration(content: string) {
  const count = poemLines(content).length
  return count * inkStep(count)
}

/**
 * A poem that appears line by line, each one surfacing from a soft blur as
 * if the ink were still settling. The first letter can be a candlelit
 * initial.
 */
function InkedPoem({
  content,
  delay,
  dropCap,
  still,
}: {
  content: string
  delay: number
  dropCap: boolean
  still: boolean
}) {
  const lines = poemLines(content)
  const step = inkStep(lines.length)

  return (
    <div className="font-serif text-[20px] leading-[1.85] text-romance-ink sm:text-[22px]">
      {lines.map((line, i) => {
        const initial = i === 0 && dropCap ? line.match(/^[\p{P}\s]*[\p{L}\p{N}]/u)?.[0] : undefined
        return (
          <motion.span
            key={i}
            className="block min-h-[1.85em]"
            initial={still ? { opacity: 0 } : { opacity: 0, y: 5, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            transition={{ duration: still ? 0.4 : 1.1, delay: still ? 0 : delay + i * step, ease: EASE.quiet }}
          >
            {initial ? (
              <>
                <span className="drop-cap-letter">{initial.trim()}</span>
                {line.slice(initial.length)}
              </>
            ) : (
              line
            )}
          </motion.span>
        )
      })}
    </div>
  )
}

/**
 * Her book as a calendar: pick any day with a glowing dot to read what was
 * written then. Swipe, the arrows, or ← → step to the neighbouring poem.
 */
export function PoemBook({ poems }: { poems: SharedPoem[] }) {
  // Poems grouped by day; keys oldest → newest.
  const { byDay, keys } = useMemo(() => {
    const map = new Map<string, SharedPoem[]>()
    for (const poem of poems) {
      const key = dayKey(new Date(poem.created_at))
      map.set(key, [...(map.get(key) ?? []), poem])
    }
    return { byDay: map, keys: Array.from(map.keys()).sort() }
  }, [poems])

  const poemDays = useMemo(() => new Set(keys), [keys])
  // Open on the most recent page.
  const [[selected, direction], setSelected] = useState<[string | null, number]>([null, 0])
  const activeKey = selected && byDay.has(selected) ? selected : (keys[keys.length - 1] ?? null)
  const index = activeKey ? keys.indexOf(activeKey) : -1
  const dayPoems = activeKey ? (byDay.get(activeKey) ?? []) : []

  const readerRef = useRef<HTMLDivElement>(null)
  const still = prefersReducedMotion()

  const bringReaderIntoView = () => {
    const el = readerRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top
    // Above the fold, or (on phones, where it sits under the calendar) far down.
    if (top < 0 || top > window.innerHeight * 0.6) scrollToY(getScrollY() + top - 32, { smooth: true })
  }

  const select = useCallback(
    (key: string) => {
      setSelected(([prev]) => {
        const from = prev && byDay.has(prev) ? prev : keys[keys.length - 1]
        return [key, key > (from ?? '') ? 1 : -1]
      })
    },
    [byDay, keys],
  )

  const step = useCallback(
    (dir: -1 | 1) => {
      const next = keys[index + dir]
      if (!next) return
      setSelected([next, dir])
    },
    [keys, index],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_PX) step(1)
    else if (info.offset.x > SWIPE_PX) step(-1)
  }

  if (!activeKey) return null
  const date = new Date(dayPoems[0].created_at)

  // Each poem on the page starts inking once the one before it is written.
  const inkDelays = dayPoems.reduce<number[]>((delays, _poem, i) => {
    const prev = i === 0 ? INK_START - INK_GAP : delays[i - 1] + inkDuration(dayPoems[i - 1].content)
    return [...delays, prev + INK_GAP]
  }, [])

  return (
    <div className="grid gap-10 md:grid-cols-[270px_minmax(0,1fr)] md:gap-12">
      <div className="md:sticky md:top-10 md:self-start">
        <div className="rounded-[22px] border border-romance-line/60 bg-romance-candle/[0.04] px-5 py-6">
          <Calendar
            tone="romance"
            skipEmptyMonths
            poemDays={poemDays}
            selectedKey={activeKey}
            onSelect={(key) => {
              select(key)
              bringReaderIntoView()
            }}
          />
        </div>
        <p className="mt-5 text-center font-sans text-[10px] uppercase tracking-[0.26em] text-romance-faint">
          {keys.length} {keys.length === 1 ? 'day' : 'days'} of you
        </p>
      </div>

      <div ref={readerRef} className="min-w-0" style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.article
            key={activeKey}
            custom={direction}
            variants={{
              enter: (d: number) =>
                still ? { opacity: 0 } : { opacity: 0, x: d * 50, rotateY: d * -8, filter: 'blur(4px)' },
              center: { opacity: 1, x: 0, rotateY: 0, filter: 'blur(0px)' },
              exit: (d: number) =>
                still ? { opacity: 0 } : { opacity: 0, x: d * -50, rotateY: d * 8, filter: 'blur(4px)' },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: EASE.quiet }}
            drag={keys.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={onDragEnd}
            className="relative touch-pan-y overflow-hidden rounded-[22px] border border-romance-line/60 bg-gradient-to-b from-romance-candle/[0.07] via-romance-rose/[0.03] to-transparent px-7 pb-9 pt-10 shadow-[0_30px_80px_-40px_rgb(var(--r-candle)/0.35)] sm:px-12 sm:pb-12 sm:pt-12"
          >
            {/* paper: grain, and the crease from where it was folded */}
            <div className="grain-overlay" aria-hidden="true" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[36%]">
              <div className="h-px bg-gradient-to-r from-transparent via-romance-ink/[0.07] to-transparent" />
              <div className="h-10 bg-gradient-to-b from-black/[0.12] to-transparent" />
            </div>

            {/* a faint warm light falling across the page */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-romance-candle/10 blur-3xl"
            />

            <div className="relative">
              <div className="mb-1.5 font-sans text-[10px] uppercase tracking-[0.3em] text-romance-candle/70">
                {weekdayName(date)}
              </div>
              <h3 className="font-display text-2xl font-light italic text-romance-soft">
                {formatLongDate(date)}, {date.getFullYear()}
              </h3>

              {dayPoems.map((poem, i) => (
                <div key={poem.id} className={i === 0 ? 'mt-8' : 'mt-10 border-t border-romance-line/50 pt-10'}>
                  <InkedPoem content={poem.content} delay={inkDelays[i]} dropCap={i === 0} still={still} />
                </div>
              ))}
            </div>
          </motion.article>
        </AnimatePresence>

        {keys.length > 1 && (
          <div className="mt-6 flex items-center justify-between font-sans text-[11px] uppercase tracking-[0.22em] text-romance-faint">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={index <= 0}
              className="flex items-center gap-2 p-2 transition-colors duration-500 hover:text-romance-ink disabled:opacity-25"
            >
              <ArrowLeft size={13} strokeWidth={1.25} /> Before
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={index >= keys.length - 1}
              className="flex items-center gap-2 p-2 transition-colors duration-500 hover:text-romance-ink disabled:opacity-25"
            >
              After <ArrowRight size={13} strokeWidth={1.25} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
