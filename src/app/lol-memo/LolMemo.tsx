'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import './lol-memo.css'

/* ── Constants ── */
const MERAKI_URL = '/api/lol-champions'
const HN = 16
const SK = 'lol_notes_v3'
const CK = 'lol_cats_v3'
const COLS = [
    { c: '#C89B3C', r: '200,155,60' }, { c: '#0BC4E3', r: '11,196,227' },
    { c: '#C3303A', r: '195,48,58' }, { c: '#5B8DB8', r: '91,141,184' },
    { c: '#7B68A8', r: '123,104,168' }, { c: '#4CAF7D', r: '76,175,125' },
    { c: '#E07B39', r: '224,123,57' },
]
const SLOT_KEYS = ['Q', 'W', 'E', 'R'] as const
const SLOT_CLS = ['keyQ', 'keyW', 'keyE', 'keyR'] as const
const TC: Record<string, string> = {
    assassin: '#C3303A', fighter: '#E07B39', mage: '#5B8DB8',
    marksman: '#C89B3C', support: '#4CAF7D', tank: '#7B68A8',
}
const PC: Record<string, { c: string; r: string }> = {
    high: { c: '#C3303A', r: '195,48,58' },
    med: { c: '#C89B3C', r: '200,155,60' },
    low: { c: '#5B8DB8', r: '91,141,184' },
}
const DEFAULT_CATS = [
    { id: 'c1', name: 'チャンプ研究', ci: 0 }, { id: 'c2', name: 'ビルド・ルーン', ci: 1 },
    { id: 'c3', name: 'マッチアップ', ci: 2 }, { id: 'c4', name: 'マクロ・戦略', ci: 3 },
    { id: 'c5', name: 'その他メモ', ci: 4 },
]
const ROLES_SIDEBAR = [
    { role: 'all', name: 'すべて', color: 'var(--gold)' },
    { role: 'Assassin', name: 'アサシン', color: '#C3303A' },
    { role: 'Fighter', name: 'ファイター', color: '#E07B39' },
    { role: 'Mage', name: 'メイジ', color: '#5B8DB8' },
    { role: 'Marksman', name: 'マークスマン', color: '#C89B3C' },
    { role: 'Support', name: 'サポート', color: '#4CAF7D' },
    { role: 'Tank', name: 'タンク', color: '#7B68A8' },
]

/* ── Types ── */
interface Message { id: string; text: string; ts: number }
interface Note { id: string; title: string; messages: Message[]; cid: string; pri: string; ts: number }
interface Cat { id: string; name: string; ci: number }
interface ChampStats { ad: number; as: number; hp: number; armor: number; mr: number; range: number; ms: number; attackType: string }
interface Champ {
    id: string; name: string; title: string; tags: string[]; roles: string[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abilities: any; icon: string; stats: ChampStats
}

export default function LolMemo() {
    /* ── Memo state ── */
    const [notes, setNotes] = useState<Note[]>([])
    const [cats, setCats] = useState<Cat[]>([])
    const [activeCat, setActiveCat] = useState('all')
    const [tab, setTab] = useState<'memo' | 'cd'>('memo')
    const [memoSearch, setMemoSearch] = useState('')
    const [sortMode, setSortMode] = useState('newest')
    const [showAddCat, setShowAddCat] = useState(false)
    const [newCatName, setNewCatName] = useState('')
    const [chatOpen, setChatOpen] = useState(false)
    const [chatNoteId, setChatNoteId] = useState<string | null>(null)
    const [chatInput, setChatInput] = useState('')
    const [mTitle, setMTitle] = useState('')
    const [mCatId, setMCatId] = useState('')
    const [selPri, setSelPri] = useState('med')
    const [toastMsg, setToastMsg] = useState('')
    const [toastVisible, setToastVisible] = useState(false)
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const chatInputRef = useRef<HTMLInputElement>(null)

    /* ── CD state ── */
    const [cdLoaded, setCdLoaded] = useState(false)
    const [allChamps, setAllChamps] = useState<Champ[]>([])
    const [curRole, setCurRole] = useState('all')
    const [curChamp, setCurChamp] = useState<Champ | null>(null)
    const [cdSearch, setCdSearch] = useState('')
    const [cdVer, setCdVer] = useState('—')
    const [cdState, setCdState] = useState<'loading' | 'error' | 'done'>('loading')
    const [progPct, setProgPct] = useState(0)
    const [loadSub, setLoadSub] = useState('Meraki CDN に接続中...')
    const [errTitle, setErrTitle] = useState('')
    const [errDetail, setErrDetail] = useState('')
    const [ddVer, setDdVer] = useState('')
    const [headerTime, setHeaderTime] = useState('')

    /* ── Init (with migration from old body format) ── */
    useEffect(() => {
        const savedNotes = localStorage.getItem(SK)
        const savedCats = localStorage.getItem(CK)
        if (savedNotes) {
            const parsed = JSON.parse(savedNotes)
            // Migrate old notes: body string → messages array
            const migrated = parsed.map((n: any) => {
                if (n.body !== undefined && !n.messages) {
                    const msgs: Message[] = n.body ? [{ id: 'm' + n.ts, text: n.body, ts: n.ts }] : []
                    const { body: _, ...rest } = n
                    return { ...rest, messages: msgs }
                }
                return n
            })
            setNotes(migrated)
            // Save migrated data back
            if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
                localStorage.setItem(SK, JSON.stringify(migrated))
            }
        }
        const c = savedCats ? JSON.parse(savedCats) : null
        if (c && c.length > 0) setCats(c)
        else { setCats(DEFAULT_CATS); localStorage.setItem(CK, JSON.stringify(DEFAULT_CATS)) }
    }, [])

    useEffect(() => {
        const update = () => setHeaderTime(new Date().toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }))
        update(); const iv = setInterval(update, 60000); return () => clearInterval(iv)
    }, [])

    /* ── Persistence ── */
    const saveNotes = useCallback((n: Note[]) => { setNotes(n); localStorage.setItem(SK, JSON.stringify(n)) }, [])
    const saveCats = useCallback((c: Cat[]) => { setCats(c); localStorage.setItem(CK, JSON.stringify(c)) }, [])

    /* ── Toast ── */
    const toast = useCallback((msg: string) => {
        setToastMsg(msg); setToastVisible(true)
        if (toastTimer.current) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToastVisible(false), 2200)
    }, [])

    /* ── Memo operations ── */
    const addCat = () => {
        if (!newCatName.trim()) return
        const newCats = [...cats, { id: 'c' + Date.now(), name: newCatName.trim(), ci: cats.length % COLS.length }]
        saveCats(newCats); setNewCatName(''); setShowAddCat(false); toast('カテゴリを追加しました')
    }
    const deleteCat = (id: string) => {
        const newCats = cats.filter(c => c.id !== id)
        const newNotes = notes.filter(n => n.cid !== id)
        if (activeCat === id) setActiveCat('all')
        saveCats(newCats); saveNotes(newNotes); toast('カテゴリを削除しました')
    }
    const openChat = (id: string | null = null) => {
        setChatNoteId(id)
        setChatInput('')
        if (id) {
            const n = notes.find(x => x.id === id)!
            setMTitle(n.title); setMCatId(n.cid || cats[0]?.id || '')
            setSelPri(n.pri || 'med')
        } else {
            // Create a new note immediately
            const newId = Date.now().toString()
            const catId = activeCat !== 'all' ? activeCat : cats[0]?.id || ''
            const newNote: Note = { id: newId, title: '無題', messages: [], cid: catId, pri: 'med', ts: Date.now() }
            const newNotes = [newNote, ...notes]
            saveNotes(newNotes)
            setChatNoteId(newId)
            setMTitle('無題'); setMCatId(catId); setSelPri('med')
        }
        setChatOpen(true)
        setTimeout(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); chatInputRef.current?.focus() }, 100)
    }
    const sendMessage = () => {
        const text = chatInput.trim()
        if (!text || !chatNoteId) return
        const msg: Message = { id: 'm' + Date.now() + Math.random(), text, ts: Date.now() }
        const newNotes = notes.map(n => n.id === chatNoteId ? { ...n, messages: [...n.messages, msg], ts: Date.now() } : n)
        saveNotes(newNotes); setChatInput('')
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    const updateChatMeta = () => {
        if (!chatNoteId) return
        const t = mTitle.trim()
        const newNotes = notes.map(n => n.id === chatNoteId ? { ...n, title: t || '無題', cid: mCatId, pri: selPri } : n)
        saveNotes(newNotes)
    }
    const deleteNote = (id: string) => { saveNotes(notes.filter(n => n.id !== id)); toast('メモを削除しました') }
    const deleteMessage = (noteId: string, msgId: string) => {
        const newNotes = notes.map(n => n.id === noteId ? { ...n, messages: n.messages.filter(m => m.id !== msgId) } : n)
        saveNotes(newNotes)
    }

    /* ── Filtered & sorted notes ── */
    const filteredNotes = (() => {
        const q = memoSearch.toLowerCase()
        let fl = notes.filter(n => {
            const matchCat = activeCat === 'all' || n.cid === activeCat
            const allText = [n.title, ...n.messages.map(m => m.text)].join(' ').toLowerCase()
            return matchCat && (!q || allText.includes(q))
        })
        if (sortMode === 'newest') fl.sort((a, b) => b.ts - a.ts)
        else if (sortMode === 'oldest') fl.sort((a, b) => a.ts - b.ts)
        else fl.sort((a, b) => a.title.localeCompare(b.title, 'ja'))
        return fl
    })()
    const chatNote = chatNoteId ? notes.find(n => n.id === chatNoteId) : null

    /* ── CD Browser ── */
    const matchRole = (c: Champ, role: string) => c.roles.some(r => r.toLowerCase() === role.toLowerCase())

    const champImg = (c: Champ) => {
        if (c.icon && c.icon.startsWith('http')) return c.icon
        if (ddVer) return `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/champion/${c.id}.png`
        return ''
    }

    const loadChamps = useCallback(async () => {
        setCdState('loading'); setProgPct(5); setLoadSub('Meraki CDN から全チャンピオンデータを取得中...')
        try {
            const res = await fetch(MERAKI_URL)
            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
            setProgPct(60); setLoadSub('JSONをパース中...')
            const data = await res.json()
            setProgPct(80); setLoadSub('データを整形中...')

            const champs: Champ[] = Object.values(data).map((c: any) => ({
                id: c.key || c.name,
                name: c.name,
                title: c.title,
                tags: (c.roles || []).map((r: string) => r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()),
                roles: c.roles || [],
                abilities: c.abilities || {},
                icon: c.icon || '',
                stats: {
                    ad: c.stats?.attackDamage?.flat || 0,
                    as: c.stats?.attackSpeed?.flat || 0,
                    hp: c.stats?.health?.flat || 0,
                    armor: c.stats?.armor?.flat || 0,
                    mr: c.stats?.magicResistance?.flat || 0,
                    range: c.stats?.attackRange?.flat || 0,
                    ms: c.stats?.movespeed?.flat || 0,
                    attackType: c.attackType || '',
                },
            })).sort((a: Champ, b: Champ) => a.name.localeCompare(b.name, 'ja'))

            try {
                const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
                if (vRes.ok) { const v = await vRes.json(); setDdVer(v[0]); setCdVer('PATCH ' + v[0]) }
            } catch { /* ignore */ }

            setProgPct(100); setLoadSub('完了！')
            setAllChamps(champs)
            await new Promise(r => setTimeout(r, 400))
            setCdState('done')
        } catch (err: any) {
            setErrTitle('読み込みに失敗しました')
            setErrDetail(`エラー: ${err.message}\n\nMeraki CDN (cdn.merakianalytics.com) への接続に失敗しました。\nインターネット接続を確認してから RETRY してください。`)
            setCdState('error')
        }
    }, [])

    useEffect(() => { if (tab === 'cd' && !cdLoaded) { setCdLoaded(true); loadChamps() } }, [tab, cdLoaded, loadChamps])

    const roleCounts = (role: string) => role === 'all' ? allChamps.length : allChamps.filter(c => matchRole(c, role)).length

    const filteredChamps = allChamps.filter(c => {
        const roleOk = curRole === 'all' || matchRole(c, curRole)
        const q = cdSearch.toLowerCase()
        const searchOk = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
        return roleOk && searchOk
    })

    /* ── FIX: Extract ability data correctly from Meraki API ── */
    /* Meraki stores abilities as: abilities.P = [array], abilities.Q = [array], etc. */
    const getAbility = (abilities: any, key: string) => {
        const ab = abilities[key]
        if (!ab) return null
        if (Array.isArray(ab)) return ab[0] || null
        return ab
    }

    const getAbilityCooldowns = (ability: any): number[] => {
        if (!ability) return []
        // Try direct cooldown array
        if (Array.isArray(ability.cooldown)) {
            const cds = ability.cooldown.modifiers
                ? ability.cooldown.modifiers[0]?.values || []
                : ability.cooldown
            return Array.isArray(cds) ? cds.map(Number).filter((v: number) => !isNaN(v)) : []
        }
        // Try cooldowns array
        if (Array.isArray(ability.cooldowns)) return ability.cooldowns.map(Number).filter((v: number) => !isNaN(v))
        // Try cooldown as object with modifiers
        if (ability.cooldown && typeof ability.cooldown === 'object' && ability.cooldown.modifiers) {
            return ability.cooldown.modifiers[0]?.values?.map(Number).filter((v: number) => !isNaN(v)) || []
        }
        return []
    }

    const getAbilityRange = (ability: any): string => {
        if (!ability) return '—'
        const ra = ability.range || ability.ranges
        if (!ra) return '—'
        if (Array.isArray(ra)) {
            const rArr = [...new Set(ra.map((r: any) => parseInt(r)).filter((r: number) => r > 0))]
            return rArr.length ? rArr.join('/') : '—'
        }
        if (typeof ra === 'number' && ra > 0) return String(ra)
        return '—'
    }

    const getAbilityCost = (ability: any): string => {
        if (!ability) return '—'
        const ca = ability.cost || ability.costs
        if (!ca) return '—'
        if (Array.isArray(ca)) {
            const cArr = [...new Set(ca)]
            if (cArr.length && Number(cArr[0]) > 0) {
                let result = cArr.join('/')
                if (ability.costType) result += ` ${ability.costType}`
                return result
            }
        }
        if (typeof ca === 'object' && !Array.isArray(ca) && ca.modifiers) {
            const vals = ca.modifiers[0]?.values || []
            const cArr = [...new Set(vals)]
            if (cArr.length && Number(cArr[0]) > 0) {
                let result = cArr.join('/')
                if (ability.costType) result += ` ${ability.costType}`
                return result
            }
        }
        if (typeof ca === 'number' && ca > 0) return `${ca}${ability.costType ? ' ' + ability.costType : ''}`
        return '—'
    }

    /* ── Keyboard shortcuts ── */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setChatOpen(false)
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); openChat() }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notes, cats, activeCat])



    /* ──────── RENDER ──────── */
    return (
        <div className="container">
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />

            {/* HEADER */}
            <header className="header">
                <div className="logo">
                    <div className="logoIcon">⚔</div>
                    <div>
                        <div className="logoText">Rift Notes</div>
                        <div className="logoSub">LEAGUE OF LEGENDS MEMO</div>
                    </div>
                </div>
                <div className="headerTime">{headerTime}</div>
            </header>

            {/* NAV TABS */}
            <div className="navTabs">
                <button className={`navTab ${tab === 'memo' ? 'navTabActive' : ''}`} onClick={() => setTab('memo')}>📝 メモ</button>
                <button className={`navTab ${tab === 'cd' ? 'navTabActive' : ''}`} onClick={() => setTab('cd')}>⏱ チャンプCD</button>
            </div>

            <div className="app">
                {/* FILTER CHIPS (replaces sidebar) */}
                <div className="sidebar">
                    {tab === 'memo' ? (
                        <>
                            <div className="catHeader">カテゴリ <button className="btnAddCat" onClick={() => setShowAddCat(!showAddCat)}>+</button></div>
                            {showAddCat && (
                                <div className="addCatRow addCatRowShow">
                                    <input className="addCatInput" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="カテゴリ名..." maxLength={20} onKeyDown={e => e.key === 'Enter' && addCat()} />
                                    <button className="addCatBtn" onClick={addCat}>追加</button>
                                </div>
                            )}
                            <div className="catList">
                                <div className={`catItem ${activeCat === 'all' ? 'catItemActive' : ''}`} onClick={() => setActiveCat('all')}>
                                    <span className="catName">すべて</span><span className="catCount">{notes.length}</span>
                                </div>
                                {cats.map(c => {
                                    const col = COLS[c.ci % COLS.length]
                                    return (
                                        <div key={c.id} className={`catItem ${activeCat === c.id ? 'catItemActive' : ''}`} onClick={() => setActiveCat(c.id)}>
                                            <span className="catDot" style={{ background: col.c }} /><span className="catName">{c.name}</span>
                                            <span className="catCount">{notes.filter(n => n.cid === c.id).length}</span>
                                            <button className="catDel" onClick={e => { e.stopPropagation(); deleteCat(c.id) }}>✕</button>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="catHeader">ロールフィルター</div>
                            <div className="catList">
                                {ROLES_SIDEBAR.map(r => (
                                    <div key={r.role} className={`catItem ${curRole === r.role ? 'catItemActive' : ''}`}
                                        onClick={() => { setCurRole(r.role); setCurChamp(null) }}>
                                        <span className="catDot" style={{ background: r.color }} /><span className="catName">{r.name}</span>
                                        <span className="catCount">{cdState === 'done' ? roleCounts(r.role) : '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* MEMO PANEL */}
                <div className={`panel ${tab === 'memo' ? 'panelActive' : ''}`}>
                    <div className="toolbar">
                        <div className="sw"><span className="si">🔍</span>
                            <input className="searchInput" value={memoSearch} onChange={e => setMemoSearch(e.target.value)} placeholder="メモを検索..." />
                        </div>
                        <select className="sortSel" value={sortMode} onChange={e => setSortMode(e.target.value)}>
                            <option value="newest">新しい順</option><option value="oldest">古い順</option><option value="title">タイトル順</option>
                        </select>
                        <button className="btnNew" onClick={() => openChat()}>＋ NEW</button>
                    </div>
                    <div className="notesArea">
                        <div className="notesGrid">
                            {filteredNotes.length === 0 ? (
                                <div className="empty"><div className="emptyHex">📝</div><div className="emptyTxt">メモがありません</div></div>
                            ) : filteredNotes.map(n => {
                                const cat = cats.find(c => c.id === n.cid)
                                const p = PC[n.pri || 'med']
                                const col = cat ? COLS[cat.ci % COLS.length] : { c: '#9CA3AF', r: '156,163,175' }
                                const d = new Date(n.ts).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
                                const lastMsg = n.messages[n.messages.length - 1]
                                const prev = lastMsg ? lastMsg.text.replace(/\n/g, ' ').substring(0, 80) : ''
                                return (
                                    <div key={n.id} className="noteCard"
                                        onClick={() => openChat(n.id)}>
                                        <button className="noteDel" onClick={e => { e.stopPropagation(); deleteNote(n.id) }}>✕</button>
                                        <div className="noteTitle"><span className="pdot" style={{ background: p.c }} />{n.title || '無題'}</div>
                                        <div className="notePrev">{prev || '(メッセージなし)'}</div>
                                        <div className="noteMeta">
                                            <span className="noteDate">{n.messages.length} 件 · {d}</span>
                                            {cat && <span className="noteBadge" style={{ background: `rgba(${col.r},.1)`, color: col.c }}>{cat.name}</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* CD PANEL */}
                <div className={`panel ${tab === 'cd' ? 'panelActive' : ''}`}>
                    <div className="cdToolbar">
                        <div className="cdSw"><span className="cdSi">🔍</span>
                            <input className="cdInput" value={cdSearch} onChange={e => { setCdSearch(e.target.value); setCurChamp(null) }} placeholder="チャンピオン名で検索..." />
                        </div>
                        <span className="cdVer">{cdVer}</span>
                    </div>
                    <div className="cdArea">
                        {cdState === 'loading' && (
                            <div className="cdLoadingWrap">
                                <div className="loadTitle">⚙ LOADING CHAMPIONS</div>
                                <div className="progressWrap">
                                    <div className="progressPct">{Math.round(progPct)}%</div>
                                    <div className="progressTrack"><div className="progressFill" style={{ width: `${progPct}%` }} /></div>
                                    <div className="progressHexRow">
                                        {Array.from({ length: HN }, (_, i) => (
                                            <div key={i} className={`phex ${i < Math.round(progPct / 100 * HN) ? 'phexOn' : ''}`} />
                                        ))}
                                    </div>
                                    <div className="progressCount">接続中...</div>
                                </div>
                                <div className="loadSub">{loadSub}</div>
                            </div>
                        )}
                        {cdState === 'error' && (
                            <div className="cdErrorWrap">
                                <div className="errIcon">⚠</div>
                                <div className="errTitle">{errTitle}</div>
                                <div className="errDetail">{errDetail}</div>
                                <button className="btnRetry" onClick={() => { setCdLoaded(false); setCdState('loading'); setProgPct(0); loadChamps() }}>⟳ RETRY</button>
                            </div>
                        )}
                        {cdState === 'done' && !curChamp && (
                            <div className="champGrid">
                                {filteredChamps.length === 0 ? (
                                    <div className="empty" style={{ gridColumn: '1/-1' }}><div className="emptyHex">🔍</div><div className="emptyTxt">見つかりません</div></div>
                                ) : filteredChamps.map(c => {
                                    const img = champImg(c)
                                    return (
                                        <div key={c.id} className="champCard" onClick={() => setCurChamp(c)}>
                                            {img ? <img src={img} alt={c.name} loading="lazy" onError={e => { (e.target as HTMLImageElement).style.opacity = '.15' }} />
                                                : <div style={{ width: 48, height: 48, margin: '0 auto 5px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8 }} />}
                                            <div className="champCardName">{c.name}</div>
                                            <div className="champCardTags">{c.roles.join('·')}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {cdState === 'done' && curChamp && (() => {
                            const ab = curChamp.abilities
                            const passive = getAbility(ab, 'P')
                            const cImg = champImg(curChamp)
                            return (
                                <div className="champDetail champDetailShow">
                                    <button className="detailBack" onClick={() => setCurChamp(null)}>◀ 一覧に戻る</button>
                                    <div className="detailHero">
                                        {cImg && <img src={cImg} alt={curChamp.name} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                                        <div>
                                            <div className="heroName">{curChamp.name}</div>
                                            <div className="heroTitle">{curChamp.title || ''}</div>
                                            <div className="heroTags">
                                                {curChamp.roles.map(r => (
                                                    <span key={r} className="heroTag" style={{ borderColor: `${TC[r.toLowerCase()] || '#D1D5DB'}`, color: TC[r.toLowerCase()] || '#6B7280' }}>{r}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="secTitle">LV.1 ステータス</div>
                                    <div className="statsGrid">
                                        <div className="statItem"><span className="statLabel">⚔ AD</span><span className="statVal">{curChamp.stats.ad}</span></div>
                                        <div className="statItem"><span className="statLabel">⚡ AS</span><span className="statVal">{curChamp.stats.as.toFixed(3)}</span></div>
                                        <div className="statItem"><span className="statLabel">❤ HP</span><span className="statVal">{curChamp.stats.hp}</span></div>
                                        <div className="statItem"><span className="statLabel">🛡 AR</span><span className="statVal">{curChamp.stats.armor}</span></div>
                                        <div className="statItem"><span className="statLabel">🔮 MR</span><span className="statVal">{curChamp.stats.mr}</span></div>
                                        <div className="statItem"><span className="statLabel">📏 射程</span><span className="statVal">{curChamp.stats.range}</span></div>
                                        <div className="statItem"><span className="statLabel">👟 MS</span><span className="statVal">{curChamp.stats.ms}</span></div>
                                        <div className="statItem"><span className="statLabel">🗡 DPS</span><span className="statVal">{(curChamp.stats.ad * curChamp.stats.as).toFixed(1)}</span></div>
                                    </div>
                                    <div className="secTitle">SKILL COOLDOWNS</div>
                                    <table className="spellTbl">
                                        <thead><tr>
                                            <th style={{ width: 34 }}>KEY</th><th>スキル名</th>
                                            <th className="thCenter">CD（秒）</th>
                                            <th className="thCenter">射程</th><th className="thCenter">コスト</th>
                                        </tr></thead>
                                        <tbody>
                                            {/* Passive */}
                                            <tr className="spellRow">
                                                <td><div className="keyBadge keyP">PAS</div></td>
                                                <td><div className="spellNameCell">
                                                    {passive?.icon ? <img className="spellIconImg" src={passive.icon} alt="" onError={e => { (e.target as HTMLImageElement).style.opacity = '.2' }} /> : <div className="spellIconImg" />}
                                                    <span className="spellName">{passive?.name || 'Passive'}</span>
                                                </div></td>
                                                <td className="cdCell"><span className="noCd">— パッシブ</span></td>
                                                <td className="rngCell">—</td><td className="costCell">—</td>
                                            </tr>
                                            {/* Q W E R */}
                                            {SLOT_KEYS.map((key, i) => {
                                                const slot = getAbility(ab, key)
                                                if (!slot) return (
                                                    <tr key={key} className="spellRow">
                                                        <td><div className={`keyBadge ${SLOT_CLS[i]}`}>{key}</div></td>
                                                        <td colSpan={4} style={{ color: '#9CA3AF', fontSize: 11, padding: 9 }}>—</td>
                                                    </tr>
                                                )
                                                const isR = i === 3
                                                const cds = getAbilityCooldowns(slot)
                                                const uniq: number[] = []
                                                cds.forEach((v, j) => { if (j === 0 || v !== cds[j - 1]) uniq.push(v) })
                                                const rngs = getAbilityRange(slot)
                                                const cost = getAbilityCost(slot)
                                                return (
                                                    <tr key={key} className="spellRow">
                                                        <td><div className={`keyBadge ${SLOT_CLS[i]}`}>{key}</div></td>
                                                        <td><div className="spellNameCell">
                                                            {slot.icon ? <img className="spellIconImg" src={slot.icon} alt="" onError={e => { (e.target as HTMLImageElement).style.opacity = '.2' }} /> : <div className="spellIconImg" />}
                                                            <span className="spellName">{slot.name || key}</span>
                                                        </div></td>
                                                        <td className="cdCell">
                                                            <div className="cdVals">
                                                                {uniq.filter(v => v > 0).length > 0
                                                                    ? uniq.filter(v => v > 0).map((v, j) => <span key={j} className={`cdChip ${isR ? 'cdChipR' : ''}`}>{v}s</span>)
                                                                    : <span className="noCd">—</span>}
                                                            </div>
                                                        </td>
                                                        <td className="rngCell">{rngs}</td>
                                                        <td className="costCell">{cost}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        })()}
                    </div>
                </div>
            </div>

            {/* CHAT MODAL */}
            <div className={`modalBg ${chatOpen ? 'modalBgShow' : ''}`} onClick={e => { if (e.target === e.currentTarget) { updateChatMeta(); setChatOpen(false) } }}>
                <div className="modal chatModal">
                    <div className="modalHd">
                        <input className="modalTitle" value={mTitle} onChange={e => setMTitle(e.target.value)} onBlur={updateChatMeta} placeholder="スレッドタイトル..." />
                        <select className="modalCat" value={mCatId} onChange={e => { setMCatId(e.target.value); setTimeout(updateChatMeta, 0) }}>
                            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="chatTagsBar">
                        {(['high', 'med', 'low'] as const).map(p => (
                            <button key={p} className={`tagBtn ${p === 'high' ? 'tagBtnHigh' : p === 'med' ? 'tagBtnMed' : 'tagBtnLow'} ${selPri === p ? (p === 'high' ? 'tagBtnActiveHigh' : p === 'med' ? 'tagBtnActiveMed' : 'tagBtnActiveLow') : ''}`}
                                onClick={() => { setSelPri(p); setTimeout(updateChatMeta, 0) }}>
                                {p === 'high' ? '▲ HIGH' : p === 'med' ? '◆ NORMAL' : '▼ LOW'}
                            </button>
                        ))}
                        <span className="chatMsgCount">{chatNote?.messages.length || 0} 件のメッセージ</span>
                    </div>
                    <div className="chatMessages">
                        {chatNote && chatNote.messages.length === 0 && (
                            <div className="chatEmpty">💬 メッセージを送信して会話を始めましょう</div>
                        )}
                        {chatNote?.messages.map((msg, i) => {
                            const time = new Date(msg.ts).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                            const prevMsg = i > 0 ? chatNote.messages[i - 1] : null
                            const showDateSep = !prevMsg || new Date(msg.ts).toDateString() !== new Date(prevMsg.ts).toDateString()
                            return (
                                <div key={msg.id}>
                                    {showDateSep && (
                                        <div className="chatDateSep">
                                            <span>{new Date(msg.ts).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    )}
                                    <div className="chatBubble">
                                        <div className="chatBubbleText">{msg.text}</div>
                                        <div className="chatBubbleMeta">
                                            <span className="chatTime">{time}</span>
                                            <button className="chatMsgDel" onClick={() => deleteMessage(chatNoteId!, msg.id)}>✕</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="chatInputBar">
                        <input
                            ref={chatInputRef}
                            className="chatInputField"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                            placeholder="メッセージを入力..."
                        />
                        <button className="chatSendBtn" onClick={sendMessage} disabled={!chatInput.trim()}>送信</button>
                    </div>
                </div>
            </div>

            {/* TOAST */}
            <div className={`toast ${toastVisible ? 'toastShow' : ''}`}>{toastMsg}</div>
        </div>
    )
}
