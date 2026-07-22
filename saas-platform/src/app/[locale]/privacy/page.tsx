"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, X, ArrowLeft, Shield, Lock, Eye, Database, Globe, Mail } from "lucide-react";

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
          <div className="flex items-center gap-3"><div className="relative"><img src="/omnicore-logo.png" alt="OmniCore" className="h-8 w-8 rounded-[8px] object-contain" /></div><span className="font-bold">OmniCore</span></div>
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
  { icon: Eye, title: "1. Informations collectées", content: "Nous collectons les informations que vous nous fournissez directement lors de votre inscription, notamment : votre nom, prénom, adresse e-mail, nom de l'entreprise, et les informations relatives à votre organisation. Nous collectons également des données d'utilisation de la plateforme pour améliorer nos services." },
  { icon: Database, title: "2. Utilisation des données", content: "Vos données sont utilisées pour : fournir et maintenir nos services, vous contacter concernant votre compte, améliorer l'expérience utilisateur, assurer la sécurité de la plateforme, et respecter nos obligations légales." },
  { icon: Lock, title: "3. Protection des données", content: "Nous utilisons des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction. Toutes les données sont chiffrées avec AES-256 au repos et en transit." },
  { icon: Globe, title: "4. Partage des données", content: "Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations uniquement avec des prestataires de services tiers qui nous aident à exploiter notre plateforme, et uniquement dans la mesure nécessaire." },
  { icon: Shield, title: "5. Vos droits", content: "Conformément au RGPD, vous disposez des droits suivants : droit d'accès, droit de rectification, droit à l'effacement, droit à la portabilité des données, et droit d'opposition au traitement. Contactez-nous pour exercer ces droits." },
  { icon: Database, title: "6. Conservation des données", content: "Nous conservons vos données personnelles aussi longtemps que votre compte est actif, ou dans la mesure nécessaire pour fournir nos services. Après la suppression de votre compte, certaines données peuvent être conservées conformément à nos obligations légales." },
  { icon: Mail, title: "7. Contact", content: "Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits, contactez-nous à : privacy@omnicore.cd ou par courrier à OmniCore, Kalemie, Tanganyika, RDC." },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10"><div className="absolute top-1/4 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl" /></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal><a href={localePath("/")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"><ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil</a></ScrollReveal>
            <ScrollReveal delay={100}><div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm"><Shield className="h-4 w-4" /><span>Politique de Confidentialité</span></div></ScrollReveal>
            <ScrollReveal delay={200}><h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">Politique de <span className="text-primary">Confidentialité</span></h1></ScrollReveal>
            <ScrollReveal delay={300}><p className="mt-6 text-lg text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p></ScrollReveal>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="p-6 rounded-[16px] bg-primary/5 border border-primary/20 mb-12">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Chez OmniCore, la protection de vos données personnelles est une priorité absolue.
                Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations
                lorsque vous utilisez notre plateforme ERP cloud.
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
