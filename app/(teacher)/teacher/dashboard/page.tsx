"use client";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import SentimentBadge from "@/components/ui/SentimentBadge";
import MasteryPill from "@/components/ui/MasteryPill";

const CLASS_DATA = [
  { classId: "c1", grade: "10", name: "10A", subject: "MATHEMATICS", students: 15, mastery: 52 },
  { classId: "c2", grade: "10", name: "10A", subject: "PHYSICS", students: 15, mastery: 38 },
  { classId: "c3", grade: "11", name: "11A", subject: "MATHEMATICS", students: 12, mastery: 47 },
  { classId: "c4", grade: "11", name: "11A", subject: "PHYSICS", students: 12, mastery: 53 },
];

export default function TeacherDashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Students" value={27} />
        <StatCard label="Avg Mastery" value="48%" />
        <StatCard label="Struggling" value={7} />
        <StatCard label="Sessions This Week" value={12} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">My Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CLASS_DATA.map((c) => (
            <Card key={c.classId + c.subject} onClick={() => router.push(`/teacher/class/${c.classId}`)}>
              <div className="text-sm font-semibold text-text-primary">Grade {c.grade} {c.name} — {c.subject === "MATHEMATICS" ? "Maths" : c.subject === "PHYSICS" ? "Physics" : "English"}</div>
              <div className="text-2xl font-semibold mt-2 text-accent-green">{c.mastery}%</div>
              <div className="text-xs text-text-muted mt-1">{c.students} students</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Struggling Students</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 font-medium">Student</th><th className="pb-2 font-medium">Subject</th><th className="pb-2 font-medium">Mastery</th><th className="pb-2 font-medium">Last Active</th><th className="pb-2 font-medium">Pain Point</th>
            </tr>
          </thead>
          <tbody>
            {[["Aisha Patel", "Maths", 31, "Jun 22", "Factorisation"], ["Thabo Nkosi", "Physics", 38, "Jun 23", "Energy"], ["Zara Williams", "Maths", 37, "Jun 21", "Trigonometry"]].map((r, i) => (
              <tr key={i} className="border-b border-border hover:bg-bg-secondary/50">
                <td className="py-2 text-text-primary">{r[0]}</td><td className="py-2 text-text-secondary">{r[1]}</td><td className="py-2"><MasteryPill score={r[2] as number} /></td><td className="py-2 text-text-muted text-xs">{r[3]}</td><td className="py-2 text-text-secondary">{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Recent Sentiment</h2>
        <div className="space-y-2">
          {[["Aisha Patel", "Maths", "STRUGGLING", "2 days ago"], ["Thabo Nkosi", "Maths", "POSITIVE", "3 days ago"], ["Sipho Mokoena", "Physics", "POSITIVE", "4 days ago"]].map((r, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <span className="text-sm text-text-primary">{r[0]}</span><span className="text-xs text-text-muted">·</span><span className="text-sm text-text-secondary">{r[1]}</span><span className="text-xs text-text-muted">·</span><SentimentBadge label={r[2] as string} /><span className="text-xs text-text-muted ml-auto">{r[3]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
