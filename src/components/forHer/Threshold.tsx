import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { FOR_HER } from '@/lib/forHer'
import { EASE } from '@/lib/motion'

/** The first screen: a candle, one line, and an invitation to tap. */
export function Threshold({ ready, onBegin }: { ready: boolean; onBegin: () => void }) {
  const words = FOR_HER.threshold.split(' ')

  return (
    <motion.button
      type="button"
      onClick={ready ? onBegin : undefined}
      aria-label={FOR_HER.thresholdHint}
      className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center px-8 text-center"
      exit={{ opacity: 0, y: -24, filter: 'blur(10px)' }}
      transition={{ duration: 1.4, ease: EASE.quiet }}
    >
      {/* the candle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease: EASE.outExpo }}
        className="mb-14"
      >
        <div className="candle-flicker h-3 w-3 rounded-full bg-romance-candle shadow-[0_0_30px_12px_rgb(var(--r-candle)/0.35),0_0_90px_40px_rgb(var(--r-rose)/0.12)]" />
      </motion.div>

      <h1 className="candle-text max-w-md font-display text-4xl font-light italic leading-snug text-romance-ink sm:text-5xl">
        {words.map((word, i) => (
          <Fragment key={i}>
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.6, delay: 1 + i * 0.28, ease: EASE.quiet }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && ' '}
          </Fragment>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: [0, 0.75, 0.4, 0.75] } : { opacity: 0 }}
        transition={
          ready
            ? { delay: 1.2 + words.length * 0.28, duration: 5, times: [0, 0.3, 0.65, 1], repeat: Infinity, repeatType: 'mirror' }
            : { duration: 0.4 }
        }
        className="mt-12 font-sans text-[11px] uppercase tracking-[0.32em] text-romance-faint"
      >
        {FOR_HER.thresholdHint}
      </motion.p>
    </motion.button>
  )
}
