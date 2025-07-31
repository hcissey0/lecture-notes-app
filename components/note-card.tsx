"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ImageIcon, Eye, Download, Loader2, Trash } from "lucide-react"
import Link from "next/link"
import { useData } from "@/contexts/data-context"
import { redirect } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
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

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { setClickedNote, incrementViewCount, downloadNote, deleteNote } = useData();
  const { user } = useAuth();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDownloading(true)
    try {
      // await onDownload(note)
      await downloadNote(note)
    } finally {
      setDownloading(false)
    }
  }

  const handleViewNote = (e: React.MouseEvent) => {
    e.stopPropagation()
    setClickedNote(note)
    incrementViewCount(note.id)
    redirect('/u/note')
    // onView(note.id)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(true);
    try {
      await deleteNote(note.id);
    } catch (e) {
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
    }
    // Implement delete functionality here
    // For now, just redirect to home
  }

  return (
  
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewNote}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {note.file_type === "pdf" ? (
              <FileText className="w-5 h-5 text-red-500" />
            ) : (
              <ImageIcon className="w-5 h-5 text-blue-500" />
            )}
            <Badge variant="secondary" className="text-xs">
              {note.file_type.toUpperCase()}
            </Badge>
          </div>
          <div className="flex gap-1">
            {user && user.id === note.uploader_id && (
              <Button size={'sm'} variant={'ghost'} onClick={handleDelete} className="h-8 w-8 p-0">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> :
              <Trash className="w-4 h-4 text-red-600" />
            }
            </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleViewNote} className="h-8 w-8 p-0">
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDownload} disabled={downloading} className="h-8 w-8 p-0">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <CardTitle className="text-lg leading-tight">{note.title}</CardTitle>
        <CardDescription>
          <div className="space-y-1">
            <div>
              <strong>Course:</strong> {note.course}
            </div>
            <div>
              <strong>Lecturer:</strong> {note.lecturer}
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {note.description && <p className="text-sm text-muted-foreground mb-3">{note.description}</p>}

        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              <div>Uploaded by {note.uploader_name}</div>
              <div>{new Date(note.created_at).toLocaleDateString()}</div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span className="font-medium">{note.view_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span className="font-medium">{note.download_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
