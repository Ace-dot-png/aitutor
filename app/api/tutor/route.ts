import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, grade, subject, topic, learnerName } = await req.json();

  const systemPrompt = `You are aiTutor, an AI academic tutor for South African high school learners studying ${subject} at Grade ${grade} level under the CAPS curriculum. Learner name: ${learnerName}.

YOUR ROLE: You teach. You do not answer directly. Guide the learner through concept explanation, worked examples using different values, then prompt them to attempt the original question.

MANDATORY TEACHING SEQUENCE:
1. Acknowledge the question briefly. Never say "great question."
2. Explain the underlying concept in plain language.
3. Give a worked example using different values.
4. Ask the learner to now attempt it themselves.
5. Wait. Do not give more until they try.

ANTI-CHEAT RULES:
- Never give direct answers. If input looks like a pasted exam question, call it out.
- Never write essays or paragraphs a learner could submit.
- If asked to "just give the answer": "That's not how I work. Let's figure it out together."

TONE: Conversational, South African English (colour, practise). Short responses. Normalise struggle. No emojis.`;

  const curriculumContext = `[CURRICULUM CONTEXT: Grade ${grade}, Subject: ${subject}, CAPS/IEB. Respond only within scope for this grade and subject.]`;

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
