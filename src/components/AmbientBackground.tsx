import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/motion'
import { daylightAt } from '@/lib/daylight'

// Often enough to catch the hour turning, rarely enough to cost nothing.
const DAYLIGHT_CHECK_MS = 5 * 60_000

export function AmbientBackground() {
  const lightRef = useRef<HTMLDivElement>(null)
  const [daylight, setDaylight] = useState(daylightAt)

  useEffect(() => {
    const timer = setInterval(() => setDaylight(daylightAt()), DAYLIGHT_CHECK_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const el = lightRef.current
    if (!el || prefersReducedMotion()) return

    // The gradient itself never changes — only its transform does, so the
    // drift stays on the compositor instead of repainting the viewport.
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
      tl.to(el, { x: '42vw', y: '8vh', duration: 26 })
        .to(el, { x: '5vw', y: '42vh', duration: 24 })
        .to(el, { x: '28vw', y: '-2vh', duration: 20 })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      data-daylight={daylight}
    >
      <div className="daylight-wash" />
      <div ref={lightRef} className="ambient-light" />
      <div className="grain-overlay" />
    </div>
  )
}
