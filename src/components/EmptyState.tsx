import { motion } from 'framer-motion'
import { Button } from '@/components/Button'

export function EmptyState({ onBegin }: { onBegin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex max-w-sm flex-col items-center px-6 py-24 text-center"
    >
      <svg
        width="120"
        height="96"
        viewBox="0 0 120 96"
        fill="none"
        className="mb-10 text-ink-faint"
        aria-hidden="true"
      >
        <path
          d="M60 14C60 14 48 6 30 8C14 9.6 6 20 6 20V78C6 78 15 70 30 69C46 68 60 76 60 76"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M60 14C60 14 72 6 90 8C106 9.6 114 20 114 20V78C114 78 105 70 90 69C74 68 60 76 60 76"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M60 14V76" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <path d="M20 30C30 27 42 28 50 33" stroke="currentColor" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
        <path d="M20 42C30 39 42 40 50 45" stroke="currentColor" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
      </svg>

      <p className="mb-8 font-display text-2xl italic leading-snug text-ink-soft">
        Every collection begins with a single page.
      </p>

      <Button onClick={onBegin}>Write your first poem</Button>
    </motion.div>
  )
}
