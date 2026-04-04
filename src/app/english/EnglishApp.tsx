'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type AppTab = 'learn' | 'phrases' | 'quiz' | 'plan'

type VocabItem = {
  id: number
  word: string
  ipa: string
  meaning: string
  example: string
  exampleMeaning: string
  tip: string
  level: 'Starter' | 'Daily' | 'Work'
}

type PhraseItem = {
  id: number
  situation: string
  english: string
  ipa: string
  japanese: string
  note: string
}

type QuizItem = {
  id: number
  prompt: string
  choices: string[]
  answer: string
  explanation: string
}

const STORAGE_KEY = 'english-app-progress-v1'

const VOCAB: VocabItem[] = [
  { id: 1, word: 'introduce', ipa: '/ˌɪntrəˈduːs/', meaning: 'introduce, present', example: 'Let me introduce myself.', exampleMeaning: '自己紹介させてください。', tip: 'Useful when meeting someone new.', level: 'Starter' },
  { id: 2, word: 'schedule', ipa: '/ˈskedʒuːl/', meaning: 'schedule, plan', example: 'My schedule is full this week.', exampleMeaning: '今週は予定がいっぱいです。', tip: 'Often used for work and appointments.', level: 'Daily' },
  { id: 3, word: 'improve', ipa: '/ɪmˈpruːv/', meaning: 'to get better', example: 'I want to improve my English.', exampleMeaning: '英語を上達させたいです。', tip: 'Great verb for goals and habits.', level: 'Starter' },
  { id: 4, word: 'comfortable', ipa: '/ˈkʌmftərbəl/', meaning: 'feeling relaxed, at ease', example: 'I feel comfortable speaking with her.', exampleMeaning: '彼女と話すと安心します。', tip: 'Also used for clothes, rooms, and social situations.', level: 'Daily' },
  { id: 5, word: 'recommend', ipa: '/ˌrekəˈmend/', meaning: 'to suggest', example: 'Can you recommend a good movie?', exampleMeaning: 'おすすめの映画はありますか？', tip: 'Very common in travel and shopping.', level: 'Daily' },
  { id: 6, word: 'available', ipa: '/əˈveɪləbəl/', meaning: 'free, ready to use', example: 'Are you available tomorrow?', exampleMeaning: '明日空いていますか？', tip: 'A must-know word for scheduling.', level: 'Work' },
  { id: 7, word: 'confident', ipa: '/ˈkɑːnfɪdənt/', meaning: 'sure of yourself', example: 'She sounds confident in English.', exampleMeaning: '彼女は英語に自信があるように聞こえます。', tip: 'Pairs well with speaking and presenting.', level: 'Starter' },
  { id: 8, word: 'solve', ipa: '/sɑːlv/', meaning: 'to fix or answer', example: 'We solved the problem together.', exampleMeaning: '一緒に問題を解決しました。', tip: 'Useful in work, study, and daily life.', level: 'Work' },
  { id: 9, word: 'instead', ipa: '/ɪnˈsted/', meaning: 'in place of something else', example: 'I studied at home instead.', exampleMeaning: '代わりに家で勉強しました。', tip: 'Often used to compare choices.', level: 'Daily' },
  { id: 10, word: 'practice', ipa: '/ˈpræktɪs/', meaning: 'to repeat to improve', example: 'Practice a little every day.', exampleMeaning: '毎日少しずつ練習しましょう。', tip: 'Can be both a noun and a verb.', level: 'Starter' },
  { id: 11, word: 'deadline', ipa: '/ˈdedlaɪn/', meaning: 'final time to finish something', example: 'The deadline is Friday afternoon.', exampleMeaning: '締め切りは金曜の午後です。', tip: 'Important for school and work.', level: 'Work' },
  { id: 12, word: 'habit', ipa: '/ˈhæbɪt/', meaning: 'something you do regularly', example: 'Reading is a good habit.', exampleMeaning: '読書は良い習慣です。', tip: 'Helpful for self-improvement talk.', level: 'Daily' },
]

const PHRASES: PhraseItem[] = [
  { id: 1, situation: 'Meeting people', english: 'Nice to meet you. I am still learning English.', ipa: '/naɪs tə miːt juː. aɪ æm stɪl ˈlɝːnɪŋ ˈɪŋɡlɪʃ./', japanese: 'はじめまして。まだ英語を勉強中です。', note: 'Simple and honest. Great for lowering pressure in conversations.' },
  { id: 2, situation: 'Asking for help', english: 'Could you say that one more time, please?', ipa: '/kʊd juː seɪ ðæt wʌn mɔːr taɪm, pliːz?/', japanese: 'もう一度言ってもらえますか？', note: 'Polite and extremely useful in real conversations.' },
  { id: 3, situation: 'At work', english: 'I will finish this task by tomorrow morning.', ipa: '/aɪ wɪl ˈfɪnɪʃ ðɪs tæsk baɪ təˈmɑːroʊ ˈmɔːrnɪŋ./', japanese: 'この作業は明日の朝までに終わらせます。', note: 'Good structure for reporting progress clearly.' },
  { id: 4, situation: 'Daily life', english: 'I usually study for twenty minutes after dinner.', ipa: '/aɪ ˈjuːʒuəli ˈstʌdi fɔːr ˈtwenti ˈmɪnɪts ˈæftər ˈdɪnər./', japanese: 'たいてい夕食後に20分勉強します。', note: 'Useful sentence pattern for building routine talk.' },
  { id: 5, situation: 'Conversation', english: 'What do you mean by that?', ipa: '/wʌt də juː miːn baɪ ðæt?/', japanese: 'それはどういう意味ですか？', note: 'Helpful when you understand words but not intent.' },
  { id: 6, situation: 'Travel', english: 'Could you recommend a place to visit nearby?', ipa: '/kʊd juː ˌrekəˈmend ə pleɪs tə ˈvɪzɪt ˌnɪrˈbaɪ?/', japanese: 'この近くでおすすめの場所はありますか？', note: 'Great for restaurants, sightseeing, and local spots.' },
]

const QUIZ: QuizItem[] = [
  { id: 1, prompt: 'Which word means "to get better"?', choices: ['improve', 'deadline', 'introduce', 'instead'], answer: 'improve', explanation: '`Improve` is the verb for becoming better over time.' },
  { id: 2, prompt: 'Choose the best reply when you did not catch what someone said.', choices: ['I am habit.', 'Could you say that one more time, please?', 'I will recommend tomorrow.', 'Nice deadline.'], answer: 'Could you say that one more time, please?', explanation: 'This is the natural, polite sentence for asking repetition.' },
  { id: 3, prompt: 'Which word fits: "Are you ____ tomorrow afternoon?"', choices: ['available', 'comfortable', 'solve', 'practice'], answer: 'available', explanation: '`Available` means free or able to join.' },
  { id: 4, prompt: 'What is the best translation for "Reading is a good habit"?', choices: ['読書は良い習慣です。', '読むのは難しい問題です。', '本を買う予定です。', '読書は締め切りです。'], answer: '読書は良い習慣です。', explanation: '`Habit` means a regular action or routine.' },
  { id: 5, prompt: 'Choose the best sentence for a work update.', choices: ['I still learning task.', 'I finish maybe soon.', 'I will finish this task by tomorrow morning.', 'Nice to meet your schedule.'], answer: 'I will finish this task by tomorrow morning.', explanation: 'It is clear, natural, and includes timing.' },
]

function todayKey() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function EnglishApp() {
  const [tab, setTab] = useState<AppTab>('learn')
  const [selectedWordId, setSelectedWordId] = useState<number>(VOCAB[0].id)
  const [revealedWords, setRevealedWords] = useState<number[]>([])
  const [masteredWords, setMasteredWords] = useState<number[]>([])
  const [selectedPhraseId, setSelectedPhraseId] = useState<number>(PHRASES[0].id)
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const [studyMinutes, setStudyMinutes] = useState(15)
  const [lastVisit, setLastVisit] = useState('')
  const [streak, setStreak] = useState(1)
  const [voicesReady, setVoicesReady] = useState(false)
  const [voiceName, setVoiceName] = useState('')
  const [isNarrating, setIsNarrating] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as {
        revealedWords?: number[]
        masteredWords?: number[]
        studyMinutes?: number
        lastVisit?: string
        streak?: number
      }
      setRevealedWords(saved.revealedWords ?? [])
      setMasteredWords(saved.masteredWords ?? [])
      setStudyMinutes(saved.studyMinutes ?? 15)
      setLastVisit(saved.lastVisit ?? '')
      setStreak(saved.streak ?? 1)
    } catch {
      // ignore broken local data
    }
  }, [])

  useEffect(() => {
    const today = todayKey()
    let nextStreak = streak
    if (lastVisit && lastVisit !== today) {
      const current = new Date(today)
      const previous = new Date(lastVisit)
      const diff = Math.round((current.getTime() - previous.getTime()) / 86400000)
      nextStreak = diff === 1 ? streak + 1 : 1
      setStreak(nextStreak)
      setLastVisit(today)
    } else if (!lastVisit) {
      setLastVisit(today)
    }
  }, [lastVisit, streak])

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ revealedWords, masteredWords, studyMinutes, lastVisit, streak }),
      )
    } catch {
      // ignore storage errors
    }
  }, [revealedWords, masteredWords, studyMinutes, lastVisit, streak])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      const englishVoice =
        available.find((voice) => voice.lang.toLowerCase().startsWith('en-us')) ??
        available.find((voice) => voice.lang.toLowerCase().startsWith('en')) ??
        null

      setVoicesReady(available.length > 0)
      setVoiceName(englishVoice?.name ?? '')
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      window.speechSynthesis.cancel()
    }
  }, [])

  const selectedWord = VOCAB.find((item) => item.id === selectedWordId) ?? VOCAB[0]
  const selectedPhrase = PHRASES.find((item) => item.id === selectedPhraseId) ?? PHRASES[0]
  const quizItem = QUIZ[quizIndex]

  const progress = Math.round((masteredWords.length / VOCAB.length) * 100)
  const reviewWords = useMemo(
    () => VOCAB.filter((item) => !masteredWords.includes(item.id)).slice(0, 4),
    [masteredWords],
  )

  const learningPlan = useMemo(
    () => [
      { title: 'Warm up', detail: `Read ${reviewWords.length || 3} words aloud twice.`, accent: '#ef4444' },
      { title: 'Phrase drill', detail: 'Shadow one useful phrase for 3 minutes.', accent: '#0f766e' },
      { title: 'Quiz check', detail: `Answer ${QUIZ.length} quick questions without translating first.`, accent: '#2563eb' },
      { title: 'Real output', detail: 'Write one sentence about your day in English.', accent: '#ca8a04' },
    ],
    [reviewWords.length],
  )

  const revealWord = (id: number) => {
    if (revealedWords.includes(id)) return
    setRevealedWords((prev) => [...prev, id])
  }

  const toggleMastered = (id: number) => {
    setMasteredWords((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const submitAnswer = () => {
    if (!selectedAnswer) return
    if (selectedAnswer === quizItem.answer) {
      setQuizCorrect((prev) => prev + 1)
    }

    if (quizIndex === QUIZ.length - 1) {
      setQuizFinished(true)
      return
    }

    setQuizIndex((prev) => prev + 1)
    setSelectedAnswer(null)
  }

  const restartQuiz = () => {
    setQuizIndex(0)
    setSelectedAnswer(null)
    setQuizCorrect(0)
    setQuizFinished(false)
  }

  const shell: CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #fbf0d4 0%, #f7efe5 32%, #f4f4ef 100%)',
    color: '#1c1917',
    fontFamily: "'Manrope','Noto Sans JP',sans-serif",
  }

  const panel: CSSProperties = {
    background: 'rgba(255,255,255,0.84)',
    border: '1px solid rgba(28,25,23,0.08)',
    boxShadow: '0 20px 50px rgba(28,25,23,0.08)',
    backdropFilter: 'blur(12px)',
    borderRadius: 24,
  }

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const utterance = new SpeechSynthesisUtterance(text)
    const available = window.speechSynthesis.getVoices()
    const englishVoice =
      available.find((voice) => voice.name === voiceName) ??
      available.find((voice) => voice.lang.toLowerCase().startsWith('en-us')) ??
      available.find((voice) => voice.lang.toLowerCase().startsWith('en')) ??
      null

    utterance.voice = englishVoice
    utterance.lang = englishVoice?.lang ?? 'en-US'
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.onstart = () => setIsNarrating(true)
    utterance.onend = () => setIsNarrating(false)
    utterance.onerror = () => setIsNarrating(false)

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div style={shell}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 18px 100px' }}>
        <div style={{ ...panel, padding: 24, marginBottom: 18, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 'auto -60px -80px auto', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18), rgba(37,99,235,0))' }} />
          <div style={{ position: 'absolute', inset: '-40px auto auto -20px', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.18), rgba(245,158,11,0))' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#57534e', marginBottom: 10 }}>
                English Learning Studio
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1, letterSpacing: -2 }}>
                Learn English
                <br />
                a little every day.
              </h1>
              <p style={{ margin: '14px 0 0', maxWidth: 560, fontSize: 15, lineHeight: 1.7, color: '#57534e' }}>
                Build real conversation confidence with bite-sized vocabulary, practical phrases, and quick quizzes. Designed to feel friendly on both phone and desktop.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <button
                  onClick={() => speakText('Welcome back. Let us practice English together.')}
                  style={{ border: 'none', borderRadius: 999, padding: '11px 14px', background: '#1c1917', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  {isNarrating ? 'Narrating...' : 'Play welcome narration'}
                </button>
                <span style={{ alignSelf: 'center', fontSize: 13, color: '#78716c' }}>
                  {voicesReady ? `Voice: ${voiceName || 'English system voice'}` : 'Narration uses your browser voice when available.'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', gap: 10, minWidth: 'min(100%, 300px)' }}>
              {[
                { label: 'Mastered', value: `${masteredWords.length}/${VOCAB.length}`, tone: '#dc2626' },
                { label: 'Streak', value: `${streak} days`, tone: '#2563eb' },
                { label: 'Study block', value: `${studyMinutes} min`, tone: '#ca8a04' },
                { label: 'Progress', value: `${progress}%`, tone: '#0f766e' },
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
            { id: 'learn', label: 'Words' },
            { id: 'phrases', label: 'Phrases' },
            { id: 'quiz', label: 'Quiz' },
            { id: 'plan', label: 'Plan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as AppTab)}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '12px 18px',
                background: tab === item.id ? '#1c1917' : 'rgba(255,255,255,0.72)',
                color: tab === item.id ? '#fafaf9' : '#44403c',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: tab === item.id ? '0 12px 30px rgba(28,25,23,0.18)' : 'none',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'learn' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 18 }}>
            <div style={{ ...panel, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Word Deck</div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>Core vocabulary</div>
                </div>
                <div style={{ minWidth: 180 }}>
                  <div style={{ height: 10, borderRadius: 999, background: '#e7e5e4', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #dc2626, #f59e0b, #0f766e)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {VOCAB.map((item) => {
                  const isMastered = masteredWords.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedWordId(item.id)}
                      style={{
                        border: selectedWordId === item.id ? '1px solid #1c1917' : '1px solid rgba(28,25,23,0.08)',
                        background: isMastered ? '#f0fdf4' : '#fff',
                        borderRadius: 18,
                        padding: '14px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 800 }}>{item.word}</div>
                          <div style={{ color: '#2563eb', marginTop: 4, fontSize: 12, fontFamily: "'JetBrains Mono','Consolas',monospace" }}>{item.ipa}</div>
                          <div style={{ color: '#78716c', marginTop: 4, fontSize: 13 }}>{revealedWords.includes(item.id) ? item.meaning : 'Tap reveal in the detail card'}</div>
                        </div>
                        <div style={{ display: 'grid', gap: 6, justifyItems: 'end' }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#57534e', background: '#f5f5f4', padding: '5px 8px', borderRadius: 999 }}>{item.level}</span>
                          {isMastered && <span style={{ fontSize: 11, fontWeight: 800, color: '#166534' }}>Mastered</span>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ ...panel, padding: 22, alignSelf: 'start' }}>
              <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Detail</div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>{selectedWord.word}</div>
                  <div style={{ marginTop: 8, color: '#2563eb', fontSize: 14, fontFamily: "'JetBrains Mono','Consolas',monospace" }}>{selectedWord.ipa}</div>
                  <div style={{ marginTop: 8, color: '#57534e', fontSize: 15 }}>
                    {revealedWords.includes(selectedWord.id) ? selectedWord.meaning : 'Meaning hidden for active recall'}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#57534e', background: '#f5f5f4', padding: '6px 10px', borderRadius: 999 }}>{selectedWord.level}</span>
              </div>

              <div style={{ marginTop: 18, background: '#fffbeb', borderRadius: 18, padding: 16, border: '1px solid rgba(202,138,4,0.12)' }}>
                <div style={{ fontSize: 12, color: '#a16207', fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>Example</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}>{selectedWord.example}</div>
                <div style={{ marginTop: 8, color: '#78716c', lineHeight: 1.6 }}>{selectedWord.exampleMeaning}</div>
              </div>

              <div style={{ marginTop: 16, fontSize: 14, color: '#57534e', lineHeight: 1.7 }}>
                <strong style={{ color: '#1c1917' }}>Coach tip:</strong> {selectedWord.tip}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                <button
                  onClick={() => speakText(selectedWord.word)}
                  style={{ border: 'none', borderRadius: 14, padding: '12px 14px', background: '#0f766e', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Hear word
                </button>
                <button
                  onClick={() => speakText(selectedWord.example)}
                  style={{ border: 'none', borderRadius: 14, padding: '12px 14px', background: '#7c3aed', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Hear example
                </button>
                <button
                  onClick={() => revealWord(selectedWord.id)}
                  style={{ border: 'none', borderRadius: 14, padding: '12px 14px', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Reveal meaning
                </button>
                <button
                  onClick={() => toggleMastered(selectedWord.id)}
                  style={{ border: '1px solid rgba(28,25,23,0.12)', borderRadius: 14, padding: '12px 14px', background: '#fff', color: '#1c1917', fontWeight: 800, cursor: 'pointer' }}
                >
                  {masteredWords.includes(selectedWord.id) ? 'Unmark mastered' : 'Mark mastered'}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'phrases' && (
          <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 18 }}>
            <div style={{ ...panel, padding: 18 }}>
              <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800, marginBottom: 16 }}>Situations</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {PHRASES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPhraseId(item.id)}
                    style={{
                      border: selectedPhraseId === item.id ? '1px solid #0f766e' : '1px solid rgba(28,25,23,0.08)',
                      background: selectedPhraseId === item.id ? '#f0fdfa' : '#fff',
                      borderRadius: 18,
                      padding: '14px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{item.situation}</div>
                    <div style={{ marginTop: 6, color: '#2563eb', fontSize: 12, fontFamily: "'JetBrains Mono','Consolas',monospace" }}>{item.ipa}</div>
                    <div style={{ marginTop: 6, color: '#78716c', fontSize: 13 }}>{item.english}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...panel, padding: 24 }}>
              <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Phrase Drill</div>
              <div style={{ marginTop: 12, fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>{selectedPhrase.english}</div>
              <div style={{ marginTop: 10, color: '#2563eb', fontSize: 14, fontFamily: "'JetBrains Mono','Consolas',monospace" }}>{selectedPhrase.ipa}</div>
              <div style={{ marginTop: 14, fontSize: 16, color: '#57534e', lineHeight: 1.7 }}>{selectedPhrase.japanese}</div>
              <div style={{ marginTop: 18, padding: 16, borderRadius: 18, background: '#ecfeff', color: '#155e75', lineHeight: 1.7 }}>
                <strong>Practice note:</strong> {selectedPhrase.note}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <button
                  onClick={() => speakText(selectedPhrase.english)}
                  style={{ border: 'none', borderRadius: 14, padding: '12px 14px', background: '#0f766e', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Hear phrase
                </button>
                <button
                  onClick={() => speakText(`${selectedPhrase.english} ${selectedPhrase.english}`)}
                  style={{ border: 'none', borderRadius: 14, padding: '12px 14px', background: '#1d4ed8', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Loop twice
                </button>
              </div>

              <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <div style={{ padding: 16, borderRadius: 18, background: '#fff', border: '1px solid rgba(28,25,23,0.08)' }}>
                  <div style={{ fontSize: 12, color: '#78716c', fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>Shadow</div>
                  <div style={{ marginTop: 8, lineHeight: 1.7, color: '#44403c' }}>Listen in your head, then repeat the sentence three times with the same rhythm.</div>
                </div>
                <div style={{ padding: 16, borderRadius: 18, background: '#fff', border: '1px solid rgba(28,25,23,0.08)' }}>
                  <div style={{ fontSize: 12, color: '#78716c', fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>Swap</div>
                  <div style={{ marginTop: 8, lineHeight: 1.7, color: '#44403c' }}>Change one detail: tomorrow, nearby, after work, in Tokyo, with my friend.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'quiz' && (
          <div style={{ ...panel, padding: 22, maxWidth: 820, margin: '0 auto' }}>
            {!quizFinished ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Quick Quiz</div>
                    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{quizItem.prompt}</div>
                  </div>
                  <div style={{ minWidth: 140, textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#78716c' }}>Question {quizIndex + 1} / {QUIZ.length}</div>
                    <div style={{ marginTop: 8, height: 10, background: '#e7e5e4', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${((quizIndex + 1) / QUIZ.length) * 100}%`, height: '100%', background: '#2563eb' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
                  {quizItem.choices.map((choice) => (
                    <button
                      key={choice}
                      onClick={() => setSelectedAnswer(choice)}
                      style={{
                        border: selectedAnswer === choice ? '2px solid #2563eb' : '1px solid rgba(28,25,23,0.08)',
                        background: selectedAnswer === choice ? '#eff6ff' : '#fff',
                        borderRadius: 18,
                        padding: '16px 18px',
                        textAlign: 'left',
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: '#1c1917',
                      }}
                    >
                      {choice}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 18, padding: 16, borderRadius: 18, background: '#fafaf9', color: '#57534e', lineHeight: 1.7 }}>
                  <strong style={{ color: '#1c1917' }}>Hint:</strong> Try to answer in English first, then check the explanation after you submit.
                </div>

                {selectedAnswer && (
                  <div style={{ marginTop: 16, padding: 16, borderRadius: 18, background: selectedAnswer === quizItem.answer ? '#f0fdf4' : '#fef2f2', color: '#44403c', lineHeight: 1.7 }}>
                    <strong style={{ color: '#1c1917' }}>{selectedAnswer === quizItem.answer ? 'Correct.' : 'Not quite.'}</strong> {quizItem.explanation}
                  </div>
                )}

                <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 14, color: '#57534e', alignSelf: 'center' }}>Score so far: <strong style={{ color: '#1c1917' }}>{quizCorrect}</strong></div>
                  <button
                    onClick={submitAnswer}
                    disabled={!selectedAnswer}
                    style={{
                      border: 'none',
                      borderRadius: 14,
                      padding: '12px 16px',
                      background: selectedAnswer ? '#1c1917' : '#d6d3d1',
                      color: '#fff',
                      fontWeight: 800,
                      cursor: selectedAnswer ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {quizIndex === QUIZ.length - 1 ? 'Finish quiz' : 'Next question'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 6px' }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Result</div>
                <div style={{ fontSize: 58, fontWeight: 800, marginTop: 10 }}>{quizCorrect}/{QUIZ.length}</div>
                <div style={{ fontSize: 18, color: '#57534e', marginTop: 8 }}>
                  {quizCorrect === QUIZ.length ? 'Perfect run. Keep the momentum.' : quizCorrect >= 3 ? 'Nice work. One more round will lock it in.' : 'Good start. Review the words tab and try again.'}
                </div>
                <button
                  onClick={restartQuiz}
                  style={{ marginTop: 20, border: 'none', borderRadius: 14, padding: '12px 16px', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Restart quiz
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'plan' && (
          <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 18 }}>
            <div style={{ ...panel, padding: 22 }}>
              <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Daily Plan</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>A small plan you can actually keep.</div>
              <p style={{ margin: '10px 0 18px', color: '#57534e', lineHeight: 1.7 }}>
                Consistency beats intensity. Choose a study block you can repeat comfortably, then use the four-step routine below.
              </p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                {[10, 15, 20, 30].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setStudyMinutes(minutes)}
                    style={{
                      border: 'none',
                      borderRadius: 999,
                      padding: '10px 14px',
                      background: studyMinutes === minutes ? '#1c1917' : '#fff',
                      color: studyMinutes === minutes ? '#fff' : '#44403c',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>

              <div style={{ padding: 16, borderRadius: 18, background: '#fff7ed', color: '#7c2d12', lineHeight: 1.7 }}>
                <strong>Today&apos;s focus:</strong> Study for {studyMinutes} minutes, say one phrase out loud, and finish with one original sentence.
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {learningPlan.map((item, index) => (
                <div key={item.title} style={{ ...panel, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 14, background: `${item.accent}18`, color: item.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{item.title}</div>
                      <div style={{ marginTop: 4, color: '#57534e', lineHeight: 1.7 }}>{item.detail}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ ...panel, padding: 18 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c', fontWeight: 800 }}>Review Queue</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {reviewWords.length > 0 ? reviewWords.map((item) => (
                    <span key={item.id} style={{ background: '#fff', border: '1px solid rgba(28,25,23,0.08)', borderRadius: 999, padding: '10px 12px', fontWeight: 700 }}>
                      {item.word}
                    </span>
                  )) : (
                    <span style={{ color: '#166534', fontWeight: 700 }}>Everything is marked mastered. Add more words next.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        button, input, textarea { font: inherit; }
        @media (max-width: 860px) {
          div[style*="grid-template-columns: 1.1fr 0.9fr"],
          div[style*="grid-template-columns: 0.9fr 1.1fr"],
          div[style*="grid-template-columns: 0.95fr 1.05fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
