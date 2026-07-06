import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });
    const user = await prisma.user.findUnique({
      where: { id: (authSession.user as any).id },
      select: { hobbies: true },
    });
    return Response.json({ hobbies: (user as any)?.hobbies ?? "" });
  } catch (error) {
    return Response.json({ hobbies: "" });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });
    const { hobbies } = await req.json();
    await prisma.user.update({
      where: { id: (authSession.user as any).id },
      data: { hobbies },
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
