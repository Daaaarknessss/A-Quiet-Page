import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { poemsKey } from '@/lib/queryClient'
import type { Poem } from '@/types/poem'

async function fetchPoems(): Promise<Poem[]> {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export function usePoems() {
  return useQuery({ queryKey: poemsKey, queryFn: fetchPoems })
}

export function useCreatePoem() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (input: { title?: string | null; content: string }) => {
      const { data, error } = await supabase
        .from('poems')
        .insert({ title: input.title ?? null, content: input.content })
        .select()
        .single()

      if (error) throw error
      return data as Poem
    },
    onMutate: async (input) => {
      await client.cancelQueries({ queryKey: poemsKey })
      const previous = client.getQueryData<Poem[]>(poemsKey)

      const optimistic: Poem = {
        id: `optimistic-${Date.now()}`,
        title: input.title ?? null,
        content: input.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      client.setQueryData<Poem[]>(poemsKey, (old) => [optimistic, ...(old ?? [])])
      return { previous, optimisticId: optimistic.id }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) client.setQueryData(poemsKey, context.previous)
    },
    onSuccess: (created, _input, context) => {
      client.setQueryData<Poem[]>(poemsKey, (old) =>
        (old ?? []).map((p) => (p.id === context?.optimisticId ? created : p)),
      )
    },
  })
}

export function useUpdatePoem() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string; title?: string | null; content: string }) => {
      const { data, error } = await supabase
        .from('poems')
        .update({ title: input.title ?? null, content: input.content, updated_at: new Date().toISOString() })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw error
      return data as Poem
    },
    onMutate: async (input) => {
      await client.cancelQueries({ queryKey: poemsKey })
      const previous = client.getQueryData<Poem[]>(poemsKey)

      client.setQueryData<Poem[]>(poemsKey, (old) =>
        (old ?? []).map((p) =>
          p.id === input.id
            ? { ...p, title: input.title ?? null, content: input.content, updated_at: new Date().toISOString() }
            : p,
        ),
      )
      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) client.setQueryData(poemsKey, context.previous)
    },
    onSuccess: (updated) => {
      client.setQueryData<Poem[]>(poemsKey, (old) =>
        (old ?? []).map((p) => (p.id === updated.id ? updated : p)),
      )
    },
  })
}

export function useDeletePoem() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('poems').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: poemsKey })
      const previous = client.getQueryData<Poem[]>(poemsKey)
      client.setQueryData<Poem[]>(poemsKey, (old) => (old ?? []).filter((p) => p.id !== id))
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) client.setQueryData(poemsKey, context.previous)
    },
  })
}
