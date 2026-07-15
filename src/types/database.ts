export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          mrp: number | null;
          stock: number;
          material: string | null;
          is_bestseller: boolean;
          is_new_arrival: boolean;
          badge_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          mrp?: number | null;
          stock?: number;
          material?: string | null;
          is_bestseller?: boolean;
          is_new_arrival?: boolean;
          badge_text?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          variant_name: string;
          price_override: number | null;
          stock: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_name: string;
          price_override?: number | null;
          stock?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      homepage_banners: {
        Row: {
          id: string;
          section: string;
          image_url: string;
          link_url: string | null;
          sort_order: number;
          is_active: boolean;
          eyebrow_text: string | null;
          heading_text: string | null;
          subheading_text: string | null;
        };
        Insert: {
          id?: string;
          section: string;
          image_url: string;
          link_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          eyebrow_text?: string | null;
          heading_text?: string | null;
          subheading_text?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["homepage_banners"]["Insert"]>;
        Relationships: [];
      };
      offers: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          link_url: string | null;
          is_featured: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          link_url?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["offers"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      homepage_top_styles: {
        Row: {
          id: string;
          product_id: string;
          tab: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          tab: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["homepage_top_styles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "homepage_top_styles_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          phone: string;
          address: string;
          pincode: string;
          cart_items: unknown;
          total: number;
          status: "pending" | "confirmed" | "fulfilled";
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          phone: string;
          address: string;
          pincode: string;
          cart_items: unknown;
          total: number;
          status?: "pending" | "confirmed" | "fulfilled";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
