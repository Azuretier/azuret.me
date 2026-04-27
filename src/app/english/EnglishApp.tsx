'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type GameTab = 'vocab' | 'grammar' | 'dialogue' | 'review'

type VocabRound = {
  id: number
  word: string
  options: string[]
  answer: string
  hint: string
  example: string
}

type GrammarRound = {
  id: number
  prompt: string
  options: string[]
  answer: string
  explanation: string
}

type DialogueRound = {
  id: number
  situation: string
  line: string
  options: string[]
  answer: string
  reason: string
}

const STORAGE_KEY = 'english-adventure-lab-v2'

const VOCAB_ROUNDS: VocabRound[] = [
  {
    id: 1,
    word: 'resilient',
    options: ['easily broken', 'quick to recover from difficulty', 'very expensive', 'extremely quiet'],
    answer: 'quick to recover from difficulty',
    hint: 'Think of a person who faces stress and still keeps going.',
    example: 'After failing the first test, Mina was resilient and made a better study plan.',
  },
  {
    id: 2,
    word: 'evaluate',
    options: ['hide from', 'throw away', 'carefully judge quality', 'repeat loudly'],
    answer: 'carefully judge quality',
    hint: 'Teachers do this when they check essays with criteria.',
    example: 'Before buying a course, evaluate the reviews and lesson quality.',
  },
  {
    id: 3,
    word: 'precise',
    options: ['exact and accurate', 'too late to use', 'full of emotion', 'hard to understand'],
    answer: 'exact and accurate',
    hint: 'A precise answer has no unnecessary words.',
    example: 'Use precise language in IELTS writing to avoid vague ideas.',
  },
  {
    id: 4,
    word: 'maintain',
    options: ['argue with everyone', 'keep at the same level', 'learn instantly', 'forget completely'],
    answer: 'keep at the same level',
    hint: 'You can maintain focus for 25 minutes during deep work.',
    example: 'It is hard to maintain motivation without a weekly routine.',
  },
]

const GRAMMAR_ROUNDS: GrammarRound[] = [
  {
    id: 1,
    prompt: 'By the time I arrived, the movie ____.',
    options: ['has started', 'had started', 'will start', 'starts'],
    answer: 'had started',
    explanation: 'Past perfect is used for an action completed before another past action.',
  },
  {
    id: 2,
    prompt: 'If she ____ more confident, she would speak in public more often.',
    options: ['is', 'was', 'were', 'has been'],
    answer: 'were',
    explanation: 'Second conditional uses "if + past simple" and "would + base verb".',
  },
  {
    id: 3,
    prompt: 'The report ____ before the manager came to the office.',
    options: ['finished', 'was finishing', 'had been finished', 'has finished'],
    answer: 'had been finished',
    explanation: 'Passive past perfect fits because the report received the action before another past event.',
  },
  {
    id: 4,
    prompt: 'Neither the students nor the teacher ____ ready for the surprise quiz.',
    options: ['were', 'are', 'was', 'be'],
    answer: 'was',
    explanation: 'With “neither...nor,” the verb agrees with the noun closest to it: teacher (singular).',
  },
]

const DIALOGUE_ROUNDS: DialogueRound[] = [
  {
    id: 1,
    situation: 'You are joining an online study group for the first time.',
    line: 'Choose the most natural opening sentence.',
    options: ['Give me your notes now.', 'Hi everyone, I am Alex. Could I join today’s discussion?', 'I cannot hear you, bye.', 'This meeting is boring.'],
    answer: 'Hi everyone, I am Alex. Could I join today’s discussion?',
    reason: 'It is polite, clear, and invites collaboration.',
  },
  {
    id: 2,
    situation: 'You did not understand part of a lecture.',
    line: 'Choose the best follow-up question.',
    options: ['Repeat everything from the beginning.', 'Why is this so hard?', 'Could you clarify what you meant by “data bias”?', 'I will just guess.'],
    answer: 'Could you clarify what you meant by “data bias”?',
    reason: 'Specific clarification questions improve both speaking and listening skills.',
  },
  {
    id: 3,
    situation: 'Your teammate missed a deadline.',
    line: 'Choose the most constructive response.',
    options: ['You always ruin projects.', 'Can we review what blocked you and set a new plan?', 'Do not talk to me again.', 'I will do everything alone forever.'],
    answer: 'Can we review what blocked you and set a new plan?',
    reason: 'This language is professional and solution-focused.',
  },
]

const DAILY_MISSIONS = [
  'Complete 1 vocabulary round with zero mistakes.',
  'Score 3/4 or higher in grammar arena.',
  'Finish all dialogue scenes and read feedback aloud.',
]

export default function EnglishApp() {
  const [tab, setTab] = useState<GameTab>('vocab')
  const [vocabAnswers, setVocabAnswers] = useState<Record<number, string>>({})
  const [grammarAnswers, setGrammarAnswers] = useState<Record<number, string>>({})
  const [dialogueAnswers, setDialogueAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as {
        vocabAnswers?: Record<number, string>
        grammarAnswers?: Record<number, string>
        dialogueAnswers?: Record<number, string>
        xp?: number
        streak?: number
        bestScore?: number
        notes?: string
      }
      setVocabAnswers(saved.vocabAnswers ?? {})
      setGrammarAnswers(saved.grammarAnswers ?? {})
      setDialogueAnswers(saved.dialogueAnswers ?? {})
      setXp(saved.xp ?? 0)
      setStreak(saved.streak ?? 0)
      setBestScore(saved.bestScore ?? 0)
      setNotes(saved.notes ?? '')
    } catch {
      // ignore broken local storage
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ vocabAnswers, grammarAnswers, dialogueAnswers, xp, streak, bestScore, notes }),
      )
    } catch {
      // ignore local storage failures
    }
  }, [vocabAnswers, grammarAnswers, dialogueAnswers, xp, streak, bestScore, notes])

  const vocabScore = useMemo(
    () => VOCAB_ROUNDS.reduce((sum, round) => sum + (vocabAnswers[round.id] === round.answer ? 1 : 0), 0),
    [vocabAnswers],
  )
  const grammarScore = useMemo(
    () => GRAMMAR_ROUNDS.reduce((sum, round) => sum + (grammarAnswers[round.id] === round.answer ? 1 : 0), 0),
    [grammarAnswers],
  )
  const dialogueScore = useMemo(
    () => DIALOGUE_ROUNDS.reduce((sum, round) => sum + (dialogueAnswers[round.id] === round.answer ? 1 : 0), 0),
    [dialogueAnswers],
  )

  const totalQuestions = VOCAB_ROUNDS.length + GRAMMAR_ROUNDS.length + DIALOGUE_ROUNDS.length
  const totalScore = vocabScore + grammarScore + dialogueScore
  const level = Math.floor(xp / 120) + 1
  const xpToNext = 120 - (xp % 120)

  const completeRun = () => {
    const runXp = totalScore * 15
    setXp((prev) => prev + runXp)
    setShowResults(true)
    setStreak((prev) => (totalScore >= 8 ? prev + 1 : 0))
    setBestScore((prev) => Math.max(prev, totalScore))
  }

  const resetRun = () => {
    setVocabAnswers({})
    setGrammarAnswers({})
    setDialogueAnswers({})
    setShowResults(false)
  }

  const shell: CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #ebf4ff 0%, #eef7e9 45%, #fff8e8 100%)',
    color: '#111827',
    fontFamily: "'Inter','Noto Sans',sans-serif",
    padding: '34px 16px 72px',
  }

  const card: CSSProperties = {
    background: 'rgba(255,255,255,0.86)',
    border: '1px solid rgba(17,24,39,0.1)',
    borderRadius: 20,
    boxShadow: '0 16px 40px rgba(17,24,39,0.08)',
    padding: 20,
  }

  return (
    <main style={shell}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gap: 16 }}>
        <section style={{ ...card, display: 'grid', gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.7rem, 4vw, 2.5rem)' }}>English Adventure Lab</h1>
          <p style={{ margin: 0, color: '#374151' }}>
            A rebuilt game-style learning app: train vocabulary, grammar, and real conversation choices in one loop.
          </p>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <Stat label="Level" value={`Lv.${level}`} />
            <Stat label="XP" value={`${xp} XP`} />
            <Stat label="Next Level" value={`${xpToNext} XP left`} />
            <Stat label="Current Streak" value={`${streak} day`} />
            <Stat label="Best Run" value={`${bestScore}/${totalQuestions}`} />
          </div>
        </section>

        <section style={{ ...card, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {([
            ['vocab', 'Word Quest'],
            ['grammar', 'Grammar Arena'],
            ['dialogue', 'Dialogue Battle'],
            ['review', 'Review Room'],
          ] as Array<[GameTab, string]>).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                border: '1px solid rgba(17,24,39,0.18)',
                borderRadius: 999,
                padding: '10px 16px',
                background: tab === key ? '#111827' : '#fff',
                color: tab === key ? '#fff' : '#111827',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {label}
            </button>
          ))}
        </section>

        {tab === 'vocab' && (
          <section style={{ ...card, display: 'grid', gap: 14 }}>
            <h2 style={{ margin: 0 }}>Word Quest</h2>
            {VOCAB_ROUNDS.map((round) => (
              <article key={round.id} style={{ borderTop: '1px dashed #d1d5db', paddingTop: 12 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 700 }}>{round.id}. {round.word}</p>
                <p style={{ margin: '0 0 8px', color: '#4b5563' }}>Hint: {round.hint}</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {round.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setVocabAnswers((prev) => ({ ...prev, [round.id]: option }))}
                      style={{
                        textAlign: 'left',
                        border: '1px solid #d1d5db',
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: vocabAnswers[round.id] === option ? '#dbeafe' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        {tab === 'grammar' && (
          <section style={{ ...card, display: 'grid', gap: 14 }}>
            <h2 style={{ margin: 0 }}>Grammar Arena</h2>
            {GRAMMAR_ROUNDS.map((round) => (
              <article key={round.id} style={{ borderTop: '1px dashed #d1d5db', paddingTop: 12 }}>
                <p style={{ margin: '0 0 10px', fontWeight: 700 }}>{round.prompt}</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {round.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setGrammarAnswers((prev) => ({ ...prev, [round.id]: option }))}
                      style={{
                        textAlign: 'left',
                        border: '1px solid #d1d5db',
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: grammarAnswers[round.id] === option ? '#dcfce7' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        {tab === 'dialogue' && (
          <section style={{ ...card, display: 'grid', gap: 14 }}>
            <h2 style={{ margin: 0 }}>Dialogue Battle</h2>
            {DIALOGUE_ROUNDS.map((round) => (
              <article key={round.id} style={{ borderTop: '1px dashed #d1d5db', paddingTop: 12 }}>
                <p style={{ margin: '0 0 8px', color: '#1d4ed8' }}>{round.situation}</p>
                <p style={{ margin: '0 0 10px', fontWeight: 700 }}>{round.line}</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {round.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setDialogueAnswers((prev) => ({ ...prev, [round.id]: option }))}
                      style={{
                        textAlign: 'left',
                        border: '1px solid #d1d5db',
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: dialogueAnswers[round.id] === option ? '#fef3c7' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        {tab === 'review' && (
          <section style={{ ...card, display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Review Room</h2>
            <p style={{ margin: 0, color: '#374151' }}>
              Write a short reflection after each run. This improves retention and active recall.
            </p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What mistakes did you make today? What will you fix in tomorrow's session?"
              style={{ minHeight: 120, borderRadius: 12, border: '1px solid #d1d5db', padding: 12 }}
            />
            <div style={{ display: 'grid', gap: 6 }}>
              <strong>Daily Missions</strong>
              {DAILY_MISSIONS.map((mission) => (
                <span key={mission}>• {mission}</span>
              ))}
            </div>
          </section>
        )}

        <section style={{ ...card, display: 'grid', gap: 10 }}>
          <h2 style={{ margin: 0 }}>Finish Run</h2>
          <p style={{ margin: 0 }}>Current score: {totalScore}/{totalQuestions}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={completeRun}
              style={{ border: 'none', borderRadius: 12, background: '#111827', color: '#fff', padding: '10px 14px', cursor: 'pointer' }}
            >
              Submit Adventure
            </button>
            <button
              onClick={resetRun}
              style={{ border: '1px solid #d1d5db', borderRadius: 12, background: '#fff', padding: '10px 14px', cursor: 'pointer' }}
            >
              Reset Answers
            </button>
          </div>

          {showResults && (
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'grid', gap: 8 }}>
              <strong>Run Summary</strong>
              <span>Vocabulary: {vocabScore}/{VOCAB_ROUNDS.length}</span>
              <span>Grammar: {grammarScore}/{GRAMMAR_ROUNDS.length}</span>
              <span>Dialogue: {dialogueScore}/{DIALOGUE_ROUNDS.length}</span>
              <span>XP earned this run: +{totalScore * 15}</span>
              <p style={{ margin: 0, color: '#4b5563' }}>
                Tips: Review every wrong question and say the corrected sentence aloud twice for better fluency.
              </p>
            </div>
          )}
        </section>

        {showResults && (
          <section style={{ ...card, display: 'grid', gap: 10 }}>
            <h3 style={{ margin: 0 }}>Correction Feed</h3>
            {VOCAB_ROUNDS.filter((round) => vocabAnswers[round.id] !== round.answer).map((round) => (
              <div key={`vocab-${round.id}`}>
                <strong>{round.word}</strong>: {round.answer}. <span style={{ color: '#4b5563' }}>{round.example}</span>
              </div>
            ))}
            {GRAMMAR_ROUNDS.filter((round) => grammarAnswers[round.id] !== round.answer).map((round) => (
              <div key={`grammar-${round.id}`}>
                <strong>{round.prompt}</strong> → {round.answer}. <span style={{ color: '#4b5563' }}>{round.explanation}</span>
              </div>
            ))}
            {DIALOGUE_ROUNDS.filter((round) => dialogueAnswers[round.id] !== round.answer).map((round) => (
              <div key={`dialogue-${round.id}`}>
                <strong>{round.situation}</strong> → {round.answer}. <span style={{ color: '#4b5563' }}>{round.reason}</span>
              </div>
            ))}
            {totalScore === totalQuestions && <p style={{ margin: 0 }}>Perfect run. Great clarity and control 👏</p>}
          </section>
        )}
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 12, background: '#fff' }}>
      <div style={{ color: '#6b7280', fontSize: 12 }}>{label}</div>
      <strong>{value}</strong>
    </div>
  )
}
