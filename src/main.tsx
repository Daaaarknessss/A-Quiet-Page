import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from '@/context/ThemeContext'
import { SmoothScroll } from '@/components/SmoothScroll'
import App from '@/App'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SmoothScroll>
          <App />
        </SmoothScroll>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
