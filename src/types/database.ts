export interface Database {
  public: {
    Tables: {
      pairs: {
        Row: {
          id: string
          pair_code: string
          members: string[]
          budget_total: number
          budget_categories: Record<string, number> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pair_code: string
          members?: string[]
          budget_total?: number
          budget_categories?: Record<string, number> | null
        }
        Update: {
          pair_code?: string
          members?: string[]
          budget_total?: number
          budget_categories?: Record<string, number> | null
        }
      }
      expenses: {
        Row: {
          id: string
          pair_id: string
          amount: number
          category: string
          description: string
          date: string
          created_by: string | null
          created_at: string
          last_edited_at: string
        }
        Insert: {
          id?: string
          pair_id: string
          amount: number
          category: string
          description?: string
          date: string
          created_by?: string | null
        }
        Update: {
          amount?: number
          category?: string
          description?: string
          date?: string
          last_edited_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          pair_id: string
          name: string
          emoji: string
          ingredients: string[]
          tags: string[]
          image_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pair_id: string
          name: string
          emoji?: string
          ingredients?: string[]
          tags?: string[]
          image_url?: string | null
          created_by?: string | null
        }
        Update: {
          name?: string
          emoji?: string
          ingredients?: string[]
          tags?: string[]
          image_url?: string | null
        }
      }
      shopping_list: {
        Row: {
          id: string
          pair_id: string
          name: string
          completed: boolean
          note: string | null
          added_by: string | null
          completed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pair_id: string
          name: string
          completed?: boolean
          note?: string | null
          added_by?: string | null
        }
        Update: {
          completed?: boolean
          note?: string | null
          completed_by?: string | null
        }
      }
      food_memories: {
        Row: {
          id: string
          pair_id: string
          recipe_id: string | null
          recipe_name: string
          emoji: string
          image_url: string | null
          note: string | null
          date: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pair_id: string
          recipe_id?: string | null
          recipe_name: string
          emoji?: string
          image_url?: string | null
          note?: string | null
          date: string
          created_by?: string | null
        }
        Update: {
          recipe_name?: string
          emoji?: string
          image_url?: string | null
          note?: string | null
          date?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          pair_id: string
          type: string
          title: string
          date: string
          repeat: boolean
          note: string | null
          metadata: Record<string, string> | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pair_id: string
          type: string
          title: string
          date: string
          repeat?: boolean
          note?: string | null
          metadata?: Record<string, string> | null
          created_by?: string | null
        }
        Update: {
          type?: string
          title?: string
          date?: string
          repeat?: boolean
          note?: string | null
          metadata?: Record<string, string> | null
        }
      }
      ai_reports: {
        Row: {
          id: string
          pair_id: string
          type: string
          content: string
          related_data: Record<string, unknown> | null
          user_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pair_id: string
          type: string
          content: string
          related_data?: Record<string, unknown> | null
        }
        Update: {
          user_feedback?: string | null
        }
      }
    }
  }
}
