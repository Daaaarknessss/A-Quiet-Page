// Single source of truth for the app's motion language.
// Framer Motion reads the cubic-bezier arrays and spring presets directly.
// GSAP reads the *Gsap string eases and the *Sec durations.

export const EASE = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  quiet: [0.22, 1, 0.36, 1],
} as const

export const EASE_GSAP = {
  outExpo: 'expo.out',
  outQuart: 'quart.out',
  inOutSine: 'sine.inOut',
  outPower3: 'power3.out',
} as const

export const SPRING = {
  // tactile, no bounce — for buttons, magnetic release, small controls
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 } as const,
  // used for hover lifts / card tilts
  gentle: { type: 'spring', stiffness: 260, damping: 28, mass: 0.8 } as const,
  // used for larger layout / shared-element morphs
  soft: { type: 'spring', stiffness: 160, damping: 24, mass: 1 } as const,
}

export const DURATION = {
  micro: 0.18, // hover/tap feedback
  base: 0.3, // small UI state changes (toggles, indicators)
  unfold: 0.85, // the greeting <-> writing transition
  pageLoad: 1.3, // first-load orchestration
} as const

export const pageLoadSec = DURATION.pageLoad
export const unfoldSec = DURATION.unfold

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isFinePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: fine)').matches
}
