"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useData } from "@/contexts/data-context"
import { useNavigation } from "@/hooks/use-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  Download,
  FileText,
  ImageIcon,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Tag,
  Loader2,
  ExternalLink,
  Eye,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

interface NoteDetailPageProps {
  noteId: string
}

export const NoteDetailPage: React.FC<NoteDetailPageProps> = ({ noteId }) => {
  const { fetchNoteById, downloadNote, incrementViewCount, generatePreviewUrl, setSelectedNote, selectedNote } =
    useData()
  const { navigateToHome } = useNavigation()

  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [viewIncremented, setViewIncremented] = useState(false)

  // Load note data
  const loadNote = useCallback(async () => {
    setLoading(true)
    try {
      const note = await fetchNoteById(noteId)
      if (note) {
        setSelectedNote(note)

        // Increment view count only once per session
        if (!viewIncremented) {
          await incrementViewCount(noteId)
          setViewIncremented(true)
        }
      } else {
        toast.error("Note not found")
        navigateToHome()
      }
    } catch (error) {
      toast.error("Failed to load note")
      navigateToHome()
    } finally {
      setLoading(false)
    }
  }, [noteId, fetchNoteById, setSelectedNote, incrementViewCount, viewIncremented, navigateToHome])

  // Generate preview URL
  const handleGeneratePreview = async () => {
    if (!selectedNote || previewUrl) return

    setPreviewLoading(true)
    try {
      const url = await generatePreviewUrl(selectedNote.file_path)
      setPreviewUrl(url)
    } finally {
      setPreviewLoading(false)
    }
  }

  // Handle download
  const handleDownload = async () => {
    if (!selectedNote) return
    await downloadNote(selectedNote)
  }

  // Load note on mount or when noteId changes
  useEffect(() => {
    if (noteId) {
      loadNote()
    }

    // Reset preview and view increment when note changes
    return () => {
      setPreviewUrl(null)
      setViewIncremented(false)
    }
  }, [noteId, loadNote])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!selectedNote) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Note not found</h3>
        <p className="text-muted-foreground">The note you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={navigateToHome}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Note Details */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {selectedNote.file_type === "pdf" ? (
                  <FileText className="w-6 h-6 text-red-500" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-blue-500" />
                )}
                <Badge variant="secondary">{selectedNote.file_type.toUpperCase()}</Badge>
              </div>
              <CardTitle className="text-xl leading-tight">{selectedNote.title}</CardTitle>
              {selectedNote.description && (
                <CardDescription className="text-sm mt-2">{selectedNote.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Course:</span>
                  <span className="text-sm">{selectedNote.course}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Lecturer:</span>
                  <span className="text-sm">{selectedNote.lecturer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Uploaded by:</span>
                  <span className="text-sm">{selectedNote.uploader_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm">
                    {new Date(selectedNote.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{selectedNote.view_count || 0}</div>
                    <div className="text-xs text-muted-foreground">views</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{selectedNote.download_count || 0}</div>
                    <div className="text-xs text-muted-foreground">downloads</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              {selectedNote.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedNote.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button onClick={handleDownload} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
                <Button variant="ghost" onClick={handleGeneratePreview} className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Load Preview
                </Button>
                {previewUrl && (
                  <Button variant="ghost" className="w-full" asChild>
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              {previewLoading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : previewUrl ? (
                <div className="w-full h-full min-h-96">
                  {selectedNote.file_type === "pdf" ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full min-h-96 rounded-lg"
                      title={`Preview of ${selectedNote.title}`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-96 bg-muted/30 rounded-lg">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt={selectedNote.title}
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onError={() => toast.error("Failed to load image preview")}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Click "Load Preview" to view the file</p>
                    <p className="text-sm text-muted-foreground mt-1">Preview loads on demand to improve performance</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
