"use client"
export const dynamic = 'force-dynamic'
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

const ROLE_REDIRECTS: Record<string, string> = {
  ADMIN: "/admin/dashboard", TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard", PARENT: "/parent/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) { setError(t(lang, "invalidEmail")); setLoading(false); return; }
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const redirect = ROLE_REDIRECTS[session?.user?.role];
      if (redirect) router.push(redirect);
      else { setError(t(lang, "invalidEmail")); setLoading(false); }
    } catch {
      setError(t(lang, "invalidEmail")); setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-silkscreen text-4xl text-text-primary mb-2">;)</div>
          <div className="font-aharoni text-2xl text-text-primary tracking-wider">aiTutor</div>
          <div className="text-text-muted text-sm mt-2">South African curriculum tutoring</div>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t(lang, "email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@sandtonacademy.co.za" required />
            <Input label={t(lang, "password") || "Password"} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            {error && <div className="text-sm text-accent-orange bg-accent-orange/10 px-3 py-2 rounded-card">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t(lang, "signingIn") : t(lang, "signIn")}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <div className="text-xs text-text-muted mb-2">{t(lang, "chooseLanguage")}</div>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setLang("en")} className={`px-3 py-1.5 rounded-card text-xs transition-colors ${lang === "en" ? "bg-accent-blue text-text-primary" : "bg-card text-text-secondary hover:text-text-primary"}`}>
              🇿🇦 English
            </button>
            <button onClick={() => setLang("af")} className={`px-3 py-1.5 rounded-card text-xs transition-colors ${lang === "af" ? "bg-accent-blue text-text-primary" : "bg-card text-text-secondary hover:text-text-primary"}`}>
              🇿🇦 Afrikaans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
