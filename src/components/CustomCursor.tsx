import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion, isFinePointer } from '@/lib/motion'

const HOVER_SELECTOR = '[data-cursor="hover"]'

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion() || !isFinePointer()) return

    // Elements are always rendered below (no state-gated conditional render)
    // so these refs are already attached by the time this effect runs.
    const ring = ringRef.current
    const dot = dotRef.current
    if (!ring || !dot) return

    document.documentElement.classList.add('cursor-none')

    // Start hidden — nothing to track until the pointer actually moves, so
    // there's no stray circle sitting at the top-left corner on load.
    gsap.set([ring, dot], { opacity: 0 })
    let hasPositioned = false

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' })
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' })

    const move = (e: MouseEvent) => {
      if (!hasPositioned) {
        // Snap to the first known position instantly instead of easing in
        // from (0, 0) — avoids a "flying in from the corner" glitch.
        gsap.set([ring, dot], { x: e.clientX, y: e.clientY, opacity: 1 })
        hasPositioned = true
        return
      }
      ringX(e.clientX)
      ringY(e.clientY)
      dotX(e.clientX)
      dotY(e.clientY)
    }

    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest?.(HOVER_SELECTOR)) {
        gsap.to(ring, { scale: 2.4, opacity: 0.7, duration: 0.35, ease: 'power3.out' })
      }
    }
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest?.(HOVER_SELECTOR)) {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.35, ease: 'power3.out' })
      }
    }
    const onLeaveWindow = () => gsap.to([ring, dot], { opacity: 0, duration: 0.2 })
    const onEnterWindow = () => {
      if (hasPositioned) gsap.to([ring, dot], { opacity: 1, duration: 0.2 })
    }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    document.documentElement.addEventListener('mouseleave', onLeaveWindow)
    document.documentElement.addEventListener('mouseenter', onEnterWindow)

    return () => {
      document.documentElement.classList.remove('cursor-none')
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.documentElement.removeEventListener('mouseleave', onLeaveWindow)
      document.documentElement.removeEventListener('mouseenter', onEnterWindow)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden="true">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-ink/70 opacity-0"
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bronze opacity-0"
      />
    </div>
  )
}
