import type Lenis from 'lenis'

// Lenis owns its own scroll position, so a plain window.scrollTo() gets
// overwritten on the next frame. Route changes go through here instead.
let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenis = instance
}

export function getScrollY() {
  return lenis ? lenis.scroll : window.scrollY
}

export function scrollToY(y: number) {
  if (lenis) {
    // The new page may have a different height than Lenis last measured;
    // without this the target gets clamped to the old page's limit.
    lenis.resize()
    lenis.scrollTo(y, { immediate: true, force: true })
  } else {
    window.scrollTo(0, y)
  }
}
