import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

function detectLanguage(text: string): "fr" | "en" | "sw" {
  const swWords = [
    "habari", "msaada", "tafadhali", "asante", "sawa", "ndiyo", "hapana",
    "mfanyakazi", "mwanafunzi", "mgonjwa", "dawa", "hesabu", "ankara",
    "bidhaa", "agizo", "hisa", "kozi", "darasa", "mwalimu", "ratiba",
    "kazi", "mkutano", "ripoti", "taarifa", "nyaraka", "malipo",
  ];
  const frWords = [
    "bonjour", "merci", "svp", "aide", "employé", "facture", "client",
    "produit", "commande", "stock", "médicament", "patient", "rdv",
    "élève", "professeur", "cours", "classe", "projet", "tâche",
    "calendrier", "paramètres", "profil", "espace", "tableau de bord",
    "comment", "pourquoi", "pouvez-vous", "aide-moi",
  ];

  const lower = text.toLowerCase();
  let swScore = 0;
  let frScore = 0;
  let enScore = 0;

  for (const w of swWords) {
    if (lower.includes(w)) swScore++;
  }
  for (const w of frWords) {
    if (lower.includes(w)) frScore++;
  }

  const enWords = [
    "hello", "help", "please", "thank", "how", "what", "why", "where",
    "when", "employee", "invoice", "customer", "product", "order",
    "dashboard", "settings", "profile", "workspace", "project",
  ];
  for (const w of enWords) {
    if (lower.includes(w)) enScore++;
  }

  if (swScore > frScore && swScore > enScore) return "sw";
  if (frScore >= enScore) return "fr";
  return "en";
}

const responses: Record<string, { fr: string; en: string; sw: string }> = {
  dashboard: {
    fr: "Le tableau de bord OmniCore vous offre une vue d'ensemble de votre activité. Vous y trouverez des graphiques sur les ventes, les revenus, les employés actifs et les indicateurs clés. Utilisez les filtres en haut pour personnaliser l'affichage par période ou par module.",
    en: "The OmniCore dashboard gives you a complete overview of your business. You'll find charts on sales, revenue, active employees, and key metrics. Use the filters at the top to customize the view by period or module.",
    sw: "Dashibodi ya OmniCore inakupa muhtasari kamili wa shughuli zako. Utapata chati za mauzo, mapato, wafanyakazi hai na viashiria muhimu. Tumia vichujio juu kubadilisha mwonekano kwa muda au moduli.",
  },
  hr_employee: {
    fr: "Pour ajouter un employé, allez dans RH > Employés et cliquez sur 'Ajouter un employé'. Remplissez les informations (nom, email, poste, département, salaire) puis validez. L'employé recevra une invitation par email.",
    en: "To add an employee, go to HR > Employees and click 'Add Employee'. Fill in the details (name, email, position, department, salary) then submit. The employee will receive an email invitation.",
    sw: "Ili kuongeza mfanyakazi, nenda HR > Wafanyakazi na ubonyeze 'Ongeza Mfanyakazi'. Jaza taarifa (jina, barua pepe, wadhifa, idara, mshahara) kisha wasilisha. Mfanyakazi atapokea mwaliko kwa barua pepe.",
  },
  hr_payroll: {
    fr: "La gestion de la paie se trouve dans RH > Paie. Vous pouvez générer les bulletins de paie, gérer les cotisations et suivre les paiements. Les rapports de paie sont exportables en PDF et Excel.",
    en: "Payroll management is in HR > Payroll. You can generate pay slips, manage contributions, and track payments. Payroll reports can be exported to PDF and Excel.",
    sw: "Usimamizi wa mishahara upo HR > Mishahara. Unaweza kutoa hati za mishahara, kusimamia michango na kufuatilia malipo. Ripoti za mishahara zinaweza kutolewa kwa PDF na Excel.",
  },
  hr_attendance: {
    fr: "Le module de présence dans RH > Présences permet de suivre les pointages, les absences et les congés. Les employés peuvent pointer via l'application mobile et vous pouvez générer des rapports de présence.",
    en: "The attendance module in HR > Attendance lets you track check-ins, absences, and leave. Employees can clock in via the mobile app and you can generate attendance reports.",
    sw: "Moduli ya mahudhurio katika HR > Mahudhurio hukuruhusu kufuatilia kuingia, kutokuwepo na likizo. Wafanyakazi wanaweza kuingia kwa kutumia programu ya simu na unaweza kutoa ripoti za mahudhurio.",
  },
  finance_invoice: {
    fr: "Pour créer une facture, allez dans Finance > Factures et cliquez sur 'Nouvelle facture'. Sélectionnez le client, ajoutez les articles, définissez les taxes et les délais de paiement. Vous pouvez envoyer la facture directement par email.",
    en: "To create an invoice, go to Finance > Invoices and click 'New Invoice'. Select the customer, add line items, set taxes and payment terms. You can send the invoice directly by email.",
    sw: "Ili kuunda ankara, nenda Fedha > Ankarate na ubonyeze 'Ankara Mpya'. Chagua mteja, ongeza bidhaa, weka kodi na masharti ya malipo. Unaweza kutuma ankara moja kwa moja kwa barua pepe.",
  },
  finance_expense: {
    fr: "La gestion des dépenses se trouve dans Finance > Dépenses. Vous pouvez enregistrer les dépenses par catégorie, les rattacher à des projets et suivre les approbations. Les reçus peuvent être scannés et attachés.",
    en: "Expense management is in Finance > Expenses. You can record expenses by category, link them to projects, and track approvals. Receipts can be scanned and attached.",
    sw: "Usimamizi wa gharama upo Fedha > Gharama. Unaweza kurekodi gharama kwa kategoria, kuziunganisha na miradi na kufuatilia uidhinishaji. Stakabadhi zinaweza kuchanganuliwa na kuambatishwa.",
  },
  finance_revenue: {
    fr: "Le suivi des revenus est disponible dans Finance > Revenus. Vous pouvez visualiser les revenus par source, période et comparer avec les objectifs. Les graphiques interactifs vous aident à analyser les tendances.",
    en: "Revenue tracking is available in Finance > Revenue. You can view revenue by source, period and compare against targets. Interactive charts help you analyze trends.",
    sw: "Ufuatiliaji wa mapato unapatikana katika Fedha > Mapato. Unaweza kutazama mapato kwa chanzo, kipindi na kulinganisha na malengo. Chati shirikishi hukusaidia kuchambua mwenendo.",
  },
  commerce_product: {
    fr: "Pour gérer vos produits, allez dans Commerce > Produits. Vous pouvez ajouter des produits avec descriptions, prix, images et catégories. Le stock est mis à jour automatiquement lors des ventes.",
    en: "To manage your products, go to Commerce > Products. You can add products with descriptions, prices, images, and categories. Stock is updated automatically with each sale.",
    sw: "Ili kusimamia bidhaa zako, nenda Biashara > Bidhaa. Unaweza kuongeza bidhaa kwa maelezo, bei, picha na kategoria. Hisa husasishwa moja kwa moja wakati wa mauzo.",
  },
  commerce_order: {
    fr: "Les commandes sont gérées dans Commerce > Commandes. Vous pouvez voir le statut des commandes, les détails de livraison et l'historique des paiements. Les notifications sont envoyées aux clients automatiquement.",
    en: "Orders are managed in Commerce > Orders. You can view order status, shipping details, and payment history. Notifications are sent to customers automatically.",
    sw: "Maagizo yanasimamiwa katika Biashara > Maagizo. Unaweza kutazama hali ya agizo, maelezo ya usafirishaji na historia ya malipo. Arifa hutumwa kwa wateja moja kwa moja.",
  },
  pharmacy_medicine: {
    fr: "La gestion des médicaments se trouve dans Pharmacie > Médicaments. Vous pouvez suivre les stocks, les dates d'expiration et les fournisseurs. Le système alerte automatiquement quand le stock est bas.",
    en: "Medicine management is in Pharmacy > Medicines. You can track stock, expiration dates, and suppliers. The system automatically alerts when stock is low.",
    sw: "Usimamizi wa dawa upo Famasia > Dawa. Unaweza kufuatilia hisa, tarehe za mwisho wa matumizi na wauzaji. Mfumo unatahadharisha moja kwa moja hisa inapopungua.",
  },
  pharmacy_prescription: {
    fr: "Les ordonnances sont gérées dans Pharmacie > Ordonnances. Vous pouvez créer, suivre et archiver les prescriptions. Les ordonnances sont liées aux patients et aux médecins prescripteurs.",
    en: "Prescriptions are managed in Pharmacy > Prescriptions. You can create, track, and archive prescriptions. They are linked to patients and prescribing doctors.",
    sw: "Maagizo ya dawa yanasimamiwa katika Famasia > Maagizo. Unaweza kuunda, kufuatilia na kuhifadhi maagizo. Yanaunganishwa na wagonjwa na madaktari wanaoagiza.",
  },
  pharmacy_stock: {
    fr: "Le suivi des stocks pharmacie est dans Pharmacie > Stock. Gérez les entrées/sorties, les inventaires et les alertes de péremption. Les mouvements sont tracés en temps réel.",
    en: "Pharmacy stock tracking is in Pharmacy > Stock. Manage inbound/outbound, inventory counts, and expiry alerts. All movements are tracked in real-time.",
    sw: "Ufuatiliaji wa hisa za famasia upo Famasia > Hisa. Simamia mapokeo/utoaji, hesabu za orodha na tahadhari za muda wake. Harakati zote zinafuatiliwa kwa wakati halisi.",
  },
  healthcare_patient: {
    fr: "Les patients sont gérés dans Santé > Patients. Vous pouvez créer des dossiers patients avec historique médical, allergies, traitements en cours et rendez-vous. Les données sont sécurisées et confidentielles.",
    en: "Patients are managed in Healthcare > Patients. You can create patient records with medical history, allergies, ongoing treatments, and appointments. All data is secure and confidential.",
    sw: "Wagonjwa wanasimamiwa katika Afya > Wagonjwa. Unaweza kuunda kumbukumbu za wagonjwa kwa historia ya matibabu, mzio, matibabu yanayoendelea na miadi. Takwimu zote ni salama na za siri.",
  },
  healthcare_appointment: {
    fr: "Les rendez-vous sont dans Santé > Rendez-vous. Planifiez, modifiez ou annulez des rendez-vous. Le calendrier montre les disponibilités et les rappels sont envoyés automatiquement aux patients.",
    en: "Appointments are in Healthcare > Appointments. Schedule, modify, or cancel appointments. The calendar shows availability and reminders are sent automatically to patients.",
    sw: "Miadi ipo Afya > Miadi. Panga, badilisha au ghairi miadi. Kalenda inaonyesha upatikanaji na vikumbusho vinatumwa kwa wagonjwa moja kwa moja.",
  },
  healthcare_staff: {
    fr: "Le personnel médical est géré dans Santé > Personnel. Ajoutez des médecins, infirmiers et techniciens avec leurs spécialités, horaires et disponibilités. Les plannings sont visibles sur le calendrier.",
    en: "Medical staff is managed in Healthcare > Staff. Add doctors, nurses, and technicians with their specialties, schedules, and availability. Rosters are visible on the calendar.",
    sw: "Wafanyakazi wa matibabu wanasimamiwa katika Afya > Wafanyakazi. Ongeza madaktari, wauguzi na mafundi kwa utaalamu wao, ratiba na upatikanaji. Ratiba zinaonekana kwenye kalenda.",
  },
  education_student: {
    fr: "Les étudiants sont gérés dans Éducation > Étudiants. Inscrivez les étudiants avec leurs informations personnelles, classe, et tuteurs. Suivez leur assiduité et leurs performances académiques.",
    en: "Students are managed in Education > Students. Enroll students with personal details, class, and guardians. Track attendance and academic performance.",
    sw: "Wanafunzi wanasimamiwa katika Elimu > Wanafunzi. Andikisha wanafunzi kwa maelezo ya kibinafsi, darasa na walezi. Fuatilia mahudhurio na utendaji wa kitaaluma.",
  },
  education_course: {
    fr: "Les cours sont dans Éducation > Cours. Créez des cours avec programmes, horaires et enseignants. Les notes, devoirs et examens sont gérés par cours. Les étudiants voient leurs cours dans leur portail.",
    en: "Courses are in Education > Courses. Create courses with syllabi, schedules, and teachers. Grades, assignments, and exams are managed per course. Students view their courses on their portal.",
    sw: "Kozi ziko Elimu > Kozi. Unda kozi kwa silabasi, ratiba na walimu. Madaraja, kazi na mitihani husimamiwa kwa kila kozi. Wanafunzi huona kozi zao kwenye lango lao.",
  },
  education_class: {
    fr: "Les classes sont gérées dans Éducation > Classes. Organisez les classes par niveau, section et année académique. Affectez les élèves et les professeurs principaux à chaque classe.",
    en: "Classes are managed in Education > Classes. Organize classes by level, section, and academic year. Assign students and homeroom teachers to each class.",
    sw: "Madarasa yanasimamiwa katika Elimu > Madarasa. Panga madarasa kwa kiwango, sehemu na mwaka wa masomo. Wape wanafunzi na walimu wakuu kwa kila darasa.",
  },
  project: {
    fr: "Les projets sont dans Projets. Créez des projets avec des jalons, des tâches et des échéances. Assignez des membres d'équipe et suivez la progression avec des diagrammes de Gantt.",
    en: "Projects are in Projects. Create projects with milestones, tasks, and deadlines. Assign team members and track progress with Gantt charts.",
    sw: "Miradi ipo Miradi. Unda miradi kwa hatua muhimu, kazi na makataa. Wape wanatimu na fuatilia maendeleo kwa chati za Gantt.",
  },
  task: {
    fr: "Les tâches sont dans Tâches. Créez des tâches, assignez-les aux membres de l'équipe, définissez des priorités et des échéances. Les tâches peuvent être liées aux projets et aux calendriers.",
    en: "Tasks are in Tasks. Create tasks, assign them to team members, set priorities and deadlines. Tasks can be linked to projects and calendars.",
    sw: "Kazi ziko Kazi. Unda kazi, wape wanatimu, weka vipaumbele na makataa. Kazi zinaweza kuunganishwa na miradi na kalenda.",
  },
  calendar: {
    fr: "Le calendrier centralise tous vos événements, rendez-vous et échéances. Vous pouvez voir les calendriers par module (RH, Santé, Projets) et les synchroniser avec Google Calendar ou Outlook.",
    en: "The calendar centralizes all your events, appointments, and deadlines. You can view calendars by module (HR, Healthcare, Projects) and sync with Google Calendar or Outlook.",
    sw: "Kalenda inaunganisha matukio yako yote, miadi na makataa. Unaweza kutazama kalenda kwa moduli (HR, Afya, Miradi) na kusawazisha na Google Calendar au Outlook.",
  },
  crm_lead: {
    fr: "Les leads sont gérés dans CRM > Leads. Suivez vos prospects, leur source, leur statut et les actions commerciales. Le pipeline vous montre visuellement l'avancement de chaque lead.",
    en: "Leads are managed in CRM > Leads. Track your prospects, their source, status, and sales actions. The pipeline shows you the progress of each lead visually.",
    sw: "Wateja watarajiwa wanasimamiwa katika CRM > Wateja Watarajiwa. Fuatilia wateja watarajiwa, chanzo chao, hali na hatua za mauzo. Bomba linaloonyesha maendeleo ya kila mteja kwa macho.",
  },
  crm_contact: {
    fr: "Les contacts sont dans CRM > Contacts. Gérez vos contacts professionnels avec informations détaillées, historique d'interactions et relations. Importez et exportez facilement vos listes de contacts.",
    en: "Contacts are in CRM > Contacts. Manage your business contacts with detailed information, interaction history, and relationships. Easily import and export your contact lists.",
    sw: "Mawasiliano yapo CRM > Mawasiliano. Simamia mawasiliano yako ya kibiashara kwa maelezo kamili, historia ya mwingiliano na mahusiano. Ingiza na toa orodha zako za mawasiliano kwa urahisi.",
  },
  crm_deal: {
    fr: "Les affaires sont dans CRM > Affaires. Suivez vos opportunités commerciales, les montants, les probabilités de conclusion et les étapes du pipeline. Les prévisions de revenus sont mises à jour automatiquement.",
    en: "Deals are in CRM > Deals. Track your sales opportunities, amounts, closing probabilities, and pipeline stages. Revenue forecasts are updated automatically.",
    sw: "Mikataba ipo CRM > Mikataba. Fuatilia fursa zako za mauzo, kiasi, uwezekano wa kufunga na hatua za bomba. Utabiri wa mapato husasishwa moja kwa moja.",
  },
  settings: {
    fr: "Les paramètres sont accessibles depuis votre profil > Paramètres. Vous pouvez configurer votre profil, préférences de notifications, thème, langue et sécurité. Les paramètres de l'espace de travail sont dans Administration.",
    en: "Settings are accessible from your profile > Settings. You can configure your profile, notification preferences, theme, language, and security. Workspace settings are in Administration.",
    sw: "Mipangilio inapatikana kutoka kwa wasifu wako > Mipangilio. Unaweza kusanidi wasifu, mapendeleo ya arifa, mandhari, lugha na usalama. Mipangilio ya nafasi ya kazi ipo Usimamizi.",
  },
  profile: {
    fr: "Votre profil contient vos informations personnelles, votre rôle et vos préférences. Accédez-y en cliquant sur votre avatar en haut à droite. Vous pouvez modifier votre photo, email et mot de passe.",
    en: "Your profile contains your personal information, role, and preferences. Access it by clicking your avatar at the top right. You can change your photo, email, and password.",
    sw: "Wasifu wako una maelezo yako ya kibinafsi, wadhifa na mapendeleo. Ifikie kwa kubofya picha yako juu kulia. Unaweza kubadilisha picha, barua pepe na nywila.",
  },
  workspace: {
    fr: "Les espaces de travail vous permettent de séparer vos activités par organisation ou projet. Gérez-les depuis Administration > Espaces de travail. Chaque espace a ses propres modules et membres.",
    en: "Workspaces let you separate your activities by organization or project. Manage them from Administration > Workspaces. Each workspace has its own modules and members.",
    sw: "Nafasi za kazi hukuruhusu kutenganisha shughuli zako kwa shirika au mradi. Zisimamie kutoka Usimamizi > Nafasi za kazi. Kila nafasi ina moduli na wanachama wake.",
  },
  help: {
    fr: "Je suis là pour vous aider avec toutes les fonctionnalités d'OmniCore. Posez-moi des questions sur : le tableau de bord, RH, Finance, Commerce, Pharmacie, Santé, Éducation, Projets, CRM, ou les paramètres.",
    en: "I'm here to help you with all OmniCore features. Ask me about: Dashboard, HR, Finance, Commerce, Pharmacy, Healthcare, Education, Projects, CRM, or Settings.",
    sw: "Niko hapa kukusaidia na vipengele vyote vya OmniCore. Niulize kuhusu: Dashibodi, HR, Fedha, Biashara, Famasia, Afya, Elimu, Miradi, CRM, au Mipangilio.",
  },
  greeting: {
    fr: "Bonjour ! Je suis OmniCore AI, votre assistant intelligent. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur tous les modules de la plateforme.",
    en: "Hello! I am OmniCore AI, your intelligent assistant. How can I help you today? You can ask me questions about all platform modules.",
    sw: "Habari! Mimi ni OmniCore AI, msaidizi wako mahiri. Ninaweza kukusaidiaje leo? Unaweza kuniuliza maswali kuhusu moduli zote za jukwaa.",
  },
  default: {
    fr: "Merci pour votre question. Je suis votre assistant OmniCore AI. Pour vous aider au mieux, précisez si votre question concerne : le tableau de bord, les RH, la finance, le commerce, la pharmacie, la santé, l'éducation, les projets, le CRM ou les paramètres.",
    en: "Thank you for your question. I am your OmniCore AI assistant. To help you best, please specify if your question is about: Dashboard, HR, Finance, Commerce, Pharmacy, Healthcare, Education, Projects, CRM, or Settings.",
    sw: "Asante kwa swali lako. Mimi ni msaidizi wako wa OmniCore AI. Kukusaidia vyema, tafadhali eleza kama swali lako linahusu: Dashibodi, HR, Fedha, Biashara, Famasia, Afya, Elimu, Miradi, CRM, au Mipangilio.",
  },
};

function getResponse(message: string, lang: "fr" | "en" | "sw"): string {
  const lower = message.toLowerCase();

  if (
    /\b(bonjour|salut|coucou|hello|hi|hey|habari|jambo|hujambo)\b/.test(lower)
  ) {
    return responses.greeting[lang];
  }

  if (
    /\b(help|aide|msaada|assist|comment|how|jinsi|soutenir|aider|kusaidia)\b/.test(
      lower
    )
  ) {
    return responses.help[lang];
  }

  if (
    /\b(dashboard|tableau de bord|dashibodi|graphique|chiffre|kpi|indicateur|metric|performance)\b/.test(
      lower
    )
  ) {
    return responses.dashboard[lang];
  }

  // HR
  if (
    /\b(rh|hr|ressources humaines|employé|employee|mfanyakazi|wafanyakazi|embauche|recrutement)\b/.test(
      lower
    )
  ) {
    if (
      /\b(paie|payroll|salaire|salary|mshahara|mishahara|bulletin|fiche de paie)\b/.test(
        lower
      )
    ) {
      return responses.hr_payroll[lang];
    }
    if (
      /\b(présence|pointage|attendance|absence|congé|leave|mahudhurio|likizo|check.in)\b/.test(
        lower
      )
    ) {
      return responses.hr_attendance[lang];
    }
    return responses.hr_employee[lang];
  }

  // Finance
  if (
    /\b(finance|financier|comptabilité|accounting|fedha|financial|billing|facturation)\b/.test(
      lower
    )
  ) {
    if (
      /\b(facture|invoice|ankara|ankara|bill)\b/.test(lower)
    ) {
      return responses.finance_invoice[lang];
    }
    if (
      /\b(dépense|expense|gharama|cost|dépense)\b/.test(lower)
    ) {
      return responses.finance_expense[lang];
    }
    if (
      /\b(revenu|revenue|income|mapato|chiffre d.affaires)\b/.test(lower)
    ) {
      return responses.finance_revenue[lang];
    }
    return responses.finance_invoice[lang];
  }

  // Commerce
  if (
    /\b(commerce|boutique|shop|magasin|biashara|ecommerce|e.commerce|vente|sale)\b/.test(
      lower
    )
  ) {
    if (
      /\b(produit|product|bidhaa|article|item)\b/.test(lower)
    ) {
      return responses.commerce_product[lang];
    }
    if (
      /\b(commande|order|agizo|achat|purchase)\b/.test(lower)
    ) {
      return responses.commerce_order[lang];
    }
    return responses.commerce_product[lang];
  }

  // Pharmacy
  if (
    /\b(pharmacie|pharmacy|famasia|médicament|medicine|dawa|pharma|drug)\b/.test(
      lower
    )
  ) {
    if (
      /\b(stock|inventaire|inventory|hisa|orodha)\b/.test(lower)
    ) {
      return responses.pharmacy_stock[lang];
    }
    if (
      /\b(ordonnance|prescription|agizo|prescription médicale)\b/.test(lower)
    ) {
      return responses.pharmacy_prescription[lang];
    }
    return responses.pharmacy_medicine[lang];
  }

  // Healthcare
  if (
    /\b(santé|healthcare|afya|médical|medical|hôpital|hospital|clinique|clinic)\b/.test(
      lower
    )
  ) {
    if (
      /\b(patient|mgonjwa|wagonywa|dossier)\b/.test(lower)
    ) {
      return responses.healthcare_patient[lang];
    }
    if (
      /\b(rendez.vous|appointment|miadi|rdv|booking)\b/.test(lower)
    ) {
      return responses.healthcare_appointment[lang];
    }
    if (
      /\b(personnel|staff|wafanyakazi|médecin|doctor|nurse|infirmier)\b/.test(
        lower
      )
    ) {
      return responses.healthcare_staff[lang];
    }
    return responses.healthcare_patient[lang];
  }

  // Education
  if (
    /\b(éducation|education|school|élimu|école|académique|academic|formation|training)\b/.test(
      lower
    )
  ) {
    if (
      /\b(étudiant|student|élève|mwanafunzi|wanafunzi)\b/.test(lower)
    ) {
      return responses.education_student[lang];
    }
    if (
      /\b(cours|course|kozi|matière|subject)\b/.test(lower)
    ) {
      return responses.education_course[lang];
    }
    if (
      /\b(classe|class|darasa|niveau|level|section)\b/.test(lower)
    ) {
      return responses.education_class[lang];
    }
    return responses.education_student[lang];
  }

  // Projects
  if (
    /\b(projet|project|mradi|miradi|tâche|task|kazi)\b/.test(lower)
  ) {
    if (
      /\b(projet|project|mradi|miradi|chantier)\b/.test(lower)
    ) {
      return responses.project[lang];
    }
    if (
      /\b(tâche|task|kazi|assignment)\b/.test(lower)
    ) {
      return responses.task[lang];
    }
    return responses.project[lang];
  }

  // Calendar
  if (
    /\b(calendrier|calendar|kalenda|agenda|planning|schedule|échéance|deadline)\b/.test(
      lower
    )
  ) {
    return responses.calendar[lang];
  }

  // CRM
  if (
    /\b(crm|client|customer|mteja|wateja|relation client|commercial|vente|sales)\b/.test(
      lower
    )
  ) {
    if (
      /\b(lead|prospect|watarajiwa|opportunité)\b/.test(lower)
    ) {
      return responses.crm_lead[lang];
    }
    if (
      /\b(contact|mawasiliano|annuaire)\b/.test(lower)
    ) {
      return responses.crm_contact[lang];
    }
    if (
      /\b(deal|affaire|opportunity|fursa|mkataba|mikataba)\b/.test(lower)
    ) {
      return responses.crm_deal[lang];
    }
    return responses.crm_lead[lang];
  }

  // Settings / Profile / Workspace
  if (
    /\b(paramètre|setting|mipangilio|config|préférence|preference)\b/.test(
      lower
    )
  ) {
    return responses.settings[lang];
  }
  if (
    /\b(profil|profile|wasifu|compte|account|avatar)\b/.test(lower)
  ) {
    return responses.profile[lang];
  }
  if (
    /\b(workspace|espace|nafasi|organisation|organization|organization)\b/.test(
      lower
    )
  ) {
    return responses.workspace[lang];
  }

  return responses.default[lang];
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages requis" },
        { status: 400 }
      );
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string }) => m.role === "user");

    const content = lastUserMessage?.content || "";
    const lang = detectLanguage(content);
    const response = getResponse(content, lang);

    return NextResponse.json({
      role: "assistant",
      content: response,
      language: lang,
    });
  } catch (error) {
    console.error("AI Chat error");
    return NextResponse.json(
      { error: "Erreur lors du traitement de la demande" },
      { status: 500 }
    );
  }
}