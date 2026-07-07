"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { Mascot } from "@/components/mascot/Mascot";

interface ReadingData {
  title: string;
  passage: string;
  questions: string[];
}

interface FeedbackData {
  feedback: string;
  results: { question: number; correct: boolean; feedback: string }[];
}

export default function ReadingPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { lang } = useLang();

  const [topic, setTopic] = useState("");
  const [reading, setReading] = useState<ReadingData | null>(null);
  const [answers, setAnswers] = useState<string[]>(["", "", "", "", ""]);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [speedMode, setSpeedMode] = useState(false);
  const [speedStarted, setSpeedStarted] = useState(false);
  const [speedDone, setSpeedDone] = useState(false);
  const [speedResult, setSpeedResult] = useState<any>(null);
  const startTimeRef = useRef<number>(0);

  const grade = user?.grade?.replace("G", "") || "10";

  const generateReading = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setFeedback(null);
    setAnswers(["", "", "", "", ""]);
    try {
      const res = await fetch("/api/reading/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), grade, language: lang }),
      });
      const data = await res.json();
      setReading(data);
    } catch {} finally { setLoading(false); }
  };

  const submitAnswers = async () => {
    if (!reading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reading/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: reading.passage,
          questions: reading.questions,
          answers,
          grade,
          language: lang,
        }),
      });
      const data = await res.json();
      setFeedback(data);
    } catch {} finally { setLoading(false); }
  };

  const startSpeedTest = () => {
    setSpeedMode(true);
    // Generate a short passage for speed test
    setTopic("speed_test");
    setLoading(true);
    fetch("/api/reading/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "South African animals", grade, language: lang }),
    })
      .then((r) => r.json())
      .then((data) => { setReading(data); setLoading(false); });
  };

  const beginReading = () => {
    setSpeedStarted(true);
    startTimeRef.current = Date.now();
  };

  const finishReading = () => {
    const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
    const wordCount = reading?.passage?.split(/\s+/).length || 0;
    const wpm = Math.round((wordCount / elapsedSec) * 60);
    setSpeedDone(true);

    fetch("/api/reading/speed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wpm, grade }),
    })
      .then((r) => r.json())
      .then(setSpeedResult);
  };

  const updateAnswer = (i: number, val: string) => {
    const a = [...answers];
    a[i] = val;
    setAnswers(a);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">📖 {t(lang, "reading") || "Reading & Comprehension"}</h1>

      {/* Reading Speed Test */}
      <div className="card p-5 border-accent-blue">
        <h2 className="text-sm font-semibold text-accent-blue mb-3">⏱ {t(lang, "readingSpeedTest") || "Reading Speed Test"}</h2>
        {!speedMode && (
          <button onClick={startSpeedTest} className="btn-primary text-sm">
            {t(lang, "startTest") || "Start Speed Test"}
          </button>
        )}
        {speedMode && reading && !speedStarted && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">{lang === "af" ? "Lees die volgende teks so vinnig as moontlik. Klik 'Klaar' wanneer jy klaar is." : "Read the following text as quickly as you can. Click 'Done' when you're finished."}</p>
            <button onClick={beginReading} className="btn-primary text-sm">{lang === "af" ? "Begin Lees" : "Start Reading"}</button>
          </div>
        )}
        {speedStarted && !speedDone && (
          <div className="space-y-3">
            <div className="bg-bg-secondary p-4 rounded-card text-sm leading-relaxed max-h-60 overflow-y-auto">
              {reading?.passage}
            </div>
            <button onClick={finishReading} className="btn-primary text-sm">{lang === "af" ? "Klaar!" : "Done!"}</button>
          </div>
        )}
        {speedDone && speedResult && (
          <div className="flex items-center gap-4">
            <Mascot pose={speedResult.rating === "excellent" ? "excited" : speedResult.rating === "good" ? "encouraging" : "gentle"} size={60} />
            <div>
              <div className="text-lg font-semibold">{speedResult.wpm} WPM</div>
              <div className="text-sm text-text-secondary">
                {speedResult.rating === "excellent" ? (lang === "af" ? "Uitstekend!" : "Excellent!")
                  : speedResult.rating === "good" ? (lang === "af" ? "Goed!" : "Good!")
                  : (lang === "af" ? "Oefen meer" : "Keep practising")}
              </div>
              <div className="text-xs text-text-muted">{lang === "af" ? "Verwagte reeks" : "Expected range"}: {speedResult.benchmarkLow}-{speedResult.benchmarkHigh} WPM</div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Reading */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-3">{t(lang, "startReading") || "Generate a Reading"}</h2>
        <div className="flex gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={lang === "af" ? "Onderwerp (bv. dinosourusse)" : "Topic (e.g. dinosaurs)"}
            className="input-field flex-1"
            onKeyDown={(e) => e.key === "Enter" && generateReading()}
          />
          <button onClick={generateReading} disabled={loading || !topic.trim()} className="btn-primary text-sm">
            {loading ? "..." : lang === "af" ? "Genereer" : "Generate"}
          </button>
        </div>
      </div>

      {/* Reading Display */}
      {reading && (
        <div className="card p-5 space-y-4">
          <h3 className="text-lg font-semibold">{reading.title}</h3>
          <div className="text-sm leading-relaxed bg-bg-secondary p-4 rounded-card whitespace-pre-wrap">
            {reading.passage}
          </div>

          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            {lang === "af" ? "Begripsvrae" : "Comprehension Questions"}
          </h3>

          {reading.questions.map((q, i) => (
            <div key={i} className="space-y-2">
              <p className="text-sm font-medium">{i + 1}. {q}</p>
              <textarea
                value={answers[i]}
                onChange={(e) => updateAnswer(i, e.target.value)}
                className="input-field w-full text-sm"
                rows={2}
                placeholder={lang === "af" ? "Jou antwoord..." : "Your answer..."}
                disabled={!!feedback}
              />
              {feedback?.results[i] && (
                <div className={`text-xs p-2 rounded ${feedback.results[i].correct ? "bg-accent-green/10 text-accent-green" : "bg-accent-orange/10 text-accent-orange"}`}>
                  {feedback.results[i].correct ? "✓ " : "✗ "}{feedback.results[i].feedback}
                </div>
              )}
            </div>
          ))}

          {!feedback && (
            <button
              onClick={submitAnswers}
              disabled={loading || answers.some((a) => !a.trim())}
              className="btn-primary text-sm"
            >
              {loading ? "..." : lang === "af" ? "Dien Antwoorde in" : "Submit Answers"}
            </button>
          )}

          {feedback && (
            <div className="bg-bg-secondary p-4 rounded-card">
              <p className="text-sm leading-relaxed">{feedback.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
