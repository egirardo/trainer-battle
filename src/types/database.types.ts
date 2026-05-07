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
      battle_state: {
        Row: {
          id: number
          player1_hp: number | null
          player1_status: string | null
          player2_hp: number | null
          player2_status: string | null
          session_id: number | null
          turn_number: number | null
        }
        Insert: {
          id?: number
          player1_hp?: number | null
          player1_status?: string | null
          player2_hp?: number | null
          player2_status?: string | null
          session_id?: number | null
          turn_number?: number | null
        }
        Update: {
          id?: number
          player1_hp?: number | null
          player1_status?: string | null
          player2_hp?: number | null
          player2_status?: string | null
          session_id?: number | null
          turn_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_turns: {
        Row: {
          created_at: string
          damage_dealt: number | null
          id: string
          move_id: number | null
          player_id: string
          session_id: number | null
          turn_number: number | null
        }
        Insert: {
          created_at?: string
          damage_dealt?: number | null
          id?: string
          move_id?: number | null
          player_id: string
          session_id?: number | null
          turn_number?: number | null
        }
        Update: {
          created_at?: string
          damage_dealt?: number | null
          id?: string
          move_id?: number | null
          player_id?: string
          session_id?: number | null
          turn_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_turns_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      creature_moves: {
        Row: {
          creature_id: number
          move_id: number
        }
        Insert: {
          creature_id: number
          move_id: number
        }
        Update: {
          creature_id?: number
          move_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "creature_moves_creature_id_fkey"
            columns: ["creature_id"]
            isOneToOne: false
            referencedRelation: "creatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creature_moves_move_id_fkey"
            columns: ["move_id"]
            isOneToOne: false
            referencedRelation: "moves"
            referencedColumns: ["id"]
          },
        ]
      }
      creatures: {
        Row: {
          base_attack: number | null
          base_defence: number | null
          base_hp: number | null
          base_speed: number | null
          description: string | null
          id: number
          name: string | null
          type: string | null
        }
        Insert: {
          base_attack?: number | null
          base_defence?: number | null
          base_hp?: number | null
          base_speed?: number | null
          description?: string | null
          id?: number
          name?: string | null
          type?: string | null
        }
        Update: {
          base_attack?: number | null
          base_defence?: number | null
          base_hp?: number | null
          base_speed?: number | null
          description?: string | null
          id?: number
          name?: string | null
          type?: string | null
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          created_at: string | null
          current_turn: string | null
          id: number
          is_cpu: boolean | null
          player1_id: string
          player2_id: string | null
          status: string | null
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_turn?: string | null
          id?: number
          is_cpu?: boolean | null
          player1_id: string
          player2_id?: string | null
          status?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_turn?: string | null
          id?: number
          is_cpu?: boolean | null
          player1_id?: string
          player2_id?: string | null
          status?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          description: string | null
          effect: string | null
          id: number
          name: string | null
          price: number | null
        }
        Insert: {
          description?: string | null
          effect?: string | null
          id?: number
          name?: string | null
          price?: number | null
        }
        Update: {
          description?: string | null
          effect?: string | null
          id?: number
          name?: string | null
          price?: number | null
        }
        Relationships: []
      }
      moves: {
        Row: {
          accuracy: number | null
          description: string | null
          effect: string | null
          id: number
          name: string | null
          power: number | null
          type: string | null
        }
        Insert: {
          accuracy?: number | null
          description?: string | null
          effect?: string | null
          id?: number
          name?: string | null
          power?: number | null
          type?: string | null
        }
        Update: {
          accuracy?: number | null
          description?: string | null
          effect?: string | null
          id?: number
          name?: string | null
          power?: number | null
          type?: string | null
        }
        Relationships: []
      }
      player_creatures: {
        Row: {
          attack: number | null
          creature_id: number
          current_hp: number | null
          defence: number | null
          experience: number | null
          id: number
          level: number | null
          nickname: string | null
          player_id: string
          speed: number | null
        }
        Insert: {
          attack?: number | null
          creature_id: number
          current_hp?: number | null
          defence?: number | null
          experience?: number | null
          id?: number
          level?: number | null
          nickname?: string | null
          player_id: string
          speed?: number | null
        }
        Update: {
          attack?: number | null
          creature_id?: number
          current_hp?: number | null
          defence?: number | null
          experience?: number | null
          id?: number
          level?: number | null
          nickname?: string | null
          player_id?: string
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_creatures_creature_id_fkey"
            columns: ["creature_id"]
            isOneToOne: false
            referencedRelation: "creatures"
            referencedColumns: ["id"]
          },
        ]
      }
      player_items: {
        Row: {
          id: number
          item_id: number
          player_id: string
          quantity: number | null
        }
        Insert: {
          id?: number
          item_id: number
          player_id: string
          quantity?: number | null
        }
        Update: {
          id?: number
          item_id?: number
          player_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin: boolean | null
          centralbank_uuid: string | null
          created_at: string
          id: string
          username: string | null
        }
        Insert: {
          admin?: boolean | null
          centralbank_uuid?: string | null
          created_at?: string
          id: string
          username?: string | null
        }
        Update: {
          admin?: boolean | null
          centralbank_uuid?: string | null
          created_at?: string
          id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
