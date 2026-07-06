import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subjectEnumMap } from "@/lib/subjectMap";
import { gradeEnumMap } from "@/lib/gradeMap";

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { subject, topic, grade, score, total } = await req.json();
    const studentId = (authSession.user as any).id;
    const gradeEnum = gradeEnumMap[grade] || "G10";

    try {
      await prisma.testResult.create({
        data: {
          studentId,
          subject: subjectEnumMap[subject] as any,
          topic,
          grade: gradeEnum as any,
          score,
          total,
        },
      });
    } catch {}

    return Response.json({ success: true });
  } catch (error) {
    console.error("Tests save error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
