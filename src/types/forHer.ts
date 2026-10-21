export interface Moment {
  id: string
  position: number
  text: string
  /** Extra silence after the line, in ms. Null = the default rhythm. */
  pause_ms: number | null
  created_at: string
}

export interface Reply {
  id: string
  body: string
  created_at: string
}

/** What her page needs from a poem — nothing more. */
export interface SharedPoem {
  id: string
  content: string
  created_at: string
}
