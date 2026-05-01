'use client'

import { useMemo, useState } from 'react'

interface Challenge {
  left: number
  right: number
  op: '+' | '-' | '×'
  answer: number
}

const OPS: Challenge['op'][] = ['+', '-', '×']

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
  const [pulse, setPulse] = useState(false)
  const [message, setMessage] = useState('Solve to start your combo ✨')

  const level = levelForXp(xp)
  const xpInLevel = xp % 120
  const progress = (xpInLevel / 120) * 100

  const challenge = useMemo(() => makeChallenge(level), [level, xp, streak])

  const submit = () => {
    const value = Number(answerInput)
    if (!Number.isFinite(value)) return

    if (value === challenge.answer) {
      const gainedXp = 15 + Math.min(streak * 2, 20)
      const gainedCoins = 4 + Math.floor(streak / 2)
      const nextStreak = streak + 1

      setXp((v) => v + gainedXp)
      setCoins((v) => v + gainedCoins)
      setStreak(nextStreak)
      setBestStreak((v) => Math.max(v, nextStreak))
      setMessage(`Perfect! +${gainedXp} XP, +${gainedCoins} coins 🟣`)
      setPulse(true)
      setTimeout(() => setPulse(false), 280)
    } else {
      setMessage(`Close! Correct answer: ${challenge.answer}. Combo reset.`)
      setStreak(0)
    }

    setAnswerInput('')
  }

  const spendCoins = () => {
    if (coins < 25) {
      setMessage('Need 25 coins for a hint shard 💠')
      return
    }

    setCoins((v) => v - 25)
    setMessage(`Hint: ${challenge.left} ${challenge.op === '×' ? 'times' : challenge.op === '+' ? 'plus' : 'minus'} ${challenge.right}`)
  }

  return (
    <main className="mathArena">
      <section className={`panel hero ${pulse ? 'pulse' : ''}`}>
        <p className="eyebrow">Math Quest</p>
        <h1>Arcade Calculator</h1>
        <p className="desc">Build streaks, level up, and farm coins with fast mental math.</p>

        <div className="stats">
          <div><span>Level</span><strong>{level}</strong></div>
          <div><span>Combo</span><strong>{streak}</strong></div>
          <div><span>Best</span><strong>{bestStreak}</strong></div>
          <div><span>Coins</span><strong>{coins}</strong></div>
        </div>

        <div className="xpWrap">
          <div className="xpBar" style={{ width: `${progress}%` }} />
        </div>
        <p className="tiny">XP {xpInLevel}/120 to next level</p>
      </section>

      <section className="panel question">
        <p className="eyebrow">Current Challenge</p>
        <div className="equation">{challenge.left} <span>{challenge.op}</span> {challenge.right} = ?</div>

        <div className="controls">
          <input
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Type your answer"
            inputMode="numeric"
          />
          <button onClick={submit}>Submit</button>
        </div>

        <div className="actions">
          <button onClick={spendCoins}>Buy hint (25)</button>
        </div>
      </section>

      <section className="panel feed">
        <p className="eyebrow">Battle Feed</p>
        <p>{message}</p>
      </section>

      <style jsx>{`
        .mathArena {
          min-height: 100vh;
          padding: 28px 16px 48px;
          background:
            radial-gradient(circle at 15% 20%, rgba(139, 92, 246, 0.35), transparent 45%),
            radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.25), transparent 45%),
            #070b17;
          color: #eef2ff;
          display: grid;
          gap: 14px;
          max-width: 640px;
          margin: 0 auto;
        }

        .panel {
          border: 1px solid rgba(148, 163, 184, 0.25);
          background: linear-gradient(160deg, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.6));
          border-radius: 18px;
          padding: 18px;
          backdrop-filter: blur(8px);
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.35);
        }

        .hero h1 {
          margin: 0 0 8px;
          font-size: clamp(30px, 8vw, 42px);
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #f8fafc 0%, #c4b5fd 45%, #67e8f9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .eyebrow {
          margin: 0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #94a3b8;
        }

        .desc {
          margin: 0 0 16px;
          color: #cbd5e1;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 14px;
        }

        .stats div {
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 10px;
          padding: 10px 8px;
          text-align: center;
        }

        .stats span {
          display: block;
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 2px;
        }

        .stats strong {
          font-size: 20px;
          color: #f8fafc;
          font-variant-numeric: tabular-nums;
        }

        .xpWrap {
          background: rgba(15, 23, 42, 0.85);
          height: 10px;
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .xpBar {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #22d3ee);
          transition: width 180ms ease;
          box-shadow: 0 0 18px rgba(139, 92, 246, 0.85);
        }

        .tiny {
          margin: 8px 0 0;
          color: #94a3b8;
          font-size: 12px;
        }

        .equation {
          font-size: clamp(34px, 12vw, 52px);
          font-weight: 700;
          text-align: center;
          margin: 16px 0 18px;
          font-variant-numeric: tabular-nums;
        }

        .equation span {
          color: #c4b5fd;
        }

        .controls {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        input {
          border-radius: 10px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(15, 23, 42, 0.6);
          color: #f8fafc;
          padding: 10px 12px;
          outline: none;
          font-size: 16px;
        }

        button {
          border: 0;
          border-radius: 10px;
          padding: 10px 12px;
          background: linear-gradient(90deg, #8b5cf6, #22d3ee);
          color: #020617;
          font-weight: 700;
          cursor: pointer;
        }

        .actions {
          margin-top: 10px;
        }

        .actions button {
          width: 100%;
          background: rgba(148, 163, 184, 0.2);
          color: #e2e8f0;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .feed p:last-child {
          margin: 6px 0 0;
          color: #cbd5e1;
          line-height: 1.5;
        }

        .pulse {
          animation: pop 280ms ease;
        }

        @keyframes pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.015); }
          100% { transform: scale(1); }
        }
      `}</style>
    </main>
  )
}
