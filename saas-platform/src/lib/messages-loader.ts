const messageCache = new Map<string, Record<string, any>>();

const messageModules: Record<string, () => Promise<{ default: Record<string, any> }>> = {
  fr: () => import("../../messages/fr.json"),
  en: () => import("../../messages/en.json"),
  sw: () => import("../../messages/sw.json"),
};

export async function loadMessages(locale: string): Promise<Record<string, any>> {
  if (messageCache.has(locale)) return messageCache.get(locale)!;
  const loader = messageModules[locale];
  if (!loader) {
    const fallback = await messageModules.en();
    return fallback.default;
  }
  const mod = await loader();
  messageCache.set(locale, mod.default);
  return mod.default;
}
