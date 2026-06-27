import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user || (authSession.user as any).role !== "PARENT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { pin } = await req.json();
    const student = await prisma.user.findFirst({ where: { pin: pin.toString(), role: "STUDENT" } });
    if (!student) return Response.json({ error: "Invalid PIN. Please check with your child." }, { status: 404 });
    await prisma.user.update({ where: { id: (authSession.user as any).id }, data: { linkedStudentId: student.id } });
    return Response.json({ success: true, studentName: student.name });
  } catch (error) {
    console.error("Parent link error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
