import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/cn'

export function JournalHeader() {
  const location = useLocation()
  const onJournal = location.pathname.startsWith('/journal')

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 pt-8 sm:px-8"
    >
      <Link
        to="/"
        data-cursor="hover"
        className="font-display text-[15px] italic tracking-wide text-ink-soft transition-colors duration-300 hover:text-ink"
      >
        The Quiet Page
      </Link>

      <nav className="flex items-center gap-6">
        <Link
          to="/journal"
          data-cursor="hover"
          className={cn(
            'font-sans text-[13px] uppercase tracking-[0.14em] transition-colors duration-300',
            onJournal ? 'text-ink' : 'text-ink-faint hover:text-ink-soft',
          )}
        >
          Archive
        </Link>
        <ThemeToggle />
      </nav>
    </motion.header>
  )
}
