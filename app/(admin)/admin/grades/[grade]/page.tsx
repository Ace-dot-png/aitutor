"use client"
export const dynamic = 'force-dynamic'
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import MasteryPill from "@/components/ui/MasteryPill";
import ProgressBar from "@/components/ui/ProgressBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

export default function AdminGradePage() {
  const { grade } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/grade/${grade}`).then((r) => r.json()).then(setData);
  }, [grade]);

  if (!data) return <div className="text-text-muted p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary text-sm">← Dashboard</button>
        <h1 className="text-2xl font-semibold">Grade {grade?.toString().replace("G", "")}</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4"><div className="text-text-muted text-xs uppercase mb-1">Students</div><div className="text-2xl font-semibold">{data.studentCount}</div></div>
        <div className="card p-4"><div className="text-text-muted text-xs uppercase mb-1">Avg Mastery</div><div className="text-2xl font-semibold text-accent-green">{data.avgMastery}%</div></div>
        <div className="card p-4"><div className="text-text-muted text-xs uppercase mb-1">Struggling</div><div className="text-2xl font-semibold text-accent-orange">{data.strugglingCount}</div></div>
        <div className="card p-4"><div className="text-text-muted text-xs uppercase mb-1">Classes</div><div className="text-2xl font-semibold">{data.classCount}</div></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {["MATHEMATICS", "PHYSICS", "ENGLISH"].map((subj) => {
          const avg = data.subjectAverages?.[subj] || 0;
          const color = subj === "MATHEMATICS" ? "#121bde" : subj === "PHYSICS" ? "#1cdb19" : "#d72d02";
          return (
            <Card key={subj}>
              <div className="text-sm text-text-secondary mb-2">{subj === "MATHEMATICS" ? "Maths" : subj === "PHYSICS" ? "Physics" : "English"}</div>
              <div className="text-2xl font-semibold text-accent-green">{avg}%</div>
              <ProgressBar value={avg} color={color} className="mt-2" />
            </Card>
          );
        })}
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Class Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 font-medium">Class</th>
              <th className="pb-2 font-medium">Students</th>
              <th className="pb-2 font-medium">Maths</th>
              <th className="pb-2 font-medium">Physics</th>
              <th className="pb-2 font-medium">English</th>
              <th className="pb-2 font-medium">Struggling</th>
            </tr>
          </thead>
          <tbody>
            {(data.classes || []).map((c: any) => (
              <tr key={c.id} className="border-b border-border hover:bg-bg-secondary/50 transition-colors cursor-pointer" onClick={() => router.push(`/teacher/class/${c.id}`)}>
                <td className="py-2 text-text-primary">{c.name}</td>
                <td className="py-2 text-text-secondary">{c.studentCount}</td>
                <td className="py-2"><MasteryPill score={c.mathsAvg || 0} /></td>
                <td className="py-2"><MasteryPill score={c.physicsAvg || 0} /></td>
                <td className="py-2"><MasteryPill score={c.englishAvg || 0} /></td>
                <td className="py-2 text-accent-orange text-xs">{c.strugglingCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
