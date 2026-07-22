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
  Mail,
  DollarSign,
  Bot,
  Star,
  CheckCircle,
  Server,
  Award,
  HeadphonesIcon,
  ArrowLeft,
  FileText,
  Bell,
  BarChart3,
  RefreshCw,
  Database,
  Workflow,
  ShieldCheck,
  Smartphone,
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

/* ───── Navigation ───── */
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
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[8px] hover:bg-accent/50 transition-all duration-200">{l.label}</a>
            ))}
          </div>
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
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[10px] hover:bg-accent transition-colors">{l.label}</a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild className="w-full justify-center"><a href={localePath("/login")}>Se connecter</a></Button>
            <Button size="sm" asChild className="w-full justify-center gap-1.5"><a href={localePath("/signup")}>Commencer <ArrowRight className="h-3.5 w-3.5" /></a></Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ───── Feature Categories ───── */
const FEATURE_CATEGORIES = [
  {
    id: "core",
    title: "Fonctionnalités Principales",
    desc: "Le cœur de la plateforme ERP OmniCore.",
    features: [
      { icon: Users, title: "Gestion des Utilisateurs", desc: "Comptes multi-rôles, contrôle d'accès basé sur les rôles (RBAC) et gestion des permissions granulaires." },
      { icon: Building2, title: "Multi-Organisation", desc: "Gérez plusieurs organisations et espaces de travail depuis un seul compte." },
      { icon: Globe, title: "Multi-Langue", desc: "Interface complète en français, anglais et swahili avec support d'ajout de langues." },
      { icon: Bell, title: "Notifications", desc: "Système de notifications en temps réel pour garder votre équipe informée." },
      { icon: BarChart3, title: "Tableaux de Bord", desc: "Visualisations interactives, KPIs en temps réel et rapports personnalisables." },
      { icon: FileText, title: "Rapports & Exports", desc: "Générez des rapports détaillés et exportez-les en PDF, Excel ou CSV." },
    ],
  },
  {
    id: "security",
    title: "Sécurité & Conformité",
    desc: "Protection enterprise-grade de vos données.",
    features: [
      { icon: Shield, title: "Chiffrement AES-256", desc: "Toutes les données sont chiffrées au repos et en transit avec les standards les plus élevés." },
      { icon: Lock, title: "Authentification Sécurisée", desc: "Sessions sécurisées avec Supabase Auth, support OAuth et magique links." },
      { icon: ShieldCheck, title: "Audit Trail", desc: "Traçabilité complète de toutes les actions avec horodatage et détails utilisateur." },
      { icon: Database, title: "Sauvegardes Automatiques", desc: "Sauvegardes quotidiennes avec possibilité de restauration en un clic." },
    ],
  },
  {
    id: "ai",
    title: "Intelligence Artificielle",
    desc: "L'IA au service de votre productivité.",
    features: [
      { icon: Bot, title: "Assistant IA Intégré", desc: "Chatbot intelligent pour répondre aux questions et automatiser les tâches répétitives." },
      { icon: TrendingUp, title: "Analyse Prédictive", desc: "Prédictions basées sur l'IA pour anticiper les tendances et optimiser les décisions." },
      { icon: Workflow, title: "Automatisation", desc: "Règles d'automatisation intelligentes pour réduire les tâches manuelles." },
    ],
  },
  {
    id: "platform",
    title: "Infrastructure & Performance",
    desc: "Une plateforme conçue pour la scalabilité.",
    features: [
      { icon: Cloud, title: "Cloud Natif", desc: "Infrastructure cloud scalable accessible 24/7 depuis n'importe où dans le monde." },
      { icon: Zap, title: "Performance Temps Réel", desc: "Temps de réponse ultra-rapides grâce à une architecture optimisée." },
      { icon: Smartphone, title: "Responsive Design", desc: "Interface adaptative qui fonctionne parfaitement sur mobile, tablette et desktop." },
      { icon: RefreshCw, title: "APIs RESTful", desc: "APIs ouvertes et documentées pour intégrer OmniCore avec vos outils existants." },
      { icon: Server, title: "Haute Disponibilité", desc: "99.9% de disponibilité garantie avec monitoring infrastructure en temps réel." },
      { icon: HeadphonesIcon, title: "Support Dédié", desc: "Équipe de support technique disponible pour accompagner vos équipes." },
    ],
  },
];

function FeaturesHero() {
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
              <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
            </a>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
              <Zap className="h-4 w-4" />
              <span>Fonctionnalités</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Tout ce dont votre entreprise
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">a besoin</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Découvrez l&apos;ensemble des fonctionnalités qui font d&apos;OmniCore la plateforme ERP
              de référence pour les organisations modernes.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function FeatureCategory({ category, index }: { category: typeof FEATURE_CATEGORIES[0]; index: number }) {
  return (
    <section className={cn("py-16 sm:py-24 px-4 sm:px-6 lg:px-8", index % 2 === 1 ? "bg-muted/30" : "")}>
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{category.title}</h2>
            <p className="text-lg text-muted-foreground">{category.desc}</p>
          </div>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 60}>
              <div className="group relative overflow-hidden rounded-[16px] border border-border/40 bg-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Prêt à commencer ?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Exploitez toute la puissance
            <br />
            <span className="text-primary">d&apos;OmniCore</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Créez votre espace de travail dès aujourd&apos;hui et découvrez comment OmniCore peut transformer votre organisation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild className="gap-2 w-full sm:w-auto shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90">
              <a href={localePath("/signup")}>Commencer gratuitement <ArrowRight className="h-5 w-5" /></a>
            </Button>
            <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
              <a href={localePath("/contact")}>Demander une démo</a>
            </Button>
          </div>
        </ScrollReveal>
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
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-[10px] blur-sm" />
                <img src="/omnicore-logo.png" alt="OmniCore" className="relative h-9 w-9 rounded-[10px] object-contain" />
              </div>
              <span className="text-lg font-bold">OmniCore</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Plateforme ERP cloud moderne pour les organisations de toutes tailles.
            </p>
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

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <FeaturesHero />
      {FEATURE_CATEGORIES.map((cat, i) => (
        <FeatureCategory key={cat.id} category={cat} index={i} />
      ))}
      <CTASection />
      <Footer />
    </div>
  );
}
