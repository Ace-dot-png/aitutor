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

    const { type, grade, count = 5, language = "en" } = await req.json();
    if (!type || !grade) return Response.json({ error: "Missing type or grade" }, { status: 400 });

    const gradeNum = parseInt(grade) || 10;
    const isAfrikaans = language === "af";
    const afRules = isAfrikaans ? afrikaansRules + "\n\n" : "";

    const topicConfigs: Record<string, { name: string; prompt: string }> = {
      bonds: {
        name: "number bonds",
        prompt: `Generate ${count} number bond questions (addition/subtraction pairs that make a target number).
Grade ${gradeNum} level difficulty:
- Grade 1-3: bonds to 10 and 20 (e.g., 7 + ? = 10, 15 + ? = 20)
- Grade 4-5: bonds to 50 and 100 (e.g., 35 + ? = 100, 82 + ? = 100)
- Grade 6-7: bonds to 1000, decimal bonds (e.g., 0.3 + ? = 1, 450 + ? = 1000)
- Grade 8+: complex bonds including negative numbers (e.g., -12 + ? = 5, 3/4 + ? = 1)

Each question should test quick mental arithmetic. Keep numbers clean.

Return ONLY this JSON, no other text:
{
  "questions": [
    {
      "question": "What number makes the bond? 7 + ? = 10",
      "answer": "3",
      "hint": "Count up from 7 to 10."
    }
  ]
}`,
      },
      timestables: {
        name: "times tables",
        prompt: `Generate ${count} multiplication (times table) questions.
Grade ${gradeNum} level:
- Grade 1-3: 2x, 5x, 10x tables up to 10
- Grade 4-5: all tables 1-12
- Grade 6-7: tables 1-12 plus related division (e.g., 144 / 12)
- Grade 8+: multi-digit multiplication, squares, square roots

Each question should test quick recall. Include the correct answer.

Return ONLY this JSON, no other text:
{
  "questions": [
    {
      "question": "8 × 7 = ?",
      "answer": "56",
      "hint": "Think of it as 8 × 5 = 40, then add 8 × 2 = 16."
    }
  ]
}`,
      },
      division: {
        name: "long division",
        prompt: `Generate ${count} division questions.
Grade ${gradeNum} level:
- Grade 1-3: simple sharing (e.g., 12 ÷ 3)
- Grade 4-5: division within tables (e.g., 84 ÷ 7), remainders
- Grade 6-7: long division with 2-digit divisors (e.g., 672 ÷ 24), decimal answers
- Grade 8+: complex division, recurring decimals, algebraic division

Include the correct answer.

Return ONLY this JSON, no other text:
{
  "questions": [
    {
      "question": "672 ÷ 24 = ?",
      "answer": "28",
      "hint": "Break it down: 24 × 20 = 480, then 24 × 8 = 192. 480 + 192 = 672."
    }
  ]
}`,
      },
      exponents: {
        name: "exponents",
        prompt: `Generate ${count} exponent/powers questions.
Grade ${gradeNum} level:
- Grade 4-5: squares and square roots (e.g., 7² = ?, √81 = ?)
- Grade 6-7: cubes and cube roots, powers of 2,3,5,10
- Grade 8-9: negative exponents, fractional exponents, scientific notation
- Grade 10+: complex exponent rules, exponential equations

Include the correct answer.

Return ONLY this JSON, no other text:
{
  "questions": [
    {
      "question": "7² = ?",
      "answer": "49",
      "hint": "7 × 7 = 49."
    }
  ]
}`,
      },
      fractions: {
        name: "fractions",
        prompt: `Generate ${count} fraction questions.
Grade ${gradeNum} level:
- Grade 1-3: simple fractions of shapes, halves and quarters
- Grade 4-5: equivalent fractions, adding/subtracting with same denominator
- Grade 6-7: add/subtract unlike denominators, multiply fractions, mixed numbers
- Grade 8+: complex fractions, algebraic fractions, fraction operations combined

Include the correct answer. Keep fractions clean with whole-number results where possible.

Return ONLY this JSON, no other text:
{
  "questions": [
    {
      "question": "1/2 + 1/4 = ?",
      "answer": "3/4",
      "hint": "Convert 1/2 to 2/4 first, then add."
    }
  ]
}`,
      },
      rules: {
        name: "order of operations (BODMAS)",
        prompt: `Generate ${count} BODMAS / order of operations questions.
Grade ${gradeNum} level:
- Grade 4-5: simple two-step (e.g., 3 + 4 × 2)
- Grade 6-7: three-step with brackets (e.g., (8 - 3) × 4 + 2)
- Grade 8-9: multi-step with all operations including exponents
- Grade 10+: complex nested brackets and negative numbers

Use BODMAS: Brackets, Orders (powers/roots), Division, Multiplication, Addition, Subtraction.
Each question should test the correct order of operations.

Return ONLY this JSON, no other text:
{
  "questions": [
    {
      "question": "3 + 4 × 2 = ?",
      "answer": "11",
      "hint": "Multiplication before addition: 4 × 2 = 8, then 3 + 8 = 11."
    }
  ]
}`,
      },
    };

    const config = topicConfigs[type];
    if (!config) return Response.json({ error: "Invalid type" }, { status: 400 });

    const prompt = `${afRules}You are a maths teacher creating ${config.name} practice questions.

${config.prompt}

Respond in ${isAfrikaans ? "formal Afrikaans" : "English"}.
Keep questions clear and age-appropriate for Grade ${gradeNum}.
For Grade ${gradeNum <= 3 ? 'infant' : gradeNum <= 7 ? 'primary' : 'high'} school learners.`;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const clean = raw.replace(/```json\n?|```/g, "").trim();
    const data = JSON.parse(clean);

    return Response.json({ questions: data.questions || [], type: config.name });
  } catch (error) {
    console.error("Maths generate error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
