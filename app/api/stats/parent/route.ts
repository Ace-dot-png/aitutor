import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "PARENT") return Response.json({ error: "Forbidden" }, { status: 403 });

    const parentId = (authSession.user as any).id;
    const parent = await prisma.user.findUnique({ where: { id: parentId }, select: { linkedStudentId: true } });
    if (!parent?.linkedStudentId) return Response.json({ error: "No child linked" }, { status: 400 });

    const studentId = parent.linkedStudentId;
    const [student, stats, sessions] = await Promise.all([
      prisma.user.findUnique({ where: { id: studentId }, include: { school: true } }),
      prisma.learnerStats.findMany({ where: { studentId }, orderBy: { lastActive: "desc" } }),
      prisma.session.findMany({ where: { studentId, startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, orderBy: { startedAt: "desc" }, include: { analysis: { select: { knowledgeGainScore: true, parentNote: true } } } }),
    ]);
    if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

    return Response.json({
      childName: student.name, childGrade: student.grade, schoolName: student.school?.name, stats,
      recentSessions: sessions.map((s) => ({ subject: s.subject, topic: s.topic, startedAt: s.startedAt, knowledgeGainScore: s.analysis?.knowledgeGainScore })),
      lastActive: sessions[0]?.startedAt || null, parentNote: sessions[0]?.analysis?.parentNote || null,
    });
  } catch (error) {
    console.error("Parent stats error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
