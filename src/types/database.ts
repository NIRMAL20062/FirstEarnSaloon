/**
 * Hand-written to match supabase/migrations/0001_init.sql, in the same
 * shape `supabase gen types typescript` produces (Row/Insert/Update per
 * table, plus the empty Views/Functions/Relationships the generated type
 * always includes — @supabase/supabase-js's generic constraints require
 * them even when there aren't any). If you have the Supabase CLI linked to
 * your project, prefer regenerating this from the real schema instead of
 * editing it by hand:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 *
 * (then re-add this file's header comment, which the generator overwrites).
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      salons: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          cover_image_url: string | null;
          tagline: string | null;
          phone: string | null;
          whatsapp: string | null;
          address: string | null;
          opening_hours: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          cover_image_url?: string | null;
          tagline?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          opening_hours?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["salons"]["Insert"], "owner_id">>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          description: string | null;
          category: string;
          price: number;
          image_url: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          description?: string | null;
          category: string;
          price: number;
          image_url?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["services"]["Insert"], "salon_id">>;
        Relationships: [];
      };
      offers: {
        Row: {
          id: string;
          salon_id: string;
          title: string;
          description: string | null;
          price: number;
          old_price: number | null;
          image_url: string | null;
          active: boolean;
          valid_until: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          title: string;
          description?: string | null;
          price: number;
          old_price?: number | null;
          image_url?: string | null;
          active?: boolean;
          valid_until?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["offers"]["Insert"], "salon_id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
