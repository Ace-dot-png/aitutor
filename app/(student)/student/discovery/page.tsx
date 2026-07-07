"use client"
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { Mascot } from "@/components/mascot/Mascot";

const QUESTIONS = [
  { question: "When you are trying to remember something new, you prefer to:",
    options: [
      { text: "Draw a diagram or write it down with colours", style: "visual" },
      { text: "Say it out loud or explain it to someone", style: "auditory" },
      { text: "Act it out or connect it to something physical", style: "kinesthetic" }
    ] },
  { question: "When you get lost somewhere new, you:",
    options: [
      { text: "Look at a map or use visual landmarks", style: "visual" },
      { text: "Ask someone for directions and listen carefully", style: "auditory" },
      { text: "Just explore and find your way by moving around", style: "kinesthetic" }
    ] },
  { question: "Your favourite way to study for a test is:",
    options: [
      { text: "Reading notes, using highlighters, and making mind maps", style: "visual" },
      { text: "Reading aloud, discussing with a friend, or listening to recordings", style: "auditory" },
      { text: "Writing practice questions, doing examples, or moving while studying", style: "kinesthetic" }
    ] },
  { question: "In class, you learn best when the teacher:",
    options: [
      { text: "Shows diagrams, videos, or writes on the board", style: "visual" },
      { text: "Explains things clearly and you can listen and ask questions", style: "auditory" },
      { text: "Does practical activities and lets you try things yourself", style: "kinesthetic" }
    ] },
  { question: "When you read a long passage, you:",
    options: [
      { text: "Highlight key words and draw connections between ideas", style: "visual" },
      { text: "Read it aloud or in your head as if someone is speaking", style: "auditory" },
      { text: "Take notes as you go and summarise in your own words", style: "kinesthetic" }
    ] },
  { question: "You tend to remember people by:",
    options: [
      { text: "Their face and what they looked like", style: "visual" },
      { text: "Their name and the sound of their voice", style: "auditory" },
      { text: "What you did together or how they made you feel", style: "kinesthetic" }
    ] },
  { question: "When you are bored in class, you tend to:",
    options: [
      { text: "Doodle or look around at things", style: "visual" },
      { text: "Hum, talk to yourself, or listen to something in your head", style: "auditory" },
      { text: "Fidget, tap your foot, or want to move around", style: "kinesthetic" }
    ] },
  { question: "When learning something completely new, you prefer:",
    options: [
      { text: "Seeing a demonstration or watching a video first", style: "visual" },
      { text: "Having someone explain it step by step while you listen", style: "auditory" },
      { text: "Jumping in and trying it yourself, learning as you go", style: "kinesthetic" }
    ] },
];

const STUDY_METHODS: Record<string, { title: string; tip: string }[]> = {
  visual: [
    { title: "Mind Mapping", tip: "Draw your notes as a visual map with branches for each idea." },
    { title: "Colour Coding", tip: "Use different colours for different subjects or types of information." },
    { title: "Flashcards", tip: "Make visual flashcards with diagrams on one side, explanations on the other." },
    { title: "Watch Before Reading", tip: "Find a short video on the topic before reading about it." },
  ],
  auditory: [
    { title: "Read Aloud", tip: "Read your notes out loud. Your brain retains spoken information better." },
    { title: "Teach It", tip: "Explain the concept to a friend or even to yourself in the mirror." },
    { title: "Record Yourself", tip: "Record voice notes of key concepts and play them back." },
    { title: "Group Study", tip: "Discussing material with others helps you process and remember it." },
  ],
  kinesthetic: [
    { title: "Practice Problems", tip: "Don't just read — do as many practice questions as possible." },
    { title: "Study While Moving", tip: "Walk around while reviewing notes or use a standing desk." },
    { title: "Write It Out", tip: "Rewrite your notes by hand. The physical act helps memory." },
    { title: "Make It Real", tip: "Connect concepts to real-world examples you can touch or experience." },
  ],
};

const STYLE_LABELS: Record<string, { en: string; af: string; emoji: string }> = {
  visual: { en: "Visual Learner", af: "Visuele Leerder", emoji: "👁" },
  auditory: { en: "Auditory Learner", af: "Ouditiewe Leerder", emoji: "👂" },
  kinesthetic: { en: "Kinesthetic Learner", af: "Kinestetiese Leerder", emoji: "✋" },
};

export default function DiscoveryPage() {
  const { data: session } = useSession();
  const { lang } = useLang();
  const [learningStyle, setLearningStyle] = useState("");
  const [testStep, setTestStep] = useState(-1);
  const [testAnswers, setTestAnswers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/learning-style")
      .then((r) => r.json())
      .then((d) => setLearningStyle(d.learningStyle || ""))
      .catch(() => {});
  }, []);

  const startTest = () => { setTestStep(0); setTestAnswers([]); };
  const cancelTest = () => { setTestStep(-1); setTestAnswers([]); };

  const answerQuestion = (style: string) => {
    const newAnswers = [...testAnswers, style];
    setTestAnswers(newAnswers);
    if (newAnswers.length >= QUESTIONS.length) {
      finishTest(newAnswers);
    } else {
      setTestStep(newAnswers.length);
    }
  };

  const finishTest = (answers: string[]) => {
    const counts: Record<string, number> = { visual: 0, auditory: 0, kinesthetic: 0 };
    answers.forEach((a) => { counts[a] = (counts[a] || 0) + 1; });
    const result = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    saveStyle(result);
  };

  const saveStyle = async (style: string) => {
    setSaving(true);
    try {
      await fetch("/api/user/learning-style", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learningStyle: style }),
      });
    } catch {}
    setLearningStyle(style);
    setTestStep(-1);
    setSaving(false);
  };

  const pickStyle = async (style: string) => {
    await saveStyle(style);
  };

  const currentQuestion = testStep >= 0 && testStep < QUESTIONS.length ? QUESTIONS[testStep] : null;
  const methods = learningStyle ? STUDY_METHODS[learningStyle] || [] : [];
  const styleLabel = learningStyle ? STYLE_LABELS[learningStyle] : null;

  const generalTips = [
    { title: lang === "af" ? "Fokus Tegniek" : "Focus Technique", tip: lang === "af" ? "Studie vir 25 minute, neem 'n 5-minuut pouse. Herhaal." : "Study for 25 minutes, take a 5-minute break. Repeat." },
    { title: lang === "af" ? "Nota Maak" : "Note Taking", tip: lang === "af" ? "Skryf notas in jou eie woorde, nie net kopieer nie." : "Write notes in your own words, don't just copy." },
    { title: lang === "af" ? "Geheue Tegnieke" : "Memory Techniques", tip: lang === "af" ? "Gebruik akronieme, rympies, of storie-verbindings." : "Use acronyms, rhymes, or story connections." },
    { title: lang === "af" ? "Eksamen Voorbereiding" : "Exam Prep", tip: lang === "af" ? "Doen vorige eksamenvraestelle onder tydsdruk." : "Do past exam papers under timed conditions." },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">🔍 {t(lang, "discovery") || "Discovery"}</h1>

      {/* Learning Style Test */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          {t(lang, "learningStyle") || "My Learning Style"}
        </h2>

        {testStep === -1 && !learningStyle && (
          <div className="text-center py-4">
            <p className="text-text-secondary text-sm mb-4">
              {lang === "af" ? "Ontdek hoe jy die beste leer met 'n vinnige toets van 8 vrae." : "Discover how you learn best with a quick 8-question test."}
            </p>
            <button onClick={startTest} className="btn-primary text-sm">
              {t(lang, "takeTest") || "Take the Test"}
            </button>
          </div>
        )}

        {testStep === -1 && learningStyle && styleLabel && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Mascot pose="happy" size={60} />
              <div>
                <div className="text-sm font-semibold">
                  {styleLabel.emoji} {lang === "af" ? styleLabel.af : styleLabel.en}
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {lang === "af" ? "Jy leer die beste deur " : "You learn best through "}
                  {learningStyle === "visual" ? (lang === "af" ? "sien." : "seeing.")
                    : learningStyle === "auditory" ? (lang === "af" ? "hoor." : "hearing.")
                    : (lang === "af" ? "doen." : "doing.")}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={startTest} className="btn-secondary text-xs">
                {t(lang, "retakeTest") || "Retake Test"}
              </button>
              <button onClick={() => setLearningStyle("")} className="btn-secondary text-xs">
                {lang === "af" ? "Verander my styl" : "Change my style"}
              </button>
            </div>
          </div>
        )}

        {currentQuestion && (
          <div className="space-y-4">
            <div className="flex gap-1">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded ${i < testStep ? "bg-accent-green" : i === testStep ? "bg-accent-blue" : "bg-border"}`} />
              ))}
            </div>
            <p className="text-sm font-medium">
              {testStep + 1}/{QUESTIONS.length}. {currentQuestion.question}
            </p>
            <div className="space-y-2">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answerQuestion(opt.style)}
                  className="w-full text-left p-3 rounded-card border border-border hover:border-accent-blue transition-colors text-sm"
                >
                  {opt.text}
                </button>
              ))}
            </div>
            <button onClick={cancelTest} className="text-xs text-text-muted hover:text-text-secondary">
              {lang === "af" ? "Kanselleer" : "Cancel"}
            </button>
          </div>
        )}

        {saving && (
          <div className="text-center text-text-muted text-sm">{lang === "af" ? "Stoor..." : "Saving..."}</div>
        )}

        {!learningStyle && testStep === -1 && (
          <div className="mt-3 text-xs text-text-muted">
            <button onClick={() => pickStyle("visual")} className="hover:text-text-secondary mr-3">Visual</button>
            <button onClick={() => pickStyle("auditory")} className="hover:text-text-secondary mr-3">Auditory</button>
            <button onClick={() => pickStyle("kinesthetic")} className="hover:text-text-secondary">Kinesthetic</button>
          </div>
        )}
      </div>

      {/* Study Methods for your style */}
      {methods.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            {lang === "af" ? "Studiemetodes vir Jou" : "Study Methods for You"}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {methods.map((m, i) => (
              <div key={i} className="bg-bg-secondary p-4 rounded-card">
                <div className="text-sm font-semibold">{m.title}</div>
                <div className="text-xs text-text-secondary mt-1">{m.tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Study Tips */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          {lang === "af" ? "Algemene Studiewenke" : "General Study Tips"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {generalTips.map((tip, i) => (
            <div key={i} className="bg-bg-secondary p-4 rounded-card">
              <div className="text-sm font-semibold">{tip.title}</div>
              <div className="text-xs text-text-secondary mt-1">{tip.tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
