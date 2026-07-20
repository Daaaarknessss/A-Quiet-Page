import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { EASE } from '@/lib/motion'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const expanded = focused || value.length > 0

  return (
    <motion.div
      animate={{ width: expanded ? 340 : 230 }}
      transition={{ duration: 0.5, ease: EASE.outExpo }}
      className="group flex max-w-full items-center gap-3 border-b border-line/80 py-2.5 transition-colors duration-300 max-sm:!w-full focus-within:border-bronze/60"
    >
      <Search size={16} strokeWidth={1.5} className="flex-none text-ink-faint" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search your poems…"
        className="w-full bg-transparent font-sans text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          data-cursor="hover"
          className="flex-none text-ink-faint transition-colors duration-300 hover:text-ink"
        >
          <X size={15} strokeWidth={1.5} />
        </button>
      )}
    </motion.div>
  )
}
