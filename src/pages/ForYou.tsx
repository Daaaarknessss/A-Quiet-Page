import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Embers } from '@/components/forHer/Embers'
import { Candlelight } from '@/components/forHer/Candlelight'
import { Stars } from '@/components/forHer/Stars'
import { Threshold } from '@/components/forHer/Threshold'
import { LineSequence, type Line } from '@/components/forHer/LineSequence'
import { Room } from '@/components/forHer/Room'
import { useMoments, useSharedPoems } from '@/hooks/useForHer'
import { useSong } from '@/hooks/useSong'
import { FOR_HER, hasSeenLines, markLinesSeen } from '@/lib/forHer'
import { EASE } from '@/lib/motion'
import { scrollToY } from '@/lib/scroll'

type Phase = 'threshold' | 'lines' | 'room'

const NIGHT = '#130b0e'

// How much light is in the room at each step.
const GLOW: Record<Phase, { candle: number; rose: number; embers: number }> = {
  threshold: { candle: 0.45, rose: 0, embers: 0.3 },
  lines: { candle: 0.7, rose: 0.25, embers: 0.55 },
  room: { candle: 1, rose: 0.8, embers: 1 },
}

/** Her page. Outside the studio layout on purpose — nothing here is his. */
export default function ForYou() {
  const [params] = useSearchParams()
  // ?preview always starts from the top and never marks the lines as seen.
  const preview = params.has('preview')
  const [phase, setPhase] = useState<Phase>(() => (!preview && hasSeenLines() ? 'room' : 'threshold'))

  const moments = useMoments()
  const { data: poems = [] } = useSharedPoems()
  const song = useSong(FOR_HER.song, FOR_HER.songVolume)

  const lines: Line[] = useMemo(() => {
    const own = (moments.data ?? []).filter((m) => m.text.trim())
    if (own.length) return own.map((m) => ({ text: m.text, pauseMs: m.pause_ms }))
    return FOR_HER.placeholderLines.map((text) => ({ text, pauseMs: null }))
  }, [moments.data])

  useNightMood()

  const begin = () => {
    song.play()
    setPhase('lines')
  }

  const finishLines = useCallback(() => {
    if (!preview) markLinesSeen()
    scrollToY(0)
    setPhase('room')
  }, [preview])

  const replay = () => {
    scrollToY(0)
    if (!song.playing) song.play()
    setPhase('lines')
  }

  const glow = GLOW[phase]

  return (
    <div className="romance relative min-h-dvh overflow-x-hidden">
      {/* Light sources: a candle below, a rose warmth that blooms in the room. */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <motion.div
          className="absolute left-1/2 top-[70%] h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgb(var(--r-candle) / 0.16), transparent 70%)' }}
          animate={{ opacity: glow.candle }}
          transition={{ duration: 3, ease: EASE.quiet }}
        />
        <motion.div
          className="absolute -right-[30vmax] -top-[30vmax] h-[90vmax] w-[90vmax] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgb(var(--r-rose) / 0.13), transparent 70%)' }}
          animate={{ opacity: glow.rose }}
          transition={{ duration: 4, ease: EASE.quiet }}
        />
        <div className="grain-overlay" />
      </div>
      <Embers intensity={glow.embers} />
      <Stars active={phase === 'room'} />
      <Candlelight active={phase !== 'threshold'} />

      {song.available && phase !== 'threshold' && (
        <motion.button
          type="button"
          onClick={song.toggle}
          aria-label={song.playing ? 'Mute music' : 'Play music'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="fixed right-5 top-5 z-30 rounded-full p-2.5 text-romance-faint transition-colors duration-500 hover:text-romance-ink"
        >
          {song.playing ? <Volume2 size={16} strokeWidth={1.25} /> : <VolumeX size={16} strokeWidth={1.25} />}
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {phase === 'threshold' && <Threshold key="threshold" ready={!moments.isLoading} onBegin={begin} />}
        {phase === 'lines' && <LineSequence key="lines" lines={lines} onDone={finishLines} />}
        {phase === 'room' && <Room key="room" poems={poems} onReplay={replay} />}
      </AnimatePresence>
    </div>
  )
}

/** Tab title, browser chrome and overscroll all go dark while she's here. */
function useNightMood() {
  useEffect(() => {
    const prevTitle = document.title
    const prevBody = document.body.style.backgroundColor
    const metas = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'))
    const prevMetas = metas.map((m) => m.content)

    document.title = FOR_HER.tabTitle
    document.body.style.backgroundColor = NIGHT
    metas.forEach((m) => (m.content = NIGHT))

    return () => {
      document.title = prevTitle
      document.body.style.backgroundColor = prevBody
      metas.forEach((m, i) => (m.content = prevMetas[i]))
    }
  }, [])
}
