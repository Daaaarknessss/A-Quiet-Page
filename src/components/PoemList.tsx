import { useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { PoemCard } from '@/components/PoemCard'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import type { Poem } from '@/types/poem'

export function PoemList({ poems, onDelete }: { poems: Poem[]; onDelete: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useScrollReveal(containerRef, [poems.map((p) => p.id).join(',')])

  return (
    <div ref={containerRef}>
      <AnimatePresence initial={false}>
        {poems.map((poem, i) => (
          <PoemCard key={poem.id} poem={poem} onDelete={onDelete} tilt={i % 2 === 0 ? -0.6 : 0.6} />
        ))}
      </AnimatePresence>
    </div>
  )
}
