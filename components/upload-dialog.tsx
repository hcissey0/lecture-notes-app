"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { useData } from "@/contexts/data-context"
import { db } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface UploadDialogProps {
  user: User
  isAnonymous?: boolean
}

export function UploadDialog({ user, isAnonymous = false }: UploadDialogProps) {
  const { uploadNote, profile } = useData()
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadAsAnonymous, setUploadAsAnonymous] = useState(isAnonymous)

  const [uploadForm, setUploadForm] = useState({
    title: "",
    course: "",
    lecturer: "",
    description: "",
    tags: "",
    file: null as File | null,
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!db.utils.isValidFileType(file)) {
        toast.error("Invalid file type. Please upload PDF, JPG, or PNG files only.")
        return
      }

      // Validate file size
      if (!db.utils.isValidFileSize(file)) {
        toast.error(`File size must be less than ${db.utils.formatFileSize(10 * 1024 * 1024)}`)
        return
      }

      setUploadForm((prev) => ({ ...prev, file }))
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.title || !uploadForm.course || !uploadForm.lecturer) {
      toast.error("Please fill in all required fields")
      return
    }

    setUploading(true)

    try {
      // Generate unique file path
      const filePath = db.utils.generateFilePath(user.id, uploadForm.file.name)

      // Upload file to storage
      const uploadResult = await db.storage.uploadFile(filePath, uploadForm.file)
      if (uploadResult.error) {
        toast.error(uploadResult.error)
        return
      }

      // Determine uploader name
      const uploaderName = uploadAsAnonymous
        ? "Anonymous"
        : profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Unknown"

      // Create note data
      const noteData = {
        title: uploadForm.title,
        course: uploadForm.course,
        lecturer: uploadForm.lecturer,
        description: uploadForm.description || null,
        file_path: filePath,
        file_type: uploadForm.file.type.includes("pdf") ? "pdf" : "image",
        tags: uploadForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        uploader_id: user.id,
        uploader_name: uploaderName,
      }

      // Upload note using DataContext
      const success = await uploadNote(noteData)

      if (success) {
        // Reset form
        setUploadForm({
          title: "",
          course: "",
          lecturer: "",
          description: "",
          tags: "",
          file: null,
        })
        setIsOpen(false)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload notes")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Upload Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Lecture Notes</DialogTitle>
          <DialogDescription>Share your notes with fellow students</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Introduction to Machine Learning"
              className="border-0 bg-muted/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course">Course *</Label>
              <Input
                id="course"
                value={uploadForm.course}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, course: e.target.value }))}
                placeholder="e.g., CS 229"
                className="border-0 bg-muted/50"
                required
              />
            </div>
            <div>
              <Label htmlFor="lecturer">Lecturer *</Label>
              <Input
                id="lecturer"
                value={uploadForm.lecturer}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, lecturer: e.target.value }))}
                placeholder="e.g., Dr. Smith"
                className="border-0 bg-muted/50"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={uploadForm.description}
              onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the content..."
              className="border-0 bg-muted/50"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={uploadForm.tags}
              onChange={(e) => setUploadForm((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., machine-learning, algorithms, supervised-learning"
              className="border-0 bg-muted/50"
            />
          </div>

          <div>
            <Label htmlFor="file">File *</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="border-0 bg-muted/50"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Supported formats: PDF, JPG, PNG (max {db.utils.formatFileSize(10 * 1024 * 1024)})
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={uploadAsAnonymous}
              onCheckedChange={(checked) => setUploadAsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Upload anonymously
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
