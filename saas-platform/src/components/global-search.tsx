"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutDashboard,
  Users,
  Briefcase,
  ShoppingCart,
  Package,
  Pill,
  GraduationCap,
  Heart,
  Settings,
  HelpCircle,
  BarChart3,
  FileText,
  Calendar,
  MessageSquare,
  CheckSquare,
  FolderKanban,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  label: string;
  href: string;
  icon: React.ReactNode;
  category: string;
}

const ALL_ROUTES: SearchResult[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} />, category: "General" },
  { label: "Analytics", href: "/analytics", icon: <BarChart3 size={18} />, category: "General" },
  { label: "Human Resources", href: "/hr", icon: <Users size={18} />, category: "Modules" },
  { label: "CRM", href: "/crm", icon: <Briefcase size={18} />, category: "Modules" },
  { label: "Commerce", href: "/commerce", icon: <ShoppingCart size={18} />, category: "Modules" },
  { label: "Sales", href: "/sales", icon: <ShoppingCart size={18} />, category: "Modules" },
  { label: "Inventory", href: "/inventory", icon: <Package size={18} />, category: "Modules" },
  { label: "Pharmacy", href: "/pharmacy", icon: <Pill size={18} />, category: "Modules" },
  { label: "Education", href: "/education", icon: <GraduationCap size={18} />, category: "Modules" },
  { label: "Healthcare", href: "/healthcare", icon: <Heart size={18} />, category: "Modules" },
  { label: "Projects", href: "/projects", icon: <FolderKanban size={18} />, category: "Modules" },
  { label: "Tasks", href: "/tasks", icon: <CheckSquare size={18} />, category: "Modules" },
  { label: "Calendar", href: "/calendar", icon: <Calendar size={18} />, category: "Modules" },
  { label: "Messages", href: "/messages", icon: <MessageSquare size={18} />, category: "Modules" },
  { label: "Documents", href: "/documents", icon: <FileText size={18} />, category: "Modules" },
  { label: "Administration", href: "/admin", icon: <Briefcase size={18} />, category: "Admin" },
  { label: "Settings", href: "/settings", icon: <Settings size={18} />, category: "System" },
  { label: "Profile", href: "/profile", icon: <Users size={18} />, category: "System" },
  { label: "Help", href: "/help", icon: <HelpCircle size={18} />, category: "System" },
  { label: "Notifications", href: "/notifications", icon: <BarChart3 size={18} />, category: "System" },
];

export function GlobalSearch() {
  const router = useRouter();
  const t = useTranslations("globalSearch");
  const ts = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Filter results based on query
  const results = query.trim()
    ? ALL_ROUTES.filter(
        (r) =>
          r.label.toLowerCase().includes(query.toLowerCase()) ||
          r.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : ALL_ROUTES.slice(0, 6);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard shortcut handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keyboard navigation inside the palette
  const handlePaletteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        navigateTo(results[selectedIndex].href);
      }
    },
    [results, selectedIndex]
  );

  function navigateTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in" />
      )}

      {/* Command Palette */}
      <div
        ref={overlayRef}
        className={cn(
          "fixed left-1/2 top-[15%] z-[101] w-full max-w-lg -translate-x-1/2 rounded-[16px] border border-border/50 bg-popover shadow-2xl transition-all duration-200",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handlePaletteKeyDown}
            className="flex-1 bg-transparent text-sm text-popover-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded-[6px] border border-border/50 bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">{t('noResults')}</p>
              <p className="text-xs text-muted-foreground/50">{t('noResultsDesc')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={result.href}
                  onClick={() => navigateTo(result.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-all",
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-popover-foreground hover:bg-accent/50"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-muted text-muted-foreground">
                    {result.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{result.label}</p>
                    <p className="text-xs text-muted-foreground">{result.category}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-border/40 px-4 py-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <kbd className="inline-flex h-4 items-center rounded-[4px] border border-border/50 bg-background px-1 text-[10px] font-medium">↑</kbd>
            <kbd className="inline-flex h-4 items-center rounded-[4px] border border-border/50 bg-background px-1 text-[10px] font-medium">↓</kbd>
            <span>{t("navigate")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <kbd className="inline-flex h-4 items-center rounded-[4px] border border-border/50 bg-background px-1 text-[10px] font-medium">↵</kbd>
            <span>{t("open")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-auto">
            <kbd className="inline-flex h-4 items-center rounded-[4px] border border-border/50 bg-background px-1 text-[10px] font-medium">ESC</kbd>
            <span>{t("close")}</span>
          </div>
        </div>
      </div>
    </>
  );
}
