import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { PoemBook } from '@/components/forHer/PoemBook'
import { ReplyBox } from '@/components/forHer/ReplyBox'
import { FOR_HER } from '@/lib/forHer'
import { EASE } from '@/lib/motion'
import type { SharedPoem } from '@/types/forHer'

const reveal = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-12% 0px' },
  transition: { duration: 1.2, ease: EASE.quiet },
}

/** Where the lines lead: her poems, a closing note, and a way to write back. */
export function Room({ poems, onReplay }: { poems: SharedPoem[]; onReplay: () => void }) {
  const titleWords = FOR_HER.roomTitle.split(' ')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.6, ease: EASE.quiet }}
      className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-24 sm:px-8"
    >
      {/* Opening */}
      <header className="flex min-h-[78dvh] flex-col items-center justify-center text-center">
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, letterSpacing: '0.32em' }}
          transition={{ duration: 2.2, delay: 0.4, ease: EASE.quiet }}
          className="mb-6 font-sans text-[11px] uppercase text-romance-candle/75"
        >
          {FOR_HER.roomEyebrow}
        </motion.p>
        <h1 className="candle-text font-display text-6xl font-light italic leading-[1.05] text-romance-ink sm:text-7xl">
          {titleWords.map((word, i) => (
            <motion.span
              key={i}
              className="mr-[0.25em] inline-block last:mr-0"
              initial={{ opacity: 0, y: 26, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.8, delay: 0.9 + i * 0.3, ease: EASE.quiet }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.8, ease: EASE.outExpo }}
          className="mt-10 h-px w-24 bg-gradient-to-r from-transparent via-romance-rose/70 to-transparent"
        />
        {poems.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.35, 0.7] }}
            transition={{ delay: 3, duration: 4, repeat: Infinity, repeatType: 'mirror' }}
            className="mt-16 font-sans text-[10px] uppercase tracking-[0.3em] text-romance-faint"
          >
            scroll
          </motion.p>
        )}
      </header>

      {/* The poems */}
      {poems.length > 0 && (
        <motion.section {...reveal} className="mb-40">
          <PoemBook poems={poems} />
        </motion.section>
      )}

      {/* Closing */}
      <motion.section {...reveal} className="mb-40 text-center">
        <p className="candle-text mx-auto max-w-md font-display text-4xl font-light italic leading-snug text-romance-ink sm:text-5xl">
          {FOR_HER.closing}
        </p>
        <motion.p
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          whileInView={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, delay: 0.8, ease: EASE.quiet }}
          className="mt-6 font-display text-2xl italic text-romance-candle/80"
        >
          {FOR_HER.signature}
        </motion.p>
      </motion.section>

      {/* Writing back */}
      <motion.section {...reveal} className="mb-32">
        <ReplyBox />
      </motion.section>

      <motion.div {...reveal} className="flex justify-center">
        <button
          type="button"
          onClick={onReplay}
          className="flex items-center gap-2.5 font-sans text-[11px] uppercase tracking-[0.26em] text-romance-faint transition-colors duration-500 hover:text-romance-soft"
        >
          <RotateCcw size={12} strokeWidth={1.5} />
          {FOR_HER.replay}
        </button>
      </motion.div>
    </motion.div>
  )
}
