import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TEACHER") {
    return new Response("Unauthorized", { status: 401 });
  }

  const teacherId = (session.user as any).id;

  const classTeachers = await prisma.classTeacher.findMany({
    where: { teacherId },
    include: { class: { include: { students: { include: { student: true } } } } },
  });

  const studentIds = new Set<string>();
  const classData: any[] = [];

  for (const ct of classTeachers) {
    for (const cs of ct.class.students) {
      studentIds.add(cs.studentId);
    }
    const stats = await prisma.learnerStats.findMany({
      where: { studentId: { in: ct.class.students.map((s) => s.studentId) }, subject: ct.subject },
      select: { masteryScore: true },
    });
    const avg = stats.length > 0 ? Math.round(stats.reduce((s, a) => s + a.masteryScore, 0) / stats.length) : 0;
    classData.push({
      classId: ct.classId,
      className: ct.class.name,
      grade: ct.class.grade,
      subject: ct.subject,
      studentCount: ct.class.students.length,
      avgMastery: avg,
    });
  }

  const allStats = await prisma.learnerStats.findMany({
    where: { studentId: { in: [...studentIds] } },
    include: { student: { select: { name: true, id: true, grade: true } } },
  });

  const strugglingStudents = allStats
    .filter((s) => s.masteryScore < 40)
    .map((s) => ({
      studentId: s.student.id,
      studentName: s.student.name,
      subject: s.subject,
      masteryScore: s.masteryScore,
      topicTitle: s.topicTitle,
      lastActive: s.lastActive,
    }));

  const recentSentiment = await prisma.sessionAnalysis.findMany({
    where: { session: { studentId: { in: [...studentIds] } } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      sentimentLabel: true,
      session: { select: { subject: true, student: { select: { name: true } } } },
      createdAt: true,
    },
  });

  return Response.json({
    totalStudents: studentIds.size,
    avgMastery: allStats.length > 0 ? Math.round(allStats.reduce((s, a) => s + a.masteryScore, 0) / allStats.length) : 0,
    strugglingCount: new Set(strugglingStudents.map((s) => s.studentId)).size,
    sessionsThisWeek: 0, // can be computed
    classData,
    strugglingStudents,
    recentSentiment: recentSentiment.map((r) => ({
      studentName: r.session.student.name,
      subject: r.session.subject,
      label: r.sentimentLabel,
      createdAt: r.createdAt,
    })),
  });
}
