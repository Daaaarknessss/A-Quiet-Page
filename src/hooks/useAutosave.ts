import { useCallback, useEffect, useRef, useState } from 'react'
import { useCreatePoem, useUpdatePoem } from '@/hooks/usePoems'
import type { Poem } from '@/types/poem'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const AUTOSAVE_DELAY = 1400

interface UseAutosaveOptions {
  poem: Poem | null
  title: string
  content: string
  onCreated?: (poem: Poem) => void
}

export function useAutosave({ poem, title, content, onCreated }: UseAutosaveOptions) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const createPoem = useCreatePoem()
  const updatePoem = useUpdatePoem()

  const lastSaved = useRef<{ title: string; content: string }>({
    title: poem?.title ?? '',
    content: poem?.content ?? '',
  })
  const poemIdRef = useRef<string | null>(poem?.id ?? null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    poemIdRef.current = poem?.id ?? null
    lastSaved.current = { title: poem?.title ?? '', content: poem?.content ?? '' }
  }, [poem?.id])

  const persist = useCallback(
    async (nextTitle: string, nextContent: string): Promise<boolean> => {
      if (!nextContent.trim()) return true
      if (nextTitle === lastSaved.current.title && nextContent === lastSaved.current.content) return true

      setStatus('saving')
      try {
        if (poemIdRef.current) {
          await updatePoem.mutateAsync({ id: poemIdRef.current, title: nextTitle || null, content: nextContent })
        } else {
          const created = await createPoem.mutateAsync({ title: nextTitle || null, content: nextContent })
          poemIdRef.current = created.id
          onCreated?.(created)
        }
        lastSaved.current = { title: nextTitle, content: nextContent }
        setStatus('saved')
        return true
      } catch {
        setStatus('error')
        return false
      }
    },
    [createPoem, updatePoem, onCreated],
  )

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (!content.trim()) return
    if (title === lastSaved.current.title && content === lastSaved.current.content) return

    timeoutRef.current = setTimeout(() => {
      void persist(title, content)
    }, AUTOSAVE_DELAY)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content])

  const saveNow = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    return persist(title, content)
  }, [persist, title, content])

  return { status, saveNow, poemId: poemIdRef }
}
