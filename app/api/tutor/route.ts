import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tutorPrompt } from "@/lib/prompts/tutorPrompt";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, grade, subject, learnerName, language = "en" } = await req.json();

  const systemPrompt = tutorPrompt(grade, subject || "general", "", learnerName, "CAPS", language);

  const curriculumContext = subject
    ? `[CURRICULUM CONTEXT: Grade ${grade}, Subject: ${subject}, CAPS/IEB. Respond only within scope.]`
    : `[CURRICULUM CONTEXT: Grade ${grade}, CAPS/IEB. Help the learner identify their subject and topic.]`;

  const apiMessages: any[] = [{ role: "system", content: systemPrompt }];
  for (const msg of messages) {
    if (msg.role === "user") {
      apiMessages.push({ role: "user", content: `${msg.content}\n\n${curriculumContext}` });
    } else if (msg.role === "assistant") {
      apiMessages.push({ role: "assistant", content: msg.content });
    }
  }

  const stream = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: apiMessages,
    temperature: 0.4,
    max_tokens: 600,
    stream: true,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
  });
}
