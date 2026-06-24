import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const schoolId = (session.user as any).schoolId;

  const [totalStudents, totalTeachers, totalClasses, allStats, sessions] = await Promise.all([
    prisma.user.count({ where: { schoolId, role: "STUDENT" } }),
    prisma.user.count({ where: { schoolId, role: "TEACHER" } }),
    prisma.class.count({ where: { schoolId } }),
    prisma.learnerStats.findMany({
      where: { student: { schoolId } },
      select: { masteryScore: true, subject: true, topicId: true, topicTitle: true, student: { select: { grade: true, name: true, id: true } } },
    }),
    prisma.session.count({
      where: { student: { schoolId }, startedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  ]);

  const avgMastery = allStats.length > 0
    ? Math.round(allStats.reduce((s, a) => s + a.masteryScore, 0) / allStats.length)
    : 0;

  const strugglingCount = new Set(allStats.filter((s) => s.masteryScore < 40).map((s) => s.student.id)).size;

  // Sentiment by subject
  const analyses = await prisma.sessionAnalysis.findMany({
    where: { session: { student: { schoolId } } },
    select: { sentimentLabel: true, session: { select: { subject: true } } },
  });

  const sentimentBySubject: Record<string, Record<string, number>> = {};
  for (const a of analyses) {
    const subj = a.session.subject;
    if (!sentimentBySubject[subj]) sentimentBySubject[subj] = { POSITIVE: 0, NEUTRAL: 0, STRUGGLING: 0, DISENGAGED: 0 };
    sentimentBySubject[subj][a.sentimentLabel]++;
  }

  // Teachers performance
  const teachers = await prisma.user.findMany({
    where: { schoolId, role: "TEACHER" },
    include: {
      teacherClasses: { include: { class: true } },
    },
  });

  const teacherData = await Promise.all(
    teachers.map(async (t) => {
      const studentIds = new Set<string>();
      const subjects = new Set<string>();
      for (const tc of t.teacherClasses) {
        subjects.add(tc.subject);
        const students = await prisma.classStudent.findMany({
          where: { classId: tc.classId },
          select: { studentId: true },
        });
        students.forEach((s) => studentIds.add(s.studentId));
      }
      const studentIdArr = [...studentIds];
      const stats = await prisma.learnerStats.findMany({
        where: { studentId: { in: studentIdArr }, subject: { in: [...subjects] as any } },
        select: { masteryScore: true },
      });
      const avg = stats.length > 0 ? Math.round(stats.reduce((s, a) => s + a.masteryScore, 0) / stats.length) : 0;
      const weekSessions = await prisma.session.count({
        where: { studentId: { in: studentIdArr }, startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      });
      return {
        id: t.id,
        name: t.name,
        subjects: [...subjects],
        classes: [...new Set(t.teacherClasses.map((tc) => tc.class.name))],
        avgMastery: avg,
        sessionsThisWeek: weekSessions,
        status: avg >= 40 ? "Active" : "Inactive",
      };
    })
  );

  return Response.json({
    totalStudents,
    totalTeachers,
    totalClasses,
    avgMastery,
    strugglingCount,
    activeSessions: sessions,
    sentimentBySubject,
    teacherData,
  });
}
