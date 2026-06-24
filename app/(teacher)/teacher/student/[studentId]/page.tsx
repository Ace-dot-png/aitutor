"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import MasteryPill from "@/components/ui/MasteryPill";
import SentimentBadge from "@/components/ui/SentimentBadge";

export default function TeacherStudentPage() {
  const { studentId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/teacher/student/${studentId}`).then((r) => r.json()).then(setData);
  }, [studentId]);

  if (!data) return <div className="text-text-muted p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary text-sm">← Back</button>
        <h1 className="text-2xl font-semibold">{data.name}</h1>
        <span className="text-text-muted text-sm">Grade {data.grade?.replace("G", "")}</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {["MATHEMATICS", "PHYSICS", "ENGLISH"].map((subj) => {
          const subjectStats = data.stats?.filter((s: any) => s.subject === subj);
          const avg = subjectStats?.length > 0 ? Math.round(subjectStats.reduce((a: number, s: any) => a + s.masteryScore, 0) / subjectStats.length) : 0;
          return (
            <Card key={subj}>
              <div className="text-sm text-text-secondary mb-2">{subj === "MATHEMATICS" ? "Maths" : subj === "PHYSICS" ? "Physics" : "English"}</div>
              <div className="text-2xl font-semibold text-accent-green">{avg}%</div>
              <ProgressBar value={avg} color={subj === "MATHEMATICS" ? "#121bde" : subj === "PHYSICS" ? "#1cdb19" : "#d72d02"} className="mt-2" />
            </Card>
          );
        })}
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Session History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Subject</th>
              <th className="pb-2 font-medium">Topic</th>
              <th className="pb-2 font-medium">Gain</th>
              <th className="pb-2 font-medium">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {(data.sessions || []).map((s: any) => (
              <tr key={s.id} className="border-b border-border">
                <td className="py-2 text-text-muted text-xs">{new Date(s.startedAt).toLocaleDateString()}</td>
                <td className="py-2 text-text-secondary">{s.subject}</td>
                <td className="py-2 text-text-primary">{s.topic}</td>
                <td className="py-2">{s.knowledgeGainScore != null ? <MasteryPill score={s.knowledgeGainScore} /> : "-"}</td>
                <td className="py-2">{s.sentimentLabel ? <SentimentBadge label={s.sentimentLabel} /> : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
