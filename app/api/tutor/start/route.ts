import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { subject, topic, grade } = await req.json();
  const studentId = (session.user as any).id;

  const sess = await prisma.session.create({
    data: {
      studentId,
      subject,
      topic,
      grade: (grade || "G10") as any,
    },
  });

  return Response.json({ sessionId: sess.id });
}
