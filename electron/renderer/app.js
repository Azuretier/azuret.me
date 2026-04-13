const STORAGE_KEY = 'hybrid-notes-desktop-v2'
const NOTEBOOKS = ['Daily Log', 'Project Book', 'Study Pad', 'Pocket Memo']
const SPACES = ['Knowledge Base', 'Action Board', 'Idea Garden', 'Archive Shelf']
const TYPE_META = {
  reference: { label: 'Reference', tone: 'mint' },
  action: { label: 'Action', tone: 'orange' },
  draft: { label: 'Draft', tone: 'blue' },
  archive: { label: 'Archive', tone: 'slate' },
}
const PURPOSE_META = {
  reference: { label: 'Reference', tone: 'mint' },
  execution: { label: 'Execution', tone: 'orange' },
  rewrite: { label: 'Rewrite', tone: 'violet' },
  memory: { label: 'Memory', tone: 'blue' },
}
const RITUALS = [
  { id: 'capture', label: 'Capture paper highlights', detail: '価値のあるページだけを拾い上げる。' },
  { id: 'distill', label: 'Distill into digital', detail: '検索したい内容だけをデジタルへ昇格する。' },
  { id: 'action', label: 'Ship the next action', detail: '次の行動がすぐ見える状態にする。' },
  { id: 'revisit', label: 'Reconnect the context', detail: '紙とデジタルのつながりを点検する。' },
]
const PROMPTS = [
  '今日いちばん価値が高かったページはどれか',
  '検索できる形に直したい一文は何か',
  '次の48時間で動くタスクは何か',
]

const state = {
  activeView: 'overview',
  analogEntries: [],
  digitalEntries: [],
  bridgeLinks: [],
  ritual: defaultRitual(),
  toast: '',
  toastTimer: null,
  edgeTabs: [],
  edgeSelectedIds: [],
  edgeLoading: false,
  edgeSourceLabel: '',
  digitalDraft: null,
}

const app = document.querySelector('#app')
let edgePollTimer = null

function todayKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function defaultRitual() {
  return { dateKey: todayKey(), capture: false, distill: false, action: false, revisit: false }
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function splitTags(raw) {
  return raw.split(',').map((item) => item.trim()).filter(Boolean)
}

function shortDate(value) {
  const parts = value.split('-')
  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : value
}

function stamp(value) {
  return new Date(value).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function safeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function notePreview(text) {
  return safeText(text).replaceAll('\n', '<br />')
}

function toneClass(tone) {
  return `tone-${tone}`
}

function mergeTabCandidates(...groups) {
  const byUrl = new Map()

  groups.flat().forEach((entry) => {
    if (!entry || typeof entry.url !== 'string' || !entry.url) return
    if (!byUrl.has(entry.url)) byUrl.set(entry.url, entry)
  })

  return [...byUrl.values()]
}

function linkedAnalogIds() {
  const ids = new Set()
  state.bridgeLinks.forEach((entry) => ids.add(entry.analogId))
  state.digitalEntries.forEach((entry) => entry.sourceAnalogIds.forEach((sourceId) => ids.add(sourceId)))
  return ids
}

function latestAnalog() {
  return [...state.analogEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function latestDigital() {
  return [...state.digitalEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function latestLinks() {
  return [...state.bridgeLinks].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function pendingAnalog() {
  const linked = linkedAnalogIds()
  return state.analogEntries.filter((entry) => !entry.reviewed || !linked.has(entry.id))
}

function metrics() {
  const ritualDone = RITUALS.filter((item) => state.ritual[item.id]).length
  const linked = linkedAnalogIds()
  const coverage = state.analogEntries.length ? Math.round((linked.size / state.analogEntries.length) * 100) : 0
  return {
    pending: pendingAnalog().length,
    digital: state.digitalEntries.length,
    coverage,
    hybridScore: Math.round(coverage * 0.6 + (ritualDone / RITUALS.length) * 40),
    ritualDone,
  }
}

function loadWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    state.analogEntries = Array.isArray(parsed.analogEntries) ? parsed.analogEntries : []
    state.digitalEntries = Array.isArray(parsed.digitalEntries) ? parsed.digitalEntries : []
    state.bridgeLinks = Array.isArray(parsed.bridgeLinks) ? parsed.bridgeLinks : []
    state.ritual = parsed.ritual?.dateKey === todayKey() ? { ...defaultRitual(), ...parsed.ritual } : defaultRitual()
  } catch {
    state.ritual = defaultRitual()
  }
}

function persistWorkspace() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      analogEntries: state.analogEntries,
      digitalEntries: state.digitalEntries,
      bridgeLinks: state.bridgeLinks,
      ritual: state.ritual,
    }),
  )
}

function flash(message) {
  state.toast = message
  if (state.toastTimer) clearTimeout(state.toastTimer)
  state.toastTimer = setTimeout(() => {
    state.toast = ''
    render()
  }, 2200)
  render()
}

function brandMarkup() {
  return `
    <div class="brand-card">
      <img src="./assets/icon.svg" alt="Hybrid Notes icon" class="brand-icon" />
      <div>
        <strong>Hybrid Notes</strong>
        <span>Desktop atelier for paper + digital thinking</span>
      </div>
    </div>
  `
}

function sidebarMarkup() {
  const items = [
    ['overview', 'Overview'],
    ['capture', 'Capture'],
    ['bridge', 'Bridge'],
    ['settings', 'Settings'],
  ]

  return `
    <aside class="sidebar">
      ${brandMarkup()}
      <nav class="nav-stack">
        ${items.map(([id, label]) => `
          <button class="nav-pill ${state.activeView === id ? 'nav-pill-active' : ''}" data-action="set-view" data-view="${id}">
            ${label}
          </button>
        `).join('')}
      </nav>
      <section class="sidebar-panel">
        <span class="eyebrow">Focus prompts</span>
        <div class="prompt-stack">
          ${PROMPTS.map((prompt) => `<div class="prompt-chip">${prompt}</div>`).join('')}
        </div>
      </section>
    </aside>
  `
}

function renderOverview() {
  const { pending, digital, coverage, hybridScore, ritualDone } = metrics()
  const paper = pendingAnalog().slice(0, 4)
  const digitalNotes = latestDigital().slice(0, 4)
  const links = latestLinks().slice(0, 4)
  const analogMap = Object.fromEntries(state.analogEntries.map((entry) => [entry.id, entry]))
  const digitalMap = Object.fromEntries(state.digitalEntries.map((entry) => [entry.id, entry]))

  return `
    <section class="hero-surface">
      <div class="hero-copy">
        <span class="eyebrow">Desktop workflow</span>
        <h1>紙に書く速さと、デジタルで育てる整理力を同じ画面へ。</h1>
        <p>Hybrid Notes Desktop は、紙ノートのページ、Edge で見ていた調べ物、そして再利用したいデジタルノートをひとつのアトリエにまとめます。</p>
        <div class="hero-actions">
          <button class="primary-button" data-action="set-view" data-view="capture">Capture now</button>
          <button class="secondary-button" data-action="set-view" data-view="bridge">Open bridge board</button>
        </div>
      </div>
      <div class="pulse-card">
        <span class="eyebrow">Today&apos;s pulse</span>
        <div class="metric-grid">
          <div class="metric-card"><span>Paper Inbox</span><strong>${pending}</strong></div>
          <div class="metric-card"><span>Digital Notes</span><strong>${digital}</strong></div>
          <div class="metric-card"><span>Coverage</span><strong>${coverage}%</strong></div>
          <div class="metric-card"><span>Hybrid Score</span><strong>${hybridScore}</strong></div>
        </div>
        <div class="focus-card">
          <strong>${pending > 0 ? `${pending}件の紙ノートが未接続です。` : '紙ノートの未処理キューはありません。'}</strong>
          <p>Ritual ${ritualDone}/${RITUALS.length} completed today.</p>
        </div>
      </div>
    </section>

    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Paper Inbox</span>
            <h2>今つなぐべきアナログメモ</h2>
          </div>
          <button class="secondary-button" data-action="set-view" data-view="capture">Capture</button>
        </div>
        <div class="card-stack">
          ${paper.length === 0 ? `<div class="empty-card">未接続の紙ノートはありません。会議や読書後に Capture からページを追加できます。</div>` : ''}
          ${paper.map((entry) => `
            <article class="entry-card">
              <div class="entry-top">
                <div>
                  <div class="meta-line paper">${safeText(entry.notebook)}${entry.page ? ` • p.${safeText(entry.page)}` : ''} • ${shortDate(entry.capturedOn)}</div>
                  <h3>${safeText(entry.focus)}</h3>
                </div>
                ${entry.reviewed ? '' : '<span class="status-badge warn">needs review</span>'}
              </div>
              <p>${safeText(entry.summary)}</p>
              ${entry.nextAction ? `<div class="callout blue"><strong>Next:</strong> ${safeText(entry.nextAction)}</div>` : ''}
              <div class="action-row">
                <button class="primary-button" data-action="draft-analog" data-id="${entry.id}">Make digital draft</button>
                <button class="ghost-button" data-action="mark-reviewed" data-id="${entry.id}">Review</button>
              </div>
            </article>
          `).join('')}
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Digital Shelf</span>
            <h2>最近のデジタルノート</h2>
          </div>
        </div>
        <div class="card-stack">
          ${digitalNotes.length === 0 ? `<div class="empty-card">まだデジタルノートはありません。</div>` : ''}
          ${digitalNotes.map((entry) => `
            <article class="entry-card compact">
              <div class="entry-top">
                <div>
                  <div class="meta-line">${safeText(entry.space)} • ${stamp(entry.createdAt)}</div>
                  <h3>${safeText(entry.title)}</h3>
                </div>
                <span class="status-badge ${toneClass(TYPE_META[entry.type].tone)}">${TYPE_META[entry.type].label}</span>
              </div>
              <p class="pre-line">${notePreview(entry.body)}</p>
            </article>
          `).join('')}
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Bridge Links</span>
            <h2>思考の接続</h2>
          </div>
        </div>
        <div class="card-stack">
          ${links.length === 0 ? `<div class="empty-card">まだリンクはありません。</div>` : ''}
          ${links.map((link) => {
            const analog = analogMap[link.analogId]
            const digitalEntry = digitalMap[link.digitalId]
            if (!analog || !digitalEntry) return ''
            return `
              <article class="entry-card compact">
                <div class="entry-top">
                  <span class="status-badge ${toneClass(PURPOSE_META[link.purpose].tone)}">${PURPOSE_META[link.purpose].label}</span>
                </div>
                <div class="link-card-line"><strong>Paper:</strong> ${safeText(analog.notebook)}${analog.page ? ` p.${safeText(analog.page)}` : ''} • ${safeText(analog.focus)}</div>
                <div class="link-card-line"><strong>Digital:</strong> ${safeText(digitalEntry.space)} • ${safeText(digitalEntry.title)}</div>
              </article>
            `
          }).join('')}
        </div>
      </article>
    </section>
  `
}

function renderCapture() {
  const draft = state.digitalDraft
  return `
    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Edge Import</span>
            <h2>Microsoft Edge のタブをタイトル付きで保存</h2>
          </div>
          <button class="secondary-button" data-action="load-edge-tabs" ${state.edgeLoading ? 'disabled' : ''}>${state.edgeLoading ? 'Loading...' : 'Fetch Edge tabs'}</button>
        </div>
        <p class="section-copy">Edge 拡張機能のライブ前面タブ feed を優先し、必要に応じてローカル session snapshot も補完して読み込みます。</p>
        ${state.edgeSourceLabel ? `<div class="helper-line">Source: ${safeText(state.edgeSourceLabel)}</div>` : '<div class="helper-line">Desktop app local helper only.</div>'}
        <div class="edge-list">
          ${state.edgeTabs.length === 0 ? '<div class="empty-card">まだ Edge タブ候補はありません。</div>' : ''}
          ${state.edgeTabs.map((entry) => `
            <label class="edge-item">
              <input type="checkbox" data-action="toggle-edge" data-id="${entry.id}" ${state.edgeSelectedIds.includes(entry.id) ? 'checked' : ''} />
              <div>
                <strong>${safeText(entry.title)}</strong>
                <span>${safeText(entry.url)}</span>
              </div>
              <em>${safeText(entry.sourceKind)}</em>
            </label>
          `).join('')}
        </div>
        <div class="action-row">
          <div class="helper-line">${state.edgeSelectedIds.length} selected</div>
          <button class="primary-button" data-action="import-edge-tabs" ${state.edgeSelectedIds.length === 0 ? 'disabled' : ''}>Save selected tabs</button>
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Analog Capture</span>
            <h2>紙ノートを取り込む</h2>
          </div>
        </div>
        <form class="form-stack" id="analog-form">
          <div class="chip-row">
            ${NOTEBOOKS.map((item) => `
              <label class="radio-chip">
                <input type="radio" name="notebook" value="${item}" ${item === NOTEBOOKS[0] ? 'checked' : ''} />
                <span>${item}</span>
              </label>
            `).join('')}
          </div>
          <div class="grid-two">
            <input class="field" name="page" placeholder="Page" />
            <input class="field" type="date" name="capturedOn" value="${todayKey()}" />
          </div>
          <input class="field" name="focus" placeholder="Focus" />
          <textarea class="field area" name="summary" placeholder="Summary"></textarea>
          <textarea class="field area small" name="nextAction" placeholder="Next action"></textarea>
          <input class="field" name="tags" placeholder="meeting, article, design" />
          <button class="primary-button" type="submit">Add analog note</button>
        </form>
      </article>

      <article class="panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Digital Distill</span>
            <h2>デジタルノートへ昇格</h2>
          </div>
        </div>
        <form class="form-stack" id="digital-form">
          <div class="grid-two">
            <input class="field" name="title" placeholder="Title" value="${draft ? safeText(draft.title) : ''}" />
            <select class="field" name="space">
              ${SPACES.map((item) => `<option value="${item}" ${draft?.space === item ? 'selected' : ''}>${item}</option>`).join('')}
            </select>
          </div>
          <div class="chip-row">
            ${Object.entries(TYPE_META).map(([key, meta]) => `
              <label class="radio-chip">
                <input type="radio" name="type" value="${key}" ${(draft?.type || 'reference') === key ? 'checked' : ''} />
                <span>${meta.label}</span>
              </label>
            `).join('')}
          </div>
          <textarea class="field area tall" name="body" placeholder="Body">${draft ? safeText(draft.body) : ''}</textarea>
          <input class="field" name="tags" placeholder="reference, next-step" value="${draft ? safeText(draft.tags) : ''}" />
          <div class="helper-line">${draft ? 'Draft loaded from paper note.' : '紙ノートから草案を作るとここに入ります。'}</div>
          <button class="primary-button" type="submit">Save digital note</button>
        </form>
      </article>
    </section>
  `
}

function renderBridge() {
  const analogEntries = latestAnalog()
  const digitalEntries = latestDigital()
  const links = latestLinks()
  const analogMap = Object.fromEntries(state.analogEntries.map((entry) => [entry.id, entry]))
  const digitalMap = Object.fromEntries(state.digitalEntries.map((entry) => [entry.id, entry]))

  return `
    <section class="content-grid">
      <article class="panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Ritual</span>
            <h2>今日の接続ルーティン</h2>
          </div>
        </div>
        <div class="ritual-stack">
          ${RITUALS.map((item) => `
            <button class="ritual-card ${state.ritual[item.id] ? 'ritual-card-active' : ''}" data-action="toggle-ritual" data-id="${item.id}">
              <div class="ritual-top">
                <strong>${item.label}</strong>
                <span>${state.ritual[item.id] ? '✓' : '•'}</span>
              </div>
              <p>${item.detail}</p>
            </button>
          `).join('')}
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Link Builder</span>
            <h2>紙とデジタルを結ぶ</h2>
          </div>
        </div>
        <form class="form-stack" id="link-form">
          <select class="field" name="analogId">
            <option value="">紙ノートを選ぶ</option>
            ${analogEntries.map((entry) => `<option value="${entry.id}">${safeText(entry.notebook)}${entry.page ? ` p.${safeText(entry.page)}` : ''} • ${safeText(entry.focus)}</option>`).join('')}
          </select>
          <select class="field" name="digitalId">
            <option value="">デジタルノートを選ぶ</option>
            ${digitalEntries.map((entry) => `<option value="${entry.id}">${safeText(entry.space)} • ${safeText(entry.title)}</option>`).join('')}
          </select>
          <div class="chip-row">
            ${Object.entries(PURPOSE_META).map(([key, meta], index) => `
              <label class="radio-chip">
                <input type="radio" name="purpose" value="${key}" ${index === 0 ? 'checked' : ''} />
                <span>${meta.label}</span>
              </label>
            `).join('')}
          </div>
          <textarea class="field area small" name="note" placeholder="この接続を残す意図"></textarea>
          <button class="primary-button" type="submit">Create bridge link</button>
        </form>
      </article>

      <article class="panel wide">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Connections</span>
            <h2>作成したリンクと未接続メモ</h2>
          </div>
        </div>
        <div class="split-columns">
          <div class="card-stack">
            <h3 class="subheading">Links</h3>
            ${links.length === 0 ? '<div class="empty-card">まだリンクはありません。</div>' : ''}
            ${links.map((link) => {
              const analog = analogMap[link.analogId]
              const digitalEntry = digitalMap[link.digitalId]
              if (!analog || !digitalEntry) return ''
              return `
                <article class="entry-card compact">
                  <div class="entry-top">
                    <span class="status-badge ${toneClass(PURPOSE_META[link.purpose].tone)}">${PURPOSE_META[link.purpose].label}</span>
                    <button class="ghost-button" data-action="delete-link" data-id="${link.id}">Remove</button>
                  </div>
                  <div class="callout paper"><strong>Paper:</strong> ${safeText(analog.notebook)}${analog.page ? ` p.${safeText(analog.page)}` : ''} • ${safeText(analog.focus)}</div>
                  <div class="callout blue"><strong>Digital:</strong> ${safeText(digitalEntry.space)} • ${safeText(digitalEntry.title)}</div>
                  ${link.note ? `<p>${safeText(link.note)}</p>` : ''}
                </article>
              `
            }).join('')}
          </div>

          <div class="card-stack">
            <h3 class="subheading">Unlinked paper notes</h3>
            ${pendingAnalog().length === 0 ? '<div class="empty-card">すべての紙ノートが接続済みです。</div>' : ''}
            ${pendingAnalog().map((entry) => `
              <article class="entry-card compact">
                <div class="meta-line paper">${safeText(entry.notebook)}${entry.page ? ` • p.${safeText(entry.page)}` : ''} • ${shortDate(entry.capturedOn)}</div>
                <h3>${safeText(entry.focus)}</h3>
                <p>${safeText(entry.summary)}</p>
                <div class="action-row">
                  <button class="primary-button" data-action="draft-analog" data-id="${entry.id}">Draft</button>
                  <button class="ghost-button" data-action="mark-reviewed" data-id="${entry.id}">Review</button>
                  <button class="ghost-button" data-action="delete-analog" data-id="${entry.id}">Delete</button>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      </article>
    </section>
  `
}

function renderSettings() {
  return `
    <section class="content-grid">
      <article class="panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Backups</span>
            <h2>ワークスペースを保存・復元</h2>
          </div>
        </div>
        <p class="section-copy">JSON でエクスポートしておけば、あとから別マシンへ持っていけます。</p>
        <div class="button-stack">
          <button class="primary-button" data-action="export-workspace">Export JSON backup</button>
          <button class="secondary-button" data-action="trigger-import">Import JSON backup</button>
          <input type="file" id="workspace-import" accept="application/json" hidden />
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Desktop Notes</span>
            <h2>アプリについて</h2>
          </div>
        </div>
        <div class="card-stack">
          <div class="info-card"><strong>Storage:</strong> this device only</div>
          <div class="info-card"><strong>Edge helper:</strong> http://127.0.0.1:4317</div>
          <div class="info-card"><strong>Layout:</strong> Electron-first modern desktop UI</div>
        </div>
      </article>

      <article class="panel wide">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Workspace Reset</span>
            <h2>データを初期化する</h2>
          </div>
        </div>
        <p class="section-copy">この操作はローカルのワークスペースを空にします。Edge のブラウザ本体には影響しません。</p>
        <button class="danger-button" data-action="reset-workspace">Reset local workspace</button>
      </article>
    </section>
  `
}

function renderMain() {
  if (state.activeView === 'capture') return renderCapture()
  if (state.activeView === 'bridge') return renderBridge()
  if (state.activeView === 'settings') return renderSettings()
  return renderOverview()
}

function render() {
  app.innerHTML = `
    <div class="desktop-shell">
      ${sidebarMarkup()}
      <main class="main-stage">
        <header class="topbar">
          <div>
            <span class="eyebrow">Local desktop app</span>
            <h2 class="topbar-title">${state.activeView[0].toUpperCase()}${state.activeView.slice(1)}</h2>
          </div>
          <div class="topbar-actions">
            <button class="secondary-button" data-action="set-view" data-view="capture">Quick capture</button>
            <button class="primary-button" data-action="set-view" data-view="settings">Backups</button>
          </div>
        </header>
        ${renderMain()}
      </main>
      ${state.toast ? `<div class="toast">${safeText(state.toast)}</div>` : ''}
    </div>
  `
}

function setView(view) {
  state.activeView = view
  syncEdgePolling()
  render()
}

function buildDigitalDraft(entry) {
  return {
    title: entry.focus,
    space: entry.nextAction ? 'Action Board' : 'Knowledge Base',
    type: entry.nextAction ? 'action' : 'reference',
    body: [`Source: ${entry.notebook}${entry.page ? ` p.${entry.page}` : ''}`, `Captured: ${entry.capturedOn}`, '', 'Summary', entry.summary, ...(entry.nextAction ? ['', 'Next Move', entry.nextAction] : [])].join('\n'),
    tags: entry.tags.join(', '),
  }
}

function saveAnalog(form) {
  const notebook = form.get('notebook') || NOTEBOOKS[0]
  const focus = String(form.get('focus') || '').trim()
  const summary = String(form.get('summary') || '').trim()
  if (!focus || !summary) return flash('紙ノートの焦点と要約を入れてください。')

  state.analogEntries.unshift({
    id: uid('analog'),
    notebook,
    page: String(form.get('page') || '').trim(),
    capturedOn: String(form.get('capturedOn') || todayKey()),
    focus,
    summary,
    nextAction: String(form.get('nextAction') || '').trim(),
    tags: splitTags(String(form.get('tags') || '')),
    reviewed: false,
    createdAt: new Date().toISOString(),
  })

  state.ritual.capture = true
  persistWorkspace()
  flash('アナログノートを追加しました。')
}

function saveDigital(form) {
  const title = String(form.get('title') || '').trim()
  const body = String(form.get('body') || '').trim()
  if (!title || !body) return flash('デジタルノートはタイトルと本文が必要です。')

  const type = String(form.get('type') || 'reference')
  state.digitalEntries.unshift({
    id: uid('digital'),
    title,
    space: String(form.get('space') || SPACES[0]),
    type,
    body,
    tags: splitTags(String(form.get('tags') || '')),
    sourceAnalogIds: [],
    createdAt: new Date().toISOString(),
  })

  state.digitalDraft = null
  state.ritual.distill = true
  if (type === 'action') state.ritual.action = true
  persistWorkspace()
  flash('デジタルノートを保存しました。')
}

function saveLink(form) {
  const analogId = String(form.get('analogId') || '')
  const digitalId = String(form.get('digitalId') || '')
  const purpose = String(form.get('purpose') || 'reference')
  const note = String(form.get('note') || '').trim()

  if (!analogId || !digitalId) return flash('紙ノートとデジタルノートを選んでください。')
  if (state.bridgeLinks.some((item) => item.analogId === analogId && item.digitalId === digitalId && item.purpose === purpose)) {
    return flash('同じリンクはすでにあります。')
  }

  state.bridgeLinks.unshift({
    id: uid('link'),
    analogId,
    digitalId,
    purpose,
    note,
    createdAt: new Date().toISOString(),
  })
  state.analogEntries = state.analogEntries.map((entry) => entry.id === analogId ? { ...entry, reviewed: true } : entry)
  state.ritual.distill = true
  state.ritual.revisit = true
  persistWorkspace()
  flash('紙とデジタルをリンクしました。')
}

async function loadEdgeTabs({ silent = false } = {}) {
  state.edgeLoading = true
  render()

  try {
    const hosts = ['http://127.0.0.1:4317', 'http://localhost:4317']
    let livePayload = null
    let sessionPayload = null
    let lastError = 'Edge data could not be loaded.'

    for (const host of hosts) {
      try {
        const response = await fetch(`${host}/api/edge-extension-tabs`, { cache: 'no-store' })
        const next = await response.json()
        if (response.ok && !next.error) {
          livePayload = next
          break
        }
        lastError = next.error || lastError
      } catch {
        // try next host
      }
    }

    for (const host of hosts) {
      try {
        const response = await fetch(`${host}/api/edge-tabs`, { cache: 'no-store' })
        const next = await response.json()
        if (response.ok && !next.error) {
          sessionPayload = next
          break
        }
        lastError = next.error || lastError
      } catch {
        // try next host
      }
    }

    const liveTabs = Array.isArray(livePayload?.tabs) ? livePayload.tabs : []
    const sessionTabs = Array.isArray(sessionPayload?.tabs) ? sessionPayload.tabs : []
    const mergedTabs = mergeTabCandidates(liveTabs, sessionTabs)

    if (mergedTabs.length === 0 && !livePayload && !sessionPayload) {
      throw new Error(lastError)
    }

    state.edgeTabs = mergedTabs
    state.edgeSelectedIds = []
    state.edgeSourceLabel = [
      livePayload?.source ? `Live: ${livePayload.source.profile} • ${stamp(livePayload.source.updatedAt)}` : '',
      sessionPayload?.source ? `Snapshot: ${sessionPayload.source.profile} • ${sessionPayload.source.kind} • ${stamp(sessionPayload.source.updatedAt)}` : '',
    ].filter(Boolean).join(' / ')
    if (!silent) {
      flash(state.edgeTabs.length > 0 ? `${state.edgeTabs.length}件の Edge タブ候補を取得しました。` : 'Edge タブ候補が見つかりませんでした。')
    } else {
      render()
    }
  } catch (error) {
    if (!silent) {
      flash(error instanceof Error ? error.message : 'Edge import failed.')
    }
  } finally {
    state.edgeLoading = false
    render()
  }
}

function syncEdgePolling() {
  if (edgePollTimer) {
    clearInterval(edgePollTimer)
    edgePollTimer = null
  }

  if (state.activeView !== 'capture') return

  void loadEdgeTabs({ silent: true })
  edgePollTimer = setInterval(() => {
    if (!state.edgeLoading) void loadEdgeTabs({ silent: true })
  }, 5000)
}

window.addEventListener('beforeunload', () => {
  if (edgePollTimer) clearInterval(edgePollTimer)
})

function importEdgeTabs() {
  const selected = state.edgeTabs.filter((entry) => state.edgeSelectedIds.includes(entry.id))
  if (selected.length === 0) return flash('保存したい Edge タブを選んでください。')

  const importedAt = new Date()
  const entries = selected.map((entry, index) => {
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
      body: [`Source: Microsoft Edge (${entry.profile})`, `Imported: ${importedAt.toLocaleString('ja-JP')}`, `URL: ${entry.url}`].join('\n'),
      tags: ['edge-import', hostTag],
      sourceAnalogIds: [],
      createdAt: new Date(importedAt.getTime() + index).toISOString(),
    }
  })

  state.digitalEntries = [...entries, ...state.digitalEntries]
  state.ritual.distill = true
  persistWorkspace()
  flash(`${entries.length}件の Edge タブを保存しました。`)
}

function exportWorkspace() {
  const payload = JSON.stringify({
    exportedAt: new Date().toISOString(),
    workspace: {
      analogEntries: state.analogEntries,
      digitalEntries: state.digitalEntries,
      bridgeLinks: state.bridgeLinks,
      ritual: state.ritual,
    },
  }, null, 2)

  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `hybrid-notes-backup-${todayKey()}.json`
  anchor.click()
  URL.revokeObjectURL(url)
  flash('JSON バックアップを出力しました。')
}

function importWorkspace(file) {
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || '{}'))
      const workspace = parsed.workspace || parsed
      state.analogEntries = Array.isArray(workspace.analogEntries) ? workspace.analogEntries : []
      state.digitalEntries = Array.isArray(workspace.digitalEntries) ? workspace.digitalEntries : []
      state.bridgeLinks = Array.isArray(workspace.bridgeLinks) ? workspace.bridgeLinks : []
      state.ritual = workspace.ritual?.dateKey ? { ...defaultRitual(), ...workspace.ritual } : defaultRitual()
      persistWorkspace()
      render()
      flash('バックアップを読み込みました。')
    } catch {
      flash('JSON バックアップを読み込めませんでした。')
    }
  }
  reader.readAsText(file)
}

function resetWorkspace() {
  if (!window.confirm('ローカルワークスペースを初期化しますか？')) return
  state.analogEntries = []
  state.digitalEntries = []
  state.bridgeLinks = []
  state.ritual = defaultRitual()
  state.edgeTabs = []
  state.edgeSelectedIds = []
  state.digitalDraft = null
  persistWorkspace()
  render()
  flash('ワークスペースを初期化しました。')
}

app.addEventListener('click', (event) => {
  const eventTarget = event.target
  if (!(eventTarget instanceof Element)) return

  const trigger = eventTarget.closest('[data-action]')
  if (!trigger) return

  const { action, id, view } = trigger.dataset

  if (action === 'set-view' && view) return setView(view)
  if (action === 'load-edge-tabs') return void loadEdgeTabs()
  if (action === 'import-edge-tabs') return importEdgeTabs()
  if (action === 'mark-reviewed' && id) {
    state.analogEntries = state.analogEntries.map((entry) => entry.id === id ? { ...entry, reviewed: true } : entry)
    state.ritual.revisit = true
    persistWorkspace()
    render()
    return flash('レビュー済みにしました。')
  }
  if (action === 'draft-analog' && id) {
    const entry = state.analogEntries.find((item) => item.id === id)
    if (!entry) return
    state.digitalDraft = buildDigitalDraft(entry)
    state.activeView = 'capture'
    return render()
  }
  if (action === 'delete-analog' && id) {
    state.analogEntries = state.analogEntries.filter((entry) => entry.id !== id)
    state.bridgeLinks = state.bridgeLinks.filter((entry) => entry.analogId !== id)
    state.digitalEntries = state.digitalEntries.map((entry) => ({ ...entry, sourceAnalogIds: entry.sourceAnalogIds.filter((sourceId) => sourceId !== id) }))
    persistWorkspace()
    render()
    return flash('紙ノートを削除しました。')
  }
  if (action === 'delete-link' && id) {
    state.bridgeLinks = state.bridgeLinks.filter((entry) => entry.id !== id)
    persistWorkspace()
    render()
    return flash('リンクを解除しました。')
  }
  if (action === 'toggle-ritual' && id) {
    state.ritual[id] = !state.ritual[id]
    persistWorkspace()
    return render()
  }
  if (action === 'export-workspace') return exportWorkspace()
  if (action === 'trigger-import') return document.querySelector('#workspace-import')?.click()
  if (action === 'reset-workspace') return resetWorkspace()
})

app.addEventListener('change', (event) => {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return

  if (target.dataset.action === 'toggle-edge') {
    if (target.checked) {
      state.edgeSelectedIds.push(target.dataset.id)
    } else {
      state.edgeSelectedIds = state.edgeSelectedIds.filter((item) => item !== target.dataset.id)
    }
    return render()
  }

  if (target.id === 'workspace-import' && target.files?.[0]) {
    importWorkspace(target.files[0])
    target.value = ''
  }
})

app.addEventListener('submit', (event) => {
  event.preventDefault()
  const form = event.target
  if (!(form instanceof HTMLFormElement)) return
  const data = new FormData(form)

  if (form.id === 'analog-form') {
    saveAnalog(data)
    form.reset()
    render()
    return
  }

  if (form.id === 'digital-form') {
    saveDigital(data)
    form.reset()
    render()
    return
  }

  if (form.id === 'link-form') {
    saveLink(data)
    form.reset()
    render()
  }
})

loadWorkspace()
syncEdgePolling()
render()
