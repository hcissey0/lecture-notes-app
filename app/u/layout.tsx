"use client";
import { UserAvatar } from "@/components/user-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { DataProvider } from "@/contexts/data-context";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default function ULayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  return (
    <DataProvider user={user}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Lecture Notes Sharing
              </h1>
              <p className="text-muted-foreground mt-1">
                Share and discover course materials
              </p>
            </div>
            <div className="flex items-center justify-end gap-4">
              <ThemeToggle />
              <UserAvatar user={user as User} onSignOut={() => {
                signOut();
                redirect('/auth');
              }} />
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </DataProvider>
  );
}
