import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addUser, getAllUsers, StoredUser } from "@/lib/store";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== "PARENT") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const parentEmail = (session.user as any).email;
  const all = getAllUsers();
  const children = all.filter(u => u.role === "STUDENT" && (u as any).parentEmail === parentEmail)
    .map(({ password, ...u }) => u);
  return Response.json({ children });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== "PARENT") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, email, password, grade, school, curriculum } = await req.json();
  if (!name || !email || !password || !grade) {
    return Response.json({ error: "Name, email, password, and grade required" }, { status: 400 });
  }

  const parentEmail = (session.user as any).email;
  const pin = String(Math.floor(100000 + Math.random() * 900000));

  addUser({
    id: `child_${Date.now()}`,
    email: email.toLowerCase().trim(),
    name,
    password,
    role: "STUDENT",
    schoolName: school || "Home Schooled",
    grade,
    pin,
    curriculum: curriculum || "CAPS",
    language: "en",
    parentEmail,
  } as StoredUser & { parentEmail: string });

  return Response.json({ success: true, pin, name });
}
