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
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: number
          post_id: string
          author_name: string
          content: string
          password: string
          is_approved: boolean
          parent_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          post_id: string
          author_name: string
          content: string
          password: string
          is_approved?: boolean
          parent_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          post_id?: string
          author_name?: string
          content?: string
          password?: string
          is_approved?: boolean
          parent_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          id: number
          name: string
          email: string
          subject: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          subject: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          subject?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: number
        }
        Insert: {
          post_id: string
          tag_id: number
        }
        Update: {
          post_id?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          id: string
          title: string
          category_id: number
          slug: string
          content: string
          excerpt: string | null
          thumbnail_url: string | null
          status: "draft" | "published" | "archived"
          is_featured: boolean
          view_count: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category_id: number
          slug: string
          content?: string
          excerpt?: string | null
          thumbnail_url?: string | null
          status?: "draft" | "published" | "archived"
          is_featured?: boolean
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category_id?: number
          slug?: string
          content?: string
          excerpt?: string | null
          thumbnail_url?: string | null
          status?: "draft" | "published" | "archived"
          is_featured?: boolean
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: number
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: {
        Args: {
          p_post_id: string
        }
        Returns: void
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      search_posts: {
        Args: {
          search_query: string
          result_limit?: number
        }
        Returns: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          thumbnail_url: string | null
          published_at: string | null
          view_count: number
          is_featured: boolean
          category_id: number
          rank: number
        }[]
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
