"use client"
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<string[]>([]);
  const [newSchool, setNewSchool] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"text" | "csv">("text");

  const fetchSchools = async () => {
    try {
      const res = await fetch("/api/admin/schools");
      const data = await res.json();
      setSchools(data.schools || []);
    } catch {}
  };

  useEffect(() => { fetchSchools(); }, []);

  const addByText = async () => {
    if (!newSchool.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSchool.trim() }),
      });
      const d = await res.json();
      if (d.success) { setNewSchool(""); setSchools(d.schools); setMsg("School added"); }
    } catch { setMsg("Failed"); }
    finally { setLoading(false); }
  };

  const uploadCsv = async () => {
    if (!csvFile && !csvText.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      if (csvFile) {
        const formData = new FormData();
        formData.append("file", csvFile);
        const res = await fetch("/api/admin/schools", { method: "POST", body: formData });
        const d = await res.json();
        if (d.success) { setMsg(`${d.added} schools added`); setCsvFile(null); setSchools(d.schools); }
      } else {
        // Send as text via formData
        const blob = new Blob([csvText], { type: "text/csv" });
        const formData = new FormData();
        formData.append("file", blob, "schools.csv");
        const res = await fetch("/api/admin/schools", { method: "POST", body: formData });
        const d = await res.json();
        if (d.success) { setMsg(`${d.added} schools added`); setCsvText(""); setSchools(d.schools); }
      }
    } catch { setMsg("Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold">School Management</h1>

      {/* Add school */}
      <div className="card p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Add Schools</h2>
        <div className="flex gap-2">
          <button onClick={() => setMode("text")} className={`px-4 py-2 rounded-card text-sm ${mode === "text" ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"}`}>Text Input</button>
          <button onClick={() => setMode("csv")} className={`px-4 py-2 rounded-card text-sm ${mode === "csv" ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"}`}>CSV Upload</button>
        </div>

        {mode === "text" ? (
          <div className="flex gap-2">
            <input
              value={newSchool}
              onChange={e => setNewSchool(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addByText()}
              placeholder="School name (or 'Home Schooled')"
              className="input-field flex-1"
            />
            <button onClick={addByText} disabled={loading || !newSchool.trim()} className="btn-primary text-sm px-4">
              Add
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Upload CSV file</label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={e => setCsvFile(e.target.files?.[0] || null)}
                className="text-sm text-text-secondary"
              />
            </div>
            <p className="text-xs text-text-muted text-center">— or paste comma-separated list —</p>
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="Sandton Academy, Parktown High, St Mary's, Home Schooled"
              className="input-field w-full"
              rows={3}
            />
            <button onClick={uploadCsv} disabled={loading || (!csvFile && !csvText.trim())} className="btn-primary text-sm px-4">
              Upload & Import
            </button>
            <p className="text-xs text-text-muted">
              CSV format: one school per line, or comma-separated. Duplicates are skipped.
            </p>
          </div>
        )}

        {msg && <div className="text-sm text-accent-green bg-accent-green/10 px-3 py-2 rounded-card">{msg}</div>}
      </div>

      {/* Current schools */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Current Schools ({schools.length})
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {schools.map(s => (
            <div key={s} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-accent-blue shrink-0" />
              <span className="text-text-primary">{s}</span>
              {s === "Home Schooled" && <span className="text-xs text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full">homeschool</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
