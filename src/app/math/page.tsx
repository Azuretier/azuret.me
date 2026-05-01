'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './math.module.css'

interface Challenge {
  left: number
  right: number
  op: '+' | '-' | '×'
  answer: number
}

const OPS: Challenge['op'][] = ['+', '-', '×']

const INITIAL_CHALLENGE: Challenge = {
  left: 8,
  right: 4,
  op: '+',
  answer: 12,
}

const FEATURE_ITEMS = [
  {
    signal: '+',
    title: 'Adaptive practice',
    text: 'Number ranges grow with your level so the session keeps feeling fresh.',
  },
  {
    signal: '×',
    title: 'Keyboard-first flow',
    text: 'Answer, press Enter, and keep the streak moving without leaving the field.',
  },
  {
    signal: '=',
    title: 'Readable progress',
    text: 'Level, combo, coins, and XP stay visible in a clean dashboard layout.',
  },
]

const levelForXp = (xp: number) => Math.floor(xp / 120) + 1

function makeChallenge(level: number): Challenge {
  const op = OPS[Math.floor(Math.random() * OPS.length)]
  const cap = Math.min(10 + level * 4, 120)

  if (op === '+') {
    const left = Math.floor(Math.random() * cap) + 1
    const right = Math.floor(Math.random() * cap) + 1
    return { left, right, op, answer: left + right }
  }

  if (op === '-') {
    const left = Math.floor(Math.random() * cap) + 10
    const right = Math.floor(Math.random() * left) + 1
    return { left, right, op, answer: left - right }
  }

  const multiCap = Math.min(4 + level, 14)
  const left = Math.floor(Math.random() * multiCap) + 2
  const right = Math.floor(Math.random() * multiCap) + 2
  return { left, right, op, answer: left * right }
}

export default function MathPage() {
  const gameRef = useRef<HTMLElement | null>(null)
  const [xp, setXp] = useState(0)
  const [coins, setCoins] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [answerInput, setAnswerInput] = useState('')
  const [challenge, setChallenge] = useState<Challenge>(INITIAL_CHALLENGE)
  const [pulse, setPulse] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [message, setMessage] = useState('Solve the first prompt to start your combo.')

  const level = levelForXp(xp)
  const xpInLevel = xp % 120
  const progress = (xpInLevel / 120) * 100

  const metrics = [
    { label: 'Level', value: level },
    { label: 'Combo', value: streak },
    { label: 'Best', value: bestStreak },
    { label: 'Coins', value: coins },
  ]

  const focusAnswer = () => {
    document.getElementById('math-answer')?.focus()
  }

  useEffect(() => {
    const syncFullscreenState = () => {
      if (!document.fullscreenElement) {
        setIsFocusMode(false)
        return
      }

      setIsFocusMode(document.fullscreenElement === gameRef.current)
    }

    document.addEventListener('fullscreenchange', syncFullscreenState)
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState)
  }, [])

  const enterFocusMode = async () => {
    setIsFocusMode(true)

    try {
      await gameRef.current?.requestFullscreen?.()
    } catch {
      setMessage('Fullscreen is blocked here, but focus mode is still active.')
    }

    window.setTimeout(focusAnswer, 80)
  }

  const exitFocusMode = async () => {
    setIsFocusMode(false)

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        setMessage('Press Esc to leave browser fullscreen.')
      }
    }
  }

  const submit = () => {
    const trimmed = answerInput.trim()
    if (!trimmed) return

    const value = Number(trimmed)
    if (!Number.isFinite(value)) return

    if (value === challenge.answer) {
      const gainedXp = 15 + Math.min(streak * 2, 20)
      const gainedCoins = 4 + Math.floor(streak / 2)
      const nextStreak = streak + 1
      const nextXp = xp + gainedXp
      const nextLevel = levelForXp(nextXp)

      setXp(nextXp)
      setCoins((v) => v + gainedCoins)
      setStreak(nextStreak)
      setBestStreak((v) => Math.max(v, nextStreak))
      setMessage(`Perfect. +${gainedXp} XP and +${gainedCoins} coins added.`)
      setChallenge(makeChallenge(nextLevel))
      setPulse(true)
      setTimeout(() => setPulse(false), 280)
    } else {
      setMessage(`Correct answer: ${challenge.answer}. Combo reset, new prompt loaded.`)
      setStreak(0)
      setChallenge(makeChallenge(level))
    }

    setAnswerInput('')
  }

  const spendCoins = () => {
    if (coins < 25) {
      setMessage('You need 25 coins to unlock a hint shard.')
      return
    }

    setCoins((v) => v - 25)
    setMessage(`Hint: read it as ${challenge.left} ${challenge.op === '×' ? 'times' : challenge.op === '+' ? 'plus' : 'minus'} ${challenge.right}.`)
  }

  return (
    <main className={`${styles.mathArena} ${isFocusMode ? styles.focusMode : ''}`} data-ui-system="ui-pro-max">
      <nav className={styles.mathNav} aria-label="Math app navigation">
        <div className={styles.navInner}>
          <a className={styles.brand} href="/">
            <span className={styles.brandMark}>M</span>
            <span className={styles.brandText}>Math Quest</span>
          </a>

          <button className={styles.searchPill} type="button" onClick={focusAnswer}>
            <span className={styles.searchIcon} aria-hidden="true" />
            Quick answer
            <kbd>Enter</kbd>
          </button>

          <button className={styles.navFocusButton} type="button" onClick={enterFocusMode}>
            <span aria-hidden="true">⛶</span>
            Fullscreen
          </button>

          <div className={styles.navStatus} aria-label={`Current level ${level}`}>
            Lv.{level}
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrowPill}>Mental math dashboard</p>
          <h1 className={styles.heroTitle}>
            Make fast calculation
            <br />
            feel more <span>convenient</span>.
          </h1>
          <p className={styles.heroText}>
            A focused practice surface for streaks, XP, hints, and clean repetition.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.heroPrimary} type="button" onClick={focusAnswer}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              Start practice
            </button>
            <a className={styles.heroSecondary} href="#progress">
              View progress
            </a>
            <button className={styles.heroSecondary} type="button" onClick={enterFocusMode}>
              Fullscreen mode
            </button>
          </div>
        </div>
      </section>

      <section
        ref={gameRef}
        id="practice"
        className={`${styles.browserShell} ${isFocusMode ? styles.fullscreenShell : ''} ${pulse ? styles.pulse : ''}`}
        aria-label="Math practice dashboard"
      >
        <div className={styles.focusTopbar}>
          <div>
            <span>Math Quest</span>
            <strong>Focus run</strong>
          </div>
          <button type="button" onClick={exitFocusMode}>
            Exit fullscreen
          </button>
        </div>

        <div className={styles.browserChrome}>
          <div className={styles.trafficLights} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.addressBar} aria-hidden="true">
            <span className={styles.lockIcon} />
            math.azuret.me/session
          </div>
          <button className={styles.chromeFocusButton} type="button" onClick={enterFocusMode} aria-label="Open fullscreen mode">
            <span aria-hidden="true">⛶</span>
            Fullscreen
          </button>
        </div>

        <div className={styles.dashboardBody}>
          <section className={styles.solvePane} aria-labelledby="challenge-title">
            <p className={styles.sectionLabel}>Current challenge</p>
            <h2 className={styles.paneTitle} id="challenge-title">Sprint prompt</h2>

            <div className={styles.equationPanel}>
              <div className={styles.equation} aria-label={`${challenge.left} ${challenge.op} ${challenge.right}`}>
                <span>{challenge.left}</span>
                <strong>{challenge.op}</strong>
                <span>{challenge.right}</span>
                <em>= ?</em>
              </div>
            </div>

            <form
              className={styles.answerForm}
              onSubmit={(event) => {
                event.preventDefault()
                submit()
              }}
            >
              <label className={styles.srOnly} htmlFor="math-answer">
                Answer
              </label>
              <input
                id="math-answer"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Type your answer"
                inputMode="numeric"
                autoComplete="off"
              />
              <button type="submit" disabled={!answerInput.trim()}>
                Submit
              </button>
            </form>
          </section>

          <aside id="progress" className={styles.progressPane} aria-label="Progress and actions">
            <p className={styles.sectionLabel}>Session status</p>
            <div className={styles.metricGrid}>
              {metrics.map((metric) => (
                <div className={styles.metric} key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>

            <div className={styles.xpPanel}>
              <div className={styles.xpTopline}>
                <span>XP to next level</span>
                <strong>{xpInLevel}/120</strong>
              </div>
              <div className={styles.xpTrack} aria-hidden="true">
                <div className={styles.xpFill} style={{ width: `${progress}%` }} />
              </div>
            </div>

            <button className={styles.hintButton} type="button" onClick={spendCoins}>
              Buy hint shard
              <span>25 coins</span>
            </button>

            <div className={styles.feedPanel} aria-live="polite">
              <span>Battle feed</span>
              <p>{message}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.featureSection} aria-label="Practice features">
        {FEATURE_ITEMS.map((item) => (
          <article className={styles.featureItem} key={item.title}>
            <div className={styles.featureSignal} aria-hidden="true">
              {item.signal}
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
