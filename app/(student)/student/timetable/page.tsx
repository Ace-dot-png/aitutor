"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

const DAYS = ["Mon","Tue","Wed","Thu","Fri"];
const DAYS_AF = ["Maan","Dins","Woen","Don","Vry"];
const HOURS = Array.from({length:17},(_,i)=>`${String(i+6).padStart(2,"0")}:00`);
const SUBJECT_COLORS: Record<string,string> = { MATHEMATICS:"#121bde", PHYSICS:"#1cdb19", ENGLISH:"#d72d02" };

export default function StudentTimetablePage() {
  const { lang } = useLang();
  const [entries, setEntries] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [day, setDay] = useState("Mon");
  const [startTime, setStartTime] = useState("14:00");
  const [subject, setSubject] = useState("MATHEMATICS");
  const [topic, setTopic] = useState("");

  useEffect(() => { fetch("/api/timetable").then((r)=>r.json()).then(setEntries); }, []);

  const addEntry = async () => {
    const res = await fetch("/api/timetable",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({day,startTime,subject,topic})});
    const entry = await res.json(); setEntries([...entries,entry]); setShowAdd(false); setTopic("");
  };

  const getEntryFor = (d:string,h:string) => entries.find((e)=>e.day===d&&e.startTime===h);

  const daysList = lang==="af"?DAYS_AF:DAYS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(lang,"timetable")}</h1>
        <button onClick={()=>setShowAdd(!showAdd)} className="btn-primary text-sm">{showAdd?(lang==="af"?"Kanselleer":"Cancel"):t(lang,"addBlock")}</button>
      </div>

      {showAdd && <div className="card p-4 grid grid-cols-4 gap-3">
        <div><label className="text-xs text-text-secondary block mb-1">{lang==="af"?"Dag":"Day"}</label>
          <select value={day} onChange={(e)=>setDay(e.target.value)} className="input-field w-full text-sm">{daysList.map((d,i)=><option key={d} value={DAYS[i]}>{d}</option>)}</select></div>
        <div><label className="text-xs text-text-secondary block mb-1">{lang==="af"?"Tyd":"Time"}</label>
          <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="input-field w-full text-sm"/></div>
        <div><label className="text-xs text-text-secondary block mb-1">{t(lang,"subject")}</label>
          <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="input-field w-full text-sm">
            <option value="MATHEMATICS">Maths</option><option value="PHYSICS">Physics</option><option value="ENGLISH">English</option></select></div>
        <div><label className="text-xs text-text-secondary block mb-1">Topic</label>
          <input value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="Topic" className="input-field w-full text-sm"/>
          <button onClick={addEntry} disabled={!topic} className="btn-primary text-xs mt-2 w-full">{lang==="af"?"Stoor":"Save"}</button></div>
      </div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr>
            <th className="p-2 border-b border-border text-left text-text-muted font-medium w-16">{lang==="af"?"Tyd":"Time"}</th>
            {daysList.map((d)=><th key={d} className="p-2 border-b border-border text-center text-text-muted font-medium">{d}</th>)}
          </tr></thead>
          <tbody>{HOURS.map((h)=><tr key={h} className="border-b border-border">
            <td className="p-2 text-text-muted text-xs">{h}</td>
            {DAYS.map((d)=>{const entry=getEntryFor(d,h);return <td key={d} className="p-1">{entry&&<div className="rounded-card px-2 py-1 text-xs text-text-primary" style={{backgroundColor:SUBJECT_COLORS[entry.subject]||"#2A2A2A"}}><div className="font-medium">{entry.subject==="MATHEMATICS"?"Maths":entry.subject==="PHYSICS"?"Physics":"English"}</div><div className="opacity-80">{entry.topic}</div></div>}</td>})}
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
