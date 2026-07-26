"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { Mascot } from "@/components/mascot/Mascot";
import { ThreeTryQuestion } from "@/components/questions/ThreeTryQuestion";

const WPM_BENCHMARKS: Record<number, number> = {
  1: 45, 2: 70, 3: 95, 4: 120, 5: 140, 6: 160,
  7: 180, 8: 200, 9: 220, 10: 240, 11: 260, 12: 280,
};

interface ComprehensionData {
  title: string;
  passage: string;
  questions: string[];
}

type SpeedTestPhase = 'idle' | 'ready' | 'reading' | 'questions' | 'done';

export default function ReadingPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { lang } = useLang();

  const grade = user?.grade?.replace("G", "") || "10";
  const gradeNum = parseInt(grade) || 10;
  const targetGrade = Math.max(1, gradeNum - 2);
  const targetWPM = WPM_BENCHMARKS[targetGrade] || 120;

  // Comprehension
  const [topic, setTopic] = useState("");
  const [reading, setReading] = useState<ComprehensionData | null>(null);
  const [answers, setAnswers] = useState<string[]>(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  // Comprehension 3-try state
  const [compCurrentQ, setCompCurrentQ] = useState(0);
  const [compAnswer, setCompAnswer] = useState("");
  const [compAttempts, setCompAttempts] = useState(0);
  const [compSolved, setCompSolved] = useState(false);
  const [compRevealed, setCompRevealed] = useState(false);
  const [compResults, setCompResults] = useState<{ solved: boolean; attempts: number }[]>([]);

  // Speed test state
  const [speedPhase, setSpeedPhase] = useState<SpeedTestPhase>('idle');
  const [speedTopic, setSpeedTopic] = useState("");
  const [speedText, setSpeedText] = useState("");
  const [speedLines, setSpeedLines] = useState<string[]>([]);
  const [speedCurrentLine, setSpeedCurrentLine] = useState(0);
  const [speedWPM, setSpeedWPM] = useState(targetWPM);
  const [speedTimestamps, setSpeedTimestamps] = useState<{ time: number; forced: boolean }[]>([]);
  const [speedQuestions, setSpeedQuestions] = useState<string[]>([]);
  const [speedHints, setSpeedHints] = useState<string[]>([]);
  const [speedResult, setSpeedResult] = useState<{ wpm: number; result: string; comprehension: number; equivalentGrade: number } | null>(null);

  // Speed 3-try state
  const [sqCurrentQ, setSqCurrentQ] = useState(0);
  const [sqAnswer, setSqAnswer] = useState("");
  const [sqAttempts, setSqAttempts] = useState(0);
  const [sqSolved, setSqSolved] = useState(false);
  const [sqRevealed, setSqRevealed] = useState(false);
  const [sqCorrect, setSqCorrect] = useState(0);

  const forceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordsPerLine = typeof window !== 'undefined' && window.innerWidth < 640 ? 6 : 8;

  // Cleanup
  useEffect(() => () => { if (forceTimer.current) clearTimeout(forceTimer.current); }, []);

  // ===== SPEED TEST =====
  const startSpeedTest = async () => {
    setLoading(true);
    setSpeedResult(null);
    try {
      const res = await fetch("/api/reading/speed-text", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, language: lang, topic: speedTopic.trim() || undefined }),
      });
      const data = await res.json();
      const passage = data.passage || "";
      const lines = splitLines(passage, wordsPerLine);
      setSpeedText(passage);
      setSpeedLines(lines);
      setSpeedQuestions(data.questions || []);
      setSpeedHints(data.hints || []);
      setSpeedCurrentLine(0);
      setSpeedTimestamps([]);
      setSqCurrentQ(0);
      setSqCorrect(0);
      setSpeedPhase('ready');
    } catch {} finally { setLoading(false); }
  };

  const splitLines = (text: string, words: number): string[] => {
    const allWords = text.split(/\s+/);
    const lines: string[] = [];
    for (let i = 0; i < allWords.length; i += words) {
      lines.push(allWords.slice(i, i + words).join(" "));
    }
    return lines;
  };

  const beginReading = () => {
    const now = Date.now();
    setSpeedPhase('reading');
    setSpeedCurrentLine(1);
    setSpeedTimestamps([{ time: now, forced: false }]);
    startForceTimer(1, now);
  };

  const startForceTimer = (lineIndex: number, startTime: number) => {
    if (forceTimer.current) clearTimeout(forceTimer.current);
    const secondsPerLine = (wordsPerLine / speedWPM) * 60;
    const elapsedMs = lineIndex * secondsPerLine * 1000;
    const delay = Math.max(0, elapsedMs - (Date.now() - startTime));
    forceTimer.current = setTimeout(() => handleNextLine(lineIndex + 1, startTime, true), delay);
  };

  const handleNextLine = (lineIndex: number, startTime: number, forced: boolean) => {
    setSpeedTimestamps(prev => [...prev, { time: Date.now(), forced }]);
    if (lineIndex > speedLines.length) {
      endReadingPhase(startTime);
      return;
    }
    setSpeedCurrentLine(lineIndex);
    startForceTimer(lineIndex, startTime);
  };

  const advanceLine = () => {
    if (forceTimer.current) clearTimeout(forceTimer.current);
    handleNextLine(speedCurrentLine + 1, speedTimestamps[0]?.time || Date.now(), false);
  };

  const adjustSpeed = (delta: number) => {
    const newWPM = Math.min(400, Math.max(30, speedWPM + delta));
    setSpeedWPM(newWPM);
    if (speedPhase === 'reading') {
      startForceTimer(speedCurrentLine, speedTimestamps[0]?.time || Date.now());
    }
  };

  const endReadingPhase = (startTime: number) => {
    const timestamps = speedTimestamps;
    const totalSec = (timestamps[timestamps.length - 1]?.time - startTime) / 1000;
    const totalWords = speedText.split(/\s+/).length;
    const actualWPM = Math.round((totalWords / totalSec) * 60);
    setSpeedResult(prev => ({ ...prev, wpm: actualWPM } as any));
    setSpeedPhase('questions');
  };

  // Speed question 3-try handlers
  const handleSqSubmit = (answer: string) => {
    // Grade answer as correct/incorrect via simple heuristic or API
    setSqAttempts(prev => prev + 1);
    // Simulate correctness for now - in production this would call an API
    const isCorrect = answer.trim().length > 5; // placeholder
    if (isCorrect || sqAttempts >= 2) {
      if (isCorrect) {
        setSqSolved(true);
        setSqCorrect(prev => prev + 1);
      } else {
        setSqRevealed(true);
      }
    }
  };

  const handleSqNext = (solved: boolean, attempts: number) => {
    if (sqCurrentQ + 1 >= speedQuestions.length) {
      finishSpeedTest();
    } else {
      setSqCurrentQ(prev => prev + 1);
      setSqAnswer("");
      setSqAttempts(0);
      setSqSolved(false);
      setSqRevealed(false);
    }
  };

  const finishSpeedTest = () => {
    const actualWPM = speedResult?.wpm || 0;
    const comprehension = sqCorrect / (speedQuestions.length || 1);
    const speedRatio = actualWPM / (WPM_BENCHMARKS[gradeNum] || 200);
    const forcedLines = speedTimestamps.filter(t => t.forced).length;
    const forcedPercent = speedLines.length > 0 ? (forcedLines / speedLines.length) * 100 : 0;
    const forcePenalty = forcedPercent > 50 ? 0.3 : forcedPercent > 25 ? 0.15 : 0;
    const finalScore = (speedRatio * 0.6 + comprehension * 0.4) - forcePenalty;

    let result: string;
    if (finalScore >= 1.0) result = 'excellent';
    else if (finalScore >= 0.7) result = 'good';
    else if (finalScore >= 0.5) result = 'ontrack';
    else result = 'needspractice';

    let eqGrade = 1;
    for (let g = 12; g >= 1; g--) {
      if (actualWPM >= (WPM_BENCHMARKS[g] || 0)) { eqGrade = g; break; }
    }

    setSpeedResult({ wpm: actualWPM, result, comprehension: sqCorrect, equivalentGrade: eqGrade });
    setSpeedPhase('done');

    fetch("/api/reading/speed", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wpm: actualWPM, grade }),
    }).catch(() => {});
  };

  const resetSpeed = () => {
    setSpeedPhase('idle');
    setSpeedText("");
    setSpeedLines([]);
    setSpeedResult(null);
    setSpeedCurrentLine(0);
    setSpeedWPM(targetWPM);
  };

  // ===== COMPREHENSION =====
  const generateReading = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setCompResults([]);
    setCompCurrentQ(0);
    setCompSolved(false);
    setCompRevealed(false);
    try {
      const res = await fetch("/api/reading/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), grade, language: lang }),
      });
      const data = await res.json();
      setReading(data);
      setAnswers(["", "", "", "", ""]);
    } catch {} finally { setLoading(false); }
  };

  const handleCompSubmit = (answer: string) => {
    setCompAttempts(prev => prev + 1);
    // Simple heuristic — in production call grading API
    const isCorrect = answer.trim().length > 3;
    if (isCorrect || compAttempts >= 2) {
      if (isCorrect) {
        setCompSolved(true);
        setCompResults(prev => [...prev, { solved: true, attempts: compAttempts + 1 }]);
      } else {
        setCompRevealed(true);
        setCompResults(prev => [...prev, { solved: false, attempts: 3 }]);
      }
    }
  };

  const handleCompNext = (solved: boolean, attempts: number) => {
    if (compCurrentQ + 1 >= (reading?.questions.length || 0)) {
      setCompResults(prev => [...prev, { solved, attempts }]);
    } else {
      setCompCurrentQ(prev => prev + 1);
      setCompAnswer("");
      setCompAttempts(0);
      setCompSolved(false);
      setCompRevealed(false);
    }
  };

  const warningSlow = speedPhase === 'reading' && speedWPM < (WPM_BENCHMARKS[Math.max(1, gradeNum - 3)] || 60);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">📖 {t(lang, "reading") || "Reading & Comprehension"}</h1>

      {/* ===== SPEED TEST ===== */}
      <div className="card p-5 border-accent-blue">
        <h2 className="text-sm font-semibold text-accent-blue mb-3">
          ⏱ {t(lang, "readingSpeedTest") || "Reading Speed Test"}
        </h2>

        {speedPhase === 'idle' && (
          <div className="space-y-3">
            <input value={speedTopic} onChange={e => setSpeedTopic(e.target.value)}
              placeholder={lang === "af" ? "Onderwerp (bv. dinosourusse)" : "Topic (e.g. dinosaurs)"}
              className="input-field w-full"
              onKeyDown={e => e.key === "Enter" && startSpeedTest()} />
            <button onClick={startSpeedTest} disabled={loading} className="btn-primary text-sm">
              {loading ? "..." : t(lang, "startTest") || "Start Speed Test"}
            </button>
          </div>
        )}

        {speedPhase === 'ready' && (
          <div className="space-y-4">
            <div className="text-sm text-text-secondary">
              {t(lang, "yourReadingLevel")}: Grade {targetGrade} ({speedWPM} wpm)
              <span className="text-text-muted"> — {gradeNum - targetGrade} {t(lang, "gradesBelow")}</span>
            </div>
            <Mascot pose="greeting" size={40} message={t(lang, "readyMessage")} />
            <button onClick={beginReading} className="btn-primary text-sm">{t(lang, "startTest") || "Start"}</button>
          </div>
        )}

        {speedPhase === 'reading' && (
          <div className="space-y-3">
            <div className="bg-bg-secondary rounded-card overflow-hidden border border-border" style={{ height: 80 }}>
              <div className="p-4 flex items-center justify-center h-full">
                <p className="text-lg leading-relaxed text-center">
                  {speedLines[speedCurrentLine - 1] || ""}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => adjustSpeed(-20)} className="btn-secondary text-xs px-3 py-1">
                ◀ {t(lang, "slower")}
              </button>
              <span className="text-sm font-semibold min-w-24 text-center">
                {t(lang, "speedLabel")}: {speedWPM} {t(lang, "wpm")}
              </span>
              <button onClick={() => adjustSpeed(20)} className="btn-secondary text-xs px-3 py-1">
                {t(lang, "faster")} ▶
              </button>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={advanceLine} className="btn-primary text-sm">
                {lang === "af" ? "Volgende Lyn" : "Next Line"} (Enter)
              </button>
            </div>
            <div className="text-xs text-text-muted text-center">
              {t(lang, "lineProgress")} {speedCurrentLine} {t(lang, "of")} {speedLines.length}
            </div>
            {warningSlow && (
              <div className="text-xs text-accent-orange text-center">{t(lang, "warningTooSlow")}</div>
            )}
          </div>
        )}

        {speedPhase === 'questions' && speedQuestions.length > 0 && (
          <div className="card p-4 space-y-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              {lang === "af" ? "Begripsvrae" : "Comprehension Questions"}
            </h3>
            <ThreeTryQuestion
              questionNumber={sqCurrentQ + 1}
              totalQuestions={speedQuestions.length}
              question={speedQuestions[sqCurrentQ] || ""}
              answerInput={sqAnswer}
              setAnswerInput={setSqAnswer}
              hint={speedHints[sqCurrentQ]}
              attempts={sqAttempts}
              solved={sqSolved}
              revealed={sqRevealed}
              onSubmit={handleSqSubmit}
              onNext={handleSqNext}
            />
          </div>
        )}

        {speedPhase === 'done' && speedResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Mascot pose={
                speedResult.result === 'excellent' || speedResult.result === 'good' ? 'excited'
                : speedResult.result === 'ontrack' ? 'encouraging' : 'gentle'
              } size={60} />
              <div>
                <div className="text-lg font-semibold">{speedResult.wpm} {t(lang, "wpm")}</div>
                <div className="text-xs text-text-muted">
                  {t(lang, "gradeLevelEquivalent")}: {t(lang, "gradeLabel")} {speedResult.equivalentGrade}
                </div>
                <div className="text-xs text-text-muted">
                  {lang === "af" ? "Begrip" : "Comprehension"}: {speedResult.comprehension}/{speedQuestions.length}
                </div>
              </div>
            </div>
            <p className="text-sm text-text-secondary">
              {speedResult.result === 'excellent' && (lang === "af" ? "Uitstekend! Jy lees op of bo jou graadvlak." : "Excellent! You are reading at or above your grade level.")}
              {speedResult.result === 'good' && (lang === "af" ? "Goed gedaan! Jou leeswerk kom mooi aan." : "Good work! Your reading is coming along well.")}
              {speedResult.result === 'ontrack' && (lang === "af" ? "Jy maak vordering. Hou aan oefen." : "You are making progress. Keep practising.")}
              {speedResult.result === 'needspractice' && (lang === "af" ? "Jou leeswerk het oefening nodig." : "Your reading needs some practice.")}
            </p>
            <div className="flex gap-2">
              <button onClick={resetSpeed} className="btn-secondary text-xs">{t(lang, "tryAgain")}</button>
              <a href="/student/reading" className="btn-secondary text-xs">{t(lang, "goToReading")}</a>
            </div>
          </div>
        )}
      </div>

      {/* ===== COMPREHENSION ===== */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-3">{t(lang, "startReading") || "Generate a Reading"}</h2>
        <div className="flex gap-2">
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder={lang === "af" ? "Onderwerp (bv. dinosourusse)" : "Topic (e.g. dinosaurs)"}
            className="input-field flex-1"
            onKeyDown={e => e.key === "Enter" && generateReading()} />
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

          {reading.questions.length > 0 && compCurrentQ < reading.questions.length && (
            <ThreeTryQuestion
              questionNumber={compCurrentQ + 1}
              totalQuestions={reading.questions.length}
              question={reading.questions[compCurrentQ]}
              answerInput={compAnswer}
              setAnswerInput={setCompAnswer}
              attempts={compAttempts}
              solved={compSolved}
              revealed={compRevealed}
              onSubmit={handleCompSubmit}
              onNext={handleCompNext}
            />
          )}

          {compResults.length >= (reading?.questions.length || 1) && (
            <div className="bg-bg-secondary p-4 rounded-card space-y-2">
              <p className="text-sm font-semibold">{lang === "af" ? "Resultate" : "Results"}</p>
              <p className="text-sm text-text-secondary">
                {lang === "af" ? "Jy het" : "You got"} {compResults.filter(r => r.solved).length} / {reading.questions.length} {lang === "af" ? "korrek" : "correct"}
              </p>
              <button onClick={() => {
                setCompResults([]);
                setCompCurrentQ(0);
                setCompAnswer("");
                setCompAttempts(0);
                setCompSolved(false);
                setCompRevealed(false);
                setReading(null);
              }} className="btn-secondary text-xs">{t(lang, "tryAgain")}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
