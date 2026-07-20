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
  BarChart3,
  Users,
  Building2,
  Layers,
  Briefcase,
  ShoppingCart,
  Package,
  Pill,
  GraduationCap,
  Heart,
  FileText,
  Bell,
  Sparkles,
  Lock,
  Cloud,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  DollarSign,
  BookOpen,
  Activity,
  ClipboardCheck,
  Bot,
  Eye,
  Star,
} from "lucide-react";

// Custom SVG icons
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
function useScrollReveal(threshold = 0.15) {
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

/* ───── Navigation ───── */
function LandingNav({ onGetStarted, onSignIn }: { onGetStarted: () => void; onSignIn: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Modules", href: "#modules" },
    { label: "À propos", href: "#about" },
    { label: "Contact", href: "#contact" },
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
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-[12px] blur-sm" />
              <img
                src="/omnicore-logo.png"
                alt="OmniCore Logo"
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-[12px] object-contain shadow-sm"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight text-foreground">OmniCore</span>
              <span className="ml-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                ERP Suite
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-[8px] hover:bg-accent/50"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onSignIn}>
              Se connecter
            </Button>
            <Button size="sm" onClick={onGetStarted} className="gap-1.5 shadow-lg shadow-primary/20">
              Commencer
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-center h-10 w-10 rounded-[10px] hover:bg-accent transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden transition-all duration-300 overflow-hidden",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[10px] hover:bg-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={onSignIn} className="w-full justify-center">
              Se connecter
            </Button>
            <Button size="sm" onClick={onGetStarted} className="w-full justify-center gap-1.5">
              Commencer
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ───── Hero Section ───── */
function HeroSection({ onGetStarted, onSignIn }: { onGetStarted: () => void; onSignIn: () => void }) {
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
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-1/4 -right-20 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl"
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
        />
        <div
          className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-500/5 to-primary/10 blur-3xl"
          style={{ transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)` }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-primary/3 blur-3xl" />
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37, 99, 235, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Floating orbs */}
        <div className="absolute top-[15%] left-[10%] h-3 w-3 rounded-full bg-primary/30 animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute top-[30%] right-[15%] h-2 w-2 rounded-full bg-purple-500/30 animate-pulse" style={{ animationDuration: "3s" }} />
        <div className="absolute bottom-[25%] left-[20%] h-2.5 w-2.5 rounded-full bg-emerald-500/20 animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute bottom-[35%] right-[25%] h-3.5 w-3.5 rounded-full bg-amber-500/20 animate-pulse" style={{ animationDuration: "3.5s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-fade-in-up shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Plateforme ERP Nouvelle Génération</span>
          </div>

          <div className="mb-8 animate-fade-in-up delay-100">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[28px] blur-xl" />
              <img
                src="/omnicore-logo.png"
                alt="OmniCore"
                className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-[20px] object-contain shadow-2xl ring-1 ring-border/20"
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl animate-fade-in-up delay-200 leading-[1.1]">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              La Plateforme de Gestion
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Intelligente pour Votre Entreprise
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground animate-fade-in-up delay-300">
            OmniCore est une solution ERP cloud moderne qui intègre l&apos;ensemble de vos processus métier
            — RH, Finance, Commerce, Pharmacie, Éducation, Santé et plus — dans une plateforme unique,
            sécurisée et intelligente.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-400">
            <Button size="xl" onClick={onGetStarted} className="gap-2 w-full sm:w-auto shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300">
              Commencer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="glass" size="xl" onClick={onSignIn} className="w-full sm:w-auto">
              Se connecter
            </Button>
            <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
              <a href="#features">
                En savoir plus
              </a>
            </Button>
            <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
              <a href="#contact">
                Nous contacter
              </a>
            </Button>
          </div>

          <div className="mt-16 w-full max-w-4xl animate-fade-in-up delay-500">
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

          <div className="mt-16 animate-floating">
            <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
              <span className="text-xs font-medium uppercase tracking-widest">Découvrir</span>
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── About Section ───── */
function AboutSection() {
  return (
    <section id="about" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
                <Building2 className="h-4 w-4" />
                <span>À propos d&apos;OmniCore</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Une entreprise innovante
                <br />
                <span className="text-primary">au cœur de l&apos;Afrique</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                Basée à <strong>Kalemie</strong>, dans la province du <strong>Tanganyika</strong> en
                République Démocratique du Congo, OmniCore est une startup technologique spécialisée
                dans le développement de solutions logicielles modernes pour la gestion d&apos;entreprise.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                Notre mission est de démocratiser l&apos;accès aux outils de gestion performants pour
                les organisations de toutes tailles, en proposant une plateforme ERP complète,
                accessible, sécurisée et adaptée aux réalités locales et internationales.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Nous croyons en la puissance de la technologie pour transformer les entreprises
                africaines et les aider à rivaliser à l&apos;échelle mondiale grâce à des solutions
                digitales intégrées et innovantes.
              </p>

              <div className="mt-8 flex items-start gap-4 p-5 rounded-[16px] bg-gradient-to-br from-accent/50 to-accent/30 border border-border/40 hover:shadow-md transition-all duration-300">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">📍 Kalemie, Tanganyika, RDC</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Notre siège est situé dans la ville de Kalemie, au bord du lac Tanganyika,
                    au cœur de la province du Tanganyika en République Démocratique du Congo.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-purple-500/15 border border-border/30 shadow-xl group">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="absolute -inset-3 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[24px] blur-lg" />
                        <img
                          src="/omnicore-logo.png"
                          alt="OmniCore"
                          className="relative h-24 w-24 rounded-[20px] object-contain shadow-lg ring-1 ring-border/20"
                        />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">OmniCore</h3>
                    <p className="text-muted-foreground mt-2">Innovation depuis Kalemie</p>
                    <div className="mt-6 flex justify-center gap-3">
                      {["RDC", "Afrique", "Monde"].map((label) => (
                        <span
                          key={label}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border border-primary/20"
                        >
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

/* ───── Features (What We Do) Section ───── */
function WhatWeDoSection() {
  const services = [
    { icon: Users, title: "Ressources Humaines", desc: "Gestion complète des employés, contrats, congés, paie et évaluations de performance." },
    { icon: DollarSign, title: "Finance & Comptabilité", desc: "Comptabilité générale, budgets, facturation, suivi des dépenses et reporting financier." },
    { icon: ClipboardCheck, title: "Paie & Payroll", desc: "Calcul automatique des salaires, cotisations sociales, fiches de paie et déclarations." },
    { icon: Package, title: "Inventaire & Entrepôts", desc: "Suivi des stocks, gestion des entrepôts, réapprovisionnement et inventaire en temps réel." },
    { icon: Pill, title: "Gestion Pharmacie", desc: "Médicaments, mouvements de stock, alertes de péremption et gestion des fournisseurs." },
    { icon: GraduationCap, title: "Gestion Scolaire", desc: "Étudiants, enseignants, classes, notes, emplois du temps et communication." },
    { icon: Heart, title: "Santé & Patients", desc: "Dossiers patients, rendez-vous, personnel médical et suivi des traitements." },
    { icon: Briefcase, title: "CRM & Clients", desc: "Gestion de la relation client, prospects, opportunités et suivi commercial." },
    { icon: Building2, title: "Fournisseurs & Achats", desc: "Gestion des fournisseurs, appels d'offres, bons de commande et approvisionnements." },
    { icon: ShoppingCart, title: "Ventes & Commerce", desc: "Point de vente, commandes clients, facturation, devis et catalogue produits." },
    { icon: BarChart3, title: "Rapports & Analytique", desc: "Tableaux de bord personnalisés, rapports détaillés et indicateurs de performance." },
    { icon: Shield, title: "Sécurité & Contrôle", desc: "Contrôle d'accès basé sur les rôles, audit trail, conformité et protection des données." },
    { icon: Layers, title: "Multi-Workspace", desc: "Gestion multi-organisations, espaces de travail séparés et environnements isolés." },
    { icon: Activity, title: "Monitoring Temps Réel", desc: "Surveillance en direct des activités, alertes intelligentes et notifications." },
    { icon: Bot, title: "Assistant IA", desc: "Intelligence artificielle intégrée avec protection contre les injections SQL, NoSQL et malwares." },
    { icon: Globe, title: "Business Intelligence", desc: "Analyse prédictive, visualisation des données et aide à la décision stratégique." },
  ];

  return (
    <section id="features" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-primary/3 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
              <Zap className="h-4 w-4" />
              <span>Nos Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Une Solution ERP Complète
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              OmniCore intègre l&apos;ensemble de vos processus métier dans une plateforme unique,
              connectée et intelligente.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, index) => (
            <ScrollReveal key={service.title} delay={index * 50}>
              <div
                className="group p-5 rounded-[16px] border border-border/50 bg-card hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary mb-3 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-purple-500 group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                  <service.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{service.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Modules Section ───── */
function ModulesSection() {
  const modules = [
    { icon: Users, name: "Ressources Humaines", desc: "Gestion complète du personnel", color: "from-blue-500/10 to-blue-600/5 text-blue-500" },
    { icon: DollarSign, name: "Finance", desc: "Gestion financière intégrée", color: "from-emerald-500/10 to-emerald-600/5 text-emerald-500" },
    { icon: BookOpen, name: "Comptabilité", desc: "Comptabilité et reporting", color: "from-teal-500/10 to-teal-600/5 text-teal-500" },
    { icon: Package, name: "Inventaire", desc: "Suivi des stocks en temps réel", color: "from-amber-500/10 to-amber-600/5 text-amber-500" },
    { icon: ShoppingCart, name: "Commerce", desc: "Ventes et e-commerce", color: "from-orange-500/10 to-orange-600/5 text-orange-500" },
    { icon: GraduationCap, name: "Gestion Scolaire", desc: "Établissements éducatifs", color: "from-purple-500/10 to-purple-600/5 text-purple-500" },
    { icon: Pill, name: "Pharmacie", desc: "Gestion pharmaceutique", color: "from-rose-500/10 to-rose-600/5 text-rose-500" },
    { icon: ClipboardCheck, name: "Paie", desc: "Calcul des salaires", color: "from-indigo-500/10 to-indigo-600/5 text-indigo-500" },
    { icon: Activity, name: "Présences", desc: "Suivi des présences", color: "from-cyan-500/10 to-cyan-600/5 text-cyan-500" },
    { icon: Building2, name: "Achats", desc: "Gestion des approvisionnements", color: "from-violet-500/10 to-violet-600/5 text-violet-500" },
    { icon: BarChart3, name: "Ventes", desc: "Pipeline et performance", color: "from-pink-500/10 to-pink-600/5 text-pink-500" },
    { icon: Briefcase, name: "CRM", desc: "Relation client", color: "from-sky-500/10 to-sky-600/5 text-sky-500" },
    { icon: TrendingUp, name: "Analytique", desc: "Analyse de données", color: "from-lime-500/10 to-lime-600/5 text-lime-500" },
    { icon: FileText, name: "Rapports", desc: "Reporting avancé", color: "from-yellow-500/10 to-yellow-600/5 text-yellow-500" },
    { icon: Shield, name: "Administration", desc: "Gestion de la plateforme", color: "from-red-500/10 to-red-600/5 text-red-500" },
    { icon: Eye, name: "Audit", desc: "Traçabilité complète", color: "from-gray-500/10 to-gray-600/5 text-gray-500" },
    { icon: FileText, name: "Documents", desc: "Gestion documentaire", color: "from-stone-500/10 to-stone-600/5 text-stone-500" },
    { icon: Bell, name: "Notifications", desc: "Alertes intelligentes", color: "from-amber-500/10 to-amber-600/5 text-amber-500" },
    { icon: Bot, name: "Assistant IA", desc: "IA anti-malware intégrée", color: "from-fuchsia-500/10 to-fuchsia-600/5 text-fuchsia-500" },
  ];

  return (
    <section id="modules" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
              <Layers className="h-4 w-4" />
              <span>Modules ERP</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Tous les Modules dont Vous Avez Besoin
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une suite complète de modules interconnectés pour gérer l&apos;intégralité de votre organisation.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {modules.map((mod, index) => (
            <ScrollReveal key={mod.name} delay={index * 30}>
              <div
                className="group p-4 rounded-[14px] border border-border/40 bg-card hover:border-primary/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-default"
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-[10px] mb-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 bg-gradient-to-br", mod.color)}>
                  <mod.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{mod.name}</h3>
                <p className="text-xs text-muted-foreground">{mod.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Why Choose Us Section ───── */
function WhyChooseSection() {
  const benefits = [
    { icon: Layers, title: "Plateforme ERP Intégrée", desc: "Tous vos outils métier dans une seule plateforme connectée et cohérente." },
    { icon: Cloud, title: "Technologie Cloud Moderne", desc: "Infrastructure cloud scalable, accessible partout, à tout moment." },
    { icon: Lock, title: "Authentification Sécurisée", desc: "JWT sécurisé, support multi-facteurs et protection contre les attaques." },
    { icon: Shield, title: "Contrôle d'Accès par Rôle", desc: "Permissions granulaires avec des rôles prédéfinis et personnalisables." },
    { icon: Building2, title: "Multi-Organisations", desc: "Gérez plusieurs organisations et filiales depuis un même compte." },
    { icon: Layers, title: "Multi-Workspaces", desc: "Espaces de travail indépendants pour chaque équipe ou projet." },
    { icon: Activity, title: "Analytique Temps Réel", desc: "Tableaux de bord dynamiques et indicateurs de performance en direct." },
    { icon: FileText, title: "Rapports Professionnels", desc: "Générez des rapports détaillés et exportez-les en plusieurs formats." },
    { icon: TrendingUp, title: "Architecture Évolutive", desc: "Conçue pour grandir avec votre organisation, de la PME à la multinationale." },
    { icon: Zap, title: "Expérience Utilisateur Moderne", desc: "Interface élégante, intuitive et réactive inspirée des meilleurs standards." },
    { icon: Globe, title: "Français & Anglais", desc: "Interface complète en français et anglais, avec support du swahili." },
    { icon: Shield, title: "Sécurité Niveau Enterprise", desc: "Chiffrement, audit trail, sauvegardes automatisées et conformité RGPD." },
  ];

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
              <Star className="h-4 w-4" />
              <span>Pourquoi OmniCore</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Pourquoi Choisir OmniCore ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des fonctionnalités conçues pour répondre aux besoins des organisations modernes.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <ScrollReveal key={benefit.title} delay={index * 40}>
              <div className="flex gap-4 p-5 rounded-[16px] border border-border/40 bg-card hover:bg-gradient-to-br hover:from-accent/30 hover:to-accent/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary group-hover:scale-110 transition-all">
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

/* ───── Location Section ───── */
function LocationSection() {
  return (
    <section id="contact" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
                <MapPin className="h-4 w-4" />
                <span>Notre Localisation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Basé à <span className="text-primary">Kalemie</span>,
                <br />
                au Cœur du Tanganyika
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                Notre siège social est situé dans la ville de <strong>Kalemie</strong>, chef-lieu de la
                province du <strong>Tanganyika</strong>, en République Démocratique du Congo. Située
                sur les rives majestueuses du lac Tanganyika, Kalemie est un carrefour stratégique
                pour le développement économique de la région.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
                Depuis Kalemie, nous servons des clients locaux et internationaux, démontrant que
                l&apos;innovation technologique de classe mondiale peut émerger de toutes les régions
                du monde.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-[12px] border border-border/40 bg-card hover:shadow-md transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Adresse</p>
                    <p className="text-sm font-medium">Kalemie, Tanganyika, RDC</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-[12px] border border-border/40 bg-card hover:shadow-md transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">contact@omnicore.cd</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-[12px] border border-border/40 bg-card hover:shadow-md transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <p className="text-sm font-medium">+243 800 000 000</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border border-border/30 shadow-xl group">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">Kalemie, Tanganyika</h3>
                  <p className="text-muted-foreground mt-1">République Démocratique du Congo</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>Située au bord du lac Tanganyika</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ───── Footer ───── */
function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Modules", href: "#modules" },
    { label: "À propos", href: "#about" },
    { label: "Contact", href: "#contact" },
    { label: "Documentation", href: "#" },
  ];

  const moduleLinks = [
    { label: "Ressources Humaines", href: "#" },
    { label: "Finance", href: "#" },
    { label: "Commerce", href: "#" },
    { label: "Pharmacie", href: "#" },
    { label: "Éducation", href: "#" },
    { label: "Santé", href: "#" },
    { label: "CRM", href: "#" },
  ];

  const legalLinks = [
    { label: "Politique de confidentialité", href: "#" },
    { label: "Conditions d'utilisation", href: "#" },
    { label: "Cookies", href: "#" },
  ];

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
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
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Plateforme ERP cloud moderne basée à Kalemie, Tanganyika,
              République Démocratique du Congo. Solutions de gestion intégrées
              pour les organisations de toutes tailles.
            </p>
            <div className="flex gap-3 mt-6">
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

          <div>
            <h4 className="font-semibold text-sm mb-4">Liens rapides</h4>
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

          <div>
            <h4 className="font-semibold text-sm mb-4">Modules ERP</h4>
            <ul className="space-y-2.5">
              {moduleLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

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

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} OmniCore. Développé par John Mocket. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Version 1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ───── Main Landing Page ───── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav
        onGetStarted={() => window.location.href = `/${window.location.pathname.split("/")[1] || "fr"}/signup`}
        onSignIn={() => window.location.href = `/${window.location.pathname.split("/")[1] || "fr"}/login`}
      />

      <HeroSection
        onGetStarted={() => window.location.href = `/${window.location.pathname.split("/")[1] || "fr"}/signup`}
        onSignIn={() => window.location.href = `/${window.location.pathname.split("/")[1] || "fr"}/login`}
      />

      <AboutSection />

      <WhatWeDoSection />

      <ModulesSection />

      <WhyChooseSection />

      <LocationSection />

      <Footer />
    </div>
  );
}
