import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Demo students — for when DB is offline
const DEMO_STUDENTS: Record<string, { id: string; name: string }> = {
  "482910": { id: "s1", name: "Thabo Nkosi" },
  "739215": { id: "s2", name: "Lerato Molefe" },
  "105638": { id: "s3", name: "Sipho Dlamini" },
  "629104": { id: "sc1", name: "Maryke se dogter" },
  "847362": { id: "ns1", name: "Klara" },
};

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user || (authSession.user as any).role !== "PARENT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { pin } = await req.json();
    if (!pin) return Response.json({ error: "PIN required" }, { status: 400 });

    // Try Prisma first, fall back to demo data
    try {
      const student = await prisma.user.findFirst({ where: { pin: pin.toString(), role: "STUDENT" } });
      if (student) {
        await prisma.user.update({ where: { id: (authSession.user as any).id }, data: { linkedStudentId: student.id } });
        return Response.json({ success: true, studentName: student.name, studentId: student.id });
      }
    } catch {
      // DB unavailable — use demo data
    }

    // Demo fallback
    const demoStudent = DEMO_STUDENTS[pin.toString()];
    if (demoStudent) {
      return Response.json({ success: true, studentName: demoStudent.name, studentId: demoStudent.id });
    }

    return Response.json({ error: "Invalid PIN. Please check with your child." }, { status: 404 });
  } catch (error) {
    console.error("Parent link error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
