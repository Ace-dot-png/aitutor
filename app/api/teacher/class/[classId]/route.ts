import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { classId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TEACHER") {
    return new Response("Unauthorized", { status: 401 });
  }

  const classData = await prisma.class.findUnique({
    where: { id: params.classId },
    include: {
      students: { include: { student: true } },
    },
  });

  if (!classData) return Response.json({ error: "Not found" }, { status: 404 });

  const studentData = await Promise.all(
    classData.students.map(async (cs) => {
      const stats = await prisma.learnerStats.findMany({
        where: { studentId: cs.studentId },
        select: { subject: true, masteryScore: true, topicTitle: true },
      });
      const sessions = await prisma.session.findMany({
        where: { studentId: cs.studentId },
        orderBy: { startedAt: "desc" },
        take: 10,
        include: { analysis: { select: { knowledgeGainScore: true, sentimentLabel: true } } },
      });
      const analyses = await prisma.sessionAnalysis.findMany({
        where: { session: { studentId: cs.studentId } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { painPoints: true, sentimentLabel: true },
      });

      const mathsMastery = stats.filter((s) => s.subject === "MATHEMATICS").reduce((a, s) => a + s.masteryScore, 0) / (stats.filter((s) => s.subject === "MATHEMATICS").length || 1);
      const physicsMastery = stats.filter((s) => s.subject === "PHYSICS").reduce((a, s) => a + s.masteryScore, 0) / (stats.filter((s) => s.subject === "PHYSICS").length || 1);
      const englishMastery = stats.filter((s) => s.subject === "ENGLISH").reduce((a, s) => a + s.masteryScore, 0) / (stats.filter((s) => s.subject === "ENGLISH").length || 1);

      return {
        id: cs.student.id,
        name: cs.student.name,
        grade: cs.student.grade,
        lastActive: sessions[0]?.startedAt || null,
        sessionCount: sessions.length,
        mathsMastery: stats.some((s) => s.subject === "MATHEMATICS") ? Math.round(mathsMastery) : null,
        physicsMastery: stats.some((s) => s.subject === "PHYSICS") ? Math.round(physicsMastery) : null,
        englishMastery: stats.some((s) => s.subject === "ENGLISH") ? Math.round(englishMastery) : null,
        sentiment: analyses[0]?.sentimentLabel || null,
        painPoints: [...new Set(analyses.flatMap((a) => a.painPoints))],
        sessions: sessions.map((s) => ({
          startedAt: s.startedAt,
          topic: s.topic,
          knowledgeGainScore: s.analysis?.knowledgeGainScore,
        })),
      };
    })
  );

  const allMasteryScores = studentData.flatMap((s) =>
    [s.mathsMastery, s.physicsMastery, s.englishMastery].filter((x) => x !== null) as number[]
  );

  const avgMastery = allMasteryScores.length > 0
    ? Math.round(allMasteryScores.reduce((a, b) => a + b, 0) / allMasteryScores.length)
    : 0;

  const masteryDistribution = [
    { range: "0-20", count: allMasteryScores.filter((x) => x <= 20).length },
    { range: "21-40", count: allMasteryScores.filter((x) => x > 20 && x <= 40).length },
    { range: "41-60", count: allMasteryScores.filter((x) => x > 40 && x <= 60).length },
    { range: "61-80", count: allMasteryScores.filter((x) => x > 60 && x <= 80).length },
    { range: "81-100", count: allMasteryScores.filter((x) => x > 80).length },
  ];

  return Response.json({
    name: classData.name,
    grade: classData.grade,
    studentCount: studentData.length,
    avgMastery,
    strugglingCount: studentData.filter((s) => {
      const scores = [s.mathsMastery, s.physicsMastery, s.englishMastery].filter((x) => x !== null);
      return scores.some((x) => x !== null && x < 40);
    }).length,
    totalSessions: studentData.reduce((a, s) => a + s.sessionCount, 0),
    students: studentData,
    masteryDistribution,
  });
}
