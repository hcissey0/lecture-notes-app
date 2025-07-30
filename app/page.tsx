"use client"
import { useState } from "react"
import { redirect, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function LectureNotesApp() {
   const { user, loading: authLoading, signOut } = useAuth()
  

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) return redirect('/auth');
  return redirect('/u');
  }
