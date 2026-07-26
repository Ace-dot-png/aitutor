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

    const { grade, language = "en", topic } = await req.json();
    const gradeNumber = parseInt(grade) || 10;
    const targetGrade = Math.max(1, gradeNumber - 2);
    const isAfrikaans = language === "af";
    const afRules = isAfrikaans ? afrikaansRules + "\n\n" : "";

    const wordRange = gradeNumber <= 6 ? "80-100 words"
      : gradeNumber <= 9 ? "120-150 words"
      : "160-200 words";

    const safeTopic = topic ? `The topic should be about: ${topic.trim()}.` : "Pick an engaging topic (nature, sport, adventure, technology, animals, discovery).";

    const prompt = `${afRules}Generate a reading passage for a learner at Grade ${targetGrade} reading level.
The learner is actually in Grade ${gradeNumber} but we are starting two levels below.

${safeTopic}

Requirements:
- ${wordRange}
- Vocabulary and sentence complexity appropriate for Grade ${targetGrade}
- South African context where natural
- ${isAfrikaans ? "Use formal South African Afrikaans. Follow ALL rules including double negation, STOMPI word order, and the 10-point checklist." : "Use South African English."}

Respond in ${isAfrikaans ? "formal Afrikaans" : "South African English"}.

After the passage, on a new line write QUESTIONS: then list exactly 5
comprehension questions about the passage. Number them 1 to 5.
Make them simple enough for Grade ${targetGrade} level.
Return questions in the same language as the passage.

After each question, on the next line write HINT: then a short hint
that points the learner toward the answer without giving it away.`;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 600,
    });

    const raw = (completion.choices[0]?.message?.content || "").trim();
    const parts = raw.split("QUESTIONS:");

    const passage = (parts[0] || "").trim();
    const questionsRaw = (parts[1] || "").trim();

    // Parse questions and hints
    const questionLines = questionsRaw.split(/\n/).filter(l => l.trim());
    const questions: string[] = [];
    const hints: string[] = [];

    for (const line of questionLines) {
      if (line.toLowerCase().startsWith("hint:")) {
        hints.push(line.replace(/^hint:\s*/i, "").trim());
      } else {
        const cleaned = line.replace(/^\d+\.?\s*/, "").trim();
        if (cleaned && !cleaned.toLowerCase().startsWith("hint:")) {
          questions.push(cleaned);
        }
      }
    }

    return Response.json({
      passage,
      questions: questions.slice(0, 5),
      hints: hints.slice(0, 5),
    });
  } catch (error) {
    console.error("Speed text error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
