"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { showToast } from "@/components/ui/toast";

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
};

const typeColors: Record<string, string> = {
  info: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  error: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
};

export default function NotificationsPage() {
  const n = useTranslations("nav");
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      showToast("Erreur lors du chargement des notifications", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function markAsRead(id: string) {
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {}
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast("Toutes les notifications marquées comme lues", "success");
    } catch {
      showToast("Erreur lors du marquage", "error");
    } finally {
      setMarkingAll(false);
    }
  }

  async function deleteNotification(id: string) {
    try {
      await fetch("/api/user/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  }

  async function clearAll() {
    setClearingAll(true);
    try {
      await fetch("/api/user/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      });
      setNotifications([]);
      showToast("Toutes les notifications supprimées", "success");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    } finally {
      setClearingAll(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            {n("notifications")}
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Aucune notification non lue"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              {markingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Tout marquer lu
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive"
              onClick={clearAll}
              disabled={clearingAll}
            >
              {clearingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Tout effacer
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Chargement...
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-primary/10 mb-4">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-semibold">Aucune notification</p>
            <p className="text-sm text-muted-foreground mt-1">
              Vous serez notifié ici des activités importantes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={cn(
                "transition-all hover:shadow-md",
                !notif.read && "border-primary/20 bg-primary/[0.02]"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]",
                      typeColors[notif.type] || typeColors.info
                    )}
                  >
                    {typeIcons[notif.type] || typeIcons.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={cn(
                            "text-sm",
                            !notif.read && "font-semibold"
                          )}
                        >
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => markAsRead(notif.id)}
                            title="Marquer comme lu"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteNotification(notif.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(notif.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
