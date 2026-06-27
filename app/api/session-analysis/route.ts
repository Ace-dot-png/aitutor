import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analysisPrompt } from "@/lib/prompts/analysisPrompt";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { sessionId, grade, subject, topic } = await req.json();
    if (!sessionId) return Response.json({ error: "Missing sessionId" }, { status: 400 });

    const studentId = (authSession.user as any).id;

    // Fetch real messages from DB
    const sessionMessages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    const transcript = sessionMessages.length > 0
      ? sessionMessages.map((m) => `${m.role === "user" ? "Learner" : "aiTutor"}: ${m.content}`).join("\n")
      : "No messages recorded.";

    const prompt = analysisPrompt(transcript, grade || "10", subject || "General", topic || "");

    let analysisData;
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
      });
      const raw = completion.choices[0]?.message?.content || "{}";
      const clean = raw.replace(/```json\n?|```/g, "").trim();
      analysisData = JSON.parse(clean);
    } catch {
      analysisData = {
        sentimentLabel: "neutral",
        sentimentScore: 50,
        knowledgeGainScore: 50,
        painPoints: [],
        breakthroughMoments: [],
        teacherNote: "Session completed. Analysis unavailable.",
        parentNote: "Your child completed a study session.",
      };
    }

    // Save analysis
    await prisma.sessionAnalysis.create({
      data: {
        sessionId,
        sentimentLabel: (analysisData.sentimentLabel?.toUpperCase() || "NEUTRAL") as any,
        sentimentScore: analysisData.sentimentScore || 50,
        knowledgeGainScore: analysisData.knowledgeGainScore || 50,
        painPoints: analysisData.painPoints || [],
        breakthroughMoments: analysisData.breakthroughMoments || [],
        teacherNote: analysisData.teacherNote || "",
        parentNote: analysisData.parentNote || "",
      },
    });

    const topicId = topic || "general";

    // Upsert learner stats
    const existing = await prisma.learnerStats.findUnique({
      where: { studentId_subject_topicId: { studentId, subject: subject as any, topicId } },
    });

    await prisma.learnerStats.upsert({
      where: { studentId_subject_topicId: { studentId, subject: subject as any, topicId } },
      create: {
        studentId,
        subject: subject as any,
        topicId,
        topicTitle: topic || "General",
        sessionsCount: 1,
        masteryScore: analysisData.knowledgeGainScore || 50,
      },
      update: {
        sessionsCount: (existing?.sessionsCount || 0) + 1,
        masteryScore: analysisData.knowledgeGainScore || 50,
        lastActive: new Date(),
      },
    });

    // Rolling average - fix division by zero
    const lastAnalyses = await prisma.sessionAnalysis.findMany({
      where: { session: { studentId, subject: subject as any, topic: topic || "general" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { knowledgeGainScore: true },
    });

    const masteryScore = lastAnalyses.length > 0
      ? Math.round(lastAnalyses.reduce((sum, a) => sum + a.knowledgeGainScore, 0) / lastAnalyses.length)
      : (analysisData.knowledgeGainScore || 50);

    await prisma.learnerStats.update({
      where: { studentId_subject_topicId: { studentId, subject: subject as any, topicId } },
      data: { masteryScore },
    });

    // Close session
    await prisma.session.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });

    return Response.json(analysisData);
  } catch (error) {
    console.error("Session analysis error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
