import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { usePoems } from '@/hooks/usePoems'
import { useAutosave } from '@/hooks/useAutosave'
import { Editor } from '@/components/Editor'
import { Button } from '@/components/Button'
import { PaperContainer } from '@/components/PaperContainer'
import { FloatingSaveIndicator } from '@/components/FloatingSaveIndicator'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { formatLongDate, isSameDay, weekdayName } from '@/lib/date'
import { quoteOfTheDay } from '@/lib/quotes'
import { firstLine, wordCount, type Poem } from '@/types/poem'
import { gsap } from '@/lib/gsap'
import { DURATION, EASE, prefersReducedMotion } from '@/lib/motion'
import { hasIntroPlayed, markIntroPlayed } from '@/lib/introFlag'

type View = 'greeting' | 'writing'

export default function Home() {
  const { data: poems = [], isLoading } = usePoems()
  const today = useMemo(() => new Date(), [])

  const todaysPoem = useMemo(
    () => poems.find((p) => isSameDay(new Date(p.created_at), today)) ?? null,
    [poems, today],
  )

  const [view, setView] = useState<View>('greeting')
  const [activePoem, setActivePoem] = useState<Poem | null>(null)
  const [content, setContent] = useState('')
  const [closing, setClosing] = useState(false)

  const weekdayRef = useRef<HTMLParagraphElement>(null)
  const dateRef = useRef<HTMLHeadingElement>(null)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (hasIntroPlayed() || prefersReducedMotion()) return
    const els = [weekdayRef.current, dateRef.current, quoteRef.current, buttonRef.current]
    if (els.some((el) => !el)) return

    const ctx = gsap.context(() => {
      gsap.set(els, { opacity: 0 })
      gsap
        // A killed (reverted) timeline never reaches onComplete, so
        // StrictMode's throwaway first mount — reverted before it can finish
        // — never marks the flag. Only a genuinely-surviving mount's
        // animation completes and marks it, exactly once.
        .timeline({ defaults: { ease: 'expo.out' }, onComplete: markIntroPlayed })
        .fromTo(weekdayRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 })
        .fromTo(dateRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.1 }, '-=0.55')
        .fromTo(
          quoteRef.current,
          { opacity: 0, y: 12, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, clearProps: 'filter' },
          '-=0.75',
        )
        .fromTo(
          buttonRef.current,
          { opacity: 0, y: 10, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, clearProps: 'filter' },
          '-=0.55',
        )
    })

    return () => ctx.revert()
  }, [])

  const beginWriting = () => {
    setActivePoem(todaysPoem)
    setContent(todaysPoem?.content ?? '')
    setClosing(false)
    setView('writing')
  }

  const { status, saveNow } = useAutosave({
    poem: activePoem,
    title: firstLine(content),
    content,
    onCreated: setActivePoem,
  })

  const finishWriting = async () => {
    setClosing(true)
    const success = await saveNow()
    if (success) {
      setTimeout(() => setView('greeting'), 500)
    } else {
      setClosing(false)
    }
  }

  return (
    <>
      {/* popLayout (not wait) lets the outgoing and incoming views briefly
          overlap, so the shared "active-date" element can actually be seen
          traveling between them instead of a hidden jump-cut. */}
      <AnimatePresence mode="popLayout">
        {view === 'greeting' ? (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
            transition={{ duration: 0.5, ease: EASE.outQuart }}
            className="flex flex-col items-center px-4 py-20 text-center sm:py-28"
          >
            <p ref={weekdayRef} className="mb-6 text-xs uppercase tracking-[0.24em] text-ink-faint">
              {weekdayName(today)}
            </p>
            {/* Shared with the small date label in the writing view — Framer
                morphs position, size and type-scale between the two. */}
            <motion.h1
              ref={dateRef}
              layoutId="active-date"
              className="mb-8 font-display text-6xl font-light leading-none text-ink sm:text-7xl"
            >
              {formatLongDate(today)}
            </motion.h1>
            <motion.p
              ref={quoteRef}
              animate={
                view === 'greeting'
                  ? { opacity: 1, filter: 'blur(0px)' }
                  : { opacity: 0, filter: 'blur(10px)' }
              }
              transition={{ duration: 0.4, ease: EASE.outQuart }}
              className="mb-12 max-w-xs font-display text-lg italic leading-relaxed text-ink-soft"
            >
              {quoteOfTheDay(today)}
            </motion.p>
            <Button ref={buttonRef} onClick={beginWriting} disabled={isLoading}>
              {todaysPoem ? 'Continue Writing' : 'Begin Writing'}
            </Button>
            {todaysPoem && (
              <p className="mt-7 text-xs text-ink-faint">
                Today&rsquo;s page already holds <AnimatedNumber value={wordCount(todaysPoem.content)} /> words.
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="writing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.unfold, ease: EASE.outExpo }}
            className="pb-16"
          >
            <button
              type="button"
              onClick={() => setView('greeting')}
              data-cursor="hover"
              className="mb-10 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-faint transition-colors duration-300 hover:text-ink"
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              <motion.span layoutId="active-date">{formatLongDate(today)}</motion.span>
            </button>

            {/* The paper "expands" and the editor "grows from center" —
                scale up from a slightly smaller, centered state. */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: DURATION.unfold, ease: EASE.outExpo }}
              style={{ transformOrigin: 'center' }}
            >
              <PaperContainer breathing className="px-6 py-10 sm:px-14 sm:py-14">
                <Editor value={content} onChange={setContent} autoFocus />
              </PaperContainer>
            </motion.div>

            <div className="mt-12 flex justify-center">
              <Button variant="ghost" onClick={finishWriting} disabled={closing}>
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingSaveIndicator status={status} />
    </>
  )
}
