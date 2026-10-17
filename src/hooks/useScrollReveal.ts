import { useLayoutEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/motion'

// Reveals `[data-reveal]` descendants of `containerRef` as they scroll into
// view: fade + rise + a slight blur-and-scale settle. Re-runs whenever
// `deps` changes so newly-mounted items (e.g. after a search filter) are
// picked up.
export function useScrollReveal(containerRef: RefObject<HTMLElement | null>, deps: readonly unknown[] = []) {
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || prefersReducedMotion()) return

    const items = container.querySelectorAll<HTMLElement>('[data-reveal]')
    const lines = container.querySelectorAll<HTMLElement>('[data-reveal-line]')
    if (items.length === 0) return

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 22, scale: 0.98, filter: 'blur(6px)' })
      gsap.set(lines, { scaleX: 0 })

      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'expo.out',
            stagger: 0.08,
            overwrite: true,
            // A lingering `filter`/`transform` keeps every revealed row on
            // its own GPU layer for the life of the page.
            clearProps: 'filter,transform',
          })
          const batchLines = batch
            .map((el) => el.closest('.poem-row')?.querySelector<HTMLElement>('[data-reveal-line]'))
            .filter((el): el is HTMLElement => Boolean(el))
          gsap.to(batchLines, {
            scaleX: 1,
            duration: 0.7,
            ease: 'expo.out',
            stagger: 0.08,
            delay: 0.15,
            overwrite: true,
            clearProps: 'transform',
          })
        },
      })
    }, container)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
