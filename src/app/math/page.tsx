'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'
import styles from './math.module.css'

interface Challenge {
  left: number
  right: number
  op: '+' | '-' | '×'
  answer: number
}

interface EnemyState {
  name: string
  title: string
  depth: number
  hp: number
  maxHp: number
  sprite: string[]
  palette: {
    primary: string
    accent: string
    shade: string
    dark: string
    eye: string
    shine: string
  }
}

const OPS: Challenge['op'][] = ['+', '-', '×']

const INITIAL_CHALLENGE: Challenge = {
  left: 8,
  right: 4,
  op: '+',
  answer: 12,
}

const ENEMY_ARCHETYPES = [
  {
    name: 'Cave Slime',
    title: 'Depth scout',
    sprite: [
      '........',
      '...hh...',
      '..pppp..',
      '.ppsspp.',
      '.peppep.',
      '.ppsspp.',
      '..dddd..',
      '.d....d.',
    ],
    palette: {
      primary: '#38bdf8',
      accent: '#0ea5e9',
      shade: '#0284c7',
      dark: '#075985',
      eye: '#0f172a',
      shine: '#e0f2fe',
    },
  },
  {
    name: 'Number Imp',
    title: 'Gate trickster',
    sprite: [
      '..d..d..',
      '.dpaapd.',
      '.appppa.',
      '.peppep.',
      '.apsspa.',
      '..pddp..',
      '.dpsspd.',
      'd......d',
    ],
    palette: {
      primary: '#fb7185',
      accent: '#f97316',
      shade: '#e11d48',
      dark: '#7f1d1d',
      eye: '#111827',
      shine: '#ffe4e6',
    },
  },
  {
    name: 'Rune Golem',
    title: 'Deep guard',
    sprite: [
      '..dddd..',
      '.dppppd.',
      'dppssppd',
      'dpeddepd',
      'dppssppd',
      '..dppd..',
      '.dd..dd.',
      'd......d',
    ],
    palette: {
      primary: '#a78bfa',
      accent: '#7c3aed',
      shade: '#5b21b6',
      dark: '#2e1065',
      eye: '#fef3c7',
      shine: '#ede9fe',
    },
  },
]

const PIXEL_CLASS: Record<string, string> = {
  p: styles.pixelPrimary,
  a: styles.pixelAccent,
  s: styles.pixelShade,
  d: styles.pixelDark,
  e: styles.pixelEye,
  h: styles.pixelShine,
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

function makeEnemy(depth: number): EnemyState {
  const archetype = ENEMY_ARCHETYPES[(depth - 1) % ENEMY_ARCHETYPES.length]
  const maxHp = 34 + depth * 18 + Math.floor(depth / 3) * 16

  return {
    ...archetype,
    depth,
    hp: maxHp,
    maxHp,
  }
}

function makeChallenge(level: number, depth = 1): Challenge {
  const difficulty = level + Math.floor(depth * 0.8)
  const opPool: Challenge['op'][] = depth >= 4 ? ['+', '-', '×', '×'] : OPS
  const op = opPool[Math.floor(Math.random() * opPool.length)]
  const cap = Math.min(10 + difficulty * 5, 180)

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

  const multiCap = Math.min(4 + difficulty, 20)
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
  const [depth, setDepth] = useState(1)
  const [enemy, setEnemy] = useState<EnemyState>(() => makeEnemy(1))
  const [enemyHit, setEnemyHit] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [message, setMessage] = useState('A Cave Slime blocks the path. Solve to strike.')

  const level = levelForXp(xp)
  const xpInLevel = xp % 120
  const progress = (xpInLevel / 120) * 100
  const enemyHpRatio = enemy.hp / enemy.maxHp
  const coinSlots = Array.from({ length: 5 }, (_, index) => index)
  const litCoinSlots = Math.min(coinSlots.length, Math.ceil(coins / 12))
  const comboSlots = Array.from({ length: 5 }, (_, index) => index)
  const litComboSlots = Math.min(comboSlots.length, streak)
  const depthSlots = Array.from({ length: 4 }, (_, index) => index)
  const litDepthSlots = Math.min(depthSlots.length, depth)
  const enemyStyle = {
    '--enemy-primary': enemy.palette.primary,
    '--enemy-accent': enemy.palette.accent,
    '--enemy-shade': enemy.palette.shade,
    '--enemy-dark': enemy.palette.dark,
    '--enemy-eye': enemy.palette.eye,
    '--enemy-shine': enemy.palette.shine,
  } as CSSProperties

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
      const damage = 16 + level * 4 + Math.min(streak * 3, 18)
      const remainingHp = Math.max(0, enemy.hp - damage)

      setXp(nextXp)
      setCoins((v) => v + gainedCoins)
      setStreak(nextStreak)
      setBestStreak((v) => Math.max(v, nextStreak))
      setEnemyHit(true)
      setTimeout(() => setEnemyHit(false), 240)

      if (remainingHp === 0) {
        const nextDepth = depth + 1
        const nextEnemy = makeEnemy(nextDepth)
        const clearBonus = 8 + depth * 2

        setDepth(nextDepth)
        setEnemy(nextEnemy)
        setCoins((v) => v + clearBonus)
        setMessage(`${enemy.name} shattered. Depth ${nextDepth} opens. +${gainedXp} XP, +${gainedCoins + clearBonus} coins.`)
        setChallenge(makeChallenge(nextLevel, nextDepth))
      } else {
        setEnemy((current) => ({ ...current, hp: remainingHp }))
        setMessage(`Hit ${enemy.name} for ${damage}. +${gainedXp} XP, +${gainedCoins} coins.`)
        setChallenge(makeChallenge(nextLevel, depth))
      }

      setPulse(true)
      setTimeout(() => setPulse(false), 280)
    } else {
      setMessage(`${enemy.name} guarded the path. Correct answer: ${challenge.answer}. Combo reset.`)
      setStreak(0)
      setChallenge(makeChallenge(level, depth))
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
          <div className={styles.trafficLights} role="group" aria-label="Window controls">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <button
              className={styles.macFullscreenButton}
              type="button"
              onClick={enterFocusMode}
              aria-label="Open fullscreen mode"
              title="Open fullscreen mode"
            />
          </div>
          <div className={styles.addressBar} aria-hidden="true">
            <span className={styles.lockIcon} />
            math.azuret.me/session
          </div>
        </div>

        <div className={styles.dashboardBody}>
          <section className={styles.solvePane} aria-labelledby="challenge-title">
            <div className={styles.encounterStage} aria-label={`${enemy.name}, ${enemy.hp} of ${enemy.maxHp} HP remaining`}>
              <div className={styles.depthMarker}>Depth {depth}</div>
              <div className={`${styles.enemySpriteWrap} ${enemyHit ? styles.enemyHit : ''}`}>
                <div className={styles.enemySprite} style={enemyStyle} aria-hidden="true">
                  {enemy.sprite.map((row, rowIndex) =>
                    [...row].map((pixel, colIndex) => (
                      <span
                        className={`${styles.spritePixel} ${PIXEL_CLASS[pixel] ?? ''}`}
                        key={`${rowIndex}-${colIndex}`}
                      />
                    )),
                  )}
                </div>
                <div className={styles.enemyShadow} aria-hidden="true" />
              </div>
              <div className={styles.enemyHud}>
                <div className={styles.enemyNameLine}>
                  <span>{enemy.title}</span>
                  <strong>{enemy.name}</strong>
                </div>
                <div className={styles.enemyHpText}>{enemy.hp}/{enemy.maxHp} HP</div>
                <div className={styles.enemyHpTrack} aria-hidden="true">
                  <div className={styles.enemyHpFill} style={{ width: `${enemyHpRatio * 100}%` }} />
                </div>
              </div>
            </div>

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
            <div className={styles.gameHud}>
              <article className={`${styles.hudCard} ${styles.levelHud}`} aria-label={`Level ${level}, ${xpInLevel} XP of 120`}>
                <div className={styles.levelBadge} aria-hidden="true">LV</div>
                <div className={styles.hudCopy}>
                  <span>Level</span>
                  <strong>{level}</strong>
                </div>
                <div className={styles.hudTrack} aria-hidden="true">
                  <div className={styles.hudTrackFill} style={{ width: `${progress}%` }} />
                </div>
              </article>

              <article className={`${styles.hudCard} ${styles.coinHud}`} aria-label={`${coins} coins`}>
                <div className={styles.coinStack} aria-hidden="true">
                  {coinSlots.map((slot) => (
                    <span
                      className={`${styles.coinPiece} ${slot < litCoinSlots ? styles.coinPieceLit : ''}`}
                      key={slot}
                    />
                  ))}
                </div>
                <div className={styles.hudCopy}>
                  <span>Coins</span>
                  <strong>{coins}</strong>
                </div>
              </article>

              <article className={`${styles.hudCard} ${styles.depthHud}`} aria-label={`Dungeon depth ${depth}`}>
                <div className={styles.depthPath} aria-hidden="true">
                  {depthSlots.map((slot) => (
                    <span
                      className={slot < litDepthSlots ? styles.depthStepLit : undefined}
                      key={slot}
                    />
                  ))}
                </div>
                <div className={styles.hudCopy}>
                  <span>Depth</span>
                  <strong>{depth}</strong>
                </div>
              </article>

              <article className={`${styles.hudCard} ${styles.comboHud}`} aria-label={`Combo ${streak}, best combo ${bestStreak}`}>
                <div className={styles.comboPips} aria-hidden="true">
                  {comboSlots.map((slot) => (
                    <span
                      className={slot < litComboSlots ? styles.comboPipLit : undefined}
                      key={slot}
                    />
                  ))}
                </div>
                <div className={styles.hudCopy}>
                  <span>Combo</span>
                  <strong>{streak}</strong>
                  <small>Best {bestStreak}</small>
                </div>
              </article>

              <article className={`${styles.hudCard} ${styles.enemyMiniHud}`} aria-label={`${enemy.name} has ${enemy.hp} of ${enemy.maxHp} HP`}>
                <div className={styles.enemyMiniTop}>
                  <span>Enemy HP</span>
                  <strong>{enemy.hp}/{enemy.maxHp}</strong>
                </div>
                <div className={styles.enemyMiniTrack} aria-hidden="true">
                  <div className={styles.enemyMiniFill} style={{ width: `${enemyHpRatio * 100}%` }} />
                </div>
              </article>
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
