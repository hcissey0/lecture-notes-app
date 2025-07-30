"use client"

import type React from "react"
import type { User } from "@supabase/supabase-js"
import { useData } from "@/contexts/data-context"
import { useNavigation } from "@/hooks/use-navigation"
import { NoteCard } from "@/components/note-card"
import { SearchFilters } from "@/components/search-filters"
import { UploadDialog } from "@/components/upload-dialog"
import { FileText, Loader2 } from "lucide-react"

interface HomePageProps {
  user: User
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const {
    notesLoading,
    searchTerm,
    selectedCourse,
    selectedLecturer,
    courses,
    lecturers,
    setSearchTerm,
    setSelectedCourse,
    setSelectedLecturer,
    getFilteredNotes,
    downloadNote,
    userSettings,
  } = useData()

  const { navigateToNote } = useNavigation()

  const filteredNotes = getFilteredNotes()

  const handleViewNote = (noteId: string) => {
    navigateToNote(noteId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        

        <UploadDialog user={user} isAnonymous={userSettings?.anonymous_uploads || false} />
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
      {notesLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onDownload={downloadNote} onView={handleViewNote} />
            ))}
          </div>

          {/* Empty State */}
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
