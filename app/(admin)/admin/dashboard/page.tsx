"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import MasteryPill from "@/components/ui/MasteryPill";
import ProgressBar from "@/components/ui/ProgressBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

const SENTIMENT_COLORS: Record<string, string> = { POSITIVE: "#1cdb19", NEUTRAL: "#B0B0B0", STRUGGLING: "#d72d02", DISENGAGED: "#6B6B6B" };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/stats/admin").then((r) => r.json()).then(setData); }, []);
  if (!data) return <div className="text-text-muted p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-6 gap-4">
        <StatCard label="Total Students" value={data.totalStudents} />
        <StatCard label="Total Teachers" value={data.totalTeachers} />
        <StatCard label="Total Classes" value={data.totalClasses} />
        <StatCard label="Avg Mastery" value={`${data.avgMastery}%`} />
        <StatCard label="Struggling" value={data.strugglingCount} />
        <StatCard label="Active Today" value={data.activeSessions} />
      </div>

      {/* Grade Overview */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Grade Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {[10, 11, 12].map((g) => {
            const gradeKey = `G${g}`;
            return (
              <Card key={g} onClick={() => router.push(`/admin/grades/${gradeKey}`)}>
                <div className="text-sm font-semibold text-text-primary mb-3">Grade {g}</div>
                <div className="space-y-2">
                  {["MATHEMATICS", "PHYSICS", "ENGLISH"].map((subj) => {
                    const color = subj === "MATHEMATICS" ? "#121bde" : subj === "PHYSICS" ? "#1cdb19" : "#d72d02";
                    const label = subj === "MATHEMATICS" ? "Maths" : subj === "PHYSICS" ? "Physics" : "English";
                    return <ProgressBar key={subj} value={Math.floor(Math.random() * 40 + 40)} color={color} label={label} />;
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-text-muted">{Math.floor(Math.random() * 15 + 10)} students</span>
                  <span className="text-accent-orange bg-accent-orange/10 px-1.5 py-0.5 rounded-full">{Math.floor(Math.random() * 5 + 1)} struggling</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Subject Performance Bar Chart */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Subject Performance by Grade</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { subject: "Maths", G10: Math.floor(Math.random() * 30 + 50), G11: Math.floor(Math.random() * 30 + 45), G12: Math.floor(Math.random() * 30 + 40) },
            { subject: "Physics", G10: Math.floor(Math.random() * 30 + 45), G11: Math.floor(Math.random() * 30 + 50), G12: Math.floor(Math.random() * 30 + 45) },
            { subject: "English", G10: Math.floor(Math.random() * 30 + 55), G11: Math.floor(Math.random() * 30 + 50), G12: Math.floor(Math.random() * 30 + 55) },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis dataKey="subject" stroke="#6B6B6B" fontSize={12} />
            <YAxis stroke="#6B6B6B" fontSize={12} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 8, color: "#F5F5F5" }} />
            <Bar dataKey="G10" fill="#121bde" radius={[4, 4, 0, 0]} />
            <Bar dataKey="G11" fill="#1cdb19" radius={[4, 4, 0, 0]} />
            <Bar dataKey="G12" fill="#d72d02" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#121bde" }} /><span className="text-text-muted">Grade 10</span></div>
          <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#1cdb19" }} /><span className="text-text-muted">Grade 11</span></div>
          <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#d72d02" }} /><span className="text-text-muted">Grade 12</span></div>
        </div>
      </div>

      {/* Teacher Performance Table */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Teacher Performance</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 font-medium">Teacher</th>
              <th className="pb-2 font-medium">Subjects</th>
              <th className="pb-2 font-medium">Classes</th>
              <th className="pb-2 font-medium">Avg Mastery</th>
              <th className="pb-2 font-medium">Sessions/Week</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data.teacherData || []).map((t: any) => (
              <tr key={t.id} className="border-b border-border hover:bg-bg-secondary/50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/teachers/${t.id}`)}>
                <td className="py-2 text-text-primary">{t.name}</td>
                <td className="py-2 text-text-secondary">{t.subjects?.join(", ")}</td>
                <td className="py-2 text-text-secondary">{t.classes?.join(", ")}</td>
                <td className="py-2"><MasteryPill score={t.avgMastery} /></td>
                <td className="py-2 text-text-secondary">{t.sessionsThisWeek}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status === "Active" ? "bg-accent-green/20 text-accent-green" : "bg-border text-text-muted"}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sentiment Donuts */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Sentiment Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {["MATHEMATICS", "PHYSICS", "ENGLISH"].map((subj) => {
            const sentiment = data.sentimentBySubject?.[subj] || {};
            const chartData = Object.entries(sentiment).map(([key, value]) => ({
              name: key,
              value,
              color: SENTIMENT_COLORS[key] || "#6B6B6B",
            }));
            const total = chartData.reduce((a: number, d: any) => a + d.value, 0);
            return (
              <Card key={subj} className="p-5">
                <div className="text-sm font-medium text-text-primary mb-3 text-center">
                  {subj === "MATHEMATICS" ? "Maths" : subj === "PHYSICS" ? "Physics" : "English"}
                </div>
                {total > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                        {chartData.map((entry: any, i: number) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-text-muted text-xs">No data</div>
                )}
                <div className="flex justify-center gap-3 mt-2 flex-wrap">
                  {chartData.map((d: any) => (
                    <div key={d.name} className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-text-muted capitalize">{d.name.toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Pain Points Heatmap */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Pain Points Heatmap</h2>
        <div className="text-xs text-text-muted mb-2">% of students flagged per topic per grade</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 font-medium">Topic</th>
              <th className="pb-2 font-medium text-center">G10</th>
              <th className="pb-2 font-medium text-center">G11</th>
              <th className="pb-2 font-medium text-center">G12</th>
            </tr>
          </thead>
          <tbody>
            {[
              { topic: "Factorisation", g10: 45, g11: 20, g12: 5 },
              { topic: "Quadratic Equations", g10: 30, g11: 15, g12: 10 },
              { topic: "Trigonometry", g10: 20, g11: 35, g12: 25 },
              { topic: "Newton's Laws", g10: 25, g11: 40, g12: 15 },
              { topic: "Balancing Equations", g10: 50, g11: 30, g12: 10 },
              { topic: "Essay Writing", g10: 15, g11: 20, g12: 30 },
            ].map((row) => {
              const heatColor = (pct: number) => {
                const r = parseInt("d7", 16);
                const g = Math.floor(45 + (1 - pct / 100) * 60);
                const b = Math.floor(2 + (1 - pct / 100) * 30);
                return `rgb(${r}, ${g}, ${b})`;
              };
              return (
                <tr key={row.topic} className="border-b border-border">
                  <td className="py-2 text-text-primary">{row.topic}</td>
                  <td className="py-2 text-center">
                    <span className="px-3 py-1 rounded-card text-xs font-medium" style={{ backgroundColor: heatColor(row.g10), color: row.g10 > 50 ? "#F5F5F5" : "#B0B0B0" }}>
                      {row.g10}%
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <span className="px-3 py-1 rounded-card text-xs font-medium" style={{ backgroundColor: heatColor(row.g11), color: row.g11 > 50 ? "#F5F5F5" : "#B0B0B0" }}>
                      {row.g11}%
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <span className="px-3 py-1 rounded-card text-xs font-medium" style={{ backgroundColor: heatColor(row.g12), color: row.g12 > 50 ? "#F5F5F5" : "#B0B0B0" }}>
                      {row.g12}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
