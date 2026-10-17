import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { getScrollY, scrollToY } from '@/lib/scroll'

// Scroll offsets per history entry, so going back to the archive lands on
// the poem you opened instead of the top of the list.
const positions = new Map<string, number>()

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

export function useRouteScroll() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    const target = navigationType === 'POP' ? (positions.get(location.key) ?? 0) : 0
    scrollToY(target)
    // Restore again after the incoming page has painted, in case its
    // height wasn't settled on the first pass.
    const frame = requestAnimationFrame(() => scrollToY(target))

    return () => {
      cancelAnimationFrame(frame)
      positions.set(location.key, getScrollY())
    }
  }, [location.key, navigationType])
}
