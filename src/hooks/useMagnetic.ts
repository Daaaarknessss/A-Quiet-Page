import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion, isFinePointer } from '@/lib/motion'

// GSAP-driven magnetic pull: the element eases toward the cursor within a
// small radius, then springs back to rest. Ambient, not state-driven, so it
// lives outside Framer Motion's system by design.
export function useMagnetic<T extends HTMLElement>(strength = 0.3, max = 8) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !isFinePointer()) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      xTo(gsap.utils.clamp(-max, max, relX * strength))
      yTo(gsap.utils.clamp(-max, max, relY * strength))
    }

    const handleLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [strength, max])

  return ref
}
