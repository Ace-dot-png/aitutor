import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TEACHER") {
    return new Response("Unauthorized", { status: 401 });
  }

  const plans = await prisma.lessonPlan.findMany({
    where: { teacherId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(plans);
}
