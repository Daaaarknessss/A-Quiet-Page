import { useMemo, type CSSProperties } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { EASE } from '@/lib/motion'

const COUNT = 70

// A small seeded random, so the sky is the same every time she comes back.
function sky(count: number) {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  return Array.from({ length: count }, () => ({
    left: rand() * 100,
    top: Math.pow(rand(), 1.4) * 100, // thicker near the top
    size: rand() < 0.85 ? 1 + rand() : 2 + rand(),
    alpha: 0.25 + rand() * 0.6,
    period: 3 + rand() * 5,
    delay: -rand() * 8,
  }))
}

/** Faint stars that come out above the room as she scrolls down. */
export function Stars({ active }: { active: boolean }) {
  const stars = useMemo(() => sky(COUNT), [])
  const { scrollYProgress } = useScroll()
  const dusk = useTransform(scrollYProgress, [0.04, 0.5], [0, 1])

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[65dvh]"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 3, ease: EASE.quiet }}
      style={{ maskImage: 'linear-gradient(to bottom, black 30%, transparent)' }}
    >
      <motion.div className="absolute inset-0" style={{ opacity: dusk }}>
        {stars.map((s, i) => (
          <span
            key={i}
            className="star"
            style={
              {
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                '--star-a': s.alpha,
                '--star-t': `${s.period}s`,
                '--star-d': `${s.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
