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
      club_memberships: {
        Row: {
          club_id: string
          created_at: string | null
          id: string
          membership_number: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          club_id: string
          created_at?: string | null
          id?: string
          membership_number?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string | null
          id?: string
          membership_number?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_referral_codes: {
        Row: {
          club_id: string
          code: string
          created_at: string | null
          current_uses: number | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          club_id: string
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          club_id?: string
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_referral_codes_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          contact_email: string | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      disputes: {
        Row: {
          buyer_evidence: Json | null
          buyer_id: string
          created_at: string | null
          description: string | null
          id: string
          initiated_by: string
          order_id: string
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          seller_evidence: Json | null
          seller_id: string
          status: Database["public"]["Enums"]["dispute_status"] | null
          updated_at: string | null
        }
        Insert: {
          buyer_evidence?: Json | null
          buyer_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          initiated_by: string
          order_id: string
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          seller_evidence?: Json | null
          seller_id: string
          status?: Database["public"]["Enums"]["dispute_status"] | null
          updated_at?: string | null
        }
        Update: {
          buyer_evidence?: Json | null
          buyer_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          initiated_by?: string
          order_id?: string
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          seller_evidence?: Json | null
          seller_id?: string
          status?: Database["public"]["Enums"]["dispute_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_labels: {
        Row: {
          code: string
          description: string | null
          label: string
        }
        Insert: {
          code: string
          description?: string | null
          label: string
        }
        Update: {
          code?: string
          description?: string | null
          label?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          buyer_email: string | null
          buyer_id: string | null
          buyer_name: string | null
          buyer_phone: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          product_id: string
          read_at: string | null
          replied_at: string | null
          seller_id: string
          status: Database["public"]["Enums"]["enquiry_status"] | null
        }
        Insert: {
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          product_id: string
          read_at?: string | null
          replied_at?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["enquiry_status"] | null
        }
        Update: {
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          product_id?: string
          read_at?: string | null
          replied_at?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["enquiry_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_labels: {
        Row: {
          code: string
          label: string
        }
        Insert: {
          code: string
          label: string
        }
        Update: {
          code?: string
          label?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          order_id: string | null
          product_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          order_id?: string | null
          product_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          order_id?: string | null
          product_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          product_image_url: string | null
          product_title: string
          quantity: number
          total_price: number
          unit_price: number
          vat_rate: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          product_image_url?: string | null
          product_title: string
          quantity?: number
          total_price: number
          unit_price: number
          vat_rate?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          product_image_url?: string | null
          product_title?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          buyer_confirmed_at: string | null
          buyer_email: string
          buyer_id: string | null
          buyer_name: string | null
          buyer_phone: string | null
          created_at: string | null
          currency: string | null
          delivered_at: string | null
          escrow_released_at: string | null
          id: string
          notes: string | null
          order_number: string
          payment_intent_id: string | null
          payment_status: string | null
          seller_id: string
          shipped_at: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total_amount: number
          updated_at: string | null
          vat_amount: number | null
        }
        Insert: {
          billing_address?: Json | null
          buyer_confirmed_at?: string | null
          buyer_email: string
          buyer_id?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          escrow_released_at?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_intent_id?: string | null
          payment_status?: string | null
          seller_id: string
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total_amount: number
          updated_at?: string | null
          vat_amount?: number | null
        }
        Update: {
          billing_address?: Json | null
          buyer_confirmed_at?: string | null
          buyer_email?: string
          buyer_id?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          escrow_released_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          seller_id?: string
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
          vat_amount?: number | null
        }
        Relationships: []
      }
      product_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          asker_id: string
          created_at: string | null
          id: string
          is_published: boolean | null
          product_id: string
          question: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          asker_id: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          product_id: string
          question: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          asker_id?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          product_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_questions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_questions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability_status: string | null
          brand: string | null
          condition: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          domain_category: string | null
          entity_type: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_deleted: boolean | null
          is_published: boolean | null
          lead_time_text: string | null
          price: number
          price_type: string | null
          published_at: string | null
          search_vector: unknown
          seller_id: string
          shipping_cost_rule: string | null
          ships_from: string | null
          title: string
          updated_at: string | null
          vat_treatment: string | null
          status: string | null
          admin_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          submitted_at: string | null
        }
        Insert: {
          availability_status?: string | null
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          domain_category?: string | null
          entity_type?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_deleted?: boolean | null
          is_published?: boolean | null
          lead_time_text?: string | null
          price: number
          price_type?: string | null
          published_at?: string | null
          search_vector?: unknown
          seller_id: string
          shipping_cost_rule?: string | null
          ships_from?: string | null
          title: string
          updated_at?: string | null
          vat_treatment?: string | null
          status?: string | null
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          submitted_at?: string | null
        }
        Update: {
          availability_status?: string | null
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          domain_category?: string | null
          entity_type?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_deleted?: boolean | null
          is_published?: boolean | null
          lead_time_text?: string | null
          price?: number
          price_type?: string | null
          published_at?: string | null
          search_vector?: unknown
          seller_id?: string
          shipping_cost_rule?: string | null
          ships_from?: string | null
          title?: string
          updated_at?: string | null
          vat_treatment?: string | null
          status?: string | null
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_address: string | null
          business_registration_number: string | null
          business_type: string | null
          citizenship: string | null
          club_member: boolean | null
          company_name: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          is_buyer: boolean | null
          is_seller: boolean | null
          last_name: string | null
          legal_name: string | null
          logo_url: string | null
          main_category: string | null
          newsletter_subscribed: boolean | null
          passport_country: string | null
          passport_expiry: string | null
          passport_number: string | null
          passport_photo_url: string | null
          phone: string | null
          place_of_birth: string | null
          preferred_categories: string[] | null
          short_description: string | null
          seller_status: string | null
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_onboarding_complete: boolean | null
          stripe_payouts_enabled: boolean | null
          stripe_ready: boolean | null
          trading_name: string | null
          updated_at: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          business_address?: string | null
          business_registration_number?: string | null
          business_type?: string | null
          citizenship?: string | null
          club_member?: boolean | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          is_buyer?: boolean | null
          is_seller?: boolean | null
          last_name?: string | null
          legal_name?: string | null
          logo_url?: string | null
          main_category?: string | null
          newsletter_subscribed?: boolean | null
          passport_country?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          passport_photo_url?: string | null
          phone?: string | null
          place_of_birth?: string | null
          preferred_categories?: string[] | null
          short_description?: string | null
          seller_status?: string | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          stripe_ready?: boolean | null
          trading_name?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          business_address?: string | null
          business_registration_number?: string | null
          business_type?: string | null
          citizenship?: string | null
          club_member?: boolean | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          is_buyer?: boolean | null
          is_seller?: boolean | null
          last_name?: string | null
          legal_name?: string | null
          logo_url?: string | null
          main_category?: string | null
          newsletter_subscribed?: boolean | null
          passport_country?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          passport_photo_url?: string | null
          phone?: string | null
          place_of_birth?: string | null
          preferred_categories?: string[] | null
          short_description?: string | null
          seller_status?: string | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          stripe_ready?: boolean | null
          trading_name?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      returns: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          buyer_id: string
          created_at: string | null
          description: string | null
          id: string
          order_id: string
          reason: string
          received_at: string | null
          refund_amount: number | null
          refunded_at: string | null
          requested_at: string | null
          seller_id: string
          shipped_at: string | null
          status: Database["public"]["Enums"]["return_status"] | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          buyer_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_id: string
          reason: string
          received_at?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          requested_at?: string | null
          seller_id: string
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["return_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          buyer_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string
          reason?: string
          received_at?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          requested_at?: string | null
          seller_id?: string
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["return_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          buyer_id: string
          content: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          seller_id: string
          seller_responded_at: string | null
          seller_response: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          seller_id: string
          seller_responded_at?: string | null
          seller_response?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          seller_id?: string
          seller_responded_at?: string | null
          seller_response?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      showrooms: {
        Row: {
          about_text: string | null
          banner_url: string | null
          brand_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          seller_id: string
          slug: string | null
          tagline: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          about_text?: string | null
          banner_url?: string | null
          brand_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          seller_id: string
          slug?: string | null
          tagline?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          about_text?: string | null
          banner_url?: string | null
          brand_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          seller_id?: string
          slug?: string | null
          tagline?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vessels: {
        Row: {
          beam_meters: number | null
          created_at: string | null
          draft_meters: number | null
          engine_make: string | null
          engine_model: string | null
          engine_type: string | null
          home_port: string | null
          hull_material: string | null
          id: string
          is_primary: boolean | null
          length_meters: number | null
          make: string | null
          model: string | null
          name: string | null
          owner_id: string
          registration_number: string | null
          updated_at: string | null
          vessel_type: string | null
          year: number | null
        }
        Insert: {
          beam_meters?: number | null
          created_at?: string | null
          draft_meters?: number | null
          engine_make?: string | null
          engine_model?: string | null
          engine_type?: string | null
          home_port?: string | null
          hull_material?: string | null
          id?: string
          is_primary?: boolean | null
          length_meters?: number | null
          make?: string | null
          model?: string | null
          name?: string | null
          owner_id: string
          registration_number?: string | null
          updated_at?: string | null
          vessel_type?: string | null
          year?: number | null
        }
        Update: {
          beam_meters?: number | null
          created_at?: string | null
          draft_meters?: number | null
          engine_make?: string | null
          engine_model?: string | null
          engine_type?: string | null
          home_port?: string | null
          hull_material?: string | null
          id?: string
          is_primary?: boolean | null
          length_meters?: number | null
          make?: string | null
          model?: string | null
          name?: string | null
          owner_id?: string
          registration_number?: string | null
          updated_at?: string | null
          vessel_type?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      catalogue: {
        Row: {
          availability_status: string | null
          brand: string | null
          condition: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          domain_category: string | null
          entity_type: string | null
          id: string | null
          image_url: string | null
          images: string[] | null
          lead_time_text: string | null
          price: number | null
          price_type: string | null
          seller_company: string | null
          seller_country: string | null
          seller_trading_name: string | null
          shipping_cost_rule: string | null
          ships_from: string | null
          title: string | null
          vat_treatment: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_products: {
        Args: { result_limit?: number; search_query: string }
        Returns: {
          currency: string
          description: string
          domain_category: string
          entity_type: string
          id: string
          image_url: string
          price: number
          rank: number
          title: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      dispute_status:
        | "open"
        | "under_review"
        | "resolved_buyer"
        | "resolved_seller"
        | "closed"
      domain_category_enum:
        | "D01"
        | "D02"
        | "D13"
        | "D15M"
        | "D16"
        | "FISH"
        | "ECO"
      enquiry_status: "pending" | "read" | "replied" | "closed"
      entity_type_enum: "PROD" | "SVC" | "ASSET" | "DATA" | "ORG" | "DOC"
      message_type: "product_enquiry" | "order_question" | "general"
      order_status:
        | "pending_payment"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "completed"
        | "cancelled"
        | "refunded"
        | "disputed"
      return_status:
        | "requested"
        | "approved"
        | "rejected"
        | "shipped_back"
        | "received"
        | "refunded"
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
      app_role: ["admin", "moderator", "user"],
      dispute_status: [
        "open",
        "under_review",
        "resolved_buyer",
        "resolved_seller",
        "closed",
      ],
      domain_category_enum: ["D01", "D02", "D13", "D15M", "D16", "FISH", "ECO"],
      enquiry_status: ["pending", "read", "replied", "closed"],
      entity_type_enum: ["PROD", "SVC", "ASSET", "DATA", "ORG", "DOC"],
      message_type: ["product_enquiry", "order_question", "general"],
      order_status: [
        "pending_payment",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
        "refunded",
        "disputed",
      ],
      return_status: [
        "requested",
        "approved",
        "rejected",
        "shipped_back",
        "received",
        "refunded",
      ],
    },
  },
} as const
