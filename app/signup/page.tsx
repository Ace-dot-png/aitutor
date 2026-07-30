"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

// Demo school data — in production this comes from DB
const DEMO_SCHOOLS = [
  "Sandton Academy",
  "Parktown High School",
  "St Mary's School",
  "Kingsmead College",
  "Roedean School",
  "St John's College",
  "Crawford College",
  "Redhill School",
  "Dainfern College",
  "Brescia House School",
  "St Stithians College",
  "Beaulieu College",
  "Jeppe High School",
  "King Edward VII School",
  "Home Schooled",
];

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "PARENT">("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredSchools = DEMO_SCHOOLS.filter(
    (s) => s.toLowerCase().includes(schoolQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (role === "STUDENT" && !school) {
      setError("Please select a school");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, school: school || "Home Schooled", grade: role === "STUDENT" ? grade : undefined }),
      });
      const data = await res.json();

      if (res.ok) {
        await signIn("credentials", { email, password, redirect: false });
        if (role === "PARENT") {
          router.push("/parent/link");
        } else {
          router.push("/student/dashboard");
        }
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
        <div className="text-center mb-8">
          <div className="font-silkscreen text-4xl text-text-primary mb-2">;)</div>
          <div className="font-aharoni text-2xl text-text-primary tracking-wider">aiTutor</div>
          <div className="text-text-secondary text-sm mt-2">Create your account</div>
        </div>

        <div className="card p-6">
          {/* Role selector */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`flex-1 py-3 rounded-card text-sm font-semibold ${
                role === "STUDENT" ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"
              }`}
            >
              I'm a Student
            </button>
            <button
              type="button"
              onClick={() => setRole("PARENT")}
              className={`flex-1 py-3 rounded-card text-sm font-semibold ${
                role === "PARENT" ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"
              }`}
            >
              I'm a Parent
            </button>
          </div>

          {role === "PARENT" && (
            <div className="mb-4 text-xs text-accent-green bg-accent-green/10 px-3 py-2 rounded-card">
              Parents sign up free. Link to your child using their PIN from their settings.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field w-full"
                placeholder="Thabo Nkosi"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field w-full"
                placeholder="thabo@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field w-full"
                placeholder="Min 6 characters"
              />
            </div>

            {role === "STUDENT" && (
              <>
                {/* Fuzzy school search */}
                <div className="relative">
                  <label className="block text-sm text-text-secondary mb-1">School</label>
                  <input
                    type="text"
                    value={schoolQuery}
                    onChange={(e) => {
                      setSchoolQuery(e.target.value);
                      setSchool("");
                      setShowSchoolDropdown(true);
                    }}
                    onFocus={() => setShowSchoolDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
                    required
                    className="input-field w-full"
                    placeholder="Search your school..."
                  />
                  {showSchoolDropdown && schoolQuery && filteredSchools.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-secondary border border-border rounded-card max-h-48 overflow-y-auto shadow-lg">
                      {filteredSchools.map((s) => (
                        <div
                          key={s}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-bg-primary ${
                            school === s ? "text-accent-blue font-semibold" : "text-text-primary"
                          }`}
                          onMouseDown={() => {
                            setSchool(s);
                            setSchoolQuery(s);
                            setShowSchoolDropdown(false);
                          }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1">Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                    className="input-field w-full"
                  >
                    <option value="">Select your grade</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={`G${i + 1}`}>Grade {i + 1}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="text-sm text-accent-orange bg-accent-orange/10 px-3 py-2 rounded-card">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-3">
              {loading ? "Creating account..." : role === "PARENT" ? "Create Free Account" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-blue">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
