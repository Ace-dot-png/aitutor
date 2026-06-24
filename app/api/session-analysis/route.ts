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
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { sessionId, messages, grade, subject, topic, studentId } = await req.json();

  const transcript = messages.map((m: any) => `${m.role === "user" ? "Learner" : "Tutor"}: ${m.content}`).join("\n\n");
  const prompt = analysisPrompt(transcript, grade, subject, topic);

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 500,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const jsonStr = raw.replace(/```json\n?|```/g, "").trim();
  const analysis = JSON.parse(jsonStr);

  await prisma.sessionAnalysis.create({
    data: {
      sessionId,
      sentimentLabel: analysis.sentimentLabel?.toUpperCase() || "NEUTRAL",
      sentimentScore: analysis.sentimentScore || 50,
      knowledgeGainScore: analysis.knowledgeGainScore || 50,
      painPoints: analysis.painPoints || [],
      breakthroughMoments: analysis.breakthroughMoments || [],
      teacherNote: analysis.teacherNote || "",
      parentNote: analysis.parentNote || "",
    },
  });

  await prisma.session.update({ where: { id: sessionId }, data: { endedAt: new Date() } });

  const existing = await prisma.learnerStats.findUnique({
    where: { studentId_subject_topicId: { studentId, subject, topicId: topic } },
  });

  await prisma.learnerStats.upsert({
    where: { studentId_subject_topicId: { studentId, subject, topicId: topic } },
    create: { studentId, subject, topicId: topic, topicTitle: topic, sessionsCount: 1, masteryScore: analysis.knowledgeGainScore || 50 },
    update: { sessionsCount: (existing?.sessionsCount || 0) + 1, masteryScore: analysis.knowledgeGainScore || 50, lastActive: new Date() },
  });

  const lastAnalyses = await prisma.sessionAnalysis.findMany({
    where: { session: { studentId, subject, topic } },
    orderBy: { createdAt: "desc" }, take: 5, select: { knowledgeGainScore: true },
  });
  const avgScore = Math.round(lastAnalyses.reduce((sum, a) => sum + a.knowledgeGainScore, 0) / lastAnalyses.length);
  await prisma.learnerStats.update({
    where: { studentId_subject_topicId: { studentId, subject, topicId: topic } },
    data: { masteryScore: avgScore },
  });

  return Response.json(analysis);
}
