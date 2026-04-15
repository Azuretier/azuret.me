'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type Tab = 'sprint' | 'writing' | 'speaking' | 'plan'

type Question = {
  id: number
  prompt: string
  choices: string[]
  answer: string
  note: string
}

type Sprint = {
  id: string
  label: string
  title: string
  minutes: string
  passageTitle: string
  passage: string[]
  questions: Question[]
  writingPrompt: string
  thesisHint: string
  speakingTopic: string
  speakingCue: string
  speakingBullets: string[]
  speakingFrames: string[]
  vocab: string[]
}

const STORAGE_KEY = 'ielts-sprint-studio-v1'

const FOCUS_WORDS = [
  { word: 'paraphrase', meaning: 'say the same idea in different words' },
  { word: 'coherent', meaning: 'clear and easy to follow' },
  { word: 'justify', meaning: 'give a reason or evidence' },
  { word: 'reliable', meaning: 'consistent and dependable' },
  { word: 'adaptability', meaning: 'ability to adjust to change' },
  { word: 'restrictive', meaning: 'limiting your options' },
]

const SPRINTS: Sprint[] = [
  {
    id: 'pods',
    label: 'Set A',
    title: 'Campus Focus Pods',
    minutes: '18 min',
    passageTitle: 'Why Quiet Study Pods Catch On',
    passage: [
      'Several universities now rent small study pods to students who struggle in open libraries. The pods are not meant to isolate learners completely. Instead, they create a short block of structure: one reserved seat, fewer digital distractions, and a visible countdown timer.',
      'In one pilot, students who booked the pods three times a week did not study for dramatically longer. However, they finished tasks more often and felt less mentally tired. Researchers said this mattered because many students confuse long study time with effective study time.',
      'The project leaders warned that the pods were not a magic answer. A twenty-minute grammar review worked well in the pod, but a wide creative brainstorm often felt too restrictive. Their final advice was simple: match the environment to the task rather than copy someone else\'s routine.',
    ],
    questions: [
      { id: 1, prompt: 'Why were the pods introduced?', choices: ['To replace libraries', 'To create short focused sessions', 'To increase group work', 'To make students study longer'], answer: 'To create short focused sessions', note: 'The passage focuses on structure and fewer distractions, not longer hours.' },
      { id: 2, prompt: 'What improved in the pilot?', choices: ['Study hours doubled', 'Task completion and energy improved', 'Creative work became easier', 'Library attendance disappeared'], answer: 'Task completion and energy improved', note: 'Students finished tasks more often and felt less mentally tired.' },
      { id: 3, prompt: 'What misconception is mentioned?', choices: ['Creative work is always best', 'Technology always helps', 'Long study automatically means effective study', 'Libraries are outdated'], answer: 'Long study automatically means effective study', note: 'The text explicitly contrasts time spent with real effectiveness.' },
      { id: 4, prompt: 'Which task matched the pod best?', choices: ['A broad brainstorm', 'A short grammar review', 'A loud discussion', 'An all-day project'], answer: 'A short grammar review', note: 'The pod suits narrow, clearly defined work.' },
      { id: 5, prompt: "What is the writer's main point?", choices: ['Students should always study alone', 'Study pods are expensive', 'Focused tools help when matched to the task', 'Libraries should ban phones'], answer: 'Focused tools help when matched to the task', note: 'The closing sentence gives the key idea: match the environment to the task.' },
    ],
    writingPrompt: 'Some people think universities should only teach skills that are directly useful for jobs. Others believe university education should have a broader purpose. Discuss both views and give your own opinion.',
    thesisHint: 'Universities should improve employability, but they should still build judgement and adaptability through broader learning.',
    speakingTopic: 'Describe a skill you learned in a short period of time.',
    speakingCue: 'Explain what the skill was, why you learned it quickly, how you felt, and how it still helps you now.',
    speakingBullets: ['what the skill was', 'why you learned it quickly', 'how you felt', 'how it helps you now'],
    speakingFrames: ['One reason I learned it so quickly was...', 'What surprised me most was...', 'Since then, it has helped me to...'],
    vocab: ['effective study time', 'restrictive', 'adaptability'],
  },
  {
    id: 'buses',
    label: 'Set B',
    title: 'Reliable City Commutes',
    minutes: '17 min',
    passageTitle: 'Why Reliability Can Matter More Than Speed',
    passage: [
      'Many cities now test bus-priority lanes to improve commuting, but the biggest benefit is not always speed. In one mid-sized city, a central lane was given to buses during rush hour. Car drivers complained at first because they expected worse traffic jams.',
      'After eight weeks, the average bus journey was only four minutes faster. Even so, ridership climbed sharply. Surveys showed that passengers valued reliable arrival times more than raw speed, because predictable journeys felt safer for work and school.',
      'Planners also noticed that some employers adjusted office start times after the pilot began, which reduced pressure on the system. Officials concluded that transport changes work best when they are paired with communication and flexible scheduling. A single policy rarely fixes a city\'s travel problems alone.',
    ],
    questions: [
      { id: 1, prompt: 'What did drivers predict at first?', choices: ['Cheaper bus fares', 'Longer traffic jams', 'Fewer office workers', 'Shorter walking times'], answer: 'Longer traffic jams', note: 'The first paragraph states this directly.' },
      { id: 2, prompt: 'What happened after eight weeks?', choices: ['Bus times changed slightly and ridership rose', 'Bus use fell sharply', 'Employers ended flexible work', 'Passengers cared less about timing'], answer: 'Bus times changed slightly and ridership rose', note: 'The gain in speed was modest, but passenger numbers increased.' },
      { id: 3, prompt: 'What mattered most to passengers?', choices: ['Lower prices', 'Predictable arrival times', 'More seats', 'Shorter walks'], answer: 'Predictable arrival times', note: 'Reliability is the central idea of the passage.' },
      { id: 4, prompt: 'What unexpected change also helped?', choices: ['New bike lanes', 'Employer schedule changes', 'More parking lots', 'Free bus tickets'], answer: 'Employer schedule changes', note: 'Flexible office start times reduced pressure on the system.' },
      { id: 5, prompt: 'What is the main lesson?', choices: ['Speed is the only transport goal', 'One policy solves everything', 'Reliable improvements can work without huge speed gains', 'Cars should be banned'], answer: 'Reliable improvements can work without huge speed gains', note: 'The article argues that reliability can be more persuasive than dramatic speed.' },
    ],
    writingPrompt: 'Online short-video platforms are increasingly used for education. Do the advantages of this development outweigh the disadvantages?',
    thesisHint: 'Short-video platforms can widen access to learning, but they work best as a starting point rather than a replacement for deeper study.',
    speakingTopic: 'Describe a crowded place you visited recently.',
    speakingCue: 'Say where it was, why many people were there, what you did, and whether you would go back.',
    speakingBullets: ['where it was', 'why it was crowded', 'what you did there', 'whether you would go back'],
    speakingFrames: ['What stood out immediately was...', 'Even though it was crowded, I...', 'Looking back, I would return because...'],
    vocab: ['ridership', 'predictable times', 'flexible scheduling'],
  },
]

function countWords(text: string) {
  const value = text.trim()
  return value ? value.split(/\s+/).length : 0
}

function bandFrom(score: number, total: number) {
  const ratio = total ? score / total : 0
  if (ratio >= 1) return '7.5-8.0'
  if (ratio >= 0.8) return '7.0'
  if (ratio >= 0.6) return '6.5'
  if (ratio >= 0.4) return '6.0'
  if (ratio > 0) return '5.5'
  return '5.0'
}

function feedbackFor(score: number, total: number) {
  const ratio = total ? score / total : 0
  if (ratio >= 0.8) return 'Strong sprint. Review the notes once and keep your pacing tight.'
  if (ratio >= 0.6) return 'Solid base. Focus on paraphrase recognition and main-idea reading.'
  if (ratio >= 0.4) return 'Useful practice. Skim each paragraph for purpose before answering.'
  return 'Keep the loop light and repeatable. One short sprint each day will build speed.'
}

export default function EnglishApp() {
  const [tab, setTab] = useState<Tab>('sprint')
  const [setId, setSetId] = useState(SPRINTS[0].id)
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const [writingDrafts, setWritingDrafts] = useState<Record<string, string>>({})
  const [speakingNotes, setSpeakingNotes] = useState<Record<string, string>>({})
  const [bestScore, setBestScore] = useState(0)
  const [sessions, setSessions] = useState(0)
  const [studyMinutes, setStudyMinutes] = useState(20)
  const [voiceName, setVoiceName] = useState('')
  const [voicesReady, setVoicesReady] = useState(false)
  const [narrating, setNarrating] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as {
        answers?: Record<string, Record<number, string>>
        submitted?: Record<string, boolean>
        writingDrafts?: Record<string, string>
        speakingNotes?: Record<string, string>
        bestScore?: number
        sessions?: number
        studyMinutes?: number
      }
      setAnswers(saved.answers ?? {})
      setSubmitted(saved.submitted ?? {})
      setWritingDrafts(saved.writingDrafts ?? {})
      setSpeakingNotes(saved.speakingNotes ?? {})
      setBestScore(saved.bestScore ?? 0)
      setSessions(saved.sessions ?? 0)
      setStudyMinutes(saved.studyMinutes ?? 20)
    } catch {
      // ignore broken local storage
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers, submitted, writingDrafts, speakingNotes, bestScore, sessions, studyMinutes }),
      )
    } catch {
      // ignore storage errors
    }
  }, [answers, submitted, writingDrafts, speakingNotes, bestScore, sessions, studyMinutes])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices()
      const english =
        all.find((voice) => voice.lang.toLowerCase().startsWith('en-us')) ??
        all.find((voice) => voice.lang.toLowerCase().startsWith('en')) ??
        null
      setVoicesReady(all.length > 0)
      setVoiceName(english?.name ?? '')
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      window.speechSynthesis.cancel()
    }
  }, [])

  const active = SPRINTS.find((item) => item.id === setId) ?? SPRINTS[0]
  const activeAnswers = answers[active.id] ?? {}
  const activeSubmitted = submitted[active.id] ?? false
  const writingDraft = writingDrafts[active.id] ?? ''
  const speakingDraft = speakingNotes[active.id] ?? ''
  const answeredCount = active.questions.filter((item) => activeAnswers[item.id]).length
  const score = useMemo(
    () => active.questions.reduce((sum, item) => sum + (activeAnswers[item.id] === item.answer ? 1 : 0), 0),
    [active.questions, activeAnswers],
  )

  const shell: CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #fbf0d4 0%, #f7efe5 34%, #f4f4ef 100%)',
    color: '#1c1917',
    fontFamily: "'Manrope','Noto Sans JP',sans-serif",
  }
  const panel: CSSProperties = {
    background: 'rgba(255,255,255,0.84)',
    border: '1px solid rgba(28,25,23,0.08)',
    boxShadow: '0 20px 50px rgba(28,25,23,0.08)',
    borderRadius: 24,
    backdropFilter: 'blur(12px)',
  }
  const inputArea: CSSProperties = {
    width: '100%',
    minHeight: 150,
    borderRadius: 18,
    border: '1px solid rgba(28,25,23,0.12)',
    padding: '14px 16px',
    background: '#fff',
    color: '#1c1917',
    lineHeight: 1.7,
    resize: 'vertical',
  }

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(text)
    const all = window.speechSynthesis.getVoices()
    const english =
      all.find((voice) => voice.name === voiceName) ??
      all.find((voice) => voice.lang.toLowerCase().startsWith('en-us')) ??
      all.find((voice) => voice.lang.toLowerCase().startsWith('en')) ??
      null
    utterance.voice = english
    utterance.lang = english?.lang ?? 'en-US'
    utterance.rate = 0.92
    utterance.onstart = () => setNarrating(true)
    utterance.onend = () => setNarrating(false)
    utterance.onerror = () => setNarrating(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const chooseAnswer = (questionId: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [active.id]: { ...(prev[active.id] ?? {}), [questionId]: choice } }))
    setSubmitted((prev) => ({ ...prev, [active.id]: false }))
  }

  const checkSprint = () => {
    if (answeredCount !== active.questions.length) return
    setSubmitted((prev) => ({ ...prev, [active.id]: true }))
    setBestScore((prev) => Math.max(prev, score))
    setSessions((prev) => prev + 1)
  }

  const resetSprint = () => {
    setAnswers((prev) => ({ ...prev, [active.id]: {} }))
    setSubmitted((prev) => ({ ...prev, [active.id]: false }))
  }

  const insertWritingOutline = () => {
    setWritingDrafts((prev) => {
      if ((prev[active.id] ?? '').trim()) return prev
      return { ...prev, [active.id]: `${active.thesisHint}\n\n1. Introduction\n2. Body paragraph 1\n3. Body paragraph 2\n4. Conclusion` }
    })
  }

  return (
    <div style={shell}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 18px 100px' }}>
        <div style={{ ...panel, padding: 24, marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 'auto -60px -80px auto', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18), rgba(37,99,235,0))' }} />
          <div style={{ position: 'absolute', inset: '-40px auto auto -20px', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.18), rgba(245,158,11,0))' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ maxWidth: 620 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#57534e', marginBottom: 10 }}>IELTS Sprint Studio</div>
              <h1 style={{ margin: 0, fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1, letterSpacing: -2 }}>Practice for IELTS without waiting for a full mock test.</h1>
              <p style={{ margin: '14px 0 0', maxWidth: 560, fontSize: 15, lineHeight: 1.7, color: '#57534e' }}>
                Use short reading sprints, a Task 2 planner, and speaking cue cards to train consistently on busy days.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {['2 sprint sets', 'Task 2 practice', 'Speaking cue cards'].map((item) => (
                  <span key={item} style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(28,25,23,0.08)', fontSize: 13, fontWeight: 700, color: '#44403c' }}>{item}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <button onClick={() => speak('Welcome back. Let us practice for IELTS together.')} style={{ border: 'none', borderRadius: 999, padding: '11px 14px', background: '#1c1917', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>{narrating ? 'Narrating...' : 'Play welcome narration'}</button>
                <button onClick={() => setTab('sprint')} style={{ border: 'none', borderRadius: 999, padding: '11px 14px', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Start sprint</button>
                <span style={{ alignSelf: 'center', fontSize: 13, color: '#78716c' }}>{voicesReady ? `Voice: ${voiceName || 'English system voice'}` : 'Narration uses your browser voice when available.'}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, minWidth: 'min(100%, 320px)', flex: '1 1 320px' }}>
              {[
                { label: 'Best', value: sessions > 0 ? `Band ~${bandFrom(bestScore, active.questions.length)}` : 'Start', tone: '#2563eb' },
                { label: 'Sessions', value: `${sessions}`, tone: '#dc2626' },
                { label: 'Study block', value: `${studyMinutes} min`, tone: '#ca8a04' },
                { label: 'Focus words', value: `${FOCUS_WORDS.length}`, tone: '#0f766e' },
              ].map((item) => (
                <div key={item.label} style={{ background: '#fffdf8', borderRadius: 18, padding: 16, border: '1px solid rgba(28,25,23,0.08)' }}>
                  <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#78716c', marginBottom: 8 }}>{item.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: item.tone }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          {[
            { id: 'sprint', label: 'Sprint' },
            { id: 'writing', label: 'Writing' },
            { id: 'speaking', label: 'Speaking' },
            { id: 'plan', label: 'Plan' },
          ].map((item) => (
            <button key={item.id} onClick={() => setTab(item.id as Tab)} style={{ border: 'none', borderRadius: 999, padding: '12px 18px', background: tab === item.id ? '#1c1917' : 'rgba(255,255,255,0.72)', color: tab === item.id ? '#fafaf9' : '#44403c', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'sprint' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18 }}>
            <div style={{ ...panel, padding: 22 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                {SPRINTS.map((item) => (
                  <button key={item.id} onClick={() => setSetId(item.id)} style={{ border: item.id === active.id ? 'none' : '1px solid rgba(28,25,23,0.12)', borderRadius: 16, padding: '12px 14px', background: item.id === active.id ? '#1c1917' : '#fff', color: item.id === active.id ? '#fff' : '#1c1917', fontWeight: 800, cursor: 'pointer' }}>
                    {item.label}: {item.title}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Reading Sprint</div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{active.passageTitle}</div>
                  <div style={{ marginTop: 8, color: '#57534e', lineHeight: 1.7 }}>Skim for structure first, then answer the questions quickly.</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => speak(active.passage.join(' '))} style={{ border: 'none', borderRadius: 14, padding: '12px 14px', background: '#0f766e', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Hear passage</button>
                  <button onClick={resetSprint} style={{ border: '1px solid rgba(28,25,23,0.12)', borderRadius: 14, padding: '12px 14px', background: '#fff', color: '#1c1917', fontWeight: 800, cursor: 'pointer' }}>Reset</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {active.vocab.map((item) => <span key={item} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 999, padding: '8px 11px', fontSize: 12, fontWeight: 800 }}>{item}</span>)}
              </div>
              <div style={{ marginTop: 18, padding: 18, borderRadius: 20, background: '#fffdf8', border: '1px solid rgba(28,25,23,0.08)', display: 'grid', gap: 14, lineHeight: 1.75, color: '#44403c' }}>
                {active.passage.map((paragraph, index) => <p key={`${active.id}-${index}`} style={{ margin: 0 }}>{paragraph}</p>)}
              </div>
              <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                {active.questions.map((question) => (
                  <div key={question.id} style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(28,25,23,0.08)', padding: 18 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Q{question.id}. {question.prompt}</div>
                    <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                      {question.choices.map((choice) => (
                        <button key={choice} onClick={() => chooseAnswer(question.id, choice)} style={{ border: activeAnswers[question.id] === choice ? '2px solid #2563eb' : '1px solid rgba(28,25,23,0.08)', background: activeAnswers[question.id] === choice ? '#eff6ff' : '#fff', borderRadius: 16, padding: '14px 16px', textAlign: 'left', fontSize: 15, fontWeight: 700, cursor: 'pointer', color: '#1c1917' }}>
                          {choice}
                        </button>
                      ))}
                    </div>
                    {activeSubmitted && <div style={{ marginTop: 14, padding: 14, borderRadius: 16, background: activeAnswers[question.id] === question.answer ? '#f0fdf4' : '#fef2f2', color: '#44403c', lineHeight: 1.7 }}><strong style={{ color: '#1c1917' }}>{activeAnswers[question.id] === question.answer ? 'Correct.' : 'Review this one.'}</strong> {question.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 18, alignSelf: 'start' }}>
              <div style={{ ...panel, padding: 22 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Sprint Result</div>
                <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{score}/{active.questions.length}</div>
                <div style={{ marginTop: 8, color: '#2563eb', fontSize: 22, fontWeight: 800 }}>Band ~{bandFrom(score, active.questions.length)}</div>
                <div style={{ marginTop: 12, color: '#57534e', lineHeight: 1.7 }}>{feedbackFor(score, active.questions.length)}</div>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', color: '#57534e' }}>
                  <div>Answered <strong style={{ color: '#1c1917' }}>{answeredCount}/{active.questions.length}</strong></div>
                  <div>Time box <strong style={{ color: '#1c1917' }}>{active.minutes}</strong></div>
                </div>
                <button onClick={checkSprint} disabled={answeredCount !== active.questions.length} style={{ marginTop: 18, border: 'none', borderRadius: 14, padding: '12px 16px', background: answeredCount === active.questions.length ? '#1c1917' : '#d6d3d1', color: '#fff', fontWeight: 800, cursor: answeredCount === active.questions.length ? 'pointer' : 'not-allowed', width: '100%' }}>
                  Check sprint
                </button>
              </div>
              <div style={{ ...panel, padding: 22 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Efficient Loop</div>
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  {[
                    '2 min: skim the passage for topic and paragraph purpose.',
                    '8 min: answer all questions without overthinking.',
                    '5 min: draft a thesis and two body ideas.',
                    '3 min: answer the cue card aloud.',
                  ].map((item, index) => (
                    <div key={item} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 16, background: '#fff', border: '1px solid rgba(28,25,23,0.08)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{index + 1}</div>
                      <div style={{ color: '#44403c', lineHeight: 1.7 }}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'writing' && (
          <div style={{ ...panel, padding: 22, maxWidth: 860, margin: '0 auto' }}>
            <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Task 2 Planner</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>Write smarter, not longer.</div>
            <div style={{ marginTop: 16, padding: 16, borderRadius: 18, background: '#fff7ed', color: '#7c2d12', lineHeight: 1.7 }}><strong>Prompt:</strong> {active.writingPrompt}</div>
            <div style={{ marginTop: 14, padding: 16, borderRadius: 18, background: '#f8fafc', color: '#334155', lineHeight: 1.7 }}><strong>Thesis angle:</strong> {active.thesisHint}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <button onClick={() => speak(active.writingPrompt)} style={{ border: 'none', borderRadius: 14, padding: '12px 14px', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Hear prompt</button>
              <button onClick={insertWritingOutline} style={{ border: '1px solid rgba(28,25,23,0.12)', borderRadius: 14, padding: '12px 14px', background: '#fff', color: '#1c1917', fontWeight: 800, cursor: 'pointer' }}>Insert outline</button>
            </div>
            <textarea value={writingDraft} onChange={(event) => setWritingDrafts((prev) => ({ ...prev, [active.id]: event.target.value }))} placeholder="Draft an intro, body ideas, or a full response here..." style={{ ...inputArea, marginTop: 16 }} />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', color: '#57534e' }}>
              <div>Word count: <strong style={{ color: '#1c1917' }}>{countWords(writingDraft)}</strong></div>
              <div style={{ fontWeight: 700, color: countWords(writingDraft) >= 250 ? '#166534' : '#78716c' }}>{countWords(writingDraft) >= 250 ? 'Target reached for Task 2.' : `${250 - countWords(writingDraft)} words to 250+`}</div>
            </div>
          </div>
        )}

        {tab === 'speaking' && (
          <div style={{ ...panel, padding: 22, maxWidth: 860, margin: '0 auto' }}>
            <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Speaking Cue</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{active.speakingTopic}</div>
            <div style={{ marginTop: 16, padding: 16, borderRadius: 18, background: '#eef2ff', color: '#312e81', lineHeight: 1.7 }}>
              <strong>Prompt:</strong> {active.speakingCue}
              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>{active.speakingBullets.map((item) => <div key={item}>• {item}</div>)}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <button onClick={() => speak(`${active.speakingTopic}. ${active.speakingCue}`)} style={{ border: 'none', borderRadius: 14, padding: '12px 14px', background: '#0f766e', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Hear cue</button>
              <button onClick={() => setSpeakingNotes((prev) => ({ ...prev, [active.id]: '' }))} style={{ border: '1px solid rgba(28,25,23,0.12)', borderRadius: 14, padding: '12px 14px', background: '#fff', color: '#1c1917', fontWeight: 800, cursor: 'pointer' }}>Clear notes</button>
            </div>
            <textarea value={speakingDraft} onChange={(event) => setSpeakingNotes((prev) => ({ ...prev, [active.id]: event.target.value }))} placeholder="Plan a short answer with one example and one reflection..." style={{ ...inputArea, marginTop: 16, minHeight: 130 }} />
            <div style={{ marginTop: 12, color: '#57534e' }}>Notes prepared: <strong style={{ color: '#1c1917' }}>{countWords(speakingDraft)}</strong> words</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>{active.speakingFrames.map((item) => <span key={item} style={{ background: '#ecfeff', color: '#155e75', borderRadius: 999, padding: '8px 11px', fontSize: 12, fontWeight: 800 }}>{item}</span>)}</div>
          </div>
        )}

        {tab === 'plan' && (
          <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 18 }}>
            <div style={{ ...panel, padding: 22 }}>
              <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Daily Plan</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>A small routine you can repeat.</div>
              <p style={{ margin: '10px 0 18px', color: '#57534e', lineHeight: 1.7 }}>Consistency beats intensity, especially for IELTS. Pick a block and keep it realistic.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                {[10, 15, 20, 30].map((minutes) => (
                  <button key={minutes} onClick={() => setStudyMinutes(minutes)} style={{ border: 'none', borderRadius: 999, padding: '10px 14px', background: studyMinutes === minutes ? '#1c1917' : '#fff', color: studyMinutes === minutes ? '#fff' : '#44403c', fontWeight: 800, cursor: 'pointer' }}>
                    {minutes} min
                  </button>
                ))}
              </div>
              <div style={{ padding: 16, borderRadius: 18, background: '#fff7ed', color: '#7c2d12', lineHeight: 1.7 }}><strong>Today&apos;s focus:</strong> Finish one reading sprint, then choose either writing or speaking so the habit stays sustainable.</div>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ ...panel, padding: 18 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>4-Step Loop</div>
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  {[
                    'Warm up with 3 focus words and say them aloud.',
                    `Run ${active.label} in ${active.minutes}.`,
                    'Write one thesis sentence and two body ideas.',
                    'Speak for 60 to 90 seconds using one real example.',
                  ].map((item, index) => (
                    <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, borderRadius: 16, background: '#fff', border: '1px solid rgba(28,25,23,0.08)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{index + 1}</div>
                      <div style={{ color: '#44403c', lineHeight: 1.7 }}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...panel, padding: 18 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Focus Vocabulary</div>
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  {FOCUS_WORDS.map((item) => (
                    <div key={item.word} style={{ padding: 14, borderRadius: 16, background: '#fff', border: '1px solid rgba(28,25,23,0.08)' }}>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{item.word}</div>
                      <div style={{ marginTop: 4, color: '#57534e', lineHeight: 1.7 }}>{item.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        button, textarea { font: inherit; }
        @media (max-width: 960px) {
          div[style*="grid-template-columns: 1.2fr 0.8fr"],
          div[style*="grid-template-columns: 0.95fr 1.05fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
