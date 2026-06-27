import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });
    const notes = await prisma.note.findMany({ where: { studentId: (authSession.user as any).id }, orderBy: { uploadedAt: "desc" } });
    return Response.json(notes);
  } catch (error) { console.error("Notes GET error:", error); return Response.json({ error: "Something went wrong" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const subject = formData.get("subject") as string;
    if (!file) return Response.json({ error: "No file" }, { status: 400 });
    const blob = await put(file.name, file, { access: "public" });
    const note = await prisma.note.create({
      data: { studentId: (authSession.user as any).id, title: title || file.name, fileUrl: blob.url, subject: subject as any },
    });
    return Response.json(note);
  } catch (error) { console.error("Notes POST error:", error); return Response.json({ error: "Something went wrong" }, { status: 500 }); }
}
