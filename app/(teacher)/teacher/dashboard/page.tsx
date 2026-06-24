"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import SentimentBadge from "@/components/ui/SentimentBadge";
import MasteryPill from "@/components/ui/MasteryPill";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/stats/teacher").then((r) => r.json()).then(setData); }, []);
  if (!data) return <div className="text-text-muted p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>

      {/* Stat bar */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Students" value={data.totalStudents} />
        <StatCard label="Avg Mastery" value={`${data.avgMastery}%`} />
        <StatCard label="Struggling" value={data.strugglingCount} />
        <StatCard label="Sessions This Week" value={data.sessionsThisWeek || "-"} />
      </div>

      {/* My Classes */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">My Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data.classData || []).map((c: any) => (
            <Card key={c.classId} onClick={() => router.push(`/teacher/class/${c.classId}`)}>
              <div className="text-sm font-semibold text-text-primary">
                Grade {c.grade?.replace("G", "")} {c.className} — {c.subject}
              </div>
              <div className="text-2xl font-semibold mt-2 text-accent-green">{c.avgMastery}%</div>
              <div className="text-xs text-text-muted mt-1">{c.studentCount} students · avg mastery</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Struggling Students */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Struggling Students</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 font-medium">Student</th>
              <th className="pb-2 font-medium">Subject</th>
              <th className="pb-2 font-medium">Mastery</th>
              <th className="pb-2 font-medium">Last Active</th>
              <th className="pb-2 font-medium">Top Pain Point</th>
            </tr>
          </thead>
          <tbody>
            {(data.strugglingStudents || []).map((s: any, i: number) => (
              <tr key={i} className="border-b border-border hover:bg-bg-secondary/50 transition-colors">
                <td className="py-2 text-text-primary">{s.studentName}</td>
                <td className="py-2 text-text-secondary">{s.subject}</td>
                <td className="py-2"><MasteryPill score={s.masteryScore} /></td>
                <td className="py-2 text-text-muted text-xs">{new Date(s.lastActive).toLocaleDateString()}</td>
                <td className="py-2 text-text-secondary">{s.topicTitle}</td>
              </tr>
            ))}
            {data.strugglingStudents?.length === 0 && <tr><td colSpan={5} className="py-4 text-text-muted text-sm">No struggling students.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Recent Sentiment Feed */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Recent Sentiment Flags</h2>
        <div className="space-y-2">
          {(data.recentSentiment || []).map((r: any, i: number) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <span className="text-sm text-text-primary">{r.studentName}</span>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-sm text-text-secondary">{r.subject}</span>
              <span className="text-xs text-text-muted">·</span>
              <SentimentBadge label={r.label} />
              <span className="text-xs text-text-muted ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
          {data.recentSentiment?.length === 0 && <div className="text-text-muted text-sm">No recent flags.</div>}
        </div>
      </div>
    </div>
  );
}
