"use client"
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

export default function AdminUsersPage() {
  const { lang } = useLang();
  const [tab, setTab] = useState<"students"|"teachers"|"parents"|"classes">("students");
  const [users, setUsers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [resetPwUser, setResetPwUser] = useState<any>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("STUDENT");
  const [formSchool, setFormSchool] = useState("Sandton Academy");
  const [formGrade, setFormGrade] = useState("G10");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Reset password form
  const [newPassword, setNewPassword] = useState("");
  const [rpLoading, setRpLoading] = useState(false);
  const [rpMsg, setRpMsg] = useState("");

  // Filter for students tab
  const [filterGrade, setFilterGrade] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {}
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = filterGrade
    ? users.filter((u: any) => u.grade === filterGrade)
    : users;

  const roleUsers = filtered.filter((u: any) => {
    if (tab === "students") return u.role === "STUDENT";
    if (tab === "teachers") return u.role === "TEACHER";
    if (tab === "parents") return u.role === "PARENT";
    return false;
  });

  const grades = ["G10", "G11", "G12"];
  const classes = ["10A", "10B", "11A", "11B", "12A", "12B"];

  // User CRUD
  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      if (editUser) {
        const res = await fetch("/api/admin/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: editUser.email, updates: { name: formName, role: formRole, schoolName: formSchool, grade: formGrade } }),
        });
        if (!res.ok) { const d = await res.json(); setFormError(d.error); return; }
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName, email: formEmail, password: formPassword, role: formRole, schoolName: formSchool, grade: formRole === "STUDENT" ? formGrade : undefined }),
        });
        if (!res.ok) { const d = await res.json(); setFormError(d.error); return; }
      }
      setShowAdd(false);
      setEditUser(null);
      fetchUsers();
    } catch { setFormError("Failed"); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (email: string) => {
    if (!confirm("Delete this user permanently?")) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    fetchUsers();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRpLoading(true);
    setRpMsg("");
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetPwUser.email, newPassword }),
      });
      const d = await res.json();
      setRpMsg(d.success ? "Password reset successfully" : (d.error || "Failed"));
    } catch { setRpMsg("Something went wrong"); }
    finally { setRpLoading(false); }
  };

  const openAdd = () => {
    setEditUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("STUDENT");
    setFormSchool("Sandton Academy");
    setFormGrade("G10");
    setFormError("");
    setShowAdd(true);
  };

  const openEdit = (u: any) => {
    setEditUser(u);
    setFormName(u.name || "");
    setFormEmail(u.email || "");
    setFormPassword("");
    setFormRole(u.role || "STUDENT");
    setFormSchool(u.schoolName || "Sandton Academy");
    setFormGrade(u.grade || "G10");
    setFormError("");
    setShowAdd(true);
  };

  const tabs = [
    { key: "students" as const, label: "Students", labelAf: "Leerders" },
    { key: "teachers" as const, label: "Teachers", labelAf: "Onderwysers" },
    { key: "parents" as const, label: "Parents", labelAf: "Ouers" },
    { key: "classes" as const, label: "Classes", labelAf: "Klasse" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{lang === "af" ? "Gebruiker Bestuur" : "User Management"}</h1>
        <button onClick={openAdd} className="btn-primary text-sm px-4 py-2">
          + {lang === "af" ? "Voeg Gebruiker By" : "Add User"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-card text-sm ${tab === t.key ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"}`}>
            {lang === "af" ? t.labelAf : t.label}
          </button>
        ))}
      </div>

      {/* Grade filter for students */}
      {tab === "students" && (
        <div className="flex gap-2">
          <button onClick={() => setFilterGrade("")} className={`px-3 py-1 rounded-card text-xs ${!filterGrade ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"}`}>All</button>
          {grades.map(g => <button key={g} onClick={() => setFilterGrade(g)} className={`px-3 py-1 rounded-card text-xs ${filterGrade === g ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"}`}>{t(lang, "grade")} {g.replace("G", "")}</button>)}
        </div>
      )}

      {/* Classes tab */}
      {tab === "classes" && (
        <div className="grid grid-cols-3 gap-4">
          {classes.map(c => {
            const inClass = filtered.filter((u: any) => u.role === "STUDENT" && u.schoolName === "Sandton Academy" && u.grade?.replace("G","") === (c.startsWith("10") ? "10" : c.startsWith("11") ? "11" : "12"));
            return (
              <div key={c} className="card p-5">
                <div className="text-lg font-semibold">{c}</div>
                <div className="text-sm text-text-muted mt-1">
                  {inClass.length} {lang === "af" ? "leerders" : "students"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User table (not classes tab) */}
      {tab !== "classes" && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-left border-b border-border bg-bg-secondary/50">
                <th className="p-3 font-medium">{lang === "af" ? "Naam" : "Name"}</th>
                <th className="p-3 font-medium">{lang === "af" ? "E-pos" : "Email"}</th>
                {tab === "students" && <><th className="p-3 font-medium">{t(lang, "grade")}</th><th className="p-3 font-medium">PIN</th></>}
                {tab === "teachers" && <th className="p-3 font-medium">{t(lang, "subject")}</th>}
                {tab === "parents" && <th className="p-3 font-medium">{t(lang, "linkedChild")}</th>}
                <th className="p-3 font-medium">{lang === "af" ? "Skool" : "School"}</th>
                <th className="p-3 font-medium text-right">{lang === "af" ? "Aksies" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {roleUsers.map((u: any) => (
                <tr key={u.id || u.email} className="border-b border-border hover:bg-bg-secondary/30">
                  <td className="p-3 text-text-primary font-medium">{u.name}</td>
                  <td className="p-3 text-text-secondary text-xs">{u.email}</td>
                  {tab === "students" && <><td className="p-3 text-text-secondary">{u.grade?.replace("G", "") || "-"}</td><td className="p-3 text-text-secondary font-mono text-xs">{u.pin || "-"}</td></>}
                  {tab === "parents" && <td className="p-3 text-text-secondary">{u.linkedStudentId || "-"}</td>}
                  <td className="p-3 text-text-secondary text-xs">{u.schoolName || "-"}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(u)} className="text-xs text-accent-blue hover:underline">Edit</button>
                      <button onClick={() => { setResetPwUser(u); setNewPassword(""); setRpMsg(""); }} className="text-xs text-accent-orange hover:underline">Reset PW</button>
                      <button onClick={() => handleDelete(u.email)} className="text-xs text-accent-orange/60 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">{editUser ? "Edit User" : "Add User"}</h2>
            <form onSubmit={handleAddOrEdit} className="space-y-3">
              <input value={formName} onChange={e => setFormName(e.target.value)} required className="input-field w-full" placeholder="Full name" />
              {!editUser && <input value={formEmail} onChange={e => setFormEmail(e.target.value)} required className="input-field w-full" placeholder="Email" type="email" />}
              {!editUser && <input value={formPassword} onChange={e => setFormPassword(e.target.value)} required minLength={6} className="input-field w-full" placeholder="Password (min 6)" type="password" />}
              <select value={formRole} onChange={e => setFormRole(e.target.value)} className="input-field w-full">
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
              </select>
              <input value={formSchool} onChange={e => setFormSchool(e.target.value)} className="input-field w-full" placeholder="School" />
              {formRole === "STUDENT" && (
                <select value={formGrade} onChange={e => setFormGrade(e.target.value)} className="input-field w-full">
                  {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={`G${i+1}`}>Grade {i+1}</option>)}
                </select>
              )}
              {formError && <div className="text-sm text-accent-orange">{formError}</div>}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 text-sm">{editUser ? "Save" : "Create"}</button>
                <button type="button" onClick={() => { setShowAdd(false); setEditUser(null); }} className="btn-secondary flex-1 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPwUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold mb-2">Reset Password</h2>
            <p className="text-sm text-text-muted mb-4">{resetPwUser.name} ({resetPwUser.email})</p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <input value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="input-field w-full" placeholder="New password" type="password" />
              {rpMsg && <div className={`text-sm ${rpMsg.includes("success") ? "text-accent-green" : "text-accent-orange"}`}>{rpMsg}</div>}
              <div className="flex gap-2">
                <button type="submit" disabled={rpLoading} className="btn-primary flex-1 text-sm">Reset</button>
                <button type="button" onClick={() => setResetPwUser(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card p-5 border-accent-blue/50">
        <div className="text-sm text-text-secondary">
          <div className="font-semibold mb-2">{lang === "af" ? "Toewysingshiërargie" : "Assignment Hierarchy"}</div>
          <p className="text-text-muted">{lang === "af" ? "Skool → Graad → Vak → Onderwyser → Klas → Leerder. Administrateurs ken gebruikers toe in hierdie volgorde." : "School → Grade → Subject → Teacher → Class → Student. Administrators assign users in this order. Admins do not need a PIN — they have direct access to all accounts."}</p>
        </div>
      </div>
    </div>
  );
}
