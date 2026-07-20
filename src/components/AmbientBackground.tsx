import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/motion'

export function AmbientBackground() {
  const lightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = lightRef.current
    if (!el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
      tl.to(el, { '--x': '72%', '--y': '28%', duration: 26 })
        .to(el, { '--x': '35%', '--y': '62%', duration: 24 })
        .to(el, { '--x': '58%', '--y': '18%', duration: 20 })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div ref={lightRef} className="ambient-light" />
    </div>
  )
}
