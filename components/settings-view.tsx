"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useAppState } from "@/hooks/use-app-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ArrowLeft, Save, Loader2, UserIcon, Shield } from "lucide-react"

interface UserSettings {
  anonymous_uploads: boolean
  full_name: string | null
}

interface SettingsViewProps {
  user: User
}

export function SettingsView({ user }: SettingsViewProps) {
  const { setCurrentView } = useAppState()
  const [settings, setSettings] = useState<UserSettings>({
    anonymous_uploads: false,
    full_name: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch user settings
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, anonymous_uploads")
        .eq("id", user.id)
        .single()

      if (error) throw error

      setSettings({
        anonymous_uploads: data.anonymous_uploads || false,
        full_name: data.full_name || "",
      })
    } catch (error: any) {
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  // Save settings
  const handleSaveSettings = async () => {
    setSaving(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: settings.full_name || null,
          anonymous_uploads: settings.anonymous_uploads,
        })
        .eq("id", user.id)

      if (error) throw error

      toast.success("Settings saved successfully!")
    } catch (error: any) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setCurrentView("home")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Profile
            </CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={settings.full_name || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
                className="border-0 bg-muted/50"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email || ""} disabled className="border-0 bg-muted/30 opacity-60" />
              <p className="text-sm text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy
            </CardTitle>
            <CardDescription>Control how your information is displayed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous">Anonymous Uploads</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, your uploads will show "Anonymous" instead of your name
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={settings.anonymous_uploads}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, anonymous_uploads: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
