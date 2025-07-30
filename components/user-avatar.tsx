"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { useNavigation } from "@/hooks/use-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, UserIcon, Settings, Home } from "lucide-react"
import Link from "next/link"

interface UserAvatarProps {
  user: User
  onSignOut: () => void
}

export function UserAvatar({ user, onSignOut }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email
  const initials =
    fullName
      ?.split(" ")
      .map((name: string) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all">
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={'/u'}>
        <DropdownMenuItem className="cursor-pointer">
          <Home className="mr-2 h-4 w-4" />
          <span>Home</span>
        </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="cursor-pointer">
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <Link href={'/u/settings'}>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
