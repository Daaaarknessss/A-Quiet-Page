import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { EASE, prefersReducedMotion } from '@/lib/motion'

// How quickly the light catches up with her hand (0–1 per frame).
const FOLLOW = 0.07

/**
 * A pool of candlelight that follows her cursor or finger; the edges of the
 * room stay dim. Both layers are static gradients moved with transforms, so
 * following her never repaints the page.
 */
export function Candlelight({ active }: { active: boolean }) {
  const glowRef = useRef<HTMLDivElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    const shade = shadeRef.current
    if (!glow || !shade) return

    const follow = prefersReducedMotion() ? 1 : FOLLOW
    const target = { x: window.innerWidth / 2, y: window.innerHeight * 0.45 }
    const pos = { ...target }
    let moved = false
    let frame = 0

    const apply = () => {
      const transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      glow.style.transform = transform
      shade.style.transform = transform
    }

    const tick = () => {
      pos.x += (target.x - pos.x) * follow
      pos.y += (target.y - pos.y) * follow
      apply()
      frame = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.5 ? requestAnimationFrame(tick) : 0
    }

    const moveTo = (x: number, y: number) => {
      moved = true
      target.x = x
      target.y = y
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onPointer = (e: PointerEvent) => moveTo(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch) moveTo(touch.clientX, touch.clientY)
    }
    // Until she's touched anything, keep the light centred as the window changes.
    const onResize = () => {
      if (moved) return
      target.x = pos.x = window.innerWidth / 2
      target.y = pos.y = window.innerHeight * 0.45
      apply()
    }

    apply()
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const fade = { opacity: active ? 1 : 0 }
  const transition = { duration: 2.5, ease: EASE.quiet }

  return (
    <>
      {/* the warm pool, behind the words */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={fade}
        transition={transition}
      >
        <div
          ref={glowRef}
          className="absolute left-0 top-0 -ml-[35vmax] -mt-[35vmax] h-[70vmax] w-[70vmax] will-change-transform"
          style={{
            background:
              'radial-gradient(closest-side, rgb(var(--r-candle) / 0.11), rgb(var(--r-rose) / 0.04) 55%, transparent)',
          }}
        />
      </motion.div>

      {/* the dark at the edges, over everything but the controls */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={fade}
        transition={transition}
      >
        <div
          ref={shadeRef}
          className="absolute left-0 top-0 -ml-[150vmax] -mt-[150vmax] h-[300vmax] w-[300vmax] will-change-transform"
          style={{
            background:
              'radial-gradient(closest-side, transparent 17%, rgb(var(--r-night) / 0.28) 38%, rgb(var(--r-night) / 0.5) 70%)',
          }}
        />
      </motion.div>
    </>
  )
}
