"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight, Menu, X, CheckCircle, Sparkles, ArrowLeft, Zap, Crown, Building2,
} from "lucide-react";

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
    <div ref={ref} className={cn("transition-all duration-700", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", className)} style={{ transitionDelay: `${delay}ms` }}>
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

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const navLinks = [
    { label: "Fonctionnalités", href: localePath("/features") },
    { label: "Modules", href: localePath("/#modules") },
    { label: "À propos", href: localePath("/about") },
    { label: "Contact", href: localePath("/contact") },
  ];
  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-500", scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm" : "bg-transparent")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <a href={localePath("/")} className="flex items-center gap-3 group">
            <div className="relative"><div className="absolute inset-0 bg-primary/20 rounded-[12px] blur-sm group-hover:blur-md transition-all" /><img src="/omnicore-logo.png" alt="OmniCore" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-[12px] object-contain shadow-sm" /></div>
            <div className="hidden sm:block"><span className="text-lg font-bold tracking-tight text-foreground">OmniCore</span><span className="ml-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">ERP</span></div>
          </a>
          <div className="hidden lg:flex items-center gap-1">{navLinks.map((l) => (<a key={l.label} href={l.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[8px] hover:bg-accent/50 transition-all duration-200">{l.label}</a>))}</div>
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><a href={localePath("/login")}>Se connecter</a></Button>
            <Button size="sm" asChild className="gap-1.5 shadow-lg shadow-primary/20"><a href={localePath("/signup")}>Commencer <ArrowRight className="h-3.5 w-3.5" /></a></Button>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden flex items-center justify-center h-10 w-10 rounded-[10px] hover:bg-accent transition-colors">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className={cn("lg:hidden transition-all duration-300 overflow-hidden", mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {navLinks.map((l) => (<a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[10px] hover:bg-accent transition-colors">{l.label}</a>))}
          <div className="pt-3 flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild className="w-full justify-center"><a href={localePath("/login")}>Se connecter</a></Button>
            <Button size="sm" asChild className="w-full justify-center gap-1.5"><a href={localePath("/signup")}>Commencer <ArrowRight className="h-3.5 w-3.5" /></a></Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

const PLANS = [
  {
    name: "Gratuit",
    desc: "Parfait pour démarrer",
    price: "0",
    period: "/mois",
    icon: Zap,
    gradient: "from-emerald-500 to-emerald-600",
    popular: false,
    features: ["1 utilisateur", "1 organisation", "Module au choix", "Support par email", "1 Go de stockage", "Rapports de base"],
    cta: "Commencer gratuitement",
  },
  {
    name: "Professionnel",
    desc: "Pour les équipes en croissance",
    price: "29",
    period: "/mois",
    icon: Crown,
    gradient: "from-primary to-blue-600",
    popular: true,
    features: ["10 utilisateurs", "3 organisations", "Tous les modules", "Support prioritaire", "10 Go de stockage", "Rapports avancés", "Assistant IA", "APIs complètes", "Audit trail"],
    cta: "Choisir Pro",
  },
  {
    name: "Entreprise",
    desc: "Pour les grandes organisations",
    price: "Sur devis",
    period: "",
    icon: Building2,
    gradient: "from-purple-500 to-purple-600",
    popular: false,
    features: ["Utilisateurs illimités", "Organisations illimitées", "Tous les modules", "Support dédié 24/7", "Stockage illimité", "Rapports personnalisés", "IA avancée", "Intégrations sur mesure", "SLA garanti", "Déploiement on-premise"],
    cta: "Contacter les ventes",
  },
];

function PricingHero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-emerald-500/5 to-primary/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <a href={localePath("/")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"><ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil</a>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
              <Sparkles className="h-4 w-4" /><span>Tarification</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Des tarifs
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">transparents</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Commencez gratuitement. Passez à un plan supérieur quand vous êtes prêt.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function PricingCards() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 100}>
              <div className={cn(
                "relative overflow-hidden rounded-[20px] border p-8 h-full flex flex-col",
                plan.popular
                  ? "border-primary shadow-xl shadow-primary/10 bg-gradient-to-br from-card to-primary/5"
                  : "border-border/40 bg-card hover:shadow-lg"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-semibold rounded-bl-[12px]">
                    Populaire
                  </div>
                )}
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-[12px] bg-gradient-to-br text-white mb-5 shadow-lg", plan.gradient)}>
                  <plan.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <div className="mb-6">
                  {plan.price !== "Sur devis" ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold">{plan.price}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  asChild
                  className={cn(
                    "w-full gap-2",
                    plan.popular && "shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90"
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <a href={plan.name === "Entreprise" ? localePath("/contact") : localePath("/signup")}>
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative"><div className="absolute inset-0 bg-primary/20 rounded-[10px] blur-sm" /><img src="/omnicore-logo.png" alt="OmniCore" className="relative h-9 w-9 rounded-[10px] object-contain" /></div>
              <span className="text-lg font-bold">OmniCore</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">Plateforme ERP cloud moderne pour les organisations de toutes tailles.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Produit</h4>
            <ul className="space-y-2.5">
              {[{ label: "Fonctionnalités", href: localePath("/features") }, { label: "Modules", href: localePath("/#modules") }, { label: "Tarifs", href: localePath("/pricing") }].map((l) => (
                <li key={l.label}><a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Entreprise</h4>
            <ul className="space-y-2.5">
              {[{ label: "À propos", href: localePath("/about") }, { label: "Contact", href: localePath("/contact") }, { label: "Confidentialité", href: localePath("/privacy") }].map((l) => (
                <li key={l.label}><a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground">&copy; {currentYear} OmniCore. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <PricingHero />
      <PricingCards />
      <Footer />
    </div>
  );
}
