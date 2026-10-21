import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

interface Ember {
  x: number
  y: number
  r: number
  vy: number
  sway: number
  phase: number
  hue: 'candle' | 'rose'
  alpha: number
}

const COLORS = {
  candle: '245, 198, 140',
  rose: '232, 156, 152',
}

/**
 * Slow, warm specks of light drifting upward. Drawn on one canvas so it
 * stays smooth on phones; `intensity` (0–1) scales how many are visible.
 */
export function Embers({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intensityRef = useRef(intensity)
  intensityRef.current = intensity

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = prefersReducedMotion()
    let width = 0
    let height = 0
    let embers: Ember[] = []
    let frame = 0
    let shown = 0 // eased towards intensity, so changes fade rather than pop

    const spawn = (anywhere: boolean): Ember => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 20,
      r: 0.8 + Math.random() * 2.2,
      vy: 0.12 + Math.random() * 0.3,
      sway: 6 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.7 ? 'candle' : 'rose',
      alpha: 0.25 + Math.random() * 0.55,
    })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Fewer on small screens — they read as denser there.
      const count = Math.round(Math.min(70, Math.max(28, (width * height) / 22000)))
      embers = Array.from({ length: count }, () => spawn(true))
    }

    const draw = (t: number) => {
      shown += (intensityRef.current - shown) * 0.02
      ctx.clearRect(0, 0, width, height)
      const visible = Math.round(embers.length * shown)

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i]
        if (!reduced) {
          e.y -= e.vy
          if (e.y < -20) embers[i] = spawn(false)
        }
        if (i >= visible) continue

        const x = e.x + (reduced ? 0 : Math.sin(t / 3200 + e.phase) * e.sway)
        const twinkle = reduced ? 1 : 0.7 + 0.3 * Math.sin(t / 900 + e.phase * 3)
        // Fade in near the bottom and out near the top.
        const edge = Math.min(1, e.y / (height * 0.15), (height - e.y) / (height * 0.2) + 0.2)
        const a = e.alpha * twinkle * Math.max(0, edge)

        const glow = ctx.createRadialGradient(x, e.y, 0, x, e.y, e.r * 6)
        glow.addColorStop(0, `rgba(${COLORS[e.hue]}, ${a})`)
        glow.addColorStop(0.3, `rgba(${COLORS[e.hue]}, ${a * 0.35})`)
        glow.addColorStop(1, `rgba(${COLORS[e.hue]}, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, e.y, e.r * 6, 0, Math.PI * 2)
        ctx.fill()
      }

      frame = requestAnimationFrame(draw)
    }

    resize()
    frame = requestAnimationFrame(draw)

    const onVisibility = () => {
      cancelAnimationFrame(frame)
      if (!document.hidden) frame = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
}
