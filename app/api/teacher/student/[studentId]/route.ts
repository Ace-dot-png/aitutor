import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { studentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TEACHER") {
    return new Response("Unauthorized", { status: 401 });
  }

  const student = await prisma.user.findUnique({
    where: { id: params.studentId },
    select: { name: true, grade: true },
  });

  const [stats, sessions] = await Promise.all([
    prisma.learnerStats.findMany({ where: { studentId: params.studentId } }),
    prisma.session.findMany({
      where: { studentId: params.studentId },
      orderBy: { startedAt: "desc" },
      take: 20,
      include: { analysis: { select: { knowledgeGainScore: true, sentimentLabel: true } } },
    }),
  ]);

  return Response.json({
    name: student?.name,
    grade: student?.grade,
    stats,
    sessions: sessions.map((s) => ({
      id: s.id,
      subject: s.subject,
      topic: s.topic,
      startedAt: s.startedAt,
      knowledgeGainScore: s.analysis?.knowledgeGainScore,
      sentimentLabel: s.analysis?.sentimentLabel,
    })),
  });
}
