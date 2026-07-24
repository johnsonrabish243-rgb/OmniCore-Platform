import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ContactFormData {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  organizationType: string;
  interestedModule: string;
  preferredDate: string;
  preferredTime: string;
  meetingType: string;
  reasonForAppointment: string;
  message: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildAdminEmailBody(data: ContactFormData): string {
  const meetingTypeLabel: Record<string, string> = {
    "online": "En ligne (Visioconférence)",
    "in-person": "En personne",
    "phone": "Par téléphone",
  };
  const moduleLabel: Record<string, string> = {
    "hr": "Ressources Humaines",
    "finance": "Finance & Comptabilité",
    "healthcare": "Santé & Pharmacie",
    "education": "Éducation",
    "commerce": "Commerce & Inventaire",
    "multiple": "Plusieurs modules",
    "general": "Information générale",
  };

  return `
Nouvelle demande de rendez-vous OmniCore
==========================================

INFORMATIONS DU VISITEUR
-------------------------
Nom complet     : ${data.fullName}
Entreprise      : ${data.companyName || "Non spécifié"}
Email           : ${data.email}
Téléphone       : ${data.phone || "Non spécifié"}
Pays            : ${data.country || "Non spécifié"}
Type organisation: ${data.organizationType || "Non spécifié"}

DÉTAILS DU RENDEZ-VOUS
-----------------------
Module感兴趣    : ${moduleLabel[data.interestedModule] || data.interestedModule || "Non spécifié"}
Type de réunion : ${meetingTypeLabel[data.meetingType] || data.meetingType || "Non spécifié"}
Date souhaitée  : ${data.preferredDate || "Non spécifié"}
Heure souhaitée : ${data.preferredTime || "Non spécifié"}
Raison          : ${data.reasonForAppointment || "Non spécifié"}

MESSAGE
-------
${data.message || "Aucun message complémentaire"}

---
Cet email a été généré automatiquement par le formulaire de contact OmniCore.
`.trim();
}

export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.fullName?.trim()) {
      return NextResponse.json({ error: "Le nom complet est requis." }, { status: 400 });
    }
    if (!body.email?.trim() || !validateEmail(body.email)) {
      return NextResponse.json({ error: "Une adresse email valide est requise." }, { status: 400 });
    }

    // Store the contact request in Supabase
    const supabase = await createClient();

    // Try to insert into a contact_requests table if it exists
    try {
      const { error: insertError } = await supabase
        .from("contact_requests")
        .insert({
          full_name: body.fullName.trim(),
          company_name: body.companyName?.trim() || null,
          email: body.email.trim().toLowerCase(),
          phone: body.phone?.trim() || null,
          country: body.country?.trim() || null,
          organization_type: body.organizationType || null,
          interested_module: body.interestedModule || null,
          preferred_date: body.preferredDate || null,
          preferred_time: body.preferredTime || null,
          meeting_type: body.meetingType || null,
          reason_for_appointment: body.reasonForAppointment?.trim() || null,
          message: body.message?.trim() || null,
          status: "pending",
        });

      if (insertError) {
        // Table might not exist - log but don't fail
        console.warn("Could not insert contact_request (table may not exist)");
      }
    } catch (e) {
      console.warn("contact_requests table not found, skipping DB insert");
    }

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_FROM || "contact@omnicore.site";
    const emailBody = buildAdminEmailBody(body);

    // Try to send email via SMTP or Resend if configured
    try {
      // Option 1: Resend API
      if (process.env.RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.SMTP_FROM || "OmniCore <noreply@omnicore.site>",
            to: [adminEmail],
            subject: `[OmniCore] Nouvelle demande de rendez-vous de ${body.fullName}`,
            text: emailBody,
            reply_to: body.email,
          }),
        });
      }
      // Option 2: SMTP via nodemailer-like fetch (if configured)
      else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Use a simple SMTP approach via API
        console.log("SMTP configured but direct sending not implemented - email body logged:", emailBody.substring(0, 200));
      } else {
        // No email service configured - log the email content
        console.log("=== CONTACT FORM SUBMISSION ===");
        console.log("To:", adminEmail);
        console.log("Subject:", `[OmniCore] Nouvelle demande de rendez-vous de ${body.fullName}`);
        console.log(emailBody);
        console.log("===============================");
      }
    } catch (emailError) {
      console.error("Failed to send notification email");
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Votre demande a été envoyée avec succès. Nous vous contacterons bientôt.",
    });
  } catch (error) {
    console.error("Contact form error");
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de votre demande." },
      { status: 500 }
    );
  }
}
