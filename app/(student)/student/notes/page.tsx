"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

export default function StudentNotesPage() {
  const { lang } = useLang();
  const [notesList, setNotes] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadNotes = () => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((json) => {
        const notes = Array.isArray(json) ? json : (json.notes ?? json.data ?? []);
        setNotes(notes);
      })
      .catch(() => setError(lang === "af" ? "Kon nie notas laai nie." : "Could not load notes."));
  };
  useEffect(() => { loadNotes(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file); fd.append("title", file.name); fd.append("subject", "MATHEMATICS");
    await fetch("/api/notes", { method: "POST", body: fd });
    setUploading(false); loadNotes();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(lang, "notes")}</h1>
        <label className="btn-primary cursor-pointer text-sm">{uploading ? (lang==="af"?"Laai op...":"Uploading...") : t(lang, "uploadNotes")}
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.png,.jpg,.jpeg,.docx"/>
        </label>
      </div>
      {error && <div className="text-sm text-accent-orange">{error}</div>}
      <div className="grid grid-cols-1 gap-3">
        {notesList.map((note) => (
          <Card key={note.id} className="flex items-center justify-between p-4">
            <div><div className="text-sm text-text-primary">{note.title}</div><div className="text-xs text-text-muted mt-1">{note.subject} · {new Date(note.uploadedAt).toLocaleDateString()}</div></div>
            <div className="flex items-center gap-2"><a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-accent-blue text-sm hover:underline">{lang==="af"?"Bekyk":"View"}</a></div>
          </Card>
        ))}
        {notesList.length === 0 && !error && <div className="text-text-muted text-sm p-4">{t(lang, "noData")}</div>}
      </div>
    </div>
  );
}
