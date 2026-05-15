export interface Database {
  public: {
    Tables: {
      pairs: {
        Row: {
          id: string
          pair_code: string
          members: string[]
          metadata: Record<string, unknown> | null
          budget_total: number
          budget_categories: Record<string, number> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pair_code: string
          members?: string[]
          metadata?: Record<string, unknown> | null
          budget_total?: number
          budget_categories?: Record<string, number> | null
        }
        Update: {
          pair_code?: string
          members?: string[]
          metadata?: Record<string, unknown> | null
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
          recipe_id: string | null
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
          recipe_id?: string | null
          created_by?: string | null
        }
        Update: {
          amount?: number
          category?: string
          description?: string
          date?: string
          recipe_id?: string | null
          last_edited_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          difficulty: string | null
          category: string | null
          tags: string[]
          ingredients: { name: string; amount?: string }[]
          steps: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          difficulty?: string | null
          category?: string | null
          tags?: string[]
          ingredients?: { name: string; amount?: string }[]
          steps?: string[]
        }
        Update: {
          name?: string
          difficulty?: string | null
          category?: string | null
          tags?: string[]
          ingredients?: { name: string; amount?: string }[]
          steps?: string[]
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
      recipe_ratings: {
        Row: {
          id: string
          recipe_id: string
          created_by: string
          rating: number
          comment: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          created_by?: string
          rating: number
          comment?: string | null
          date?: string
        }
        Update: {
          rating?: number
          comment?: string | null
        }
      }
      cooking_challenges: {
        Row: {
          id: string
          recipe_id: string
          from_user: string
          to_user: string
          status: string
          note: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          recipe_id: string
          from_user: string
          to_user: string
          status?: string
          note?: string | null
        }
        Update: {
          status?: string
          note?: string | null
          completed_at?: string | null
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
