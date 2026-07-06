"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { Mascot } from "@/components/mascot/Mascot";

interface TestQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const SUBJECT_OPTIONS = [
  { key: "mathematics", label: "Mathematics" },
  { key: "physics", label: "Physical Sciences" },
  { key: "english", label: "English" },
  { key: "afrikaans", label: "Afrikaans" },
  { key: "accounting", label: "Accounting" },
  { key: "business_studies", label: "Business Studies" },
  { key: "economics", label: "Economics" },
  { key: "geography", label: "Geography" },
  { key: "history", label: "History" },
  { key: "life_sciences", label: "Life Sciences" },
  { key: "natural_sciences", label: "Natural Sciences" },
  { key: "social_sciences", label: "Social Sciences" },
];

export default function TestsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { lang } = useLang();

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [lastExplanation, setLastExplanation] = useState("");

  const grade = user?.grade?.replace("G", "") || "10";

  const startTest = async () => {
    if (!subject || !topic.trim()) return;
    setLoading(true);
    setDone(false);
    setScore(0);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAnswered(false);
    try {
      const res = await fetch("/api/tests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic: topic.trim(), grade, count, language: lang }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch {} finally { setLoading(false); }
  };

  const selectAnswer = (i: number) => {
    if (answered) return;
    setSelectedAnswer(i);
    setAnswered(true);
    const correct = questions[currentQ].correct === i;
    setLastCorrect(correct);
    setLastExplanation(questions[currentQ].explanation);
    if (correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      finishTest();
    } else {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  const finishTest = async () => {
    setDone(true);
    try {
      await fetch("/api/tests/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, grade, score, total: questions.length }),
      });
    } catch {}
  };

  const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">📝 {t(lang, "tests") || "Tests & Practice"}</h1>

      {/* Test setup */}
      {!done && questions.length === 0 && (
        <div className="card p-5 space-y-4">
          <div>
            <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1">{t(lang, "selectSubject")}</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field w-full">
              <option value="">{lang === "af" ? "Kies 'n vak..." : "Pick a subject..."}</option>
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1">{t(lang, "selectTopic")}</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-field w-full"
              placeholder={lang === "af" ? "bv. Algebra" : "e.g. Algebra"}
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1">{lang === "af" ? "Aantal vrae" : "Number of questions"}</label>
            <div className="flex gap-2">
              {[5, 10, 15].map((n) => (
                <button key={n} onClick={() => setCount(n)} className={`px-4 py-2 rounded-card text-sm ${count === n ? "bg-accent-blue text-text-primary" : "bg-bg-secondary text-text-secondary"}`}>{n}</button>
              ))}
            </div>
          </div>
          <button onClick={startTest} disabled={loading || !subject || !topic.trim()} className="btn-primary text-sm">
            {loading ? "..." : t(lang, "startTest") || "Start Test"}
          </button>
        </div>
      )}

      {/* In-progress test */}
      {!done && questions.length > 0 && currentQ < questions.length && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-muted">{lang === "af" ? "Vraag" : "Question"} {currentQ + 1} / {questions.length}</div>
            <div className="text-xs text-text-muted">{lang === "af" ? "Punte" : "Score"}: {score}/{currentQ + (answered ? 1 : 0)}</div>
          </div>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded ${i < currentQ ? "bg-accent-green" : i === currentQ ? "bg-accent-blue" : "bg-border"}`} />
            ))}
          </div>

          <p className="text-sm font-medium">{questions[currentQ].question}</p>

          <div className="space-y-2">
            {questions[currentQ].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={answered}
                className={`w-full text-left p-3 rounded-card border text-sm transition-colors ${
                  answered
                    ? i === questions[currentQ].correct
                      ? "border-accent-green bg-accent-green/10"
                      : i === selectedAnswer && !lastCorrect
                      ? "border-accent-orange bg-accent-orange/10"
                      : "border-border opacity-50"
                    : "border-border hover:border-accent-blue"
                }`}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </div>

          {answered && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mascot state={lastCorrect ? "happy" : "sad"} size={50} />
                <p className={`text-sm ${lastCorrect ? "text-accent-green" : "text-accent-orange"}`}>
                  {lastCorrect
                    ? (lang === "af" ? "Korrek! Wel gedaan." : "Correct! Well done.")
                    : (lang === "af" ? "Nie heeltemal nie. " : "Not quite. ") + lastExplanation}
                </p>
              </div>
              <button onClick={nextQuestion} className="btn-primary text-sm">
                {currentQ + 1 >= questions.length
                  ? (lang === "af" ? "Sien Resultate" : "View Results")
                  : t(lang, "nextQuestion") || "Next Question"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Test results */}
      {done && (
        <div className="card p-5 space-y-4 text-center">
          <Mascot
            state={scorePercent >= 80 ? "happy" : scorePercent >= 50 ? "neutral" : "sad"}
            size={80}
            message={
              scorePercent >= 80
                ? (lang === "af" ? "Uitstekende werk!" : "Excellent work!")
                : scorePercent >= 50
                ? (lang === "af" ? "Goeie moeite. Hersien die wat jy verkeerd gehad het." : "Good effort. Review the ones you got wrong.")
                : (lang === "af" ? "Moenie moed opgee nie. Kom ons werk hieraan in die tutor." : "Don't give up. Let's work through this in the tutor.")
            }
          />
          <div className="text-3xl font-bold">{score} / {questions.length}</div>
          <div className="text-lg font-semibold" style={{ color: scorePercent >= 80 ? "#1cdb19" : scorePercent >= 50 ? "#121bde" : "#d72d02" }}>{scorePercent}%</div>
          <button onClick={() => { setQuestions([]); setDone(false); setScore(0); }} className="btn-secondary text-sm">
            {lang === "af" ? "Nog 'n Toets" : "Another Test"}
          </button>
        </div>
      )}
    </div>
  );
}
