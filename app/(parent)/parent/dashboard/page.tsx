"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const SUBJECT_COLORS: Record<string, string> = { MATHEMATICS: "#121bde", PHYSICS: "#1cdb19", ENGLISH: "#d72d02" };
const SENTIMENT_COLORS: Record<string, string> = { positive: "#1cdb19", neutral: "#B0B0B0", struggling: "#d72d02", disengaged: "#6B6B6B" };

export default function ParentDashboardPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/stats/parent").then((r) => r.json()).then(setData); }, []);
  if (!data) return <div className="text-text-muted p-8">Loading...</div>;
  if (data.error) return <div className="text-text-muted p-8">{data.error}</div>;

  const sentimentData = Object.entries(data.sentimentCounts || {}).map(([key, value]) => ({
    name: key,
    value,
    color: SENTIMENT_COLORS[key] || "#6B6B6B",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{data.childName}</h1>
        <p className="text-text-muted text-sm">Grade {data.childGrade?.replace("G", "")} · {data.schoolName}</p>
      </div>

      {/* Mastery per subject */}
      <div className="grid grid-cols-3 gap-4">
        {["MATHEMATICS", "PHYSICS", "ENGLISH"].map((subj) => {
          const stats = data.stats?.filter((s: any) => s.subject === subj);
          const avg = stats?.length > 0 ? Math.round(stats.reduce((a: number, s: any) => a + s.masteryScore, 0) / stats.length) : 0;
          return (
            <Card key={subj}>
              <div className="text-sm text-text-secondary mb-1">{subj === "MATHEMATICS" ? "Maths" : subj === "PHYSICS" ? "Physics" : "English"}</div>
              <div className="text-2xl font-semibold text-accent-green">{avg}%</div>
              <ProgressBar value={avg} color={SUBJECT_COLORS[subj]} className="mt-2" />
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent sessions */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Recent Sessions (7 days)</h2>
          <div className="space-y-2">
            {(data.recentSessions || []).map((s: any, i: number) => (
              <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-sm text-text-primary">{s.topic}</div>
                  <div className="text-xs text-text-muted">{s.subject} · {new Date(s.startedAt).toLocaleDateString()}</div>
                </div>
                <div className="text-sm text-accent-green">+{s.knowledgeGainScore || 0}</div>
              </div>
            ))}
            {data.recentSessions?.length === 0 && <div className="text-text-muted text-sm">No sessions this week.</div>}
          </div>
        </Card>

        {/* Sentiment donut */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Sentiment (7 days)</h2>
          {sentimentData.some((d: any) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {sentimentData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-text-muted text-sm">No data yet.</div>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {sentimentData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-text-muted capitalize">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pain points + Breakthroughs */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Pain Points</h2>
          <div className="space-y-1">
            {(data.painPoints || []).map((p: string, i: number) => (
              <div key={i} className="text-sm text-accent-orange bg-accent-orange/10 px-3 py-1.5 rounded-card">{p}</div>
            ))}
            {data.painPoints?.length === 0 && <div className="text-text-muted text-sm">No pain points flagged.</div>}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Breakthrough Moments</h2>
          <div className="space-y-1">
            {(data.breakthroughs || []).map((b: string, i: number) => (
              <div key={i} className="text-sm text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-card">{b}</div>
            ))}
            {data.breakthroughs?.length === 0 && <div className="text-text-muted text-sm">No breakthroughs yet.</div>}
          </div>
        </Card>
      </div>

      {/* Parent note */}
      {data.parentNote && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">AI Summary</h2>
          <p className="text-sm text-text-primary leading-relaxed">{data.parentNote}</p>
        </Card>
      )}

      {data.lastActive && (
        <div className="text-xs text-text-muted text-center">
          Last active: {new Date(data.lastActive).toLocaleString()}
        </div>
      )}
    </div>
  );
}
