import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return new Response("Unauthorized", { status: 401 });
  }

  const parentId = (session.user as any).id;
  const parent = await prisma.user.findUnique({ where: { id: parentId }, select: { linkedStudentId: true } });
  if (!parent?.linkedStudentId) {
    return Response.json({ error: "No child linked" }, { status: 400 });
  }

  const studentId = parent.linkedStudentId;

  const [student, stats, sessions, analyses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      include: { school: true },
    }),
    prisma.learnerStats.findMany({ where: { studentId }, orderBy: { lastActive: "desc" } }),
    prisma.session.findMany({
      where: { studentId, startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { startedAt: "desc" },
      include: { analysis: { select: { knowledgeGainScore: true, sentimentLabel: true, parentNote: true } } },
    }),
    prisma.sessionAnalysis.findMany({
      where: { session: { studentId } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { sentimentLabel: true, painPoints: true, breakthroughMoments: true, parentNote: true, createdAt: true },
    }),
  ]);

  if (!student) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  const sentimentCounts = { positive: 0, neutral: 0, struggling: 0, disengaged: 0 };
  const painPoints = new Set<string>();
  const breakthroughs = new Set<string>();

  for (const a of analyses) {
    const key = a.sentimentLabel.toLowerCase();
    sentimentCounts[key as keyof typeof sentimentCounts]++;
    a.painPoints.forEach((p) => painPoints.add(p));
    a.breakthroughMoments.forEach((b) => breakthroughs.add(b));
  }

  return Response.json({
    childName: student.name,
    childGrade: student.grade,
    schoolName: student.school?.name,
    stats,
    recentSessions: sessions.map((s) => ({
      subject: s.subject,
      topic: s.topic,
      startedAt: s.startedAt,
      knowledgeGainScore: s.analysis?.knowledgeGainScore,
    })),
    sentimentCounts,
    painPoints: [...painPoints],
    breakthroughs: [...breakthroughs],
    lastActive: sessions[0]?.startedAt || null,
    parentNote: analyses[0]?.parentNote || null,
  });
}
