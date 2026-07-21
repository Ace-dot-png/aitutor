"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { Mascot } from "@/components/mascot/Mascot";

const BENCHMARKS: Record<number, number> = {
  1: 45, 2: 70, 3: 95, 4: 120, 5: 140, 6: 160,
  7: 180, 8: 200, 9: 220, 10: 240, 11: 260, 12: 280,
};

interface ReadingData {
  title: string;
  passage: string;
  questions: string[];
}

interface FeedbackData {
  feedback: string;
  results: { question: number; correct: boolean; feedback: string }[];
}

type SpeedResult = 'excellent' | 'good' | 'ontrack' | 'needspractice';

interface SpeedTestState {
  phase: 'idle' | 'ready' | 'running' | 'done';
  passage: string;
  lines: string[];
  currentLine: number;
  wpm: number;
  startTime: number;
  totalWords: number;
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

  const grade = user?.grade?.replace("G", "") || "10";
  const gradeNum = parseInt(grade) || 10;

  // === SPEED TEST STATE ===
  const [speed, setSpeed] = useState<SpeedTestState>({
    phase: 'idle', passage: '', lines: [], currentLine: 0,
    wpm: BENCHMARKS[Math.max(1, gradeNum - 2)] || 120, startTime: 0, totalWords: 0,
  });
  const [speedResult, setSpeedResult] = useState<{ wpm: number; result: SpeedResult; equivalentGrade: number } | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordsPerLine = typeof window !== 'undefined' && window.innerWidth < 640 ? 7 : 9;
  const defaultGrade = Math.max(1, gradeNum - 2);
  const defaultWpm = BENCHMARKS[defaultGrade] || 120;

  // === COMPREHENSION ===
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
          passage: reading.passage, questions: reading.questions, answers, grade, language: lang,
        }),
      });
      const data = await res.json();
      setFeedback(data);
    } catch {} finally { setLoading(false); }
  };

  const updateAnswer = (i: number, val: string) => {
    const a = [...answers];
    a[i] = val;
    setAnswers(a);
  };

  // === SPEED TEST LOGIC ===
  const splitLines = (text: string, words: number): string[] => {
    const allWords = text.split(/\s+/);
    const lines: string[] = [];
    for (let i = 0; i < allWords.length; i += words) {
      lines.push(allWords.slice(i, i + words).join(" "));
    }
    return lines;
  };

  const startSpeedTest = async () => {
    setLoading(true);
    setSpeedResult(null);
    try {
      const res = await fetch("/api/reading/speed-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, language: lang }),
      });
      const data = await res.json();
      const passage = data.passage || "";
      const lines = splitLines(passage, wordsPerLine);
      setSpeed({
        phase: 'ready', passage, lines, currentLine: 0,
        wpm: defaultWpm, startTime: 0, totalWords: passage.split(/\s+/).length,
      });
    } catch {} finally { setLoading(false); }
  };

  const beginReading = () => {
    const now = Date.now();
    setSpeed(s => ({ ...s, phase: 'running', startTime: now, currentLine: 1 }));
    scheduleNextLine(1, now);
  };

  const scheduleNextLine = (lineIndex: number, startTime: number) => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    setSpeed(s => {
      const secondsPerLine = (wordsPerLine / s.wpm) * 60;
      const elapsedMs = lineIndex * secondsPerLine * 1000;
      const delay = Math.max(0, elapsedMs - (Date.now() - startTime));
      revealTimer.current = setTimeout(() => revealLine(lineIndex + 1, startTime), delay);
      return s;
    });
  };

  const revealLine = (lineIndex: number, startTime: number) => {
    setSpeed(s => {
      if (lineIndex > s.lines.length) {
        endSpeedTest(startTime, s.totalWords);
        return s;
      }
      scheduleNextLine(lineIndex, startTime);
      return { ...s, currentLine: lineIndex };
    });
  };

  const endSpeedTest = (startTime: number, totalWords: number) => {
    const totalSec = (Date.now() - startTime) / 1000;
    const actualWPM = Math.round((totalWords / totalSec) * 60);
    const result = getSpeedResult(actualWPM);
    setSpeedResult({ wpm: actualWPM, result, equivalentGrade: getEquivalentGrade(actualWPM) });
    setSpeed(s => ({ ...s, phase: 'done' }));

    // Save to DB
    fetch("/api/reading/speed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wpm: actualWPM, grade }),
    }).catch(() => {});
  };

  const getSpeedResult = (wpm: number): SpeedResult => {
    if (wpm >= (BENCHMARKS[gradeNum] || 200)) return 'excellent';
    if (wpm >= (BENCHMARKS[Math.max(1, gradeNum - 1)] || 180)) return 'good';
    if (wpm >= (BENCHMARKS[Math.max(1, gradeNum - 2)] || 140)) return 'ontrack';
    return 'needspractice';
  };

  const getEquivalentGrade = (wpm: number): number => {
    for (let g = 12; g >= 1; g--) {
      if (wpm >= (BENCHMARKS[g] || 0)) return g;
    }
    return 1;
  };

  const adjustSpeed = (delta: number) => {
    setSpeed(s => {
      const newWpm = Math.min(400, Math.max(30, s.wpm + delta));
      if (s.phase === 'running') {
        scheduleNextLine(s.currentLine, s.startTime);
      }
      return { ...s, wpm: newWpm };
    });
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  const resetSpeedTest = () => {
    setSpeed({ phase: 'idle', passage: '', lines: [], currentLine: 0, wpm: defaultWpm, startTime: 0, totalWords: 0 });
    setSpeedResult(null);
  };

  const warningTooSlow = speed.phase === 'running' && speed.wpm < (BENCHMARKS[Math.max(1, gradeNum - 3)] || 60);

  const speedMascotPose = speedResult
    ? (speedResult.result === 'excellent' || speedResult.result === 'good' ? 'happy' as const
      : speedResult.result === 'ontrack' ? 'thinking' as const
      : 'gentle' as const)
    : 'greeting' as const;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">📖 {t(lang, "reading") || "Reading & Comprehension"}</h1>

      {/* ===== READING SPEED TEST ===== */}
      <div className="card p-5 border-accent-blue">
        <h2 className="text-sm font-semibold text-accent-blue mb-3">
          ⏱ {t(lang, "readingSpeedTest") || "Reading Speed Test"}
        </h2>

        {/* Phase: IDLE — start button */}
        {speed.phase === 'idle' && (
          <button onClick={startSpeedTest} disabled={loading} className="btn-primary text-sm">
            {loading ? "..." : t(lang, "startTest") || "Start Speed Test"}
          </button>
        )}

        {/* Phase: READY — show setup */}
        {speed.phase === 'ready' && (
          <div className="space-y-4">
            <div className="text-sm text-text-secondary">
              <span>{t(lang, "yourReadingLevel")}:</span>{' '}
              <span className="font-semibold text-accent-blue">{t(lang, "gradeLabel")} {defaultGrade} ({speed.wpm} {t(lang, "wpm")})</span>
              <span className="text-text-muted"> — {gradeNum - defaultGrade} {t(lang, "gradesBelow")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mascot pose="greeting" size={40} message={t(lang, "readyMessage")} />
            </div>
            <button onClick={beginReading} className="btn-primary text-sm">{t(lang, "startTest") || "Start"}</button>
          </div>
        )}

        {/* Phase: RUNNING — line-by-line reveal */}
        {(speed.phase === 'running' || speed.phase === 'ready') && (
          <div className="space-y-3">
            {/* Reading window */}
            <div
              className="bg-bg-secondary rounded-card overflow-hidden border border-border"
              style={{ height: speed.phase === 'running' ? 100 : 60 }}
            >
              <div className="p-4 space-y-1">
                {speed.lines.slice(
                  Math.max(0, speed.currentLine - 3),
                  speed.currentLine
                ).map((line, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed"
                    style={{
                      opacity: i === 0 ? 0.4 : i === 1 ? 0.8 : 1,
                      transition: 'opacity 0.3s',
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* Speed controls */}
            {speed.phase === 'running' && (
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => adjustSpeed(-20)} className="btn-secondary text-xs px-3 py-1">
                  ◀ {t(lang, "slower")}
                </button>
                <span className="text-sm font-semibold min-w-32 text-center">
                  {t(lang, "speedLabel")}: {speed.wpm} {t(lang, "wpm")}
                </span>
                <button onClick={() => adjustSpeed(20)} className="btn-secondary text-xs px-3 py-1">
                  {t(lang, "faster")} ▶
                </button>
              </div>
            )}

            {/* Progress */}
            <div className="text-xs text-text-muted text-center">
              {t(lang, "lineProgress")} {speed.currentLine} {t(lang, "of")} {speed.lines.length}
            </div>

            {/* Warning */}
            {warningTooSlow && (
              <div className="text-xs text-accent-orange text-center bg-accent-orange/5 py-2 rounded">
                ⚠️ {t(lang, "warningTooSlow")}
              </div>
            )}
          </div>
        )}

        {/* Phase: DONE — results */}
        {speed.phase === 'done' && speedResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Mascot pose={speedMascotPose} size={60} />
              <div>
                <div className="text-lg font-semibold">{speedResult.wpm} {t(lang, "wpm")}</div>
                <div className="text-sm text-text-secondary">
                  {speedResult.result === 'excellent' && (lang === "af" ? "Uitstekend!" : "Excellent!")}
                  {speedResult.result === 'good' && (lang === "af" ? "Goed gedaan!" : "Good work!")}
                  {speedResult.result === 'ontrack' && (lang === "af" ? "Op koers" : "On track")}
                  {speedResult.result === 'needspractice' && (lang === "af" ? "Oefening nodig" : "Needs practice")}
                </div>
                <div className="text-xs text-text-muted">
                  {t(lang, "gradeLevelEquivalent")}: {t(lang, "gradeLabel")} {speedResult.equivalentGrade}
                </div>
              </div>
            </div>
            <p className="text-sm text-text-secondary">
              {t(lang, speedResult.result === 'excellent' ? 'resultExcellent'
                : speedResult.result === 'good' ? 'resultGood'
                : speedResult.result === 'ontrack' ? 'resultOnTrack'
                : 'resultNeedsPractice')}
            </p>
            <div className="flex gap-2">
              <button onClick={resetSpeedTest} className="btn-secondary text-xs">{t(lang, "tryAgain")}</button>
              <a href="/student/reading" className="btn-secondary text-xs">{t(lang, "goToReading")}</a>
            </div>
          </div>
        )}
      </div>

      {/* ===== COMPREHENSION SECTION ===== */}
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
            <button onClick={submitAnswers} disabled={loading || answers.some((a) => !a.trim())} className="btn-primary text-sm">
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
