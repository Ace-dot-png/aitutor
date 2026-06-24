"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";

export default function StudentSettingsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetch("/api/stats/student").then((r) => r.json()).then(setData); }, []);

  const copyPin = () => {
    if (data?.pin) {
      navigator.clipboard.writeText(data.pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const user = session?.user as any;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card className="p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-1">Parent Link PIN</h2>
        <p className="text-text-muted text-sm mb-4">
          Share this PIN with your parent to give them read-only access to your progress.
        </p>
        <div className="flex items-center gap-3">
          <div className="bg-bg-secondary px-4 py-2 rounded-card text-2xl font-mono tracking-[0.3em] text-text-primary select-all">
            {data?.pin || "······"}
          </div>
          <button onClick={copyPin} className="btn-primary text-sm shrink-0">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </Card>

      <Card className="p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-1">Account</h2>
        <div className="text-sm text-text-secondary space-y-2 mt-3">
          <div><span className="text-text-muted">Name:</span> {user?.name}</div>
          <div><span className="text-text-muted">Email:</span> {user?.email}</div>
          <div><span className="text-text-muted">Grade:</span> Grade {user?.grade?.replace("G", "")}</div>
          <div><span className="text-text-muted">School:</span> {user?.schoolName}</div>
        </div>
      </Card>
    </div>
  );
}
