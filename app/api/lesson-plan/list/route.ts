import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user || (authSession.user as any).role !== "TEACHER") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const plans = await prisma.lessonPlan.findMany({
      where: { teacherId: (authSession.user as any).id },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(plans);
  } catch (error) {
    console.error("Lesson plan list error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
