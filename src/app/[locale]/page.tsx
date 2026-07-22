"use client";

import { useState, useEffect, useRef } from "react";
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
  Layers,
  ShoppingCart,
  GraduationCap,
  Heart,
  Sparkles,
  Lock,
  Cloud,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Bot,
  Star,
  CheckCircle,
  Server,
  Award,
  HeadphonesIcon,
} from "lucide-react";

/* ───── SVG Icons ───── */
function SocialGithub({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
function SocialLinkedin({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function SocialTwitter({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

/* ───── Scroll Animation Hook ───── */
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

/* ───── Get locale helper ───── */
function getLocale(): string {
  if (typeof window === "undefined") return "fr";
  return window.location.pathname.split("/")[1] || "fr";
}

function localePath(path: string): string {
  const locale = getLocale();
  return `/${locale}${path}`;
}

/* ───── Navigation ───── */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Fonctionnalités", href: localePath("/features") },
    { label: "Modules", href: "#modules" },
    { label: "À propos", href: localePath("/about") },
    { label: "Contact", href: localePath("/contact") },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <a href={localePath("/")} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-[12px] blur-sm group-hover:blur-md transition-all" />
              <img
                src="/omnicore-logo.png"
                alt="OmniCore"
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-[12px] object-contain shadow-sm"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight text-foreground">OmniCore</span>
              <span className="ml-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                ERP
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-[8px] transition-all duration-200",
                  link.href.startsWith("#")
                    ? "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href={localePath("/login")}>Se connecter</a>
            </Button>
            <Button size="sm" asChild className="gap-1.5 shadow-lg shadow-primary/20">
              <a href={localePath("/signup")}>
                Commencer
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-center h-10 w-10 rounded-[10px] hover:bg-accent transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden transition-all duration-300 overflow-hidden",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[10px] hover:bg-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild className="w-full justify-center">
              <a href={localePath("/login")}>Se connecter</a>
            </Button>
            <Button size="sm" asChild className="w-full justify-center gap-1.5">
              <a href={localePath("/signup")}>
                Commencer
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ───── Hero Section ───── */
function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-1/4 -right-20 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl"
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
        />
        <div
          className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-500/5 to-primary/10 blur-3xl"
          style={{ transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)` }}
        />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37, 99, 235, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-fade-in-up shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Plateforme ERP Nouvelle Génération</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] animate-fade-in-up delay-100">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Gérez Votre Entreprise
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
              depuis une Seule Plateforme
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground animate-fade-in-up delay-200">
            OmniCore intègre RH, Finance, Pharmacie, Éducation, Commerce et plus dans un cloud ERP 
            sécurisé, conçu pour les organisations modernes africaines et internationales.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300">
            <Button size="xl" asChild className="gap-2 w-full sm:w-auto shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300">
              <a href={localePath("/signup")}>
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
              <a href={localePath("/contact")}>Demander une démo</a>
            </Button>
            <Button variant="ghost" size="xl" asChild className="w-full sm:w-auto">
              <a href={localePath("/login")}>Se connecter</a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 w-full max-w-4xl animate-fade-in-up delay-400">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 border-y border-border/40 py-8">
              {[
                { icon: Shield, label: "Sécurité Maximale", desc: "Chiffrement AES-256" },
                { icon: Cloud, label: "100% Cloud", desc: "Accessible partout" },
                { icon: Zap, label: "Performance", desc: "Temps réel" },
                { icon: Globe, label: "Multi-langue", desc: "FR, EN, SW" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground/60">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── ERP Module Cards ───── */
const ERP_MODULES = [
  {
    id: "hr",
    name: "Ressources Humaines",
    short: "RH",
    desc: "Gestion complète des employés, paie, congés, présences et évaluations de performance.",
    benefits: ["Paie automatisée", "Suivi des présences", "Portail employé"],
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
    lightGradient: "from-blue-500/10 to-blue-600/5",
    textColor: "text-blue-500",
    borderColor: "border-blue-500/20",
    href: "/signup?workspace=hr",
  },
  {
    id: "finance",
    name: "Finance & Comptabilité",
    short: "Finance",
    desc: "Comptabilité, budgets, facturation, suivi des dépenses et reporting financier en temps réel.",
    benefits: ["Comptabilité intégrée", "Budgets & prévisions", "Reporting automatique"],
    icon: DollarSign,
    gradient: "from-emerald-500 to-emerald-600",
    lightGradient: "from-emerald-500/10 to-emerald-600/5",
    textColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
    href: "/signup?workspace=finance",
  },
  {
    id: "healthcare",
    name: "Santé & Pharmacie",
    short: "Santé",
    desc: "Gestion des patients, rendez-vous, médicaments, stocks pharmaceutiques et personnel médical.",
    benefits: ["Dossier patient", "Gestion des stocks", "Alertes péremption"],
    icon: Heart,
    gradient: "from-rose-500 to-rose-600",
    lightGradient: "from-rose-500/10 to-rose-600/5",
    textColor: "text-rose-500",
    borderColor: "border-rose-500/20",
    href: "/signup?workspace=healthcare",
  },
  {
    id: "education",
    name: "Éducation",
    short: "Éducation",
    desc: "Gestion scolaire complète : étudiants, enseignants, classes, notes et emplois du temps.",
    benefits: ["Notes & bulletins", "Emplois du temps", "Communication parents"],
    icon: GraduationCap,
    gradient: "from-purple-500 to-purple-600",
    lightGradient: "from-purple-500/10 to-purple-600/5",
    textColor: "text-purple-500",
    borderColor: "border-purple-500/20",
    href: "/signup?workspace=education",
  },
  {
    id: "commerce",
    name: "Commerce & Inventaire",
    short: "Commerce",
    desc: "Ventes, achats, gestion des stocks, entrepôts, commandes fournisseurs et catalogue produits.",
    benefits: ["Point de vente", "Stock temps réel", "Multi-entrepôts"],
    icon: ShoppingCart,
    gradient: "from-amber-500 to-amber-600",
    lightGradient: "from-amber-500/10 to-amber-600/5",
    textColor: "text-amber-500",
    borderColor: "border-amber-500/20",
    href: "/signup?workspace=commerce",
  },
];

function ModuleCard({ mod, index }: { mod: typeof ERP_MODULES[0]; index: number }) {
  return (
    <ScrollReveal delay={index * 100}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-[20px] border p-6 sm:p-8",
          "bg-gradient-to-br from-card to-card/80 hover:shadow-2xl hover:-translate-y-2",
          "transition-all duration-500",
          mod.borderColor
        )}
      >
        {/* Hover gradient overlay */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
          "bg-gradient-to-br", mod.lightGradient
        )} />

        {/* Icon */}
        <div className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-[14px] mb-5",
          "bg-gradient-to-br shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300",
          mod.gradient
        )}>
          <mod.icon className="h-7 w-7 text-white" />
        </div>

        {/* Content */}
        <div className="relative">
          <h3 className="text-xl font-bold mb-2">{mod.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{mod.desc}</p>

          {/* Benefits */}
          <ul className="space-y-2 mb-6">
            {mod.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm">
                <CheckCircle className={cn("h-4 w-4 shrink-0", mod.textColor)} />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button asChild className={cn(
            "w-full gap-2 transition-all duration-300",
            "shadow-lg hover:shadow-xl",
          )}>
            <a href={localePath(mod.href)}>
              Créer un espace {mod.short}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </ScrollReveal>
  );
}

function ModulesSection() {
  return (
    <section id="modules" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-muted/30">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
              <Layers className="h-4 w-4" />
              <span>Modules ERP</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              La Suite Complète pour Votre Organisation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Créez votre espace de travail et commencez à gérer vos opérations en quelques clics.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {ERP_MODULES.map((mod, index) => (
            <ModuleCard key={mod.id} mod={mod} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Why OmniCore ───── */
function WhyOmniCoreSection() {
  const benefits = [
    { icon: Cloud, title: "Cloud Natif", desc: "Infrastructure scalable, accessible 24/7 depuis n'importe où." },
    { icon: Shield, title: "Sécurité Enterprise", desc: "Chiffrement AES-256, RBAC, audit trail et conformité RGPD." },
    { icon: Bot, title: "Assistant IA", desc: "Intelligence artificielle intégrée pour automatiser vos tâches." },
    { icon: Globe, title: "Multi-langue", desc: "Interface complète en français, anglais et swahili." },
    { icon: TrendingUp, title: "Évolutif", desc: "De la PME à la multinationale, OmniCore grandit avec vous." },
    { icon: HeadphonesIcon, title: "Support Dédié", desc: "Équipe locale disponible pour vous accompagner." },
  ];

  return (
    <section id="features" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
              <Star className="h-4 w-4" />
              <span>Pourquoi OmniCore</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Conçu pour l&apos;Excellence Opérationnelle
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une plateforme robuste qui combine technologie de pointe et simplicité d&apos;utilisation.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <ScrollReveal key={benefit.title} delay={index * 60}>
              <div className="flex gap-4 p-5 rounded-[16px] border border-border/40 bg-card hover:bg-gradient-to-br hover:from-accent/30 hover:to-accent/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Trust & Enterprise Section ───── */
function TrustSection() {
  const stats = [
    { value: "99.9%", label: "Disponibilité", icon: Server },
    { value: "256-bit", label: "Chiffrement", icon: Lock },
    { value: "24/7", label: "Support", icon: HeadphonesIcon },
    { value: "ISO", label: "Conformité", icon: Award },
  ];

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
              <Shield className="h-4 w-4" />
              <span>Infrastructure Enterprise</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Une Infrastructure de Classe Mondiale
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Déployé sur une infrastructure cloud sécurisée avec les plus hauts standards de l&apos;industrie.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={index * 80}>
              <div className="flex flex-col items-center p-8 rounded-[20px] border border-border/40 bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <stat.icon className="h-7 w-7" />
                </div>
                <span className="text-3xl font-bold tracking-tight mb-1">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Final CTA ───── */
function CTASection() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Prêt à Démarrer ?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Créez Votre Espace de Travail
            <br />
            <span className="text-primary">Gratuitement</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Rejoignez les organisations qui modernisent leur gestion avec OmniCore.
            Commencez gratuitement, aucun engagement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild className="gap-2 w-full sm:w-auto shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90">
              <a href={localePath("/signup")}>
                Créer mon espace
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
              <a href={localePath("/contact")}>Contacter les ventes</a>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            <CheckCircle className="inline h-4 w-4 mr-1 text-emerald-500" />
            Essai gratuit de 14 jours · Sans carte bancaire · Sans engagement
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ───── Footer ───── */
function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Fonctionnalités", href: localePath("/features") },
    { label: "Modules", href: "#modules" },
    { label: "Tarifs", href: localePath("/pricing") },
    { label: "Documentation", href: "#" },
  ];

  const companyLinks = [
    { label: "À propos", href: localePath("/about") },
    { label: "Contact", href: localePath("/contact") },
    { label: "Tarifs", href: localePath("/pricing") },
  ];

  const legalLinks = [
    { label: "Confidentialité", href: localePath("/privacy") },
    { label: "Conditions", href: localePath("/terms") },
    { label: "Cookies", href: localePath("/cookies") },
  ];

  const moduleLinks = [
    { label: "Ressources Humaines", href: localePath("/signup?workspace=hr") },
    { label: "Finance", href: localePath("/signup?workspace=finance") },
    { label: "Santé & Pharmacie", href: localePath("/signup?workspace=healthcare") },
    { label: "Éducation", href: localePath("/signup?workspace=education") },
    { label: "Commerce", href: localePath("/signup?workspace=commerce") },
  ];

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-[10px] blur-sm" />
                <img
                  src="/omnicore-logo.png"
                  alt="OmniCore"
                  className="relative h-9 w-9 rounded-[10px] object-contain"
                />
              </div>
              <span className="text-lg font-bold">OmniCore</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              Plateforme ERP cloud moderne. Solutions de gestion intégrées 
              pour les organisations de toutes tailles.
            </p>
            <div className="flex gap-3">
              {[
                { icon: SocialGithub, href: "#" },
                { icon: SocialLinkedin, href: "#" },
                { icon: SocialTwitter, href: "#" },
                { icon: Globe, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-border/50 bg-card hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10 hover:text-primary hover:border-primary/30 transition-all"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Liens</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Entreprise</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Informations</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>Kalemie, Tanganyika, RDC</span>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span>contact@omnicore.cd</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} OmniCore. Développé par John Mocket. Tous droits réservés.
          </p>
          <div className="flex flex-wrap gap-4">
            {moduleLinks.slice(0, 3).map((link) => (
              <a key={link.label} href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ───── Main Landing Page ───── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      <HeroSection />

      <ModulesSection />

      <WhyOmniCoreSection />

      <TrustSection />

      <CTASection />

      <Footer />
    </div>
  );
}
