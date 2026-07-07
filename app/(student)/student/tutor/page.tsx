"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { ColouredResponse } from "@/components/tutor/ColouredResponse";
import { Mascot } from "@/components/mascot/Mascot";

const SUBJECT_KEYS = ["mathematics","physics","english","afrikaans","accounting","business_studies","economics","geography","history","life_sciences","natural_sciences","social_sciences","economic_management","life_skills"];

interface Message { role: "user" | "assistant"; content: string; }

export default function StudentTutorPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { lang } = useLang();
  const [subject, setSubject] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [curriculum, setCurriculum] = useState<any>(null);
  const [initialised, setInitialised] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [learningStyle, setLearningStyle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetch("/data/curriculum.json").then((r) => r.json()).then(setCurriculum); }, []);

  useEffect(() => {
    fetch("/api/user/learning-style")
      .then((r) => r.json())
      .then((d) => setLearningStyle(d.learningStyle || ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!initialised) {
      setInitialised(true);
      const greeting = lang === "af"
        ? `Hallo ${user?.name || "leerder"}! Waaraan werk jy vandag? Jy kan 'n vak hierbo kies of net enige iets vir my vra.`
        : `Hi ${user?.name || "there"}! What are you working on today? You can pick a subject above or just ask me anything.`;
      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [lang, user?.name, initialised]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const gradeNum = user?.grade?.replace("G", "") || "10";
  const gradeData = curriculum?.grades?.[gradeNum] || {};
  const availableSubjects = Object.keys(gradeData).filter((k) => SUBJECT_KEYS.includes(k));
  const subjectLabel = (key: string) => gradeData[key]?.label || key;

  const sendMessage = async () => {
    if (!input.trim() || loading || sessionEnded) return;
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
          messages: newMessages, grade: gradeNum,
          subject: subject || "general",
          learnerName: user?.name || "Learner",
          language: lang, sessionId,
          learningStyle,
        }),
      });

      const newSessionId = res.headers.get("X-Session-Id");
      if (newSessionId && !sessionId) setSessionId(newSessionId);

      if (!res.ok) {
        setMessages([...newMessages, {
          role: "assistant",
          content: lang === "af" ? "Ek sukkel om nou te koppel. Probeer asseblief weer." : "I'm having trouble connecting. Please try again."
        }]);
        setLoading(false); return;
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
      setMessages([...newMessages, { role: "assistant", content: lang === "af" ? "Jammer, iets het verkeerd geloop." : "Sorry, something went wrong." }]);
    } finally { setLoading(false); }
  };

  const endSession = async () => {
    if (!sessionId || sessionEnded) return;
    setLoading(true);
    try {
      const res = await fetch("/api/session-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId, grade: gradeNum,
          subject: subject || "general",
          topic: subject || "general",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
        setSessionEnded(true);
        setSessionId(null);
      }
    } catch {} finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const mascotPose = analysisResult
    ? (analysisResult.knowledgeGainScore >= 70 ? "excited" as const : analysisResult.knowledgeGainScore >= 40 ? "encouraging" as const : "gentle" as const)
    : "greeting" as const;
  const mascotMsg = analysisResult
    ? (analysisResult.knowledgeGainScore >= 70
        ? (lang === "af" ? "Uitstekende sessie! Jy maak goeie vordering." : "Great session! You're making progress.")
        : analysisResult.knowledgeGainScore >= 40
        ? (lang === "af" ? "Goeie moeite. Gaan so voort!" : "Good effort. Keep going!")
        : (lang === "af" ? "Moenie bekommerd wees nie, elke sessie help. Probeer weer binnekort." : "Don't worry, every session helps. Try again soon."))
    : undefined;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="shrink-0 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field text-sm max-w-xs">
            <option value="">{t(lang, "selectSubject")} ({t(lang, "optional") || "optional"})</option>
            {availableSubjects.map((key) => (<option key={key} value={key}>{subjectLabel(key)}</option>))}
          </select>
          {subject && <span className="text-xs text-text-muted">{t(lang, "subject")}: {subjectLabel(subject)}</span>}
        </div>
        {!sessionEnded && messages.length > 1 && (
          <button onClick={endSession} className="btn-secondary text-xs" disabled={loading}>
            {loading ? (lang === "af" ? "Ontleed..." : "Analysing...") : t(lang, "endSession")}
          </button>
        )}
      </div>

      {sessionEnded && analysisResult && (
        <div className="card p-3 mb-3 shrink-0 border-accent-green">
          <div className="flex items-center gap-4">
            <Mascot pose={mascotPose} size={60} />
            <div>
              <div className="text-sm font-semibold text-accent-green">{t(lang, "sessionComplete")}</div>
              <div className="text-text-secondary text-xs">{t(lang, "knowledgeGain")}: {analysisResult.knowledgeGainScore}/100</div>
              <div className="text-text-muted text-xs mt-1">{mascotMsg}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] px-4 py-3 rounded-card ${msg.role === "user" ? "bg-accent-blue text-text-primary" : "bg-card text-text-primary"}`}>
              {msg.role === "assistant"
                ? <ColouredResponse content={msg.content} />
                : <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              }
            </div>
          </div>
        ))}
        {loading && !sessionEnded && (
          <div className="flex justify-start">
            <div className="bg-card px-5 py-3 rounded-card text-text-muted text-sm">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">●</span><span className="animate-pulse" style={{animationDelay:"0.2s"}}>●</span><span className="animate-pulse" style={{animationDelay:"0.4s"}}>●</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!sessionEnded && (
        <div className="shrink-0 flex gap-2 pt-4 border-t border-border">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={t(lang, "typeMessage")} className="input-field flex-1" disabled={loading} />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary shrink-0">{t(lang, "sendMessage")}</button>
        </div>
      )}
    </div>
  );
}
