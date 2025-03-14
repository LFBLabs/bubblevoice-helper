export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_models: {
        Row: {
          complexity_threshold: number
          created_at: string
          id: string
          model_name: string
          model_type: string
          updated_at: string
        }
        Insert: {
          complexity_threshold: number
          created_at?: string
          id?: string
          model_name: string
          model_type: string
          updated_at?: string
        }
        Update: {
          complexity_threshold?: number
          created_at?: string
          id?: string
          model_name?: string
          model_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          aws_access_key: string | null
          aws_secret_key: string | null
          created_at: string
          gemini_key: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aws_access_key?: string | null
          aws_secret_key?: string | null
          created_at?: string
          gemini_key?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aws_access_key?: string | null
          aws_secret_key?: string | null
          created_at?: string
          gemini_key?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          content: string
          created_at: string
          id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          active: boolean | null
          content: string | null
          created_at: string
          id: string
          is_system_content: boolean | null
          title: string
          type: string
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          content?: string | null
          created_at?: string
          id?: string
          is_system_content?: boolean | null
          title: string
          type: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          content?: string | null
          created_at?: string
          id?: string
          is_system_content?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_id: string
          plan_type: string | null
          status: string
          subscription_id: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_id: string
          plan_type?: string | null
          status: string
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_id?: string
          plan_type?: string | null
          status?: string
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      response_cache: {
        Row: {
          audio_url: string
          created_at: string
          expires_at: string | null
          id: string
          last_accessed: string | null
          performance_metrics: Json | null
          question: string
          question_hash: string
          response: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          audio_url: string
          created_at?: string
          expires_at?: string | null
          id?: string
          last_accessed?: string | null
          performance_metrics?: Json | null
          question: string
          question_hash: string
          response: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          audio_url?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          last_accessed?: string | null
          performance_metrics?: Json | null
          question?: string
          question_hash?: string
          response?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      voice_interactions: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_daily_interaction_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
