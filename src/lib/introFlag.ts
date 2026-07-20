let played = false

export function hasIntroPlayed(): boolean {
  return played
}

// Call this only once the intro timeline actually starts ticking (its
// onStart callback), not at effect-setup time. React 18 StrictMode mounts
// every component twice in dev (mount → cleanup → mount) to surface missing
// cleanup; the throwaway first mount's GSAP context gets reverted
// synchronously, before its timeline ever reaches a tick, so onStart never
// fires for it. Only the real, surviving mount marks the flag — meaning it
// still plays exactly once per session, in both dev and production.
export function markIntroPlayed(): void {
  played = true
}
