import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gradeEnumMap } from "@/lib/gradeMap";

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user || (authSession.user as any).role !== "TEACHER") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title, grade, subject, content } = await req.json();
    const gradeEnum = gradeEnumMap[grade] || "G10";
    const plan = await prisma.lessonPlan.create({
      data: {
        teacherId: (authSession.user as any).id,
        title, grade: gradeEnum as any, subject: subject as any, content,
      },
    });
    return Response.json(plan);
  } catch (error) {
    console.error("Lesson plan save error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
