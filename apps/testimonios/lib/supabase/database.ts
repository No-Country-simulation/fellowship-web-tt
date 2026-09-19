export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TestimonialType = "simulation" | "first_job" | "career_change";
export type TestimonialStatus = "in_review" | "published" | "rejected";

export type Database = {
  public: {
    Tables: {
      testimonials: {
        Row: {
          id: string;
          type: TestimonialType;
          status: TestimonialStatus;
          slug: string;
          full_name: string;
          email: string;
          instagram: string | null;
          story: string;
          quote: string;
          ig_caption: string;
          avatar_path: string;
          capture_path: string | null;
          video_url: string | null;
          payload: Json;
          consent_at: string;
          submitted_at: string;
          published_at: string | null;
          discord_posted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: TestimonialType;
          status?: TestimonialStatus;
          slug: string;
          full_name: string;
          email: string;
          instagram?: string | null;
          story: string;
          quote: string;
          ig_caption: string;
          avatar_path: string;
          capture_path?: string | null;
          video_url?: string | null;
          payload?: Json;
          consent_at: string;
          submitted_at?: string;
          published_at?: string | null;
          discord_posted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: TestimonialType;
          status?: TestimonialStatus;
          slug?: string;
          full_name?: string;
          email?: string;
          instagram?: string | null;
          story?: string;
          quote?: string;
          ig_caption?: string;
          avatar_path?: string;
          capture_path?: string | null;
          video_url?: string | null;
          payload?: Json;
          consent_at?: string;
          submitted_at?: string;
          published_at?: string | null;
          discord_posted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contenido_generado: {
        Row: {
          id: string;
          testimonio_id: string;
          plataforma: "instagram" | "linkedin";
          status: string;
          draft_copy: string | null;
          draft_title: string | null;
          media_asset_path: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          testimonio_id: string;
          plataforma: "instagram" | "linkedin";
          status?: string;
          draft_copy?: string | null;
          draft_title?: string | null;
          media_asset_path?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          testimonio_id?: string;
          plataforma?: "instagram" | "linkedin";
          status?: string;
          draft_copy?: string | null;
          draft_title?: string | null;
          media_asset_path?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_jobs: {
        Row: {
          id: string;
          job_id: string;
          testimonio_id: string;
          plataforma: "instagram" | "linkedin";
          status: string;
          source_video_key: string | null;
          source_audio_key: string | null;
          media_asset_path: string | null;
          error_message: string | null;
          webhook_acked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          testimonio_id: string;
          plataforma: "instagram" | "linkedin";
          status?: string;
          source_video_key?: string | null;
          source_audio_key?: string | null;
          media_asset_path?: string | null;
          error_message?: string | null;
          webhook_acked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          testimonio_id?: string;
          plataforma?: "instagram" | "linkedin";
          status?: string;
          source_video_key?: string | null;
          source_audio_key?: string | null;
          media_asset_path?: string | null;
          error_message?: string | null;
          webhook_acked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      testimonials_public: {
        Row: {
          id: string;
          type: TestimonialType;
          slug: string;
          full_name: string;
          instagram: string | null;
          story: string;
          quote: string;
          avatar_path: string;
          capture_path: string | null;
          video_url: string | null;
          payload: Json;
          published_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      testimonial_type: TestimonialType;
      testimonial_status: TestimonialStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type TestimonialRow =
  Database["public"]["Tables"]["testimonials"]["Row"];
export type TestimonialInsert =
  Database["public"]["Tables"]["testimonials"]["Insert"];
export type TestimonialPublicRow =
  Database["public"]["Views"]["testimonials_public"]["Row"];
