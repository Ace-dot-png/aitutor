import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { [key: string]: string } }) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });
    return Response.json({ message: "Drill-down endpoint", id: Object.values(params)[0] });
  } catch (error) {
    console.error("Drill-down error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
