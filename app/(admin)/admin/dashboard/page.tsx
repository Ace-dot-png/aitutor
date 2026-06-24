"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import MasteryPill from "@/components/ui/MasteryPill";
import ProgressBar from "@/components/ui/ProgressBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

const SENTIMENT_COLORS: Record<string, string> = { POSITIVE: "#1cdb19", NEUTRAL: "#B0B0B0", STRUGGLING: "#d72d02", DISENGAGED: "#6B6B6B" };

const GRADE_DATA = {
  G10: { maths: 52, physics: 38, english: 67, students: 15, struggling: 4 },
  G11: { maths: 47, physics: 53, english: 74, students: 12, struggling: 3 },
  G12: { maths: 41, physics: 45, english: 71, students: 8, struggling: 4 },
};

const SUBJECT_BAR_DATA = [
  { subject: "Maths", G10: 52, G11: 47, G12: 41 },
  { subject: "Physics", G10: 38, G11: 53, G12: 45 },
  { subject: "English", G10: 67, G11: 74, G12: 71 },
];

const TEACHERS = [
  { name: "Ms. Nomsa Dlamini", subjects: "Maths, Physics", classes: "10A, 11A", mastery: 48, sessions: 12, status: "Active" },
  { name: "Mr. James Mokoena", subjects: "English", classes: "10A, 11A, 12A", mastery: 71, sessions: 8, status: "Active" },
];

const SENTIMENT_DATA: Record<string, any> = {
  MATHEMATICS: { POSITIVE: 12, NEUTRAL: 8, STRUGGLING: 15, DISENGAGED: 5 },
  PHYSICS: { POSITIVE: 10, NEUTRAL: 10, STRUGGLING: 12, DISENGAGED: 8 },
  ENGLISH: { POSITIVE: 20, NEUTRAL: 12, STRUGGLING: 5, DISENGAGED: 3 },
};

const HEATMAP_DATA = [
  { topic: "Factorisation", G10: 45, G11: 20, G12: 5 },
  { topic: "Quadratic Equations", G10: 30, G11: 15, G12: 10 },
  { topic: "Trigonometry", G10: 20, G11: 35, G12: 25 },
  { topic: "Newton's Laws", G10: 25, G11: 40, G12: 15 },
  { topic: "Balancing Equations", G10: 50, G11: 30, G12: 10 },
  { topic: "Essay Writing", G10: 15, G11: 20, G12: 30 },
];

const heatColor = (pct: number) => {
  const r = 215; const g = Math.floor(45 + (1 - pct / 100) * 100); const b = Math.floor(2 + (1 - pct / 100) * 60);
  return `rgb(${r}, ${g}, ${b})`;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-6 gap-4">
        <StatCard label="Total Students" value={35} />
        <StatCard label="Total Teachers" value={2} />
        <StatCard label="Total Classes" value={3} />
        <StatCard label="Avg Mastery" value="54%" />
        <StatCard label="Struggling" value={11} />
        <StatCard label="Active Today" value={8} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Grade Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(GRADE_DATA).map(([grade, data]) => (
            <Card key={grade} onClick={() => router.push(`/admin/grades/${grade}`)}>
              <div className="text-sm font-semibold text-text-primary mb-3">Grade {grade.replace("G", "")}</div>
              <div className="space-y-2">
                <ProgressBar value={data.maths} color="#121bde" label="Maths" />
                <ProgressBar value={data.physics} color="#1cdb19" label="Physics" />
                <ProgressBar value={data.english} color="#d72d02" label="English" />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-text-muted">{data.students} students</span>
                <span className="text-accent-orange bg-accent-orange/10 px-1.5 py-0.5 rounded-full">{data.struggling} struggling</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Subject Performance by Grade</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={SUBJECT_BAR_DATA}>
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
            {TEACHERS.map((t, i) => (
              <tr key={i} className="border-b border-border hover:bg-bg-secondary/50 transition-colors">
                <td className="py-2 text-text-primary">{t.name}</td>
                <td className="py-2 text-text-secondary">{t.subjects}</td>
                <td className="py-2 text-text-secondary">{t.classes}</td>
                <td className="py-2"><MasteryPill score={t.mastery} /></td>
                <td className="py-2 text-text-secondary">{t.sessions}</td>
                <td className="py-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent-green/20 text-accent-green">{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Sentiment Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(SENTIMENT_DATA).map(([subj, counts]) => {
            const chartData = Object.entries(counts).map(([key, value]) => ({ name: key, value: value as number, color: SENTIMENT_COLORS[key] }));
            return (
              <Card key={subj} className="p-5">
                <div className="text-sm font-medium text-text-primary mb-3 text-center">
                  {subj === "MATHEMATICS" ? "Maths" : subj === "PHYSICS" ? "Physics" : "English"}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                      {chartData.map((entry: any, i: number) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
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
            {HEATMAP_DATA.map((row) => (
              <tr key={row.topic} className="border-b border-border">
                <td className="py-2 text-text-primary">{row.topic}</td>
                <td className="py-2 text-center">
                  <span className="px-3 py-1 rounded-card text-xs font-medium" style={{ backgroundColor: heatColor(row.G10), color: row.G10 > 50 ? "#F5F5F5" : "#B0B0B0" }}>{row.G10}%</span>
                </td>
                <td className="py-2 text-center">
                  <span className="px-3 py-1 rounded-card text-xs font-medium" style={{ backgroundColor: heatColor(row.G11), color: row.G11 > 50 ? "#F5F5F5" : "#B0B0B0" }}>{row.G11}%</span>
                </td>
                <td className="py-2 text-center">
                  <span className="px-3 py-1 rounded-card text-xs font-medium" style={{ backgroundColor: heatColor(row.G12), color: row.G12 > 50 ? "#F5F5F5" : "#B0B0B0" }}>{row.G12}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
