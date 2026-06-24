import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { lessonPlanPrompt } from "@/lib/prompts/lessonPlanPrompt";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TEACHER") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, grade, subject } = await req.json();
  const systemPrompt = lessonPlanPrompt(grade, subject);
  const apiMessages: any[] = [{ role: "system", content: systemPrompt }, ...messages];

  const stream = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: apiMessages,
    temperature: 0.6,
    max_tokens: 1200,
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

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } });
}
