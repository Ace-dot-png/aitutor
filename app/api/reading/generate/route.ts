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

    const { topic, grade, language = "en" } = await req.json();
    if (!topic || !grade) return Response.json({ error: "Missing topic or grade" }, { status: 400 });

    const safeTopic = sanitizeInput(topic);
    const safeGrade = sanitizeInput(grade);
    const isAfrikaans = language === "af";

    const wordRange = safeGrade <= "3" ? "50-80 words, very simple vocabulary, short sentences"
      : safeGrade <= "5" ? "80-150 words, simple vocabulary, clear sentences"
      : safeGrade <= "7" ? "150-250 words, moderate vocabulary, varied sentences"
      : "250-400 words, academic vocabulary, complex ideas";

    const prompt = `You are an educational content creator for South African schools.
Generate an age-appropriate reading passage for Grade ${safeGrade} learners
about the topic: ${safeTopic}.

Requirements:
- Grade 1-3: ${wordRange}
- Grade 4-5: ${wordRange}
- Grade 6-7: ${wordRange}
- Grade 8-12: ${wordRange}

After the passage, generate exactly 5 comprehension questions appropriate
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
