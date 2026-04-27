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

const STORAGE_KEY = 'english-command-center-v3'

const VOCAB_ROUNDS: VocabRound[] = [
  {
    id: 1,
    word: 'resilient',
    options: ['easily broken', 'quick to recover from difficulty', 'very expensive', 'extremely quiet'],
    answer: 'quick to recover from difficulty',
    hint: 'Think about someone who bounces back after a difficult week.',
    example: 'After a rough mock test, she stayed resilient and improved fast.',
  },
  {
    id: 2,
    word: 'evaluate',
    options: ['hide from', 'throw away', 'carefully judge quality', 'repeat loudly'],
    answer: 'carefully judge quality',
    hint: 'You do this before deciding if a source is trustworthy.',
    example: 'Always evaluate evidence before making a strong argument.',
  },
  {
    id: 3,
    word: 'precise',
    options: ['exact and accurate', 'too late to use', 'full of emotion', 'hard to understand'],
    answer: 'exact and accurate',
    hint: 'Precise writing avoids vague words and unclear claims.',
    example: 'Her precise thesis statement made the whole essay coherent.',
  },
  {
    id: 4,
    word: 'maintain',
    options: ['argue with everyone', 'keep at the same level', 'learn instantly', 'forget completely'],
    answer: 'keep at the same level',
    hint: 'Try to maintain focus during your 25-minute study sprint.',
    example: 'He maintained a steady routine for three months.',
  },
]

const GRAMMAR_ROUNDS: GrammarRound[] = [
  {
    id: 1,
    prompt: 'By the time I arrived, the movie ____.',
    options: ['has started', 'had started', 'will start', 'starts'],
    answer: 'had started',
    explanation: 'Past perfect shows one past action happened before another past action.',
  },
  {
    id: 2,
    prompt: 'If she ____ more confident, she would speak in public more often.',
    options: ['is', 'was', 'were', 'has been'],
    answer: 'were',
    explanation: 'Second conditional: if + past simple, would + base verb.',
  },
  {
    id: 3,
    prompt: 'The report ____ before the manager came to the office.',
    options: ['finished', 'was finishing', 'had been finished', 'has finished'],
    answer: 'had been finished',
    explanation: 'Passive past perfect is correct because the report received the action first.',
  },
  {
    id: 4,
    prompt: 'Neither the students nor the teacher ____ ready for the surprise quiz.',
    options: ['were', 'are', 'was', 'be'],
    answer: 'was',
    explanation: 'The verb agrees with the closest subject: teacher (singular).',
  },
]

const DIALOGUE_ROUNDS: DialogueRound[] = [
  {
    id: 1,
    situation: 'You are joining an online study group for the first time.',
    line: 'Choose the most natural opening sentence.',
    options: ['Give me your notes now.', 'Hi everyone, I am Alex. Could I join today’s discussion?', 'I cannot hear you, bye.', 'This meeting is boring.'],
    answer: 'Hi everyone, I am Alex. Could I join today’s discussion?',
    reason: 'Polite and collaborative language makes communication smoother.',
  },
  {
    id: 2,
    situation: 'You did not understand part of a lecture.',
    line: 'Choose the best follow-up question.',
    options: ['Repeat everything from the beginning.', 'Why is this so hard?', 'Could you clarify what you meant by “data bias”?', 'I will just guess.'],
    answer: 'Could you clarify what you meant by “data bias”?',
    reason: 'Specific questions improve both speaking precision and listening comprehension.',
  },
  {
    id: 3,
    situation: 'Your teammate missed a deadline.',
    line: 'Choose the most constructive response.',
    options: ['You always ruin projects.', 'Can we review what blocked you and set a new plan?', 'Do not talk to me again.', 'I will do everything alone forever.'],
    answer: 'Can we review what blocked you and set a new plan?',
    reason: 'Solution-focused language supports teamwork and avoids conflict escalation.',
  },
]

const DAILY_MISSIONS = [
  'Perfect at least 1 vocabulary card set.',
  'Hit 75% or more in grammar arena.',
  'Complete all dialogue scenes and review mistakes out loud.',
]

const tabs: Array<{ id: GameTab; label: string; tag: string }> = [
  { id: 'vocab', label: 'Word Quest', tag: 'Vocabulary' },
  { id: 'grammar', label: 'Grammar Arena', tag: 'Accuracy' },
  { id: 'dialogue', label: 'Dialogue Lab', tag: 'Fluency' },
  { id: 'review', label: 'Review Room', tag: 'Retention' },
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
  const progress = Math.round((totalScore / totalQuestions) * 100)
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

  return (
    <main style={styles.shell}>
      <div style={styles.topGlow} />
      <div style={styles.sideGlow} />

      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>NoNICK-inspired Command Center UI</div>
          <h1 style={styles.title}>English Command Center</h1>
          <p style={styles.subtitle}>
            Learn faster with a premium dashboard flow: vocabulary, grammar, and dialogue missions in a single game loop.
          </p>

          <div style={styles.statGrid}>
            <Stat label="Level" value={`LV.${level}`} />
            <Stat label="XP" value={`${xp}`} />
            <Stat label="Next" value={`${xpToNext} XP`} />
            <Stat label="Streak" value={`${streak} day`} />
            <Stat label="Best" value={`${bestScore}/${totalQuestions}`} />
          </div>

          <div style={styles.progressWrap}>
            <div style={styles.progressMeta}>
              <span>Mission Progress</span>
              <strong>{progress}%</strong>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <section style={styles.tabsWrap}>
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                ...styles.tab,
                ...(tab === item.id ? styles.tabActive : {}),
              }}
            >
              <small>{item.tag}</small>
              <strong>{item.label}</strong>
            </button>
          ))}
        </section>

        {tab === 'vocab' && (
          <section style={styles.panel}>
            <PanelHeading title="Word Quest" note="Train meaning recognition with context hints." />
            {VOCAB_ROUNDS.map((round) => (
              <QuestionBlock
                key={round.id}
                title={`${round.id}. ${round.word}`}
                subtitle={`Hint: ${round.hint}`}
                options={round.options}
                selected={vocabAnswers[round.id]}
                onPick={(option) => setVocabAnswers((prev) => ({ ...prev, [round.id]: option }))}
              />
            ))}
          </section>
        )}

        {tab === 'grammar' && (
          <section style={styles.panel}>
            <PanelHeading title="Grammar Arena" note="Sharpen tense and structure decisions quickly." />
            {GRAMMAR_ROUNDS.map((round) => (
              <QuestionBlock
                key={round.id}
                title={round.prompt}
                options={round.options}
                selected={grammarAnswers[round.id]}
                onPick={(option) => setGrammarAnswers((prev) => ({ ...prev, [round.id]: option }))}
              />
            ))}
          </section>
        )}

        {tab === 'dialogue' && (
          <section style={styles.panel}>
            <PanelHeading title="Dialogue Lab" note="Pick natural English responses for real situations." />
            {DIALOGUE_ROUNDS.map((round) => (
              <QuestionBlock
                key={round.id}
                title={round.line}
                subtitle={round.situation}
                options={round.options}
                selected={dialogueAnswers[round.id]}
                onPick={(option) => setDialogueAnswers((prev) => ({ ...prev, [round.id]: option }))}
              />
            ))}
          </section>
        )}

        {tab === 'review' && (
          <section style={styles.panel}>
            <PanelHeading title="Review Room" note="Reflection improves long-term retention." />
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Write your reflection: mistakes, better phrasing, and next practice focus."
              style={styles.textArea}
            />
            <div style={styles.missionCard}>
              <strong>Daily Missions</strong>
              {DAILY_MISSIONS.map((mission) => (
                <span key={mission}>• {mission}</span>
              ))}
            </div>
          </section>
        )}

        <section style={styles.footerPanel}>
          <div>
            <h2 style={{ margin: 0 }}>Submit Run</h2>
            <p style={{ margin: '6px 0 0', color: '#9ca3af' }}>
              Current score: {totalScore}/{totalQuestions}
            </p>
          </div>
          <div style={styles.actionRow}>
            <button onClick={completeRun} style={styles.primaryButton}>Submit Adventure</button>
            <button onClick={resetRun} style={styles.secondaryButton}>Reset Answers</button>
          </div>
        </section>

        {showResults && (
          <section style={styles.panel}>
            <PanelHeading title="Run Debrief" note={`XP earned: +${totalScore * 15}`} />
            <div style={styles.debriefStats}>
              <span>Vocabulary: {vocabScore}/{VOCAB_ROUNDS.length}</span>
              <span>Grammar: {grammarScore}/{GRAMMAR_ROUNDS.length}</span>
              <span>Dialogue: {dialogueScore}/{DIALOGUE_ROUNDS.length}</span>
            </div>

            {VOCAB_ROUNDS.filter((round) => vocabAnswers[round.id] !== round.answer).map((round) => (
              <Correction key={`v-${round.id}`} title={round.word} fix={round.answer} help={round.example} />
            ))}
            {GRAMMAR_ROUNDS.filter((round) => grammarAnswers[round.id] !== round.answer).map((round) => (
              <Correction key={`g-${round.id}`} title={round.prompt} fix={round.answer} help={round.explanation} />
            ))}
            {DIALOGUE_ROUNDS.filter((round) => dialogueAnswers[round.id] !== round.answer).map((round) => (
              <Correction key={`d-${round.id}`} title={round.situation} fix={round.answer} help={round.reason} />
            ))}

            {totalScore === totalQuestions && (
              <div style={styles.successBanner}>Perfect run. Excellent precision and communication control.</div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

function PanelHeading({ title, note }: { title: string; note: string }) {
  return (
    <header style={{ display: 'grid', gap: 4 }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <p style={{ margin: 0, color: '#9ca3af' }}>{note}</p>
    </header>
  )
}

function QuestionBlock({
  title,
  subtitle,
  options,
  selected,
  onPick,
}: {
  title: string
  subtitle?: string
  options: string[]
  selected?: string
  onPick: (option: string) => void
}) {
  return (
    <article style={styles.questionCard}>
      <strong>{title}</strong>
      {subtitle && <p style={{ margin: 0, color: '#9ca3af' }}>{subtitle}</p>}
      <div style={{ display: 'grid', gap: 8 }}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onPick(option)}
            style={{
              ...styles.optionButton,
              ...(selected === option ? styles.optionButtonActive : {}),
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </article>
  )
}

function Correction({ title, fix, help }: { title: string; fix: string; help: string }) {
  return (
    <div style={styles.correctionCard}>
      <strong>{title}</strong>
      <p style={{ margin: 0 }}>
        Correct answer: <span style={{ color: '#22d3ee' }}>{fix}</span>
      </p>
      <small style={{ color: '#9ca3af' }}>{help}</small>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.statCard}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: '100vh',
    background: '#04070f',
    color: '#e5e7eb',
    fontFamily: "'Inter','Noto Sans JP',sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '28px 14px 80px',
  },
  topGlow: {
    position: 'absolute',
    width: 550,
    height: 550,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,211,238,0.28) 0%, rgba(0,0,0,0) 70%)',
    top: -220,
    left: -120,
    pointerEvents: 'none',
  },
  sideGlow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(129,140,248,0.25) 0%, rgba(0,0,0,0) 70%)',
    bottom: -280,
    right: -180,
    pointerEvents: 'none',
  },
  container: {
    maxWidth: 1080,
    margin: '0 auto',
    display: 'grid',
    gap: 16,
    position: 'relative',
    zIndex: 1,
  },
  hero: {
    background: 'linear-gradient(155deg, rgba(17,24,39,0.88), rgba(3,7,18,0.92))',
    border: '1px solid rgba(148,163,184,0.28)',
    borderRadius: 24,
    padding: 24,
    backdropFilter: 'blur(8px)',
    display: 'grid',
    gap: 16,
  },
  badge: {
    display: 'inline-flex',
    width: 'fit-content',
    border: '1px solid rgba(34,211,238,0.5)',
    color: '#67e8f9',
    background: 'rgba(34,211,238,0.12)',
    borderRadius: 999,
    padding: '6px 12px',
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: 600,
  },
  title: { margin: 0, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.06 },
  subtitle: { margin: 0, color: '#cbd5e1', maxWidth: 680 },
  statGrid: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' },
  statCard: {
    border: '1px solid rgba(148,163,184,0.3)',
    borderRadius: 14,
    padding: 12,
    background: 'rgba(15,23,42,0.85)',
    display: 'grid',
    gap: 4,
  },
  progressWrap: { display: 'grid', gap: 6 },
  progressMeta: { display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' },
  progressBar: { height: 10, borderRadius: 999, background: 'rgba(148,163,184,0.25)', overflow: 'hidden' },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #22d3ee 0%, #818cf8 45%, #a78bfa 100%)',
  },
  tabsWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 10,
  },
  tab: {
    border: '1px solid rgba(148,163,184,0.3)',
    background: 'rgba(15,23,42,0.75)',
    color: '#cbd5e1',
    borderRadius: 14,
    padding: '12px 14px',
    display: 'grid',
    gap: 3,
    textAlign: 'left',
    cursor: 'pointer',
  },
  tabActive: {
    border: '1px solid rgba(34,211,238,0.6)',
    background: 'linear-gradient(155deg, rgba(8,47,73,0.78), rgba(30,41,59,0.9))',
    color: '#ecfeff',
  },
  panel: {
    background: 'rgba(15,23,42,0.84)',
    border: '1px solid rgba(148,163,184,0.26)',
    borderRadius: 20,
    padding: 20,
    display: 'grid',
    gap: 12,
  },
  questionCard: {
    borderTop: '1px dashed rgba(148,163,184,0.35)',
    paddingTop: 12,
    display: 'grid',
    gap: 8,
  },
  optionButton: {
    border: '1px solid rgba(148,163,184,0.35)',
    borderRadius: 12,
    padding: '10px 12px',
    background: 'rgba(2,6,23,0.76)',
    color: '#e5e7eb',
    textAlign: 'left',
    cursor: 'pointer',
  },
  optionButtonActive: {
    border: '1px solid rgba(34,211,238,0.7)',
    background: 'rgba(8,47,73,0.58)',
    color: '#ecfeff',
  },
  textArea: {
    minHeight: 130,
    borderRadius: 12,
    border: '1px solid rgba(148,163,184,0.35)',
    padding: 12,
    background: 'rgba(2,6,23,0.72)',
    color: '#e5e7eb',
    width: '100%',
  },
  missionCard: {
    display: 'grid',
    gap: 6,
    border: '1px solid rgba(148,163,184,0.35)',
    borderRadius: 12,
    padding: 12,
    background: 'rgba(2,6,23,0.66)',
  },
  footerPanel: {
    background: 'linear-gradient(140deg, rgba(8,47,73,0.5), rgba(15,23,42,0.88))',
    border: '1px solid rgba(34,211,238,0.28)',
    borderRadius: 20,
    padding: 18,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  actionRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  primaryButton: {
    border: 'none',
    borderRadius: 12,
    padding: '10px 14px',
    background: 'linear-gradient(90deg, #22d3ee, #818cf8)',
    color: '#020617',
    cursor: 'pointer',
    fontWeight: 700,
  },
  secondaryButton: {
    border: '1px solid rgba(148,163,184,0.45)',
    borderRadius: 12,
    padding: '10px 14px',
    background: 'rgba(2,6,23,0.7)',
    color: '#e5e7eb',
    cursor: 'pointer',
  },
  debriefStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
    gap: 8,
    color: '#cbd5e1',
  },
  correctionCard: {
    border: '1px solid rgba(148,163,184,0.35)',
    background: 'rgba(2,6,23,0.7)',
    borderRadius: 12,
    padding: 12,
    display: 'grid',
    gap: 6,
  },
  successBanner: {
    border: '1px solid rgba(74,222,128,0.45)',
    background: 'rgba(20,83,45,0.45)',
    color: '#dcfce7',
    borderRadius: 12,
    padding: 12,
    fontWeight: 600,
  },
}
