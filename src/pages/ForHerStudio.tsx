import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, Check, Copy, Eye, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/Button'
import { PaperContainer } from '@/components/PaperContainer'
import { usePoems } from '@/hooks/usePoems'
import {
  useCreateMoment,
  useDeleteMoment,
  useDeleteReply,
  useMoments,
  useReorderMoments,
  useReplies,
  useUpdateMoment,
} from '@/hooks/useForHer'
import { FOR_HER } from '@/lib/forHer'
import { formatLongDate } from '@/lib/date'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/cn'
import type { Moment } from '@/types/forHer'

/** His side of her page: the lines, which poems she sees, and her notes. */
export default function ForHerStudio() {
  const moments = useMoments()
  const replies = useReplies()
  const needsMigration = moments.isError || replies.isError

  return (
    <div className="pb-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE.quiet }}
      >
        <h1 className="mb-2 font-display text-4xl font-light text-ink">For her</h1>
        <p className="mb-8 text-sm text-ink-faint">What she sees when she opens the page you send her.</p>

        <ShareBar />

        {needsMigration && (
          <p className="mt-8 rounded-lg border border-terracotta/40 bg-terracotta/5 px-5 py-4 text-sm text-ink-soft">
            The database doesn’t have the new tables yet. Run{' '}
            <code className="font-mono text-[13px]">supabase/for_her.sql</code> in the Supabase SQL editor, then reload.
          </p>
        )}

        <Section title="The lines" hint="They arrive one at a time, in this order, before anything else.">
          <MomentsEditor moments={moments.data ?? []} loading={moments.isLoading} />
        </Section>

        <Section title="Pages she’ll read" hint="Every poem you write, oldest first.">
          <BookSummary />
        </Section>

        <Section title="Her notes" hint="Anything she writes back lands here.">
          <RepliesList />
        </Section>
      </motion.div>
    </div>
  )
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-light text-ink">{title}</h2>
      <p className="mb-6 mt-1 text-sm text-ink-faint">{hint}</p>
      {children}
    </section>
  )
}

function ShareBar() {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/for-you`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy her link:', link)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => window.open('/for-you?preview', '_blank', 'noopener')}>
        <span className="flex items-center gap-2">
          <Eye size={15} strokeWidth={1.5} /> Preview her page
        </span>
      </Button>
      <Button variant="ghost" onClick={copy}>
        <span className="flex items-center gap-2">
          {copied ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
          {copied ? 'Copied' : 'Copy her link'}
        </span>
      </Button>
    </div>
  )
}

// ---------- Lines ----------

function MomentsEditor({ moments, loading }: { moments: Moment[]; loading: boolean }) {
  const create = useCreateMoment()
  const reorder = useReorderMoments()

  const add = () => {
    const position = moments.length ? Math.max(...moments.map((m) => m.position)) + 1 : 0
    create.mutate({ position })
  }

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= moments.length) return
    const next = [...moments]
    ;[next[index], next[target]] = [next[target], next[index]]
    reorder.mutate(next)
  }

  if (loading) return <p className="text-sm italic text-ink-faint">Loading…</p>

  return (
    <div>
      {moments.length === 0 && (
        <div className="mb-6 rounded-lg border border-dashed border-line px-5 py-4 text-sm text-ink-soft">
          No lines yet, so she’d see these placeholders:
          <ul className="mt-3 space-y-1 font-display text-base italic text-ink-faint">
            {FOR_HER.placeholderLines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}

      <ol className="space-y-3">
        <AnimatePresence initial={false}>
          {moments.map((m, i) => (
            <MomentRow
              key={m.id}
              moment={m}
              index={i}
              isFirst={i === 0}
              isLast={i === moments.length - 1}
              onMove={(dir) => move(i, dir)}
            />
          ))}
        </AnimatePresence>
      </ol>

      <button
        type="button"
        onClick={add}
        disabled={create.isPending}
        data-cursor="hover"
        className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-faint transition-colors duration-300 hover:text-ink disabled:opacity-40"
      >
        <Plus size={14} strokeWidth={1.5} /> Add a line
      </button>
      <p className="mt-3 text-xs text-ink-faint">
        A line that’s just “…” becomes a quiet beat. “Pause after” adds extra silence before the next line.
      </p>
    </div>
  )
}

function MomentRow({
  moment,
  index,
  isFirst,
  isLast,
  onMove,
}: {
  moment: Moment
  index: number
  isFirst: boolean
  isLast: boolean
  onMove: (dir: -1 | 1) => void
}) {
  const update = useUpdateMoment()
  const remove = useDeleteMoment()
  const [text, setText] = useState(moment.text)
  const [pause, setPause] = useState(moment.pause_ms != null ? String(moment.pause_ms / 1000) : '')

  useEffect(() => setText(moment.text), [moment.text])

  const saveText = () => {
    if (text !== moment.text) update.mutate({ id: moment.id, text })
  }
  const savePause = () => {
    const seconds = parseFloat(pause)
    const pause_ms = pause.trim() === '' || Number.isNaN(seconds) ? null : Math.round(Math.max(0, seconds) * 1000)
    if (pause_ms !== moment.pause_ms) update.mutate({ id: moment.id, pause_ms })
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: EASE.quiet }}
    >
      <PaperContainer className="flex gap-4 px-5 py-4">
        <span className="pt-1.5 font-display text-lg text-ink-faint">{index + 1}</span>

        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={saveText}
            placeholder="Something you’ve been meaning to tell her…"
            rows={Math.max(1, text.split('\n').length)}
            className="block w-full resize-none bg-transparent font-display text-xl leading-relaxed text-ink placeholder:text-ink-faint/60 focus:outline-none"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-ink-faint">
            Pause after
            <input
              type="number"
              min={0}
              step={0.5}
              value={pause}
              onChange={(e) => setPause(e.target.value)}
              onBlur={savePause}
              placeholder="—"
              className="w-14 border-b border-line bg-transparent text-center text-ink-soft focus:border-bronze focus:outline-none"
            />
            sec
          </label>
        </div>

        <div className="flex flex-col items-center gap-1 text-ink-faint">
          <IconButton label="Move up" onClick={() => onMove(-1)} disabled={isFirst}>
            <ArrowUp size={14} strokeWidth={1.5} />
          </IconButton>
          <IconButton label="Move down" onClick={() => onMove(1)} disabled={isLast}>
            <ArrowDown size={14} strokeWidth={1.5} />
          </IconButton>
          <IconButton label="Delete line" onClick={() => remove.mutate(moment.id)} danger>
            <Trash2 size={14} strokeWidth={1.5} />
          </IconButton>
        </div>
      </PaperContainer>
    </motion.li>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      data-cursor="hover"
      className={cn(
        'rounded p-1 transition-colors duration-300 disabled:opacity-20',
        danger ? 'hover:text-terracotta' : 'hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

// ---------- Her book ----------

function BookSummary() {
  const { data: poems = [], isLoading } = usePoems()
  const count = poems.filter((p) => p.content.trim()).length

  if (isLoading) return <p className="text-sm italic text-ink-faint">Loading…</p>
  return (
    <p className="font-display text-lg italic text-ink-soft">
      {count === 0
        ? 'No poems written yet — her book fills as you write.'
        : `All ${count} of your poems are in her book, and every new one joins it.`}
    </p>
  )
}

// ---------- Replies ----------

function RepliesList() {
  const { data: replies = [], isLoading } = useReplies()
  const remove = useDeleteReply()

  if (isLoading) return <p className="text-sm italic text-ink-faint">Loading…</p>
  if (replies.length === 0) return <p className="font-display italic text-ink-faint">Nothing yet.</p>

  return (
    <ul className="space-y-4">
      {replies.map((r) => {
        const date = new Date(r.created_at)
        return (
          <li key={r.id}>
            <PaperContainer className="group px-6 py-5">
              <p className="whitespace-pre-line font-serif text-[19px] leading-relaxed text-ink">{r.body}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-faint">
                <span>
                  {formatLongDate(date)}, {date.getFullYear()} ·{' '}
                  {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
                <button
                  type="button"
                  onClick={() => remove.mutate(r.id)}
                  aria-label="Delete note"
                  data-cursor="hover"
                  className="opacity-0 transition-all duration-300 hover:text-terracotta group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              </div>
            </PaperContainer>
          </li>
        )
      })}
    </ul>
  )
}
