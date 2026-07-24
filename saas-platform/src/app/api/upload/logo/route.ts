import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { validateCSRFRequest } from "@/lib/csrf";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getExtension(contentType: string): string | null {
  if (contentType === "image/png") return ".png";
  if (contentType === "image/jpeg") return ".jpg";
  if (contentType === "image/gif") return ".gif";
  if (contentType === "image/webp") return ".webp";
  return null;
}

export async function POST(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête non autorisée" }, { status: 403 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("logo") as File | null;
    if (!file || typeof file.name !== "string") {
      return NextResponse.json({ error: "Aucun logo téléchargé" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Le fichier dépasse la taille maximale de 5 Mo" }, { status: 400 });
    }

    const extension = getExtension(file.type);
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileName = `logo-${Date.now()}${extension}`;
    const filePath = path.join(uploadsDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error("Logo upload error");
    return NextResponse.json({ error: "Échec du téléchargement du logo." }, { status: 500 });
  }
}
