import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { pin } = await req.json();

  const student = await prisma.user.findUnique({
    where: { pin, role: "STUDENT" },
  });

  if (!student) {
    return Response.json({ error: "Invalid PIN. No student found with that PIN." }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { linkedStudentId: student.id },
  });

  return Response.json({ success: true, studentName: student.name });
}
