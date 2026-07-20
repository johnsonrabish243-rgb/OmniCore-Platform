"use client";

import { useState, ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { GlobalSearch } from "@/components/global-search";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <>
      <GlobalSearch />
      <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 h-full"
          >
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-[260px]"
        )}
      >
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
    </>
  );
}
