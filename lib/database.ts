"use client"

import { supabase } from "@/lib/supabase"

// Types
export interface Note {
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
  download_count: number
  view_count: number
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  anonymous_uploads: boolean
  email_notifications: boolean
  created_at: string
}

export interface UserSettings {
  anonymous_uploads: boolean
  full_name: string | null
  email_notifications: boolean
}

// Database response types
type DatabaseResult<T> = {
  data: T | null
  error: string | null
}

type DatabaseListResult<T> = {
  data: T[]
  error: string | null
}

// Notes operations
export const notesDb = {
  // Fetch all notes
  async getAll(): Promise<DatabaseListResult<Note>> {
    try {
      const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        error: null,
      }
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch notes",
      }
    }
  },

  // Fetch note by ID
  async getById(id: string): Promise<DatabaseResult<Note>> {
    try {
      const { data, error } = await supabase.from("notes").select("*").eq("id", id).single()

      if (error) throw error

      return {
        data,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch note",
      }
    }
  },

  // Fetch notes by user ID
  async getByUserId(userId: string): Promise<DatabaseListResult<Note>> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("uploader_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        error: null,
      }
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch user notes",
      }
    }
  },

  // Search notes
  async search(query: string): Promise<DatabaseListResult<Note>> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .or(`title.ilike.%${query}%,course.ilike.%${query}%,lecturer.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        error: null,
      }
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to search notes",
      }
    }
  },

  // Create new note
  async create(
    noteData: Omit<Note, "id" | "created_at" | "download_count" | "view_count">,
  ): Promise<DatabaseResult<Note>> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          ...noteData,
          download_count: 0,
          view_count: 0,
        })
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to create note",
      }
    }
  },

  // Update note
  async update(id: string, updates: Partial<Note>): Promise<DatabaseResult<Note>> {
    try {
      const { data, error } = await supabase.from("notes").update(updates).eq("id", id).select().single()

      if (error) throw error

      return {
        data,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to update note",
      }
    }
  },

  // Delete note
  async delete(id: string): Promise<DatabaseResult<boolean>> {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id)

      if (error) throw error

      return {
        data: true,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to delete note",
      }
    }
  },

  // Increment view count
  async incrementViewCount(id: string): Promise<DatabaseResult<Note>> {
    try {
      const { data, error } = await supabase.rpc("increment_view_count", {
        note_id: id,
      })

      if (error) throw error

      // Fetch updated note
      const updatedNote = await this.getById(id)
      return updatedNote
    } catch (error: any) {
      // Fallback to manual increment if RPC fails
      try {
        const noteResult = await this.getById(id)
        if (noteResult.data) {
          const newViewCount = (noteResult.data.view_count || 0) + 1
          return await this.update(id, { view_count: newViewCount })
        }
        throw new Error("Note not found")
      } catch (fallbackError: any) {
        return {
          data: null,
          error: fallbackError.message || "Failed to increment view count",
        }
      }
    }
  },

  // Increment download count
  async incrementDownloadCount(id: string): Promise<DatabaseResult<Note>> {
    try {
      const { data, error } = await supabase.rpc("increment_download_count", {
        note_id: id,
      })

      if (error) throw error

      // Fetch updated note
      const updatedNote = await this.getById(id)
      return updatedNote
    } catch (error: any) {
      // Fallback to manual increment if RPC fails
      try {
        const noteResult = await this.getById(id)
        if (noteResult.data) {
          const newDownloadCount = (noteResult.data.download_count || 0) + 1
          return await this.update(id, { download_count: newDownloadCount })
        }
        throw new Error("Note not found")
      } catch (fallbackError: any) {
        return {
          data: null,
          error: fallbackError.message || "Failed to increment download count",
        }
      }
    }
  },

  // Get popular notes (most viewed/downloaded)
  async getPopular(limit = 10): Promise<DatabaseListResult<Note>> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("view_count", { ascending: false })
        .order("download_count", { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        data: data || [],
        error: null,
      }
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch popular notes",
      }
    }
  },

  // Get recent notes
  async getRecent(limit = 10): Promise<DatabaseListResult<Note>> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        data: data || [],
        error: null,
      }
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch recent notes",
      }
    }
  },

  // Get notes by course
  async getByCourse(course: string): Promise<DatabaseListResult<Note>> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("course", course)
        .order("created_at", { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        error: null,
      }
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch notes by course",
      }
    }
  },

  // Get notes by lecturer
  async getByLecturer(lecturer: string): Promise<DatabaseListResult<Note>> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("lecturer", lecturer)
        .order("created_at", { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        error: null,
      }
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch notes by lecturer",
      }
    }
  },

  // Get unique courses
  async getCourses(): Promise<DatabaseListResult<string>> {
    try {
      const { data, error } = await supabase.from("notes").select("course").order("course")

      if (error) throw error

      const uniqueCourses = Array.from(new Set(data?.map((item) => item.course) || []))

      return {
        data: uniqueCourses,
        error: null,
      }
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch courses",
      }
    }
  },

  // Get unique lecturers
  async getLecturers(): Promise<DatabaseListResult<string>> {
    try {
      const { data, error } = await supabase.from("notes").select("lecturer").order("lecturer")

      if (error) throw error

      const uniqueLecturers = Array.from(new Set(data?.map((item) => item.lecturer) || []))

      return {
        data: uniqueLecturers,
        error: null,
      }
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch lecturers",
      }
    }
  },
}

// Profiles operations
export const profilesDb = {
  // Get profile by ID
  async getById(id: string): Promise<DatabaseResult<Profile>> {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

      if (error) throw error

      return {
        data,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch profile",
      }
    }
  },

  // Create profile
  async create(profileData: Omit<Profile, "created_at">): Promise<DatabaseResult<Profile>> {
    try {
      const { data, error } = await supabase.from("profiles").insert(profileData).select().single()

      if (error) throw error

      return {
        data,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to create profile",
      }
    }
  },

  // Update profile
  async update(id: string, updates: Partial<Profile>): Promise<DatabaseResult<Profile>> {
    try {
      const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select().single()

      if (error) throw error

      return {
        data,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to update profile",
      }
    }
  },

  // Delete profile
  async delete(id: string): Promise<DatabaseResult<boolean>> {
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id)

      if (error) throw error

      return {
        data: true,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to delete profile",
      }
    }
  },

  // Get user settings
  async getSettings(id: string): Promise<DatabaseResult<UserSettings>> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("anonymous_uploads, full_name, email_notifications")
        .eq("id", id)
        .single()

      if (error) throw error

      return {
        data: {
          anonymous_uploads: data.anonymous_uploads || false,
          full_name: data.full_name,
          email_notifications: data.email_notifications || true,
        },
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch user settings",
      }
    }
  },

  // Update user settings
  async updateSettings(id: string, settings: Partial<UserSettings>): Promise<DatabaseResult<UserSettings>> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(settings)
        .eq("id", id)
        .select("anonymous_uploads, full_name, email_notifications")
        .single()

      if (error) throw error

      return {
        data: {
          anonymous_uploads: data.anonymous_uploads || false,
          full_name: data.full_name,
          email_notifications: data.email_notifications || true,
        },
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to update user settings",
      }
    }
  },
}

// Storage operations
export const storageDb = {
  // Upload file
  async uploadFile(filePath: string, file: File): Promise<DatabaseResult<string>> {
    try {
      const { data, error } = await supabase.storage.from("lecture-notes").upload(filePath, file)

      if (error) throw error

      return {
        data: data.path,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to upload file",
      }
    }
  },

  // Download file
  async downloadFile(filePath: string): Promise<DatabaseResult<Blob>> {
    try {
      const { data, error } = await supabase.storage.from("lecture-notes").download(filePath)

      if (error) throw error

      return {
        data,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to download file",
      }
    }
  },

  // Delete file
  async deleteFile(filePath: string): Promise<DatabaseResult<boolean>> {
    try {
      const { error } = await supabase.storage.from("lecture-notes").remove([filePath])

      if (error) throw error

      return {
        data: true,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to delete file",
      }
    }
  },

  // Generate signed URL for preview
  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<DatabaseResult<string>> {
    try {
      const { data, error } = await supabase.storage.from("lecture-notes").createSignedUrl(filePath, expiresIn)

      if (error) throw error

      return {
        data: data.signedUrl,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to generate signed URL",
      }
    }
  },

  // Get public URL
  async getPublicUrl(filePath: string): Promise<DatabaseResult<string>> {
    try {
      const { data } = supabase.storage.from("lecture-notes").getPublicUrl(filePath)

      return {
        data: data.publicUrl,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to get public URL",
      }
    }
  },
}

// Analytics operations
export const analyticsDb = {
  // Get note statistics
  async getNoteStats(noteId: string): Promise<DatabaseResult<{ views: number; downloads: number }>> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("view_count, download_count")
        .eq("id", noteId)
        .single()

      if (error) throw error

      return {
        data: {
          views: data.view_count || 0,
          downloads: data.download_count || 0,
        },
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch note statistics",
      }
    }
  },

  // Get user statistics
  async getUserStats(
    userId: string,
  ): Promise<DatabaseResult<{ totalNotes: number; totalViews: number; totalDownloads: number }>> {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("view_count, download_count")
        .eq("uploader_id", userId)

      if (error) throw error

      const stats = data.reduce(
        (acc, note) => ({
          totalNotes: acc.totalNotes + 1,
          totalViews: acc.totalViews + (note.view_count || 0),
          totalDownloads: acc.totalDownloads + (note.download_count || 0),
        }),
        { totalNotes: 0, totalViews: 0, totalDownloads: 0 },
      )

      return {
        data: stats,
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch user statistics",
      }
    }
  },

  // Get platform statistics
  async getPlatformStats(): Promise<
    DatabaseResult<{ totalNotes: number; totalUsers: number; totalViews: number; totalDownloads: number }>
  > {
    try {
      const [notesResult, profilesResult] = await Promise.all([
        supabase.from("notes").select("view_count, download_count"),
        supabase.from("profiles").select("id"),
      ])

      if (notesResult.error) throw notesResult.error
      if (profilesResult.error) throw profilesResult.error

      const noteStats = notesResult.data.reduce(
        (acc, note) => ({
          totalViews: acc.totalViews + (note.view_count || 0),
          totalDownloads: acc.totalDownloads + (note.download_count || 0),
        }),
        { totalViews: 0, totalDownloads: 0 },
      )

      return {
        data: {
          totalNotes: notesResult.data.length,
          totalUsers: profilesResult.data.length,
          totalViews: noteStats.totalViews,
          totalDownloads: noteStats.totalDownloads,
        },
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch platform statistics",
      }
    }
  },
}

// Utility functions
export const dbUtils = {
  // Check if user exists
  async userExists(userId: string): Promise<boolean> {
    const result = await profilesDb.getById(userId)
    return result.data !== null
  },

  // Check if note exists
  async noteExists(noteId: string): Promise<boolean> {
    const result = await notesDb.getById(noteId)
    return result.data !== null
  },

  // Validate file type
  isValidFileType(file: File): boolean {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    return allowedTypes.includes(file.type)
  },

  // Validate file size (max 10MB)
  isValidFileSize(file: File): boolean {
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    return file.size <= maxSize
  },

  // Generate unique file path
  generateFilePath(userId: string, fileName: string): string {
    const timestamp = Date.now()
    const extension = fileName.split(".").pop()
    return `${userId}/${timestamp}.${extension}`
  },

  // Sanitize search query
  sanitizeSearchQuery(query: string): string {
    return query.trim().replace(/[%_]/g, "\\$&")
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  },
}

// Export all database operations
export const db = {
  notes: notesDb,
  profiles: profilesDb,
  storage: storageDb,
  analytics: analyticsDb,
  utils: dbUtils,
}

// Default export
export default db
