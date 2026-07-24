import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { validateCSRFRequest } from "@/lib/csrf";
import { isTokenUsed, sensitiveRateLimiter } from "@/lib/omnicaptcha";

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 403 });
    }

    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit("contact", clientId);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
    }

    const body = await request.json();

    if (!body.email?.trim() || !VALID_EMAIL.test(body.email)) {
      return NextResponse.json({ error: "Une adresse email valide est requise." }, { status: 400 });
    }
    if (!body.fullName?.trim()) {
      return NextResponse.json({ error: "Le nom complet est requis." }, { status: 400 });
    }

    if (body.fullName.length > 200 || (body.message && body.message.length > 5000)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    if (!body.captchaToken || !isTokenUsed(body.captchaToken)) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      sensitiveRateLimiter.check(`captcha:abuse:${ip}`);
      return NextResponse.json({ error: "Vérification de sécurité échouée." }, { status: 400 });
    }

    const supabase = await createClient();

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
        console.warn("Could not insert contact_request:", insertError.message);
      }
    } catch (e) {
      console.warn("contact_requests table not found, skipping DB insert");
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_FROM || "contact@omnicore.site";
    const subject = `[OmniCore] Nouveau message de ${body.fullName}`;
    const text = `Nouveau message de ${body.fullName} (${body.email}):\n\n${body.message || "Pas de message"}`;

    try {
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
            subject,
            text,
            reply_to: body.email,
          }),
        });
      } else {
        console.log("Contact form submission:", subject, text.substring(0, 200));
      }
    } catch (emailError) {
      console.error("Failed to send notification email");
    }

    return NextResponse.json({
      success: true,
      message: "Votre message a été envoyé avec succès. Nous vous contacterons bientôt.",
    });
  } catch (error) {
    console.error("Contact form error");
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de votre demande." },
      { status: 500 }
    );
  }
}
