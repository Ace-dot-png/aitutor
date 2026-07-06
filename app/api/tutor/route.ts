import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tutorPrompt } from "@/lib/prompts/tutorPrompt";
import { subjectEnumMap } from "@/lib/subjectMap";
import { gradeEnumMap } from "@/lib/gradeMap";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeInput } from "@/lib/sanitize";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user || (authSession.user as any).role !== "STUDENT") {
      return new Response("Unauthorized", { status: 401 });
    }

    const studentId = (authSession.user as any).id;
    const { allowed } = rateLimit(`tutor:${studentId}`, 20, 60000);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), { status: 429, headers: { "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { messages, grade, subject, learnerName, language = "en", hobbies = "", learningStyle = "" } = body;
    let { sessionId } = body;

    // Sanitize inputs
    const safeMessages = messages.map((m: any) => ({
      role: m.role,
      content: sanitizeInput(m.content || ""),
    }));
    const safeLearnerName = sanitizeInput(learnerName);
    const safeSubject = sanitizeInput(subject || "general");
    const safeHobbies = sanitizeInput(hobbies);
    const safeLearningStyle = sanitizeInput(learningStyle);

    const subjectKey = safeSubject;
    const gradeEnum = gradeEnumMap[grade] || "G10";

    if (!sessionId) {
      try {
        const session = await prisma.session.create({
          data: { studentId, subject: subjectEnumMap[subjectKey] as any, topic: subjectKey === "general" ? "" : subjectKey, grade: gradeEnum as any, startedAt: new Date() },
        });
        sessionId = session.id;
      } catch {}
    }

    const systemPrompt = tutorPrompt(grade, subjectKey, "", safeLearnerName, "CAPS", language, safeHobbies, safeLearningStyle);
    const contextTag = `[CONTEXT: Grade ${grade}, Subject: ${subjectKey === "general" ? "General" : subjectKey}, CAPS/IEB]`;

    const apiMessages: any[] = [{ role: "system", content: systemPrompt }];
    for (let i = 0; i < safeMessages.length; i++) {
      const msg = safeMessages[i];
      if (msg.role === "user") {
        apiMessages.push({ role: "user", content: i === safeMessages.length - 1 ? `${msg.content}\n\n${contextTag}` : msg.content });
      } else if (msg.role === "assistant") {
        apiMessages.push({ role: "assistant", content: msg.content });
      }
    }

    const stream = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini", messages: apiMessages, temperature: 0.4, max_tokens: 600, stream: true,
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
        if (sessionId) {
          try {
            const lastUserMsg = messages.filter((m: any) => m.role === "user").pop();
            if (lastUserMsg) {
              await prisma.message.createMany({
                data: [{ sessionId, role: "user", content: lastUserMsg.content }, { sessionId, role: "assistant", content: fullResponse }],
              });
            }
          } catch {}
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked", "X-Session-Id": sessionId || "" },
    });
  } catch (error) {
    console.error("Tutor API error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
