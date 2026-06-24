import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { teacherId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const teacher = await prisma.user.findUnique({
    where: { id: params.teacherId },
    include: {
      teacherClasses: { include: { class: { include: { students: true } } } },
    },
  });

  if (!teacher) return Response.json({ error: "Not found" }, { status: 404 });

  const studentIds = new Set<string>();
  teacher.teacherClasses.forEach((tc) => tc.class.students.forEach((cs) => studentIds.add(cs.studentId)));

  const stats = await prisma.learnerStats.findMany({
    where: { studentId: { in: [...studentIds] } },
    include: { student: { select: { name: true, id: true } } },
  });

  const students = [...new Set(stats.map((s) => s.studentId))].map((id) => {
    const sStats = stats.filter((s) => s.studentId === id);
    return {
      studentId: id,
      name: sStats[0]?.student.name,
      subject: sStats[0]?.subject,
      mastery: Math.round(sStats.reduce((a, s) => a + s.masteryScore, 0) / sStats.length),
    };
  });

  const sessions = await prisma.session.findMany({
    where: { studentId: { in: [...studentIds] }, startedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    select: { startedAt: true },
  });

  const sessionTrend: Record<string, number> = {};
  sessions.forEach((s) => {
    const d = s.startedAt.toISOString().split("T")[0];
    sessionTrend[d] = (sessionTrend[d] || 0) + 1;
  });

  return Response.json({
    name: teacher.name,
    subjects: [...new Set(teacher.teacherClasses.map((tc) => tc.subject))],
    classes: [...new Set(teacher.teacherClasses.map((tc) => `${tc.class.grade?.replace("G", "")}${tc.class.name}`))],
    students,
    sessionTrend: Object.entries(sessionTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
  });
}
