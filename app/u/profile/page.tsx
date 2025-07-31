'use client'
import { NoteCard } from "@/components/note-card";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/hooks/use-auth";
import { Note } from "@/lib/database";
import { Avatar } from "@radix-ui/react-avatar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ArrowLeft, FileText, ImageIcon, Badge, BookOpen, GraduationCap, User, Calendar, Eye, Download, Tag, ExternalLink, Loader2, Upload, Fuel } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(false);
  const { fetchUserNotes } = useData();
  const [userNotes, setUserNotes] = useState<Note[]>([])
  
  useEffect(() => {
    const func = async () => {
      if (!user) return;
     setLoading(true);
     try {
      const notes = await fetchUserNotes(user.id)
      setUserNotes(notes);
     } catch (e) {
      toast.error("Failed to fetch user notes.")
     } finally {
       setLoading(false)
      }
    }
    func();
  }, [user])
  if (!user) return null;
  
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const fullName =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email;
  const initials =
    fullName
      ?.split(" ")
      .map((name: string) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

    

    return (
      <div className="space-y-6 mt-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={"/u"}>
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Notes
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Note Details */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className=" cursor-pointer ring-2 ring-transparent transition-all">
                    {avatarUrl && !imageError ? (
                      <AvatarImage
                        src={avatarUrl || "/placeholder.svg"}
                        alt={fullName || "User avatar"}
                        onError={() => setImageError(true)}
                      />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {/* <Badge variant="secondary">
                    {clickedNote.file_type.toUpperCase()}
                  </Badge> */}
                </div>
                <CardTitle className="text-xl leading-tight">
                  {fullName}
                </CardTitle>
                
                  <CardDescription className="text-sm mt-2">
                    {user.email}
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Uploads: </span>
                    {loading ? 
                  <Loader2 className="w-4 h-4 animate-spin" /> :  
                    <span className="text-sm">{userNotes.length}</span>
                  }
                  </div>
                </div>
                {/* Course Info */}
                {/* <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Course:</span>
                    <span className="text-sm">{clickedNote.course}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Lecturer:</span>
                    <span className="text-sm">{clickedNote.lecturer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Uploaded by:</span>
                    <span className="text-sm">{clickedNote.uploader_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">
                      {new Date(clickedNote.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div> */}

                <Separator />

                {/* Stats */}
                {/* <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {clickedNote.view_count || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {clickedNote.download_count || 0}
                      </div>
                    </div>
                  </div>
                </div> */}

                <Separator />

                {/* Tags */}
                {/* {clickedNote.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {clickedNote.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )} */}

                <Separator />

                {/* Actions */}
                {/* <div className="space-y-2">
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleGeneratePreview}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Load Preview
                  </Button>
                  {previewUrl && (
                    <Button variant="ghost" className="w-full" asChild>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </a>
                    </Button>
                  )}
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <Card className="h-full border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Uploaded Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                {loading ? 
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>  :
              <div className="w-full h-full min-h-96">
                {userNotes.length === 0 ?
                <div>
                  You have no notes present
                </div>  :
                (userNotes.map((note) => (
                  <NoteCard note={note}  />
                )))
              }
              </div>
              }
                {/* {previewLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : previewUrl ? (
                  <div className="w-full h-full min-h-96">
                    {clickedNote.file_type === "pdf" ? (
                      <iframe
                        src={previewUrl}
                        className="w-full h-full min-h-96 rounded-lg"
                        title={`Preview of ${clickedNote.title}`}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-96 bg-muted/30 rounded-lg">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt={clickedNote.title}
                          className="max-w-full max-h-full object-contain rounded-lg"
                          onError={() =>
                            toast.error("Failed to load image preview")
                          }
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Click "Load Preview" to view the file
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Preview loads on demand to improve performance
                      </p>
                    </div>
                  </div>
                )} */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
}