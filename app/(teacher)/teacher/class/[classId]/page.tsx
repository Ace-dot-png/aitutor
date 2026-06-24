"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import MasteryPill from "@/components/ui/MasteryPill";
import SentimentBadge from "@/components/ui/SentimentBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

export default function TeacherClassPage() {
  const { classId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/teacher/class/${classId}`).then((r) => r.json()).then(setData);
  }, [classId]);

  if (!data) return <div className="text-text-muted p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary text-sm">← Back</button>
        <h1 className="text-2xl font-semibold">
          Grade {data.grade?.replace("G", "")} {data.name}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4"><div className="text-text-muted text-xs uppercase mb-1">Students</div><div className="text-2xl font-semibold">{data.studentCount}</div></div>
        <div className="card p-4"><div className="text-text-muted text-xs uppercase mb-1">Avg Mastery</div><div className="text-2xl font-semibold text-accent-green">{data.avgMastery}%</div></div>
        <div className="card p-4"><div className="text-text-muted text-xs uppercase mb-1">Struggling</div><div className="text-2xl font-semibold text-accent-orange">{data.strugglingCount}</div></div>
        <div className="card p-4"><div className="text-text-muted text-xs uppercase mb-1">Sessions</div><div className="text-2xl font-semibold">{data.totalSessions}</div></div>
      </div>

      {/* Student Table */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Students</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Last Active</th>
              <th className="pb-2 font-medium">Sessions</th>
              <th className="pb-2 font-medium">Maths</th>
              <th className="pb-2 font-medium">Physics</th>
              <th className="pb-2 font-medium">English</th>
              <th className="pb-2 font-medium">Sentiment</th>
              <th className="pb-2 font-medium">Pain Points</th>
            </tr>
          </thead>
          <tbody>
            {(data.students || []).map((s: any) => (
              <>
                <tr
                  key={s.id}
                  className="border-b border-border hover:bg-bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                >
                  <td className="py-2 text-text-primary">{s.name}</td>
                  <td className="py-2 text-text-muted text-xs">{s.lastActive ? new Date(s.lastActive).toLocaleDateString() : "-"}</td>
                  <td className="py-2 text-text-secondary">{s.sessionCount}</td>
                  <td className="py-2">{s.mathsMastery != null ? <MasteryPill score={s.mathsMastery} /> : "-"}</td>
                  <td className="py-2">{s.physicsMastery != null ? <MasteryPill score={s.physicsMastery} /> : "-"}</td>
                  <td className="py-2">{s.englishMastery != null ? <MasteryPill score={s.englishMastery} /> : "-"}</td>
                  <td className="py-2">{s.sentiment ? <SentimentBadge label={s.sentiment} /> : "-"}</td>
                  <td className="py-2 text-xs text-text-muted max-w-[120px] truncate">{s.painPoints?.join(", ") || "-"}</td>
                </tr>
                {expanded === s.id && (
                  <tr key={`${s.id}-expanded`}>
                    <td colSpan={8} className="p-3 bg-bg-secondary">
                      <div className="text-xs text-text-muted mb-2">Session History</div>
                      {(s.sessions || []).slice(0, 5).map((ss: any, i: number) => (
                        <div key={i} className="text-xs flex justify-between py-1 text-text-secondary">
                          <span>{new Date(ss.startedAt).toLocaleDateString()} — {ss.topic}</span>
                          <span>{ss.knowledgeGainScore != null ? `+${ss.knowledgeGainScore}` : "-"}</span>
                        </div>
                      ))}
                      {s.sessions?.length === 0 && <div className="text-text-muted text-xs">No sessions yet.</div>}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mastery Distribution */}
      {data.masteryDistribution && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Mastery Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.masteryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="range" stroke="#6B6B6B" fontSize={12} />
              <YAxis stroke="#6B6B6B" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 8 }} />
              <Bar dataKey="count" fill="#121bde" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
