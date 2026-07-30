import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resetPassword } from "@/lib/store";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, newPassword } = await req.json();
  if (!email || !newPassword || newPassword.length < 6) {
    return Response.json({ error: "Email and new password (min 6 chars) required" }, { status: 400 });
  }

  const ok = resetPassword(email, newPassword);
  if (!ok) return Response.json({ error: "User not found" }, { status: 404 });

  return Response.json({ success: true });
}
