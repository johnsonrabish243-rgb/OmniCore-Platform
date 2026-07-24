"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Briefcase,
  ShoppingCart,
  Package,
  FolderKanban,
  CheckSquare,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  HelpCircle,
  Building2,
  ChevronDown,
  Search,
  PanelLeftClose,
  PanelLeft,
  Shield,
  Check,
  Layers,
  Loader2,
  ShoppingBag,
  Pill,
  GraduationCap,
  Heart,
  DollarSign,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  moduleId?: string;
  children?: NavItem[];
}

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  description?: string | null;
  type?: string | null;
}

// These are static labels used in navigation; translation is done in the component

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

/* ───── Workspace Switcher ───── */
function WorkspaceSwitcher({ collapsed, activeWorkspaceId }: { collapsed: boolean; activeWorkspaceId?: string | null }) {
  const ts = useTranslations("sidebar");
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/workspaces");
        if (res.ok) {
          const wsData = await res.json();
          const list = wsData.workspaces || [];
          setWorkspaces(list);

          if (activeWorkspaceId) {
            const found = list.find((w: WorkspaceData) => w.id === activeWorkspaceId);
            if (found) setActiveWorkspace(found);
          }
          // If no active workspace but we have workspaces, set first as active
          if (!activeWorkspaceId && list.length > 0) {
            setActiveWorkspace(list[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load workspaces:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeWorkspaceId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function switchWorkspace(id: string) {
    setSwitching(id);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeWorkspaceId: id }),
      });
      if (res.ok) {
        const found = workspaces.find((w) => w.id === id);
        if (found) {
          setActiveWorkspace(found);
          setOpen(false);
          // Reload the page to refresh all data for the new workspace
          window.location.href = window.location.pathname;
        }
      }
    } catch {} finally {
      setSwitching(null);
    }
  }

  if (loading) {
    return collapsed ? (
      <div className="flex justify-center pb-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    ) : (
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-[10px] border border-border/30 bg-sidebar-muted/50 px-3 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{ts("loading")}</span>
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) return null;

  const currentName = activeWorkspace?.name || workspaces[0]?.name || "";

  if (collapsed) {
    return (
      <div className="flex justify-center pb-3" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border/30 bg-sidebar-muted/50 text-sidebar-foreground hover:bg-sidebar-muted transition-all"
            title={currentName}
          >
            <Layers className="h-4 w-4" />
          </button>
          {open && (
            <div className="absolute left-0 top-full mt-1 z-50 w-56 rounded-[12px] border border-border/50 bg-popover p-1 shadow-xl animate-fade-in-up">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {ts("workspaces")}
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => switchWorkspace(ws.id)}
                  disabled={switching === ws.id}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-sm transition-all",
                    activeWorkspace?.id === ws.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-popover-foreground hover:bg-accent"
                  )}
                >
                  <Layers className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{ws.name}</span>
                  {activeWorkspace?.id === ws.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                  {switching === ws.id && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pb-2" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-[10px] border border-border/30 bg-sidebar-muted/50 px-3 py-2 text-left transition-all",
            open ? "border-primary/40 shadow-sm" : "hover:bg-sidebar-muted"
          )}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate leading-tight">
              {currentName}
            </p>
            <p className="text-[9px] text-muted-foreground truncate leading-tight">
              Espace de travail actif
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div className="absolute left-3 right-3 top-full mt-1 z-50 rounded-[12px] border border-border/50 bg-popover p-1 shadow-xl animate-fade-in-up">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Espaces de travail
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => switchWorkspace(ws.id)}
                disabled={switching === ws.id}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-sm transition-all",
                  activeWorkspace?.id === ws.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-popover-foreground hover:bg-accent"
                )}
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate">{ws.name}</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                  {ws.slug}
                </span>
                {activeWorkspace?.id === ws.id && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                {switching === ws.id && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───── Main Sidebar ───── */
export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const ts = useTranslations("sidebar");
  const [expandedModules, setExpandedModules] = useState(true);

  const mainNavItems: NavItem[] = [
    { label: t("dashboard"), icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { label: t("analytics"), icon: <BarChart3 size={20} />, href: "/analytics" },
  ];

  const adminNavItems: NavItem[] = [
    { label: t("admin"), icon: <Shield size={20} />, href: "/admin" },
  ];

  const moduleNavItems: NavItem[] = [
    { label: t("hr"), icon: <Users size={20} />, href: "/hr", moduleId: "hr" },
    { label: ts("finance"), icon: <DollarSign size={20} />, href: "/finance", moduleId: "finance" },
    { label: t("crm"), icon: <Briefcase size={20} />, href: "/crm", moduleId: "crm" },
    { label: t("commerce"), icon: <ShoppingBag size={20} />, href: "/commerce", moduleId: "commerce" },
    { label: t("sales"), icon: <ShoppingCart size={20} />, href: "/sales", moduleId: "sales" },
    { label: t("inventory"), icon: <Package size={20} />, href: "/inventory", moduleId: "inventory" },
    { label: t("pharmacy"), icon: <Pill size={20} />, href: "/pharmacy", moduleId: "pharmacy" },
    { label: t("education"), icon: <GraduationCap size={20} />, href: "/education", moduleId: "education" },
    { label: t("healthcare"), icon: <Heart size={20} />, href: "/healthcare", moduleId: "healthcare" },
    { label: t("projects"), icon: <FolderKanban size={20} />, href: "/projects", moduleId: "projects" },
    { label: t("tasks"), icon: <CheckSquare size={20} />, href: "/tasks", moduleId: "tasks" },
    { label: t("calendar"), icon: <Calendar size={20} />, href: "/calendar", moduleId: "calendar" },
    { label: t("messages"), icon: <MessageSquare size={20} />, href: "/messages", badge: 3, moduleId: "messages" },
    { label: ts("documents"), icon: <FileText size={20} />, href: "/documents", moduleId: "documents" },
  ];

  const bottomNavItems: NavItem[] = [
    { label: t("settings"), icon: <Settings size={20} />, href: "/settings" },
    { label: t("help"), icon: <HelpCircle size={20} />, href: "/help" },
  ];

  const [session, setSession] = useState<{
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
    avatarUrl: string | null;
    activeWorkspace: {
      id: string;
      name: string;
      slug: string;
      enabledModules?: string[];
    } | null;
  } | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setSession(data.user);
          }
        }
      } catch {}
    }
    loadSession();
  }, []);

  const isAdmin = session && ADMIN_ROLES.includes(session.role);
  const displayName = session
    ? [session.firstName, session.lastName].filter(Boolean).join(" ") || session.email
    : "Chargement...";
  const initials = session
    ? ((session.firstName?.[0] || "") + (session.lastName?.[0] || "")).toUpperCase() || "?"
    : "?";

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/50 bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img
              src="/omnicore-logo.png"
              alt="OmniCore Logo"
              className="h-8 w-8 rounded-[10px] object-contain shadow-sm"
            />
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
                OmniCore
              </h1>
              <p className="text-[10px] font-medium text-muted-foreground leading-none">
                Enterprise Suite
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex w-full justify-center">
            <img
              src="/omnicore-logo.png"
              alt="OmniCore Logo"
              className="h-8 w-8 rounded-[10px] object-contain shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher collapsed={collapsed} activeWorkspaceId={session?.activeWorkspace?.id} />

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              readOnly
              onClick={() => {
                const e = new KeyboardEvent("keydown", { metaKey: true, ctrlKey: true, key: "k", bubbles: true });
                document.dispatchEvent(e);
              }}
              onFocus={(e) => {
                e.target.blur();
                const ev = new KeyboardEvent("keydown", { metaKey: true, key: "k", bubbles: true });
                document.dispatchEvent(ev);
              }}
              className="h-9 w-full rounded-[10px] border border-border/60 bg-sidebar-muted pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-all cursor-pointer"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded-[6px] border border-border/50 bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-2">
          {/* Main */}
          <div className={cn("space-y-1", collapsed && "flex flex-col items-center")}>
            {!collapsed && (
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {ts('general')}
              </p>
            )}
            {mainNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-2",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </a>
            ))}
          </div>

          {!collapsed && <Separator className="my-3" />}

          {/* Admin (conditionally shown for SUPER_ADMIN / ADMIN) */}
          {isAdmin && (
            <>
              <div className={cn("space-y-1", collapsed && "flex flex-col items-center")}>
                {!collapsed && (
                  <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t("admin")}
                  </p>
                )}
                {adminNavItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-all duration-200",
                      collapsed && "justify-center px-2",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                ))}
              </div>
              {!collapsed && <Separator className="my-3" />}
            </>
          )}

          {/* Modules — filtered by workspace enabledModules */}
          {(() => {
            const enabledIds = session?.activeWorkspace?.enabledModules;
            // SUPER_ADMIN/ADMIN see all modules; if no filter defined, show all (backward compatible)
            const visibleModules = isAdmin || !enabledIds || enabledIds.length === 0
              ? moduleNavItems
              : moduleNavItems.filter((m) => m.moduleId && enabledIds.includes(m.moduleId));

            if (visibleModules.length === 0) return null;

            return (
              <div className="space-y-1">
                <button
                  onClick={() => setExpandedModules(!expandedModules)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-muted transition-all duration-200",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <span className="shrink-0"><Building2 size={20} /></span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{ts('modules')}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          expandedModules && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>
                {expandedModules && (
                  <div className={cn("space-y-1", collapsed && "hidden")}>
                    {visibleModules.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-all duration-200",
                          isActive(item.href)
                            ? "bg-sidebar-accent text-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
                        )}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-medium text-primary">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {!collapsed && <Separator className="my-3" />}

          {/* Bottom */}
          <div className={cn("space-y-1", collapsed && "flex flex-col items-center")}>
            {bottomNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-2",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </a>
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* User Profile */}
      <div className={cn("border-t border-border/50 p-3", collapsed && "flex justify-center")}>
        <a
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-[12px] p-2 transition-colors hover:bg-sidebar-muted cursor-pointer",
            collapsed && "justify-center p-2"
          )}
        >
          <Avatar className="h-8 w-8 ring-2 ring-border/50">
            <AvatarImage src={session?.avatarUrl || getAvatarUrl(displayName)} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {session?.email || ""}
              </p>
            </div>
          )}
        </a>
      </div>

      {/* Collapse Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-background shadow-sm hover:bg-accent transition-all duration-200 z-50"
      >
        {collapsed ? (
          <PanelLeft className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <PanelLeftClose className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
