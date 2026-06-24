import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const entries = await prisma.timetableEntry.findMany({
    where: { studentId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { day, startTime, subject, topic } = await req.json();
  const entry = await prisma.timetableEntry.create({
    data: {
      studentId: (session.user as any).id,
      day,
      startTime,
      subject,
      topic,
    },
  });
  return Response.json(entry);
}
