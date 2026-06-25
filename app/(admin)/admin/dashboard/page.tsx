"use client";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import MasteryPill from "@/components/ui/MasteryPill";
import ProgressBar from "@/components/ui/ProgressBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

const SENTIMENT_COLORS: Record<string,string> = { POSITIVE:"#1cdb19", NEUTRAL:"#B0B0B0", STRUGGLING:"#d72d02", DISENGAGED:"#6B6B6B" };

const GRADE_DATA: Record<string,{maths:number,physics:number,english:number,students:number,struggling:number}> = {
  G10:{maths:52,physics:38,english:67,students:15,struggling:4},
  G11:{maths:47,physics:53,english:74,students:12,struggling:3},
  G12:{maths:41,physics:45,english:71,students:8,struggling:4},
};

const SUBJECT_BAR = [{subject:"Maths",G10:52,G11:47,G12:41},{subject:"Physics",G10:38,G11:53,G12:45},{subject:"English",G10:67,G11:74,G12:71}];
const TEACHERS = [{name:"Ms. Nomsa Dlamini",subjects:"Maths, Physics",classes:"10A, 11A",mastery:48,sessions:12,status:"Active"},{name:"Mr. James Mokoena",subjects:"English",classes:"10A, 11A, 12A",mastery:71,sessions:8,status:"Active"}];
const SENTIMENT_DATA: Record<string,any> = { MATHEMATICS:{POSITIVE:12,NEUTRAL:8,STRUGGLING:15,DISENGAGED:5}, PHYSICS:{POSITIVE:10,NEUTRAL:10,STRUGGLING:12,DISENGAGED:8}, ENGLISH:{POSITIVE:20,NEUTRAL:12,STRUGGLING:5,DISENGAGED:3} };
const HEATMAP = [{topic:"Factorisation",G10:45,G11:20,G12:5},{topic:"Quadratic Equations",G10:30,G11:15,G12:10},{topic:"Trigonometry",G10:20,G11:35,G12:25},{topic:"Newton's Laws",G10:25,G11:40,G12:15},{topic:"Balancing Equations",G10:50,G11:30,G12:10},{topic:"Essay Writing",G10:15,G11:20,G12:30}];

const hc = (p:number) => {const r=215;const g=Math.floor(45+(1-p/100)*100);const b=Math.floor(2+(1-p/100)*60);return `rgb(${r},${g},${b})`};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { lang } = useLang();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t(lang,"dashboard")}</h1>

      <div className="grid grid-cols-6 gap-4">
        <StatCard label={t(lang,"totalStudents")} value={35} />
        <StatCard label={t(lang,"totalTeachers")} value={2} />
        <StatCard label={t(lang,"totalClasses")} value={3} />
        <StatCard label={t(lang,"avgMastery")} value="54%" />
        <StatCard label={t(lang,"struggling")} value={11} />
        <StatCard label={t(lang,"activeToday")} value={8} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">{t(lang,"gradeOverview")}</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(GRADE_DATA).map(([grade,data]) => (
            <Card key={grade} onClick={()=>router.push(`/admin/grades/${grade}`)}>
              <div className="text-sm font-semibold text-text-primary mb-3">{t(lang,"grade")} {grade.replace("G","")}</div>
              <div className="space-y-2">
                <ProgressBar value={data.maths} color="#121bde" label="Maths"/>
                <ProgressBar value={data.physics} color="#1cdb19" label="Physics"/>
                <ProgressBar value={data.english} color="#d72d02" label="English"/>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-text-muted">{data.students} {t(lang,"students").toLowerCase()}</span>
                <span className="text-accent-orange bg-accent-orange/10 px-1.5 py-0.5 rounded-full">{data.struggling} {t(lang,"struggling").toLowerCase()}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"subjectPerformance")}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={SUBJECT_BAR}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A"/><XAxis dataKey="subject" stroke="#6B6B6B" fontSize={12}/><YAxis stroke="#6B6B6B" fontSize={12} domain={[0,100]}/>
            <Tooltip contentStyle={{backgroundColor:"#1A1A1A",border:"1px solid #2A2A2A",borderRadius:8,color:"#F5F5F5"}}/>
            <Bar dataKey="G10" fill="#121bde" radius={[4,4,0,0]}/><Bar dataKey="G11" fill="#1cdb19" radius={[4,4,0,0]}/><Bar dataKey="G12" fill="#d72d02" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-2">
          {[{l:t(lang,"grade")+" 10",c:"#121bde"},{l:t(lang,"grade")+" 11",c:"#1cdb19"},{l:t(lang,"grade")+" 12",c:"#d72d02"}].map(g=><div key={g.l} className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded" style={{backgroundColor:g.c}}/><span className="text-text-muted">{g.l}</span></div>)}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"teacherPerformance")}</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-text-muted text-left border-b border-border">
            <th className="pb-2 font-medium">{t(lang,"teacher")}</th><th className="pb-2 font-medium">{t(lang,"subject")}</th><th className="pb-2 font-medium">{t(lang,"myClasses")}</th><th className="pb-2 font-medium">{t(lang,"mastery")}</th><th className="pb-2 font-medium">{t(lang,"sessions")}</th><th className="pb-2 font-medium">Status</th>
          </tr></thead>
          <tbody>{TEACHERS.map((t,i)=><tr key={i} className="border-b border-border hover:bg-bg-secondary/50">
            <td className="py-2 text-text-primary">{t.name}</td><td className="py-2 text-text-secondary">{t.subjects}</td><td className="py-2 text-text-secondary">{t.classes}</td>
            <td className="py-2"><MasteryPill score={t.mastery}/></td><td className="py-2 text-text-secondary">{t.sessions}</td>
            <td className="py-2"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent-green/20 text-accent-green">{t.status}</span></td>
          </tr>)}</tbody>
        </table>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"sentimentOverview")}</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(SENTIMENT_DATA).map(([subj,counts]) => {
            const cd = Object.entries(counts).map(([k,v])=>({name:k,value:v as number,color:SENTIMENT_COLORS[k]}));
            const label = subj==="MATHEMATICS"?"Maths":subj==="PHYSICS"?"Physics":"English";
            return (<Card key={subj} className="p-5">
              <div className="text-sm font-medium text-text-primary mb-3 text-center">{label}</div>
              <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={cd} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>{cd.map((e:any,i:number)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
              <div className="flex justify-center gap-3 mt-2 flex-wrap">{cd.map((d:any)=><div key={d.name} className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full" style={{backgroundColor:d.color}}/><span className="text-text-muted">{t(lang,d.name.toLowerCase() as any)}</span></div>)}</div>
            </Card>);
          })}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{t(lang,"painPointHeatmap")}</h2>
        <div className="text-xs text-text-muted mb-2">% {t(lang,"students").toLowerCase()} flagged per topic per {t(lang,"grade").toLowerCase()}</div>
        <table className="w-full text-sm">
          <thead><tr className="text-text-muted text-left border-b border-border">
            <th className="pb-2 font-medium">Topic</th><th className="pb-2 font-medium text-center">G10</th><th className="pb-2 font-medium text-center">G11</th><th className="pb-2 font-medium text-center">G12</th>
          </tr></thead>
          <tbody>{HEATMAP.map(row=><tr key={row.topic} className="border-b border-border">
            <td className="py-2 text-text-primary">{row.topic}</td>
            <td className="py-2 text-center"><span className="px-3 py-1 rounded-card text-xs font-medium" style={{backgroundColor:hc(row.G10),color:row.G10>50?"#F5F5F5":"#B0B0B0"}}>{row.G10}%</span></td>
            <td className="py-2 text-center"><span className="px-3 py-1 rounded-card text-xs font-medium" style={{backgroundColor:hc(row.G11),color:row.G11>50?"#F5F5F5":"#B0B0B0"}}>{row.G11}%</span></td>
            <td className="py-2 text-center"><span className="px-3 py-1 rounded-card text-xs font-medium" style={{backgroundColor:hc(row.G12),color:row.G12>50?"#F5F5F5":"#B0B0B0"}}>{row.G12}%</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
