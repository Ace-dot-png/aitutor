import { NextRequest } from "next/server";
import { addUser, findUser } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, school, grade } = await req.json();

    if (!name || !email || !password || !role) {
      return Response.json({ error: "All fields required" }, { status: 400 });
    }
    if (!["STUDENT", "PARENT"].includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    if (findUser(emailLower, password)) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const pin = role === "STUDENT"
      ? String(Math.floor(100000 + Math.random() * 900000))
      : undefined;

    addUser({
      id: `new_${Date.now()}`,
      email: emailLower,
      name,
      password,
      role,
      schoolId: "s1",
      schoolName: school || "Home Schooled",
      grade: grade || undefined,
      pin,
      language: "en",
    });

    return Response.json({ success: true, pin });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
