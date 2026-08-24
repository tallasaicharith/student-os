"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import {
  Settings, User, Bell, Shield, Eye, Palette, Database,
  Check, Save, Sparkles, AlertCircle, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleSaveSettings = () => {
    setSaveLoading(true);
    setTimeout(() => {
      setSaveLoading(false);
      toast.success("Settings saved successfully! ⚙️");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader title="⚙️ Settings" description="Manage your user profile, theme preferences, and notifications" />

      {/* Grid of Settings Categories */}
      <div className="space-y-6">
        
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              User Profile Details
            </CardTitle>
            <CardDescription>Details retrieved from your Clerk Authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 overflow-hidden flex items-center justify-center flex-shrink-0">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold">{user?.fullName ?? "Student OS User"}</h3>
                <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress ?? "no-email@clerk.com"}</p>
                <Badge variant="secondary" className="mt-1 text-[10px]">Academic Account</Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">First Name</label>
                <Input value={user?.firstName ?? ""} disabled />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Last Name</label>
                <Input value={user?.lastName ?? ""} disabled />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-2">
              <AlertCircle className="w-3.5 h-3.5" /> Profile changes must be managed via Clerk settings.
            </p>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-500" />
              Theme & Customization
            </CardTitle>
            <CardDescription>Choose how StudentOS looks on your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold block">Preferred Mode</span>
                <span className="text-[10px] text-muted-foreground">Adjust contrast for night/day operations</span>
              </div>
              <div className="flex gap-1 bg-muted p-1 rounded-xl">
                <Button variant={theme === "light" ? "default" : "ghost"} size="sm" className="text-xs py-1 px-3 h-8" onClick={() => setTheme("light")}>
                  Light
                </Button>
                <Button variant={theme === "dark" ? "default" : "ghost"} size="sm" className="text-xs py-1 px-3 h-8" onClick={() => setTheme("dark")}>
                  Dark
                </Button>
                <Button variant={theme === "system" ? "default" : "ghost"} size="sm" className="text-xs py-1 px-3 h-8" onClick={() => setTheme("system")}>
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />
              Notification Settings
            </CardTitle>
            <CardDescription>Control alerts for tasks, habits, and study logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">Push Notifications</span>
                <span className="text-[10px] text-muted-foreground">Alert me before due assignments and exams</span>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">Weekly Performance Digest</span>
                <span className="text-[10px] text-muted-foreground">Receive Sunday review export email digests</span>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>
          </CardContent>
        </Card>

        {/* Save button footer */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button onClick={handleSaveSettings} disabled={saveLoading} className="gap-1.5">
            {saveLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>

      </div>
    </div>
  );
}
