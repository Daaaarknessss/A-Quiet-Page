import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useSendReply } from '@/hooks/useForHer'
import { FOR_HER } from '@/lib/forHer'
import { EASE } from '@/lib/motion'

/** Her way of writing back. Notes land in the studio's "For her" tab. */
export function ReplyBox() {
  const [body, setBody] = useState('')
  const [sent, setSent] = useState(false)
  const send = useSendReply()
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [body])

  const submit = () => {
    const text = body.trim()
    if (!text || send.isPending) return
    send.mutate(text, {
      onSuccess: () => {
        setSent(true)
        setBody('')
      },
    })
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.9, ease: EASE.quiet }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.25, 1], opacity: 1 }}
              transition={{ duration: 1.1, ease: EASE.outExpo }}
              className="mb-5 text-romance-rose"
            >
              <Heart size={22} strokeWidth={1.25} fill="currentColor" />
            </motion.div>
            <p className="candle-text font-display text-2xl italic text-romance-ink">{FOR_HER.replySent}</p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-6 font-sans text-[11px] uppercase tracking-[0.24em] text-romance-faint transition-colors duration-500 hover:text-romance-soft"
            >
              Write another
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.9, ease: EASE.quiet }}
          >
            <p className="mb-6 font-display text-xl italic text-romance-soft">{FOR_HER.replyPrompt}</p>
            <textarea
              ref={ref}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={FOR_HER.replyPlaceholder}
              rows={2}
              className="block w-full resize-none overflow-hidden border-b border-romance-line bg-transparent pb-3 text-center font-serif text-[19px] leading-[1.7] text-romance-ink placeholder:text-romance-faint/60 focus:border-romance-candle/50 focus:outline-none transition-colors duration-500"
            />
            <div className="mt-8 flex flex-col items-center gap-3">
              <motion.button
                type="button"
                onClick={submit}
                disabled={!body.trim() || send.isPending}
                whileTap={{ scale: 0.96 }}
                className="rounded-full border border-romance-rose/40 bg-romance-rose/10 px-8 py-3 font-sans text-[13px] tracking-[0.12em] text-romance-ink transition-all duration-500 hover:border-romance-rose/70 hover:bg-romance-rose/20 hover:shadow-[0_0_40px_-8px_rgb(var(--r-rose)/0.5)] disabled:pointer-events-none disabled:opacity-30"
              >
                {send.isPending ? 'Sending…' : FOR_HER.replySend}
              </motion.button>
              {send.isError && (
                <p className="font-sans text-xs text-romance-rose/80">It didn’t go through — try once more?</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
