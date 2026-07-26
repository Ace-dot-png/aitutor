import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (authSession.user as any).id;
    const school = await prisma.school.findFirst({
      where: { users: { some: { id: userId } } },
      select: { curriculumType: true },
    });

    return Response.json({ curriculum: school?.curriculumType || "CAPS" });
  } catch {
    return Response.json({ curriculum: "CAPS" });
  }
}

export async function PATCH(req: Request) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { curriculum } = await req.json();
    if (!["CAPS", "IEB", "CAMBRIDGE"].includes(curriculum)) {
      return Response.json({ error: "Invalid curriculum" }, { status: 400 });
    }

    // Update user's school curriculum
    const userId = (authSession.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { schoolId: true },
    });

    if (user?.schoolId) {
      await prisma.school.update({
        where: { id: user.schoolId },
        data: { curriculumType: curriculum as any },
      });
    }

    return Response.json({ success: true, curriculum });
  } catch (error) {
    console.error("Curriculum update error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
