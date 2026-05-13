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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          access_type: string
          accessed_at: string
          id: string
          patient_id: string
          practitioner_id: string
          source: string
          visit_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          id?: string
          patient_id: string
          practitioner_id: string
          source?: string
          visit_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          id?: string
          patient_id?: string
          practitioner_id?: string
          source?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      action_items: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          status: string | null
          user_id: string
          visit_id: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          status?: string | null
          user_id: string
          visit_id?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          status?: string | null
          user_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      care_team_members: {
        Row: {
          created_at: string
          granted_at: string
          id: string
          invite_id: string | null
          patient_id: string
          practitioner_id: string
          revoked_at: string | null
          transcript_access: boolean
        }
        Insert: {
          created_at?: string
          granted_at?: string
          id?: string
          invite_id?: string | null
          patient_id: string
          practitioner_id: string
          revoked_at?: string | null
          transcript_access?: boolean
        }
        Update: {
          created_at?: string
          granted_at?: string
          id?: string
          invite_id?: string | null
          patient_id?: string
          practitioner_id?: string
          revoked_at?: string | null
          transcript_access?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "care_team_members_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_team_members_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_team_members_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "practitioner_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
          visit_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
          visit_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          ahpra_practice_id: string | null
          consent_form_text: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          postcode: string | null
          slug: string
          state: string | null
          suburb: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          ahpra_practice_id?: string | null
          consent_form_text?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          postcode?: string | null
          slug: string
          state?: string | null
          suburb?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          ahpra_practice_id?: string | null
          consent_form_text?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          postcode?: string | null
          slug?: string
          state?: string | null
          suburb?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string | null
          date_prescribed: string | null
          dosage: string | null
          frequency: string | null
          id: string
          is_pbs: boolean | null
          name: string
          plain_explanation: string | null
          prescribing_doctor: string | null
          status: string | null
          user_id: string
          visit_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_prescribed?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_pbs?: boolean | null
          name: string
          plain_explanation?: string | null
          prescribing_doctor?: string | null
          status?: string | null
          user_id: string
          visit_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_prescribed?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_pbs?: boolean | null
          name?: string
          plain_explanation?: string | null
          prescribing_doctor?: string | null
          status?: string | null
          user_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioner_invites: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_evergreen: boolean
          label: string | null
          max_uses: number | null
          practitioner_id: string
          revoked_at: string | null
          token: string
          use_count: number
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_evergreen?: boolean
          label?: string | null
          max_uses?: number | null
          practitioner_id: string
          revoked_at?: string | null
          token: string
          use_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_evergreen?: boolean
          label?: string | null
          max_uses?: number | null
          practitioner_id?: string
          revoked_at?: string | null
          token?: string
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_invites_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioners: {
        Row: {
          ahpra_number: string
          clinic_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          profession: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          ahpra_number: string
          clinic_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          profession: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          ahpra_number?: string
          clinic_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          profession?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioners_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_range: string | null
          created_at: string | null
          current_medications: string | null
          first_name: string | null
          has_regular_gp: boolean | null
          id: string
          onboarding_complete: boolean | null
          ongoing_conditions: string | null
          role: string
          state: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          age_range?: string | null
          created_at?: string | null
          current_medications?: string | null
          first_name?: string | null
          has_regular_gp?: boolean | null
          id: string
          onboarding_complete?: boolean | null
          ongoing_conditions?: string | null
          role?: string
          state?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          age_range?: string | null
          created_at?: string | null
          current_medications?: string | null
          first_name?: string | null
          has_regular_gp?: boolean | null
          id?: string
          onboarding_complete?: boolean | null
          ongoing_conditions?: string | null
          role?: string
          state?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      visits: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          clinic_id: string | null
          clinic_name: string | null
          created_at: string | null
          created_by_practitioner_id: string | null
          doctor_name: string | null
          gp_consent_given: boolean | null
          id: string
          recording_duration: number | null
          recording_url: string | null
          source: string | null
          status: string | null
          summary: Json | null
          transcript: string | null
          updated_at: string | null
          user_id: string
          visit_date: string | null
          visit_type: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          created_by_practitioner_id?: string | null
          doctor_name?: string | null
          gp_consent_given?: boolean | null
          id?: string
          recording_duration?: number | null
          recording_url?: string | null
          source?: string | null
          status?: string | null
          summary?: Json | null
          transcript?: string | null
          updated_at?: string | null
          user_id: string
          visit_date?: string | null
          visit_type?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          created_by_practitioner_id?: string | null
          doctor_name?: string | null
          gp_consent_given?: boolean | null
          id?: string
          recording_duration?: number | null
          recording_url?: string | null
          source?: string | null
          status?: string | null
          summary?: Json | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string
          visit_date?: string | null
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_created_by_practitioner_id_fkey"
            columns: ["created_by_practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_practitioner_id: { Args: never; Returns: string }
      get_waitlist_count: { Args: never; Returns: number }
      is_owner_of_visit: { Args: { _visit_id: string }; Returns: boolean }
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
