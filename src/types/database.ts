export interface Database {
  public: {
    Tables: {
      poems: {
        Row: {
          id: string
          title: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          content?: string
          created_at?: string
          updated_at?: string
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
