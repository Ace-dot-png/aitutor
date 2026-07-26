"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { Mascot } from "@/components/mascot/Mascot";
import { ThreeTryQuestion } from "@/components/questions/ThreeTryQuestion";

const TOPICS = [
  { key: 'bonds', label: 'Number Bonds', labelAf: 'Getalbinding', icon: '🔗', desc: 'Bonds to 10, 20, 100', descAf: 'Binding tot 10, 20, 100' },
  { key: 'timestables', label: 'Times Tables', labelAf: 'Maaltafels', icon: '✖️', desc: 'Multiplication tables', descAf: 'Vermenigvuldigingstafels' },
  { key: 'division', label: 'Long Division', labelAf: 'Langdeling', icon: '➗', desc: 'Division with steps', descAf: 'Deling met stappe' },
  { key: 'exponents', label: 'Exponents', labelAf: 'Eksponente', icon: 'ⁿ', desc: 'Squares, cubes, powers', descAf: 'Kwadrate, derdemagte, magte' },
];

interface MathsQuestion {
  question: string;
  answer: string;
  hint: string;
}

export default function MathsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { lang } = useLang();

  const grade = user?.grade?.replace("G", "") || "10";
  const gradeNum = parseInt(grade) || 10;

  const [activeTopic, setActiveTopic] = useState("");
  const [questions, setQuestions] = useState<MathsQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ solved: boolean; attempts: number }[]>([]);

  const startTopic = async (topicKey: string) => {
    setLoading(true);
    setActiveTopic(topicKey);
    setDone(false);
    setCurrentQ(0);
    setAnswer("");
    setAttempts(0);
    setSolved(false);
    setRevealed(false);
    setScore(0);
    setResults([]);
    try {
      const res = await fetch("/api/maths/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: topicKey, grade, count: 10, language: lang }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = (ans: string) => {
    const correct = ans.trim().toLowerCase() === (questions[currentQ]?.answer || "").trim().toLowerCase();
    setAttempts(prev => prev + 1);
    if (correct || attempts >= 2) {
      if (correct) {
        setSolved(true);
        setScore(prev => prev + 1);
        setResults(prev => [...prev, { solved: true, attempts: attempts + 1 }]);
      } else {
        setRevealed(true);
        setResults(prev => [...prev, { solved: false, attempts: 3 }]);
      }
    }
  };

  const handleNext = (wasSolved: boolean, att: number) => {
    if (currentQ + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrentQ(prev => prev + 1);
      setAnswer("");
      setAttempts(0);
      setSolved(false);
      setRevealed(false);
    }
  };

  const reset = () => {
    setActiveTopic("");
    setQuestions([]);
    setDone(false);
    setCurrentQ(0);
    setScore(0);
    setResults([]);
  };

  const topic = TOPICS.find(t => t.key === activeTopic);
  const topicLabel = topic ? (lang === "af" ? topic.labelAf : topic.label) : "";

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">🧮 {lang === "af" ? "Wiskunde Oefening" : "Maths Practice"}</h1>

      {!activeTopic && (
        <div className="grid grid-cols-2 gap-4">
          {TOPICS.map(t => (
            <div
              key={t.key}
              onClick={() => startTopic(t.key)}
              className="card p-5 cursor-pointer hover:border-accent-blue transition-colors"
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-sm font-semibold">{lang === "af" ? t.labelAf : t.label}</div>
              <div className="text-xs text-text-muted mt-1">
                {lang === "af" ? t.descAf : t.desc} · {lang === "af" ? "Graad" : "Grade"} {gradeNum}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTopic && !done && questions.length > 0 && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{topicLabel} — {lang === "af" ? "Graad" : "Grade"} {gradeNum}</div>
            <button onClick={reset} className="text-xs text-text-muted hover:text-text-secondary">
              {lang === "af" ? "← Terug" : "← Back"}
            </button>
          </div>

          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded ${i < currentQ ? "bg-accent-green" : i === currentQ ? "bg-accent-blue" : "bg-border"}`} />
            ))}
          </div>

          <ThreeTryQuestion
            questionNumber={currentQ + 1}
            totalQuestions={questions.length}
            question={questions[currentQ]?.question || ""}
            answerInput={answer}
            setAnswerInput={setAnswer}
            hint={questions[currentQ]?.hint}
            correctAnswer={questions[currentQ]?.answer}
            attempts={attempts}
            solved={solved}
            revealed={revealed}
            onSubmit={handleSubmit}
            onNext={handleNext}
          />
        </div>
      )}

      {done && (
        <div className="card p-5 space-y-4 text-center">
          <Mascot
            pose={score >= 8 ? "excited" : score >= 5 ? "encouraging" : "gentle"}
            size={80}
            message={
              score >= 8
                ? (lang === "af" ? "Uitstekend!" : "Excellent!")
                : score >= 5
                ? (lang === "af" ? "Goed gedaan! Hou aan oefen." : "Good work! Keep practising.")
                : (lang === "af" ? "Moenie moed opgee nie. Oefen verder." : "Don't give up. Keep practising.")
            }
          />
          <div className="text-3xl font-bold">{score} / {questions.length}</div>
          <div className="text-lg font-semibold" style={{ color: score >= 8 ? "#1cdb19" : score >= 5 ? "#121bde" : "#d72d02" }}>
            {Math.round((score / questions.length) * 100)}%
          </div>
          <p className="text-sm text-text-muted">{topicLabel} · {lang === "af" ? "Graad" : "Grade"} {gradeNum}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => startTopic(activeTopic)} className="btn-secondary text-sm">
              {lang === "af" ? "Probeer Weer" : "Try Again"}
            </button>
            <button onClick={reset} className="btn-secondary text-sm">
              {lang === "af" ? "Ander Onderwerp" : "Another Topic"}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-text-muted">
          {lang === "af" ? "Besig om vrae te genereer..." : "Generating questions..."}
        </div>
      )}
    </div>
  );
}
