import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCardDate, weekdayName } from '@/lib/date'
import { useMagnetic } from '@/hooks/useMagnetic'
import { SPRING } from '@/lib/motion'
import { firstLine, readingTimeMinutes, wordCount, type Poem } from '@/types/poem'

interface PoemCardProps {
  poem: Poem
  onDelete: (id: string) => void
  tilt?: number
}

export function PoemCard({ poem, onDelete, tilt = 0 }: PoemCardProps) {
  const date = new Date(poem.created_at)
  const { day, month, year } = formatCardDate(date)
  const magneticRef = useMagnetic<HTMLAnchorElement>(0.12, 6)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      whileHover={{ y: -3, rotate: tilt, boxShadow: '0 12px 32px -18px rgb(0 0 0 / 0.28)' }}
      transition={{ ...SPRING.gentle, layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      className="poem-row group relative rounded-lg py-7 first:pt-0"
    >
      <div
        data-reveal-line
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-line/70"
      />
      {/* Plain (non-Framer) wrapper so GSAP's scroll-reveal can own its own
          opacity/transform/filter without fighting Framer's layout system
          on the row above. */}
      <div data-reveal>
        <Link ref={magneticRef} to={`/write/${poem.id}`} data-cursor="hover" className="flex gap-6 sm:gap-10">
          <motion.div layoutId={`poem-day-${poem.id}`} className="w-16 flex-none text-right sm:w-20">
            <div className="font-display text-3xl font-light leading-none text-ink sm:text-4xl">{day}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
              {month} {year}
            </div>
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
              {weekdayName(date)}
            </div>
            <p className="truncate font-display text-xl italic text-ink-soft transition-colors duration-300 group-hover:text-ink sm:text-[22px]">
              {firstLine(poem.content)}
            </p>
            <div className="mt-2 text-xs text-ink-faint">
              {wordCount(poem.content)} words · {readingTimeMinutes(poem.content)} min read
            </div>
          </div>
        </Link>
      </div>

      <motion.button
        type="button"
        aria-label="Delete poem"
        data-cursor="hover"
        onClick={(e) => {
          e.preventDefault()
          onDelete(poem.id)
        }}
        className="absolute right-0 top-7 text-ink-faint opacity-0 transition-opacity duration-300 hover:text-terracotta group-hover:opacity-100"
        whileTap={{ scale: 0.9 }}
      >
        <Trash2 size={16} strokeWidth={1.5} />
      </motion.button>
    </motion.div>
  )
}
