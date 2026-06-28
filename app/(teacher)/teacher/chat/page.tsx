"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

interface Message { role: "user"|"assistant"; content: string; }

export default function TeacherChatPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { lang } = useLang();
  const [grade, setGrade] = useState("10");
  const [subject, setSubject] = useState("MATHEMATICS");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput("");
    const newMessages: Message[] = [...messages, {role:"user",content:userMsg}];
    setMessages(newMessages); setLoading(true);
    try {
      const res = await fetch("/api/lesson-plan", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:newMessages,grade,subject,teacherId:user?.id})});
      const reader = res.body?.getReader(); const decoder = new TextDecoder();
      let assistantMsg = ""; setMessages([...newMessages,{role:"assistant",content:""}]);
      if (reader) { while (true) { const {done,value} = await reader.read(); if (done) break; assistantMsg += decoder.decode(value,{stream:true}); setMessages([...newMessages,{role:"assistant",content:assistantMsg}]); } }
    } catch { setMessages([...newMessages,{role:"assistant",content:lang==="af"?"Jammer, iets het verkeerd geloop.":"Sorry, something went wrong."}]); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} };

  const savePlan = async () => {
    const last = [...messages].reverse().find((m)=>m.role==="assistant"); if (!last) return;
    setSaving(true);
    await fetch("/api/lesson-plan/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:`Lesson Plan — ${t(lang,"grade")} ${grade} ${subject}`,grade:`G${grade}`,subject,content:last.content})});
    setSaving(false); alert(lang==="af"?"Lesplan gestoor!":"Lesson plan saved!");
  };

  const latestPlan = [...messages].reverse().find((m)=>m.role==="assistant")?.content||"";

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-0">
      <div className="flex-1 flex flex-col pr-3">
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <select value={grade} onChange={(e)=>setGrade(e.target.value)} className="input-field text-sm">
            {[4,5,6,7,8,9,10,11,12].map(g=><option key={g} value={g}>{t(lang,"grade")} {g}</option>)}
          </select>
          <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="input-field text-sm">
            <option value="MATHEMATICS">{t(lang,"mathematics")}</option>
            <option value="PHYSICS">{t(lang,"physics")}</option>
            <option value="ENGLISH">{t(lang,"englishLabel")}</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length===0&&<div className="text-text-muted text-sm p-4">{lang==="af"?"Vra my om 'n les te beplan.":"Ask me to plan a lesson."}</div>}
          {messages.map((msg,i)=><div key={i} className={`flex ${msg.role==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[85%] px-4 py-3 rounded-card ${msg.role==="user"?"bg-accent-blue text-text-primary":"bg-card text-text-primary"}`}><div className="text-sm whitespace-pre-wrap">{msg.content}</div></div></div>)}
          {loading&&<div className="flex justify-start"><div className="bg-card px-5 py-3 rounded-card text-text-muted text-sm"><span className="inline-flex gap-1"><span className="animate-pulse">●</span><span className="animate-pulse" style={{animationDelay:"0.2s"}}>●</span><span className="animate-pulse" style={{animationDelay:"0.4s"}}>●</span></span></div></div>}
          <div ref={messagesEndRef}/>
        </div>
        <div className="shrink-0 flex gap-2 pt-4 border-t border-border">
          <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={lang==="af"?"Beskryf die les...":"Describe the lesson you want to plan..."} className="input-field flex-1" disabled={loading}/>
          <button onClick={sendMessage} disabled={loading||!input.trim()} className="btn-primary shrink-0">{t(lang,"sendMessage")}</button>
        </div>
      </div>
      <div className="w-[40%] border-l border-border pl-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{t(lang,"lessonPlanner")}</h2>
          {latestPlan&&<button onClick={savePlan} disabled={saving} className="btn-primary text-xs">{saving?(lang==="af"?"Stoor...":"Saving..."):t(lang,"saveLesson")}</button>}
        </div>
        {latestPlan?<div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{latestPlan}</div>:<div className="text-text-muted text-sm">{lang==="af"?"Jou lesplan sal hier verskyn.":"Your lesson plan will appear here as the AI builds it."}</div>}
      </div>
    </div>
  );
}
