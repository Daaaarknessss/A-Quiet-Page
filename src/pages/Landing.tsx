import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Feather, Heart } from 'lucide-react'
import { AmbientBackground } from '@/components/AmbientBackground'
import { CustomCursor } from '@/components/CustomCursor'
import { FOR_HER } from '@/lib/forHer'
import { EASE } from '@/lib/motion'

const door = {
  initial: { opacity: 0, y: 18, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

/** Two ways in: his desk, and the page he made for her. */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-dvh">
      <AmbientBackground />
      <CustomCursor />

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-20">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE.quiet }}
          className="mb-3 font-display text-[15px] italic tracking-wide text-ink-faint"
        >
          The Quiet Page
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE.outExpo }}
          className="mb-16 text-center font-display text-5xl font-light text-ink sm:text-6xl"
        >
          Which door?
        </motion.h1>

        <div className="grid w-full gap-5 sm:grid-cols-2 sm:gap-6">
          {/* His door — quiet, paper, like the rest of the studio. */}
          <motion.button
            type="button"
            {...door}
            transition={{ duration: 1, delay: 0.35, ease: EASE.quiet }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/studio')}
            data-cursor="hover"
            className="group flex flex-col items-start rounded-2xl border border-line/80 bg-paper-soft/70 p-8 text-left shadow-soft transition-shadow duration-500 hover:shadow-lift sm:p-10"
          >
            <Feather size={20} strokeWidth={1.25} className="mb-10 text-ink-faint transition-colors duration-500 group-hover:text-bronze" />
            <span className="font-display text-3xl font-light text-ink">The desk</span>
            <span className="mt-2 text-sm text-ink-faint">Write, edit, and keep.</span>
          </motion.button>

          {/* Her door — a glimpse of the candlelit room behind it. */}
          <motion.button
            type="button"
            {...door}
            transition={{ duration: 1, delay: 0.5, ease: EASE.quiet }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/for-you')}
            data-cursor="hover"
            className="romance group relative flex flex-col items-start overflow-hidden rounded-2xl border border-romance-line p-8 text-left shadow-lift sm:p-10"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-romance-candle/20 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:bg-romance-rose/25"
            />
            <Heart
              size={20}
              strokeWidth={1.25}
              className="relative mb-10 text-romance-rose/80 transition-all duration-700 group-hover:scale-110 group-hover:fill-romance-rose/40"
            />
            <span className="candle-text relative font-display text-3xl font-light italic text-romance-ink">
              {FOR_HER.doorTitle}
            </span>
            <span className="relative mt-2 text-sm text-romance-soft/80">{FOR_HER.doorSubtitle}</span>
          </motion.button>
        </div>
      </main>
    </div>
  )
}
