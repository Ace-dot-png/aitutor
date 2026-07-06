import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (authSession.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { learningStyle: true } });
    return Response.json({ learningStyle: (user as any)?.learningStyle || "" });
  } catch {
    return Response.json({ learningStyle: "" });
  }
}

export async function PATCH(req: Request) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { learningStyle } = await req.json();
    if (!["visual", "auditory", "kinesthetic"].includes(learningStyle)) {
      return Response.json({ error: "Invalid learning style" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: (authSession.user as any).id },
      data: { learningStyle },
    });
    return Response.json({ success: true, learningStyle });
  } catch (error) {
    console.error("Learning style update error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
