import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import type { SaveStatus } from '@/hooks/useAutosave'
import { EASE } from '@/lib/motion'

function HandwrittenCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-forest">
      <motion.path
        d="M4 12.5L9.5 18L20 6"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: EASE.outQuart }}
      />
    </svg>
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
            {status === 'saving' && <span>Saving…</span>}
            {status === 'saved' && (
              <>
                <HandwrittenCheck />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4, ease: EASE.outQuart }}
                >
                  Saved
                </motion.span>
              </>
            )}
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
