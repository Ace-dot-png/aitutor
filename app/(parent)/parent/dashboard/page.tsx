"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

export default function ParentDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { lang } = useLang();
  const user = session?.user as any;

  const [children, setChildren] = useState<any[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showPayment, setShowPayment] = useState<any>(null); // child being paid for
  const [paymentStep, setPaymentStep] = useState<"eula" | "pay">("eula");
  const [acceptedPOPIA, setAcceptedPOPIA] = useState(false);
  const [acceptedEULA, setAcceptedEULA] = useState(false);

  // Add child form
  const [childName, setChildName] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [childPassword, setChildPassword] = useState("");
  const [childGrade, setChildGrade] = useState("G10");
  const [childSchool, setChildSchool] = useState("Sandton Academy");
  const [childCurriculum, setChildCurriculum] = useState("CAPS");
  const [childError, setChildError] = useState("");
  const [childLoading, setChildLoading] = useState(false);

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/parent/children");
      const data = await res.json();
      setChildren(data.children || []);
    } catch {}
  };

  useEffect(() => { fetchChildren(); }, []);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setChildLoading(true);
    setChildError("");
    try {
      const res = await fetch("/api/parent/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: childName, email: childEmail, password: childPassword, grade: childGrade, school: childSchool, curriculum: childCurriculum }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddChild(false);
        setChildName(""); setChildEmail(""); setChildPassword("");
        fetchChildren();
        // New child created — go to payment flow
        setShowPayment({ name: childName, pin: data.pin, email: childEmail });
        setPaymentStep("eula");
        setAcceptedPOPIA(false);
        setAcceptedEULA(false);
      } else {
        setChildError(data.error || "Failed");
      }
    } catch {
      setChildError("Something went wrong");
    } finally {
      setChildLoading(false);
    }
  };

  const startPaymentFor = (child: any) => {
    setShowPayment(child);
    setPaymentStep("eula");
    setAcceptedPOPIA(false);
    setAcceptedEULA(false);
  };

  const proceedToPayStack = () => {
    // In production: redirect to PayStack checkout
    // For now: mark as paid and redirect
    setPaymentStep("pay");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{user?.name}</h1>
        <p className="text-text-muted text-sm">{lang === "af" ? "Ouer Portaal" : "Parent Portal"}</p>
      </div>

      {/* Children list */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            {lang === "af" ? "My Kinders" : "My Children"} ({children.length})
          </h2>
          <button onClick={() => { setShowAddChild(true); setChildError(""); }} className="btn-primary text-xs px-3 py-1.5">
            + {lang === "af" ? "Voeg Kind By" : "Add Child"}
          </button>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">
            <p className="mb-2">{lang === "af" ? "Nog geen kinders bygevoeg nie." : "No children added yet."}</p>
            <p>{lang === "af" ? "Voeg jou eerste kind by om te begin." : "Add your first child to get started."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-bg-secondary rounded-card">
                <div>
                  <div className="text-sm font-medium">{child.name}</div>
                  <div className="text-xs text-text-muted">
                    {t(lang, "grade")} {child.grade?.replace("G", "")} · {child.schoolName} · PIN: {child.pin}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/parent/dashboard?child=${child.email}`)}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    View
                  </button>
                  <button
                    onClick={() => startPaymentFor(child)}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    {lang === "af" ? "Betaal" : "Pay"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{lang === "af" ? "Voeg Kind By" : "Add a Child"}</h2>
            <form onSubmit={handleAddChild} className="space-y-3">
              <input value={childName} onChange={e => setChildName(e.target.value)} required className="input-field w-full" placeholder={lang === "af" ? "Kind se naam" : "Child's name"} />
              <input value={childEmail} onChange={e => setChildEmail(e.target.value)} required type="email" className="input-field w-full" placeholder={lang === "af" ? "Kind se e-pos" : "Child's email"} />
              <input value={childPassword} onChange={e => setChildPassword(e.target.value)} required minLength={6} type="password" className="input-field w-full" placeholder={lang === "af" ? "Wagwoord vir kind (min 6)" : "Password for child (min 6)"} />
              <select value={childGrade} onChange={e => setChildGrade(e.target.value)} className="input-field w-full">
                {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={`G${i+1}`}>Grade {i+1}</option>)}
              </select>
              <input value={childSchool} onChange={e => setChildSchool(e.target.value)} className="input-field w-full" placeholder="School" />
              <select value={childCurriculum} onChange={e => setChildCurriculum(e.target.value)} className="input-field w-full">
                <option value="CAPS">CAPS</option>
                <option value="IEB">IEB</option>
                <option value="CAMBRIDGE">Cambridge</option>
              </select>

              <p className="text-xs text-text-muted">
                {lang === "af"
                  ? "Nadat jy jou kind bygevoeg het, sal jy die EULA en POPIA moet aanvaar en dan na PayStack geneem word vir betaling."
                  : "After adding your child, you will need to accept our EULA and POPIA policies, then proceed to PayStack for payment."}
              </p>

              {childError && <div className="text-sm text-accent-orange">{childError}</div>}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={childLoading} className="btn-primary flex-1 text-sm">
                  {lang === "af" ? "Voeg Kind By" : "Add Child"}
                </button>
                <button type="button" onClick={() => setShowAddChild(false)} className="btn-secondary flex-1 text-sm">
                  {lang === "af" ? "Kanselleer" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal: Step 1 — EULA/POPIA */}
      {showPayment && paymentStep === "eula" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">
              {lang === "af" ? "Aanvaar Bepalings vir" : "Accept Terms for"} {showPayment.name}
            </h2>
            <p className="text-xs text-text-muted mb-4">
              {lang === "af"
                ? "Jy moet die EULA en POPIA aanvaar voordat jy kan betaal."
                : "You must accept the EULA and POPIA before proceeding to payment."}
            </p>

            <div className="space-y-3">
              <div className="border border-border rounded-card p-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={acceptedEULA} onChange={e => setAcceptedEULA(e.target.checked)} className="mt-1" />
                  <span className="text-xs text-text-secondary">
                    I accept the <strong>End User License Agreement (EULA)</strong> for my child's use of aiTutor.
                  </span>
                </label>
              </div>

              <div className="border border-border rounded-card p-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={acceptedPOPIA} onChange={e => setAcceptedPOPIA(e.target.checked)} className="mt-1" />
                  <span className="text-xs text-text-secondary">
                    I consent to aiTutor processing my child's personal information in accordance with <strong>POPIA (Act 4 of 2013)</strong>.
                  </span>
                </label>
              </div>

              <button
                onClick={proceedToPayStack}
                disabled={!acceptedEULA || !acceptedPOPIA}
                className="btn-primary w-full text-sm py-3"
              >
                {lang === "af" ? "Gaan na PayStack" : "Proceed to PayStack"}
              </button>
              <button onClick={() => setShowPayment(null)} className="btn-secondary w-full text-sm py-2">
                {lang === "af" ? "Later" : "Later"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal: Step 2 — PayStack */}
      {showPayment && paymentStep === "pay" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md mx-4 text-center">
            <h2 className="text-lg font-semibold mb-2">
              {lang === "af" ? "PayStack Betaling" : "PayStack Payment"}
            </h2>
            <p className="text-sm text-text-secondary mb-1">
              {showPayment.name} — {t(lang, "grade")} {showPayment.grade?.replace?.("G", "") || ""}
            </p>
            <div className="text-3xl font-bold text-accent-green my-4">R149<span className="text-sm text-text-muted">/month</span></div>
            <p className="text-xs text-text-muted mb-4">
              {lang === "af"
                ? "PayStack-integrasie sal hier laai. Betaalmetodes: kaart, EFT, en meer."
                : "PayStack integration will load here. Payment methods: card, EFT, and more."}
            </p>
            <div className="bg-bg-secondary p-4 rounded-card mb-4 text-xs text-text-muted">
              {lang === "af"
                ? "PayStack sal hier in 'n regte produksie wees. Die integrasie gebruik PayStack se Inline JS of Redirect API."
                : "PayStack will go here in production. The integration uses PayStack's Inline JS or Redirect API."}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowPayment(null); fetchChildren(); }} className="btn-primary flex-1 text-sm">
                {lang === "af" ? "Voltooi" : "Done"}
              </button>
              <button onClick={() => setShowPayment(null)} className="btn-secondary flex-1 text-sm">
                {lang === "af" ? "Sluit" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
