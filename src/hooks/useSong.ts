import { useCallback, useEffect, useRef, useState } from 'react'

const FADE_IN_SEC = 4
const FADE_OUT_SEC = 1.2

/**
 * A looping background song that fades in and out. Volume goes through a
 * Web Audio gain node because iOS ignores `audio.volume`. Browsers only
 * allow playback after a tap, so call `play()` from a click handler.
 */
export function useSong(src: string, volume: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const graphRef = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null)
  const pauseTimer = useRef<ReturnType<typeof setTimeout>>()
  const [available, setAvailable] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'
    const onError = () => setAvailable(false)
    audio.addEventListener('error', onError)
    audio.src = src
    audioRef.current = audio

    return () => {
      clearTimeout(pauseTimer.current)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      void graphRef.current?.ctx.close()
      graphRef.current = null
      audioRef.current = null
    }
  }, [src])

  const ensureGraph = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return null
    if (graphRef.current) return graphRef.current
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    const ctx = new Ctx()
    const gain = ctx.createGain()
    gain.gain.value = 0
    ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination)
    graphRef.current = { ctx, gain }
    return graphRef.current
  }, [])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !available) return
    clearTimeout(pauseTimer.current)
    const graph = ensureGraph()

    void audio
      .play()
      .then(() => {
        setPlaying(true)
        if (graph) {
          void graph.ctx.resume()
          const now = graph.ctx.currentTime
          graph.gain.gain.cancelScheduledValues(now)
          graph.gain.gain.setValueAtTime(graph.gain.gain.value, now)
          graph.gain.gain.linearRampToValueAtTime(volume, now + FADE_IN_SEC)
        } else {
          audio.volume = volume
        }
      })
      .catch(() => {
        // Missing file or blocked autoplay — stay silent.
      })
  }, [available, ensureGraph, volume])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setPlaying(false)
    const graph = graphRef.current
    if (graph) {
      const now = graph.ctx.currentTime
      graph.gain.gain.cancelScheduledValues(now)
      graph.gain.gain.setValueAtTime(graph.gain.gain.value, now)
      graph.gain.gain.linearRampToValueAtTime(0, now + FADE_OUT_SEC)
      pauseTimer.current = setTimeout(() => audio.pause(), FADE_OUT_SEC * 1000)
    } else {
      audio.pause()
    }
  }, [])

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play])

  return { available, playing, play, pause, toggle }
}
