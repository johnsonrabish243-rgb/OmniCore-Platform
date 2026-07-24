"use client";

import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react";

type Messages = Record<string, any>;
type Locale = "fr" | "en" | "sw";

const FALLBACK_LOCALE: Locale = "en";
const STORAGE_KEY = "omnicore_locale";

const messageCache = new Map<Locale, Promise<Messages>>();
const loadedMessages = new Map<Locale, Messages>();

function loadMessages(locale: Locale): Promise<Messages> {
  if (loadedMessages.has(locale)) return Promise.resolve(loadedMessages.get(locale)!);
  if (!messageCache.has(locale)) {
    messageCache.set(
      locale,
      import(`../../messages/${locale}.json`).then((m) => {
        const msgs = m.default || m;
        loadedMessages.set(locale, msgs);
        return msgs;
      })
    );
  }
  return messageCache.get(locale)!;
}

function resolveNested(obj: any, path: string): string | null {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return null;
    current = current[key];
  }
  return typeof current === "string" ? current : null;
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return FALLBACK_LOCALE;
  const lang = navigator.language || "";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("sw")) return "sw";
  return FALLBACK_LOCALE;
}

function getSavedLocale(): Locale {
  if (typeof window === "undefined") return FALLBACK_LOCALE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "en" || saved === "sw") return saved;
  } catch {}
  return detectBrowserLocale();
}

function saveLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {}
}

export function getLocaleFromPath(): Locale {
  if (typeof window === "undefined") return FALLBACK_LOCALE;
  const parts = window.location.pathname.split("/");
  if (parts[1] === "fr" || parts[1] === "en" || parts[1] === "sw") return parts[1] as Locale;
  const saved = getSavedLocale();
  return saved;
}

interface I18nContextValue {
  locale: Locale;
  messages: Messages;
  t: (key: string, fallback?: string) => string;
  setLocale: (locale: Locale) => Promise<void>;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  locale: FALLBACK_LOCALE,
  messages: {},
  t: (key, fallback) => fallback || key,
  setLocale: async () => {},
  isLoading: false,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children, initialLocale, messages: initialMessages }: { children: ReactNode; initialLocale: Locale; messages: Messages }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Messages>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loadedMessages.has(initialLocale)) {
      setMessages(loadedMessages.get(initialLocale)!);
    } else {
      loadMessages(initialLocale).then(setMessages);
    }
  }, [initialLocale]);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setIsLoading(true);
    saveLocale(newLocale);
    const msgs = await loadMessages(newLocale);
    setMessages(msgs);
    setLocaleState(newLocale);
    document.documentElement.lang = newLocale;
    setIsLoading(false);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const val = resolveNested(messages, key);
      if (val !== null) return val;
      return fallback || key;
    },
    [messages]
  );

  return (
    <I18nContext.Provider value={{ locale, messages, t, setLocale, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export { loadMessages, getSavedLocale, saveLocale, detectBrowserLocale, FALLBACK_LOCALE };
export type { Locale, Messages };
