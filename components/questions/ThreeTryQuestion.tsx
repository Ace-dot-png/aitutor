'use client'

import { useState } from 'react'
import { useLang } from '@/lib/LanguageContext'
import { t } from '@/lib/i18n'
import { Mascot } from '@/components/mascot/Mascot'

export interface ThreeTryProps {
  questionNumber: number
  totalQuestions: number
  question: string
  answerInput: string
  setAnswerInput: (v: string) => void
  hint?: string
  correctAnswer?: string
  onSubmit: (answer: string) => void
  onNext: (solved: boolean, attempts: number) => void
  attempts: number
  solved: boolean
  revealed: boolean
}

export function ThreeTryQuestion({
  questionNumber, totalQuestions, question, answerInput, setAnswerInput,
  hint, correctAnswer, onSubmit, onNext, attempts, solved, revealed
}: ThreeTryProps) {
  const { lang } = useLang()
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const getMascotPose = () => {
    if (!submitted) return 'curious' as const
    if (solved) return 'excited' as const
    if (revealed) return 'gentle' as const
    if (attempts >= 2) return 'gentle' as const
    if (attempts >= 1) return 'encouraging' as const
    return 'thinking' as const
  }

  const getFeedbackMessage = () => {
    if (solved) {
      if (attempts === 1) return t(lang, 'attempt1Right')
      if (attempts === 2) return t(lang, 'attempt2Right')
      return t(lang, 'attempt3Right')
    }
    if (revealed) return `${t(lang, 'attempt3Wrong')} ${correctAnswer || ''}`
    if (attempts === 1) return t(lang, 'attempt1Wrong')
    if (attempts === 2) return t(lang, 'attempt2Wrong')
    return ''
  }

  const handleSubmit = () => {
    if (!answerInput.trim()) return
    setSubmitted(true)
    onSubmit(answerInput.trim())
  }

  const handleNext = () => {
    onNext(solved, attempts)
    setSubmitted(false)
    setFeedback('')
    setAnswerInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (submitted || revealed) {
        handleNext()
      } else {
        handleSubmit()
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-muted">
          {t(lang, 'lineProgress') || 'Question'} {questionNumber} {t(lang, 'of')} {totalQuestions}
        </div>
        {/* Attempt dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ background: i < attempts ? '#d72d02' : '#2A2A2A' }}
            />
          ))}
        </div>
      </div>

      <p className="text-sm font-medium">{question}</p>

      <textarea
        value={answerInput}
        onChange={(e) => setAnswerInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="input-field w-full text-sm"
        rows={2}
        placeholder={lang === 'af' ? 'Jou antwoord...' : 'Your answer...'}
        disabled={submitted || revealed}
      />

      <div className="flex items-center gap-3">
        {!submitted && !revealed && (
          <button onClick={handleSubmit} disabled={!answerInput.trim()} className="btn-primary text-xs">
            {lang === 'af' ? 'Dien in' : 'Submit'}
          </button>
        )}
        {submitted && !solved && !revealed && (
          <button onClick={() => {
            setSubmitted(false)
            setAnswerInput('')
          }} className="btn-primary text-xs">
            {lang === 'af' ? 'Probeer weer' : 'Try again'}
          </button>
        )}
        {(solved || revealed) && (
          <button onClick={handleNext} className="btn-primary text-xs">
            {questionNumber >= totalQuestions
              ? (lang === 'af' ? 'Sien Resultate' : 'View Results')
              : (t(lang, 'nextQuestion') || 'Next Question')}
          </button>
        )}
        <Mascot pose={getMascotPose()} size={40} />
      </div>

      {submitted && !solved && attempts >= 2 && !revealed && hint && (
        <div className="text-xs text-text-muted bg-bg-secondary p-2 rounded">
          <span className="font-semibold">{t(lang, 'hint')}:</span> {hint}
        </div>
      )}

      {(solved || revealed) && getFeedbackMessage() && (
        <div className="text-xs text-text-secondary bg-bg-secondary p-2 rounded">
          {getFeedbackMessage()}
        </div>
      )}
    </div>
  )
}
