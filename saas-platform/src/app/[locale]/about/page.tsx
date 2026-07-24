"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Menu,
  X,
  Shield,
  Zap,
  Globe,
  Users,
  Building2,
  Heart,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Bot,
  Star,
  Target,
  Eye,
  Compass,
  Rocket,
  Handshake,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";

/* ───── Scroll Animation ───── */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function getLocale(): string {
  if (typeof window === "undefined") return "fr";
  return window.location.pathname.split("/")[1] || "fr";
}

function localePath(path: string): string {
  return `/${getLocale()}${path}`;
}

/* ───── Navigation ───── */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const tl = useTranslations("landing");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: tl("navFeatures"), href: localePath("/features") },
    { label: tl("navModules"), href: localePath("/#modules") },
    { label: tl("navAbout"), href: localePath("/about") },
    { label: tl("navContact"), href: localePath("/contact") },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm" : "bg-transparent"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <a href={localePath("/")} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-[12px] blur-sm group-hover:blur-md transition-all" />
              <img src="/omnicore-logo.png" alt="OmniCore" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-[12px] object-contain shadow-sm" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight text-foreground">OmniCore</span>
              <span className="ml-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">ERP</span>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[8px] hover:bg-accent/50 transition-all duration-200">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href={localePath("/login")}>{tl("signIn")}</a>
            </Button>
            <Button size="sm" asChild className="gap-1.5 shadow-lg shadow-primary/20">
              <a href={localePath("/signup")}>{tl("getStarted")} <ArrowRight className="h-3.5 w-3.5" /></a>
            </Button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden flex items-center justify-center h-10 w-10 rounded-[10px] hover:bg-accent transition-colors">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={cn("lg:hidden transition-all duration-300 overflow-hidden", mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[10px] hover:bg-accent transition-colors">
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild className="w-full justify-center"><a href={localePath("/login")}>{tl("signIn")}</a></Button>
            <Button size="sm" asChild className="w-full justify-center gap-1.5"><a href={localePath("/signup")}>{tl("getStarted")} <ArrowRight className="h-3.5 w-3.5" /></a></Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ───── Hero ───── */
function AboutHero() {
  const t = useTranslations("marketing");
  return (
    <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-emerald-500/5 to-primary/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <a href={localePath("/")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              {t("backToHome")}
            </a>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
              <Building2 className="h-4 w-4" />
              <span>{t("aboutBadge")}</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("aboutTitle1")}
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {t("aboutTitle2")}
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t("aboutDescription")}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ───── Mission & Vision ───── */
function MissionVision() {
  const t = useTranslations("marketing");
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-8">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[20px] border border-primary/20 bg-gradient-to-br from-card to-card/80 p-8 sm:p-10 h-full">
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-gradient-to-br from-primary to-blue-600 text-white mb-6 shadow-lg">
                  <Target className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold mb-4">{t("missionTitle")}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("missionDescription")}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[t("missionTag1"), t("missionTag2"), t("missionTag3")].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="relative overflow-hidden rounded-[20px] border border-purple-500/20 bg-gradient-to-br from-card to-card/80 p-8 sm:p-10 h-full">
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-6 shadow-lg">
                  <Eye className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold mb-4">{t("visionTitle")}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("visionDescription")}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[t("visionTag1"), t("visionTag2")].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ───── Values ───── */
function Values() {
  const t = useTranslations("marketing");
  const values = [
    { icon: Lightbulb, title: t("value1Title"), desc: t("value1Desc"), gradient: "from-amber-500 to-amber-600" },
    { icon: Handshake, title: t("value2Title"), desc: t("value2Desc"), gradient: "from-emerald-500 to-emerald-600" },
    { icon: Heart, title: t("value3Title"), desc: t("value3Desc"), gradient: "from-rose-500 to-rose-600" },
    { icon: Users, title: t("value4Title"), desc: t("value4Desc"), gradient: "from-blue-500 to-blue-600" },
    { icon: Globe, title: t("value5Title"), desc: t("value5Desc"), gradient: "from-purple-500 to-purple-600" },
    { icon: Rocket, title: t("value6Title"), desc: t("value6Desc"), gradient: "from-cyan-500 to-cyan-600" },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
              <Compass className="h-4 w-4" />
              <span>{t("valuesBadge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t("valuesTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("valuesDescription")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <ScrollReveal key={value.title} delay={index * 80}>
              <div className="group relative overflow-hidden rounded-[20px] border border-border/40 bg-card p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-[12px] bg-gradient-to-br text-white mb-5 shadow-lg group-hover:scale-110 transition-all duration-300", value.gradient)}>
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: value.desc }} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Location ───── */
function Location() {
  const t = useTranslations("marketing");
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
                <MapPin className="h-4 w-4" />
                <span>{t("locationBadge")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                {t("locationTitle")}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                {t("locationDescription1")}
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
                {t("locationDescription2")}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-[12px] bg-card border border-border/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("addressLabel")}</p>
                    <p className="text-xs text-muted-foreground">Kalemie, Tanganyika, RDC</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-[12px] bg-card border border-border/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-500/10 text-emerald-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("emailLabel")}</p>
                    <p className="text-xs text-muted-foreground">contact@omnicore.site</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-[12px] bg-card border border-border/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-blue-500/10 text-blue-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("phoneLabel")}</p>
                    <p className="text-xs text-muted-foreground">+243 XX XXX XXXX</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-purple-500/15 border border-border/30 shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="absolute -inset-3 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[24px] blur-lg" />
                        <img src="/omnicore-logo.png" alt="OmniCore" className="relative h-24 w-24 rounded-[20px] object-contain shadow-lg ring-1 ring-border/20" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">OmniCore</h3>
                    <p className="text-muted-foreground mt-2">{t("locationTagline")}</p>
                    <div className="mt-6 flex justify-center gap-3">
                      {["RDC", "Afrique", "Monde"].map((label) => (
                        <span key={label} className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border border-primary/20">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ───── CTA ───── */
function CTASection() {
  const t = useTranslations("marketing");
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>{t("ctaBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            {t("ctaTitle")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            {t("ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild className="gap-2 w-full sm:w-auto shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90">
              <a href={localePath("/signup")}>{t("ctaButton")} <ArrowRight className="h-5 w-5" /></a>
            </Button>
            <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
              <a href={localePath("/contact")}>{t("ctaContact")}</a>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ───── Footer ───── */
function Footer() {
  const currentYear = new Date().getFullYear();
  const tf = useTranslations("landing");
  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-[10px] blur-sm" />
                <img src="/omnicore-logo.png" alt="OmniCore" className="relative h-9 w-9 rounded-[10px] object-contain" />
              </div>
              <span className="text-lg font-bold">OmniCore</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {tf("footerDescription")}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">{tf("footerProduct")}</h4>
            <ul className="space-y-2.5">
              {[{ label: tf("footerFeatures"), href: localePath("/features") }, { label: tf("footerModules"), href: localePath("/#modules") }, { label: tf("footerPricing"), href: localePath("/pricing") }].map((link) => (
                <li key={link.label}><a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">{tf("footerCompany")}</h4>
            <ul className="space-y-2.5">
              {[{ label: tf("footerAbout"), href: localePath("/about") }, { label: tf("footerContact"), href: localePath("/contact") }, { label: tf("footerPrivacy"), href: localePath("/privacy") }].map((link) => (
                <li key={link.label}><a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground">&copy; {currentYear} OmniCore. {tf("footerAllRights")}</p>
        </div>
      </div>
    </footer>
  );
}

/* ───── Page ───── */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <AboutHero />
      <MissionVision />
      <Values />
      <Location />
      <CTASection />
      <Footer />
    </div>
  );
}
