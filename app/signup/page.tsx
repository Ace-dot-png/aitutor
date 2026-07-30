"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedPOPIA, setAcceptedPOPIA] = useState(false);
  const [acceptedEULA, setAcceptedEULA] = useState(false);
  const [showPOPIA, setShowPOPIA] = useState(false);
  const [showEULA, setShowEULA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = name && email && password.length >= 6 && acceptedPOPIA && acceptedEULA;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "PARENT", acceptedPOPIA: true, acceptedEULA: true }),
      });
      const data = await res.json();

      if (res.ok) {
        await signIn("credentials", { email, password, redirect: false });
        router.push("/parent/dashboard");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="font-silkscreen text-4xl text-text-primary mb-2">;)</div>
          <div className="font-aharoni text-2xl text-text-primary tracking-wider">aiTutor</div>
          <div className="text-text-secondary text-sm mt-1">Parent Account — Free</div>
        </div>

        <div className="card p-6">
          <div className="mb-4 text-xs text-accent-green bg-accent-green/10 px-3 py-2 rounded-card">
            Parents create a free account. Children are added from your dashboard — each child needs their own subscription.
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Your Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-field w-full" placeholder="Mrs. Priya Patel" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field w-full" placeholder="priya@example.com" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="input-field w-full" placeholder="Min 6 characters" />
            </div>

            {/* POPIA */}
            <div className="border border-border rounded-card p-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={acceptedPOPIA} onChange={e => setAcceptedPOPIA(e.target.checked)} className="mt-1" />
                <span className="text-xs text-text-secondary">
                  I accept the{" "}
                  <button type="button" onClick={() => setShowPOPIA(!showPOPIA)} className="text-accent-blue underline">
                    POPIA Privacy Policy
                  </button>
                </span>
              </label>
              {showPOPIA && (
                <div className="mt-2 p-3 bg-bg-secondary rounded-card text-xs text-text-muted max-h-40 overflow-y-auto leading-relaxed">
                  <strong className="text-text-primary block mb-1">POPIA — Protection of Personal Information Act</strong>
                  aiTutor (\"we\", \"us\", \"our\") is committed to protecting your personal information and that of your child in accordance with South Africa's Protection of Personal Information Act (POPIA), Act 4 of 2013.
                  {"\n\n"}<strong>What we collect:</strong> Parent/guardian name, email address, and payment information. Child's name, grade, school, learning data, session history, and AI-generated progress reports.
                  {"\n\n"}<strong>Why we collect it:</strong> To provide personalised AI tutoring, track academic progress, and communicate with parents about their child's learning. We never sell or share data with third parties for marketing.
                  {"\n\n"}<strong>Your rights:</strong> You may request access to, correction of, or deletion of your data at any time by contacting us. Data is stored securely and encrypted. AI processing is done via OpenAI — their privacy policy also applies.
                  {"\n\n"}By accepting, you consent to the collection and processing of personal information as described above for educational purposes only.
                </div>
              )}
            </div>

            {/* EULA */}
            <div className="border border-border rounded-card p-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={acceptedEULA} onChange={e => setAcceptedEULA(e.target.checked)} className="mt-1" />
                <span className="text-xs text-text-secondary">
                  I accept the{" "}
                  <button type="button" onClick={() => setShowEULA(!showEULA)} className="text-accent-blue underline">
                    End User License Agreement
                  </button>
                </span>
              </label>
              {showEULA && (
                <div className="mt-2 p-3 bg-bg-secondary rounded-card text-xs text-text-muted max-h-40 overflow-y-auto leading-relaxed">
                  <strong className="text-text-primary block mb-1">EULA — End User License Agreement</strong>
                  This agreement is between you (\"Parent\" or \"Guardian\") and aiTutor.
                  {"\n\n"}<strong>1. License:</strong> aiTutor grants you a non-exclusive, non-transferable license to use the platform for your child's educational purposes. One subscription covers one child account.
                  {"\n\n"}<strong>2. Parental Responsibility:</strong> You are responsible for your child's use of the platform. You must monitor their activity and ensure they do not share inappropriate content. The AI tutor is a supplement to, not a replacement for, classroom instruction.
                  {"\n\n"}<strong>3. Content:</strong> All curriculum-aligned content, AI-generated responses, and platform materials remain the intellectual property of aiTutor. You may not redistribute, resell, or publicly display platform content.
                  {"\n\n"}<strong>4. Payment:</strong> Subscriptions are billed monthly via PayStack. Cancellation takes effect at the end of the current billing cycle. No refunds for partial months.
                  {"\n\n"}<strong>5. Limitation of Liability:</strong> aiTutor is provided \"as is.\" We do not guarantee specific academic outcomes. We are not liable for any damages arising from use of the platform.
                  {"\n\n"}By accepting, you agree to these terms and confirm you are the parent or legal guardian of the child(ren) you register.
                </div>
              )}
            </div>

            {error && <div className="text-sm text-accent-orange bg-accent-orange/10 px-3 py-2 rounded-card">{error}</div>}

            <button type="submit" disabled={loading || !canSubmit} className="btn-primary w-full text-sm py-3">
              {loading ? "Creating account..." : "Create Free Parent Account"}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-4">
            Already have an account? <Link href="/login" className="text-accent-blue">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
