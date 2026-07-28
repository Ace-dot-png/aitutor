"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ParentLinkPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/parent/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem("linkedStudentId", data.studentId);
      localStorage.setItem("linkedStudentName", data.studentName);
      router.push("/parent/dashboard");
    } else {
      setError(data.error || "Invalid PIN");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", color: "#F5F5F5", marginBottom: "8px" }}>;)</div>
          <div style={{ fontSize: "28px", color: "#F5F5F5", fontWeight: 700, letterSpacing: "2px" }}>aiTutor</div>
          <div style={{ fontSize: "14px", color: "#B0B0B0", marginTop: "8px" }}>Parent Portal</div>
        </div>

        <div style={{
          background: "#1A1A1A",
          border: "1px solid #2A2A2A",
          borderRadius: "12px",
          padding: "24px",
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#F5F5F5", marginBottom: "4px" }}>
            Link to Your Child
          </h2>
          <p style={{ fontSize: "13px", color: "#6B6B6B", marginBottom: "16px" }}>
            Enter the 6-digit PIN your child gave you to view their progress.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: "#B0B0B0", marginBottom: "6px" }}>
                Student PIN
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="482910"
                maxLength={6}
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "#0A0A0A",
                  border: "2px solid #3A3A3A",
                  borderRadius: "8px",
                  color: "#F5F5F5",
                  fontSize: "20px",
                  fontFamily: "monospace",
                  letterSpacing: "4px",
                  textAlign: "center",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#121bde")}
                onBlur={(e) => (e.target.style.borderColor = "#3A3A3A")}
              />
            </div>

            {error && (
              <div style={{
                fontSize: "13px",
                color: "#d72d02",
                background: "rgba(215, 45, 2, 0.1)",
                padding: "8px 12px",
                borderRadius: "8px",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length < 4}
              style={{
                width: "100%",
                padding: "12px",
                background: loading ? "#1A3A6A" : "#121bde",
                color: "#F5F5F5",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
                opacity: pin.length < 4 ? 0.5 : 1,
              }}
            >
              {loading ? "Linking..." : "Link Account"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#6B6B6B" }}>
          PINs: 482910 (Thabo), 629104 (Maryke se dogter), 847362 (Klara)
        </div>
      </div>
    </div>
  );
}
