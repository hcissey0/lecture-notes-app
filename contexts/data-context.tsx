"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { db, type Note, type Profile, type UserSettings } from "@/lib/database"
import { toast } from "sonner"

// Context interface
interface DataContextType {
  // Data state
  notes: Note[]
  selectedNote: Note | null
  userSettings: UserSettings | null
  profile: Profile | null
  loading: boolean
  notesLoading: boolean
  settingsLoading: boolean

  clickedNote: Note | null
  setClickedNote: (note: Note) => void

  // Search and filters
  searchTerm: string
  selectedCourse: string
  selectedLecturer: string
  selectedTag: string
  courses: string[]
  lecturers: string[]
  tags: string[]

  // Data fetching functions
  fetchNotes: () => Promise<void>
  fetchNoteById: (id: string) => Promise<Note | null>
  fetchUserSettings: (userId: string) => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
  fetchUserNotes: (userId: string) => Promise<Note[]>

  // Data manipulation functions
  uploadNote: (noteData: Omit<Note, "id" | "created_at" | "download_count" | "view_count">) => Promise<boolean>
  updateNote: (noteId: string, updates: Partial<Note>) => Promise<boolean>
  deleteNote: (noteId: string) => Promise<boolean>
  updateUserSettings: (userId: string, settings: Partial<UserSettings>) => Promise<boolean>
  updateProfile: (userId: string, profileData: Partial<Profile>) => Promise<boolean>

  // Interaction functions
  downloadNote: (note: Note) => Promise<boolean>
  incrementViewCount: (noteId: string) => Promise<void>
  generatePreviewUrl: (filePath: string) => Promise<string | null>

  // Search and filter functions
  setSearchTerm: (term: string) => void
  setSelectedCourse: (course: string) => void
  setSelectedLecturer: (lecturer: string) => void
  setSelectedTag: (tag: string) => void
  resetFilters: () => void
  getFilteredNotes: () => Note[]

  // Utility functions
  setSelectedNote: (note: Note | null) => void
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Custom hook to use the DataContext
export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

// DataProvider component
interface DataProviderProps {
  children: React.ReactNode
  user: User | null
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, user }) => {
  // State
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)

  const [clickedNote, setClickedNote] = useState<Note | null>(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedLecturer, setSelectedLecturer] = useState("all")
  const [selectedTag, setSelectedTag] = useState('all');

  // Derived data
  const courses = React.useMemo(() => Array.from(new Set(notes.map((note) => note.course))), [notes])
  const lecturers = React.useMemo(() => Array.from(new Set(notes.map((note) => note.lecturer))), [notes])
  const tags = React.useMemo(() => {
    const allTags: string[] = [];
    notes.forEach((note) => allTags.push(...note.tags))
    return Array.from(new Set(allTags))
  }, [notes])

  const fetchUserNotes = async (userId: string): Promise<Note[]> => {
    try {
      const {data, error} = await db.notes.getByUserId(userId);
      if (error) throw error
      return data
    } catch(e) {
      throw e
    }
  }

  // Data fetching functions
  const fetchNotes = useCallback(async () => {
    setNotesLoading(true)
    try {
      const result = await db.notes.getRecent()
      if (result.error) {
        toast.error(result.error)
        return
      }
      setNotes(result.data)
    } catch (error: any) {
      toast.error("Failed to load notes")
      console.error("Error fetching notes:", error)
    } finally {
      setNotesLoading(false)
    }
  }, [])

  const fetchNoteById = useCallback(async (id: string): Promise<Note | null> => {
    try {
      const result = await db.notes.getById(id)
      if (result.error) {
        toast.error(result.error)
        return null
      }
      return result.data
    } catch (error: any) {
      toast.error("Failed to load note details")
      console.error("Error fetching note by ID:", error)
      return null
    }
  }, [])

  const fetchUserSettings = useCallback(async (userId: string) => {
    if (!userId) return

    setSettingsLoading(true)
    try {
      const result = await db.profiles.getSettings(userId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setUserSettings(result.data)
    } catch (error: any) {
      toast.error("Failed to load user settings")
      console.error("Error fetching user settings:", error)
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  const fetchProfile = useCallback(async (userId: string) => {
    if (!userId) return

    try {
      const result = await db.profiles.getById(userId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setProfile(result.data)
    } catch (error: any) {
      toast.error("Failed to load profile")
      console.error("Error fetching profile:", error)
    }
  }, [])

  // Data manipulation functions
  const uploadNote = useCallback(
    async (noteData: Omit<Note, "id" | "created_at" | "download_count" | "view_count">): Promise<boolean> => {
      try {
        const result = await db.notes.create(noteData)
        if (result.error) {
          toast.error(result.error)
          return false
        }

        toast.success("Note uploaded successfully!")
        await fetchNotes() // Refresh notes list
        return true
      } catch (error: any) {
        toast.error("Failed to upload note")
        console.error("Error uploading note:", error)
        return false
      }
    },
    [fetchNotes],
  )

  const updateNote = useCallback(
    async (noteId: string, updates: Partial<Note>): Promise<boolean> => {
      try {
        const result = await db.notes.update(noteId, updates)
        if (result.error) {
          toast.error(result.error)
          return false
        }

        // Update local state
        setNotes((prev) => prev.map((note) => (note.id === noteId ? { ...note, ...updates } : note)))

        // Update selected note if it's the one being updated
        if (selectedNote?.id === noteId) {
          setSelectedNote((prev) => (prev ? { ...prev, ...updates } : null))
        }

        return true
      } catch (error: any) {
        toast.error("Failed to update note")
        console.error("Error updating note:", error)
        return false
      }
    },
    [selectedNote],
  )

  const deleteNote = useCallback(
    async (noteId: string): Promise<boolean> => {
      try {
        // First, get the note to delete the file from storage
        const noteToDelete = notes.find((note) => note.id === noteId)
        if (noteToDelete) {
          const storageResult = await db.storage.deleteFile(noteToDelete.file_path)
          if (storageResult.error) {
            console.warn("Failed to delete file from storage:", storageResult.error)
          }
        }

        // Delete from database
        const result = await db.notes.delete(noteId)
        if (result.error) {
          toast.error(result.error)
          return false
        }

        // Update local state
        setNotes((prev) => prev.filter((note) => note.id !== noteId))

        // Clear selected note if it was deleted
        if (selectedNote?.id === noteId) {
          setSelectedNote(null)
        }

        toast.success("Note deleted successfully!")
        return true
      } catch (error: any) {
        toast.error("Failed to delete note")
        console.error("Error deleting note:", error)
        return false
      }
    },
    [notes, selectedNote],
  )

  const updateUserSettings = useCallback(async (userId: string, settings: Partial<UserSettings>): Promise<boolean> => {
    try {
      const result = await db.profiles.updateSettings(userId, settings)
      if (result.error) {
        toast.error(result.error)
        return false
      }

      // Update local state
      setUserSettings(result.data)
      toast.success("Settings updated successfully!")
      return true
    } catch (error: any) {
      toast.error("Failed to update settings")
      console.error("Error updating settings:", error)
      return false
    }
  }, [])

  const updateProfile = useCallback(async (userId: string, profileData: Partial<Profile>): Promise<boolean> => {
    try {
      const result = await db.profiles.update(userId, profileData)
      if (result.error) {
        toast.error(result.error)
        return false
      }

      // Update local state
      setProfile(result.data)
      toast.success("Profile updated successfully!")
      return true
    } catch (error: any) {
      toast.error("Failed to update profile")
      console.error("Error updating profile:", error)
      return false
    }
  }, [])

  // Interaction functions
  const downloadNote = useCallback(
    async (note: Note): Promise<boolean> => {
      try {
        // Increment download counter
        const updateResult = await db.notes.incrementDownloadCount(note.id)
        if (updateResult.error) {
          console.warn("Failed to increment download count:", updateResult.error)
        } else if (updateResult.data) {
          // Update local state
          setNotes((prev) => prev.map((n) => (n.id === note.id ? updateResult.data! : n)))
          if (selectedNote?.id === note.id) {
            setSelectedNote(updateResult.data)
          }
        }

        // Download file
        const downloadResult = await db.storage.downloadFile(note.file_path)
        if (downloadResult.error) {
          toast.error(downloadResult.error)
          return false
        }

        // Create download link
        const url = URL.createObjectURL(downloadResult.data!)
        const a = document.createElement("a")
        a.href = url
        a.download = `${note.title}.${note.file_type === "pdf" ? "pdf" : "jpg"}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success("File downloaded successfully!")
        return true
      } catch (error: any) {
        toast.error("Failed to download file")
        console.error("Error downloading file:", error)
        return false
      }
    },
    [selectedNote],
  )

  const incrementViewCount = useCallback(
    async (noteId: string): Promise<void> => {
      try {
        const result = await db.notes.incrementViewCount(noteId)
        if (result.error) {
          console.warn("Failed to increment view count:", result.error)
          return
        }

        if (result.data) {
          // Update local state
          setNotes((prev) => prev.map((note) => (note.id === noteId ? result.data! : note)))
          if (selectedNote?.id === noteId) {
            setSelectedNote(result.data)
          }
        }
      } catch (error: any) {
        console.error("Error incrementing view count:", error)
      }
    },
    [selectedNote],
  )

  const generatePreviewUrl = useCallback(async (filePath: string): Promise<string | null> => {
    try {
      const result = await db.storage.getSignedUrl(filePath, 3600)
      if (result.error) {
        toast.error(result.error)
        return null
      }
      return result.data
    } catch (error: any) {
      toast.error("Failed to generate preview")
      console.error("Error generating preview URL:", error)
      return null
    }
  }, [])

  // Filter functions
  const getFilteredNotes = useCallback((): Note[] => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.lecturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCourse = selectedCourse === "all" || note.course === selectedCourse
      const matchesLecturer = selectedLecturer === "all" || note.lecturer === selectedLecturer
      const hasTag = selectedTag === 'all' || note.tags.some((t) => t === selectedTag)

      return matchesSearch && matchesCourse && matchesLecturer && hasTag
    })
  }, [notes, searchTerm, selectedCourse, selectedLecturer, selectedTag])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedCourse("all")
    setSelectedLecturer("all")
    setSelectedTag('all')
  }, [])

  // Utility functions
  const refreshData = useCallback(async () => {
    if (user) {
      await Promise.all([fetchNotes(), fetchUserSettings(user.id), fetchProfile(user.id)])
    }
  }, [user, fetchNotes, fetchUserSettings, fetchProfile])

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      setLoading(true)
      refreshData().finally(() => setLoading(false))
    } else {
      // Clear data when user logs out
      setNotes([])
      setSelectedNote(null)
      setUserSettings(null)
      setProfile(null)
      setLoading(false)
    }
  }, [user, refreshData])

  // Context value
  const contextValue: DataContextType = {
    // Data state
    notes,
    selectedNote,
    userSettings,
    profile,
    loading,
    notesLoading,
    settingsLoading,

    clickedNote,
    setClickedNote,

    // Search and filters
    searchTerm,
    selectedCourse,
    selectedLecturer,
    selectedTag,
    courses,
    lecturers,
    tags,

    // Data fetching functions
    fetchNotes,
    fetchNoteById,
    fetchUserSettings,
    fetchProfile,
    fetchUserNotes,

    // Data manipulation functions
    uploadNote,
    updateNote,
    deleteNote,
    updateUserSettings,
    updateProfile,

    // Interaction functions
    downloadNote,
    incrementViewCount,
    generatePreviewUrl,

    // Search and filter functions
    setSearchTerm,
    setSelectedCourse,
    setSelectedLecturer,
    setSelectedTag,
    resetFilters,
    getFilteredNotes,

    // Utility functions
    setSelectedNote,
    refreshData,
  }

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
}
