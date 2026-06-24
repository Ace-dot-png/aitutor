"use client";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function TeacherChatPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [grade, setGrade] = useState("10");
  const [subject, setSubject] = useState("MATHEMATICS");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, grade, subject, teacherId: user?.id }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantMsg += decoder.decode(value, { stream: true });
          setMessages([...newMessages, { role: "assistant", content: assistantMsg }]);
        }
      }
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const savePlan = async () => {
    const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistantMsg) return;
    setSaving(true);
    await fetch("/api/lesson-plan/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Lesson Plan — Grade ${grade} ${subject}`,
        grade: `G${grade}`,
        subject,
        content: lastAssistantMsg.content,
      }),
    });
    setSaving(false);
    alert("Lesson plan saved!");
  };

  // Determine the latest assistant message for the right panel
  const latestPlan = [...messages].reverse().find((m) => m.role === "assistant")?.content || "";

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-0">
      {/* Left: Chat */}
      <div className="flex-1 flex flex-col pr-3">
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="input-field text-sm">
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field text-sm">
            <option value="MATHEMATICS">Mathematics</option>
            <option value="PHYSICS">Physical Sciences</option>
            <option value="ENGLISH">English HL</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-text-muted text-sm p-4">
              Ask me to plan a lesson. For example: "Help me plan a Grade 10 Maths lesson on Algebraic Expressions for tomorrow."
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-card ${msg.role === "user" ? "bg-accent-blue text-text-primary" : "bg-card text-text-primary"}`}>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="bg-card px-4 py-3 rounded-card text-text-muted text-sm animate-pulse">Planning...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 flex gap-2 pt-4 border-t border-border">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the lesson you want to plan..."
            className="input-field flex-1"
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary shrink-0">Send</button>
        </div>
      </div>

      {/* Right: Rendered Plan */}
      <div className="w-[40%] border-l border-border pl-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Lesson Plan</h2>
          {latestPlan && (
            <button onClick={savePlan} disabled={saving} className="btn-primary text-xs">
              {saving ? "Saving..." : "Save Plan"}
            </button>
          )}
        </div>
        {latestPlan ? (
          <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{latestPlan}</div>
        ) : (
          <div className="text-text-muted text-sm">Your lesson plan will appear here as the AI builds it.</div>
        )}
      </div>
    </div>
  );
}
