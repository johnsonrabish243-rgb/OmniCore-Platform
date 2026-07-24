"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  User,
  Building2,
  Globe,
  MessageSquare,
  Send,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Loader2,
  Video,
  Users as UsersIcon,
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[8px] hover:bg-accent/50 transition-all duration-200">{link.label}</a>
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
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[10px] hover:bg-accent transition-colors">{link.label}</a>
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

/* ───── Contact Form ───── */
function ContactForm() {
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    country: "",
    organizationType: "",
    interestedModule: "",
    preferredDate: "",
    preferredTime: "",
    meetingType: "",
    reasonForAppointment: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Une erreur est survenue.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Erreur de connexion. Veuillez réessayer.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-6 shadow-lg">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Demande envoyée !</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Merci pour votre intérêt. Notre équipe vous contactera dans les plus brefs délais pour confirmer votre rendez-vous.
        </p>
        <Button variant="outline" onClick={() => { setStatus("idle"); setForm({ fullName: "", companyName: "", email: "", phone: "", country: "", organizationType: "", interestedModule: "", preferredDate: "", preferredTime: "", meetingType: "", reasonForAppointment: "", message: "" }); }}>
          Envoyer une autre demande
        </Button>
      </div>
    );
  }

  const inputClass = "bg-background/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row: Name + Company */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Nom complet *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="fullName" required value={form.fullName} onChange={handleChange} placeholder="Jean Dupont" className={cn("pl-10", inputClass)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Nom de l&apos;entreprise</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Votre entreprise" className={cn("pl-10", inputClass)} />
          </div>
        </div>
      </div>

      {/* Row: Email + Phone */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="jean@entreprise.com" className={cn("pl-10", inputClass)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Téléphone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+243 XX XXX XXXX" className={cn("pl-10", inputClass)} />
          </div>
        </div>
      </div>

      {/* Row: Country + Org Type */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Pays</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="country" value={form.country} onChange={handleChange} placeholder="RDC, Congo, etc." className={cn("pl-10", inputClass)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Type d&apos;organisation</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select name="organizationType" value={form.organizationType} onChange={handleChange} className={cn("flex h-10 w-full rounded-[10px] border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200", inputClass)}>
              <option value="">Sélectionnez...</option>
              <option value="startup">Startup</option>
              <option value="pme">PME</option>
              <option value="grande">Grande entreprise</option>
              <option value="ong">ONG / Association</option>
              <option value="gouvernement">Gouvernement / Public</option>
              <option value="scolaire">École / Université</option>
              <option value="hopital">Hôpital / Clinique</option>
              <option value="pharmacie">Pharmacie</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row: Module + Meeting Type */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Module intérêt</label>
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select name="interestedModule" value={form.interestedModule} onChange={handleChange} className={cn("flex h-10 w-full rounded-[10px] border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200", inputClass)}>
              <option value="">Sélectionnez...</option>
              <option value="hr">Ressources Humaines</option>
              <option value="finance">Finance & Comptabilité</option>
              <option value="healthcare">Santé & Pharmacie</option>
              <option value="education">Éducation</option>
              <option value="commerce">Commerce & Inventaire</option>
              <option value="multiple">Plusieurs modules</option>
              <option value="general">Information générale</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Type de réunion</label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select name="meetingType" value={form.meetingType} onChange={handleChange} className={cn("flex h-10 w-full rounded-[10px] border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200", inputClass)}>
              <option value="">Sélectionnez...</option>
              <option value="online">En ligne (Visioconférence)</option>
              <option value="in-person">En personne</option>
              <option value="phone">Par téléphone</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row: Date + Time */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Date souhaitée</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange} className={cn("pl-10", inputClass)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Heure souhaitée</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="preferredTime" type="time" value={form.preferredTime} onChange={handleChange} className={cn("pl-10", inputClass)} />
          </div>
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Raison du rendez-vous</label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <textarea
            name="reasonForAppointment"
            value={form.reasonForAppointment}
            onChange={handleChange}
            rows={2}
            placeholder="Décrivez brièvement l'objet de votre demande..."
            className={cn("flex w-full rounded-[10px] border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 resize-none", inputClass)}
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Message complémentaire</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={4}
          placeholder="Informations supplémentaires..."
          className={cn("flex w-full rounded-[10px] border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 resize-none", inputClass)}
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-sm">
          <X className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto gap-2 shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90">
        {status === "submitting" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...</>
        ) : (
          <><Send className="h-4 w-4" /> Envoyer la demande</>
        )}
      </Button>
    </form>
  );
}

/* ───── Contact Info Sidebar ───── */
function ContactInfo() {
  const items = [
    { icon: Mail, label: "Email", value: "contact@omnicore.site", color: "from-blue-500 to-blue-600" },
    { icon: Phone, label: "Téléphone", value: "+243 XX XXX XXXX", color: "from-emerald-500 to-emerald-600" },
    { icon: MapPin, label: "Adresse", value: "Kalemie, Tanganyika, RDC", color: "from-rose-500 to-rose-600" },
    { icon: Clock, label: "Horaires", value: "Lun - Ven, 8h00 - 17h00", color: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-2">Besoin d&apos;aide immédiate ?</h3>
        <p className="text-sm text-muted-foreground">
          Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans votre choix.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 p-4 rounded-[12px] bg-card border border-border/40 hover:shadow-md transition-all duration-200 group">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br text-white shadow-md group-hover:scale-110 transition-all duration-300", item.color)}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-[16px] bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <UsersIcon className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Démo gratuite</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Demandez une démonstration personnalisée pour découvrir comment OmniCore peut transformer la gestion de votre organisation.
        </p>
      </div>
    </div>
  );
}

/* ───── Hero ───── */
function ContactHero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
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
              <MessageSquare className="h-4 w-4" />
              <span>Contactez-nous</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Planifiez un
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">rendez-vous</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Remplissez le formulaire ci-dessous pour demander une démonstration, obtenir un devis personnalisé ou discuter de vos besoins avec notre équipe.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ───── Footer ───── */
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
              {[{ label: "Fonctionnalités", href: localePath("/features") }, { label: "Modules", href: localePath("/#modules") }, { label: "Tarifs", href: localePath("/pricing") }].map((link) => (
                <li key={link.label}><a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Entreprise</h4>
            <ul className="space-y-2.5">
              {[{ label: "À propos", href: localePath("/about") }, { label: "Contact", href: localePath("/contact") }, { label: "Confidentialité", href: localePath("/privacy") }].map((link) => (
                <li key={link.label}><a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</a></li>
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

/* ───── Page ───── */
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <ContactHero />
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-3">
              <ScrollReveal>
                <h2 className="text-2xl font-bold mb-2">Demander un rendez-vous</h2>
                <p className="text-muted-foreground mb-8">Remplissez le formulaire et notre équipe vous recontactera sous 24 heures.</p>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <ContactForm />
              </ScrollReveal>
            </div>
            <div className="lg:col-span-2">
              <ScrollReveal delay={200}>
                <ContactInfo />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
