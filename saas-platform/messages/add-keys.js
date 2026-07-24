const fs = require("fs");

const files = { fr: "fr.json", en: "en.json", sw: "sw.json" };
const locales = { fr: {}, en: {}, sw: {} };

for (const [code, file] of Object.entries(files)) {
  locales[code] = JSON.parse(fs.readFileSync(file, "utf-8"));
}

const authKeys = {
  emailVerified: { fr: "Email v\u00e9rifi\u00e9 avec succ\u00e8s !", en: "Email verified successfully!", sw: "Barua pepe imethibitishwa kwa mafanikio!" },
  redirectingToLogin: { fr: "Redirection vers la connexion...", en: "Redirecting to login...", sw: "Inaelekeza kwenye kuingia..." },
  resendIn: { fr: "Renvoyer dans {seconds}s", en: "Resend in {seconds}s", sw: "Tuma tena baada ya {seconds}s" },
  resendCode: { fr: "Renvoyer le code", en: "Resend code", sw: "Tuma tena msimbo" },
  emailSent: { fr: "Email envoy\u00e9 !", en: "Email sent!", sw: "Barua pepe imetumwa!" },
  resetEmailSent: { fr: "Si un compte existe avec l'adresse", en: "If an account exists with", sw: "Ikiwa akaunti ipo na" },
  checkSpam: { fr: "V\u00e9rifiez \u00e9galement vos spams si vous ne trouvez pas l'email.", en: "Check your spam folder if you cannot find the email.", sw: "Angalia sinia la taka ikiwa huoni barua pepe." },
  backToLogin: { fr: "Retour \u00e0 la connexion", en: "Back to login", sw: "Rudi kwenye kuingia" },
  invalidVerificationLink: { fr: "Lien de v\u00e9rification invalide", en: "Invalid verification link", sw: "Kiungo batili cha uthibitisho" },
  verificationFailed: { fr: "\u00c9chec de la v\u00e9rification", en: "Verification failed", sw: "Uthibitisho umeshindwa" },
  verificationEmailResent: { fr: "Email de v\u00e9rification renvoy\u00e9", en: "Verification email resent", sw: "Barua pepe ya uthibitisho imetumwa tena" },
};

const commonKeys = {
  emailVerified: { fr: "Email v\u00e9rifi\u00e9", en: "Email verified", sw: "Barua pepe imethibitishwa" },
  noResults: { fr: "Aucun r\u00e9sultat", en: "No results", sw: "Hakuna matokeo" },
  retry: { fr: "R\u00e9essayer", en: "Retry", sw: "Jaribu tena" },
  home: { fr: "Accueil", en: "Home", sw: "Nyumbani" },
};

const sidebarKeys = {
  search: { fr: "Rechercher...", en: "Search...", sw: "Tafuta..." },
  activeWorkspace: { fr: "Espace de travail actif", en: "Active workspace", sw: "Sehemu ya kazi inayotumika" },
  loading: { fr: "Chargement...", en: "Loading...", sw: "Inapakia..." },
  enterpriseSuite: { fr: "Suite Entreprise", en: "Enterprise Suite", sw: "Kifurushi cha Biashara" },
};

const themeKeys = {
  lightMode: { fr: "Clair", en: "Light", sw: "Mwangaza" },
  darkMode: { fr: "Sombre", en: "Dark", sw: "Giza" },
  systemMode: { fr: "Syst\u00e8me", en: "System", sw: "Mfumo" },
  changeTheme: { fr: "Changer de th\u00e8me", en: "Change theme", sw: "Badilisha mandhari" },
  switchTheme: { fr: "Passer en mode {mode}", en: "Switch to {mode} mode", sw: "Badilisha hadi hali ya {mode}" },
};

const aiKeys = {
  rateLimited: { fr: "Limite atteinte", en: "Rate limit reached", sw: "Kikomo kimefikiwa" },
};

const errorKeys = {
  notFoundTitle: { fr: "Page non trouv\u00e9e", en: "Page not found", sw: "Ukurasa haujapatikana" },
  notFoundDescription: { fr: "La page que vous recherchez n'existe pas ou a \u00e9t\u00e9 d\u00e9plac\u00e9e. V\u00e9rifiez l'URL ou retournez \u00e0 l'accueil.", en: "The page you are looking for does not exist or has been moved. Check the URL or go back home.", sw: "Ukurasa unaoutafuta haupo au umehamishwa. Angalia URL au rudi nyumbani." },
  serverErrorTitle: { fr: "Erreur serveur", en: "Server error", sw: "Hitilafu ya seva" },
  serverErrorDescription: { fr: "Une erreur inattendue est survenue. Notre \u00e9quipe technique a \u00e9t\u00e9 notifi\u00e9e. Veuillez r\u00e9essayer ou revenir \u00e0 l'accueil.", en: "An unexpected error occurred. Our technical team has been notified. Please try again or go back home.", sw: "Hitilafu isiyotarajiwa imetokea. Timu yetu ya ufundi imearifiwa. Tafadhali jaribu tena au rudi nyumbani." },
};

for (const [code, data] of Object.entries(locales)) {
  Object.entries(authKeys).forEach(([key, vals]) => { data.auth[key] = vals[code]; });
  Object.entries(commonKeys).forEach(([key, vals]) => { data.common[key] = vals[code]; });
  Object.entries(sidebarKeys).forEach(([key, vals]) => { data.sidebar[key] = vals[code]; });
  Object.entries(themeKeys).forEach(([key, vals]) => { data.common[key] = vals[code]; });
  Object.entries(aiKeys).forEach(([key, vals]) => { data.ai[key] = vals[code]; });
  Object.entries(errorKeys).forEach(([key, vals]) => { data.common[key] = vals[code]; });
  if (code === "fr") data.loading.footer = "© 2026 OmniCore. Développé par John Mocket.";
  if (code === "en") data.loading.footer = "© 2026 OmniCore. Developed by John Mocket.";
  if (code === "sw") data.loading.footer = "© 2026 OmniCore. Imetengenezwa na John Mocket.";
  data.common.dashboard = { fr: "Tableau de bord", en: "Dashboard", sw: "Dashibodi" }[code];
  fs.writeFileSync(files[code], JSON.stringify(data, null, 2) + "\n");
  console.log("Updated " + files[code]);
}

console.log("Done");
