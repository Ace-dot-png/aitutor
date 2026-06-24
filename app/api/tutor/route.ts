import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tutorPrompt } from "@/lib/prompts/tutorPrompt";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, grade, subject, topic, learnerName, sessionId } = await req.json();

  const systemPrompt = tutorPrompt(grade, subject, topic, learnerName);
  const curriculumContext = `[CURRICULUM CONTEXT: Grade ${grade}, Subject: ${subject}, Topic: ${topic}. Respond only within CAPS and IEB scope for this grade and subject.]`;

  const apiMessages: any[] = [{ role: "system", content: systemPrompt }];
  for (const msg of messages) {
    if (msg.role === "user") {
      apiMessages.push({ role: "user", content: `${msg.content}\n\n${curriculumContext}` });
    } else if (msg.role === "assistant") {
      apiMessages.push({ role: "assistant", content: msg.content });
    }
  }

  const lastUserMsg = messages.filter((m: any) => m.role === "user").pop();
  if (lastUserMsg && sessionId) {
    await prisma.message.create({ data: { sessionId, role: "user", content: lastUserMsg.content } });
  }

  const stream = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: apiMessages,
    temperature: 0.4,
    max_tokens: 600,
    stream: true,
  });

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) { fullResponse += text; controller.enqueue(encoder.encode(text)); }
      }
      controller.close();
      if (sessionId && fullResponse) {
        await prisma.message.create({ data: { sessionId, role: "assistant", content: fullResponse } });
      }
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } });
}
