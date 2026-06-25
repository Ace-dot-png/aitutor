"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

export default function ParentLinkPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { lang } = useLang();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if ((session?.user as any)?.linkedStudentId) { router.push("/parent/dashboard"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/parent/link",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin})});
    if (res.ok) { router.push("/parent/dashboard"); router.refresh(); }
    else { const data = await res.json(); setError(data.error||(lang==="af"?"Ongeldige PIN":"Invalid PIN")); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-silkscreen text-4xl text-text-primary mb-2">;)</div>
          <div className="font-aharoni text-2xl text-text-primary tracking-wider">aiTutor</div>
          <div className="text-text-secondary text-sm mt-2">{lang==="af"?"Ouer Portaal":"Parent Portal"}</div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-1">{lang==="af"?"Koppel aan Jou Kind":"Link to Your Child"}</h2>
          <p className="text-text-muted text-sm mb-4">{lang==="af"?"Voer die 6-syfer PIN in wat jou kind vir jou gegee het.":"Enter the 6-digit PIN your child gave you to view their progress."}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={lang==="af"?"Leerder PIN":"Student PIN"} type="text" value={pin} onChange={(e)=>setPin(e.target.value)} placeholder="629104" maxLength={6} required/>
            {error&&<div className="text-sm text-accent-orange bg-accent-orange/10 px-3 py-2 rounded-card">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading?(lang==="af"?"Koppel...":"Linking..."):(lang==="af"?"Koppel Rekening":"Link Account")}</Button>
          </form>
        </div>
        <div className="mt-4 text-center text-xs text-text-muted">{lang==="af"?"Demo PIN: 371824 (Aisha Patel)":"Demo PIN: 371824 (Aisha Patel)"}</div>
      </div>
    </div>
  );
}
