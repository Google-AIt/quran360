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
      bag_steps: {
        Row: {
          bag_id: string
          created_at: string
          description: string | null
          id: string
          step_number: number
          title: string
        }
        Insert: {
          bag_id: string
          created_at?: string
          description?: string | null
          id?: string
          step_number: number
          title: string
        }
        Update: {
          bag_id?: string
          created_at?: string
          description?: string | null
          id?: string
          step_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bag_steps_bag_id_fkey"
            columns: ["bag_id"]
            isOneToOne: false
            referencedRelation: "quran_bags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          keywords: string[] | null
          published_at: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
        }
        Insert: {
          author?: string | null
          category?: string
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          keywords?: string[] | null
          published_at?: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
        }
        Update: {
          author?: string | null
          category?: string
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          keywords?: string[] | null
          published_at?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          id: string
          issued_at: string
          kind: string
          program_title: string
          recipient_name: string
          user_id: string
        }
        Insert: {
          certificate_number: string
          id?: string
          issued_at?: string
          kind?: string
          program_title: string
          recipient_name: string
          user_id: string
        }
        Update: {
          certificate_number?: string
          id?: string
          issued_at?: string
          kind?: string
          program_title?: string
          recipient_name?: string
          user_id?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          activity: string | null
          challenge: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          lesson_number: number
          title: string
          video_url: string | null
        }
        Insert: {
          activity?: string | null
          challenge?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lesson_number: number
          title: string
          video_url?: string | null
        }
        Update: {
          activity?: string | null
          challenge?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lesson_number?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          bag_id: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          objectives: Json
          price: number
          slug: string
          sort_order: number
          title: string
          updated_at: string
          verse: string | null
        }
        Insert: {
          bag_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          objectives?: Json
          price?: number
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          verse?: string | null
        }
        Update: {
          bag_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          objectives?: Json
          price?: number
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          verse?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_bag_id_fkey"
            columns: ["bag_id"]
            isOneToOne: false
            referencedRelation: "quran_bags"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          progress: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          progress?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      facilitator_applications: {
        Row: {
          city: string | null
          created_at: string
          experience: string | null
          full_name: string
          id: string
          motivation: string | null
          phone: string | null
          stage: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          experience?: string | null
          full_name: string
          id?: string
          motivation?: string | null
          phone?: string | null
          stage?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          experience?: string | null
          full_name?: string
          id?: string
          motivation?: string | null
          phone?: string | null
          stage?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      impact_stories: {
        Row: {
          bag_title: string | null
          change_percent: number | null
          created_at: string
          id: string
          is_published: boolean
          person_name: string | null
          person_role: string | null
          slug: string
          story: string
          title: string
        }
        Insert: {
          bag_title?: string | null
          change_percent?: number | null
          created_at?: string
          id?: string
          is_published?: boolean
          person_name?: string | null
          person_role?: string | null
          slug: string
          story: string
          title: string
        }
        Update: {
          bag_title?: string | null
          change_percent?: number | null
          created_at?: string
          id?: string
          is_published?: boolean
          person_name?: string | null
          person_role?: string | null
          slug?: string
          story?: string
          title?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          id: string
          items: Json
          status: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          items?: Json
          status?: string
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          items?: Json
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string | null
          provider: string
          reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          provider?: string
          reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          provider?: string
          reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          billing_period: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          price: number
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          billing_period?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price?: number
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          billing_period?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price?: number
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      q360_assessments: {
        Row: {
          average_score: number | null
          bag_id: string | null
          created_at: string
          id: string
          phase: string
          status: string
          user_id: string
        }
        Insert: {
          average_score?: number | null
          bag_id?: string | null
          created_at?: string
          id?: string
          phase?: string
          status?: string
          user_id: string
        }
        Update: {
          average_score?: number | null
          bag_id?: string | null
          created_at?: string
          id?: string
          phase?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "q360_assessments_bag_id_fkey"
            columns: ["bag_id"]
            isOneToOne: false
            referencedRelation: "quran_bags"
            referencedColumns: ["id"]
          },
        ]
      }
      q360_questions: {
        Row: {
          bag_id: string | null
          created_at: string
          id: string
          question_number: number
          text: string
        }
        Insert: {
          bag_id?: string | null
          created_at?: string
          id?: string
          question_number?: number
          text: string
        }
        Update: {
          bag_id?: string | null
          created_at?: string
          id?: string
          question_number?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "q360_questions_bag_id_fkey"
            columns: ["bag_id"]
            isOneToOne: false
            referencedRelation: "quran_bags"
            referencedColumns: ["id"]
          },
        ]
      }
      q360_responses: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          question_id: string
          rater_type: string
          score: number
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          question_id: string
          rater_type?: string
          score: number
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          question_id?: string
          rater_type?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "q360_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "q360_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "q360_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "q360_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quran_bags: {
        Row: {
          activities: Json
          applications: Json
          assessment: Json
          challenges: Json
          concept: string | null
          cover_url: string | null
          created_at: string
          evidences: Json
          id: string
          is_published: boolean
          mental_image: string | null
          outcome: string | null
          principle: string | null
          slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
          verse: string | null
          verse_reference: string | null
        }
        Insert: {
          activities?: Json
          applications?: Json
          assessment?: Json
          challenges?: Json
          concept?: string | null
          cover_url?: string | null
          created_at?: string
          evidences?: Json
          id?: string
          is_published?: boolean
          mental_image?: string | null
          outcome?: string | null
          principle?: string | null
          slug: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
          verse?: string | null
          verse_reference?: string | null
        }
        Update: {
          activities?: Json
          applications?: Json
          assessment?: Json
          challenges?: Json
          concept?: string | null
          cover_url?: string | null
          created_at?: string
          evidences?: Json
          id?: string
          is_published?: boolean
          mental_image?: string | null
          outcome?: string | null
          principle?: string | null
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
          verse?: string | null
          verse_reference?: string | null
        }
        Relationships: []
      }
      school_members: {
        Row: {
          created_at: string
          full_name: string
          grade: string | null
          id: string
          member_type: string
          school_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          full_name: string
          grade?: string | null
          id?: string
          member_type?: string
          school_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          grade?: string | null
          id?: string
          member_type?: string
          school_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          active_bags: Json
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          owner_id: string | null
          status: string
          students_count: number
          teachers_count: number
          updated_at: string
        }
        Insert: {
          active_bags?: Json
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          status?: string
          students_count?: number
          teachers_count?: number
          updated_at?: string
        }
        Update: {
          active_bags?: Json
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          status?: string
          students_count?: number
          teachers_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          label: string | null
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          label?: string | null
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          label?: string | null
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          price: number
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan: string
          price?: number
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          price?: number
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "facilitator" | "school" | "trainee"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "facilitator", "school", "trainee"],
    },
  },
} as const
