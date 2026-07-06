import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeInput } from "@/lib/sanitize";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { subject, topic, grade, count = 5, language = "en" } = await req.json();
    if (!subject || !topic || !grade) return Response.json({ error: "Missing subject, topic, or grade" }, { status: 400 });

    const safeSubject = sanitizeInput(subject);
    const safeTopic = sanitizeInput(topic);
    const safeGrade = sanitizeInput(grade);
    const isAfrikaans = language === "af";

    const prompt = `Generate ${count} multiple choice questions for Grade ${safeGrade} ${safeSubject}
on the topic: ${safeTopic}. Aligned to the CAPS/IEB curriculum.

Each question must have exactly 4 options (A, B, C, D) with one correct answer.
Questions should range from easy to challenging.
Respond in ${isAfrikaans ? "formal Afrikaans" : "South African English"}.

Return ONLY this JSON, no other text:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

correct is the index (0-3) of the correct option.`;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const clean = raw.replace(/```json\n?|```/g, "").trim();
    const data = JSON.parse(clean);

    return Response.json(data);
  } catch (error) {
    console.error("Tests generate error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
