import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          title: string
          course: string
          lecturer: string
          description: string | null
          file_path: string
          file_type: string
          tags: string[]
          uploader_id: string
          uploader_name: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          course: string
          lecturer: string
          description?: string | null
          file_path: string
          file_type: string
          tags?: string[]
          uploader_id: string
          uploader_name: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          course?: string
          lecturer?: string
          description?: string | null
          file_path?: string
          file_type?: string
          tags?: string[]
          uploader_id?: string
          uploader_name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
        }
      }
    }
  }
}
