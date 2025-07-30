"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useAppState } from "@/hooks/use-app-state"
import { NoteCard } from "@/components/note-card"
import { SearchFilters } from "@/components/search-filters"
import { UploadDialog } from "@/components/upload-dialog"
import { FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Note {
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

interface HomeViewProps {
  user: User
}

export function HomeView({ user }: HomeViewProps) {
  const {
    notes,
    setNotes,
    updateNote,
    setSelectedNote,
    searchTerm,
    selectedCourse,
    selectedLecturer,
    setSearchTerm,
    setSelectedCourse,
    setSelectedLecturer,
  } = useAppState()

  const [loading, setLoading] = useState(true)
  const [userSettings, setUserSettings] = useState({ anonymous_uploads: false })

  // Fetch notes from Supabase
  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error: any) {
      toast.error("Failed to load notes")
    } finally {
      setLoading(false)
    }
  }

  // Fetch user settings
  const fetchUserSettings = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("anonymous_uploads").eq("id", user.id).single()

      if (error) throw error
      setUserSettings({ anonymous_uploads: data.anonymous_uploads || false })
    } catch (error: any) {
      console.error("Failed to load user settings:", error)
    }
  }

  // Handle download with counter increment
  const handleDownload = async (note: Note) => {
    try {
      // Increment download counter
      const newDownloadCount = (note.download_count || 0) + 1

      const { error: updateError } = await supabase
        .from("notes")
        .update({ download_count: newDownloadCount })
        .eq("id", note.id)

      if (updateError) throw updateError

      // Download file
      const { data, error } = await supabase.storage.from("lecture-notes").download(note.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = `${note.title}.${note.file_type === "pdf" ? "pdf" : "jpg"}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("File downloaded successfully!")

      // Update local state
      updateNote(note.id, { download_count: newDownloadCount })
    } catch (error: any) {
      toast.error("Failed to download file")
    }
  }

  const handleViewNote = (noteId: string) => {
    setSelectedNote(noteId)
  }

  useEffect(() => {
    fetchNotes()
    fetchUserSettings()
  }, [])

  // Get unique courses and lecturers for filters
  const courses = Array.from(new Set(notes.map((note) => note.course)))
  const lecturers = Array.from(new Set(notes.map((note) => note.lecturer)))

  // Filter notes based on search and filters
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.lecturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCourse = selectedCourse === "all" || note.course === selectedCourse
    const matchesLecturer = selectedLecturer === "all" || note.lecturer === selectedLecturer

    return matchesSearch && matchesCourse && matchesLecturer
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lecture Notes</h1>
          <p className="text-muted-foreground mt-1">Share and discover course materials</p>
        </div>

        <UploadDialog user={user} onUploadSuccess={fetchNotes} isAnonymous={userSettings.anonymous_uploads} />
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        selectedLecturer={selectedLecturer}
        onLecturerChange={setSelectedLecturer}
        courses={courses}
        lecturers={lecturers}
      />

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onDownload={handleDownload} onView={handleViewNote} />
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCourse !== "all" || selectedLecturer !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to upload some lecture notes!"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
