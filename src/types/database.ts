export interface Database {
  public: {
    Tables: {
      poems: {
        Row: {
          id: string
          title: string | null
          content: string
          shared: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          content?: string
          shared?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          content?: string
          shared?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      moments: {
        Row: {
          id: string
          position: number
          text: string
          pause_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          position?: number
          text?: string
          pause_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          position?: number
          text?: string
          pause_ms?: number | null
          created_at?: string
        }
        Relationships: []
      }
      replies: {
        Row: {
          id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          body?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
