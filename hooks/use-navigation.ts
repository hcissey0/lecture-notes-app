"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export type PageType = "home" | "note" | "settings"

interface NavigationHook {
  currentPage: PageType
  noteId: string | null
  navigateToHome: () => void
  navigateToNote: (noteId: string) => void
  navigateToSettings: () => void
  goBack: () => void
}

export const useNavigation = (): NavigationHook => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Determine current page from URL
  const getCurrentPage = (): PageType => {
    if (typeof window === "undefined") return "home"

    const path = window.location.pathname
    if (path.includes("/note/")) return "note"
    if (path.includes("/settings")) return "settings"
    return "home"
  }

  const currentPage = getCurrentPage()
  const noteId = currentPage === "note" ? searchParams.get("id") : null

  const navigateToHome = useCallback(() => {
    router.push("/")
  }, [router])

  const navigateToNote = useCallback(
    (noteId: string) => {
      router.push(`/?page=note&id=${noteId}`)
    },
    [router],
  )

  const navigateToSettings = useCallback(() => {
    router.push("/?page=settings")
  }, [router])

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  return {
    currentPage,
    noteId,
    navigateToHome,
    navigateToNote,
    navigateToSettings,
    goBack,
  }
}
