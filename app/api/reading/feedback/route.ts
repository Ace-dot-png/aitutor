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

    const { passage, questions, answers, grade, language = "en" } = await req.json();
    if (!passage || !questions || !answers) return Response.json({ error: "Missing fields" }, { status: 400 });

    const isAfrikaans = language === "af";
    const afRules = isAfrikaans ? afrikaansRules + "\n\n" : "";
    const safeGrade = sanitizeInput(grade);
    const safePassage = sanitizeInput(passage);

    const qaText = questions.map((q: string, i: number) =>
      `Q${i + 1}: ${sanitizeInput(q)}\nA${i + 1}: ${sanitizeInput(answers[i] || "")}`
    ).join("\n");

    const prompt = `${afRules}You are a supportive reading comprehension teacher.
A Grade ${safeGrade} learner has answered comprehension questions about a passage.

Passage: ${safePassage}
Questions and answers:
${qaText}

For each answer:
- Say if it is correct, partially correct, or incorrect
- Give encouraging feedback
- If wrong, guide them toward the right answer without just giving it

Be warm, encouraging, and age-appropriate for Grade ${safeGrade}.
Respond in ${isAfrikaans ? "formal Afrikaans" : "South African English"}.

Return ONLY this JSON structure, no other text:
{
  "feedback": "Overall encouraging feedback paragraph",
  "results": [
    { "question": 1, "correct": true, "feedback": "Specific feedback for Q1" },
    { "question": 2, "correct": false, "feedback": "Specific feedback for Q2" },
    { "question": 3, "correct": true, "feedback": "Specific feedback for Q3" },
    { "question": 4, "correct": false, "feedback": "Specific feedback for Q4" },
    { "question": 5, "correct": true, "feedback": "Specific feedback for Q5" }
  ]
}`;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const clean = raw.replace(/```json\n?|```/g, "").trim();
    const data = JSON.parse(clean);

    return Response.json(data);
  } catch (error) {
    console.error("Reading feedback error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
