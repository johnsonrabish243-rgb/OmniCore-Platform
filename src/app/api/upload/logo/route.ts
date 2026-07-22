import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { promises as fs } from "fs";
import path from "path";

function getExtension(fileName: string, contentType: string) {
  const extension = path.extname(fileName);
  if (extension) return extension;
  if (contentType === "image/png") return ".png";
  if (contentType === "image/jpeg") return ".jpg";
  if (contentType === "image/svg+xml") return ".svg";
  return ".png";
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("logo") as File | null;
    if (!file || typeof file.name !== "string") {
      return NextResponse.json({ error: "Aucun logo téléchargé" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const extension = getExtension(file.name, file.type);
    const fileName = `logo-${Date.now()}${extension}`;
    const filePath = path.join(uploadsDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json({ error: "Échec du téléchargement du logo." }, { status: 500 });
  }
}
