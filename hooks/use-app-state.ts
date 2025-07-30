"use client"

import { create } from "zustand"

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

interface AppState {
  // Current view
  currentView: "home" | "note-detail" | "settings"
  selectedNoteId: string | null

  // Data
  notes: Note[]
  selectedNote: Note | null

  // UI state
  searchTerm: string
  selectedCourse: string
  selectedLecturer: string

  // Actions
  setCurrentView: (view: "home" | "note-detail" | "settings") => void
  setSelectedNote: (noteId: string | null) => void
  setNotes: (notes: Note[]) => void
  updateNote: (noteId: string, updates: Partial<Note>) => void
  setSearchTerm: (term: string) => void
  setSelectedCourse: (course: string) => void
  setSelectedLecturer: (lecturer: string) => void
  resetFilters: () => void
}

export const useAppState = create<AppState>((set, get) => ({
  // Initial state
  currentView: "home",
  selectedNoteId: null,
  notes: [],
  selectedNote: null,
  searchTerm: "",
  selectedCourse: "all",
  selectedLecturer: "all",

  // Actions
  setCurrentView: (view) => set({ currentView: view }),

  setSelectedNote: (noteId) => {
    const notes = get().notes
    const note = noteId ? notes.find((n) => n.id === noteId) || null : null
    set({
      selectedNoteId: noteId,
      selectedNote: note,
      currentView: noteId ? "note-detail" : "home",
    })
  },

  setNotes: (notes) => set({ notes }),

  updateNote: (noteId, updates) => {
    const notes = get().notes
    const updatedNotes = notes.map((note) => (note.id === noteId ? { ...note, ...updates } : note))
    set({ notes: updatedNotes })

    // Update selected note if it's the one being updated
    const selectedNoteId = get().selectedNoteId
    if (selectedNoteId === noteId) {
      const updatedNote = updatedNotes.find((n) => n.id === noteId)
      set({ selectedNote: updatedNote || null })
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setSelectedLecturer: (lecturer) => set({ selectedLecturer: lecturer }),
  resetFilters: () =>
    set({
      searchTerm: "",
      selectedCourse: "all",
      selectedLecturer: "all",
    }),
}))
