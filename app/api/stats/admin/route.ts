import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

    const schoolId = (authSession.user as any).schoolId;
    const [totalStudents, totalTeachers, totalClasses, allStats, sessions] = await Promise.all([
      prisma.user.count({ where: { schoolId, role: "STUDENT" } }),
      prisma.user.count({ where: { schoolId, role: "TEACHER" } }),
      prisma.class.count({ where: { schoolId } }),
      prisma.learnerStats.findMany({ where: { student: { schoolId } }, select: { masteryScore: true, student: { select: { id: true } } } }),
      prisma.session.count({ where: { student: { schoolId }, startedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    ]);
    const avgMastery = allStats.length > 0 ? Math.round(allStats.reduce((s, a) => s + a.masteryScore, 0) / allStats.length) : 0;
    const strugglingCount = new Set(allStats.filter((s) => s.masteryScore < 40).map((s) => s.student.id)).size;

    return Response.json({ totalStudents, totalTeachers, totalClasses, avgMastery, strugglingCount, activeSessions: sessions });
  } catch (error) {
    console.error("Admin stats error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
