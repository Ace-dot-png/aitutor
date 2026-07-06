import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });
    const entries = await prisma.timetableEntry.findMany({ where: { studentId: (authSession.user as any).id }, orderBy: { createdAt: "desc" } });
    return Response.json(entries);
  } catch (error) { console.error("Timetable GET error:", error); return Response.json({ error: "Something went wrong" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });
    const { day, startTime, subject, topic } = await req.json();
    const entry = await prisma.timetableEntry.create({
      data: { studentId: (authSession.user as any).id, day, startTime, subject: subject as any, topic },
    });
    return Response.json(entry);
  } catch (error) { console.error("Timetable POST error:", error); return Response.json({ error: "Something went wrong" }, { status: 500 }); }
}
