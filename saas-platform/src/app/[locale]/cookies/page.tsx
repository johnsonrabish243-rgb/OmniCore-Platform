"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, X, ArrowLeft, Cookie, Settings, BarChart3, Shield, Mail } from "lucide-react";

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={cn("transition-all duration-700", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function getLocale(): string { if (typeof window === "undefined") return "fr"; return window.location.pathname.split("/")[1] || "fr"; }
function localePath(path: string): string { return `/${getLocale()}${path}`; }

function LandingNav() {
  const tl = useTranslations("landing");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);
  const navLinks = [
    { label: tl("navFeatures"), href: localePath("/features") },
    { label: tl("navModules"), href: localePath("/#modules") },
    { label: tl("navAbout"), href: localePath("/about") },
    { label: tl("navContact"), href: localePath("/contact") },
  ];
  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-500", scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm" : "bg-transparent")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <a href={localePath("/")} className="flex items-center gap-3 group"><div className="relative"><div className="absolute inset-0 bg-primary/20 rounded-[12px] blur-sm group-hover:blur-md transition-all" /><img src="/omnicore-logo.png" alt="OmniCore" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-[12px] object-contain shadow-sm" /></div><div className="hidden sm:block"><span className="text-lg font-bold tracking-tight text-foreground">OmniCore</span></div></a>
          <div className="hidden lg:flex items-center gap-1">{navLinks.map((l) => (<a key={l.label} href={l.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[8px] hover:bg-accent/50 transition-all duration-200">{l.label}</a>))}</div>
          <div className="hidden lg:flex items-center gap-3"><Button variant="ghost" size="sm" asChild><a href={localePath("/login")}>{tl("signIn")}</a></Button><Button size="sm" asChild className="gap-1.5 shadow-lg shadow-primary/20"><a href={localePath("/signup")}>{tl("getStarted")} <ArrowRight className="h-3.5 w-3.5" /></a></Button></div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden flex items-center justify-center h-10 w-10 rounded-[10px] hover:bg-accent transition-colors">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      <div className={cn("lg:hidden transition-all duration-300 overflow-hidden", mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {navLinks.map((l) => (<a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[10px] hover:bg-accent transition-colors">{l.label}</a>))}
          <div className="pt-3 flex flex-col gap-2"><Button variant="outline" size="sm" asChild className="w-full justify-center"><a href={localePath("/login")}>{tl("signIn")}</a></Button><Button size="sm" asChild className="w-full justify-center gap-1.5"><a href={localePath("/signup")}>{tl("getStarted")} <ArrowRight className="h-3.5 w-3.5" /></a></Button></div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const tf = useTranslations("landing");
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3"><img src="/omnicore-logo.png" alt="OmniCore" className="h-8 w-8 rounded-[8px] object-contain" /><span className="font-bold">OmniCore</span></div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href={localePath("/privacy")} className="text-muted-foreground hover:text-foreground transition-colors">{tf("footerPrivacy")}</a>
            <a href={localePath("/terms")} className="text-muted-foreground hover:text-foreground transition-colors">{tf("footerTerms")}</a>
            <a href={localePath("/cookies")} className="text-muted-foreground hover:text-foreground transition-colors">{tf("footerCookies")}</a>
          </div>
          <p className="text-xs text-muted-foreground">&copy; {currentYear} OmniCore. {tf("footerAllRights")}</p>
        </div>
      </div>
    </footer>
  );
}

export default function CookiesPage() {
  const t = useTranslations("marketing");

  const cookieTypes = [
    {
      icon: Settings,
      title: t("cookiesEssentialTitle"),
      desc: t("cookiesEssentialDesc"),
      examples: [t("cookiesEssentialExample1"), t("cookiesEssentialExample2"), t("cookiesEssentialExample3")],
      required: true,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: BarChart3,
      title: t("cookiesAnalyticsTitle"),
      desc: t("cookiesAnalyticsDesc"),
      examples: [t("cookiesAnalyticsExample1"), t("cookiesAnalyticsExample2"), t("cookiesAnalyticsExample3")],
      required: false,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Settings,
      title: t("cookiesMarketingTitle"),
      desc: t("cookiesMarketingDesc"),
      examples: [t("cookiesMarketingExample1"), t("cookiesMarketingExample2"), t("cookiesMarketingExample3")],
      required: false,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10"><div className="absolute top-1/4 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl" /></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal><a href={localePath("/")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"><ArrowLeft className="h-4 w-4" /> {t("backToHome")}</a></ScrollReveal>
            <ScrollReveal delay={100}><div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm"><Cookie className="h-4 w-4" /><span>{t("cookiesBadge")}</span></div></ScrollReveal>
            <ScrollReveal delay={200}><h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">{t("cookiesTitle")}</h1></ScrollReveal>
            <ScrollReveal delay={300}><p className="mt-6 text-lg text-muted-foreground">{t("cookiesLastUpdated")} : {new Date().toLocaleDateString("fr-FR")}</p></ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="p-6 rounded-[16px] bg-primary/5 border border-primary/20 mb-12">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("cookiesIntro")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("cookiesWhatTitle")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("cookiesWhatDesc")}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t("cookiesWhatDesc2")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <h2 className="text-2xl font-bold mb-6">{t("cookiesTypesTitle")}</h2>
          </ScrollReveal>

          <div className="space-y-6 mb-12">
            {cookieTypes.map((type, i) => (
              <ScrollReveal key={type.title} delay={250 + i * 80}>
                <div className="rounded-[16px] border border-border/40 bg-card p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br text-white shadow-md", type.color)}>
                      <type.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{type.title}</h3>
                        {type.required && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {t("cookiesRequiredLabel")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{type.desc}</p>
                    </div>
                  </div>
                  <div className="ml-14">
                    <p className="text-xs font-medium text-muted-foreground mb-2">{t("cookiesExamples")}</p>
                    <div className="flex flex-wrap gap-2">
                      {type.examples.map((ex) => (
                        <span key={ex} className="px-2.5 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="rounded-[16px] border border-border/40 bg-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold">{t("cookiesManageTitle")}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {t("cookiesManageDesc")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("cookiesManageNote")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={500}>
            <div className="mt-12 p-6 rounded-[16px] bg-muted/50 border border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">{t("contactButton")}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("cookiesContactEmail")}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <Footer />
    </div>
  );
}
