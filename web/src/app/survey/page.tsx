'use client'
// app/survey/[surveyId]/page.tsx
// whatsinglewant.com — Multi-step Survey Engine
// ============================================================

import { useState, useCallback } from 'react'
import type { SurveyQuestion, SurveyAnswer } from '../../../../../_shared/types'

// ─── Types ───────────────────────────────────────────────────
type SurveyStep = 'intro' | 'questions' | 'complete'

interface SurveyState {
  step:        SurveyStep
  sectionIndex: number
  answers:     Record<string, SurveyAnswer['value']>
  isSubmitting: boolean
}

// ─── Mock sections (replace with API data) ───────────────────
const SECTIONS = [
  { id: 'profile',      labelTH: 'ข้อมูลของคุณ',        icon: '👤' },
  { id: 'lifestyle',    labelTH: 'ไลฟ์สไตล์และการใช้จ่าย', icon: '✨' },
  { id: 'social',       labelTH: 'ชีวิตทางสังคม',        icon: '🤝' },
  { id: 'brand',        labelTH: 'มุมมองต่อแบรนด์',       icon: '💡' },
  { id: 'relationship', labelTH: 'ทัศนคติต่อความโสด',    icon: '💭' },
]

const MOCK_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    order: 1,
    section: 'profile',
    type: 'single_choice',
    questionTH: 'คุณอายุเท่าไหร่?',
    questionEN: 'What is your age group?',
    required: true,
    options: [
      { id: 'o1', labelTH: '18–24 ปี', labelEN: '18–24', value: '18-24' },
      { id: 'o2', labelTH: '25–29 ปี', labelEN: '25–29', value: '25-29' },
      { id: 'o3', labelTH: '30–34 ปี', labelEN: '30–34', value: '30-34' },
      { id: 'o4', labelTH: '35–39 ปี', labelEN: '35–39', value: '35-39' },
      { id: 'o5', labelTH: '40 ปีขึ้นไป', labelEN: '40+', value: '40+' },
    ],
  },
  {
    id: 'q2',
    order: 2,
    section: 'profile',
    type: 'single_choice',
    questionTH: 'คุณนิยามตัวเองว่าเป็น "คนโสด" แบบไหน?',
    questionEN: 'How do you define your single status?',
    required: true,
    options: [
      { id: 'o1', labelTH: '😊 Thriving — โสดแล้วดีใจ ใช้ชีวิตเต็มที่', labelEN: 'Thriving Single', value: 'thriving' },
      { id: 'o2', labelTH: '😌 Content — โสดก็ได้ มีคู่ก็ดี', labelEN: 'Content Single', value: 'content' },
      { id: 'o3', labelTH: '🔍 Searching — อยากมีคู่ แต่ยังไม่เจอ', labelEN: 'Searching Single', value: 'searching' },
    ],
  },
]

// ─── Main Page ────────────────────────────────────────────────
export default function SurveyPage() {
  const [state, setState] = useState<SurveyState>({
    step:         'intro',
    sectionIndex: 0,
    answers:      {},
    isSubmitting: false,
  })

  const currentSection = SECTIONS[state.sectionIndex]
  const sectionQuestions = MOCK_QUESTIONS.filter(
    q => q.section === currentSection?.id
  )

  const handleAnswer = useCallback((questionId: string, value: SurveyAnswer['value']) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }))
  }, [])

  const handleNextSection = useCallback(async () => {
    if (state.sectionIndex < SECTIONS.length - 1) {
      setState(prev => ({ ...prev, sectionIndex: prev.sectionIndex + 1 }))
    } else {
      // Submit
      setState(prev => ({ ...prev, isSubmitting: true }))
      try {
        await fetch('/api/survey/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: state.answers }),
        })
        setState(prev => ({ ...prev, step: 'complete', isSubmitting: false }))
      } catch {
        setState(prev => ({ ...prev, isSubmitting: false }))
      }
    }
  }, [state.sectionIndex, state.answers])

  if (state.step === 'intro') return (
    <SurveyIntro onStart={() => setState(prev => ({ ...prev, step: 'questions' }))} />
  )

  if (state.step === 'complete') return <SurveyComplete />

  return (
    <div className="min-h-screen bg-light">
      {/* Progress header */}
      <header className="sticky top-0 bg-white border-b border-border z-10">
        <div className="container mx-auto px-6 py-4">
          <SurveyProgress
            sections={SECTIONS}
            currentIndex={state.sectionIndex}
          />
        </div>
      </header>

      {/* Questions */}
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="mb-8">
          <span className="text-4xl mb-3 block">{currentSection?.icon}</span>
          <h2 className="font-display text-2xl text-primary">
            {currentSection?.labelTH}
          </h2>
        </div>

        <div className="space-y-8">
          {sectionQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              value={state.answers[question.id]}
              onChange={(val) => handleAnswer(question.id, val)}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-between items-center">
          {state.sectionIndex > 0 && (
            <button
              onClick={() => setState(prev => ({ ...prev, sectionIndex: prev.sectionIndex - 1 }))}
              className="px-6 py-3 border border-border text-charcoal rounded-full font-body hover:bg-light transition-colors"
            >
              ← กลับ
            </button>
          )}
          <button
            onClick={handleNextSection}
            disabled={state.isSubmitting}
            className="ml-auto px-8 py-3 bg-primary text-white rounded-full font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {state.sectionIndex === SECTIONS.length - 1
              ? state.isSubmitting ? 'กำลังส่ง...' : 'ส่งแบบสำรวจ ✓'
              : 'ถัดไป →'}
          </button>
        </div>
      </main>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────

function SurveyIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-primary flex items-center">
      <div className="container mx-auto px-6 max-w-2xl text-center">
        <p className="font-body text-mint text-sm tracking-[0.2em] uppercase mb-4">
          What Single Want — Annual Survey 2026
        </p>
        <h1 className="font-display text-5xl text-white mb-6 leading-tight">
          คุณเป็นคนโสด<br />
          <span className="text-highlight">ที่โลกยังไม่เข้าใจ</span>
        </h1>
        <p className="font-body text-white/70 text-lg mb-4 leading-relaxed">
          ช่วยเราสร้างรายงานคนโสดไทยฉบับแรก
          ที่ครอบคลุมและเป็นกลางที่สุดในประเทศ
        </p>
        <p className="font-body text-mint text-sm mb-10">
          ใช้เวลา ~8 นาที · ไม่เก็บข้อมูลส่วนตัว · ได้รับรายงานฟรีเมื่อเสร็จ
        </p>
        <button
          onClick={onStart}
          className="px-10 py-4 bg-highlight text-white font-body font-medium text-lg rounded-full hover:bg-highlight/90 transition-colors"
        >
          เริ่มทำแบบสำรวจ
        </button>
      </div>
    </div>
  )
}

function SurveyProgress({
  sections,
  currentIndex,
}: {
  sections: typeof SECTIONS
  currentIndex: number
}) {
  return (
    <div className="flex items-center gap-2">
      {sections.map((section, i) => (
        <div key={section.id} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-bold transition-colors ${
            i < currentIndex
              ? 'bg-primary text-white'
              : i === currentIndex
                ? 'bg-highlight text-white'
                : 'bg-light text-muted border border-border'
          }`}>
            {i < currentIndex ? '✓' : i + 1}
          </div>
          {i < sections.length - 1 && (
            <div className={`h-0.5 w-8 transition-colors ${i < currentIndex ? 'bg-primary' : 'bg-border'}`} />
          )}
        </div>
      ))}
      <span className="ml-3 font-body text-muted text-sm">
        {sections[currentIndex]?.labelTH}
      </span>
    </div>
  )
}

function QuestionCard({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion
  value: SurveyAnswer['value'] | undefined
  onChange: (val: SurveyAnswer['value']) => void
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-border">
      <p className="font-body text-charcoal font-medium mb-5 leading-relaxed">
        {question.questionTH}
        {question.required && <span className="text-highlight ml-1">*</span>}
      </p>

      {question.type === 'single_choice' && question.options && (
        <div className="space-y-3">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange(opt.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 font-body text-sm transition-all ${
                value === opt.value
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-border hover:border-primary/40 text-charcoal'
              }`}
            >
              {opt.labelTH}
            </button>
          ))}
        </div>
      )}

      {question.type === 'multiple_choice' && question.options && (
        <div className="space-y-3">
          {question.options.map((opt) => {
            const selected = Array.isArray(value) && value.includes(opt.value)
            return (
              <button
                key={opt.id}
                onClick={() => {
                  const current = Array.isArray(value) ? value : []
                  onChange(selected
                    ? current.filter(v => v !== opt.value)
                    : [...current, opt.value]
                  )
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-body text-sm transition-all ${
                  selected
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border hover:border-primary/40 text-charcoal'
                }`}
              >
                {opt.labelTH}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SurveyComplete() {
  return (
    <div className="min-h-screen bg-light flex items-center">
      <div className="container mx-auto px-6 max-w-xl text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="font-display text-4xl text-primary mb-4">
          ขอบคุณมากครับ/ค่ะ!
        </h2>
        <p className="font-body text-muted text-lg mb-8">
          คุณเป็นส่วนหนึ่งของรายงาน "What Single Want 2026"
          ที่จะถูกอ่านโดยแบรนด์และนักวิจัยทั่วประเทศ
        </p>
        <a
          href="/reports/2026"
          className="inline-block px-8 py-4 bg-primary text-white font-body font-medium rounded-full hover:bg-primary/90 transition-colors"
        >
          รับรายงานฟรี →
        </a>
      </div>
    </div>
  )
}
