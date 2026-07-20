import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/motion'

// Near-imperceptible drift as the element scrolls past — large type moving
// at a slightly different speed than the rest of the page.
export function useParallax<T extends HTMLElement>(ref: RefObject<T | null>, distance = 24) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: distance,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
    })

    return () => ctx.revert()
  }, [ref, distance])
}
