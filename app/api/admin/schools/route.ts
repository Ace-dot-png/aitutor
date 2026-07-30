import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSchools, addSchool, importSchoolsCSV } from "@/lib/store";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return Response.json({ schools: getSchools() });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart")) {
    // CSV upload
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "No file" }, { status: 400 });
    const text = await file.text();
    const added = importSchoolsCSV(text);
    return Response.json({ success: true, added, schools: getSchools() });
  }

  // Text input
  const { name } = await req.json();
  if (!name || !name.trim()) return Response.json({ error: "School name required" }, { status: 400 });
  addSchool(name);
  return Response.json({ success: true, schools: getSchools() });
}
