"use client"

import React, { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { useData } from "@/contexts/data-context"
import { useNavigation } from "@/hooks/use-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Loader2, UserIcon, Shield, Bell } from "lucide-react"

interface SettingsPageProps {
  user: User
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const { userSettings, settingsLoading, updateUserSettings, updateProfile } = useData()
  const { navigateToHome } = useNavigation()

  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: userSettings?.full_name || "",
    anonymous_uploads: userSettings?.anonymous_uploads || false,
    email_notifications: userSettings?.email_notifications || true,
  })

  // Update form data when userSettings changes
  React.useEffect(() => {
    if (userSettings) {
      setFormData({
        full_name: userSettings.full_name || "",
        anonymous_uploads: userSettings.anonymous_uploads || false,
        email_notifications: userSettings.email_notifications || true,
      })
    }
  }, [userSettings])

  const handleSaveSettings = async () => {
    setSaving(true)

    try {
      // Update user settings
      await updateUserSettings(user.id, {
        anonymous_uploads: formData.anonymous_uploads,
        email_notifications: formData.email_notifications,
      })

      // Update profile
      await updateProfile(user.id, {
        full_name: formData.full_name || null,
      })
    } finally {
      setSaving(false)
    }
  }

  if (settingsLoading) {
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
        <Button variant="ghost" onClick={navigateToHome}>
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
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
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
                checked={formData.anonymous_uploads}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, anonymous_uploads: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email notifications about new notes and updates</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={formData.email_notifications}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, email_notifications: checked }))}
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
