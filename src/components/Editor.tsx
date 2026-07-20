import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function Editor({ value, onChange, placeholder = 'Begin here…', autoFocus }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState(false)

  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    resize()
  }, [value])

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => ref.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [autoFocus])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn('mx-auto w-full max-w-measure rounded-lg transition-shadow', focused && 'editor-breathing')}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        rows={1}
        spellCheck
        className="block w-full resize-none overflow-hidden bg-transparent font-serif text-[22px] leading-[1.9] text-ink placeholder:text-ink-faint/70 focus:outline-none sm:text-[24px]"
        style={{ minHeight: '40vh' }}
      />
    </motion.div>
  )
}
