"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function StudentNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadNotes = () => {
    fetch("/api/notes").then((r) => r.json()).then(setNotes);
  };

  useEffect(() => { loadNotes(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("subject", "MATHEMATICS");
    await fetch("/api/notes", { method: "POST", body: formData });
    setUploading(false);
    loadNotes();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <label className="btn-primary cursor-pointer text-sm">
          {uploading ? "Uploading..." : "Upload Note"}
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.png,.jpg,.jpeg,.docx" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {notes.map((note) => (
          <Card key={note.id} className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm text-text-primary">{note.title}</div>
              <div className="text-xs text-text-muted mt-1">
                {note.subject} · {new Date(note.uploadedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-accent-blue text-sm hover:underline">
                View
              </a>
            </div>
          </Card>
        ))}
        {notes.length === 0 && <div className="text-text-muted text-sm p-4">No notes uploaded yet.</div>}
      </div>
    </div>
  );
}
