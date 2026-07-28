"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

// Demo data mapping for when DB is offline
const DEMO_KIDS: Record<string, any> = {
  "s1": { name: "Thabo Nkosi", grade: "G10", school: "Sandton Academy",
    subjects: { MATHEMATICS: 72, PHYSICS: 45, ENGLISH: 81 },
    sessions: [["Trigonometry","Maths","Jun 23"],["Energy","Physics","Jun 22"],["Essay Writing","English","Jun 20"],["Algebra","Maths","Jun 18"],["Functions","Maths","Jun 15"]],
    painPoints: ["Simultaneous equations","Laws of exponents"],
    breakthroughs: ["Trigonometric ratios","Linear functions"],
    sentiment: { positive: 4, neutral: 2, struggling: 1, disengaged: 1 },
    note: "Thabo is making steady progress. He's confident in Maths but needs to work on Physics problem-solving. Encourage him to do past papers."
  },
  "sc1": { name: "Maryke se dogter", grade: "G10", school: "Sandton Academy",
    subjects: { MATHEMATICS: 58, PHYSICS: 61, ENGLISH: 73, AFRIKAANS: 85 },
    sessions: [["Poetry Analysis","English","Jul 2"],["Quadratic Equations","Maths","Jul 1"],["Elektrisiteit","Physics","Jun 29"],["Letterkunde","Afrikaans","Jun 28"]],
    painPoints: ["Factorisation","Quadratic equations"],
    breakthroughs: ["Poetry analysis","Ohm's law"],
    sentiment: { positive: 3, neutral: 3, struggling: 2, disengaged: 0 },
    note: "Your child is doing well in languages and improving in Maths. Extra focus on algebraic manipulation at home will help a lot. She's engaged and asks good questions during sessions."
  },
  "ns1": { name: "Klara", grade: "G10", school: "Sandton Academy",
    subjects: { MATHEMATICS: 65, PHYSICS: 52, ENGLISH: 78, BIOLOGY: 70 },
    sessions: [["Cell Biology","Biology","Jul 3"],["Graphs","Maths","Jul 1"],["Forces","Physics","Jun 28"],["Comprehension","English","Jun 26"]],
    painPoints: ["Newton's laws","Graphing functions"],
    breakthroughs: ["Cell structure","Essay structure"],
    sentiment: { positive: 3, neutral: 2, struggling: 3, disengaged: 0 },
    note: "Klara is progressing well across all subjects. Physics concepts need reinforcement — try using real-world examples at home. She's doing excellent work in English and Biology."
  },
};

export default function ParentDashboardPage() {
  const { data: session, status } = useSession();
  const { lang } = useLang();
  const [childData, setChildData] = useState<any>(null);

  const linkedId = (session?.user as any)?.linkedStudentId;

  // Redirect if not linked
  useEffect(() => {
    if (status === "authenticated" && !linkedId) {
      redirect("/parent/link");
    }
  }, [status, linkedId]);

  // Load child data
  useEffect(() => {
    if (!linkedId) return;
    // Try API first, fall back to demo data
    fetch("/api/stats/parent")
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setChildData({
            name: data.childName,
            grade: data.childGrade,
            school: data.schoolName || "Sandton Academy",
            subjects: (data.stats || []).reduce((acc: any, s: any) => {
              acc[s.subject] = s.masteryScore;
              return acc;
            }, {}),
            sessions: (data.recentSessions || []).slice(0, 5).map((s: any) => [s.topic, s.subject, s.startedAt?.slice(0,10) || ""]),
            painPoints: [],
            breakthroughs: [],
            sentiment: { positive: 2, neutral: 2, struggling: 1, disengaged: 0 },
            note: data.parentNote || "",
          });
        } else {
          setChildData(DEMO_KIDS[linkedId] || null);
        }
      })
      .catch(() => {
        setChildData(DEMO_KIDS[linkedId] || null);
      });
  }, [linkedId]);

  if (status === "loading" || !childData) {
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><div className="text-text-muted">Loading...</div></div>;
  }

  const child = childData;
  const subjKeys = Object.keys(child.subjects || { MATHEMATICS: 0, PHYSICS: 0, ENGLISH: 0 });
  const subjects = subjKeys.map((k: string) => ({
    subj: k, val: child.subjects[k] || 0,
    color: k === "MATHEMATICS" ? "#121bde" : k === "PHYSICS" ? "#1cdb19" : k === "ENGLISH" ? "#d72d02" : k === "AFRIKAANS" ? "#9b59b6" : k === "BIOLOGY" ? "#e67e22" : "#121bde",
  }));

  const sentimentData = [
    { name: t(lang,"positive").toLowerCase(), value: child.sentiment?.positive || 2, color: "#1cdb19" },
    { name: t(lang,"neutral").toLowerCase(), value: child.sentiment?.neutral || 2, color: "#B0B0B0" },
    { name: t(lang,"struggling_sentiment").toLowerCase(), value: child.sentiment?.struggling || 1, color: "#d72d02" },
    { name: t(lang,"disengaged").toLowerCase(), value: child.sentiment?.disengaged || 0, color: "#6B6B6B" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{child.name}</h1>
        <p className="text-text-muted text-sm">{t(lang,"grade")} {child.grade?.replace("G","")} · {t(lang,"school")}: {child.school}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {subjects.map((s: any) => (
          <Card key={s.subj}>
            <div className="text-sm text-text-secondary mb-1">{s.subj}</div>
            <div className="text-2xl font-semibold" style={{ color: s.val >= 70 ? "#1cdb19" : s.val >= 40 ? "#d72d02" : "#6B6B6B" }}>{s.val}%</div>
            <ProgressBar value={s.val} color={s.color} className="mt-2" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"recentSessions")}</h2>
          {(child.sessions || []).map((s: any, i: number) => (
            <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
              <div><div className="text-sm text-text-primary">{s[0]}</div><div className="text-xs text-text-muted">{s[1]} · {s[2]}</div></div>
              <div className="text-sm text-accent-green">+{20 + i * 5}</div>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"sentiment")}</h2>
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>{sentimentData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">{sentimentData.map((d)=><div key={d.name} className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full" style={{backgroundColor:d.color}}/><span className="text-text-muted">{d.name}</span></div>)}</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"painPoints")}</h2>
          {(child.painPoints || []).length > 0
            ? child.painPoints.map((p: string, i: number) => <div key={i} className="text-sm text-accent-orange bg-accent-orange/10 px-3 py-1.5 rounded-card mb-1">{p}</div>)
            : <div className="text-sm text-text-muted">{lang === "af" ? "Geen pynpunte nie" : "No pain points"}</div>
          }
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"breakthroughs")}</h2>
          {(child.breakthroughs || []).length > 0
            ? child.breakthroughs.map((b: string, i: number) => <div key={i} className="text-sm text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-card mb-1">{b}</div>)
            : <div className="text-sm text-text-muted">{lang === "af" ? "Nog geen deurbrake nie" : "No breakthroughs yet"}</div>
          }
        </Card>
      </div>

      {child.note && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">{t(lang,"aiSummary")||"AI Summary"}</h2>
          <p className="text-sm text-text-primary leading-relaxed">{child.note}</p>
        </Card>
      )}
    </div>
  );
}
