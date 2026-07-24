export type EmailLocale = "fr" | "en" | "sw";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

function loadEmailTranslations(locale: EmailLocale) {
  const translations: Record<EmailLocale, Record<string, string>> = {
    fr: {
      verificationSubject: "OmniCore - Vérifiez votre adresse email",
      verificationGreeting: "Bonjour",
      verificationBody: "Merci de vous être inscrit sur OmniCore ! Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous ou en entrant le code de vérification :",
      verificationButton: "Vérifier mon email",
      verificationCodeLabel: "Votre code de vérification :",
      verificationExpiry: "Ce lien expire dans 24 heures.",
      verificationIgnore: "Si vous n'avez pas créé de compte, ignorez cet email.",
      resetSubject: "OmniCore - Réinitialisation de mot de passe",
      resetGreeting: "Bonjour",
      resetBody: "Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :",
      resetButton: "Réinitialiser mon mot de passe",
      resetIgnore: "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.",
      footer: "© 2026 OmniCore. Tous droits réservés.",
      team: "L'équipe OmniCore",
    },
    en: {
      verificationSubject: "OmniCore - Verify your email address",
      verificationGreeting: "Hello",
      verificationBody: "Thank you for signing up for OmniCore! Please verify your email address by clicking the link below or entering the verification code:",
      verificationButton: "Verify my email",
      verificationCodeLabel: "Your verification code:",
      verificationExpiry: "This link expires in 24 hours.",
      verificationIgnore: "If you didn't create an account, please ignore this email.",
      resetSubject: "OmniCore - Password Reset",
      resetGreeting: "Hello",
      resetBody: "You requested a password reset. Click the link below to create a new password:",
      resetButton: "Reset my password",
      resetIgnore: "If you didn't request this reset, please ignore this email.",
      footer: "© 2026 OmniCore. All rights reserved.",
      team: "The OmniCore Team",
    },
    sw: {
      verificationSubject: "OmniCore - Thibitisha anwani yako ya barua pepe",
      verificationGreeting: "Habari",
      verificationBody: "Asante kwa kusajili OmniCore! Tafadhali thibitisha anwani yako ya barua pepe kwa kubofya kiungo hapa chini au kwa kuingiza msimbo wa uthibitishaji:",
      verificationButton: "Thibitisha barua pepe yangu",
      verificationCodeLabel: "Msimbo wako wa uthibitishaji:",
      verificationExpiry: "Kiungo hiki kinaisha baada ya saa 24.",
      verificationIgnore: "Ikiwa hukuunda akaunti, tafadhali puuza barua pepe hii.",
      resetSubject: "OmniCore - Weka upya nywila",
      resetGreeting: "Habari",
      resetBody: "Uliomba kuweka upya nywila yako. Bonyeza kiungo hapa chini kuunda nywila mpya:",
      resetButton: "Weka upya nywila yangu",
      resetIgnore: "Ikiwa hukuomba kuweka upya hii, tafadhali puuza barua pepe hii.",
      footer: "© 2026 OmniCore. Haki zote zimehifadhiwa.",
      team: "Timu ya OmniCore",
    },
  };

  return translations[locale] || translations.en;
}

function buildVerificationEmailHtml(
  name: string,
  code: string,
  verificationLink: string,
  locale: EmailLocale
): string {
  const t = loadEmailTranslations(locale);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center">
            <img src="https://omnicore.site/omnicore-logo.png" alt="OmniCore" width="64" height="64" style="border-radius:16px;margin-bottom:12px" />
            <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0">OmniCore</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px">
            <h2 style="color:#18181b;font-size:20px;font-weight:600;margin:0 0 8px">${t.verificationGreeting} ${name},</h2>
            <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 24px">${t.verificationBody}</p>
            <div style="background:#f4f4f5;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
              <p style="color:#71717a;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">${t.verificationCodeLabel}</p>
              <p style="font-size:36px;font-weight:700;color:#18181b;letter-spacing:8px;margin:0;font-family:monospace">${code}</p>
            </div>
            <a href="${verificationLink}" style="display:block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;text-align:center;margin-bottom:24px">${t.verificationButton}</a>
            <p style="color:#71717a;font-size:13px;line-height:1.5;margin:0 0 4px">${t.verificationExpiry}</p>
            <p style="color:#71717a;font-size:13px;line-height:1.5;margin:0">${t.verificationIgnore}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background:#fafafa;border-top:1px solid #e4e4e7">
            <p style="color:#a1a1aa;font-size:12px;margin:0 0 4px;text-align:center">${t.team}</p>
            <p style="color:#a1a1aa;font-size:12px;margin:0;text-align:center">${t.footer}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function buildVerificationEmailText(
  name: string,
  code: string,
  verificationLink: string,
  locale: EmailLocale
): string {
  const t = loadEmailTranslations(locale);
  return `${t.verificationGreeting} ${name},

${t.verificationBody}

${t.verificationCodeLabel} ${code}

${t.verificationButton}: ${verificationLink}

${t.verificationExpiry}
${t.verificationIgnore}

---
${t.team}
${t.footer}`;
}

function buildPasswordResetEmailHtml(
  name: string,
  resetLink: string,
  locale: EmailLocale
): string {
  const t = loadEmailTranslations(locale);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center">
            <img src="https://omnicore.site/omnicore-logo.png" alt="OmniCore" width="64" height="64" style="border-radius:16px;margin-bottom:12px" />
            <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0">OmniCore</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px">
            <h2 style="color:#18181b;font-size:20px;font-weight:600;margin:0 0 8px">${t.resetGreeting} ${name},</h2>
            <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 24px">${t.resetBody}</p>
            <a href="${resetLink}" style="display:block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;text-align:center;margin-bottom:24px">${t.resetButton}</a>
            <p style="color:#71717a;font-size:13px;line-height:1.5;margin:0">${t.resetIgnore}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background:#fafafa;border-top:1px solid #e4e4e7">
            <p style="color:#a1a1aa;font-size:12px;margin:0 0 4px;text-align:center">${t.team}</p>
            <p style="color:#a1a1aa;font-size:12px;margin:0;text-align:center">${t.footer}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function buildPasswordResetEmailText(name: string, resetLink: string, locale: EmailLocale): string {
  const t = loadEmailTranslations(locale);
  return `${t.resetGreeting} ${name},

${t.resetBody}

${t.resetButton}: ${resetLink}

${t.resetIgnore}

---
${t.team}
${t.footer}`;
}

async function sendViaResend(params: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.SMTP_FROM || "OmniCore <noreply@omnicore.site>",
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendViaSmtp(params: SendEmailParams): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return false;
  console.log("SMTP not fully implemented - logging email:", params.subject, params.to);
  return false;
}

export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  code: string;
  verificationLink: string;
  locale: EmailLocale;
}): Promise<boolean> {
  const subject = loadEmailTranslations(params.locale).verificationSubject;
  const html = buildVerificationEmailHtml(params.name, params.code, params.verificationLink, params.locale);
  const text = buildVerificationEmailText(params.name, params.code, params.verificationLink, params.locale);

  const sent = await sendViaResend({ to: params.to, subject, html, text });
  if (sent) return true;

  return sendViaSmtp({ to: params.to, subject, html, text });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetLink: string;
  locale: EmailLocale;
}): Promise<boolean> {
  const subject = loadEmailTranslations(params.locale).resetSubject;
  const html = buildPasswordResetEmailHtml(params.name, params.resetLink, params.locale);
  const text = buildPasswordResetEmailText(params.name, params.resetLink, params.locale);

  const sent = await sendViaResend({ to: params.to, subject, html, text });
  if (sent) return true;

  return sendViaSmtp({ to: params.to, subject, html, text });
}
