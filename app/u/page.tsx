"use client"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DataProvider, useData } from "@/contexts/data-context"
import { FileText, Loader2 } from "lucide-react"
import { NoteCard } from "@/components/note-card"
import { SearchFilters } from "@/components/search-filters"
import { UploadDialog } from "@/components/upload-dialog"
import { useNavigation } from "@/hooks/use-navigation"
import { User } from "@supabase/supabase-js"



export default function Dashboard() {
    const { user } = useAuth();
    const {
        notesLoading,
        searchTerm,
        selectedCourse,
        selectedLecturer,
        selectedTag,
        courses,
        lecturers,
        tags,
        setSearchTerm,
        setSelectedCourse,
        setSelectedLecturer,
        setSelectedTag,
        getFilteredNotes,
        downloadNote,
        userSettings,

        clickedNote, setClickedNote
      } = useData()
    
      const { navigateToNote } = useNavigation()
    
      const filteredNotes = getFilteredNotes()
    

    
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-end items-center gap-4">
            <UploadDialog user={user as User} isAnonymous={userSettings?.anonymous_uploads || false} />
          </div>
    
          {/* Search and Filters */}
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            selectedLecturer={selectedLecturer}
            onLecturerChange={setSelectedLecturer}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            tags={tags}
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
                  <NoteCard key={note.id} note={note} />
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
