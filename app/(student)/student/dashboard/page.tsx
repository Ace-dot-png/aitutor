"use client";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name || "Learner"}</h1>
        <p className="text-text-muted text-sm mt-1">Grade {user?.grade?.replace("G", "") || "10"}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{subj:"MATHEMATICS",label:"Mathematics",icon:"∑",color:"#121bde",mastery:72},
          {subj:"PHYSICS",label:"Physical Sciences",icon:"⚡",color:"#1cdb19",mastery:45},
          {subj:"ENGLISH",label:"English HL",icon:"📖",color:"#d72d02",mastery:81}].map((s) => (
          <Card key={s.subj} className="text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-sm font-medium text-text-primary">{s.label}</div>
            <div className="text-3xl font-semibold mt-2" style={{color:s.color}}>{s.mastery}%</div>
            <div className="text-text-muted text-xs mt-1">mastery</div>
            <a href="/student/tutor" className="btn-primary inline-block mt-3 text-xs w-full">Start Session</a>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Recent Sessions</h2>
          {[["Trigonometry", "MATHEMATICS", "Jun 23", 75], ["Energy", "PHYSICS", "Jun 22", 60], ["Essay Writing", "ENGLISH", "Jun 20", 80], ["Algebra", "MATHEMATICS", "Jun 18", 68], ["Functions", "MATHEMATICS", "Jun 15", 72]].map((s,i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div><div className="text-sm text-text-primary">{s[0]}</div><div className="text-xs text-text-muted">{s[1]} · {s[2]}</div></div>
              <div className="text-right"><span className="text-sm font-semibold text-accent-green">+{s[3]}</span></div>
            </div>
          ))}
        </div>
        <Card><div className="text-center"><div className="text-xs text-text-muted uppercase tracking-wider mb-2">Study Streak</div><div className="text-4xl font-bold text-accent-green">5</div><div className="text-sm text-text-secondary mt-1">days</div></div></Card>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Subject Progress</h2>
        <div className="space-y-4">
          <ProgressBar value={72} color="#121bde" label="Maths" />
          <ProgressBar value={45} color="#1cdb19" label="Physics" />
          <ProgressBar value={81} color="#d72d02" label="English" />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">For You</h2>
        <div className="grid grid-cols-3 gap-4">
          {[{subj:"Maths",url:"https://youtube.com/embed/3iMD6AoUI4k"},{subj:"Physics",url:"https://youtube.com/embed/ZM8ECpBuQYE"},{subj:"English",url:"https://youtube.com/embed/NVGuFDQLvMs"}].map((v) => (
            <Card key={v.subj} className="p-0 overflow-hidden">
              <div className="aspect-video"><iframe src={v.url} className="w-full h-full" allowFullScreen title={v.subj}/></div>
              <div className="p-3"><div className="text-xs font-medium text-text-primary">{v.subj} — Recommended</div></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
