export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          created_at: string
          game: Database["public"]["Enums"]["game_type"]
          id: string
          progression_score: number
          summary: string | null
          tip_tags: Json
          tips: Json
          user_id: string
          weaknesses: Json
        }
        Insert: {
          created_at?: string
          game?: Database["public"]["Enums"]["game_type"]
          id?: string
          progression_score?: number
          summary?: string | null
          tip_tags?: Json
          tips?: Json
          user_id: string
          weaknesses?: Json
        }
        Update: {
          created_at?: string
          game?: Database["public"]["Enums"]["game_type"]
          id?: string
          progression_score?: number
          summary?: string | null
          tip_tags?: Json
          tips?: Json
          user_id?: string
          weaknesses?: Json
        }
        Relationships: []
      }
      coaching_tips: {
        Row: {
          created_at: string
          description: string
          difficulty: string
          fix: string
          game: Database["public"]["Enums"]["game_type"]
          id: string
          problem: string
          tag: string
          training: string
          video_title: string
          video_url: string
          why: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty: string
          fix: string
          game: Database["public"]["Enums"]["game_type"]
          id?: string
          problem: string
          tag: string
          training: string
          video_title: string
          video_url: string
          why: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: string
          fix?: string
          game?: Database["public"]["Enums"]["game_type"]
          id?: string
          problem?: string
          tag?: string
          training?: string
          video_title?: string
          video_url?: string
          why?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          agent: string | null
          assists: number | null
          created_at: string
          deaths: number | null
          game: Database["public"]["Enums"]["game_type"]
          id: string
          kills: number | null
          map: string | null
          match_id: string
          mode: string | null
          played_at: string | null
          raw: Json | null
          result: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          agent?: string | null
          assists?: number | null
          created_at?: string
          deaths?: number | null
          game?: Database["public"]["Enums"]["game_type"]
          id?: string
          kills?: number | null
          map?: string | null
          match_id: string
          mode?: string | null
          played_at?: string | null
          raw?: Json | null
          result?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          agent?: string | null
          assists?: number | null
          created_at?: string
          deaths?: number | null
          game?: Database["public"]["Enums"]["game_type"]
          id?: string
          kills?: number | null
          map?: string | null
          match_id?: string
          mode?: string | null
          played_at?: string | null
          raw?: Json | null
          result?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_premium: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          is_premium?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_premium?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      riot_accounts: {
        Row: {
          avg_kda: number | null
          created_at: string
          current_rank: string | null
          game: Database["public"]["Enums"]["game_type"]
          game_name: string
          id: string
          puuid: string | null
          region: string
          tag_line: string
          top_agent: string | null
          updated_at: string
          user_id: string
          winrate: number | null
        }
        Insert: {
          avg_kda?: number | null
          created_at?: string
          current_rank?: string | null
          game?: Database["public"]["Enums"]["game_type"]
          game_name: string
          id?: string
          puuid?: string | null
          region: string
          tag_line: string
          top_agent?: string | null
          updated_at?: string
          user_id: string
          winrate?: number | null
        }
        Update: {
          avg_kda?: number | null
          created_at?: string
          current_rank?: string | null
          game?: Database["public"]["Enums"]["game_type"]
          game_name?: string
          id?: string
          puuid?: string | null
          region?: string
          tag_line?: string
          top_agent?: string | null
          updated_at?: string
          user_id?: string
          winrate?: number | null
        }
        Relationships: []
      }
      user_coaching_progress: {
        Row: {
          clean_analyses_since_progress: number
          created_at: string
          detections_since_progress: number
          id: string
          last_detected_at: string | null
          status: string
          tip_tag: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clean_analyses_since_progress?: number
          created_at?: string
          detections_since_progress?: number
          id?: string
          last_detected_at?: string | null
          status?: string
          tip_tag: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clean_analyses_since_progress?: number
          created_at?: string
          detections_since_progress?: number
          id?: string
          last_detected_at?: string | null
          status?: string
          tip_tag?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coaching_progress_tip_tag_fkey"
            columns: ["tip_tag"]
            isOneToOne: false
            referencedRelation: "coaching_tips"
            referencedColumns: ["tag"]
          },
        ]
      }
      riot_oauth_states: {
        Row: {
          id: string
          user_id: string
          state: string
          game: Database["public"]["Enums"]["game_type"]
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          state: string
          game: Database["public"]["Enums"]["game_type"]
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string
          state?: string
          game?: Database["public"]["Enums"]["game_type"]
          created_at?: string
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "riot_oauth_states_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_type: "valorant" | "lol"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_type: ["valorant", "lol"],
    },
  },
} as const
