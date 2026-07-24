import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { validateCSRFRequest } from "@/lib/csrf";

const MAX_MESSAGE_LENGTH = 2000;

export const dynamic = "force-dynamic";

const BURST_LIMIT = 3;
const BURST_WINDOW_MS = 15000;
const burstTracker = new Map<string, { count: number; resetAt: number }>();

function checkBurst(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = burstTracker.get(ip);
  if (!entry || now > entry.resetAt) {
    burstTracker.set(ip, { count: 1, resetAt: now + BURST_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  if (entry.count >= BURST_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of burstTracker) {
    if (now > val.resetAt) burstTracker.delete(key);
  }
}, 60000);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const NORM_MAP: Record<string, string> = {
  "employe": "employe", "employer": "employe", "employes": "employe",
  "salarie": "employe", "employees": "employe", "staff": "employe",
  "facture": "facture", "factures": "facture", "invoice": "facture", "invoices": "facture",
  "ankara": "facture", "ankarate": "facture",
  "client": "client", "clients": "client", "customer": "client", "customers": "client", "mteja": "client", "wateja": "client",
  "produit": "produit", "produits": "produit", "product": "produit", "products": "produit", "article": "produit", "bidhaa": "produit",
  "commande": "commande", "commandes": "commande", "order": "commande", "orders": "commande", "agizo": "commande",
  "projet": "projet", "projets": "projet", "project": "projet", "projects": "projet", "mradi": "projet", "miradi": "projet",
  "tache": "tache", "taches": "tache", "task": "tache", "tasks": "tache", "kazi": "tache",
  "medicament": "medicament", "medicaments": "medicament", "medicine": "medicament", "medicines": "medicament", "dawa": "medicament",
  "patient": "patient", "patients": "patient", "mgonjwa": "patient", "wagonjwa": "patient",
  "etudiant": "etudiant", "etudiants": "etudiant", "student": "etudiant", "students": "etudiant", "mwanafunzi": "etudiant", "wanafunzi": "etudiant",
  "cour": "cours", "corses": "cours", "course": "cours", "kozi": "cours",
  "classe": "classe", "classes": "classe", "class": "classe", "darasa": "classe",
  "rendezvous": "rdv", "appointment": "rdv", "appointments": "rdv", "miadi": "rdv",
  "parametre": "parametre", "parametres": "parametre", "setting": "parametre", "settings": "parametre", "mipangilio": "parametre",
  "profil": "profil", "profile": "profil", "profiles": "profil", "wasifu": "profil",
  "confidentialite": "privacy", "prive": "privacy", "prives": "privacy", "faragha": "privacy",
  "telephone": "telephone", "phone": "telephone", "simu": "telephone", "tel": "telephone",
  "email": "email", "courrier": "email", "mail": "email", "barua": "email",
  "calendar": "calendrier", "kalenda": "calendrier", "agenda": "calendrier", "schedule": "calendrier",
  "dashibodi": "dashboard", "tableaubord": "dashboard", "dash": "dashboard",
  "paie": "paie", "pay": "paie", "payroll": "paie", "payrole": "paie", "salaire": "paie", "salary": "paie", "mshahara": "paie", "mishahara": "paie",
  "stock": "stock", "inventaire": "stock", "inventory": "stock", "hisa": "stock", "orodha": "stock",
  "absence": "absence", "absences": "absence", "absent": "absence", "conge": "absence", "leave": "absence",
  "mahudhurio": "presence", "presences": "presence", "attendance": "presence", "pointage": "presence",
  "revenu": "revenu", "revenue": "revenu", "revenues": "revenu", "income": "revenu", "mapato": "revenu", "profit": "revenu",
  "depense": "depense", "depenses": "depense", "expense": "depense", "expenses": "depense", "gharama": "depense", "frais": "depense",
  "export": "export", "exporter": "export", "exportation": "export",
  "importer": "import", "importation": "import",
  "fichier": "fichier", "file": "fichier", "document": "fichier",
  "analytique": "analytics", "statistique": "analytics", "statistics": "analytics", "graphique": "analytics", "chart": "analytics", "trend": "analytics", "tendance": "analytics", "tendances": "analytics",
  "rapport": "rapport", "reports": "rapport", "repport": "rapport", "ripoti": "rapport",
  "erreur": "erreur", "bug": "erreur",
  "probleme": "probleme", "problemes": "probleme", "problem": "probleme", "problems": "probleme", "issue": "probleme", "issues": "probleme", "matatizo": "probleme",
  "solution": "solution", "solutions": "solution", "solver": "solution", "resolve": "solution", "resoudre": "solution", "corriger": "solution", "fix": "solution", "fixer": "solution",
  "aide": "aide", "help": "aide", "assistance": "aide", "support": "aide", "msaada": "aide", "assist": "aide",
  "fonctionnalite": "fonctionnalite", "fonction": "fonctionnalite", "feature": "fonctionnalite", "fonctionalite": "fonctionnalite",
  "module": "module", "modules": "module", "modul": "module",
  "entreprise": "entreprise", "company": "entreprise", "societe": "entreprise", "organization": "entreprise", "organisation": "entreprise", "kampuni": "entreprise",
  "equipe": "equipe", "team": "equipe", "timu": "equipe",
  "mission": "mission", "valeur": "valeur", "value": "valeur",
  "motdepasse": "motdepasse", "password": "motdepasse", "mdp": "motdepasse", "pass": "motdepasse", "nywila": "motdepasse",
  "compte": "compte", "account": "compte", "compt": "compte",
  "inscription": "inscription", "signup": "inscription", "register": "inscription", "registration": "inscription", "enregistrer": "inscription",
  "connexion": "connexion", "login": "connexion", "signin": "connexion", "connecter": "connexion",
  "deconnexion": "deconnexion", "logout": "deconnexion", "signout": "deconnexion", "ondoka": "deconnexion",
  "formation": "formation", "training": "formation", "learn": "formation", "apprendre": "formation", "tutorial": "formation", "tutoriel": "formation",
  "facturation": "facturation", "billing": "facturation",
  "lead": "lead", "prospect": "lead", "prospects": "lead", "watarajiwa": "lead",
  "deal": "deal", "affaire": "deal", "affaires": "deal", "opportunity": "deal", "fursa": "deal", "mkataba": "deal",
  "commercial": "commercial", "sales": "commercial", "vente": "commercial", "ventes": "commercial", "marketing": "commercial",
  "pharmacie": "pharmacie", "pharmacy": "pharmacie", "famasia": "pharmacie", "pharma": "pharmacie",
  "sante": "sante", "health": "sante", "healthcare": "sante", "afya": "sante", "medical": "sante",
  "school": "education", "elimu": "education", "ecole": "education",
  "ressourcehumaine": "rh", "ressourceshumaines": "rh", "hr": "rh", "humanresources": "rh",
  "finance": "finance", "finances": "finance", "financial": "finance", "fedha": "finance", "financier": "finance",
  "commerce": "commerce", "ecommerce": "commerce", "biashara": "commerce", "boutique": "commerce", "shop": "commerce",
};

function sanitizeInput(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

function normWords(text: string): string[] {
  const n = normalize(text);
  return n.split(/\s+/).filter(Boolean);
}

function detectLanguage(text: string, preferredLocale?: string): "fr" | "en" | "sw" {
  const swWords = ["habari", "msaada", "tafadhali", "asante", "sawa", "ndiyo", "hapana", "mfanyakazi", "mwanafunzi", "mgonjwa", "dawa", "hesabu", "ankara", "bidhaa", "agizo", "hisa", "kozi", "darasa", "mwalimu", "ratiba", "kazi", "mkutano", "ripoti", "taarifa", "nyaraka", "malipo", "wafanyakazi", "wanafunzi", "wagonjwa", "biashara", "fedha", "afya", "elimu", "famasia", "miradi", "mipangilio", "wasifu"];
  const frWords = ["bonjour", "merci", "svp", "aide", "employe", "facture", "client", "produit", "commande", "stock", "medicament", "patient", "rdv", "eleve", "professeur", "cours", "classe", "projet", "tache", "calendrier", "parametres", "profil", "espace", "tableau", "comment", "pourquoi", "confidentialite", "entreprise", "societe", "mission", "vision", "equipe", "logo", "contact", "politique", "conditions", "cookies", "droits", "veuillez", "donnees", "protection"];
  const enWords = ["hello", "help", "please", "thank", "how", "what", "why", "where", "when", "employee", "invoice", "customer", "product", "order", "dashboard", "settings", "profile", "workspace", "project", "privacy", "policy", "data", "protection", "cookie", "about", "company", "mission", "vision", "team", "founder", "logo", "brand", "contact", "information", "terms", "rights", "access", "delete", "personal", "export", "file", "report", "error", "issue", "solution", "feature", "module"];

  const lower = text.toLowerCase();
  const n = normalize(lower);
  let swScore = swWords.filter(w => n.includes(w)).length;
  let frScore = frWords.filter(w => n.includes(w)).length;
  let enScore = enWords.filter(w => n.includes(w)).length;

  if (preferredLocale === "sw" && swScore >= frScore && swScore >= enScore) return "sw";
  if (preferredLocale === "fr" && frScore >= swScore) return "fr";
  if (preferredLocale === "en" && enScore >= frScore) return "en";

  if (swScore > frScore && swScore > enScore) return "sw";
  if (frScore >= enScore) return "fr";
  return "en";
}

interface ResponseMap {
  fr: string;
  en: string;
  sw: string;
}

const responses: Record<string, ResponseMap> = {
  dashboard: {
    fr: "Le tableau de bord OmniCore vous offre une vue d'ensemble de votre activité. Vous y trouverez des graphiques sur les ventes, les revenus, les employés actifs et les indicateurs clés. Utilisez les filtres en haut pour personnaliser l'affichage par période ou par module. Chaque widget peut être cliqué pour voir les détails complets. Les données sont mises à jour en temps réel.",
    en: "The OmniCore dashboard gives you a complete overview of your business. You'll find charts on sales, revenue, active employees, and key metrics. Use the filters at the top to customize the view by period or module. Each widget can be clicked for full details. Data is updated in real time.",
    sw: "Dashibodi ya OmniCore inakupa muhtasari kamili wa shughuli zako. Utapata chati za mauzo, mapato, wafanyakazi hai na viashiria muhimu. Tumia vichujio juu kubadilisha mwonekano kwa muda au moduli. Kila kijisanduku kinaweza kubofywa kwa maelezo kamili. Takwimu husasishwa kwa wakati halisi.",
  },
  dashboard_analytics: {
    fr: "Dans les analyses détaillées du tableau de bord, vous pouvez voir : les tendances des ventes sur 30 jours, la répartition des revenus par module, le top 5 des produits les plus vendus, le taux de conversion des leads, la moyenne des paniers, et le nombre d'utilisateurs actifs quotidien. Chaque graphique est interactif : survolez les points pour voir les valeurs exactes, cliquez pour filtrer par période. Vous pouvez exporter n'importe quel graphique en image ou en PDF.",
    en: "In the detailed dashboard analytics, you can view: 30-day sales trends, revenue breakdown by module, top 5 best-selling products, lead conversion rate, average cart value, and daily active users. Every chart is interactive: hover for exact values, click to filter by period. You can export any chart as an image or PDF.",
    sw: "Katika uchambuzi wa kina wa dashibodi, unaweza kuona: mwelekeo wa mauzo ya siku 30, mgawanyo wa mapato kwa moduli, bidhaa 5 bora zaidi, kiwango cha ubadilishaji wa wateja watarajiwa, wastani wa kikapu, na watumiaji hai kila siku. Kila chati inaingiliana: peleka kwa thamani kamili, bofya kuchuja kwa muda. Unaweza kutoa chati yoyote kama picha au PDF.",
  },
  export: {
    fr: "Vous pouvez exporter les données de tous les modules OmniCore. Allez dans le module souhaité (RH, Finance, Commerce, etc.), utilisez le bouton 'Exporter' en haut à droite de la liste. Formats disponibles : PDF (pour impressions et rapports), Excel (pour analyses et calculs), CSV (pour import dans d'autres logiciels). Pour les graphiques, utilisez le menu contextuel du graphique > 'Exporter en image'. Les rapports personnalisés sont disponibles dans Rapports > Créer un rapport.",
    en: "You can export data from all OmniCore modules. Go to the desired module (HR, Finance, Commerce, etc.), use the 'Export' button at the top right of the list. Available formats: PDF (for printing and reports), Excel (for analysis and calculations), CSV (for import into other software). For charts, use the chart context menu > 'Export as image'. Custom reports are available in Reports > Create a report.",
    sw: "Unaweza kutoa data kutoka kwa moduli zote za OmniCore. Nenda kwenye moduli unayotaka (HR, Fedha, Biashara, nk), tumia kitufe cha 'Toa' juu kulia ya orodha. Umbizo linalopatikana: PDF (kwa uchapishaji na ripoti), Excel (kwa uchambuzi na hesabu), CSV (kwa kuagiza katika programu zingine). Kwa chati, tumia menyu ya muktadha ya chati > 'Toa kama picha'. Ripoti maalum zinapatikana katika Ripoti > Unda ripoti.",
  },
  export_from_dashboard: {
    fr: "Pour exporter directement depuis le tableau de bord : cliquez sur les trois points en haut à droite de chaque widget, puis choisissez 'Exporter'. Vous pouvez exporter en PDF, Excel ou image. Pour exporter tout le tableau de bord en une fois, utilisez le bouton 'Exporter le tableau de bord' en haut à droite de la page. Un rapport PDF complet sera généré avec tous les graphiques et indicateurs.",
    en: "To export directly from the dashboard: click the three dots at the top right of each widget, then choose 'Export'. You can export as PDF, Excel, or image. To export the entire dashboard at once, use the 'Export Dashboard' button at the top right of the page. A complete PDF report will be generated with all charts and metrics.",
    sw: "Ili kutoa moja kwa moja kutoka kwenye dashibodi: bofya nukta tatu juu kulia ya kila kijisanduku, kisha chagua 'Toa'. Unaweza kutoa kama PDF, Excel, au picha. Ili kutoa dashibodi nzima mara moja, tumia kitufe cha 'Toa Dashibodi' juu kulia ya ukurasa. Ripoti kamili ya PDF itatolewa na chati na viashiria vyote.",
  },
  report: {
    fr: "Le module Rapports vous permet de créer des rapports personnalisés. Allez dans Rapports > Créer un rapport. Sélectionnez les modules, les champs et les filtres souhaités. Vous pouvez ajouter des graphiques, des tableaux croisés et des indicateurs. Les rapports peuvent être programmés (quotidien, hebdomadaire, mensuel) et envoyés par email automatiquement. Formats d'export : PDF, Excel, CSV.",
    en: "The Reports module lets you create custom reports. Go to Reports > Create a report. Select the desired modules, fields, and filters. You can add charts, pivot tables, and metrics. Reports can be scheduled (daily, weekly, monthly) and sent by email automatically. Export formats: PDF, Excel, CSV.",
    sw: "Moduli ya Ripoti hukuruhusu kuunda ripoti maalum. Nenda Ripoti > Unda ripoti. Chagua moduli, sehemu na vichujio unavyotaka. Unaweza kuongeza chati, jedwali za mhimili na viashiria. Ripoti zinaweza kuratibiwa (kila siku, kila wiki, kila mwezi) na kutumwa kwa barua pepe kiotomatiki. Umbizo la kutoa: PDF, Excel, CSV.",
  },
  faq_how_to: {
    fr: "Voici quelques actions fréquentes : Ajouter un employé : RH > Employés > Ajouter. Créer une facture : Finance > Factures > Nouvelle facture. Exporter des données : utilisez le bouton Exporter dans chaque module. Changer de mot de passe : Profil > Paramètres > Sécurité. Changer de langue : Profil > Paramètres > Langue. Voir le calendrier : Calendrier dans le menu principal. Pour plus d'aide, posez votre question précisément.",
    en: "Here are some common actions: Add an employee: HR > Employees > Add. Create an invoice: Finance > Invoices > New Invoice. Export data: use the Export button in each module. Change password: Profile > Settings > Security. Change language: Profile > Settings > Language. View calendar: Calendar in the main menu. For more help, ask your question specifically.",
    sw: "Hapa kuna vitendo vya kawaida: Ongeza mfanyakazi: HR > Wafanyakazi > Ongeza. Unda ankara: Fedha > Ankarate > Ankara Mpya. Toa data: tumia kitufe cha Toa katika kila moduli. Badilisha nywila: Wasifu > Mipangilio > Usalama. Badilisha lugha: Wasifu > Mipangilio > Lugha. Tazama kalenda: Kalenda kwenye menyu kuu. Kwa msaada zaidi, uliza swali lako kwa usahihi.",
  },
  troubleshooting: {
    fr: "Voici des solutions aux problèmes courants :\n- Je ne vois pas mes données : vérifiez les filtres en haut de la page et votre connexion internet.\n- Impossible de me connecter : utilisez 'Mot de passe oublié' sur la page de connexion.\n- Lenteur de la plateforme : actualisez la page (F5) ou videz le cache de votre navigateur.\n- Erreur de sauvegarde : vérifiez que tous les champs obligatoires sont remplis.\n- Je ne reçois pas d'email : vérifiez vos spams ou contactez le support.\n- Un rapport ne s'exporte pas : essayez un autre format (PDF, Excel ou CSV).\n- Les graphiques ne chargent pas : désactivez les bloqueurs de publicité pour ce site.\nSi le problème persiste, contactez le support à support@omnicore.site.",
    en: "Here are solutions to common issues:\n- I can't see my data: check the filters at the top of the page and your internet connection.\n- Can't log in: use 'Forgot password' on the login page.\n- Platform is slow: refresh the page (F5) or clear your browser cache.\n- Save error: check that all required fields are filled.\n- Not receiving emails: check your spam folder or contact support.\n- Report won't export: try another format (PDF, Excel, or CSV).\n- Charts not loading: disable ad blockers for this site.\nIf the problem persists, contact support at support@omnicore.site.",
    sw: "Hapa kuna suluhisho kwa shida za kawaida:\n- Sioni data yangu: angalia vichujio juu ya ukurasa na muunganisho wako wa intaneti.\n- Siwezi kuingia: tumia 'Nywila Nimesahau' kwenye ukurasa wa kuingia.\n- Jukwaa ni polepole: onyesha upya ukurasa (F5) au futa akiba ya kivinjari chako.\n- Hitilafu ya kuhifadhi: hakikisha sehemu zote zinazohitajika zimejazwa.\n- Sipokei barua pepe: angisha spamu yako au wasiliana na usaidizi.\n- Ripoti haitoki: jaribu umbizo lingine (PDF, Excel, au CSV).\n- Chati hazipaki: zima vizuizi vya matangazo kwa tovuti hii.\nIkiwa shida inaendelea, wasiliana na usaidizi kwa support@omnicore.site.",
  },
  rh: {
    fr: "Le module RH d'OmniCore gère : les employés (fiches, contrats, documents), la paie (bulletins, cotisations, déclarations), les présences (pointage, absences, congés), les recrutements (candidatures, entretiens), et les formations. Chaque sous-module a son propre tableau de bord. Les données RH sont exportables en PDF, Excel et CSV.",
    en: "The HR module manages: employees (profiles, contracts, documents), payroll (payslips, contributions, declarations), attendance (clock-in, absences, leave), recruitment (applications, interviews), and training. Each sub-module has its own dashboard. HR data can be exported to PDF, Excel, and CSV.",
    sw: "Moduli ya HR inasimamia: wafanyakazi (wasifu, mikataba, nyaraka), mishahara (hati za mishahara, michango, matamko), mahudhurio (kuingia, kutokuwepo, likizo), uajiri (maombi, mahojiano), na mafunzo. Kila moduli ndogo ina dashibodi yake. Data ya HR inaweza kutolewa kwa PDF, Excel na CSV.",
  },
  finance: {
    fr: "Le module Finance couvre : les factures clients (création, envoi, suivi des paiements), les dépenses (notes de frais, approbations, catégories), les revenus (suivi par source, analyses), la trésorerie (flux, prévisions), et la comptabilité (rapports, balance). Toutes les écritures sont horodatées et tracées. Exportez vos données en PDF, Excel ou CSV.",
    en: "The Finance module covers: customer invoices (creation, sending, payment tracking), expenses (expense reports, approvals, categories), revenue (tracking by source, analysis), cash flow (flows, forecasts), and accounting (reports, balance sheet). All entries are timestamped and traceable. Export your data to PDF, Excel, or CSV.",
    sw: "Moduli ya Fedha inashughulikia: ankara za wateja (uundaji, utumaji, ufuatiliaji wa malipo), gharama (ripoti za gharama, uidhinishaji, kategoria), mapato (ufuatiliaji kwa chanzo, uchambuzi), mtiririko wa pesa (mtiririko, utabiri), na uhasibu (ripoti, mizania). Maingizo yote yana muhuri wa muda na yanaweza kufuatiliwa. Toa data yako kwa PDF, Excel, au CSV.",
  },
  commerce: {
    fr: "Le module Commerce gère : les produits (catalogue, prix, images, catégories), les commandes (suivi, statuts, expédition), les clients (fiches, historique), les stocks (quantités, alertes), et les ventes (rapports, tendances). Le catalogue peut être importé/exporté en CSV. Les commandes sont notifiées en temps réel.",
    en: "The Commerce module manages: products (catalog, prices, images, categories), orders (tracking, statuses, shipping), customers (profiles, history), inventory (quantities, alerts), and sales (reports, trends). The catalog can be imported/exported as CSV. Orders are notified in real time.",
    sw: "Moduli ya Biashara inasimamia: bidhaa (orodha, bei, picha, kategoria), maagizo (ufuatiliaji, hali, usafirishaji), wateja (wasifu, historia), hisa (kiasi, tahadhari), na mauzo (ripoti, mwenendo). Orodha inaweza kuagizwa/kutolewa kama CSV. Maagizo yanarifiwa kwa wakati halisi.",
  },
  pharmacy: {
    fr: "Le module Pharmacie gère : les médicaments (catalogue, principes actifs, fournisseurs), les ordonnances (création, suivi, historique patient), le stock pharmacie (entrées/sorties, alertes de péremption, inventaire), et les ventes pharmaceutiques. Le système alerte automatiquement sur les stocks bas et les produits proches de l'expiration.",
    en: "The Pharmacy module manages: medicines (catalog, active ingredients, suppliers), prescriptions (creation, tracking, patient history), pharmacy stock (in/out, expiry alerts, inventory), and pharmaceutical sales. The system automatically alerts on low stock and near-expiry products.",
    sw: "Moduli ya Famasia inasimamia: dawa (orodha, viambato amilifu, wauzaji), maagizo ya dawa (uundaji, ufuatiliaji, historia ya mgonjwa), hisa za famasia (uingiaji/kutoka, tahadhari za muda wake, hesabu), na mauzo ya dawa. Mfumo unatahadharisha moja kwa moja kuhusu hisa chache na bidhaa zinazokaribia kuisha.",
  },
  healthcare: {
    fr: "Le module Santé gère : les patients (dossiers médicaux, allergies, antécédents), les rendez-vous (planification, rappels, historique), le personnel médical (médecins, infirmiers, plannings), les consultations (comptes rendus, prescriptions), et les documents médicaux. Toutes les données sont sécurisées et conformes aux normes de confidentialité médicale.",
    en: "The Healthcare module manages: patients (medical records, allergies, history), appointments (scheduling, reminders, history), medical staff (doctors, nurses, schedules), consultations (reports, prescriptions), and medical documents. All data is secured and compliant with medical privacy standards.",
    sw: "Moduli ya Afya inasimamia: wagonjwa (kumbukumbu za matibabu, mzio, historia), miadi (kupanga, vikumbusho, historia), wafanyakazi wa matibabu (madaktari, wauguzi, ratiba), mashauriano (ripoti, maagizo), na nyaraka za matibabu. Takwimu zote zinalindwa na kuzingatia viwango vya usiri wa matibabu.",
  },
  education: {
    fr: "Le module Éducation gère : les étudiants (inscriptions, dossiers, tuteurs), les cours (programmes, horaires, enseignants), les classes (affectations, niveaux), les notes (évaluations, bulletins, moyennes), les présences (appel, absences), et le calendrier académique. Les bulletins peuvent être exportés en PDF.",
    en: "The Education module manages: students (enrollment, records, guardians), courses (syllabi, schedules, teachers), classes (assignments, levels), grades (assessments, report cards, averages), attendance (roll call, absences), and the academic calendar. Report cards can be exported as PDF.",
    sw: "Moduli ya Elimu inasimamia: wanafunzi (uandikishaji, kumbukumbu, walezi), kozi (silabasi, ratiba, walimu), madarasa (majukumu, viwango), madaraja (tathmini, kadi za ripoti, wastani), mahudhurio (wito, kutokuwepo), na kalenda ya masomo. Kadi za ripoti zinaweza kutolewa kwa PDF.",
  },
  crm: {
    fr: "Le module CRM gère : les leads (prospects, sources, statuts), les contacts (annuaire, historique), les affaires (opportunités, pipeline, prévisions), et les campagnes (emailing, suivi). Le pipeline vous montre visuellement où chaque opportunité se trouve. Les prévisions de revenus sont mises à jour automatiquement.",
    en: "The CRM module manages: leads (prospects, sources, statuses), contacts (directory, history), deals (opportunities, pipeline, forecasts), and campaigns (emailing, tracking). The pipeline visually shows where each opportunity stands. Revenue forecasts are updated automatically.",
    sw: "Moduli ya CRM inasimamia: wateja watarajiwa (vyanzo, hali), mawasiliano (orodha, historia), mikataba (fursa, bomba, utabiri), na kampeni (barua pepe, ufuatiliaji). Bomba linaonyesha kwa macho kila fursa iko wapi. Utabiri wa mapato husasishwa moja kwa moja.",
  },
  projects: {
    fr: "Le module Projets gère : les projets (jalons, budget, échéances), les tâches (assignation, priorités, statuts), les équipes (membres, rôles), les fichiers (documents, versions), et le temps (suivi des heures, facturation). La vue Gantt permet de visualiser la progression. Les rapports d'avancement sont exportables.",
    en: "The Projects module manages: projects (milestones, budget, deadlines), tasks (assignment, priorities, statuses), teams (members, roles), files (documents, versions), and time (hour tracking, billing). The Gantt view visualizes progress. Progress reports can be exported.",
    sw: "Moduli ya Miradi inasimamia: miradi (hatua muhimu, bajeti, makataa), kazi (ugawaji, vipaumbele, hali), timu (wanachama, majukumu), faili (nyaraka, matoleo), na muda (ufuatiliaji wa saa, malipo). Mwonekano wa Gantt unaonyesha maendeleo. Ripoti za maendeleo zinaweza kutolewa.",
  },
  privacy: {
    fr: "OmniCore prend très au sérieux la protection de vos données personnelles. Notre politique de confidentialité est conforme au RGPD et à la loi congolaise. Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme : nom, email, rôle et préférences. Vos données sont stockées de manière sécurisée chez nos hébergeurs certifiés. Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à privacy@omnicore.site.",
    en: "OmniCore takes your data privacy very seriously. Our privacy policy is GDPR-compliant and follows Congolese law. We only collect data necessary for the platform: name, email, role, and preferences. Your data is stored securely with certified hosting providers. You have the right to access, rectify, delete, and port your data. To exercise these rights, contact us at privacy@omnicore.site.",
    sw: "OmniCore inachukua usiri wa data yako kwa uzito sana. Sera yetu ya faragha inatii GDPR na sheria ya Kongo. Tunakusanya data muhimu tu kwa uendeshaji wa jukwaa: jina, barua pepe, wadhifa na mapendeleo. Data yako imehifadhiwa kwa usalama kwa watoa huduma waliothibitishwa. Una haki ya kufikia, kurekebisha, kufuta na kuhamisha data yako. Kutumia haki hizi, wasiliana nasi kwa privacy@omnicore.site.",
  },
  cookies: {
    fr: "OmniCore utilise des cookies essentiels pour le fonctionnement de la plateforme. Ces cookies sont nécessaires à l'authentification, à la sécurité et à la mémorisation de vos préférences (thème, langue). Nous n'utilisons pas de cookies publicitaires ou de traçage tiers. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.",
    en: "OmniCore uses essential cookies for platform functionality. These cookies are necessary for authentication, security, and remembering your preferences (theme, language). We do not use advertising or third-party tracking cookies. You can manage cookie preferences in your browser settings.",
    sw: "OmniCore hutumia vidakuzi muhimu kwa uendeshaji wa jukwaa. Vidakuzi hivi ni muhimu kwa uthibitishaji, usalama na kukumbuka mapendeleo yako (mandhari, lugha). Hatutumii vidakuzi vya matangazo au ufuatiliaji wa watu wengine. Unaweza kudhibiti mapendeleo ya vidakuzi katika mipangilio ya kivinjari chako.",
  },
  about: {
    fr: "OmniCore est une plateforme ERP cloud moderne basée à Kalemie, dans la province du Tanganyika, en République Démocratique du Congo. Notre mission est de digitaliser et simplifier la gestion des entreprises congolaises avec des outils adaptés au contexte local. Notre vision : devenir le leader des solutions de gestion intégrées en Afrique centrale. Nous proposons des modules RH, Finance, Commerce, Pharmacie, Santé, Éducation, Projets et CRM — le tout dans une plateforme unifiée et multilingue (français, anglais, swahili). L'équipe OmniCore est dirigée par John Mocket et une équipe passionnée de développeurs et d'experts métier congolais.",
    en: "OmniCore is a modern cloud ERP platform based in Kalemie, Tanganyika Province, Democratic Republic of Congo. Our mission is to digitize and simplify business management for Congolese companies with tools adapted to the local context. Our vision: to become the leading integrated management solutions provider in Central Africa. We offer HR, Finance, Commerce, Pharmacy, Healthcare, Education, Projects, and CRM modules — all in one unified, multilingual platform (French, English, Swahili). The OmniCore team is led by John Mocket and a passionate team of Congolese developers and business experts.",
    sw: "OmniCore ni jukwaa la kisasa la ERP la wingu lenye makao yake Kalemie, Mkoa wa Tanganyika, Jamhuri ya Kidemokrasia ya Kongo. Dhamira yetu ni kudigitalisha na kurahisisha usimamizi wa biashara kwa makampuni ya Kongo kwa zana zinazofaa mazingira ya ndani. Maono yetu: kuwa kiongozi wa suluhisho za usimamizi jumuishi Afrika ya Kati. Tunatoa moduli za HR, Fedha, Biashara, Famasia, Afya, Elimu, Miradi na CRM — zote katika jukwaa moja la lugha nyingi (Kifaransa, Kiingereza, Kiswahili). Timu ya OmniCore inaongozwa na John Mocket na timu ya wazalendo ya wasanidi programu na wataalam wa biashara wa Kongo.",
  },
  logo: {
    fr: "Le logo OmniCore représente notre vision d'une plateforme complète et unifiée. Il est composé d'un design moderne aux couleurs bleu et violet, symbolisant la confiance et l'innovation. Vous trouverez le logo dans tous les supports de la plateforme : page d'accueil, en-tête, barre latérale, et icône de l'application. Il est disponible au format PNG et SVG dans le dossier public de l'application.",
    en: "The OmniCore logo represents our vision of a complete and unified platform. It features a modern design in blue and purple, symbolizing trust and innovation. You will find the logo throughout the platform: homepage, header, sidebar, and app icon. It is available in PNG and SVG formats in the application's public folder.",
    sw: "Nembo ya OmniCore inawakilisha maono yetu ya jukwaa kamili na lililounganishwa. Ina muundo wa kisasa wa rangi ya bluu na zambarau, inayoashiria uaminifu na uvumbuzi. Utapata nembo katika jukwaa lote: ukurasa wa mwanzo, kichwa, upau wa pembeni na ikoni ya programu. Inapatikana katika muundo wa PNG na SVG kwenye folda ya umma ya programu.",
  },
  contact: {
    fr: "Vous pouvez contacter l'équipe OmniCore par email à contact@omnicore.site ou par téléphone au +243 XX XXX XXXX. Notre siège est situé à Kalemie, province du Tanganyika, République Démocratique du Congo. Nous sommes disponibles du lundi au vendredi de 8h à 17h. Vous pouvez également utiliser le formulaire de contact sur notre site pour toute demande d'assistance, d'information commerciale ou de partenariat.",
    en: "You can contact the OmniCore team by email at contact@omnicore.site or by phone at +243 XX XXX XXXX. Our headquarters is located in Kalemie, Tanganyika Province, Democratic Republic of Congo. We are available Monday to Friday from 8 AM to 5 PM. You can also use the contact form on our site for support, sales inquiries, or partnership requests.",
    sw: "Unaweza kuwasiliana na timu ya OmniCore kwa barua pepe contact@omnicore.site au kwa simu +243 XX XXX XXXX. Makao yetu makuu yapo Kalemie, Mkoa wa Tanganyika, Jamhuri ya Kidemokrasia ya Kongo. Tunapatikana Jumatatu hadi Ijumaa kutoka 8:00 hadi 17:00. Unaweza pia kutumia fomu ya mawasiliano kwenye tovuti yetu kwa usaidizi, maswali ya biashara au maombi ya ushirikiano.",
  },
  help: {
    fr: "Je suis là pour vous aider avec toutes les fonctionnalités d'OmniCore. Posez-moi des questions sur : le tableau de bord, les modules (RH, Finance, Commerce, Pharmacie, Santé, Éducation, Projets, CRM), l'export de données, les rapports, les analyses détaillées, la résolution de problèmes, la confidentialité, l'entreprise, le logo, ou les contacts.",
    en: "I'm here to help you with all OmniCore features. Ask me about: the dashboard, modules (HR, Finance, Commerce, Pharmacy, Healthcare, Education, Projects, CRM), data export, reports, detailed analytics, troubleshooting, privacy, the company, the logo, or contact information.",
    sw: "Niko hapa kukusaidia na vipengele vyote vya OmniCore. Niulize kuhusu: dashibodi, moduli (HR, Fedha, Biashara, Famasia, Afya, Elimu, Miradi, CRM), utoaji wa data, ripoti, uchambuzi wa kina, utatuzi wa shida, faragha, kampuni, nembo, au mawasiliano.",
  },
  greeting: {
    fr: "Bonjour ! Je suis OmniCore AI, votre assistant intelligent. Je peux vous aider avec tous les modules de la plateforme : RH, Finance, Commerce, Pharmacie, Santé, Éducation, Projets, CRM. Je peux aussi vous expliquer comment exporter des fichiers, analyser les tableaux de bord, résoudre des problèmes, ou vous renseigner sur la confidentialité et l'entreprise. Comment puis-je vous aider aujourd'hui ?",
    en: "Hello! I am OmniCore AI, your intelligent assistant. I can help you with all platform modules: HR, Finance, Commerce, Pharmacy, Healthcare, Education, Projects, CRM. I can also explain how to export files, analyze dashboards, troubleshoot issues, or tell you about privacy and the company. How can I help you today?",
    sw: "Habari! Mimi ni OmniCore AI, msaidizi wako mahiri. Ninaweza kukusaidia na moduli zote za jukwaa: HR, Fedha, Biashara, Famasia, Afya, Elimu, Miradi, CRM. Ninaweza pia kuelezea jinsi ya kutoa faili, kuchambua dashibodi, kutatua shida, au kukuelezea kuhusu faragha na kampuni. Ninaweza kukusaidiaje leo?",
  },
  default: {
    fr: "Merci pour votre question. Je suis OmniCore AI, votre assistant intelligent. Pour vous aider au mieux, précisez votre demande. Je peux vous renseigner sur : les modules (RH, Finance, Commerce, Pharmacie, Santé, Éducation, Projets, CRM), le tableau de bord, l'export de fichiers, les analyses, les rapports, la résolution de problèmes, ou l'entreprise. Dites-m'en plus !",
    en: "Thank you for your question. I am OmniCore AI, your intelligent assistant. To help you best, please specify your request. I can tell you about: modules (HR, Finance, Commerce, Pharmacy, Healthcare, Education, Projects, CRM), the dashboard, file exports, analytics, reports, troubleshooting, or the company. Tell me more!",
    sw: "Asante kwa swali lako. Mimi ni OmniCore AI, msaidizi wako mahiri. Kukusaidia vyema, tafadhali eleza ombi lako. Ninaweza kukuelezea kuhusu: moduli (HR, Fedha, Biashara, Famasia, Afya, Elimu, Miradi, CRM), dashibodi, utoaji wa faili, uchambuzi, ripoti, utatuzi wa shida, au kampuni. Niambie zaidi!",
  },
};

interface TopicRule {
  key: string;
  words: string[];
  priority: number;
  subRules?: { words: string[]; key: string }[];
}

const TOPIC_RULES: TopicRule[] = [
  { key: "dashboard_analytics", words: ["analytique", "analytics", "statistique", "graphique", "tendance", "analyse", "analysis", "insight", "bi", "indicateur", "kpi", "performance", "metric", "apercu", "chiffre"], priority: 2 },
  { key: "export", words: ["export", "exporter", "exportation", "extraction", "telecharger", "download", "pdf", "excel", "csv", "format", "fichier", "file"], priority: 5 },
  { key: "export_from_dashboard", words: ["export", "exporter", "dashboard", "tableau", "widget"], priority: 3 },
  { key: "report", words: ["rapport", "report", "ripoti", "repport"], priority: 5 },
  { key: "faq_how_to", words: ["comment", "how", "jinsi", "faire", "do", "make", "creer", "ajouter", "modifier", "supprimer", "changer", "voir", "trouver", "ou"], priority: 1 },
  { key: "troubleshooting", words: ["probleme", "problem", "erreur", "error", "bug", "issue", "matatizo", "marche pas", "ne fonctionne", "pas marche", "bloque", "lent", "slow", "plantage", "crash", "solved", "fix", "corriger", "solution"], priority: 5 },
  { key: "rh", words: ["rh", "hr", "ressourcehumaine", "employe", "paie", "payroll", "presence", "absence", "conge", "recrutement", "formation", "staff"], priority: 3 },
  { key: "finance", words: ["finance", "fedha", "facture", "depense", "revenu", "comptabilite", "tresorerie", "billing", "invoice", "expense", "revenue"], priority: 3 },
  { key: "commerce", words: ["commerce", "biashara", "boutique", "shop", "produit", "commande", "vente", "stock", "catalogue"], priority: 3 },
  { key: "pharmacy", words: ["pharmacie", "pharmacy", "famasia", "pharma", "medicament", "dawa", "ordonnance", "prescription"], priority: 3 },
  { key: "healthcare", words: ["sante", "health", "healthcare", "afya", "medical", "patient", "hopital", "clinique", "rdv", "docteur", "infirmier"], priority: 3 },
  { key: "education", words: ["education", "education", "elimu", "ecole", "school", "etudiant", "student", "cours", "course", "classe", "professeur", "enseignant"], priority: 3 },
  { key: "crm", words: ["crm", "client", "lead", "prospect", "deal", "affaire", "pipeline", "campagne", "marketing"], priority: 3 },
  { key: "projects", words: ["projet", "project", "mradi", "tache", "task", "kazi", "gantt", "jalon", "milestone"], priority: 3 },
  { key: "privacy", words: ["confidentialite", "privacy", "prive", "donnee", "data", "rgpd", "gdpr", "faragha"], priority: 3 },
  { key: "cookies", words: ["cookie", "cookies", "vidakuzi", "temoin"], priority: 3 },
  { key: "about", words: ["apropos", "about", "entreprise", "company", "societe", "kampuni", "mission", "vision", "fondateur", "equipe", "team", "histoire", "qui"], priority: 2 },
  { key: "logo", words: ["logo", "nembo", "brand", "marque", "icone", "symbole"], priority: 2 },
  { key: "contact", words: ["contact", "contacter", "wasiliana", "telephone", "phone", "simu", "adresse", "address", "email", "courrier", "coordonnee"], priority: 2 },
  { key: "dashboard", words: ["dashboard", "dashibodi", "tableaubord", "board", "acceuil"], priority: 1 },
  { key: "settings", words: ["parametre", "setting", "mipangilio", "config", "preference", "reglage"], priority: 1 },
  { key: "profile", words: ["profil", "profile", "wasifu", "compte", "account", "avatar", "motdepasse", "password", "nywila"], priority: 1 },
  { key: "workspace", words: ["workspace", "espace", "nafasi", "organisation", "organization", "administration"], priority: 1 },
];

function scoreTopics(text: string): { key: string; score: number }[] {
  const n = normalize(text);
  const tokens = n.split(/\s+/).filter(Boolean);

  const results: { key: string; score: number }[] = [];

  for (const rule of TOPIC_RULES) {
    let score = 0;
    const normRuleWords = rule.words.map(w => normalize(w));

    for (const token of tokens) {
      if (NORM_MAP[token]) {
        const mapped = NORM_MAP[token];
        if (normRuleWords.includes(mapped)) {
          score += 2;
        }
      }
      if (normRuleWords.includes(token)) {
        score += 3;
      }
      for (const rw of normRuleWords) {
        if (rw.length > 3 && (token.includes(rw) || rw.includes(token))) {
          score += 1;
        }
      }
    }

    for (const rw of normRuleWords) {
      if (n.includes(rw)) {
        score += 2;
      }
    }

    if (rule.subRules) {
      for (const sub of rule.subRules) {
        for (const sw of sub.words) {
          if (n.includes(normalize(sw))) {
            score += 4;
          }
        }
      }
    }

    score *= rule.priority;

    if (score > 0) {
      results.push({ key: rule.key, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function detectFrustration(text: string): "frustrated" | "sad" | "angry" | null {
  const n = normalize(text);
  const frustratedWords = ["frustre", "frustrated", "enerve", "enerve", "agace", "saoul", "sature", "lass", "fatigue", "marre", "raslebol", "ras le bol", "pulse", "exaspere", "exasperer"];
  const sadWords = ["triste", "sad", "decourage", "decu", "deception", "peur", "inquiet", "stress", "stresse", "deprime"];
  const angryWords = ["colere", "en colere", "angry", "fache", "furieux", "rage", "nerve", "craque", "crise", "insulte", "pute", "merde", "connard", "imbecile", "imbécile"];

  for (const w of frustratedWords) { if (n.includes(w)) return "frustrated"; }
  for (const w of sadWords) { if (n.includes(w)) return "sad"; }
  for (const w of angryWords) { if (n.includes(w)) return "angry"; }
  return null;
}

const emotionalResponses: Record<string, ResponseMap> = {
  frustrated: {
    fr: "Je comprends votre frustration, et je suis là pour vous aider à résoudre ce problème rapidement. Dites-moi ce qui ne va pas et je ferai de mon mieux pour vous trouver une solution.",
    en: "I understand your frustration, and I'm here to help you resolve this quickly. Tell me what's wrong and I'll do my best to find a solution.",
    sw: "Naelewa kuchoka kwako, na niko hapa kukusaidia kutatua tatizo hili haraka. Niambie tatizo lako na nitafanya bidii kupata suluhisho.",
  },
  sad: {
    fr: "Je suis désolé que vous ressentiez cela. N'hésitez pas à me parler de ce qui ne va pas, je suis là pour vous écouter et vous aider.",
    en: "I'm sorry you're feeling this way. Please feel free to tell me what's wrong, I'm here to listen and help.",
    sw: "Samahani kwamba unahisi hivi. Tafadhali niambie tatizo lako, niko hapa kukusikiliza na kukusaidia.",
  },
  angry: {
    fr: "Je comprends que vous soyez énervé. Je vais faire tout mon possible pour résoudre votre problème. Expliquez-moi ce qui s'est passé, je vous écoute.",
    en: "I understand you're upset. I'll do everything I can to resolve your issue. Tell me what happened, I'm listening.",
    sw: "Naelewa kuwa umekasirika. Nitafanya kila niwezalo kutatua tatizo lako. Niambie kilichotokea, ninasikiliza.",
  },
};

function getResponse(message: string, lang: "fr" | "en" | "sw", previousMessages: string[]): string {
  const lower = message.toLowerCase();
  const n = normalize(lower);
  const prevContext = previousMessages.join(" ").toLowerCase();

  const emotion = detectFrustration(message);
  if (emotion) {
    return emotionalResponses[emotion][lang];
  }

  if (/\b(bonjour|salut|coucou|hello|hi|hey|habari|jambo|hujambo|salam|salamu|bjr|slt)\b/.test(lower)) {
    return responses.greeting[lang];
  }

  if (/\b(merci|asante|thank|thanks|merci|shukran|merci beaucoup)\b/.test(lower)) {
    return `De rien ! Je suis là pour vous aider. N'hésitez pas si vous avez d'autres questions.`;
  }

  if (/\b(au revoir|bye|goodbye|kwa heri|a plus|tchao|see you|baadaye|a toute)\b/.test(lower)) {
    return `Au revoir ! N'hésitez pas à revenir si vous avez besoin d'aide. Bonne journée !`;
  }

  if (/\b(help|aide|msaada|assist|soutenir|aider|kusaidia|peux.tu|can.you|unaweza)$\b/.test(lower) && !n.includes("export") && !n.includes("probleme")) {
    return responses.help[lang];
  }

  const scores = scoreTopics(message);

  if (scores.length > 0) {
    const topScore = scores[0].score;
    const topMatches = scores.filter(s => s.score >= topScore * 0.6);

    if (topMatches.length > 1) {
      const seen = new Set<string>();
      const unique = topMatches.filter(m => {
        const dedupKey = m.key.replace("_from_dashboard", "").replace("_analytics", "");
        if (seen.has(dedupKey)) return false;
        seen.add(dedupKey);
        return true;
      });

      if (unique.length >= 2 && unique[0].score > unique[1].score * 1.5) {
        return responses[unique[0].key]?.[lang] || responses.default[lang];
      }

      if (unique.length >= 2) {
        const parts: string[] = [];
        const added = new Set<string>();
        for (const m of unique) {
          const base = m.key.replace("_from_dashboard", "").replace("_analytics", "");
          if (!added.has(base) && responses[m.key]) {
            parts.push(responses[m.key][lang]);
            added.add(base);
          }
          if (parts.length >= 2) break;
        }
        return parts.join("\n\n");
      }
    }

    if (responses[scores[0].key]) {
      return responses[scores[0].key][lang];
    }
  }

  if (n.includes("export") || n.includes("fichier") || n.includes("pdf") || n.includes("excel") || n.includes("csv") || n.includes("telecharger") || n.includes("download")) {
    if (n.includes("dashboard") || n.includes("tableau") || n.includes("dashibodi") || n.includes("widget")) {
      return responses.export_from_dashboard[lang];
    }
    return responses.export[lang];
  }

  if (n.includes("probleme") || n.includes("problem") || n.includes("erreur") || n.includes("error") || n.includes("bug") || n.includes("issue") || n.includes("matatizo") || n.includes("marche pas") || n.includes("bloque")) {
    return responses.troubleshooting[lang];
  }

  if (/\b(quoi|que|quel|quelle|quels|quelles|what|which|nini|gani)\b/.test(lower) && n.includes("dashboard")) {
    return responses.dashboard_analytics[lang];
  }

  if (prevContext) {
    const prevScores = scoreTopics(prevContext);
    if (prevScores.length > 0 && responses[prevScores[0].key]) {
      return `Pour faire suite à votre question précédente : ${responses[prevScores[0].key][lang]}`;
    }
  }

  return responses.default[lang];
}

export async function POST(req: Request) {
  try {
    if (!validateCSRFRequest(req)) {
      return NextResponse.json({ error: "Requête non autorisée" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Type de contenu invalide" }, { status: 415 });
    }

    const origin = req.headers.get("origin") || "";
    const host = req.headers.get("host") || "";
    const vercelUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    if (origin && !origin.includes(host) && !origin.includes(vercelUrl) && !origin.includes("localhost")) {
      return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Veuillez vous connecter pour utiliser l'assistant OmniCore AI." }, { status: 401 });
    }

    const ip = getClientIdentifier(req);
    const burstCheck = checkBurst(ip);
    if (!burstCheck.allowed) {
      return NextResponse.json(
        { error: `Trop de requêtes. Réessayez dans ${burstCheck.retryAfter} secondes.` },
        { status: 429, headers: { "Retry-After": String(burstCheck.retryAfter), "X-RateLimit-Limit": String(BURST_LIMIT), "X-RateLimit-Remaining": "0" } }
      );
    }

    const rateCheck = await checkRateLimit("chat", `user:${user.id}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Limite de messages atteinte. Réessayez dans ${rateCheck.retryAfter} secondes.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter), "X-RateLimit-Limit": "5", "X-RateLimit-Remaining": String(rateCheck.remaining) } }
      );
    }

    const body = await req.json();
    const { messages, locale: requestLocale } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages requis" }, { status: 400 });
    }

    const sanitizedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: sanitizeInput(m.content).substring(0, MAX_MESSAGE_LENGTH),
    }));

    for (const msg of sanitizedMessages) {
      if (msg.content.length === 0) {
        return NextResponse.json({ error: "Message invalide" }, { status: 400 });
      }
    }

    const scriptPattern = /[\u0000-\u001F]|[\u007F-\u009F]|\\u00[0-9a-fA-F]{2}|javascript:|data:|vbscript:/i;
    for (const msg of sanitizedMessages) {
      if (scriptPattern.test(msg.content)) {
        return NextResponse.json({ error: "Message invalide" }, { status: 400 });
      }
    }

    const allUserMessages = sanitizedMessages.filter((m: { role: string }) => m.role === "user").slice(-3).map((m: { content: string }) => m.content);
    const lastUserMessage = allUserMessages[allUserMessages.length - 1] || "";
    const previousMessages = allUserMessages.slice(0, -1);

    const lang = detectLanguage(lastUserMessage, requestLocale);
    const response = getResponse(lastUserMessage, lang, previousMessages);

    const safeResponse = response.replace(/javascript:|data:|<script|<\/script>/gi, "");

    return NextResponse.json({ role: "assistant", content: safeResponse, language: lang });
  } catch (error) {
    console.error("AI Chat error");
    return NextResponse.json({ error: "Erreur lors du traitement de la demande." }, { status: 500 });
  }
}
