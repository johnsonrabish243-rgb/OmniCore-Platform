"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FileText,
  Folder,
  Search,
  Plus,
  MoreHorizontal,
  Download,
  Trash2,
  Star,
  Clock,
  Users,
  Image,
  File,
  FileSpreadsheet,
} from "lucide-react";

const documents = [
  { name: "Rapport financier Q2 2026", type: "spreadsheet", size: "2.4 MB", modified: "Il y a 2h", author: "Admin", starred: true },
  { name: "Présentation client - Projet Alpha", type: "presentation", size: "5.1 MB", modified: "Il y a 1 jour", author: "Sophie M.", starred: false },
  { name: "Stratégie marketing Q3", type: "document", size: "1.2 MB", modified: "Il y a 2 jours", author: "Marie L.", starred: true },
  { name: "Manuel d'utilisation v2.4", type: "document", size: "3.7 MB", modified: "Il y a 3 jours", author: "Admin", starred: false },
  { name: "Logo OmniCore - Pack complet", type: "image", size: "8.3 MB", modified: "Il y a 5 jours", author: "Sophie M.", starred: false },
  { name: "Contrat prestataire - TechCorp", type: "document", size: "0.8 MB", modified: "Il y a 1 semaine", author: "Admin", starred: true },
  { name: "Feuille de route produit", type: "spreadsheet", size: "1.5 MB", modified: "Il y a 1 semaine", author: "Thomas D.", starred: false },
  { name: "Mockups application mobile", type: "image", size: "12.4 MB", modified: "Il y a 2 semaines", author: "Sophie M.", starred: false },
];

const fileIcons: Record<string, React.ReactNode> = {
  document: <FileText className="h-5 w-5" />,
  spreadsheet: <FileSpreadsheet className="h-5 w-5" />,
  presentation: <File className="h-5 w-5" />,
  image: <Image className="h-5 w-5" />,
};

const folders = ["Documents RH", "Factures", "Contrats", "Rapports", "Présentations"];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [showStarred, setShowStarred] = useState(false);

  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesStarred = showStarred ? doc.starred : true;
    return matchesSearch && matchesStarred;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Gérez et partagez vos fichiers</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Importer
        </Button>
      </div>

      {/* Folders */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <Folder className="h-4 w-4" />
          Tous les fichiers
        </Button>
        {folders.map((folder) => (
          <Button key={folder} variant="ghost" size="sm" className="gap-2 shrink-0">
            <Folder className="h-4 w-4 text-amber-500" />
            {folder}
          </Button>
        ))}
        <Button variant="ghost" size="sm" className="gap-2 shrink-0" onClick={() => setShowStarred(!showStarred)}>
          <Star className={cn("h-4 w-4", showStarred && "fill-amber-500 text-amber-500")} />
          Favoris
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un fichier..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Files Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((doc) => (
          <Card key={doc.name} className="group hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[10px]",
                  doc.type === "document" && "bg-blue-50 text-blue-600 dark:bg-blue-950/30",
                  doc.type === "spreadsheet" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30",
                  doc.type === "presentation" && "bg-amber-50 text-amber-600 dark:bg-amber-950/30",
                  doc.type === "image" && "bg-purple-50 text-purple-600 dark:bg-purple-950/30",
                )}>
                  {fileIcons[doc.type]}
                </div>
                <button onClick={() => {}}>
                  <Star className={cn("h-4 w-4", doc.starred ? "fill-amber-500 text-amber-500" : "text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity")} />
                </button>
              </div>
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{doc.size}</span>
                <span>{doc.modified}</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {doc.author}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-sm"><Download className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon-sm"><Trash2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
