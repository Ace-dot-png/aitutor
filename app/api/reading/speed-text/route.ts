import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { afrikaansRules } from "@/lib/prompts/afrikaansRules";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if ((authSession.user as any).role !== "STUDENT") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { grade, language = "en" } = await req.json();
    const gradeNumber = parseInt(grade) || 10;
    const targetGrade = Math.max(1, gradeNumber - 2);
    const isAfrikaans = language === "af";
    const afRules = isAfrikaans ? afrikaansRules + "\n\n" : "";

    const prompt = `${afRules}Generate a short reading passage for a learner who is at Grade ${targetGrade} 
in terms of reading complexity. The actual learner is in Grade ${gradeNumber} but we are 
testing at a lower level first.

Requirements:
- 150 to 200 words exactly
- Vocabulary and sentence complexity appropriate for Grade ${targetGrade}
- Interesting and engaging topic (nature, animals, sport, technology, 
  adventure — avoid anything boring or too academic)
- No questions after the passage — just the passage itself
- South African context where natural
- ${isAfrikaans ? "Use formal South African Afrikaans. Follow ALL rules including double negation, STOMPI word order, and the 10-point checklist." : "Use South African English."}

Respond in ${isAfrikaans ? "formal Afrikaans" : "South African English"}.
Return ONLY the passage text, no title, no labels, no other text.`;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 500,
    });

    const passage = (completion.choices[0]?.message?.content || "").trim();

    return Response.json({ passage });
  } catch (error) {
    console.error("Speed text error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
