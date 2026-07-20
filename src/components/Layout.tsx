import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { JournalHeader } from '@/components/JournalHeader'
import { GrainOverlay } from '@/components/GrainOverlay'
import { AmbientBackground } from '@/components/AmbientBackground'
import { CustomCursor } from '@/components/CustomCursor'

export function Layout() {
  const location = useLocation()

  return (
    <div className="relative min-h-dvh">
      <AmbientBackground />
      <GrainOverlay />
      <CustomCursor />

      <div className="relative z-10">
        <LayoutGroup>
          <JournalHeader />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10 sm:px-8"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </div>
  )
}
