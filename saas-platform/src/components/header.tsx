"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Search,
  Command,
  ChevronDown,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Menu,
} from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";

interface SessionData {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    avatarUrl: string | null;
    organizations: Array<{ id: string; name: string; role: string }>;
    activeWorkspace: { id: string; name: string; slug: string } | null;
  } | null;
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [session, setSession] = useState<SessionData["user"]>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setSession(data.user);
        }
      } catch {}
    }
    loadSession();
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/user/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {}
    }
    loadNotifications();
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = window.location.pathname.replace(/\/[a-z]{2}\/.*/, "/fr/login");
    } catch {
      window.location.href = "/fr/login";
    }
  }

  const displayName = session
    ? [session.firstName, session.lastName].filter(Boolean).join(" ") || session.email
    : "Chargement...";
  const initials = session
    ? ((session.firstName?.[0] || "") + (session.lastName?.[0] || "")).toUpperCase() || "?"
    : "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb navigation */}
      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
        <img src="/omnicore-logo.png" alt="OmniCore" className="h-5 w-5 rounded object-contain" />
        <span className="font-medium text-foreground">OmniCore</span>
        {session?.activeWorkspace && (
          <>
            <span className="text-muted-foreground/50">/</span>
            <span>{session.activeWorkspace.name}</span>
          </>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <button
        onClick={() => setShowSearch(true)}
        className="hidden md:flex items-center gap-2 rounded-[10px] border border-border/60 bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-all duration-200 w-56 lg:w-72"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Rechercher...</span>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded-[6px] border border-border/50 bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-auto">
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Aucune notification
                </div>
              ) : (
                notifications.slice(0, 5).map((notif: any) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-0.5 py-2">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <a href="/notifications">
              <DropdownMenuItem className="justify-center text-sm font-medium text-primary">
                Voir toutes les notifications
              </DropdownMenuItem>
            </a>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-[10px] px-2"
            >
              <Avatar className="h-8 w-8 ring-2 ring-border/50">
                <AvatarImage src={session?.avatarUrl || getAvatarUrl(displayName)} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {session?.email || ""}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <a href="/profile">
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profil
              </DropdownMenuItem>
            </a>
            <a href="/settings">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
            </a>
            <a href="/help">
              <DropdownMenuItem>
                <HelpCircle className="h-4 w-4 mr-2" />
                Aide
              </DropdownMenuItem>
            </a>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
