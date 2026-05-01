'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'
import styles from './math.module.css'

type DifficultyId = 'elementary' | 'middle' | 'high' | 'university'

interface Challenge {
  prompt: string
  ariaLabel: string
  answer: number
  hint: string
}

interface DifficultyTier {
  id: DifficultyId
  label: string
  shortLabel: string
  subtitle: string
  rewardMultiplier: number
  damageMultiplier: number
  counterMultiplier: number
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

interface PlayerState {
  name: string
  title: string
  hp: number
  maxHp: number
  sprite: string[]
  palette: EnemyState['palette']
}

const OPS = ['+', '-', '×'] as const

const INITIAL_CHALLENGE: Challenge = {
  prompt: '8 + 4',
  ariaLabel: '8 plus 4',
  answer: 12,
  hint: 'Add 8 and 4.',
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

const PLAYER: PlayerState = {
  name: 'Block Runner',
  title: 'Math adventurer',
  hp: 100,
  maxHp: 100,
  sprite: [
    '..dddd..',
    '..daaad.',
    '..aeea..',
    '.spppps.',
    'dsppphh.',
    '..pssp..',
    '..d..d..',
    '.dd..dd.',
  ],
  palette: {
    primary: '#2563eb',
    accent: '#fbbf24',
    shade: '#1d4ed8',
    dark: '#172554',
    eye: '#0f172a',
    shine: '#dbeafe',
  },
}

const DIFFICULTY_TIERS: DifficultyTier[] = [
  {
    id: 'elementary',
    label: 'Elementary',
    shortLabel: 'E',
    subtitle: 'Whole-number arithmetic with friendly ranges.',
    rewardMultiplier: 1,
    damageMultiplier: 1,
    counterMultiplier: 0.85,
  },
  {
    id: 'middle',
    label: 'Middle School',
    shortLabel: 'M',
    subtitle: 'Signed numbers, exact division, squares, and mixed operations.',
    rewardMultiplier: 1.2,
    damageMultiplier: 1.08,
    counterMultiplier: 1,
  },
  {
    id: 'high',
    label: 'High School',
    shortLabel: 'H',
    subtitle: 'Linear equations, roots, powers, and sequences.',
    rewardMultiplier: 1.45,
    damageMultiplier: 1.18,
    counterMultiplier: 1.14,
  },
  {
    id: 'university',
    label: 'University',
    shortLabel: 'U',
    subtitle: 'Derivatives, integrals, determinants, and modular thinking.',
    rewardMultiplier: 1.8,
    damageMultiplier: 1.32,
    counterMultiplier: 1.34,
  },
]

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

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]!

const formatSigned = (value: number) => value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`

function makeArithmeticChallenge(left: number, right: number, op: (typeof OPS)[number]): Challenge {
  if (op === '+') {
    return {
      prompt: `${left} + ${right}`,
      ariaLabel: `${left} plus ${right}`,
      answer: left + right,
      hint: `Add ${left} and ${right}.`,
    }
  }

  if (op === '-') {
    return {
      prompt: `${left} - ${right}`,
      ariaLabel: `${left} minus ${right}`,
      answer: left - right,
      hint: `Subtract ${right} from ${left}.`,
    }
  }

  return {
    prompt: `${left} × ${right}`,
    ariaLabel: `${left} times ${right}`,
    answer: left * right,
    hint: `Multiply ${left} by ${right}.`,
  }
}

function makeElementaryChallenge(level: number, depth: number): Challenge {
  const skill = level + Math.floor(depth * 0.7)
  const op = skill >= 3 ? pick(OPS) : pick(['+', '-'] as const)

  if (op === '×') {
    const cap = Math.min(6 + skill, 12)
    return makeArithmeticChallenge(randomInt(2, cap), randomInt(2, cap), op)
  }

  const cap = Math.min(18 + skill * 4, 90)
  const left = randomInt(1, cap)
  const right = randomInt(1, cap)

  if (op === '-') {
    return makeArithmeticChallenge(Math.max(left, right), Math.min(left, right), op)
  }

  return makeArithmeticChallenge(left, right, op)
}

function makeMiddleSchoolChallenge(level: number, depth: number): Challenge {
  const skill = level + Math.floor(depth * 0.9)
  const type = pick(['signed', 'division', 'square', 'mixed'] as const)

  if (type === 'division') {
    const divisor = randomInt(2, Math.min(12 + skill, 24))
    const answer = randomInt(-8 - depth, 18 + skill)
    return {
      prompt: `${answer * divisor} / ${divisor}`,
      ariaLabel: `${answer * divisor} divided by ${divisor}`,
      answer,
      hint: `Find the number that times ${divisor} gives ${answer * divisor}.`,
    }
  }

  if (type === 'square') {
    const base = randomInt(3, Math.min(10 + Math.floor(skill / 2), 18))
    const offset = randomInt(-12, 18)
    return {
      prompt: `${base}^2 ${formatSigned(offset)}`,
      ariaLabel: `${base} squared ${offset >= 0 ? 'plus' : 'minus'} ${Math.abs(offset)}`,
      answer: base * base + offset,
      hint: `Square ${base}, then apply ${formatSigned(offset)}.`,
    }
  }

  if (type === 'mixed') {
    const left = randomInt(2, 12 + skill)
    const middle = randomInt(2, 9 + Math.floor(skill / 2))
    const right = randomInt(2, 16 + skill)
    return {
      prompt: `${left} × ${middle} - ${right}`,
      ariaLabel: `${left} times ${middle} minus ${right}`,
      answer: left * middle - right,
      hint: `Multiply first, then subtract ${right}.`,
    }
  }

  return makeArithmeticChallenge(randomInt(-20 - skill, 36 + skill), randomInt(-18 - depth, 28 + skill), pick(['+', '-'] as const))
}

function makeHighSchoolChallenge(level: number, depth: number): Challenge {
  const skill = level + depth
  const type = pick(['linear', 'root', 'power', 'sequence'] as const)

  if (type === 'linear') {
    const answer = randomInt(-8 - depth, 14 + Math.floor(skill / 2))
    const coefficient = randomInt(2, Math.min(6 + skill, 14))
    const offset = randomInt(-24, 32)
    const total = coefficient * answer + offset
    return {
      prompt: `${coefficient}x ${formatSigned(offset)} = ${total}`,
      ariaLabel: `${coefficient} x ${offset >= 0 ? 'plus' : 'minus'} ${Math.abs(offset)} equals ${total}`,
      answer,
      hint: `Move ${offset} to the other side, then divide by ${coefficient}.`,
    }
  }

  if (type === 'root') {
    const root = randomInt(4, Math.min(12 + Math.floor(skill / 2), 22))
    const offset = randomInt(-12, 20)
    return {
      prompt: `sqrt(${root * root}) ${formatSigned(offset)}`,
      ariaLabel: `square root of ${root * root} ${offset >= 0 ? 'plus' : 'minus'} ${Math.abs(offset)}`,
      answer: root + offset,
      hint: `sqrt(${root * root}) is ${root}.`,
    }
  }

  if (type === 'sequence') {
    const start = randomInt(-10, 24)
    const step = randomInt(3, Math.min(8 + Math.floor(skill / 2), 16))
    return {
      prompt: `${start}, ${start + step}, ${start + step * 2}, ?`,
      ariaLabel: `next number after ${start}, ${start + step}, ${start + step * 2}`,
      answer: start + step * 3,
      hint: `The sequence adds ${step} each time.`,
    }
  }

  const base = randomInt(2, Math.min(6 + Math.floor(skill / 2), 12))
  const offset = randomInt(-20, 28)
  return {
    prompt: `${base}^3 ${formatSigned(offset)}`,
    ariaLabel: `${base} cubed ${offset >= 0 ? 'plus' : 'minus'} ${Math.abs(offset)}`,
    answer: base * base * base + offset,
    hint: `Cube ${base}, then apply ${formatSigned(offset)}.`,
  }
}

function makeUniversityChallenge(level: number, depth: number): Challenge {
  const skill = level + depth
  const type = pick(['derivative', 'integral', 'determinant', 'modulo'] as const)

  if (type === 'derivative') {
    const a = randomInt(1, Math.min(4 + Math.floor(skill / 3), 9))
    const b = randomInt(-10, 14)
    const x = randomInt(1, Math.min(5 + Math.floor(skill / 3), 10))
    return {
      prompt: `d/dx(${a}x^2 ${formatSigned(b)}x) at x=${x}`,
      ariaLabel: `derivative of ${a} x squared ${b >= 0 ? 'plus' : 'minus'} ${Math.abs(b)} x at x equals ${x}`,
      answer: 2 * a * x + b,
      hint: `Derivative is ${2 * a}x ${formatSigned(b)}, then plug in x=${x}.`,
    }
  }

  if (type === 'integral') {
    const multiplier = randomInt(1, Math.min(4 + Math.floor(skill / 4), 8))
    const upper = randomInt(2, Math.min(6 + Math.floor(skill / 4), 10))
    return {
      prompt: `int_0^${upper} ${2 * multiplier}x dx`,
      ariaLabel: `integral from 0 to ${upper} of ${2 * multiplier} x d x`,
      answer: multiplier * upper * upper,
      hint: `Integral of ${2 * multiplier}x is ${multiplier}x^2. Evaluate at ${upper}.`,
    }
  }

  if (type === 'determinant') {
    const a = randomInt(-5, 8)
    const b = randomInt(-5, 8)
    const c = randomInt(-5, 8)
    const d = randomInt(-5, 8)
    return {
      prompt: `det [[${a}, ${b}], [${c}, ${d}]]`,
      ariaLabel: `determinant of matrix ${a} ${b} ${c} ${d}`,
      answer: a * d - b * c,
      hint: `For a 2x2 determinant, compute ${a}×${d} - ${b}×${c}.`,
    }
  }

  const modulus = randomInt(5, Math.min(10 + Math.floor(skill / 3), 17))
  const value = randomInt(35, 180 + skill * 5)
  return {
    prompt: `${value} mod ${modulus}`,
    ariaLabel: `${value} modulo ${modulus}`,
    answer: value % modulus,
    hint: `Divide ${value} by ${modulus}; answer with the remainder.`,
  }
}

function makeChallenge(level: number, depth = 1, difficultyId: DifficultyId = 'elementary'): Challenge {
  if (difficultyId === 'middle') return makeMiddleSchoolChallenge(level, depth)
  if (difficultyId === 'high') return makeHighSchoolChallenge(level, depth)
  if (difficultyId === 'university') return makeUniversityChallenge(level, depth)
  return makeElementaryChallenge(level, depth)
}

export default function MathPage() {
  const gameRef = useRef<HTMLElement | null>(null)
  const [xp, setXp] = useState(0)
  const [coins, setCoins] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [answerInput, setAnswerInput] = useState('')
  const [challenge, setChallenge] = useState<Challenge>(INITIAL_CHALLENGE)
  const [difficultyId, setDifficultyId] = useState<DifficultyId>('elementary')
  const [depth, setDepth] = useState(1)
  const [enemy, setEnemy] = useState<EnemyState>(() => makeEnemy(1))
  const [playerHp, setPlayerHp] = useState(PLAYER.maxHp)
  const [playerHit, setPlayerHit] = useState(false)
  const [playerAttack, setPlayerAttack] = useState(false)
  const [enemyHit, setEnemyHit] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [message, setMessage] = useState('A Cave Slime blocks the path. Solve to strike.')

  const level = levelForXp(xp)
  const selectedDifficulty = DIFFICULTY_TIERS.find((tier) => tier.id === difficultyId) ?? DIFFICULTY_TIERS[0]!
  const xpInLevel = xp % 120
  const progress = (xpInLevel / 120) * 100
  const enemyHpRatio = enemy.hp / enemy.maxHp
  const playerHpRatio = playerHp / PLAYER.maxHp
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
  const playerStyle = {
    '--enemy-primary': PLAYER.palette.primary,
    '--enemy-accent': PLAYER.palette.accent,
    '--enemy-shade': PLAYER.palette.shade,
    '--enemy-dark': PLAYER.palette.dark,
    '--enemy-eye': PLAYER.palette.eye,
    '--enemy-shine': PLAYER.palette.shine,
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

  const changeDifficulty = (nextDifficultyId: DifficultyId) => {
    const nextDifficulty = DIFFICULTY_TIERS.find((tier) => tier.id === nextDifficultyId) ?? DIFFICULTY_TIERS[0]!

    setDifficultyId(nextDifficultyId)
    setChallenge(makeChallenge(level, depth, nextDifficultyId))
    setAnswerInput('')
    setStreak(0)
    setMessage(`${nextDifficulty.label} rank selected. ${nextDifficulty.subtitle}`)
  }

  const submit = () => {
    const trimmed = answerInput.trim()
    if (!trimmed) return

    const value = Number(trimmed)
    if (!Number.isFinite(value)) return

    if (value === challenge.answer) {
      const gainedXp = Math.round((15 + Math.min(streak * 2, 20)) * selectedDifficulty.rewardMultiplier)
      const gainedCoins = Math.round((4 + Math.floor(streak / 2)) * selectedDifficulty.rewardMultiplier)
      const nextStreak = streak + 1
      const nextXp = xp + gainedXp
      const nextLevel = levelForXp(nextXp)
      const damage = Math.round((16 + level * 4 + Math.min(streak * 3, 18)) * selectedDifficulty.damageMultiplier)
      const remainingHp = Math.max(0, enemy.hp - damage)

      setXp(nextXp)
      setCoins((v) => v + gainedCoins)
      setStreak(nextStreak)
      setBestStreak((v) => Math.max(v, nextStreak))
      setPlayerAttack(true)
      setEnemyHit(true)
      setTimeout(() => setPlayerAttack(false), 260)
      setTimeout(() => setEnemyHit(false), 240)

      if (remainingHp === 0) {
        const nextDepth = depth + 1
        const nextEnemy = makeEnemy(nextDepth)
        const clearBonus = Math.round((8 + depth * 2) * selectedDifficulty.rewardMultiplier)
        const healAmount = Math.min(PLAYER.maxHp - playerHp, 10 + depth * 3)
        const healText = healAmount > 0 ? `, +${healAmount} HP` : ''

        setDepth(nextDepth)
        setEnemy(nextEnemy)
        setCoins((v) => v + clearBonus)
        setPlayerHp((v) => Math.min(PLAYER.maxHp, v + healAmount))
        setMessage(`${enemy.name} shattered. Depth ${nextDepth} opens. +${gainedXp} XP, +${gainedCoins + clearBonus} coins${healText}.`)
        setChallenge(makeChallenge(nextLevel, nextDepth, difficultyId))
      } else {
        setEnemy((current) => ({ ...current, hp: remainingHp }))
        setMessage(`Hit ${enemy.name} for ${damage}. +${gainedXp} XP, +${gainedCoins} coins.`)
        setChallenge(makeChallenge(nextLevel, depth, difficultyId))
      }

      setPulse(true)
      setTimeout(() => setPulse(false), 280)
    } else {
      const counterDamage = Math.min(Math.round((12 + depth * 3) * selectedDifficulty.counterMultiplier), 52)
      const remainingPlayerHp = Math.max(0, playerHp - counterDamage)

      setPlayerHit(true)
      setTimeout(() => setPlayerHit(false), 260)
      setStreak(0)

      if (remainingPlayerHp === 0) {
        const resetEnemy = makeEnemy(1)

        setPlayerHp(PLAYER.maxHp)
        setDepth(1)
        setEnemy(resetEnemy)
        setCoins((v) => Math.max(0, v - 12))
        setMessage(`${enemy.name} broke your guard. Correct answer: ${challenge.answer}. You revived at Depth 1 and lost 12 coins.`)
        setChallenge(makeChallenge(level, 1, difficultyId))
      } else {
        setPlayerHp(remainingPlayerHp)
        setMessage(`${enemy.name} countered for ${counterDamage}. Correct answer: ${challenge.answer}. Combo reset.`)
        setChallenge(makeChallenge(level, depth, difficultyId))
      }
    }

    setAnswerInput('')
  }

  const spendCoins = () => {
    if (coins < 25) {
      setMessage('You need 25 coins to unlock a hint shard.')
      return
    }

    setCoins((v) => v - 25)
    setMessage(`Hint: ${challenge.hint}`)
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
            {' '}
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
            <div
              className={styles.encounterStage}
              aria-label={`${PLAYER.name} has ${playerHp} of ${PLAYER.maxHp} HP. ${enemy.name} has ${enemy.hp} of ${enemy.maxHp} HP.`}
            >
              <div className={styles.depthMarker}>Depth {depth}</div>

              <div className={styles.battleLine}>
                <div className={`${styles.combatant} ${styles.playerCombatant}`}>
                  <div
                    className={`${styles.playerSpriteWrap} ${playerHit ? styles.playerHit : ''} ${playerAttack ? styles.playerAttack : ''}`}
                  >
                    <div className={`${styles.enemySprite} ${styles.playerSprite}`} style={playerStyle} aria-hidden="true">
                      {PLAYER.sprite.map((row, rowIndex) =>
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

                  <div className={`${styles.combatantHud} ${styles.playerCombatHud}`}>
                    <div className={styles.combatantNameLine}>
                      <span>{PLAYER.title}</span>
                      <strong>{PLAYER.name}</strong>
                    </div>
                    <div className={styles.playerHpText}>{playerHp}/{PLAYER.maxHp} HP</div>
                    <div className={styles.playerHpTrack} aria-hidden="true">
                      <div className={styles.playerHpFill} style={{ width: `${playerHpRatio * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className={styles.battleDivider} aria-hidden="true">
                  <span />
                </div>

                <div className={`${styles.combatant} ${styles.enemyCombatant}`}>
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

                  <div className={`${styles.combatantHud} ${styles.enemyCombatHud}`}>
                    <div className={styles.combatantNameLine}>
                      <span>{enemy.title}</span>
                      <strong>{enemy.name}</strong>
                    </div>
                    <div className={styles.enemyHpText}>{enemy.hp}/{enemy.maxHp} HP</div>
                    <div className={styles.enemyHpTrack} aria-hidden="true">
                      <div className={styles.enemyHpFill} style={{ width: `${enemyHpRatio * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className={styles.sectionLabel}>Current challenge</p>
            <h2 className={styles.paneTitle} id="challenge-title">Sprint prompt</h2>

            <div className={styles.equationPanel}>
              <div className={styles.challengeExpression} aria-label={challenge.ariaLabel}>
                <span>{challenge.prompt}</span>
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
            <section className={styles.difficultyPanel} aria-label="School difficulty rank">
              <div className={styles.difficultyTopline}>
                <span>School rank</span>
                <strong>{selectedDifficulty.label}</strong>
              </div>
              <div className={styles.difficultyRail}>
                {DIFFICULTY_TIERS.map((tier) => {
                  const isSelected = tier.id === difficultyId

                  return (
                    <button
                      className={`${styles.difficultyButton} ${isSelected ? styles.difficultyButtonActive : ''}`}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => changeDifficulty(tier.id)}
                      key={tier.id}
                    >
                      <span>{tier.shortLabel}</span>
                      <strong>{tier.label}</strong>
                    </button>
                  )
                })}
              </div>
              <p>{selectedDifficulty.subtitle}</p>
            </section>

            <div className={styles.gameHud}>
              <article className={`${styles.hudCard} ${styles.playerMiniHud}`} aria-label={`${PLAYER.name} HP ${playerHp} of ${PLAYER.maxHp}`}>
                <div className={styles.playerMiniAvatar} aria-hidden="true">
                  <span />
                </div>
                <div className={styles.playerMiniStats}>
                  <div className={styles.playerMiniTop}>
                    <span>Player HP</span>
                    <strong>{playerHp}/{PLAYER.maxHp}</strong>
                  </div>
                  <div className={styles.playerMiniTrack} aria-hidden="true">
                    <div className={styles.playerMiniFill} style={{ width: `${playerHpRatio * 100}%` }} />
                  </div>
                </div>
              </article>

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
