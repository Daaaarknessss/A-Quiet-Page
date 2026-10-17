import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { usePoems, useDeletePoem } from '@/hooks/usePoems'
import { useAutosave } from '@/hooks/useAutosave'
import { Editor } from '@/components/Editor'
import { Button } from '@/components/Button'
import { PaperContainer } from '@/components/PaperContainer'
import { FloatingSaveIndicator } from '@/components/FloatingSaveIndicator'
import { formatCardDate, formatLongDate, weekdayName } from '@/lib/date'
import { firstLine } from '@/types/poem'

export default function Write() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  // Step back through history when we arrived from inside the app, so the
  // archive restores its scroll position; fall back for direct links.
  const backToArchive = () => (location.key !== 'default' ? navigate(-1) : navigate('/journal'))
  const { data: poems = [], isLoading } = usePoems()
  const deletePoem = useDeletePoem()

  const poem = poems.find((p) => p.id === id) ?? null
  const [content, setContent] = useState('')

  useEffect(() => {
    if (poem) setContent(poem.content)
  }, [poem?.id])

  const { status, saveNow } = useAutosave({
    poem,
    title: firstLine(content),
    content,
  })

  const [closing, setClosing] = useState(false)

  const finishWriting = async () => {
    setClosing(true)
    const success = await saveNow()
    if (success) {
      setTimeout(backToArchive, 500)
    } else {
      setClosing(false)
    }
  }

  if (!isLoading && !poem) {
    return (
      <div className="py-24 text-center">
        <p className="mb-6 font-display text-xl italic text-ink-soft">This page could not be found.</p>
        <Button variant="ghost" onClick={() => navigate('/journal')}>
          Back to the archive
        </Button>
      </div>
    )
  }

  const handleDelete = () => {
    if (!poem) return
    deletePoem.mutate(poem.id)
    backToArchive()
  }

  const date = poem ? new Date(poem.created_at) : new Date()
  const { day, month, year } = formatCardDate(date)

  return (
    <div className="pb-16">
      <div className="mb-10 flex items-start justify-between">
        <div className="flex items-start gap-5">
          <motion.div
            layoutId={poem ? `poem-day-${poem.id}` : undefined}
            className="w-16 flex-none text-right sm:w-20"
          >
            <div className="font-display text-3xl font-light leading-none text-ink sm:text-4xl">{day}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
              {month} {year}
            </div>
          </motion.div>

          <div className="pt-1">
            <div className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink-faint">{weekdayName(date)}</div>
            <button
              type="button"
              onClick={backToArchive}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-faint transition-colors duration-300 hover:text-ink"
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              {formatLongDate(date)}
            </button>
          </div>
        </div>

        {poem && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete poem"
            data-cursor="hover"
            className="text-ink-faint transition-colors duration-300 hover:text-terracotta"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <PaperContainer breathing className="px-6 py-10 sm:px-14 sm:py-14">
        <Editor value={content} onChange={setContent} />
      </PaperContainer>

      <div className="mt-12 flex justify-center">
        <Button variant="ghost" onClick={finishWriting} disabled={closing}>
          Save
        </Button>
      </div>

      <FloatingSaveIndicator status={status} />
    </div>
  )
}
