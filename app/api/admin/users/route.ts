import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllUsers, addUser, updateUser, deleteUser, resetPassword, StoredUser } from "@/lib/store";

function isAdmin(session: any) {
  return (session?.user as any)?.role === "ADMIN";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const users = getAllUsers().map(({ password, ...u }) => u);
  return Response.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, email, password, role, schoolName, grade } = body;
  if (!name || !email || !password || !role) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const pin = role === "STUDENT" ? String(Math.floor(100000 + Math.random() * 900000)) : undefined;

  addUser({
    id: `admin_${Date.now()}`,
    email: email.toLowerCase().trim(),
    name,
    password,
    role,
    schoolName: schoolName || "Sandton Academy",
    grade: grade || undefined,
    pin,
    language: "en",
  });

  return Response.json({ success: true, pin });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { email, updates } = await req.json();
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });

  const updated = updateUser(email, updates);
  if (!updated) return Response.json({ error: "User not found" }, { status: 404 });

  return Response.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });

  const ok = deleteUser(email);
  return Response.json({ success: ok, error: ok ? undefined : "Not found" });
}
