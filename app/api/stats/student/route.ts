import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });

    const studentId = (authSession.user as any).id;
    const [stats, sessions] = await Promise.all([
      prisma.learnerStats.findMany({ where: { studentId }, orderBy: { lastActive: "desc" } }),
      prisma.session.findMany({ where: { studentId }, orderBy: { startedAt: "desc" }, take: 20, include: { analysis: { select: { knowledgeGainScore: true, sentimentLabel: true } } } }),
    ]);
    return Response.json({
      stats,
      sessions: sessions.map((s) => ({ id: s.id, subject: s.subject, topic: s.topic, startedAt: s.startedAt, knowledgeGainScore: s.analysis?.knowledgeGainScore, sentimentLabel: s.analysis?.sentimentLabel })),
      streak: 0,
      pin: (authSession.user as any).pin,
    });
  } catch (error) {
    console.error("Student stats error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
