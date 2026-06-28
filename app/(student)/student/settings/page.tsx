"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useState } from "react";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

export default function StudentSettingsPage() {
  const { data: session } = useSession();
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);
  const user = session?.user as any;

  const copyPin = () => {
    if (user?.pin) { navigator.clipboard.writeText(user.pin); setCopied(true); setTimeout(() => setCopied(false), 2000); }
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
