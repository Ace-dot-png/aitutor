"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

const CURRICULUMS = ["CAPS", "IEB", "CAMBRIDGE"] as const;

export default function StudentSettingsPage() {
  const { data: session } = useSession();
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);
  const [curriculum, setCurriculum] = useState("CAPS");
  const [pendingChange, setPendingChange] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const user = session?.user as any;

  useEffect(() => {
    fetch("/api/user/curriculum")
      .then(r => r.json())
      .then(d => setCurriculum(d.curriculum || "CAPS"))
      .catch(() => {});
  }, []);

  const copyPin = () => {
    if (user?.pin) { navigator.clipboard.writeText(user.pin); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const confirmChange = async () => {
    if (!pendingChange) return;
    setSaving(true);
    try {
      await fetch("/api/user/curriculum", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculum: pendingChange }),
      });
      setCurriculum(pendingChange);
    } catch {} finally {
      setSaving(false);
      setPendingChange(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t(lang, "settings")}</h1>

      <Card className="p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-1">{t(lang, "yourPin")}</h2>
        <p className="text-text-muted text-sm mb-4">{t(lang, "sharePin")}</p>
        <div className="flex items-center gap-3">
          <div className="bg-bg-secondary px-4 py-2 rounded-card text-2xl font-mono tracking-[0.3em] text-text-primary select-all">{user?.pin || "······"}</div>
          <button onClick={copyPin} className="btn-primary text-sm shrink-0">{copied ? (lang==="af"?"Gekopieer!":"Copied!") : (lang==="af"?"Kopieer":"Copy")}</button>
        </div>
      </Card>

      <Card className="p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-3">{lang==="af"?"Kurrikulum":"Curriculum"}</h2>
        <div className="flex gap-2">
          {CURRICULUMS.map((c) => (
            <button
              key={c}
              onClick={() => c !== curriculum && setPendingChange(c)}
              className={`px-4 py-2 rounded-card text-sm transition-colors ${
                curriculum === c
                  ? "bg-accent-blue text-text-primary cursor-default"
                  : "bg-bg-secondary text-text-secondary hover:border-accent-blue hover:text-text-primary"
              }`}
            >
              {c}
              {curriculum === c && " ✓"}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-2">
          {lang === "af"
            ? "Dit beïnvloed watter vakke en onderwerpe beskikbaar is."
            : "This affects which subjects and topics are available."}
        </p>
        {saving && (
          <p className="text-xs text-accent-green mt-2">
            {lang === "af" ? "Gestoor!" : "Saved!"}
          </p>
        )}
      </Card>

      {/* Confirmation dialog */}
      {pendingChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-sm mx-4 space-y-4 text-center">
            <div className="text-lg font-semibold">
              {lang === "af" ? "Verander kurrikulum?" : "Change curriculum?"}
            </div>
            <p className="text-sm text-text-secondary">
              {lang === "af"
                ? `Jy skakel oor na ${pendingChange}. Die KI sal verskillende inhoud en vakke gebruik.`
                : `You are switching to ${pendingChange}. The AI will use different content and subjects.`}
            </p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setPendingChange(null)} className="btn-secondary text-sm">
                {lang === "af" ? "Kanselleer" : "Cancel"}
              </button>
              <button onClick={confirmChange} className="btn-primary text-sm">
                {lang === "af" ? "Verander" : "Switch"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Card className="p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-1">{lang==="af"?"Rekening":"Account"}</h2>
        <div className="text-sm text-text-secondary space-y-2 mt-3">
          <div><span className="text-text-muted">{lang==="af"?"Naam:":"Name:"}</span> {user?.name}</div>
          <div><span className="text-text-muted">{lang==="af"?"E-pos:":"Email:"}</span> {user?.email}</div>
          <div><span className="text-text-muted">{t(lang, "grade")}:</span> {t(lang, "grade")} {user?.grade?.replace("G", "")}</div>
          <div><span className="text-text-muted">{t(lang, "school")}:</span> {user?.schoolName}</div>
        </div>
      </Card>
    </div>
  );
}
