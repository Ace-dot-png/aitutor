import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { grade: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const schoolId = (session.user as any).schoolId;
  const grade = params.grade;

  const classes = await prisma.class.findMany({
    where: { schoolId, grade: grade as any },
    include: { students: { include: { student: true } } },
  });

  const studentIds = classes.flatMap((c) => c.students.map((s) => s.studentId));
  const stats = await prisma.learnerStats.findMany({
    where: { studentId: { in: studentIds } },
  });

  const subjectAverages: Record<string, number> = {};
  for (const subj of ["MATHEMATICS", "PHYSICS", "ENGLISH"]) {
    const subjStats = stats.filter((s) => s.subject === subj);
    subjectAverages[subj] = subjStats.length > 0
      ? Math.round(subjStats.reduce((a, s) => a + s.masteryScore, 0) / subjStats.length)
      : 0;
  }

  const classData = await Promise.all(
    classes.map(async (c) => {
      const cStats = stats.filter((s) => c.students.some((cs) => cs.studentId === s.studentId));
      const maths = cStats.filter((s) => s.subject === "MATHEMATICS");
      const physics = cStats.filter((s) => s.subject === "PHYSICS");
      const english = cStats.filter((s) => s.subject === "ENGLISH");

      return {
        id: c.id,
        name: c.name,
        studentCount: c.students.length,
        mathsAvg: maths.length > 0 ? Math.round(maths.reduce((a, s) => a + s.masteryScore, 0) / maths.length) : 0,
        physicsAvg: physics.length > 0 ? Math.round(physics.reduce((a, s) => a + s.masteryScore, 0) / physics.length) : 0,
        englishAvg: english.length > 0 ? Math.round(english.reduce((a, s) => a + s.masteryScore, 0) / english.length) : 0,
        strugglingCount: new Set(cStats.filter((s) => s.masteryScore < 40).map((s) => s.studentId)).size,
      };
    })
  );

  return Response.json({
    studentCount: studentIds.length,
    avgMastery: stats.length > 0 ? Math.round(stats.reduce((a, s) => a + s.masteryScore, 0) / stats.length) : 0,
    strugglingCount: new Set(stats.filter((s) => s.masteryScore < 40).map((s) => s.studentId)).size,
    classCount: classes.length,
    subjectAverages,
    classes: classData,
  });
}
