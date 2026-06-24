import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return new Response("Unauthorized", { status: 401 });
  }

  const studentId = (session.user as any).id;

  const [stats, sessions, analyses] = await Promise.all([
    prisma.learnerStats.findMany({ where: { studentId }, orderBy: { lastActive: "desc" } }),
    prisma.session.findMany({
      where: { studentId },
      orderBy: { startedAt: "desc" },
      take: 20,
      include: { analysis: { select: { knowledgeGainScore: true, sentimentLabel: true } } },
    }),
    prisma.sessionAnalysis.findMany({
      where: { session: { studentId } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { sentimentLabel: true, knowledgeGainScore: true, createdAt: true },
    }),
  ]);

  // Study streak
  const sessionDates = sessions.map((s) => s.startedAt.toISOString().split("T")[0]);
  const uniqueDates = [...new Set(sessionDates)].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  const checkDate = new Date();
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(checkDate.getTime() - i * 86400000).toISOString().split("T")[0];
    if (uniqueDates[i] === expected) streak++;
    else if (i === 0 && uniqueDates[0] === new Date(checkDate.getTime() - 86400000).toISOString().split("T")[0]) {
      streak++; checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }

  return Response.json({
    stats,
    sessions: sessions.map((s) => ({
      id: s.id,
      subject: s.subject,
      topic: s.topic,
      grade: s.grade,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      knowledgeGainScore: s.analysis?.knowledgeGainScore,
      sentimentLabel: s.analysis?.sentimentLabel,
    })),
    streak,
    pin: (session.user as any).pin,
  });
}
