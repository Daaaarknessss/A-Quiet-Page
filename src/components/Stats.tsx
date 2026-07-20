import { calculateStreak } from '@/lib/date'
import { useMagnetic } from '@/hooks/useMagnetic'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { wordCount, type Poem } from '@/types/poem'

function StatItem({ value, label }: { value: number; label: string }) {
  const ref = useMagnetic<HTMLDivElement>(0.2, 6)

  return (
    <div ref={ref} data-cursor="hover" className="text-center">
      <div className="font-display text-2xl font-light text-ink sm:text-3xl">
        <AnimatedNumber value={value} />
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</div>
    </div>
  )
}

export function Stats({ poems }: { poems: Poem[] }) {
  const streak = calculateStreak(poems.map((p) => new Date(p.created_at)))
  const totalWords = poems.reduce((sum, p) => sum + wordCount(p.content), 0)

  return (
    <div className="flex items-center justify-center gap-8 sm:gap-14">
      <StatItem value={streak} label="Day Streak" />
      <div className="h-10 w-px bg-line" />
      <StatItem value={poems.length} label={poems.length === 1 ? 'Poem' : 'Poems'} />
      <div className="h-10 w-px bg-line" />
      <StatItem value={totalWords} label="Words Written" />
    </div>
  )
}
