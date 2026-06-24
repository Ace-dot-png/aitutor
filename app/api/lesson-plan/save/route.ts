import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TEACHER") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { title, grade, subject, content } = await req.json();

  const plan = await prisma.lessonPlan.create({
    data: {
      teacherId: (session.user as any).id,
      title,
      grade,
      subject,
      content,
    },
  });

  return Response.json(plan);
}
