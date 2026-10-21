import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export const poemsKey = ['poems'] as const
export const momentsKey = ['moments'] as const
export const repliesKey = ['replies'] as const
export const sharedPoemsKey = ['poems', 'shared'] as const
