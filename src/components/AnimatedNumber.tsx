import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import { prefersReducedMotion } from '@/lib/motion'

export function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0))
  const prevValue = useRef(prefersReducedMotion() ? value : 0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value)
      prevValue.current = value
      return
    }

    const controls = animate(prevValue.current, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
      onComplete: () => {
        prevValue.current = value
      },
    })

    return () => controls.stop()
  }, [value])

  return <span className="tabular-nums">{display.toLocaleString()}</span>
}
