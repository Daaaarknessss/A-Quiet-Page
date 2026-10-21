import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { formatLongDate, weekdayName } from '@/lib/date'
import { EASE, prefersReducedMotion } from '@/lib/motion'
import { getScrollY, scrollToY } from '@/lib/scroll'
import type { SharedPoem } from '@/types/forHer'
import { cn } from '@/lib/cn'

const SWIPE_PX = 60

/** The shared poems, one page at a time — swipe, tap the arrows, or use ← →. */
export function PoemBook({ poems }: { poems: SharedPoem[] }) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0])
  const bookRef = useRef<HTMLDivElement>(null)
  const still = prefersReducedMotion()
  const poem = poems[page]

  const turn = useCallback(
    (dir: 1 | -1) => {
      setPage(([p]) => {
        const next = p + dir
        if (next < 0 || next >= poems.length) return [p, 0]
        return [next, dir]
      })
      // If the top of the page has scrolled away, bring it gently back.
      const top = bookRef.current?.getBoundingClientRect().top ?? 0
      if (top < 0) scrollToY(getScrollY() + top - 32, { smooth: true })
    },
    [poems.length],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') turn(-1)
      if (e.key === 'ArrowRight') turn(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turn])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_PX) turn(1)
    else if (info.offset.x > SWIPE_PX) turn(-1)
  }

  if (!poem) return null
  const date = new Date(poem.created_at)

  return (
    <div ref={bookRef} className="relative" style={{ perspective: 1400 }}>
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.article
          key={poem.id}
          custom={direction}
          variants={{
            enter: (d: number) =>
              still ? { opacity: 0 } : { opacity: 0, x: d * 70, rotateY: d * -10, filter: 'blur(4px)' },
            center: { opacity: 1, x: 0, rotateY: 0, filter: 'blur(0px)' },
            exit: (d: number) =>
              still ? { opacity: 0 } : { opacity: 0, x: d * -70, rotateY: d * 10, filter: 'blur(4px)' },
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: EASE.quiet }}
          drag={poems.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragEnd={onDragEnd}
          className="relative touch-pan-y overflow-hidden rounded-[22px] border border-romance-line/60 bg-gradient-to-b from-romance-candle/[0.07] via-romance-rose/[0.03] to-transparent px-7 pb-10 pt-11 shadow-[0_30px_80px_-40px_rgb(var(--r-candle)/0.35)] sm:px-14 sm:pb-14 sm:pt-14"
        >
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

            <p className="mt-9 whitespace-pre-line font-serif text-[20px] leading-[1.85] text-romance-ink sm:text-[22px]">
              {poem.content}
            </p>
          </div>
        </motion.article>
      </AnimatePresence>

      {poems.length > 1 && (
        <div className="mt-8 flex items-center justify-between font-sans text-[11px] uppercase tracking-[0.22em] text-romance-faint">
          <button
            type="button"
            onClick={() => turn(-1)}
            disabled={page === 0}
            aria-label="Previous page"
            className="flex items-center gap-2 p-2 transition-colors duration-500 hover:text-romance-ink disabled:opacity-25"
          >
            <ArrowLeft size={14} strokeWidth={1.25} />
          </button>

          {poems.length <= 14 ? (
            <div className="flex items-center gap-2" aria-label={`Page ${page + 1} of ${poems.length}`}>
              {poems.map((p, i) => (
                <span
                  key={p.id}
                  className={cn(
                    'h-1 rounded-full transition-all duration-700 ease-quiet',
                    i === page ? 'w-5 bg-romance-candle/80' : 'w-1 bg-romance-faint/40',
                  )}
                />
              ))}
            </div>
          ) : (
            <span>
              {page + 1} <span className="opacity-50">/</span> {poems.length}
            </span>
          )}

          <button
            type="button"
            onClick={() => turn(1)}
            disabled={page === poems.length - 1}
            aria-label="Next page"
            className="flex items-center gap-2 p-2 transition-colors duration-500 hover:text-romance-ink disabled:opacity-25"
          >
            <ArrowRight size={14} strokeWidth={1.25} />
          </button>
        </div>
      )}
    </div>
  )
}
