import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, List } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePoems, useDeletePoem } from '@/hooks/usePoems'
import { SearchBar } from '@/components/SearchBar'
import { PoemList } from '@/components/PoemList'
import { Stats } from '@/components/Stats'
import { Calendar } from '@/components/Calendar'
import { EmptyState } from '@/components/EmptyState'
import { useParallax } from '@/hooks/useParallax'
import { cn } from '@/lib/cn'

export default function Journal() {
  const navigate = useNavigate()
  const { data: poems = [], isLoading } = usePoems()
  const deletePoem = useDeletePoem()
  const headingRef = useRef<HTMLHeadingElement>(null)
  useParallax(headingRef, 18)

  const [query, setQuery] = useState('')
  const [year, setYear] = useState<'all' | number>('all')
  const [showCalendar, setShowCalendar] = useState(false)

  const years = useMemo(() => {
    const set = new Set(poems.map((p) => new Date(p.created_at).getFullYear()))
    return Array.from(set).sort((a, b) => b - a)
  }, [poems])

  const filtered = useMemo(() => {
    return poems.filter((p) => {
      const matchesYear = year === 'all' || new Date(p.created_at).getFullYear() === year
      const matchesQuery = query.trim() === '' || p.content.toLowerCase().includes(query.trim().toLowerCase())
      return matchesYear && matchesQuery
    })
  }, [poems, year, query])

  if (!isLoading && poems.length === 0) {
    return <EmptyState onBegin={() => navigate('/')} />
  }

  return (
    <div className="pb-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 ref={headingRef} className="mb-2 font-display text-4xl font-light text-ink">
          The Archive
        </h1>
        <p className="mb-12 text-sm text-ink-faint">Every page you have written, quietly kept.</p>

        <div className="mb-14">
          <Stats poems={poems} />
        </div>

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={query} onChange={setQuery} />

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.12em] text-ink-faint">
              <button
                type="button"
                onClick={() => setYear('all')}
                className={cn('transition-colors duration-300', year === 'all' ? 'text-ink' : 'hover:text-ink-soft')}
              >
                All
              </button>
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={cn('transition-colors duration-300', year === y ? 'text-ink' : 'hover:text-ink-soft')}
                >
                  {y}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCalendar((v) => !v)}
              aria-label={showCalendar ? 'Show list' : 'Show calendar'}
              className="text-ink-faint transition-colors duration-300 hover:text-ink"
            >
              {showCalendar ? <List size={17} strokeWidth={1.5} /> : <CalendarDays size={17} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {showCalendar ? (
          <Calendar poems={filtered} />
        ) : filtered.length > 0 ? (
          <PoemList poems={filtered} onDelete={(id) => deletePoem.mutate(id)} />
        ) : (
          <p className="py-16 text-center font-display italic text-ink-faint">No pages match your search.</p>
        )}
      </motion.div>
    </div>
  )
}
