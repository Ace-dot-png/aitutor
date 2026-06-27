import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "TEACHER") return Response.json({ error: "Forbidden" }, { status: 403 });

    const teacherId = (authSession.user as any).id;
    const classTeachers = await prisma.classTeacher.findMany({
      where: { teacherId }, include: { class: { include: { students: true } } },
    });
    const studentIds = new Set<string>();
    const classData: any[] = [];
    for (const ct of classTeachers) {
      ct.class.students.forEach((cs) => studentIds.add(cs.studentId));
      const stats = await prisma.learnerStats.findMany({
        where: { studentId: { in: ct.class.students.map((s) => s.studentId) }, subject: ct.subject },
        select: { masteryScore: true },
      });
      const avg = stats.length > 0 ? Math.round(stats.reduce((s, a) => s + a.masteryScore, 0) / stats.length) : 0;
      classData.push({ classId: ct.classId, className: ct.class.name, grade: ct.class.grade, subject: ct.subject, studentCount: ct.class.students.length, avgMastery: avg });
    }
    const allStats = await prisma.learnerStats.findMany({ where: { studentId: { in: [...studentIds] } }, select: { masteryScore: true } });
    const avgMastery = allStats.length > 0 ? Math.round(allStats.reduce((s, a) => s + a.masteryScore, 0) / allStats.length) : 0;

    return Response.json({ totalStudents: studentIds.size, avgMastery, strugglingCount: allStats.filter((s) => s.masteryScore < 40).length, classData });
  } catch (error) {
    console.error("Teacher stats error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
