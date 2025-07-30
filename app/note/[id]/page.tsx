"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { UserAvatar } from "@/components/user-avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"

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
}

export default function NoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const noteId = params.id as string

  // Fetch note details
  const fetchNote = async () => {
    try {
      const { data, error } = await supabase.from("notes").select("*").eq("id", noteId).single()

      if (error) throw error
      setNote(data)
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to load note details" })
    } finally {
      setLoading(false)
    }
  }

  // Generate preview URL (lazy loaded)
  const generatePreview = async () => {
    if (!note || previewUrl) return

    setPreviewLoading(true)
    try {
      const { data, error } = await supabase.storage.from("lecture-notes").createSignedUrl(note.file_path, 3600)

      if (error) throw error
      setPreviewUrl(data.signedUrl)
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to generate preview" })
    } finally {
      setPreviewLoading(false)
    }
  }

  // Download file with counter increment
  const handleDownload = async () => {
    if (!note) return

    try {
      // Increment download counter
      const { error: updateError } = await supabase
        .from("notes")
        .update({ download_count: (note.download_count || 0) + 1 })
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

      setMessage({ type: "success", text: "File downloaded successfully!" })

      // Update local state
      setNote((prev) => (prev ? { ...prev, download_count: (prev.download_count || 0) + 1 } : null))
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to download file" })
    }
  }

  useEffect(() => {
    if (user && noteId) {
      fetchNote()
    }
  }, [user, noteId])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push("/")
    return null
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserAvatar user={user} onSignOut={signOut} />
            </div>
          </div>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Note not found</h3>
            <p className="text-muted-foreground">The note you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserAvatar user={user} onSignOut={signOut} />
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert
            className={`mb-6 border-0 ${
              message.type === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-green-500/10 text-green-700 dark:text-green-400"
            }`}
          >
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Note Details */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {note.file_type === "pdf" ? (
                    <FileText className="w-6 h-6 text-red-500" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-blue-500" />
                  )}
                  <Badge variant="secondary">{note.file_type.toUpperCase()}</Badge>
                </div>
                <CardTitle className="text-xl leading-tight">{note.title}</CardTitle>
                {note.description && <CardDescription className="text-sm mt-2">{note.description}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Course Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Course:</span>
                    <span className="text-sm">{note.course}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Lecturer:</span>
                    <span className="text-sm">{note.lecturer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Uploaded by:</span>
                    <span className="text-sm">{note.uploader_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">
                      {new Date(note.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Downloads:</span>
                    <span className="text-sm">{note.download_count || 0}</span>
                  </div>
                </div>

                <Separator />

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
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
                  <Button variant="ghost" onClick={generatePreview} className="w-full">
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
                    {note.file_type === "pdf" ? (
                      <iframe
                        src={previewUrl}
                        className="w-full h-full min-h-96 rounded-lg"
                        title={`Preview of ${note.title}`}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-96 bg-muted/30 rounded-lg">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt={note.title}
                          className="max-w-full max-h-full object-contain rounded-lg"
                          onError={() => setMessage({ type: "error", text: "Failed to load image preview" })}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Click "Load Preview" to view the file</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Preview loads on demand to improve performance
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
