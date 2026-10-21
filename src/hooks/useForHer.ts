import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { momentsKey, repliesKey, sharedPoemsKey } from '@/lib/queryClient'
import type { Moment, Reply, SharedPoem } from '@/types/forHer'

// ---------- Moments (the lines) ----------

export function useMoments() {
  return useQuery({
    queryKey: momentsKey,
    queryFn: async (): Promise<Moment[]> => {
      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateMoment() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: { position: number; text?: string }) => {
      const { data, error } = await supabase
        .from('moments')
        .insert({ position: input.position, text: input.text ?? '' })
        .select()
        .single()
      if (error) throw error
      return data as Moment
    },
    onSuccess: (created) => {
      client.setQueryData<Moment[]>(momentsKey, (old) => [...(old ?? []), created])
    },
  })
}

export function useUpdateMoment() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; text?: string; pause_ms?: number | null }) => {
      const { id, ...changes } = input
      const { error } = await supabase.from('moments').update(changes).eq('id', id)
      if (error) throw error
    },
    onMutate: async (input) => {
      await client.cancelQueries({ queryKey: momentsKey })
      const previous = client.getQueryData<Moment[]>(momentsKey)
      client.setQueryData<Moment[]>(momentsKey, (old) =>
        (old ?? []).map((m) => (m.id === input.id ? { ...m, ...input } : m)),
      )
      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) client.setQueryData(momentsKey, context.previous)
    },
  })
}

export function useDeleteMoment() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('moments').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: momentsKey })
      const previous = client.getQueryData<Moment[]>(momentsKey)
      client.setQueryData<Moment[]>(momentsKey, (old) => (old ?? []).filter((m) => m.id !== id))
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) client.setQueryData(momentsKey, context.previous)
    },
  })
}

/** Writes the given order back as positions 0..n-1. */
export function useReorderMoments() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (ordered: Moment[]) => {
      const results = await Promise.all(
        ordered.map((m, i) => supabase.from('moments').update({ position: i }).eq('id', m.id)),
      )
      const failed = results.find((r) => r.error)
      if (failed?.error) throw failed.error
    },
    onMutate: async (ordered) => {
      await client.cancelQueries({ queryKey: momentsKey })
      const previous = client.getQueryData<Moment[]>(momentsKey)
      client.setQueryData<Moment[]>(
        momentsKey,
        ordered.map((m, i) => ({ ...m, position: i })),
      )
      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) client.setQueryData(momentsKey, context.previous)
    },
  })
}

// ---------- Her book ----------

/** Her side: every poem, oldest first like a book. */
export function useSharedPoems() {
  return useQuery({
    queryKey: sharedPoemsKey,
    queryFn: async (): Promise<SharedPoem[]> => {
      const { data, error } = await supabase
        .from('poems')
        .select('id, content, created_at')
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []).filter((p) => p.content.trim().length > 0)
    },
  })
}

// ---------- Replies ----------

export function useReplies() {
  return useQuery({
    queryKey: repliesKey,
    queryFn: async (): Promise<Reply[]> => {
      const { data, error } = await supabase
        .from('replies')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useSendReply() {
  return useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase.from('replies').insert({ body })
      if (error) throw error
    },
  })
}

export function useDeleteReply() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('replies').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: repliesKey })
      const previous = client.getQueryData<Reply[]>(repliesKey)
      client.setQueryData<Reply[]>(repliesKey, (old) => (old ?? []).filter((r) => r.id !== id))
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) client.setQueryData(repliesKey, context.previous)
    },
  })
}
