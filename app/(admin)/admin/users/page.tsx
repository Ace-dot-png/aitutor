"use client"
export const dynamic = 'force-dynamic'
import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";

// Demo data — mirrors demo auth users
const DEMO_USERS = {
  students: [
    { id: "s1", name: "Thabo Nkosi", email: "thabo@student.co.za", grade: "G10", class: "10A", pin: "482910", curriculum: "CAPS" },
    { id: "s2", name: "Lerato Molefe", email: "lerato@student.co.za", grade: "G10", class: "10A", pin: "739215", curriculum: "CAPS" },
    { id: "s3", name: "Sipho Dlamini", email: "sipho@student.co.za", grade: "G11", class: "11A", pin: "105638", curriculum: "CAPS" },
    { id: "sc1", name: "Maryke se dogter", email: "maryke.daughter@aitutor.co.za", grade: "G10", class: "10A", pin: "629104", curriculum: "IEB" },
    { id: "ns1", name: "Klara", email: "klara@testing.com", grade: "G10", class: "10B", pin: "847362", curriculum: "CAMBRIDGE" },
  ],
  teachers: [
    { id: "t1", name: "Ms. Nomsa Dlamini", email: "n.dlamini@sandtonacademy.co.za", subjects: "Maths, Physics", classes: "10A, 11A" },
    { id: "t2", name: "Mr. James Mokoena", email: "j.mokoena@sandtonacademy.co.za", subjects: "English", classes: "10A, 11A, 12A" },
  ],
  parents: [
    { id: "p1", name: "Priya Patel", email: "priya@patel.co.za", child: { id: "s1", name: "Thabo Nkosi" } },
    { id: "p2", name: "Maryke Testing", email: "maryke@aitutor.co.za", child: { id: "sc1", name: "Maryke se dogter" } },
    { id: "p3", name: "Maryke Alt", email: "Maryke@testing.com", child: { id: "ns1", name: "Klara" } },
  ],
};

type Tab = "students" | "teachers" | "parents" | "classes";

export default function AdminUsersPage() {
  const { lang } = useLang();
  const [tab, setTab] = useState<Tab>("students");
  const [filterGrade, setFilterGrade] = useState("");

  const tabs: { key: Tab; label: string; labelAf: string }[] = [
    { key: "students", label: "Students", labelAf: "Leerders" },
    { key: "teachers", label: "Teachers", labelAf: "Onderwysers" },
    { key: "parents", label: "Parents", labelAf: "Ouers" },
    { key: "classes", label: "Classes", labelAf: "Klasse" },
  ];

  const grades = ["G10", "G11", "G12"];
  const classes = ["10A", "10B", "11A", "11B", "12A", "12B"];

  const filteredStudents = filterGrade
    ? DEMO_USERS.students.filter(s => s.grade === filterGrade)
    : DEMO_USERS.students;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <h1 className="text-2xl font-semibold">{lang === "af" ? "Gebruiker Bestuur" : "User Management"}</h1>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-card text-sm ${tab === t.key ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"}`}
          >
            {lang === "af" ? t.labelAf : t.label}
          </button>
        ))}
      </div>

      {/* Students tab */}
      {tab === "students" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setFilterGrade("")} className={`px-3 py-1 rounded-card text-xs ${!filterGrade ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"}`}>
              {lang === "af" ? "Alle" : "All"}
            </button>
            {grades.map(g => (
              <button key={g} onClick={() => setFilterGrade(g)} className={`px-3 py-1 rounded-card text-xs ${filterGrade === g ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"}`}>
                {t(lang, "grade")} {g.replace("G", "")}
              </button>
            ))}
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-left border-b border-border bg-bg-secondary/50">
                  <th className="p-3 font-medium">{lang === "af" ? "Naam" : "Name"}</th>
                  <th className="p-3 font-medium">{lang === "af" ? "E-pos" : "Email"}</th>
                  <th className="p-3 font-medium">{t(lang, "grade")}</th>
                  <th className="p-3 font-medium">{lang === "af" ? "Klas" : "Class"}</th>
                  <th className="p-3 font-medium">{lang === "af" ? "Kurrikulum" : "Curriculum"}</th>
                  <th className="p-3 font-medium">PIN</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id} className="border-b border-border hover:bg-bg-secondary/30">
                    <td className="p-3 text-text-primary font-medium">{s.name}</td>
                    <td className="p-3 text-text-secondary">{s.email}</td>
                    <td className="p-3 text-text-secondary">{t(lang, "grade")} {s.grade.replace("G", "")}</td>
                    <td className="p-3 text-text-secondary">{s.class}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-accent-green/20 text-accent-green">{s.curriculum}</span></td>
                    <td className="p-3 text-text-secondary font-mono">{s.pin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Teachers tab */}
      {tab === "teachers" && (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-left border-b border-border bg-bg-secondary/50">
                <th className="p-3 font-medium">{lang === "af" ? "Naam" : "Name"}</th>
                <th className="p-3 font-medium">{lang === "af" ? "E-pos" : "Email"}</th>
                <th className="p-3 font-medium">{t(lang, "subject")}</th>
                <th className="p-3 font-medium">{t(lang, "myClasses")}</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_USERS.teachers.map(t => (
                <tr key={t.id} className="border-b border-border hover:bg-bg-secondary/30">
                  <td className="p-3 text-text-primary font-medium">{t.name}</td>
                  <td className="p-3 text-text-secondary">{t.email}</td>
                  <td className="p-3 text-text-secondary">{t.subjects}</td>
                  <td className="p-3 text-text-secondary">{t.classes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Parents tab */}
      {tab === "parents" && (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-left border-b border-border bg-bg-secondary/50">
                <th className="p-3 font-medium">{lang === "af" ? "Naam" : "Name"}</th>
                <th className="p-3 font-medium">{lang === "af" ? "E-pos" : "Email"}</th>
                <th className="p-3 font-medium">{t(lang, "linkedChild")}</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_USERS.parents.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-bg-secondary/30">
                  <td className="p-3 text-text-primary font-medium">{p.name}</td>
                  <td className="p-3 text-text-secondary">{p.email}</td>
                  <td className="p-3 text-text-secondary">{p.child.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Classes tab */}
      {tab === "classes" && (
        <div className="grid grid-cols-3 gap-4">
          {classes.map(c => {
            const studentsInClass = DEMO_USERS.students.filter(s => s.class === c);
            return (
              <div key={c} className="card p-5" style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "12px" }}>
                <div className="text-lg font-semibold" style={{ color: "#F5F5F5" }}>{c}</div>
                <div className="text-sm text-text-muted mt-1">
                  {studentsInClass.length} {lang === "af" ? "leerders" : "students"}
                </div>
                <div className="mt-3" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {studentsInClass.map(s => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span style={{ color: "#F5F5F5" }}>{s.name}</span>
                      <span className="text-xs text-text-muted">{t(lang, "grade")} {s.grade.replace("G", "")} · {s.curriculum}</span>
                    </div>
                  ))}
                  {studentsInClass.length === 0 && (
                    <span className="text-xs text-text-muted">{lang === "af" ? "Geen leerders" : "No students"}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Card className="p-5 border-accent-blue/50">
        <div className="text-sm text-text-secondary">
          <div className="font-semibold mb-2">{lang === "af" ? "Toewysingshiërargie" : "Assignment Hierarchy"}</div>
          <p className="text-text-muted">
            {lang === "af"
              ? "Skool → Graad → Vak → Onderwyser → Klas → Leerder. Administrateurs ken gebruikers toe in hierdie volgorde. Administrateurs benodig nie 'n PIN nie — hulle het direkte toegang tot alle rekeninge."
              : "School → Grade → Subject → Teacher → Class → Student. Administrators assign users in this order. Admins do not need a PIN — they have direct access to all accounts."}
          </p>
        </div>
      </Card>
    </div>
  );
}
