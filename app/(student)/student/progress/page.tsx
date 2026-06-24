"use client";
import { useEffect, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import MasteryPill from "@/components/ui/MasteryPill";
import SentimentBadge from "@/components/ui/SentimentBadge";

export default function StudentProgressPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/stats/student").then((r) => r.json()).then(setData); }, []);
  if (!data) return <div className="text-text-muted p-8">Loading...</div>;

  const subjectColors: Record<string, string> = { MATHEMATICS: "#121bde", PHYSICS: "#1cdb19", ENGLISH: "#d72d02" };
  const bySubject: Record<string, any[]> = {};
  for (const s of data.stats || []) {
    if (!bySubject[s.subject]) bySubject[s.subject] = [];
    bySubject[s.subject].push(s);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Progress</h1>

      {/* Mastery bars */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Subject Mastery</h2>
        <div className="space-y-4">
          {Object.entries(bySubject).map(([subj, stats]) => {
            const avg = Math.round(stats.reduce((a: number, s: any) => a + s.masteryScore, 0) / stats.length);
            return <ProgressBar key={subj} value={avg} color={subjectColors[subj] || "#1cdb19"} label={subj === "MATHEMATICS" ? "Maths" : subj === "PHYSICS" ? "Physics" : "English"} />;
          })}
        </div>
      </div>

      {/* Per-topic breakdown */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Topic Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 font-medium">Topic</th>
              <th className="pb-2 font-medium">Subject</th>
              <th className="pb-2 font-medium">Mastery</th>
              <th className="pb-2 font-medium">Sessions</th>
              <th className="pb-2 font-medium">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {(data.stats || []).map((s: any) => (
              <tr key={s.topicId} className="border-b border-border hover:bg-bg-secondary/50 transition-colors">
                <td className="py-2 text-text-primary">{s.topicTitle}</td>
                <td className="py-2 text-text-secondary">{s.subject}</td>
                <td className="py-2"><MasteryPill score={s.masteryScore} /></td>
                <td className="py-2 text-text-secondary">{s.sessionsCount}</td>
                <td className="py-2 text-text-muted text-xs">{new Date(s.lastActive).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Session history */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Session History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Subject</th>
              <th className="pb-2 font-medium">Topic</th>
              <th className="pb-2 font-medium">Knowledge Gain</th>
              <th className="pb-2 font-medium">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {(data.sessions || []).map((s: any) => (
              <tr key={s.id} className="border-b border-border hover:bg-bg-secondary/50 transition-colors">
                <td className="py-2 text-text-muted text-xs">{new Date(s.startedAt).toLocaleDateString()}</td>
                <td className="py-2 text-text-secondary">{s.subject}</td>
                <td className="py-2 text-text-primary">{s.topic}</td>
                <td className="py-2">{s.knowledgeGainScore != null ? <MasteryPill score={s.knowledgeGainScore} /> : "-"}</td>
                <td className="py-2">{s.sentimentLabel ? <SentimentBadge label={s.sentimentLabel} /> : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.sessions?.length === 0 && <div className="text-text-muted text-sm p-4">No sessions yet.</div>}
      </div>

      <div className="text-center">
        <div className="text-4xl font-bold text-accent-green">{data.streak}</div>
        <div className="text-sm text-text-muted">day study streak</div>
      </div>
    </div>
  );
}
