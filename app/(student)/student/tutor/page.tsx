"use client";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";

const SUBJECTS = [
  { key: "MATHEMATICS", label: "Mathematics", icon: "∑", color: "#121bde" },
  { key: "PHYSICS", label: "Physical Sciences", icon: "⚡", color: "#1cdb19" },
  { key: "ENGLISH", label: "English HL", icon: "📖", color: "#d72d02" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function StudentTutorPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [subject, setSubject] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectSubject = (key: string) => {
    setSubject(key);
    const subj = SUBJECTS.find((s) => s.key === key)!;
    setMessages([{
      role: "assistant",
      content: `Hey ${user?.name || "there"}! I'm your ${subj.label} tutor for Grade ${user?.grade?.replace("G", "") || "10"}. What topic are you working on? Ask me anything — I'll help you work through it step by step.`
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !subject) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          grade: user?.grade?.replace("G", "") || "10",
          subject,
          topic: "General",
          learnerName: user?.name || "Learner",
          sessionId: null,
        }),
      });

      if (!res.ok) {
        // Fallback: show a helpful response without AI
        setMessages([...newMessages, {
          role: "assistant",
          content: `I understand you're asking about ${subject === "MATHEMATICS" ? "maths" : subject === "PHYSICS" ? "physics" : "English"}. Let me help you think through this...

Try approaching it step by step. What do you already know about this topic? If you can share what you've tried so far, I can guide you from there.`
        }]);
        setLoading(false);
        return;
      }

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
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Let me help you another way — what specific concept are you working on? I can walk you through it with examples."
      }]);
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

  if (!subject) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">AI Tutor</h1>
          <p className="text-text-muted text-sm mt-1">Pick a subject and start learning</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {SUBJECTS.map((s) => (
            <Card key={s.key} onClick={() => selectSubject(s.key)} className="text-center p-8 cursor-pointer hover:border-accent-blue transition-colors">
              <div className="text-5xl mb-4">{s.icon}</div>
              <div className="text-lg font-semibold text-text-primary">{s.label}</div>
              <div className="text-text-muted text-sm mt-2">Click to start chatting</div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const subjData = SUBJECTS.find((s) => s.key === subject)!;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => { setSubject(null); setMessages([]); }} className="text-text-muted hover:text-text-primary text-sm">
            ← Switch Subject
          </button>
          <div>
            <h1 className="text-lg font-semibold">{subjData.label} Tutor</h1>
            <p className="text-text-muted text-xs">Grade {user?.grade?.replace("G", "") || "10"} • Ask me anything</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] px-4 py-3 rounded-card ${
              msg.role === "user" ? "bg-accent-blue text-text-primary" : "bg-card text-text-primary"
            }`}>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card px-5 py-3 rounded-card text-text-muted text-sm">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse" style={{animationDelay:"0.2s"}}>●</span>
                <span className="animate-pulse" style={{animationDelay:"0.4s"}}>●</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 flex gap-2 pt-4 border-t border-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={messages.length <= 1 ? "Ask your first question..." : "Type your response..."}
          className="input-field flex-1"
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary shrink-0">
          Send
        </button>
      </div>
    </div>
  );
}
