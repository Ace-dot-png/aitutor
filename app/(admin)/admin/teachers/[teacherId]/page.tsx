"use client"
export const dynamic = 'force-dynamic'
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import MasteryPill from "@/components/ui/MasteryPill";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

export default function AdminTeacherPage() {
  const { teacherId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/teacher/${teacherId}`).then((r) => r.json()).then(setData);
  }, [teacherId]);

  if (!data) return <div className="text-text-muted p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary text-sm">← Dashboard</button>
        <h1 className="text-2xl font-semibold">{data.name}</h1>
      </div>

      <div className="flex gap-3">
        {(data.subjects || []).map((s: string) => (
          <span key={s} className="px-2 py-1 rounded-card text-xs bg-border text-text-secondary">{s}</span>
        ))}
        {(data.classes || []).map((c: string) => (
          <span key={c} className="px-2 py-1 rounded-card text-xs bg-border text-text-secondary">{c}</span>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Students</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Subject</th>
              <th className="pb-2 font-medium">Mastery</th>
            </tr>
          </thead>
          <tbody>
            {(data.students || []).map((s: any) => (
              <tr key={s.id} className="border-b border-border hover:bg-bg-secondary/50 cursor-pointer" onClick={() => router.push(`/admin/students/${s.studentId}`)}>
                <td className="py-2 text-text-primary">{s.name}</td>
                <td className="py-2 text-text-secondary">{s.subject}</td>
                <td className="py-2"><MasteryPill score={s.mastery} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Sessions (30 days)</h2>
        {data.sessionTrend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.sessionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="date" stroke="#6B6B6B" fontSize={11} />
              <YAxis stroke="#6B6B6B" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 8, color: "#F5F5F5" }} />
              <Line type="monotone" dataKey="count" stroke="#121bde" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-text-muted text-sm">No session data yet.</div>
        )}
      </div>
    </div>
  );
}
