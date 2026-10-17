import { useEffect, useRef, type ReactNode, type Ref } from 'react'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/cn'

export function PaperContainer({
  children,
  className,
  as: As = 'div',
  breathing = false,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
  /** A near-imperceptible idle drift, like paper resting on a desk. */
  breathing?: boolean
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!breathing || !el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
      tl.to(el, { rotate: 0.15, y: 2, duration: 11 })
        .to(el, { rotate: -0.12, y: -1.5, duration: 13 })
        .to(el, { rotate: 0.08, y: 1, duration: 9 })
    })

    return () => ctx.revert()
  }, [breathing])

  return (
    <As
      ref={ref as Ref<HTMLDivElement>}
      className={cn(
        'rounded-xl bg-paper-soft/70 border border-line/70 shadow-soft',
        className,
      )}
    >
      {children}
    </As>
  )
}
