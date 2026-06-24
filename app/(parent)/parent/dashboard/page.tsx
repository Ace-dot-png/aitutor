"use client";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function ParentDashboardPage() {
  const sentimentData = [
    { name: "positive", value: 3, color: "#1cdb19" },
    { name: "neutral", value: 2, color: "#B0B0B0" },
    { name: "struggling", value: 4, color: "#d72d02" },
    { name: "disengaged", value: 1, color: "#6B6B6B" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Aisha Patel</h1>
        <p className="text-text-muted text-sm">Grade 10 · Sandton Academy</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{subj:"Maths",val:31,color:"#121bde"},{subj:"Physics",val:28,color:"#1cdb19"},{subj:"English",val:55,color:"#d72d02"}].map((s) => (
          <Card key={s.subj}>
            <div className="text-sm text-text-secondary mb-1">{s.subj}</div>
            <div className="text-2xl font-semibold text-accent-green">{s.val}%</div>
            <ProgressBar value={s.val} color={s.color} className="mt-2" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Recent Sessions</h2>
          {[["Algebra","Maths","Jun 23"],[ "Exponents","Maths","Jun 21"],[ "Energy","Physics","Jun 19"],[ "Comprehension","English","Jun 18"]].map((s,i) => (
            <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
              <div><div className="text-sm text-text-primary">{s[0]}</div><div className="text-xs text-text-muted">{s[1]} · {s[2]}</div></div>
              <div className="text-sm text-accent-green">+{20+i*5}</div>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Sentiment</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>{sentimentData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">{sentimentData.map((d)=><div key={d.name} className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full" style={{backgroundColor:d.color}}/><span className="text-text-muted">{d.name}</span></div>)}</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5"><h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Pain Points</h2>
          {["Factorisation","Laws of exponents","Balancing equations"].map((p,i)=><div key={i} className="text-sm text-accent-orange bg-accent-orange/10 px-3 py-1.5 rounded-card mb-1">{p}</div>)}
        </Card>
        <Card className="p-5"><h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Breakthroughs</h2>
          <div className="text-sm text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-card mb-1">Reading comprehension</div>
        </Card>
      </div>

      <Card className="p-5"><h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">AI Summary</h2><p className="text-sm text-text-primary leading-relaxed">Aisha found factorisation tricky today but showed improvement in reading comprehension. Extra practice with algebraic expressions at home would help build confidence. She's engaged but needs more support in Maths and Physics.</p></Card>
    </div>
  );
}
