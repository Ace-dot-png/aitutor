"use client";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

export default function ParentDashboardPage() {
  const { lang } = useLang();

  const sentimentData = [
    {name:t(lang,"positive").toLowerCase(),value:3,color:"#1cdb19"},
    {name:t(lang,"neutral").toLowerCase(),value:2,color:"#B0B0B0"},
    {name:t(lang,"struggling_sentiment").toLowerCase(),value:4,color:"#d72d02"},
    {name:t(lang,"disengaged").toLowerCase(),value:1,color:"#6B6B6B"},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t(lang,"linkedChild")}: Aisha Patel</h1>
        <p className="text-text-muted text-sm">{t(lang,"grade")} 10 · {t(lang,"school")}: Sandton Academy</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{subj:"Maths",val:31,color:"#121bde"},{subj:"Physics",val:28,color:"#1cdb19"},{subj:"English",val:55,color:"#d72d02"}].map((s)=><Card key={s.subj}>
          <div className="text-sm text-text-secondary mb-1">{s.subj}</div>
          <div className="text-2xl font-semibold text-accent-green">{s.val}%</div>
          <ProgressBar value={s.val} color={s.color} className="mt-2"/>
        </Card>)}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"recentSessions")}</h2>
          {[["Algebra","Maths","Jun 23"],["Exponents","Maths","Jun 21"],["Energy","Physics","Jun 19"],["Comprehension","English","Jun 18"]].map((s,i)=><div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
            <div><div className="text-sm text-text-primary">{s[0]}</div><div className="text-xs text-text-muted">{s[1]} · {s[2]}</div></div>
            <div className="text-sm text-accent-green">+{20+i*5}</div>
          </div>)}
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"sentiment")}</h2>
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>{sentimentData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">{sentimentData.map((d)=><div key={d.name} className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full" style={{backgroundColor:d.color}}/><span className="text-text-muted">{d.name}</span></div>)}</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5"><h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"painPoints")}</h2>
          {["Factorisation","Laws of exponents","Balancing equations"].map((p,i)=><div key={i} className="text-sm text-accent-orange bg-accent-orange/10 px-3 py-1.5 rounded-card mb-1">{p}</div>)}
        </Card>
        <Card className="p-5"><h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"breakthroughs")}</h2>
          <div className="text-sm text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-card mb-1">Reading comprehension</div>
        </Card>
      </div>

      <Card className="p-5"><h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">{t(lang,"aiSummary")||"AI Summary"}</h2><p className="text-sm text-text-primary leading-relaxed">{lang==="af"?"Aisha het vandag faktorisering moeilik gevind maar verbetering in leesbegrip getoon. Ekstra oefening met algebraïese uitdrukkings by die huis sal help om selfvertroue te bou.":"Aisha found factorisation tricky today but showed improvement in reading comprehension. Extra practice with algebraic expressions at home would help build confidence. She's engaged but needs more support in Maths and Physics."}</p></Card>
    </div>
  );
}
