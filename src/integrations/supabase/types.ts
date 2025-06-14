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
      deals_metadata: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          buyer_id: string
          buyer_marked: boolean | null
          created_at: string | null
          id: string
          product_id: string
          seller_id: string
          seller_marked: boolean | null
          status: string
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          buyer_marked?: boolean | null
          created_at?: string | null
          id?: string
          product_id: string
          seller_id: string
          seller_marked?: boolean | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          buyer_marked?: boolean | null
          created_at?: string | null
          id?: string
          product_id?: string
          seller_id?: string
          seller_marked?: boolean | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          market_price: number
          name: string
          seller_name: string
          seller_room_number: string
          selling_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          market_price: number
          name: string
          seller_name: string
          seller_room_number: string
          selling_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          market_price?: number
          name?: string
          seller_name?: string
          seller_room_number?: string
          selling_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_year: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          phone_number: string | null
          room_number: string | null
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          phone_number?: string | null
          room_number?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          phone_number?: string | null
          room_number?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: []
      }
      user_action_logs: {
        Row: {
          action_count: number | null
          action_type: string
          id: string
          last_action_at: string | null
          reset_at: string | null
          user_id: string
        }
        Insert: {
          action_count?: number | null
          action_type: string
          id?: string
          last_action_at?: string | null
          reset_at?: string | null
          user_id: string
        }
        Update: {
          action_count?: number | null
          action_type?: string
          id?: string
          last_action_at?: string | null
          reset_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          academic_year: string | null
          id: string | null
          name: string | null
          room_number: string | null
        }
        Insert: {
          academic_year?: string | null
          id?: string | null
          name?: string | null
          room_number?: string | null
        }
        Update: {
          academic_year?: string | null
          id?: string | null
          name?: string | null
          room_number?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_action_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_images: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_deal: {
        Args: { notification_id: string; user_id: string }
        Returns: Json
      }
      delete_product_with_cleanup: {
        Args: { product_uuid: string }
        Returns: boolean
      }
      delete_user_and_data: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      get_contact_info_for_deal: {
        Args: { notification_id: string }
        Returns: {
          seller_email: string
          seller_phone: string
          seller_upi: string
          buyer_email: string
          buyer_phone: string
        }[]
      }
      get_user_product_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      increment_deals_completed: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_suspicious_activity: {
        Args: { action_type: string; details?: Json }
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
