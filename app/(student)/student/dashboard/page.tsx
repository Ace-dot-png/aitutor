"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const YOUTUBE_EMBEDS = {
  MATHEMATICS: "https://youtube.com/embed/3iMD6AoUI4k",
  PHYSICS: "https://youtube.com/embed/ZM8ECpBuQYE",
  ENGLISH: "https://youtube.com/embed/NVGuFDQLvMs",
};

const SUBJECT_ICONS: Record<string, string> = { MATHEMATICS: "∑", PHYSICS: "⚡", ENGLISH: "📖" };

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/stats/student").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="text-text-muted p-8">Loading...</div>;

  const user = session?.user as any;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name}</h1>
        <p className="text-text-muted text-sm mt-1">Grade {user?.grade?.replace("G", "")}</p>
      </div>

      {/* Quick-start cards */}
      <div className="grid grid-cols-3 gap-4">
        {["MATHEMATICS", "PHYSICS", "ENGLISH"].map((subj) => {
          const stats = data.stats?.filter((s: any) => s.subject === subj);
          const avgMastery = stats?.length > 0 ? Math.round(stats.reduce((a: number, s: any) => a + s.masteryScore, 0) / stats.length) : 0;
          return (
            <Card key={subj} className="text-center">
              <div className="text-3xl mb-2">{SUBJECT_ICONS[subj]}</div>
              <div className="text-sm font-medium text-text-primary">{subj === "MATHEMATICS" ? "Mathematics" : subj === "PHYSICS" ? "Physical Sciences" : "English HL"}</div>
              <div className="text-2xl font-semibold mt-2 text-accent-green">{avgMastery}%</div>
              <div className="text-text-muted text-xs mt-1">mastery</div>
              <a href={`/student/tutor`} className="btn-primary inline-block mt-3 text-xs w-full">Start Session</a>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent sessions */}
        <div className="col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Recent Sessions</h2>
          <div className="space-y-2">
            {data.sessions?.slice(0, 5).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-sm text-text-primary">{s.topic}</div>
                  <div className="text-xs text-text-muted">{s.subject} · {new Date(s.startedAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  {s.knowledgeGainScore != null && (
                    <span className={`text-sm font-semibold ${s.knowledgeGainScore >= 60 ? "text-accent-green" : "text-accent-orange"}`}>
                      +{s.knowledgeGainScore}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {data.sessions?.length === 0 && <div className="text-text-muted text-sm">No sessions yet. Start your first tutor session!</div>}
          </div>
        </div>

        {/* Study streak */}
        <Card>
          <div className="text-center">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Study Streak</div>
            <div className="text-4xl font-bold text-accent-green">{data.streak}</div>
            <div className="text-sm text-text-secondary mt-1">day{data.streak !== 1 ? "s" : ""}</div>
          </div>
        </Card>
      </div>

      {/* Progress bars */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Subject Progress</h2>
        <div className="space-y-4">
          {["MATHEMATICS", "PHYSICS", "ENGLISH"].map((subj) => {
            const stats = data.stats?.filter((s: any) => s.subject === subj);
            const avgMastery = stats?.length > 0 ? Math.round(stats.reduce((a: number, s: any) => a + s.masteryScore, 0) / stats.length) : 0;
            return (
              <ProgressBar
                key={subj}
                value={avgMastery}
                color={subj === "MATHEMATICS" ? "#121bde" : subj === "PHYSICS" ? "#1cdb19" : "#d72d02"}
                label={subj === "MATHEMATICS" ? "Maths" : subj === "PHYSICS" ? "Physics" : "English"}
              />
            );
          })}
        </div>
      </div>

      {/* FYP YouTube embeds */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">For You</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(YOUTUBE_EMBEDS).map(([subject, url]) => (
            <Card key={subject} className="p-0 overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={url}
                  className="w-full h-full"
                  allowFullScreen
                  title={`${subject} video`}
                />
              </div>
              <div className="p-3">
                <div className="text-xs font-medium text-text-primary">
                  {subject === "MATHEMATICS" ? "Maths" : subject === "PHYSICS" ? "Physics" : "English"} — Recommended
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
