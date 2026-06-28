"use client"
export const dynamic = 'force-dynamic'
import { useEffect, useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import ProgressBar from "@/components/ui/ProgressBar";
import MasteryPill from "@/components/ui/MasteryPill";
import SentimentBadge from "@/components/ui/SentimentBadge";

export default function StudentProgressPage() {
  const { lang } = useLang();
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/stats/student").then((r) => r.json()).then(setData); }, []);
  if (!data) return <div className="text-text-muted p-8">Loading...</div>;

  const subjectColors: Record<string,string> = { MATHEMATICS:"#121bde", PHYSICS:"#1cdb19", ENGLISH:"#d72d02" };
  const bySubject: Record<string,any[]> = {};
  for (const s of data.stats || []) { if (!bySubject[s.subject]) bySubject[s.subject] = []; bySubject[s.subject].push(s); }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t(lang, "progress")}</h1>
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang, "subjectProgress")}</h2>
        <div className="space-y-4">
          {Object.entries(bySubject).map(([subj, stats]) => {
            const avg = Math.round(stats.reduce((a:number,s:any)=>a+s.masteryScore,0)/stats.length);
            return <ProgressBar key={subj} value={avg} color={subjectColors[subj]||"#1cdb19"} label={subj==="MATHEMATICS"?"Maths":subj==="PHYSICS"?"Physics":"English"}/>;
          })}
        </div>
      </div>
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang, "noData")==="No data yet"?"Topic Breakdown":"Onderwerp Uiteensetting"}</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-text-muted text-left border-b border-border">
            <th className="pb-2 font-medium">Topic</th><th className="pb-2 font-medium">{t(lang,"subject")}</th><th className="pb-2 font-medium">{t(lang,"mastery")}</th><th className="pb-2 font-medium">{t(lang,"sessions")}</th><th className="pb-2 font-medium">{t(lang,"lastActive")}</th>
          </tr></thead>
          <tbody>{(data.stats||[]).map((s:any)=><tr key={s.topicId} className="border-b border-border hover:bg-bg-secondary/50">
            <td className="py-2 text-text-primary">{s.topicTitle}</td><td className="py-2 text-text-secondary">{s.subject}</td>
            <td className="py-2"><MasteryPill score={s.masteryScore}/></td><td className="py-2 text-text-secondary">{s.sessionsCount}</td>
            <td className="py-2 text-text-muted text-xs">{new Date(s.lastActive).toLocaleDateString()}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"sessions")}</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-text-muted text-left border-b border-border">
            <th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">{t(lang,"subject")}</th><th className="pb-2 font-medium">Topic</th><th className="pb-2 font-medium">{t(lang,"knowledgeGain")}</th><th className="pb-2 font-medium">{t(lang,"sentiment")}</th>
          </tr></thead>
          <tbody>{(data.sessions||[]).map((s:any)=><tr key={s.id} className="border-b border-border">
            <td className="py-2 text-text-muted text-xs">{new Date(s.startedAt).toLocaleDateString()}</td><td className="py-2 text-text-secondary">{s.subject}</td><td className="py-2 text-text-primary">{s.topic}</td>
            <td className="py-2">{s.knowledgeGainScore!=null?<MasteryPill score={s.knowledgeGainScore}/>:"-"}</td>
            <td className="py-2">{s.sentimentLabel?<SentimentBadge label={s.sentimentLabel}/>:"-"}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="text-center"><div className="text-4xl font-bold text-accent-green">{data.streak}</div><div className="text-sm text-text-muted">{lang==="af"?"dag studie streep":"day study streak"}</div></div>
    </div>
  );
}
