"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Globe,
  Camera,
  Award,
  Clock,
  Save,
  Loader2,
} from "lucide-react";
import { showToast } from "@/components/ui/toast";

interface SessionData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  bio: string | null;
  role: string;
  language: string;
  timezone: string;
  avatarUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function ProfilePage() {
  const p = useTranslations("profile");
  const c = useTranslations("common");
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          const user = data.user;
          if (user) {
            setSession(user);
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
            setBio(user.bio || "");
          }
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, bio }),
      });
      if (res.ok) {
        showToast("Profil mis à jour avec succès", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Erreur lors de la mise à jour", "error");
      }
    } catch {
      showToast("Erreur de connexion", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = [session?.firstName, session?.lastName].filter(Boolean).join(" ") || "Utilisateur";
  const initials = ((session?.firstName?.[0] || "") + (session?.lastName?.[0] || "")).toUpperCase() || "?";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-purple-500/20" />
        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12">
            <div className="relative group">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary text-3xl font-bold border-4 border-background shadow-lg">
                {initials}
              </div>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="pt-2 sm:pt-10 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">{displayName}</h1>
                  <p className="text-sm text-muted-foreground">{session?.role || p("superAdmin")}</p>
                </div>
                <Badge variant="premium">{p("premium")}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{p("personalInfo")}</CardTitle>
            <CardDescription>{p("personalInfoDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{c("firstName")}</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{c("lastName")}</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{c("email")}</label>
                <Input value={email} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{c("phone")}</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">{p("bio")}</label>
              <textarea
                className="flex w-full rounded-[10px] border border-input bg-background px-3 py-2 text-sm resize-none h-20"
                placeholder={p("bioPlaceholder")}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <Button className="gap-2" onClick={saveProfile} loading={saving}>
              <Save className="h-4 w-4" />
              {c("save")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{p("stats")}</CardTitle>
            <CardDescription>{p("statsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: p("memberSince"), value: session?.createdAt ? new Date(session.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" }) : "—", icon: Calendar },
              { label: p("lastLogin"), value: session?.lastLoginAt ? new Date(session.lastLoginAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "—", icon: Clock },
              { label: p("role"), value: session?.role || p("superAdmin"), icon: Award },
              { label: p("language"), value: session?.language === "fr" ? "Français" : session?.language === "en" ? "English" : "Kiswahili", icon: Globe },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-medium">{stat.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
