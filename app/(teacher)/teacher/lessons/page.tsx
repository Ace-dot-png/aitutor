"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

export default function TeacherLessonsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const [lessons, setLessons] = useState<any[]>([]);
  useEffect(() => { fetch("/api/lesson-plan/list").then((r)=>r.json()).then(setLessons); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(lang,"savedLessons")}</h1>
        <button onClick={()=>router.push("/teacher/chat")} className="btn-primary text-sm">{lang==="af"?"Nuwe Plan":"New Plan"}</button>
      </div>
      <div className="flex gap-3 mb-4">
        <select className="input-field text-sm"><option value="">{lang==="af"?"Alle Grade":"All Grades"}</option><option value="G10">{t(lang,"grade")} 10</option><option value="G11">{t(lang,"grade")} 11</option><option value="G12">{t(lang,"grade")} 12</option></select>
        <select className="input-field text-sm"><option value="">{lang==="af"?"Alle Vakke":"All Subjects"}</option><option value="MATHEMATICS">{t(lang,"mathematics")}</option><option value="PHYSICS">{t(lang,"physics")}</option><option value="ENGLISH">{t(lang,"englishLabel")}</option></select>
      </div>
      <div className="space-y-3">
        {lessons.map((lesson)=><Card key={lesson.id} className="flex items-center justify-between p-4 cursor-pointer hover:border-accent-blue">
          <div><div className="text-sm font-medium text-text-primary">{lesson.title}</div><div className="text-xs text-text-muted mt-1">{t(lang,"grade")} {lesson.grade?.replace("G","")} · {lesson.subject} · {new Date(lesson.createdAt).toLocaleDateString()}</div></div>
          <button onClick={(e)=>{e.stopPropagation();router.push("/teacher/chat");}} className="btn-secondary text-xs">{lang==="af"?"Bekyk":"View"}</button>
        </Card>)}
        {lessons.length===0&&<div className="text-text-muted text-sm p-4">{t(lang,"noData")}</div>}
      </div>
    </div>
  );
}
