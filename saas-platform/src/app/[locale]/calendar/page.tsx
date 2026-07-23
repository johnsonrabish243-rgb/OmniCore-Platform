"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Clock, Users, Video, MapPin } from "lucide-react";

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const events = [
  { id: 1, title: "Revue de sprint", date: 15, time: "10:00 - 11:30", type: "meeting", color: "bg-primary/10 text-primary border-primary/20" },
  { id: 2, title: "Appel client Projet Alpha", date: 15, time: "14:00 - 15:00", type: "call", color: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400" },
  { id: 3, title: "Atelier Design System", date: 16, time: "09:00 - 12:00", type: "workshop", color: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400" },
  { id: 4, title: "Deadpoint rapport mensuel", date: 18, time: "17:00", type: "deadline", color: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400" },
  { id: 5, title: "Déjeuner équipe", date: 17, time: "12:30 - 13:30", type: "social", color: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400" },
];

const eventIcons: Record<string, React.ReactNode> = {
  meeting: <Video className="h-3.5 w-3.5" />,
  call: <Users className="h-3.5 w-3.5" />,
  workshop: <CalendarDays className="h-3.5 w-3.5" />,
  deadline: <Clock className="h-3.5 w-3.5" />,
  social: <Users className="h-3.5 w-3.5" />,
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 15));
  const [selectedDate, setSelectedDate] = useState(15);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const todayEvents = events.filter((e) => e.date === selectedDate);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendrier</h1>
          <p className="text-muted-foreground">Gérez vos événements et réunions</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel événement
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {monthNames[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setCurrentDate(new Date())}>
                  Aujourd'hui
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-border rounded-[12px] overflow-hidden">
              {weekDays.map((day) => (
                <div key={day} className="bg-muted/50 px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-card px-3 py-6" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const hasEvents = events.some((e) => e.date === day);
                const isSelected = day === selectedDate;
                const isToday = day === 15 && month === 6 && year === 2026;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative bg-card px-3 py-6 text-sm transition-colors hover:bg-muted/30 text-left",
                      isSelected && "ring-2 ring-primary ring-inset",
                      isToday && "font-bold text-primary"
                    )}
                  >
                    <span>{day}</span>
                    {hasEvents && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Événements</CardTitle>
            <CardDescription>{selectedDate} {monthNames[month]} {year}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun événement pour cette date</p>
            ) : (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn("flex items-start gap-3 p-3 rounded-[12px] border transition-colors cursor-pointer hover:shadow-sm", event.color)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-background/50">
                    {eventIcons[event.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
