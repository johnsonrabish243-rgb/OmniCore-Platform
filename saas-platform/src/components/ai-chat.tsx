"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Loader2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

const CSRF_HEADERS = { "X-Requested-With": "XMLHttpRequest", "Content-Type": "application/json" };

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface AIChatProps {
  position?: "bottom-right" | "bottom-left";
}

function getGreeting(firstName?: string): string {
  if (firstName) {
    return `Bonjour ${firstName} ! 👋 Je suis OmniCore AI, votre assistant intelligent. Comment puis-je vous aider aujourd'hui ?`;
  }
  return `Bonjour ! 👋 Je suis OmniCore AI, votre assistant intelligent. Comment puis-je vous aider aujourd'hui ?`;
}

export function AIChat({
  position = "bottom-right",
}: AIChatProps) {
  const t = useTranslations("ai");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/session", { headers: CSRF_HEADERS })
      .then(r => r.json().catch(() => ({})))
      .then(data => {
        if (data?.user) {
          setUserInfo(data.user);
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: getGreeting(data.user.firstName),
          }]);
        } else {
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: t("welcomeMessage"),
          }]);
        }
      })
      .catch(() => {
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: t("welcomeMessage"),
        }]);
      });
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: input.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: CSRF_HEADERS,
          body: JSON.stringify({
            locale,
            messages: [...messages, userMessage].map(({ role, content }) => ({
              role,
              content,
            })),
          }),
        });

        if (res.status === 429) {
          const data = await res.json();
          setRateLimited(true);
          setMessages((prev) => [
            ...prev,
            {
              id: `rate-limited-${Date.now()}`,
              role: "assistant",
              content: data.error || t("errorMessage"),
            },
          ]);
          setTimeout(() => setRateLimited(false), 60000);
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: errData.error || t("errorMessage"),
            },
          ]);
          return;
        }

        const data = await res.json();
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content || "",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: t("errorMessage"),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  // Quick action buttons
  const quickActions = [
    { label: t("quickActionDashboard"), prompt: t("quickActionDashboardPrompt") },
    { label: t("quickActionHR"), prompt: t("quickActionHRPrompt") },
    { label: t("quickActionInvoicing"), prompt: t("quickActionInvoicingPrompt") },
    { label: t("quickActionStock"), prompt: t("quickActionStockPrompt") },
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={cn(
          "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group",
          position === "bottom-right" ? "bottom-6 right-6" : "bottom-6 left-6",
          isOpen ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100"
        )}
        style={{
          background: "linear-gradient(135deg, #2563EB, #7C3AED)",
          boxShadow: "0 0 20px rgba(37,99,235,0.3), 0 0 40px rgba(124,58,237,0.15)",
        }}
      >
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }} />
        <Bot className="h-6 w-6 text-white relative z-10 group-hover:animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
        </span>
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed z-50 bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-300",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="flex flex-col rounded-[16px] border border-border/50 bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-purple-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm overflow-hidden">
                <img src="/omnicore-logo.png" alt="OmniCore" className="h-6 w-6 object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t("assistantTitle")}</h3>
                <p className="text-[10px] text-white/70">{t("assistantSubtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isMinimized && "rotate-180"
                  )}
                />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2.5 max-w-[85%] animate-fade-in-up",
                      msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-[14px] px-3.5 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 border border-border/30"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        U
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 max-w-[85%]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-[14px] px-3.5 py-2.5 bg-muted/50 border border-border/30">
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{t("thinking")}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2">
                  <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">
                    {t("quickActions")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          setInput(action.prompt);
                          inputRef.current?.focus();
                        }}
                        className="text-[11px] px-2.5 py-1.5 rounded-full border border-border/50 bg-muted/30 hover:bg-muted hover:border-primary/30 transition-all"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-border/30 p-3">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("inputPlaceholder")}
                    className="flex-1 h-9 text-sm rounded-[10px] border-border/50"
                    disabled={isLoading}
                  />
                  {rateLimited && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 mr-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Limite atteinte</span>
                    </div>
                  )}
                  <Button
                    type="submit"
                    size="icon-sm"
                    disabled={isLoading || rateLimited || !input.trim()}
                    className="shrink-0 rounded-[10px]"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                <p className="text-[9px] text-muted-foreground/50 text-center mt-1.5 leading-relaxed px-2">
                  Powered by <span className="font-semibold">OmniCore</span> AI · &copy; 2026 OmniCore<br />
                  <span>Developed by John Mocket</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
