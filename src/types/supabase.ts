export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'organizer' | 'voter'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'organizer' | 'voter'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'organizer' | 'voter'
          created_at?: string
          updated_at?: string
        }
      }
      organizers: {
        Row: {
          id: string
          user_id: string
          organization_name: string
          phone: string | null
          status: 'pending' | 'approved' | 'blocked'
          total_earnings: number
          withdrawable_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_name: string
          phone?: string | null
          status?: 'pending' | 'approved' | 'blocked'
          total_earnings?: number
          withdrawable_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_name?: string
          phone?: string | null
          status?: 'pending' | 'approved' | 'blocked'
          total_earnings?: number
          withdrawable_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          title: string
          description: string | null
          banner_url: string | null
          vote_price: number
          start_date: string
          end_date: string
          is_active: boolean
          total_votes: number
          total_revenue: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          title: string
          description?: string | null
          banner_url?: string | null
          vote_price: number
          start_date: string
          end_date: string
          is_active?: boolean
          total_votes?: number
          total_revenue?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          title?: string
          description?: string | null
          banner_url?: string | null
          vote_price?: number
          start_date?: string
          end_date?: string
          is_active?: boolean
          total_votes?: number
          total_revenue?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contestants: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          photo_url: string | null
          vote_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          photo_url?: string | null
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          photo_url?: string | null
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          voter_email: string
          contestant_id: string
          payment_id: string
          vote_count: number
          created_at: string
        }
        Insert: {
          id?: string
          voter_email: string
          contestant_id: string
          payment_id: string
          vote_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          voter_email?: string
          contestant_id?: string
          payment_id?: string
          vote_count?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          event_id: string
          voter_email: string
          amount: number
          vote_count: number
          provider: 'stripe' | 'paystack'
          provider_reference: string | null
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          voter_email: string
          amount: number
          vote_count: number
          provider: 'stripe' | 'paystack'
          provider_reference?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          voter_email?: string
          amount?: number
          vote_count?: number
          provider?: 'stripe' | 'paystack'
          provider_reference?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      withdrawals: {
        Row: {
          id: string
          organizer_id: string
          amount: number
          status: string
          payment_method: string | null
          payment_details: Json | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          amount: number
          status?: string
          payment_method?: string | null
          payment_details?: Json | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          amount?: number
          status?: string
          payment_method?: string | null
          payment_details?: Json | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      platform_settings: {
        Row: {
          id: string
          commission_rate: number
          min_withdrawal_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          commission_rate?: number
          min_withdrawal_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          commission_rate?: number
          min_withdrawal_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'organizer' | 'voter'
      organizer_status: 'pending' | 'approved' | 'blocked'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
      payment_provider: 'stripe' | 'paystack'
    }
  }
}