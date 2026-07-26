import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeInput } from "@/lib/sanitize";
import { afrikaansRules } from "@/lib/prompts/afrikaansRules";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { topic, grade, language = "en" } = await req.json();
    if (!topic || !grade) return Response.json({ error: "Missing topic or grade" }, { status: 400 });

    const safeTopic = sanitizeInput(topic);
    const safeGrade = sanitizeInput(grade);
    const isAfrikaans = language === "af";

    const afRules = isAfrikaans ? afrikaansRules + "\n\n" : "";

    const gradeNum = parseInt(safeGrade) || 10;
    const wordRange = gradeNum <= 3 ? "60-80 words"
      : gradeNum <= 5 ? "80-120 words"
      : gradeNum <= 7 ? "120-180 words"
      : gradeNum <= 9 ? "180-250 words"
      : "250-400 words";

    const questionCount = gradeNum <= 3 ? 3
      : gradeNum <= 5 ? 4
      : 5;

    const prompt = `${afRules}You are an educational content creator for South African schools.
Generate an age-appropriate reading passage for Grade ${safeGrade} learners
about the topic: ${safeTopic}.

Requirements:
- ${wordRange}
- Vocabulary and sentence complexity appropriate for Grade ${safeGrade}
- South African context where natural

After the passage, generate exactly ${questionCount} comprehension questions appropriate
for the grade level. Mix literal, inferential, and vocabulary questions.

Respond in ${isAfrikaans ? "formal Afrikaans" : "South African English"}.

Return ONLY this JSON structure, no other text:
{
  "title": "passage title",
  "passage": "the full reading passage",
  "questions": [
    "Question 1 here",
    "Question 2 here",
    "Question 3 here",
    "Question 4 here",
    "Question 5 here"
  ]
}`;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const clean = raw.replace(/```json\n?|```/g, "").trim();
    const data = JSON.parse(clean);

    return Response.json(data);
  } catch (error) {
    console.error("Reading generate error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
