"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";

export default function TeacherLessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/lesson-plan/list").then((r) => r.json()).then(setLessons);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Lesson Plans</h1>
        <button onClick={() => router.push("/teacher/chat")} className="btn-primary text-sm">New Plan</button>
      </div>

      <div className="flex gap-3 mb-4">
        <select className="input-field text-sm">
          <option value="">All Grades</option>
          <option value="G10">Grade 10</option>
          <option value="G11">Grade 11</option>
          <option value="G12">Grade 12</option>
        </select>
        <select className="input-field text-sm">
          <option value="">All Subjects</option>
          <option value="MATHEMATICS">Mathematics</option>
          <option value="PHYSICS">Physical Sciences</option>
          <option value="ENGLISH">English HL</option>
        </select>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="flex items-center justify-between p-4 cursor-pointer hover:border-accent-blue">
            <div>
              <div className="text-sm font-medium text-text-primary">{lesson.title}</div>
              <div className="text-xs text-text-muted mt-1">
                Grade {lesson.grade?.replace("G", "")} · {lesson.subject} · {new Date(lesson.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); router.push("/teacher/chat"); }}
              className="btn-secondary text-xs"
            >
              View
            </button>
          </Card>
        ))}
        {lessons.length === 0 && (
          <div className="text-text-muted text-sm p-4">No lesson plans yet. Create one in the Lesson Planner.</div>
        )}
      </div>
    </div>
  );
}
