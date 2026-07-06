"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { Mascot } from "@/components/mascot/Mascot";

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { lang } = useLang();

  const subjects = [
    {subj:"MATHEMATICS",label:t(lang,"mathematics")||"Mathematics",icon:"∑",color:"#121bde",mastery:72},
    {subj:"PHYSICS",label:t(lang,"physics")||"Physical Sciences",icon:"⚡",color:"#1cdb19",mastery:45},
    {subj:"ENGLISH",label:t(lang,"englishLabel")||"English HL",icon:"📖",color:"#d72d02",mastery:81},
  ];

  const sessions = [
    ["Trigonometry","MATHEMATICS","Jun 23",75],["Energy","PHYSICS","Jun 22",60],
    ["Essay Writing","ENGLISH","Jun 20",80],["Algebra","MATHEMATICS","Jun 18",68],
    ["Functions","MATHEMATICS","Jun 15",72],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Mascot state="happy" message={`${t(lang,"welcome")}, ${(user?.name || "").split(" ")[0]}!`} size={80} />
        <div>
          <h1 className="text-2xl font-semibold">{t(lang,"welcome")}, {user?.name || t(lang,"student")}</h1>
          <p className="text-text-muted text-sm mt-1">{t(lang,"grade")} {user?.grade?.replace("G","") || "10"}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {subjects.map((s) => (
          <Card key={s.subj} className="text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-sm font-medium text-text-primary">{s.label}</div>
            <div className="text-3xl font-semibold mt-2" style={{color:s.color}}>{s.mastery}%</div>
            <div className="text-text-muted text-xs mt-1">{t(lang,"mastery").toLowerCase()}</div>
            <a href="/student/tutor" className="btn-primary inline-block mt-3 text-xs w-full">{t(lang,"startSession")}</a>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"recentSessions")}</h2>
          {sessions.map((s,i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div><div className="text-sm text-text-primary">{s[0]}</div><div className="text-xs text-text-muted">{s[1]} · {s[2]}</div></div>
              <div className="text-right"><span className="text-sm font-semibold text-accent-green">+{s[3]}</span></div>
            </div>
          ))}
        </div>
        <Card><div className="text-center"><div className="text-xs text-text-muted uppercase tracking-wider mb-2">{t(lang,"studyStreak")}</div><div className="text-4xl font-bold text-accent-green">5</div><div className="text-sm text-text-secondary mt-1">{t(lang,"days")}</div></div></Card>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"subjectProgress")}</h2>
        <div className="space-y-4">
          <ProgressBar value={72} color="#121bde" label="Maths" />
          <ProgressBar value={45} color="#1cdb19" label="Physics" />
          <ProgressBar value={81} color="#d72d02" label="English" />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"forYou")}</h2>
        <div className="grid grid-cols-3 gap-4">
          {[{label:"Maths",url:"https://youtube.com/embed/3iMD6AoUI4k"},{label:"Physics",url:"https://youtube.com/embed/ZM8ECpBuQYE"},{label:"English",url:"https://youtube.com/embed/NVGuFDQLvMs"}].map((v) => (
            <Card key={v.label} className="p-0 overflow-hidden">
              <div className="aspect-video"><iframe src={v.url} className="w-full h-full" allowFullScreen title={v.label}/></div>
              <div className="p-3"><div className="text-xs font-medium text-text-primary">{v.label} — {t(lang,"recommended")}</div></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
