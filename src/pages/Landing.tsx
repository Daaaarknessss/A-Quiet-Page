import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { Feather, Heart } from 'lucide-react'
import { AmbientBackground } from '@/components/AmbientBackground'
import { CustomCursor } from '@/components/CustomCursor'
import { FOR_HER } from '@/lib/forHer'
import { EASE, prefersReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/cn'

type DoorId = 'desk' | 'her'

const DESTINATION: Record<DoorId, string> = { desk: '/studio', her: '/for-you' }

// The door eases open a crack, rests there while the light spills out, then swings in.
const SWING: Transition = { duration: 1.6, times: [0, 0.28, 0.45, 1], ease: ['easeOut', 'linear', 'easeIn'] }
// When the room beyond fills the screen, just as the door finishes swinging.
const STEP_THROUGH = { delay: 1.05, duration: 0.6 }

/** Two ways in: his desk, and the page he made for her. */
export default function Landing() {
  const navigate = useNavigate()
  const [opening, setOpening] = useState<DoorId | null>(null)

  const open = (door: DoorId) => {
    if (opening) return
    if (prefersReducedMotion()) return navigate(DESTINATION[door])
    setOpening(door)
  }

  return (
    <div className="relative min-h-dvh">
      <AmbientBackground />
      <CustomCursor />

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-20">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: opening ? 0 : 1, y: 0 }}
          transition={{ duration: opening ? 0.5 : 0.9, ease: EASE.quiet }}
          className="mb-3 font-display text-[15px] italic tracking-wide text-ink-faint"
        >
          The Quiet Page
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: opening ? 0 : 1, y: 0 }}
          transition={opening ? { duration: 0.5, ease: EASE.quiet } : { duration: 1.1, delay: 0.1, ease: EASE.outExpo }}
          className="mb-16 text-center font-display text-5xl font-light text-ink sm:text-6xl"
        >
          Which door?
        </motion.h1>

        <div className="grid w-full gap-5 sm:grid-cols-2 sm:gap-6">
          {/* His door — quiet, paper, like the rest of the studio. */}
          <Door
            id="desk"
            opening={opening}
            onOpen={open}
            delay={0.35}
            className="border border-line/80 bg-paper-soft shadow-soft hover:shadow-lift"
            beyond={
              <div className="absolute inset-0 bg-paper">
                <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgb(255_250_240/0.9),transparent)]" />
              </div>
            }
            sliver="bg-[linear-gradient(to_left,rgb(255_250_240),rgb(var(--color-bronze)/0.25)_40%,transparent)]"
          >
            <Feather size={20} strokeWidth={1.25} className="mb-10 text-ink-faint transition-colors duration-500 group-hover:text-bronze" />
            <span className="font-display text-3xl font-light text-ink">The desk</span>
            <span className="mt-2 text-sm text-ink-faint">Write, edit, and keep.</span>
          </Door>

          {/* Her door — a glimpse of the candlelit room behind it. */}
          <Door
            id="her"
            opening={opening}
            onOpen={open}
            delay={0.5}
            className="romance border border-romance-line shadow-lift"
            beyond={
              <div className="romance absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgb(var(--r-candle)/0.35),transparent_70%)]" />
              </div>
            }
            sliver="romance bg-[linear-gradient(to_left,rgb(var(--r-candle)),rgb(var(--r-rose)/0.35)_40%,transparent)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-romance-candle/20 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:bg-romance-rose/25"
            />
            <Heart
              size={20}
              strokeWidth={1.25}
              className="relative mb-10 text-romance-rose/80 transition-all duration-700 group-hover:scale-110 group-hover:fill-romance-rose/40"
            />
            <span className="candle-text relative font-display text-3xl font-light italic text-romance-ink">
              {FOR_HER.doorTitle}
            </span>
            <span className="relative mt-2 text-sm text-romance-soft/80">{FOR_HER.doorSubtitle}</span>
          </Door>
        </div>
      </main>

      {/* Stepping through: the room beyond fills the screen, then the route changes underneath it. */}
      <AnimatePresence>
        {opening && (
          <motion.div
            key={opening}
            className={cn('fixed inset-0 z-50', opening === 'her' ? 'romance' : 'bg-paper')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...STEP_THROUGH, ease: EASE.quiet }}
            onAnimationComplete={() => navigate(DESTINATION[opening])}
          >
            {opening === 'her' && (
              <div className="absolute inset-0 bg-[radial-gradient(closest-side_at_50%_70%,rgb(var(--r-candle)/0.12),transparent)]" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Door({
  id,
  opening,
  onOpen,
  delay,
  className,
  beyond,
  sliver,
  children,
}: {
  id: DoorId
  opening: DoorId | null
  onOpen: (id: DoorId) => void
  /** Entrance delay on first load. */
  delay: number
  className: string
  /** What's on the other side, seen once the door swings. */
  beyond: ReactNode
  /** Classes for the strip of light that escapes through the crack. */
  sliver: string
  children: ReactNode
}) {
  const isOpening = opening === id
  const isOther = opening !== null && !isOpening

  return (
    <motion.div
      className="relative"
      style={{ perspective: 1400 }}
      initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      animate={
        isOther
          ? { opacity: 0, y: 8, filter: 'blur(4px)', transition: { duration: 0.6, ease: EASE.quiet } }
          : { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, delay, ease: EASE.quiet } }
      }
    >
      {/* The doorway: dark until the door moves. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-2xl"
        initial={false}
        animate={{ opacity: isOpening ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {beyond}
        <motion.div
          className={cn('absolute inset-y-0 right-0 w-16 blur-[2px]', sliver)}
          initial={false}
          animate={isOpening ? { opacity: [0, 1, 1, 0.6], scaleX: [0.2, 1, 1.3, 3] } : { opacity: 0 }}
          transition={SWING}
          style={{ transformOrigin: 'right center' }}
        />
      </motion.div>

      <motion.button
        type="button"
        onClick={() => onOpen(id)}
        disabled={opening !== null}
        data-cursor="hover"
        whileHover={opening ? undefined : { y: -4 }}
        whileTap={opening ? undefined : { scale: 0.98 }}
        initial={false}
        animate={isOpening ? { rotateY: [0, 11, 11, 92] } : { rotateY: 0 }}
        transition={isOpening ? SWING : undefined}
        style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
        className={cn(
          'group relative flex w-full flex-col items-start overflow-hidden rounded-2xl p-8 text-left transition-shadow duration-500 sm:p-10',
          className,
        )}
      >
        {children}
      </motion.button>
    </motion.div>
  )
}
