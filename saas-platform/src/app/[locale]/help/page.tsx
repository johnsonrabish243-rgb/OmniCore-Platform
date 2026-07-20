"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, HelpCircle, Book, MessageSquare, FileText, Video, ChevronRight, ExternalLink, Mail, Phone } from "lucide-react";

const faqs = [
  {
    q: "Comment créer un compte OmniCore ?",
    a: "Rendez-vous sur la page d'inscription, remplissez vos informations et confirmez votre adresse email. Vous pouvez également vous inscrire via Google ou GitHub.",
  },
  {
    q: "Comment inviter des membres dans mon organisation ?",
    a: "Accédez à la section RH, cliquez sur 'Nouvel employé' et saisissez l'adresse email de la personne à inviter. Un email d'invitation lui sera envoyé.",
  },
  {
    q: "Quels sont les plans tarifaires disponibles ?",
    a: "Nous proposons 4 plans : Free (gratuit), Starter (9,99 €/mois), Professional (29,99 €/mois) et Enterprise (sur devis). Chaque plan offre des fonctionnalités et limites différentes.",
  },
  {
    q: "Comment réinitialiser mon mot de passe ?",
    a: "Sur la page de connexion, cliquez sur 'Mot de passe oublié', saisissez votre email et suivez les instructions reçues pour réinitialiser votre mot de passe.",
  },
  {
    q: "Puis-je exporter mes données ?",
    a: "Oui, depuis la section Paramètres, vous pouvez exporter toutes vos données au format CSV ou JSON. Les administrateurs peuvent également exporter les données de l'organisation.",
  },
  {
    q: "Comment contacter le support technique ?",
    a: "Vous pouvez nous contacter via le chat en direct, par email à support@omnicore.com, ou par téléphone au +33 1 23 45 67 89. Le support est disponible 24/7 pour les clients Enterprise.",
  },
];

const guides = [
  { title: "Guide de démarrage rapide", icon: Book, desc: "Apprenez les bases d'OmniCore en 10 minutes", color: "text-primary" },
  { title: "Documentation API", icon: FileText, desc: "Intégrez OmniCore à vos outils existants", color: "text-emerald-500" },
  { title: "Tutoriels vidéo", icon: Video, desc: "Regardez nos tutoriels pas à pas", color: "text-amber-500" },
  { title: "Forum d'entraide", icon: MessageSquare, desc: "Échangez avec la communauté OmniCore", color: "text-purple-500" },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) =>
    faq.q.toLowerCase().includes(search.toLowerCase()) ||
    faq.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-primary/10">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Centre d'aide</h1>
        <p className="text-muted-foreground mt-2">Comment pouvons-nous vous aider ?</p>
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans l'aide..."
            className="pl-9 h-12 rounded-[14px] text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Guides */}
      <div className="grid gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <Card key={guide.title} className="group cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-6 flex items-start gap-4">
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 group-hover:scale-110 transition-all", guide.color)}>
                <guide.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">{guide.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{guide.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
          <CardDescription>{filteredFaqs.length} questions trouvées</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {filteredFaqs.map((faq, i) => (
            <div key={i} className="border border-border/50 rounded-[12px] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-medium">{faq.q}</span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    openFaq === i && "rotate-90"
                  )}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Encore besoin d'aide ?</CardTitle>
          <CardDescription>Notre équipe est là pour vous</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1 gap-2">
            <Mail className="h-4 w-4" />
            support@omnicore.com
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <Phone className="h-4 w-4" />
            +33 1 23 45 67 89
          </Button>
          <Button className="flex-1 gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat en direct
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
