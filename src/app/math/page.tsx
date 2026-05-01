'use client'

import { useState } from 'react'

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
  const [xp, setXp] = useState(0)
  const [coins, setCoins] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [answerInput, setAnswerInput] = useState('')
  const [challenge, setChallenge] = useState<Challenge>(INITIAL_CHALLENGE)
  const [pulse, setPulse] = useState(false)
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
    <main className="mathArena" data-ui-system="ui-pro-max">
      <nav className="mathNav" aria-label="Math app navigation">
        <div className="navInner">
          <a className="brand" href="/">
            <span className="brandMark">M</span>
            <span>Math Quest</span>
          </a>

          <button className="searchPill" type="button" onClick={focusAnswer}>
            <span className="searchIcon" aria-hidden="true" />
            Quick answer
            <kbd>Enter</kbd>
          </button>

          <div className="navStatus" aria-label={`Current level ${level}`}>
            Lv.{level}
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrowPill">Mental math dashboard</p>
          <h1>
            Make fast calculation
            <br />
            feel more <span>convenient</span>.
          </h1>
          <p className="heroText">
            A focused practice surface for streaks, XP, hints, and clean repetition.
          </p>
          <div className="heroActions">
            <button className="heroPrimary" type="button" onClick={focusAnswer}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              Start practice
            </button>
            <a className="heroSecondary" href="#progress">
              View progress
            </a>
          </div>
        </div>
      </section>

      <section id="practice" className={`browserShell ${pulse ? 'pulse' : ''}`} aria-label="Math practice dashboard">
        <div className="browserChrome" aria-hidden="true">
          <div className="trafficLights">
            <span />
            <span />
            <span />
          </div>
          <div className="addressBar">
            <span className="lockIcon" />
            math.azuret.me/session
          </div>
        </div>

        <div className="dashboardBody">
          <section className="solvePane" aria-labelledby="challenge-title">
            <p className="sectionLabel">Current challenge</p>
            <h2 id="challenge-title">Sprint prompt</h2>

            <div className="equationPanel">
              <div className="equation" aria-label={`${challenge.left} ${challenge.op} ${challenge.right}`}>
                <span>{challenge.left}</span>
                <strong>{challenge.op}</strong>
                <span>{challenge.right}</span>
                <em>= ?</em>
              </div>
            </div>

            <form
              className="answerForm"
              onSubmit={(event) => {
                event.preventDefault()
                submit()
              }}
            >
              <label className="srOnly" htmlFor="math-answer">
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

          <aside id="progress" className="progressPane" aria-label="Progress and actions">
            <p className="sectionLabel">Session status</p>
            <div className="metricGrid">
              {metrics.map((metric) => (
                <div className="metric" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>

            <div className="xpPanel">
              <div className="xpTopline">
                <span>XP to next level</span>
                <strong>{xpInLevel}/120</strong>
              </div>
              <div className="xpTrack" aria-hidden="true">
                <div className="xpFill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <button className="hintButton" type="button" onClick={spendCoins}>
              Buy hint shard
              <span>25 coins</span>
            </button>

            <div className="feedPanel" aria-live="polite">
              <span>Battle feed</span>
              <p>{message}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="featureSection" aria-label="Practice features">
        {FEATURE_ITEMS.map((item) => (
          <article className="featureItem" key={item.title}>
            <div className="featureSignal" aria-hidden="true">
              {item.signal}
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <style jsx>{`
        .mathArena {
          --math-bg: #f7f9fc;
          --math-surface: #ffffff;
          --math-surface-soft: #f2f5f9;
          --math-text: #0f172a;
          --math-muted: #64748b;
          --math-border: #dbe3ef;
          --math-primary: #0072f5;
          --math-primary-soft: #e7f1ff;
          --math-success: #0f9f6e;
          --math-warning: #d97706;
          min-height: 100vh;
          background: var(--math-bg);
          color: var(--math-text);
          font-family: 'Inter', 'Noto Sans JP', system-ui, sans-serif;
          line-height: 1.5;
        }

        .mathNav {
          position: sticky;
          top: 0;
          z-index: 20;
          border-bottom: 1px solid rgba(219, 227, 239, 0.86);
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px);
        }

        .navInner {
          width: min(100%, 1160px);
          height: 56px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--math-text);
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .brandMark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--math-primary);
          color: #ffffff;
          font-weight: 900;
          box-shadow: 0 10px 24px rgba(0, 114, 245, 0.22);
        }

        .searchPill {
          margin-left: auto;
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--math-border);
          border-radius: 999px;
          background: rgba(242, 245, 249, 0.74);
          color: var(--math-muted);
          padding: 0 8px 0 14px;
          font: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
        }

        .searchPill:hover {
          border-color: rgba(0, 114, 245, 0.35);
          background: var(--math-primary-soft);
          color: var(--math-text);
        }

        .searchPill:focus-visible,
        .heroPrimary:focus-visible,
        .heroSecondary:focus-visible,
        .answerForm input:focus-visible,
        .answerForm button:focus-visible,
        .hintButton:focus-visible {
          outline: 3px solid rgba(0, 114, 245, 0.24);
          outline-offset: 2px;
        }

        .searchIcon {
          width: 12px;
          height: 12px;
          border: 2px solid currentColor;
          border-radius: 999px;
          position: relative;
        }

        .searchIcon::after {
          content: '';
          position: absolute;
          right: -5px;
          bottom: -4px;
          width: 6px;
          height: 2px;
          border-radius: 999px;
          background: currentColor;
          transform: rotate(45deg);
        }

        kbd {
          min-width: 32px;
          border: 1px solid var(--math-border);
          border-radius: 8px;
          background: var(--math-surface);
          color: var(--math-text);
          padding: 3px 8px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 1px 0 rgba(15, 23, 42, 0.08);
        }

        .navStatus {
          border: 1px solid var(--math-border);
          border-radius: 999px;
          background: var(--math-surface);
          padding: 7px 11px;
          color: var(--math-text);
          font-size: 13px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .hero {
          width: min(100%, 1160px);
          margin: 0 auto;
          padding: 74px 20px 30px;
          text-align: center;
        }

        .heroCopy {
          max-width: 820px;
          margin: 0 auto;
        }

        .eyebrowPill {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          margin: 0 0 20px;
          border: 1px solid rgba(0, 114, 245, 0.18);
          border-radius: 999px;
          background: var(--math-primary-soft);
          color: var(--math-primary);
          padding: 0 14px;
          font-size: 13px;
          font-weight: 800;
        }

        h1 {
          margin: 0;
          font-size: 60px;
          line-height: 1.08;
          font-weight: 850;
          letter-spacing: 0;
          text-wrap: balance;
        }

        h1 span {
          color: var(--math-primary);
        }

        .heroText {
          max-width: 650px;
          margin: 20px auto 0;
          color: var(--math-muted);
          font-size: 18px;
        }

        .heroActions {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 28px;
        }

        .heroPrimary,
        .heroSecondary {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 10px;
          padding: 0 18px;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          transition: transform 150ms ease, background 160ms ease, border-color 160ms ease;
        }

        .heroPrimary {
          border: 1px solid var(--math-primary);
          background: var(--math-primary);
          color: #ffffff;
          box-shadow: 0 16px 30px rgba(0, 114, 245, 0.2);
        }

        .heroPrimary svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .heroSecondary {
          border: 1px solid var(--math-border);
          background: var(--math-surface);
          color: var(--math-text);
        }

        .heroPrimary:hover,
        .heroSecondary:hover {
          transform: translateY(-1px);
        }

        .browserShell {
          width: min(calc(100% - 40px), 1160px);
          margin: 0 auto;
          overflow: hidden;
          border: 1px solid var(--math-border);
          border-radius: 18px;
          background: var(--math-surface);
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
        }

        .browserChrome {
          height: 52px;
          display: grid;
          grid-template-columns: 110px minmax(180px, 1fr) 110px;
          align-items: center;
          gap: 14px;
          border-bottom: 1px solid var(--math-border);
          background: var(--math-surface);
          padding: 0 18px;
        }

        .trafficLights {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .trafficLights span {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: #d7deea;
        }

        .addressBar {
          justify-self: center;
          width: min(100%, 520px);
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 9px;
          background: var(--math-surface-soft);
          color: var(--math-muted);
          font-size: 13px;
          font-weight: 700;
        }

        .lockIcon {
          width: 10px;
          height: 8px;
          border: 2px solid currentColor;
          border-radius: 2px;
          position: relative;
        }

        .lockIcon::before {
          content: '';
          position: absolute;
          left: 50%;
          top: -8px;
          width: 8px;
          height: 8px;
          border: 2px solid currentColor;
          border-bottom: 0;
          border-radius: 999px 999px 0 0;
          transform: translateX(-50%);
        }

        .dashboardBody {
          display: grid;
          grid-template-columns: minmax(0, 1.26fr) minmax(300px, 0.74fr);
          background: linear-gradient(180deg, #ffffff 0%, #f6f8fb 100%);
        }

        .solvePane,
        .progressPane {
          padding: 38px;
        }

        .solvePane {
          border-right: 1px solid var(--math-border);
        }

        .sectionLabel {
          margin: 0 0 8px;
          color: var(--math-primary);
          font-size: 12px;
          font-weight: 850;
          text-transform: uppercase;
        }

        h2 {
          margin: 0;
          font-size: 32px;
          line-height: 1.16;
          letter-spacing: 0;
        }

        .equationPanel {
          margin: 28px 0 22px;
          border: 1px solid var(--math-border);
          border-radius: 16px;
          background:
            linear-gradient(90deg, rgba(0, 114, 245, 0.05) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0, 114, 245, 0.05) 1px, transparent 1px),
            #ffffff;
          background-size: 28px 28px;
          padding: 34px 24px;
        }

        .equation {
          display: flex;
          align-items: baseline;
          justify-content: center;
          flex-wrap: wrap;
          gap: 18px;
          color: var(--math-text);
          font-size: 68px;
          line-height: 1;
          font-weight: 850;
          font-variant-numeric: tabular-nums;
        }

        .equation strong {
          color: var(--math-primary);
        }

        .equation em {
          color: var(--math-muted);
          font-style: normal;
          font-weight: 750;
        }

        .answerForm {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
        }

        .answerForm input {
          min-width: 0;
          min-height: 48px;
          border: 1px solid var(--math-border);
          border-radius: 12px;
          background: var(--math-surface);
          color: var(--math-text);
          padding: 0 16px;
          font: inherit;
          font-size: 16px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .answerForm input::placeholder {
          color: #94a3b8;
          font-weight: 600;
        }

        .answerForm button {
          min-height: 48px;
          border: 1px solid var(--math-primary);
          border-radius: 12px;
          background: var(--math-primary);
          color: #ffffff;
          padding: 0 22px;
          font: inherit;
          font-weight: 850;
          cursor: pointer;
          transition: opacity 160ms ease, transform 150ms ease;
        }

        .answerForm button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .answerForm button:disabled {
          cursor: not-allowed;
          opacity: 0.52;
        }

        .metricGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 16px;
        }

        .metric {
          border: 1px solid var(--math-border);
          border-radius: 14px;
          background: var(--math-surface);
          padding: 14px;
        }

        .metric span,
        .xpTopline span,
        .feedPanel span {
          display: block;
          color: var(--math-muted);
          font-size: 12px;
          font-weight: 800;
        }

        .metric strong {
          display: block;
          margin-top: 2px;
          font-size: 26px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .xpPanel {
          margin-top: 18px;
          border: 1px solid var(--math-border);
          border-radius: 14px;
          background: var(--math-surface);
          padding: 16px;
        }

        .xpTopline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
        }

        .xpTopline strong {
          color: var(--math-primary);
          font-size: 13px;
          font-variant-numeric: tabular-nums;
        }

        .xpTrack {
          height: 9px;
          overflow: hidden;
          border-radius: 999px;
          background: #e7edf6;
        }

        .xpFill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--math-primary), var(--math-success));
          transition: width 220ms ease;
        }

        .hintButton {
          width: 100%;
          min-height: 48px;
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border: 1px solid rgba(217, 119, 6, 0.28);
          border-radius: 14px;
          background: #fff8ed;
          color: #92400e;
          padding: 0 16px;
          font: inherit;
          font-weight: 850;
          cursor: pointer;
          transition: transform 150ms ease, border-color 160ms ease;
        }

        .hintButton:hover {
          border-color: rgba(217, 119, 6, 0.48);
          transform: translateY(-1px);
        }

        .hintButton span {
          color: #b45309;
          font-size: 12px;
          font-weight: 800;
        }

        .feedPanel {
          margin-top: 14px;
          border: 1px solid var(--math-border);
          border-radius: 14px;
          background: #0f172a;
          color: #ffffff;
          padding: 16px;
        }

        .feedPanel span {
          color: #93c5fd;
        }

        .feedPanel p {
          margin: 8px 0 0;
          color: #e2e8f0;
          font-size: 14px;
        }

        .featureSection {
          width: min(100%, 1160px);
          margin: 0 auto;
          padding: 72px 20px 90px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 34px;
        }

        .featureItem {
          min-width: 0;
        }

        .featureSignal {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: var(--math-primary-soft);
          color: var(--math-primary);
          font-size: 24px;
          font-weight: 900;
          font-variant-numeric: tabular-nums;
        }

        .featureItem h3 {
          margin: 18px 0 8px;
          font-size: 20px;
          line-height: 1.2;
        }

        .featureItem p {
          margin: 0;
          color: var(--math-muted);
          font-size: 15px;
        }

        .srOnly {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .pulse {
          animation: pop 280ms ease;
        }

        @keyframes pop {
          0% { transform: scale(1); }
          45% { transform: scale(1.006); }
          100% { transform: scale(1); }
        }

        @media (max-width: 820px) {
          .navInner {
            padding: 0 14px;
          }

          .searchPill {
            display: none;
          }

          .hero {
            padding: 48px 18px 24px;
          }

          h1 {
            font-size: 40px;
          }

          .heroText {
            font-size: 16px;
          }

          .browserShell {
            width: min(calc(100% - 24px), 1160px);
          }

          .browserChrome {
            grid-template-columns: 56px minmax(0, 1fr);
            padding: 0 12px;
          }

          .trafficLights span {
            width: 9px;
            height: 9px;
          }

          .addressBar {
            justify-content: flex-start;
            padding: 0 12px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .dashboardBody {
            grid-template-columns: 1fr;
          }

          .solvePane,
          .progressPane {
            padding: 26px 18px;
          }

          .solvePane {
            border-right: 0;
            border-bottom: 1px solid var(--math-border);
          }

          h2 {
            font-size: 27px;
          }

          .equationPanel {
            padding: 28px 14px;
          }

          .equation {
            gap: 12px;
            font-size: 46px;
          }

          .featureSection {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 52px 20px 70px;
          }
        }

        @media (max-width: 480px) {
          .brand span:last-child {
            display: none;
          }

          h1 {
            font-size: 34px;
          }

          .heroActions {
            align-items: stretch;
            flex-direction: column;
          }

          .heroPrimary,
          .heroSecondary {
            width: 100%;
          }

          .answerForm {
            grid-template-columns: 1fr;
          }

          .answerForm button {
            width: 100%;
          }

          .metricGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-color-scheme: dark) {
          .mathArena {
            --math-bg: #0b0d12;
            --math-surface: #11151d;
            --math-surface-soft: #1a202b;
            --math-text: #f8fafc;
            --math-muted: #9ca3af;
            --math-border: #252d3a;
            --math-primary-soft: rgba(0, 114, 245, 0.16);
            background: var(--math-bg);
          }

          .mathNav {
            border-bottom-color: rgba(37, 45, 58, 0.92);
            background: rgba(11, 13, 18, 0.84);
          }

          .searchPill {
            background: rgba(26, 32, 43, 0.78);
          }

          .browserShell {
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
          }

          .dashboardBody {
            background: linear-gradient(180deg, #11151d 0%, #0f141c 100%);
          }

          .equationPanel {
            background:
              linear-gradient(90deg, rgba(0, 114, 245, 0.08) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0, 114, 245, 0.08) 1px, transparent 1px),
              #11151d;
          }

          .xpTrack {
            background: #252d3a;
          }

          .hintButton {
            background: rgba(217, 119, 6, 0.12);
            color: #fbbf24;
          }

          .hintButton span {
            color: #f59e0b;
          }

          .feedPanel {
            background: #06080d;
          }
        }
      `}</style>
    </main>
  )
}
