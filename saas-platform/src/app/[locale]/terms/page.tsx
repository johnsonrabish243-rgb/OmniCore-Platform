"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, X, ArrowLeft, FileText, Scale, Shield, AlertTriangle, Gavel, Mail } from "lucide-react";

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);
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
          <a href={localePath("/")} className="flex items-center gap-3 group"><div className="relative"><div className="absolute inset-0 bg-primary/20 rounded-[12px] blur-sm group-hover:blur-md transition-all" /><img src="/omnicore-logo.png" alt="OmniCore" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-[12px] object-contain shadow-sm" /></div><div className="hidden sm:block"><span className="text-lg font-bold tracking-tight text-foreground">OmniCore</span></div></a>
          <div className="hidden lg:flex items-center gap-1">{navLinks.map((l) => (<a key={l.label} href={l.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[8px] hover:bg-accent/50 transition-all duration-200">{l.label}</a>))}</div>
          <div className="hidden lg:flex items-center gap-3"><Button variant="ghost" size="sm" asChild><a href={localePath("/login")}>Se connecter</a></Button><Button size="sm" asChild className="gap-1.5 shadow-lg shadow-primary/20"><a href={localePath("/signup")}>Commencer <ArrowRight className="h-3.5 w-3.5" /></a></Button></div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden flex items-center justify-center h-10 w-10 rounded-[10px] hover:bg-accent transition-colors">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      <div className={cn("lg:hidden transition-all duration-300 overflow-hidden", mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {navLinks.map((l) => (<a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[10px] hover:bg-accent transition-colors">{l.label}</a>))}
          <div className="pt-3 flex flex-col gap-2"><Button variant="outline" size="sm" asChild className="w-full justify-center"><a href={localePath("/login")}>Se connecter</a></Button><Button size="sm" asChild className="w-full justify-center gap-1.5"><a href={localePath("/signup")}>Commencer <ArrowRight className="h-3.5 w-3.5" /></a></Button></div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3"><img src="/omnicore-logo.png" alt="OmniCore" className="h-8 w-8 rounded-[8px] object-contain" /><span className="font-bold">OmniCore</span></div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href={localePath("/privacy")} className="text-muted-foreground hover:text-foreground transition-colors">Confidentialité</a>
            <a href={localePath("/terms")} className="text-muted-foreground hover:text-foreground transition-colors">Conditions</a>
            <a href={localePath("/cookies")} className="text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
          </div>
          <p className="text-xs text-muted-foreground">&copy; {currentYear} OmniCore. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

const sections = [
  { icon: Scale, title: "1. Acceptation des conditions", content: "En accédant et en utilisant la plateforme OmniCore, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service." },
  { icon: FileText, title: "2. Description du service", content: "OmniCore est une plateforme ERP cloud qui offre des outils de gestion intégrés pour les entreprises, incluant la gestion des ressources humaines, la finance, le commerce, la pharmacie, l'éducation et la santé. Le service est fourni tel quel, sans garantie explicite ou implicite." },
  { icon: Shield, title: "3. Inscription et compte", content: "Pour utiliser OmniCore, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de la sécurité de votre compte et de votre mot de passe. Vous devez immédiatement nous informer de toute utilisation non autorisée." },
  { icon: AlertTriangle, title: "4. Utilisation acceptable", content: "Vous vous engagez à ne pas utiliser OmniCore à des fins illégales, à ne pas tenter d'accéder non autorisé au système, à ne pas télécharger de malware, et à ne pas perturber le fonctionnement de la plateforme. Toute violation peut entraîner la suspension ou la résiliation de votre compte." },
  { icon: Gavel, title: "5. Propriété intellectuelle", content: "Tous les contenus, marques, logiciels et données de la plateforme OmniCore sont la propriété exclusive d'OmniCore et sont protégés par les lois internationales sur la propriété intellectuelle. Vous ne pouvez pas copier, modifier ou distribuer notre propriété intellectuelle." },
  { icon: Scale, title: "6. Limitation de responsabilité", content: "En aucun cas, OmniCore ne sera responsable des dommages indirects, spéciaux, consécutifs ou punitifs résultant de l'utilisation de la plateforme. Notre responsabilité totale ne dépassera pas le montant payé par vous au cours des 12 derniers mois." },
  { icon: FileText, title: "7. Modification des conditions", content: "OmniCore se réserve le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur la plateforme. Il est de votre responsabilité de consulter régulièrement ces conditions." },
  { icon: Mail, title: "8. Contact", content: "Pour toute question concernant ces conditions d'utilisation, contactez-nous à : legal@omnicore.site ou par courrier à OmniCore, Kalemie, Tanganyika, RDC." },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10"><div className="absolute top-1/4 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl" /></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal><a href={localePath("/")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"><ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil</a></ScrollReveal>
            <ScrollReveal delay={100}><div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm"><Gavel className="h-4 w-4" /><span>Conditions d&apos;utilisation</span></div></ScrollReveal>
            <ScrollReveal delay={200}><h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">Conditions <span className="text-primary">d&apos;utilisation</span></h1></ScrollReveal>
            <ScrollReveal delay={300}><p className="mt-6 text-lg text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p></ScrollReveal>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="p-6 rounded-[16px] bg-primary/5 border border-primary/20 mb-12">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Veuillez lire attentivement ces conditions d&apos;utilisation avant d&apos;utiliser la plateforme OmniCore.
                En utilisant notre service, vous confirmez avoir lu et accepté ces conditions.
              </p>
            </div>
          </ScrollReveal>
          <div className="space-y-8">
            {sections.map((section, i) => (
              <ScrollReveal key={section.title} delay={i * 60}>
                <div className="rounded-[16px] border border-border/40 bg-card p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary">
                      <section.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold">{section.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
