'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'

type AppTab = 'overview' | 'capture' | 'bridge'
type DigitalType = 'reference' | 'action' | 'draft' | 'archive'
type LinkPurpose = 'reference' | 'execution' | 'rewrite' | 'memory'
type RitualKey = 'capture' | 'distill' | 'action' | 'revisit'

type AnalogEntry = {
  id: string
  notebook: string
  page: string
  capturedOn: string
  focus: string
  summary: string
  nextAction: string
  tags: string[]
  reviewed: boolean
  createdAt: string
}

type DigitalEntry = {
  id: string
  title: string
  space: string
  type: DigitalType
  body: string
  tags: string[]
  sourceAnalogIds: string[]
  createdAt: string
}

type BridgeLink = {
  id: string
  analogId: string
  digitalId: string
  purpose: LinkPurpose
  note: string
  createdAt: string
}

type RitualState = Record<RitualKey, boolean> & { dateKey: string }

type AnalogForm = {
  notebook: string
  page: string
  capturedOn: string
  focus: string
  summary: string
  nextAction: string
  tags: string
}

type DigitalForm = {
  title: string
  space: string
  type: DigitalType
  body: string
  tags: string
  sourceAnalogIds: string[]
}

type LinkForm = {
  analogId: string
  digitalId: string
  purpose: LinkPurpose
  note: string
}

type EdgeTabCandidate = {
  id: string
  title: string
  url: string
  profile: string
  sourceKind: 'tabs' | 'session'
}

const STORAGE_KEY = 'hybrid-notes-atelier-v1'
const NOTEBOOKS = ['Daily Log', 'Project Book', 'Study Pad', 'Pocket Memo']
const SPACES = ['Knowledge Base', 'Action Board', 'Idea Garden', 'Archive Shelf']
const TYPE_META: Record<DigitalType, { label: string; tone: string }> = {
  reference: { label: 'Reference', tone: 'mint' },
  action: { label: 'Action', tone: 'orange' },
  draft: { label: 'Draft', tone: 'blue' },
  archive: { label: 'Archive', tone: 'slate' },
}
const PURPOSE_META: Record<LinkPurpose, { label: string; tone: string }> = {
  reference: { label: 'Reference Link', tone: 'mint' },
  execution: { label: 'Execution Link', tone: 'orange' },
  rewrite: { label: 'Rewrite Link', tone: 'violet' },
  memory: { label: 'Memory Link', tone: 'blue' },
}
const RITUALS: { id: RitualKey; label: string; detail: string }[] = [
  { id: 'capture', label: '紙ノートの要点を拾う', detail: '雑多なページから意味のある要約を作る。' },
  { id: 'distill', label: '学びを知識へ圧縮', detail: '検索したい結論だけをデジタルへ昇格する。' },
  { id: 'action', label: '次の行動を外へ出す', detail: 'やることを頭の外で追えるようにする。' },
  { id: 'revisit', label: '接続を振り返る', detail: '紙とデジタルが分断していないか確認する。' },
]
const WORKFLOW = [
  ['紙で速く書く', '会議や読書中はアナログで摩擦なく記録。'],
  ['デジタルで整理する', '要点と次の行動だけを検索可能な形へ。'],
  ['リンクを残して再利用する', 'あとから文脈ごと再発見できる状態にする。'],
]
const PROMPTS = [
  '今日いちばん価値が高かった紙ページはどれか',
  '検索できる形に直したい一文は何か',
  '次の48時間で動く行動は何か',
  '未来の自分に残すべき文脈は何か',
]

function todayKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function defaultRitual(): RitualState {
  return { dateKey: todayKey(), capture: false, distill: false, action: false, revisit: false }
}

function defaultAnalog(): AnalogForm {
  return { notebook: NOTEBOOKS[0], page: '', capturedOn: todayKey(), focus: '', summary: '', nextAction: '', tags: '' }
}

function defaultDigital(): DigitalForm {
  return { title: '', space: SPACES[0], type: 'reference', body: '', tags: '', sourceAnalogIds: [] }
}

function defaultLink(): LinkForm {
  return { analogId: '', digitalId: '', purpose: 'reference', note: '' }
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function splitTags(raw: string) {
  return raw.split(',').map((item) => item.trim()).filter(Boolean)
}

function shortDate(value: string) {
  const parts = value.split('-')
  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : value
}

function stamp(value: string) {
  return new Date(value).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function HybridNotesApp() {
  const [tab, setTab] = useState<AppTab>('overview')
  const [ready, setReady] = useState(false)
  const [toast, setToast] = useState('')
  const [analogEntries, setAnalogEntries] = useState<AnalogEntry[]>([])
  const [digitalEntries, setDigitalEntries] = useState<DigitalEntry[]>([])
  const [bridgeLinks, setBridgeLinks] = useState<BridgeLink[]>([])
  const [ritual, setRitual] = useState<RitualState>(defaultRitual())
  const [analogForm, setAnalogForm] = useState(defaultAnalog())
  const [digitalForm, setDigitalForm] = useState(defaultDigital())
  const [linkForm, setLinkForm] = useState(defaultLink())
  const [edgeTabs, setEdgeTabs] = useState<EdgeTabCandidate[]>([])
  const [edgeSelectedIds, setEdgeSelectedIds] = useState<string[]>([])
  const [edgeLoading, setEdgeLoading] = useState(false)
  const [edgeSourceLabel, setEdgeSourceLabel] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{ analogEntries: AnalogEntry[]; digitalEntries: DigitalEntry[]; bridgeLinks: BridgeLink[]; ritual: RitualState }>
        setAnalogEntries(Array.isArray(parsed.analogEntries) ? parsed.analogEntries : [])
        setDigitalEntries(Array.isArray(parsed.digitalEntries) ? parsed.digitalEntries : [])
        setBridgeLinks(Array.isArray(parsed.bridgeLinks) ? parsed.bridgeLinks : [])
        setRitual(parsed.ritual?.dateKey === todayKey() ? { ...defaultRitual(), ...parsed.ritual } : defaultRitual())
      }
    } catch {
      setRitual(defaultRitual())
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ analogEntries, digitalEntries, bridgeLinks, ritual }))
    } catch {
      // ignore
    }
  }, [ready, analogEntries, digitalEntries, bridgeLinks, ritual])

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }, [])

  const flash = (message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  const analogMap = Object.fromEntries(analogEntries.map((entry) => [entry.id, entry])) as Record<string, AnalogEntry>
  const digitalMap = Object.fromEntries(digitalEntries.map((entry) => [entry.id, entry])) as Record<string, DigitalEntry>
  const linkedAnalogIds = new Set<string>()
  bridgeLinks.forEach((link) => linkedAnalogIds.add(link.analogId))
  digitalEntries.forEach((entry) => entry.sourceAnalogIds.forEach((sourceId) => linkedAnalogIds.add(sourceId)))

  const pendingAnalog = analogEntries.filter((entry) => !entry.reviewed || !linkedAnalogIds.has(entry.id))
  const ritualDone = RITUALS.filter((item) => ritual[item.id]).length
  const coverage = analogEntries.length ? Math.round((linkedAnalogIds.size / analogEntries.length) * 100) : 0
  const hybridScore = Math.round(coverage * 0.6 + (ritualDone / RITUALS.length) * 40)
  const latestAnalog = [...analogEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const latestDigital = [...digitalEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const latestLinks = [...bridgeLinks].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const saveAnalog = () => {
    if (!analogForm.focus.trim() || !analogForm.summary.trim()) return flash('紙ノートの焦点と要約を入れてください。')
    setAnalogEntries((prev) => [
      {
        id: uid('analog'),
        notebook: analogForm.notebook,
        page: analogForm.page.trim(),
        capturedOn: analogForm.capturedOn,
        focus: analogForm.focus.trim(),
        summary: analogForm.summary.trim(),
        nextAction: analogForm.nextAction.trim(),
        tags: splitTags(analogForm.tags),
        reviewed: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setAnalogForm({ ...defaultAnalog(), notebook: analogForm.notebook, capturedOn: todayKey() })
    setRitual((prev) => ({ ...prev, capture: true }))
    flash('アナログノートを取り込みました。')
  }

  const saveDigital = () => {
    if (!digitalForm.title.trim() || !digitalForm.body.trim()) return flash('デジタルノートはタイトルと本文が必要です。')
    const next = {
      id: uid('digital'),
      title: digitalForm.title.trim(),
      space: digitalForm.space,
      type: digitalForm.type,
      body: digitalForm.body.trim(),
      tags: splitTags(digitalForm.tags),
      sourceAnalogIds: digitalForm.sourceAnalogIds,
      createdAt: new Date().toISOString(),
    }
    setDigitalEntries((prev) => [next, ...prev])
    setDigitalForm(defaultDigital())
    setRitual((prev) => ({ ...prev, distill: prev.distill || next.sourceAnalogIds.length > 0, action: prev.action || next.type === 'action' }))
    flash('デジタルノートを保存しました。')
  }

  const saveLink = () => {
    if (!linkForm.analogId || !linkForm.digitalId) return flash('紙ノートとデジタルノートを選んでください。')
    if (bridgeLinks.some((item) => item.analogId === linkForm.analogId && item.digitalId === linkForm.digitalId && item.purpose === linkForm.purpose)) return flash('同じリンクはすでにあります。')
    setBridgeLinks((prev) => [{ id: uid('link'), analogId: linkForm.analogId, digitalId: linkForm.digitalId, purpose: linkForm.purpose, note: linkForm.note.trim(), createdAt: new Date().toISOString() }, ...prev])
    setAnalogEntries((prev) => prev.map((entry) => entry.id === linkForm.analogId ? { ...entry, reviewed: true } : entry))
    setLinkForm(defaultLink())
    setRitual((prev) => ({ ...prev, distill: true, revisit: true }))
    flash('紙とデジタルをリンクしました。')
  }

  const toggleSourceAnalog = (analogId: string) => setDigitalForm((prev) => ({
    ...prev,
    sourceAnalogIds: prev.sourceAnalogIds.includes(analogId) ? prev.sourceAnalogIds.filter((id) => id !== analogId) : [...prev.sourceAnalogIds, analogId],
  }))

  const draftFromAnalog = (entry: AnalogEntry) => {
    setDigitalForm({
      title: entry.focus,
      space: entry.nextAction ? 'Action Board' : 'Knowledge Base',
      type: entry.nextAction ? 'action' : 'reference',
      body: [`Source: ${entry.notebook}${entry.page ? ` p.${entry.page}` : ''}`, `Captured: ${entry.capturedOn}`, '', 'Summary', entry.summary, ...(entry.nextAction ? ['', 'Next Move', entry.nextAction] : [])].join('\n'),
      tags: entry.tags.join(', '),
      sourceAnalogIds: [entry.id],
    })
    setTab('capture')
    flash('紙ノートからデジタル草案を作りました。')
  }

  const markReviewed = (analogId: string) => {
    setAnalogEntries((prev) => prev.map((entry) => entry.id === analogId ? { ...entry, reviewed: true } : entry))
    setRitual((prev) => ({ ...prev, revisit: true }))
    flash('レビュー済みにしました。')
  }

  const deleteAnalog = (analogId: string) => {
    setAnalogEntries((prev) => prev.filter((entry) => entry.id !== analogId))
    setBridgeLinks((prev) => prev.filter((entry) => entry.analogId !== analogId))
    setDigitalEntries((prev) => prev.map((entry) => ({ ...entry, sourceAnalogIds: entry.sourceAnalogIds.filter((id) => id !== analogId) })))
    flash('紙ノートを削除しました。')
  }

  const deleteDigital = (digitalId: string) => {
    setDigitalEntries((prev) => prev.filter((entry) => entry.id !== digitalId))
    setBridgeLinks((prev) => prev.filter((entry) => entry.digitalId !== digitalId))
    flash('デジタルノートを削除しました。')
  }

  const deleteLink = (linkId: string) => {
    setBridgeLinks((prev) => prev.filter((entry) => entry.id !== linkId))
    flash('リンクを解除しました。')
  }

  const toggleEdgeSelection = (tabId: string) => {
    setEdgeSelectedIds((prev) => prev.includes(tabId) ? prev.filter((id) => id !== tabId) : [...prev, tabId])
  }

  const loadEdgeTabs = async () => {
    setEdgeLoading(true)

    try {
      const response = await fetch('/api/edge-tabs', { cache: 'no-store' })
      const payload = await response.json() as {
        tabs?: EdgeTabCandidate[]
        source?: { kind: string; profile: string; updatedAt: string }
        error?: string
      }

      if (!response.ok || payload.error) {
        throw new Error(payload.error || 'Edge session could not be loaded.')
      }

      const tabs = Array.isArray(payload.tabs) ? payload.tabs : []
      setEdgeTabs(tabs)
      setEdgeSelectedIds([])
      setEdgeSourceLabel(payload.source ? `${payload.source.profile} • ${payload.source.kind} • ${stamp(payload.source.updatedAt)}` : '')
      flash(tabs.length > 0 ? `${tabs.length}件の Edge タブ候補を取得しました。` : 'Edge から取り込めるタブが見つかりませんでした。')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Edge import failed.'
      flash(message)
    } finally {
      setEdgeLoading(false)
    }
  }

  const importSelectedEdgeTabs = () => {
    const selectedTabs = edgeTabs.filter((entry) => edgeSelectedIds.includes(entry.id))
    if (selectedTabs.length === 0) return flash('保存したい Edge タブを選んでください。')

    const importedAt = new Date()
    const entries: DigitalEntry[] = selectedTabs.map((entry, index) => {
      let hostTag = 'edge'

      try {
        const parsed = new URL(entry.url)
        hostTag = parsed.hostname.replace(/^www\./, '') || hostTag
      } catch {
        if (entry.url.startsWith('edge://')) hostTag = 'edge'
      }

      return {
        id: uid('digital'),
        title: entry.title,
        space: 'Knowledge Base',
        type: 'reference',
        body: [
          `Source: Microsoft Edge (${entry.profile})`,
          `Imported: ${importedAt.toLocaleString('ja-JP')}`,
          `URL: ${entry.url}`,
        ].join('\n'),
        tags: ['edge-import', hostTag],
        sourceAnalogIds: [],
        createdAt: new Date(importedAt.getTime() + index).toISOString(),
      }
    })

    setDigitalEntries((prev) => [...entries, ...prev])
    setRitual((prev) => ({ ...prev, distill: true }))
    flash(`${entries.length}件の Edge タブをタイトル付きで保存しました。`)
  }

  return (
    <div className="hybridApp">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      <div className="hybridWrap">
        <header className="panel heroPanel">
          <div className="heroCopy">
            <div className="eyebrow">Hybrid Notes Atelier</div>
            <h1>紙の勢いとデジタルの検索性をひとつに。</h1>
            <p>
              会議や読書中はアナログで速く書き、あとで要点と行動だけをデジタルへ昇格。
              このアプリは、両方をつなぐためのワークスペースです。
            </p>
            <div className="chipRow">
              <span className="chip">Capture fast</span>
              <span className="chip">Distill clearly</span>
              <span className="chip">Link context</span>
            </div>
          </div>
          <div className="panel pulsePanel">
            <div className="eyebrow">Today&apos;s Pulse</div>
            <div className="statGrid">
              <div className="statCard"><span>Paper Inbox</span><strong>{pendingAnalog.length}</strong></div>
              <div className="statCard"><span>Digital Notes</span><strong>{digitalEntries.length}</strong></div>
              <div className="statCard"><span>Coverage</span><strong>{coverage}%</strong></div>
              <div className="statCard"><span>Hybrid Score</span><strong>{hybridScore}</strong></div>
            </div>
            <div className="focusBox">
              <div className="eyebrow dim">Focus Queue</div>
              <strong>{pendingAnalog.length > 0 ? `${pendingAnalog.length}件の紙ノートがデジタル化待ちです。` : '紙ノートの未処理キューはありません。'}</strong>
              <p>まず紙に書いて、価値のあるものだけをデジタルへ。両方を使う前提で設計しています。</p>
            </div>
          </div>
        </header>

        <div className="tabRow">
          {(['overview', 'capture', 'bridge'] as AppTab[]).map((item) => (
            <button key={item} className={`tabBtn ${tab === item ? 'tabBtnActive' : ''}`} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="splitGrid">
            <div className="stack">
              <section className="panel sectionPad">
                <div className="sectionHead">
                  <div><div className="eyebrow">Bridge Queue</div><h2>今つなぐべき紙ノート</h2></div>
                  <button className="ghostBtn" onClick={() => setTab('capture')}>取り込みへ</button>
                </div>
                <div className="stack">
                  {pendingAnalog.length === 0 && <div className="emptyCard">未処理の紙ノートはありません。新しいページを書いたら `Capture` で要点を取り込めます。</div>}
                  {pendingAnalog.slice(0, 4).map((entry) => (
                    <article key={entry.id} className="entryCard">
                      <div className="entryHead">
                        <div>
                          <div className="metaLine paper">{entry.notebook}{entry.page ? ` • p.${entry.page}` : ''} • {shortDate(entry.capturedOn)}</div>
                          <h3>{entry.focus}</h3>
                        </div>
                        {!entry.reviewed && <span className="badge badgeOrange">needs review</span>}
                      </div>
                      <p>{entry.summary}</p>
                      {entry.nextAction && <div className="callout calloutBlue"><strong>Next:</strong> {entry.nextAction}</div>}
                      <div className="chipRow">{entry.tags.map((tag) => <span key={tag} className="miniChip">#{tag}</span>)}</div>
                      <div className="actionRow">
                        <button className="primaryBtn" onClick={() => draftFromAnalog(entry)}>デジタル草案を作る</button>
                        <button className="ghostBtn" onClick={() => markReviewed(entry.id)}>レビュー済みにする</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel sectionPad">
                <div className="eyebrow">Prompts</div>
                <h2>紙からデジタルへ渡す問い</h2>
                <div className="stack">
                  {PROMPTS.map((prompt, index) => (
                    <div key={prompt} className="promptCard">
                      <div className={`promptIndex ${index % 2 === 0 ? 'toneOrange' : 'toneMint'}`}>{index + 1}</div>
                      <div>{prompt}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="stack">
              <section className="panel sectionPad">
                <div className="eyebrow">Workflow</div>
                <h2>両活用の基本リズム</h2>
                <div className="stack">
                  {WORKFLOW.map(([title, body], index) => (
                    <div key={title} className={`workflowCard tone${index + 1}`}>
                      <strong>{title}</strong>
                      <p>{body}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel sectionPad">
                <div className="sectionHead">
                  <div><div className="eyebrow">Digital Shelf</div><h2>最近のデジタルノート</h2></div>
                  <button className="ghostBtn" onClick={() => setTab('capture')}>デジタル記録へ</button>
                </div>
                <div className="stack">
                  {latestDigital.length === 0 && <div className="emptyCard">まだデジタルノートはありません。要約や行動を書き出して検索性を作れます。</div>}
                  {latestDigital.slice(0, 4).map((entry) => (
                    <article key={entry.id} className="entryCard">
                      <div className="entryHead">
                        <div>
                          <div className="metaLine">{entry.space} • {stamp(entry.createdAt)}</div>
                          <h3>{entry.title}</h3>
                        </div>
                        <span className={`badge badge${TYPE_META[entry.type].tone}`}>{TYPE_META[entry.type].label}</span>
                      </div>
                      <p className="preLine">{entry.body}</p>
                      <div className="chipRow">
                        {entry.tags.map((tag) => <span key={tag} className="miniChip">#{tag}</span>)}
                        {entry.sourceAnalogIds.map((sourceId) => analogMap[sourceId] ? <span key={sourceId} className="miniChip miniChipPaper">{analogMap[sourceId].notebook}{analogMap[sourceId].page ? ` p.${analogMap[sourceId].page}` : ''}</span> : null)}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {tab === 'capture' && (
          <div className="gridTwo">
            <section className="panel sectionPad widePanel">
              <div className="sectionHead">
                <div>
                  <div className="eyebrow">Edge Import</div>
                  <h2>Microsoft Edge の開いているタブ候補を保存</h2>
                </div>
                <button className="ghostBtn" onClick={loadEdgeTabs} disabled={edgeLoading}>
                  {edgeLoading ? '読み込み中...' : 'Edge から取得'}
                </button>
              </div>
              <p className="lead">
                Edge の最新セッションスナップショットから、タイトル付きタブ候補を読み込みます。
                保存するとデジタルノートとして URL と一緒に残せます。
              </p>
              {edgeSourceLabel && <div className="helper">Source: {edgeSourceLabel}</div>}
              <div className="stack tightStack">
                {edgeTabs.length === 0 && <div className="emptyCard">まだ Edge タブ候補は読み込まれていません。</div>}
                {edgeTabs.length > 0 && (
                  <>
                    <div className="candidateList">
                      {edgeTabs.map((entry) => (
                        <label key={entry.id} className="candidateRow">
                          <input
                            type="checkbox"
                            checked={edgeSelectedIds.includes(entry.id)}
                            onChange={() => toggleEdgeSelection(entry.id)}
                          />
                          <div className="candidateBody">
                            <strong>{entry.title}</strong>
                            <span>{entry.url}</span>
                          </div>
                          <span className={`badge badge${entry.sourceKind === 'tabs' ? 'mint' : 'blue'}`}>{entry.sourceKind}</span>
                        </label>
                      ))}
                    </div>
                    <div className="actionRow">
                      <span className="helper">{edgeSelectedIds.length}件選択中</span>
                      <button className="primaryBtn" onClick={importSelectedEdgeTabs}>選択したタブを保存</button>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="panel sectionPad">
              <div className="eyebrow">Analog Capture</div>
              <h2>紙ノートを取り込む</h2>
              <p className="lead">ページ番号と要約を残しておくと、紙の文脈を失わずにデジタル検索へつなげられます。</p>
              <form className="formStack" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); saveAnalog() }}>
                <div>
                  <div className="eyebrow">Notebook</div>
                  <div className="chipRow">
                    {NOTEBOOKS.map((notebook) => (
                      <button key={notebook} type="button" className={`pillBtn ${analogForm.notebook === notebook ? 'pillBtnActive' : ''}`} onClick={() => setAnalogForm((prev) => ({ ...prev, notebook }))}>
                        {notebook}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="gridInput"><input className="input" value={analogForm.page} onChange={(event) => setAnalogForm((prev) => ({ ...prev, page: event.target.value }))} placeholder="Page" /><input className="input" type="date" value={analogForm.capturedOn} onChange={(event) => setAnalogForm((prev) => ({ ...prev, capturedOn: event.target.value }))} /></div>
                <input className="input" value={analogForm.focus} onChange={(event) => setAnalogForm((prev) => ({ ...prev, focus: event.target.value }))} placeholder="Focus" />
                <textarea className="input area" value={analogForm.summary} onChange={(event) => setAnalogForm((prev) => ({ ...prev, summary: event.target.value }))} placeholder="Summary" />
                <textarea className="input area small" value={analogForm.nextAction} onChange={(event) => setAnalogForm((prev) => ({ ...prev, nextAction: event.target.value }))} placeholder="Next action" />
                <input className="input" value={analogForm.tags} onChange={(event) => setAnalogForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="meeting, design, article" />
                <div className="actionRow"><span className="helper">紙ノートは速さ担当。ここではあとで見返せる意味を足します。</span><button className="primaryBtn" type="submit">アナログ記録を追加</button></div>
              </form>
            </section>

            <section className="panel sectionPad">
              <div className="eyebrow">Digital Distill</div>
              <h2>デジタルへ昇格する</h2>
              <p className="lead">要点だけをデジタルへ残して、検索・再利用・行動管理をしやすくします。</p>
              <form className="formStack" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); saveDigital() }}>
                <div className="gridInput"><input className="input" value={digitalForm.title} onChange={(event) => setDigitalForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" /><select className="input" value={digitalForm.space} onChange={(event) => setDigitalForm((prev) => ({ ...prev, space: event.target.value }))}>{SPACES.map((space) => <option key={space} value={space}>{space}</option>)}</select></div>
                <div className="chipRow">
                  {(Object.keys(TYPE_META) as DigitalType[]).map((type) => (
                    <button key={type} type="button" className={`pillBtn toneBtn ${digitalForm.type === type ? `tone${TYPE_META[type].tone}Active` : `tone${TYPE_META[type].tone}`}`} onClick={() => setDigitalForm((prev) => ({ ...prev, type }))}>
                      {TYPE_META[type].label}
                    </button>
                  ))}
                </div>
                <textarea className="input area tall" value={digitalForm.body} onChange={(event) => setDigitalForm((prev) => ({ ...prev, body: event.target.value }))} placeholder="Body" />
                <div>
                  <div className="eyebrow">Linked Paper Pages</div>
                  <div className="chipRow">
                    {latestAnalog.slice(0, 8).map((entry) => (
                      <button key={entry.id} type="button" className={`pillBtn ${digitalForm.sourceAnalogIds.includes(entry.id) ? 'pillBtnActive' : ''}`} onClick={() => toggleSourceAnalog(entry.id)}>
                        {entry.notebook}{entry.page ? ` p.${entry.page}` : ''} • {entry.focus}
                      </button>
                    ))}
                    {latestAnalog.length === 0 && <span className="helper">先に紙ノートを取り込むと、ここで元ページを選べます。</span>}
                  </div>
                </div>
                <input className="input" value={digitalForm.tags} onChange={(event) => setDigitalForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="reference, next-step" />
                <div className="actionRow"><span className="helper">デジタル側は検索したいものと行動に変えるものに絞ると続きます。</span><button className="primaryBtn" type="submit">デジタルノートを追加</button></div>
              </form>
            </section>

            <section className="panel sectionPad">
              <div className="sectionHead"><div><div className="eyebrow">Recent Paper</div><h2>アナログ記録</h2></div><span className="countText">{analogEntries.length} items</span></div>
              <div className="stack">
                {latestAnalog.length === 0 && <div className="emptyCard">まだ紙ノートの取り込みはありません。</div>}
                {latestAnalog.slice(0, 4).map((entry) => (
                  <article key={entry.id} className="entryCard">
                    <div className="entryHead">
                      <div><div className="metaLine paper">{entry.notebook}{entry.page ? ` • p.${entry.page}` : ''} • {shortDate(entry.capturedOn)}</div><h3>{entry.focus}</h3></div>
                      <button className="ghostBtn" onClick={() => deleteAnalog(entry.id)}>削除</button>
                    </div>
                    <p>{entry.summary}</p>
                    <div className="chipRow">{entry.tags.map((tag) => <span key={tag} className="miniChip">#{tag}</span>)}</div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel sectionPad">
              <div className="sectionHead"><div><div className="eyebrow">Recent Digital</div><h2>デジタル記録</h2></div><span className="countText">{digitalEntries.length} items</span></div>
              <div className="stack">
                {latestDigital.length === 0 && <div className="emptyCard">まだデジタルノートはありません。</div>}
                {latestDigital.slice(0, 4).map((entry) => (
                  <article key={entry.id} className="entryCard">
                    <div className="entryHead">
                      <div><div className="metaLine">{entry.space} • {stamp(entry.createdAt)}</div><h3>{entry.title}</h3></div>
                      <div className="entryActions"><span className={`badge badge${TYPE_META[entry.type].tone}`}>{TYPE_META[entry.type].label}</span><button className="ghostBtn" onClick={() => deleteDigital(entry.id)}>削除</button></div>
                    </div>
                    <p className="preLine">{entry.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'bridge' && (
          <div className="stack">
            <div className="gridTwo">
              <section className="panel sectionPad">
                <div className="eyebrow">Ritual</div>
                <h2>今日の接続ルーティン</h2>
                <p className="lead">アナログとデジタルを分断させないための最小ステップです。</p>
                <div className="progressBar"><div className="progressFill" style={{ width: `${(ritualDone / RITUALS.length) * 100}%` }} /></div>
                <div className="countText">{ritualDone}/{RITUALS.length} 完了</div>
                <div className="stack">
                  {RITUALS.map((item) => (
                    <button key={item.id} className={`ritualCard ${ritual[item.id] ? 'ritualCardActive' : ''}`} onClick={() => setRitual((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}>
                      <div className="entryHead"><strong>{item.label}</strong><span className={`ritualDot ${ritual[item.id] ? 'ritualDotActive' : ''}`}>{ritual[item.id] ? '✓' : '•'}</span></div>
                      <p>{item.detail}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel sectionPad">
                <div className="eyebrow">Link Builder</div>
                <h2>紙とデジタルを結ぶ</h2>
                <p className="lead">どの紙ページから、どのデジタルノートが生まれたかを残します。</p>
                <form className="formStack" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); saveLink() }}>
                  <select className="input" value={linkForm.analogId} onChange={(event) => setLinkForm((prev) => ({ ...prev, analogId: event.target.value }))}>
                    <option value="">紙ノートを選ぶ</option>
                    {latestAnalog.map((entry) => <option key={entry.id} value={entry.id}>{entry.notebook}{entry.page ? ` p.${entry.page}` : ''} • {entry.focus}</option>)}
                  </select>
                  <select className="input" value={linkForm.digitalId} onChange={(event) => setLinkForm((prev) => ({ ...prev, digitalId: event.target.value }))}>
                    <option value="">デジタルノートを選ぶ</option>
                    {latestDigital.map((entry) => <option key={entry.id} value={entry.id}>{entry.space} • {entry.title}</option>)}
                  </select>
                  <div className="chipRow">
                    {(Object.keys(PURPOSE_META) as LinkPurpose[]).map((purpose) => (
                      <button key={purpose} type="button" className={`pillBtn toneBtn ${linkForm.purpose === purpose ? `tone${PURPOSE_META[purpose].tone}Active` : `tone${PURPOSE_META[purpose].tone}`}`} onClick={() => setLinkForm((prev) => ({ ...prev, purpose }))}>
                        {PURPOSE_META[purpose].label}
                      </button>
                    ))}
                  </div>
                  <textarea className="input area small" value={linkForm.note} onChange={(event) => setLinkForm((prev) => ({ ...prev, note: event.target.value }))} placeholder="この接続を残す意図" />
                  <div className="actionRow"><span className="helper">紙の出どころが分かると、デジタルノートの再利用性が上がります。</span><button className="primaryBtn" type="submit">リンクを作成</button></div>
                </form>
              </section>
            </div>

            <div className="gridTwo">
              <section className="panel sectionPad">
                <div className="sectionHead"><div><div className="eyebrow">Connections</div><h2>作成したリンク</h2></div><span className="countText">{bridgeLinks.length} links</span></div>
                <div className="stack">
                  {latestLinks.length === 0 && <div className="emptyCard">まだリンクはありません。紙とデジタルの関連を残すと、思考の出どころを追いやすくなります。</div>}
                  {latestLinks.map((link) => {
                    const analog = analogMap[link.analogId]
                    const digital = digitalMap[link.digitalId]
                    if (!analog || !digital) return null
                    return (
                      <article key={link.id} className="entryCard">
                        <div className="entryHead">
                          <span className={`badge badge${PURPOSE_META[link.purpose].tone}`}>{PURPOSE_META[link.purpose].label}</span>
                          <button className="ghostBtn" onClick={() => deleteLink(link.id)}>解除</button>
                        </div>
                        <div className="callout calloutPaper"><strong>Analog:</strong> {analog.notebook}{analog.page ? ` p.${analog.page}` : ''} • {analog.focus}</div>
                        <div className="callout calloutBlue"><strong>Digital:</strong> {digital.space} • {digital.title}</div>
                        {link.note && <p>{link.note}</p>}
                      </article>
                    )
                  })}
                </div>
              </section>

              <section className="panel sectionPad">
                <div className="sectionHead"><div><div className="eyebrow">Review Queue</div><h2>未接続の紙ノート</h2></div><span className="countText">{pendingAnalog.length} items</span></div>
                <div className="stack">
                  {pendingAnalog.length === 0 && <div className="emptyCard">すべての紙ノートがレビュー済み、またはどこかのデジタルノートと接続されています。</div>}
                  {pendingAnalog.map((entry) => (
                    <article key={entry.id} className="entryCard">
                      <div className="metaLine paper">{entry.notebook}{entry.page ? ` • p.${entry.page}` : ''} • {shortDate(entry.capturedOn)}</div>
                      <h3>{entry.focus}</h3>
                      <p>{entry.summary}</p>
                      <div className="actionRow">
                        <button className="primaryBtn" onClick={() => draftFromAnalog(entry)}>デジタル草案へ</button>
                        <button className="ghostBtn" onClick={() => markReviewed(entry.id)}>レビュー済み</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>

      <style>{`
        *{box-sizing:border-box} button,input,textarea,select{font:inherit}
        .hybridApp{min-height:100vh;background:radial-gradient(circle at top left,rgba(20,184,166,.18),transparent 32%),radial-gradient(circle at top right,rgba(249,115,22,.16),transparent 28%),linear-gradient(180deg,#fff7ed 0%,#f8fafc 38%,#f4f7fb 100%);color:#14213d;font-family:'Space Grotesk','Noto Sans JP',sans-serif}
        .hybridWrap{max-width:1180px;margin:0 auto;padding:28px 18px 90px}.panel{background:rgba(255,252,248,.84);border:1px solid rgba(20,33,61,.08);border-radius:28px;box-shadow:0 24px 80px rgba(20,33,61,.12);backdrop-filter:blur(18px)}
        .heroPanel{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;padding:26px;position:relative;overflow:hidden}.pulsePanel{padding:18px;background:rgba(255,255,255,.7)}
        .heroCopy h1{margin:12px 0 0;font-size:clamp(36px,6vw,64px);line-height:.95;letter-spacing:-2.4px}.heroCopy p,.lead,.entryCard p,.workflowCard p,.focusBox p,.ritualCard p{color:#475569;line-height:1.75}
        .eyebrow{font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:#64748b;font-weight:700}.dim{opacity:.72}.tabRow,.chipRow,.actionRow,.sectionHead,.entryHead,.entryActions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.tabRow{margin:18px 0}
        .tabBtn,.ghostBtn,.pillBtn,.primaryBtn{border-radius:999px;padding:12px 18px;font-weight:700;cursor:pointer}.tabBtn,.ghostBtn,.pillBtn{border:1px solid rgba(20,33,61,.12);background:rgba(255,255,255,.72);color:#334155}.tabBtnActive{background:#0f172a;color:#f8fafc;box-shadow:0 14px 30px rgba(15,23,42,.16)}
        .primaryBtn{border:none;background:linear-gradient(135deg,#0f766e 0%,#1d4ed8 100%);color:#fff;box-shadow:0 18px 40px rgba(15,118,110,.24)}
        .splitGrid,.gridTwo{display:grid;grid-template-columns:1fr 1fr;gap:18px}.stack{display:grid;gap:18px}.tightStack{gap:12px}.sectionPad{padding:22px}.sectionPad h2{margin:8px 0 10px;font-size:30px}.countText,.helper,.metaLine{font-size:13px;color:#64748b}.metaLine.paper{color:#ea580c;font-weight:700}
        .widePanel{grid-column:1 / -1}
        .statGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.statCard{background:#fffdfa;border:1px solid rgba(20,33,61,.08);border-radius:20px;padding:16px}.statCard span{display:block;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#64748b;margin-bottom:8px}.statCard strong{font-size:30px}
        .focusBox{margin-top:16px;padding:14px;border-radius:18px;background:#0f172a;color:#e2e8f0}.focusBox strong{display:block;margin-top:8px;font-size:17px}.focusBox p{margin:6px 0 0;color:#cbd5e1}
        .entryCard,.workflowCard,.promptCard,.emptyCard,.ritualCard{border-radius:22px;padding:18px;background:#fffdfa;border:1px solid rgba(20,33,61,.08)} .entryCard h3{margin:6px 0 0;font-size:20px}.workflowCard strong{display:block;font-size:20px}.promptCard{display:flex;gap:12px;align-items:flex-start}.promptIndex,.ritualDot{width:36px;height:36px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}
        .toneOrange,.toneOrangeActive,.badgeorange,.badgeOrange{background:#fff7ed;color:#c2410c}.toneMint,.toneMintActive,.badgemint,.badgeMint{background:#ecfdf5;color:#0f766e}.toneBlue,.toneBlueActive,.badgeblue,.badgeBlue{background:#eff6ff;color:#1d4ed8}.toneViolet,.toneVioletActive,.badgeviolet,.badgeViolet{background:#f5f3ff;color:#7c3aed}.toneSlate,.toneSlateActive,.badgeslate,.badgeSlate{background:#f8fafc;color:#475569}
        .tone1 strong{color:#ea580c}.tone2 strong{color:#0f766e}.tone3 strong{color:#1d4ed8}.badge{font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:7px 10px;border-radius:999px}
        .miniChip{padding:6px 10px;border-radius:999px;background:#f1f5f9;color:#334155;font-size:12px;font-weight:700}.miniChipPaper{background:#fff7ed;color:#c2410c}
        .input{width:100%;border-radius:16px;border:1px solid rgba(20,33,61,.12);background:rgba(255,255,255,.72);padding:13px 14px;color:#0f172a;outline:none}.formStack{display:grid;gap:14px}.gridInput{display:grid;grid-template-columns:.9fr 1.1fr;gap:14px}
        .candidateList{display:grid;gap:10px;max-height:360px;overflow:auto;padding-right:4px}.candidateRow{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:flex-start;border-radius:18px;padding:14px;background:#fffdfa;border:1px solid rgba(20,33,61,.08);cursor:pointer}.candidateRow input{margin-top:4px}.candidateBody{display:grid;gap:4px;min-width:0}.candidateBody strong{font-size:15px}.candidateBody span{font-size:12px;line-height:1.6;color:#64748b;word-break:break-all}
        .area{min-height:120px;resize:vertical}.area.small{min-height:96px}.area.tall{min-height:180px}.callout{margin-top:10px;padding:12px;border-radius:16px}.calloutBlue{background:#eff6ff;color:#1e3a8a}.calloutPaper{background:#fff7ed;color:#9a3412}
        .progressBar{margin-top:18px;height:12px;border-radius:999px;background:#e2e8f0;overflow:hidden}.progressFill{height:100%;background:linear-gradient(90deg,#ea580c,#0f766e,#1d4ed8)}
        .ritualCard{text-align:left;border:none;cursor:pointer}.ritualCardActive{background:#0f172a;color:#f8fafc}.ritualCardActive p{color:#cbd5e1}.ritualDot{background:#e2e8f0;color:#64748b}.ritualDotActive{background:#14b8a6;color:#052e2b}
        .toneBtn{padding:10px 14px}.toneorangeActive,.tonemintActive,.toneblueActive,.tonevioletActive,.toneslateActive{color:#fff}.toneorangeActive{background:#c2410c}.tonemintActive{background:#0f766e}.toneblueActive{background:#1d4ed8}.tonevioletActive{background:#7c3aed}.toneslateActive{background:#475569}.pillBtnActive{background:#0f172a;color:#f8fafc}
        .ghostBtn:disabled,.primaryBtn:disabled{opacity:.5;cursor:not-allowed}
        .preLine{white-space:pre-line}.emptyCard{color:#475569}.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#0f172a;color:#f8fafc;padding:12px 18px;border-radius:999px;font-weight:700;box-shadow:0 18px 50px rgba(15,23,42,.24);z-index:50}
        @media (max-width:980px){.heroPanel,.splitGrid,.gridTwo,.gridInput{grid-template-columns:1fr}}
      `}</style>
    </div>
  )
}
