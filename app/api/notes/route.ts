import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const studentId = (session.user as any).id;
  const notes = await prisma.note.findMany({
    where: { studentId },
    orderBy: { uploadedAt: "desc" },
  });
  return Response.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const studentId = (session.user as any).id;
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const subject = formData.get("subject") as string;

  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const blob = await put(file.name, file, { access: "public" });

  const note = await prisma.note.create({
    data: {
      studentId,
      title: title || file.name,
      fileUrl: blob.url,
      subject: subject as any,
    },
  });

  return Response.json(note);
}
