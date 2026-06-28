import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tutorPrompt } from "@/lib/prompts/tutorPrompt";
import { subjectEnumMap } from "@/lib/subjectMap";
import { gradeEnumMap } from "@/lib/gradeMap";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user || (authSession.user as any).role !== "STUDENT") {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, grade, subject, learnerName, language = "en", hobbies = "" } = body;
    let { sessionId } = body;

    const studentId = (authSession.user as any).id;
    const subjectKey = subject || "general";
    const gradeEnum = gradeEnumMap[grade] || "G10";
    const subjectEnum = subjectEnumMap[subjectKey] || "GENERAL";

    if (!sessionId) {
      const session = await prisma.session.create({
        data: {
          studentId, subject: subjectEnum as any,
          topic: subjectKey === "general" ? "" : subjectKey,
          grade: gradeEnum as any, startedAt: new Date(),
        },
      });
      sessionId = session.id;
    }

    const systemPrompt = tutorPrompt(grade, subjectKey, "", learnerName, "CAPS", language, hobbies);
    const contextTag = `[CONTEXT: Grade ${grade}, Subject: ${subjectKey === "general" ? "General" : subjectKey}, CAPS/IEB]`;

    const apiMessages: any[] = [{ role: "system", content: systemPrompt }];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === "user") {
        const isLatest = i === messages.length - 1;
        apiMessages.push({ role: "user", content: isLatest ? `${msg.content}\n\n${contextTag}` : msg.content });
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
        try {
          const lastUserMsg = messages.filter((m: any) => m.role === "user").pop();
          if (lastUserMsg) {
            await prisma.message.createMany({
              data: [
                { sessionId, role: "user", content: lastUserMsg.content },
                { sessionId, role: "assistant", content: fullResponse },
              ],
            });
          }
        } catch (e) { console.error("Failed to save messages:", e); }
      },
    });

    const response = new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Session-Id": sessionId,
      },
    });
    return response;
  } catch (error) {
    console.error("Tutor API error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
}
