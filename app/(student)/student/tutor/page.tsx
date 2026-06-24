"use client";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";

const SUBJECTS = [
  { key: "MATHEMATICS", label: "Mathematics", icon: "∑", color: "#121bde" },
  { key: "PHYSICS", label: "Physical Sciences", icon: "⚡", color: "#1cdb19" },
  { key: "ENGLISH", label: "English Home Language", icon: "📖", color: "#d72d02" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function StudentTutorPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [subject, setSubject] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any>(null);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/data/curriculum.json").then(r => r.json()).then(setCurriculum);
  }, []);

  useEffect(() => {
    if (subject && user?.grade) {
      const gradeData = curriculum?.grades?.[user.grade?.replace("G", "")];
      if (gradeData) {
        const key = subject === "PHYSICS" ? "physics" : subject === "MATHEMATICS" ? "mathematics" : "english";
        setAllTopics(gradeData[key]?.topics || []);
      }
    }
  }, [subject, curriculum, user?.grade]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = async () => {
    if (!subject || !topic || !user) return;
    setSessionEnded(false);
    setAnalysisResult(null);

    const res = await fetch("/api/tutor/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, topic, grade: user.grade }),
    });
    const data = await res.json();
    setSessionId(data.sessionId ?? null);

    // Add greeting
    const greeting = `Hi ${user.name}! We're working on ${topic} for Grade ${user.grade?.replace("G", "")} ${subject === "MATHEMATICS" ? "Mathematics" : subject === "PHYSICS" ? "Physical Sciences" : "English"}. Where are you getting stuck, or what would you like to work on first?`;
    setMessages([{ role: "assistant", content: greeting }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !subject || !topic) return;

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
          topic,
          learnerName: user?.name,
          sessionId,
        }),
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
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId || messages.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/session-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages,
          grade: user?.grade?.replace("G", "") || "10",
          subject,
          topic,
          studentId: user?.id,
        }),
      });
      const analysis = await res.json();
      setAnalysisResult(analysis);
      setSessionEnded(true);
    } catch (err) {
      console.error(err);
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

  // If no subject selected, show subject picker
  if (!subject) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Tutor</h1>
          <p className="text-text-muted text-sm mt-1">Choose a subject to start learning</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {SUBJECTS.map((s) => (
            <Card key={s.key} onClick={() => setSubject(s.key)} className="text-center p-8 cursor-pointer">
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="text-lg font-semibold text-text-primary">{s.label}</div>
              <div className="text-text-muted text-sm mt-2">Start tutoring session</div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const subjData = SUBJECTS.find((s) => s.key === subject)!;

  // Topic selection
  if (!sessionId && !sessionEnded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSubject(null)} className="text-text-muted hover:text-text-primary">← Back</button>
          <h1 className="text-2xl font-semibold">{subjData.label}</h1>
        </div>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-1">What topic would you like to work on?</h2>
          <p className="text-text-muted text-sm mb-4">Grade {user?.grade?.replace("G", "")} • {subjData.label}</p>
          <div className="mb-4">
            <label className="text-sm text-text-secondary block mb-2">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select a topic...</option>
              {allTopics.map((t: any) => (
                <option key={t.id} value={t.title}>{t.title}</option>
              ))}
            </select>
          </div>
          {topic && (
            <div className="mb-4">
              <label className="text-sm text-text-secondary block mb-2">Specific subtopic (optional)</label>
              <input
                type="text"
                placeholder="e.g., Factorisation"
                className="input-field w-full"
              />
            </div>
          )}
          <button onClick={startSession} disabled={!topic} className="btn-primary">
            Start Session
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSubject(null); setSessionId(null); setMessages([]); setSessionEnded(false); setAnalysisResult(null); }}
            className="text-text-muted hover:text-text-primary text-sm"
          >
            ← New Session
          </button>
          <div>
            <h1 className="text-lg font-semibold">{topic}</h1>
            <p className="text-text-muted text-xs">{subjData.label} · Grade {user?.grade?.replace("G", "")}</p>
          </div>
        </div>
        {!sessionEnded && messages.length > 0 && (
          <button onClick={endSession} className="btn-secondary text-sm" disabled={loading}>
            {loading ? "Analysing..." : "End Session"}
          </button>
        )}
      </div>

      {sessionEnded && analysisResult && (
        <div className="card p-4 mb-4 shrink-0 border-accent-green">
          <div className="text-sm font-semibold text-accent-green mb-1">Session Complete</div>
          <div className="text-text-secondary text-sm">
            Knowledge gain: {analysisResult.knowledgeGainScore}/100
            {analysisResult.sentimentLabel && (
              <span className="ml-2">· Mood: {analysisResult.sentimentLabel.toLowerCase()}</span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] px-4 py-3 rounded-card ${
                msg.role === "user"
                  ? "bg-accent-blue text-text-primary"
                  : "bg-card text-text-primary"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="bg-card px-4 py-3 rounded-card text-text-muted text-sm animate-pulse">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!sessionEnded && (
        <div className="shrink-0 flex gap-2 pt-4 border-t border-border">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={messages.length === 0 ? "Type your first question..." : "Type your response..."}
            className="input-field flex-1"
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary shrink-0">
            Send
          </button>
        </div>
      )}
    </div>
  );
}
