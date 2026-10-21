import { Fragment, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FOR_HER, holdMsFor } from '@/lib/forHer'
import { EASE, prefersReducedMotion } from '@/lib/motion'

export interface Line {
  text: string
  /** Extra silence after the line, in ms. */
  pauseMs: number | null
}

const WORD_STAGGER_MS = 110
const ENTER_MS = 1300
const EXIT_MS = 1100
const DEFAULT_GAP_MS = 500
const FIRST_BREATH_MS = 1400
const LAST_BREATH_MS = 1200

/**
 * One line at a time. Each one arrives word by word out of a soft blur,
 * stays long enough to be read twice, then drifts up and dissolves.
 * Tapping anywhere moves on.
 */
export function LineSequence({ lines, onDone }: { lines: Line[]; onDone: () => void }) {
  // index -1 is the held breath before the first line.
  const [index, setIndex] = useState(-1)
  const [visible, setVisible] = useState(false)
  const still = prefersReducedMotion()

  useEffect(() => {
    let ms: number
    let next: () => void

    if (visible) {
      const line = lines[index]
      const words = line.text.split(/\s+/).filter(Boolean).length
      ms = ENTER_MS + words * WORD_STAGGER_MS + holdMsFor(line.text)
      next = () => setVisible(false)
    } else if (index + 1 < lines.length) {
      const gap = index < 0 ? FIRST_BREATH_MS : EXIT_MS + (lines[index].pauseMs ?? DEFAULT_GAP_MS)
      ms = gap
      next = () => {
        setIndex(index + 1)
        setVisible(true)
      }
    } else {
      ms = EXIT_MS + LAST_BREATH_MS
      next = onDone
    }

    const timer = setTimeout(next, ms)
    return () => clearTimeout(timer)
  }, [index, visible, lines, onDone])

  const advance = () => {
    if (visible) {
      setVisible(false)
    } else if (index + 1 < lines.length) {
      setIndex(index + 1)
      setVisible(true)
    }
  }

  const progress = lines.length ? Math.max(0, index + 1) / lines.length : 1

  return (
    <motion.div
      className="relative z-10 flex min-h-dvh w-full cursor-pointer select-none items-center justify-center px-7"
      onClick={advance}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2 } }}
    >
      <AnimatePresence mode="wait">
        {visible && lines[index] && (
          <motion.p
            key={index}
            className="candle-text max-w-2xl text-center font-display text-[32px] font-light leading-[1.35] text-romance-ink sm:text-5xl sm:leading-[1.3]"
            exit={
              still
                ? { opacity: 0, transition: { duration: EXIT_MS / 1000 } }
                : { opacity: 0, y: -18, filter: 'blur(8px)', transition: { duration: EXIT_MS / 1000, ease: EASE.quiet } }
            }
          >
            <LineText text={lines[index].text} still={still} />
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDone()
        }}
        className="absolute bottom-8 right-7 font-sans text-[11px] uppercase tracking-[0.28em] text-romance-faint/70 transition-colors duration-500 hover:text-romance-soft"
      >
        {FOR_HER.skip}
      </button>

      <div className="absolute bottom-0 left-0 h-px w-full bg-romance-line/30">
        <motion.div
          className="h-full origin-left bg-romance-candle/50"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 1.6, ease: EASE.quiet }}
        />
      </div>
    </motion.div>
  )
}

function LineText({ text, still }: { text: string; still: boolean }) {
  // A line that's only an ellipsis is a held breath: three dots, breathing.
  if (text.trim() === '…' || text.trim() === '...') {
    return (
      <span className="inline-flex gap-3" aria-label="pause">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0.35] }}
            transition={{ duration: 1.8, delay: i * 0.35, ease: 'easeInOut' }}
          >
            ·
          </motion.span>
        ))}
      </span>
    )
  }

  let n = 0
  return (
    <>
      {text.split('\n').map((row, r) => (
        <span key={r} className="block">
          {row
            .split(/\s+/)
            .filter(Boolean)
            .map((word, i, arr) => {
              const delay = (n++ * WORD_STAGGER_MS) / 1000
              return (
                <Fragment key={i}>
                  <motion.span
                    className="inline-block"
                    initial={still ? { opacity: 0 } : { opacity: 0, y: 12, filter: 'blur(10px)' }}
                    animate={still ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: ENTER_MS / 1000, delay, ease: EASE.quiet }}
                  >
                    {word}
                  </motion.span>
                  {i < arr.length - 1 && ' '}
                </Fragment>
              )
            })}
        </span>
      ))}
    </>
  )
}
