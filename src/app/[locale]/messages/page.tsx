"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Send, Paperclip, MoreHorizontal, Phone, Video, Image, Smile } from "lucide-react";

interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  isMine: boolean;
}

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Sophie Martin",
    lastMessage: "Le design de la page d'accueil est prêt pour revue",
    time: "10:42",
    unread: 2,
    online: true,
    messages: [
      { id: 1, sender: "Sophie Martin", content: "Bonjour ! J'ai terminé le design de la page d'accueil.", time: "10:30", isMine: false },
      { id: 2, sender: "Moi", content: "Super, je peux voir ça ?", time: "10:32", isMine: true },
      { id: 3, sender: "Sophie Martin", content: "Bien sûr ! Je t'envoie les maquettes par lien Figma.", time: "10:35", isMine: false },
      { id: 4, sender: "Sophie Martin", content: "Le design de la page d'accueil est prêt pour revue", time: "10:42", isMine: false },
    ],
  },
  {
    id: 2,
    name: "Thomas Dubois",
    lastMessage: "Réunion déplacée à 14h00 aujourd'hui",
    time: "09:30",
    unread: 1,
    online: true,
    messages: [
      { id: 1, sender: "Thomas Dubois", content: "La réunion de ce matin est décalée.", time: "09:30", isMine: false },
      { id: 2, sender: "Thomas Dubois", content: "Réunion déplacée à 14h00 aujourd'hui", time: "09:30", isMine: false },
    ],
  },
  {
    id: 3,
    name: "Marie Lambert",
    lastMessage: "Nouveau document partagé : Stratégie Q3",
    time: "Hier",
    unread: 0,
    online: false,
    messages: [
      { id: 1, sender: "Marie Lambert", content: "J'ai finalisé le document de stratégie Q3.", time: "Hier 16:20", isMine: false },
      { id: 2, sender: "Marie Lambert", content: "Nouveau document partagé : Stratégie Q3", time: "Hier 16:20", isMine: false },
    ],
  },
  {
    id: 4,
    name: "Lucas Bernard",
    lastMessage: "OK merci pour l'update",
    time: "Hier",
    unread: 0,
    online: false,
    messages: [
      { id: 1, sender: "Lucas Bernard", content: "La campagne marketing est lancée !", time: "Hier 14:00", isMine: false },
      { id: 2, sender: "Moi", content: "Parfait, tiens-moi au courant des résultats.", time: "Hier 14:05", isMine: true },
      { id: 3, sender: "Lucas Bernard", content: "OK merci pour l'update", time: "Hier 14:10", isMine: false },
    ],
  },
];

export default function MessagesPage() {
  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");

  const handleSend = () => {
    if (!messageInput.trim()) return;
    setMessageInput("");
  };

  return (
    <div className="h-[calc(100vh-8rem)] animate-fade-in-up">
      <Card className="h-full overflow-hidden">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-80 border-r border-border/50 flex flex-col shrink-0">
            <div className="p-4 border-b border-border/50">
              <h2 className="text-lg font-semibold mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-9 h-9" />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/30 border-b border-border/30",
                    activeConv.id === conv.id && "bg-muted/50"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {conv.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    {conv.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{conv.name}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{conv.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="ml-auto shrink-0 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {conv.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {activeConv.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  {activeConv.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{activeConv.name}</p>
                  <p className="text-xs text-muted-foreground">{activeConv.online ? "En ligne" : "Hors ligne"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon-sm"><Video className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {activeConv.messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.isMine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-[16px] px-4 py-2.5",
                      msg.isMine
                        ? "bg-primary text-primary-foreground rounded-tr-[4px]"
                        : "bg-muted text-foreground rounded-tl-[4px]"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={cn("text-[10px] mt-1", msg.isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm"><Paperclip className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon-sm"><Image className="h-4 w-4" /></Button>
                <div className="relative flex-1">
                  <Input
                    placeholder="Écrivez votre message..."
                    className="pr-10"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <Button variant="ghost" size="icon-sm" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={handleSend}>
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="icon-sm" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
