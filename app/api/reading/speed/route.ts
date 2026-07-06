import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gradeEnumMap } from "@/lib/gradeMap";

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { wpm, grade } = await req.json();
    if (!wpm || !grade) return Response.json({ error: "Missing wpm or grade" }, { status: 400 });

    const studentId = (authSession.user as any).id;
    const gradeEnum = gradeEnumMap[grade] || "G10";

    try {
      await prisma.readingSpeedResult.create({
        data: { studentId, wpm: parseInt(wpm), grade: gradeEnum as any },
      });
    } catch {}

    // Benchmarks
    const benchmarks: Record<string, [number, number]> = {
      "1": [60, 100], "2": [60, 100], "3": [100, 130], "4": [100, 130],
      "5": [130, 160], "6": [130, 160], "7": [160, 200], "8": [160, 200],
      "9": [160, 200], "10": [200, 250], "11": [200, 250], "12": [200, 250],
    };
    const [low, high] = benchmarks[grade] || [100, 200];
    const rating = wpm >= high ? "excellent" : wpm >= low ? "good" : "needs_improvement";

    return Response.json({ wpm, rating, benchmarkLow: low, benchmarkHigh: high });
  } catch (error) {
    console.error("Reading speed error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
