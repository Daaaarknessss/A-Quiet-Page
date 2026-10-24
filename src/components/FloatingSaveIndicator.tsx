import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import type { SaveStatus } from '@/hooks/useAutosave'
import { EASE } from '@/lib/motion'

// Slightly uneven, like a drop that landed on paper rather than a dot.
const BLOT = { borderRadius: '58% 42% 55% 45% / 48% 60% 40% 52%' }

/** Wet ink that spreads while saving, then dries to a faded bronze. */
function InkBlot({ dry }: { dry: boolean }) {
  return (
    <span className="relative mr-1 flex h-2.5 w-2.5 flex-none" aria-hidden="true">
      {!dry && (
        <motion.span
          className="absolute inset-0 bg-ink/40"
          style={BLOT}
          animate={{ scale: [1, 2.4], opacity: [0.45, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <motion.span
        className="absolute inset-0 bg-ink"
        style={BLOT}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={dry ? { scale: 0.75, opacity: 0, rotate: 14 } : { scale: [0.2, 1.15, 1], opacity: 1, rotate: 0 }}
        transition={{ duration: dry ? 1.2 : 0.6, ease: EASE.outQuart }}
      />
      <motion.span
        className="absolute inset-0 bg-bronze/70"
        style={BLOT}
        initial={{ opacity: 0 }}
        animate={dry ? { opacity: 1, scale: 0.75, rotate: 14 } : { opacity: 0 }}
        transition={{ duration: 1.2, ease: EASE.outQuart }}
      />
    </span>
  )
}

export function FloatingSaveIndicator({ status }: { status: SaveStatus }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === 'saving' || status === 'error') {
      setVisible(true)
      return
    }
    if (status === 'saved') {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(timer)
    }
    setVisible(false)
  }, [status])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-40 flex justify-center">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE.outQuart }}
            className="flex items-center gap-1.5 rounded-full bg-paper-soft/90 px-4 py-1.5 text-xs tracking-wide text-ink-faint shadow-soft border border-line/70"
          >
            {status !== 'error' && <InkBlot dry={status === 'saved'} />}
            <AnimatePresence mode="wait" initial={false}>
              {status !== 'error' && (
                <motion.span
                  key={status}
                  initial={{ opacity: 0, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(3px)' }}
                  transition={{ duration: 0.3, ease: EASE.outQuart }}
                  className="font-display text-[13px] italic"
                >
                  {status === 'saved' ? 'Saved' : 'Saving…'}
                </motion.span>
              )}
            </AnimatePresence>
            {status === 'error' && (
              <>
                <AlertCircle size={12} strokeWidth={2} className="text-terracotta" />
                <span>Couldn&rsquo;t save — check your connection</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
