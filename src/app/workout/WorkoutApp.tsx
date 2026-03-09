import { useState, useRef, useEffect, CSSProperties } from "react";

/* ─── Types ─── */
interface WExercise {
  id: number; name: string; muscle: string; icon: string;
  defaultWeight: number; defaultReps: number;
}
interface SetLog extends WExercise {
  weight: number; reps: number; volume: number;
  uid: number; timestamp: Date;
}
interface PRRecord { weight: number; reps: number; estimated1rm: number; name: string }
interface GroupedLog { exercise: SetLog; sets: SetLog[] }
interface Template { name: string; muscles: string[]; exerciseIds: number[]; icon: string }

/* ─── Exercise Database ─── */
const EXERCISE_DB: WExercise[] = [
  // 胸 (Chest)
  { id: 1, name: "ベンチプレス", muscle: "胸", icon: "🏋️", defaultWeight: 60, defaultReps: 10 },
  { id: 2, name: "インクラインダンベルプレス", muscle: "胸", icon: "🏋️", defaultWeight: 20, defaultReps: 10 },
  { id: 3, name: "ダンベルフライ", muscle: "胸", icon: "🦋", defaultWeight: 14, defaultReps: 12 },
  { id: 4, name: "チェストプレス（マシン）", muscle: "胸", icon: "🔩", defaultWeight: 40, defaultReps: 12 },
  { id: 5, name: "ディップス", muscle: "胸", icon: "💪", defaultWeight: 0, defaultReps: 10 },
  // 背中 (Back)
  { id: 6, name: "デッドリフト", muscle: "背中", icon: "🏋️", defaultWeight: 80, defaultReps: 5 },
  { id: 7, name: "懸垂（チンニング）", muscle: "背中", icon: "💪", defaultWeight: 0, defaultReps: 8 },
  { id: 8, name: "ラットプルダウン", muscle: "背中", icon: "🔩", defaultWeight: 50, defaultReps: 10 },
  { id: 9, name: "ベントオーバーロウ", muscle: "背中", icon: "🏋️", defaultWeight: 50, defaultReps: 10 },
  { id: 10, name: "ワンハンドダンベルロウ", muscle: "背中", icon: "🏋️", defaultWeight: 22, defaultReps: 10 },
  // 肩 (Shoulders)
  { id: 11, name: "オーバーヘッドプレス", muscle: "肩", icon: "🏋️", defaultWeight: 30, defaultReps: 8 },
  { id: 12, name: "サイドレイズ", muscle: "肩", icon: "🦅", defaultWeight: 8, defaultReps: 15 },
  { id: 13, name: "フロントレイズ", muscle: "肩", icon: "🦅", defaultWeight: 8, defaultReps: 12 },
  { id: 14, name: "リアデルトフライ", muscle: "肩", icon: "🦋", defaultWeight: 6, defaultReps: 15 },
  { id: 15, name: "アーノルドプレス", muscle: "肩", icon: "🏋️", defaultWeight: 14, defaultReps: 10 },
  // 腕 (Arms)
  { id: 16, name: "バーベルカール", muscle: "腕", icon: "💪", defaultWeight: 25, defaultReps: 10 },
  { id: 17, name: "ダンベルカール", muscle: "腕", icon: "💪", defaultWeight: 12, defaultReps: 12 },
  { id: 18, name: "ハンマーカール", muscle: "腕", icon: "🔨", defaultWeight: 12, defaultReps: 12 },
  { id: 19, name: "トライセプスプッシュダウン", muscle: "腕", icon: "🔩", defaultWeight: 20, defaultReps: 12 },
  { id: 20, name: "スカルクラッシャー", muscle: "腕", icon: "💀", defaultWeight: 20, defaultReps: 10 },
  // 脚 (Legs)
  { id: 21, name: "スクワット", muscle: "脚", icon: "🏋️", defaultWeight: 60, defaultReps: 8 },
  { id: 22, name: "レッグプレス", muscle: "脚", icon: "🔩", defaultWeight: 100, defaultReps: 10 },
  { id: 23, name: "レッグエクステンション", muscle: "脚", icon: "🔩", defaultWeight: 40, defaultReps: 12 },
  { id: 24, name: "レッグカール", muscle: "脚", icon: "🔩", defaultWeight: 30, defaultReps: 12 },
  { id: 25, name: "ブルガリアンスクワット", muscle: "脚", icon: "🏋️", defaultWeight: 16, defaultReps: 10 },
  { id: 26, name: "カーフレイズ", muscle: "脚", icon: "🦵", defaultWeight: 40, defaultReps: 20 },
  // 体幹 (Core)
  { id: 27, name: "プランク", muscle: "体幹", icon: "🧘", defaultWeight: 0, defaultReps: 60 },
  { id: 28, name: "アブローラー", muscle: "体幹", icon: "🎡", defaultWeight: 0, defaultReps: 10 },
  { id: 29, name: "クランチ", muscle: "体幹", icon: "🔥", defaultWeight: 0, defaultReps: 20 },
  { id: 30, name: "レッグレイズ", muscle: "体幹", icon: "🔥", defaultWeight: 0, defaultReps: 15 },
  { id: 31, name: "ケーブルクランチ", muscle: "体幹", icon: "🔩", defaultWeight: 25, defaultReps: 15 },
];

const MUSCLE_GROUPS = ["全て", "胸", "背中", "肩", "腕", "脚", "体幹"];
const MUSCLE_COLORS: Record<string, string> = { 胸: "#EF4444", 背中: "#3B82F6", 肩: "#F59E0B", 腕: "#8B5CF6", 脚: "#10B981", 体幹: "#EC4899" };

/* ─── Preset Workout Templates ─── */
const TEMPLATES: Template[] = [
  { name: "胸＋三頭", muscles: ["胸", "腕"], exerciseIds: [1, 2, 3, 19, 20], icon: "💥" },
  { name: "背中＋二頭", muscles: ["背中", "腕"], exerciseIds: [6, 9, 8, 16, 17], icon: "🔥" },
  { name: "肩の日", muscles: ["肩"], exerciseIds: [11, 12, 13, 14, 15], icon: "🦅" },
  { name: "脚の日", muscles: ["脚"], exerciseIds: [21, 22, 23, 24, 26], icon: "🦵" },
  { name: "上半身", muscles: ["胸", "背中", "肩"], exerciseIds: [1, 7, 11, 12, 3], icon: "💪" },
  { name: "全身", muscles: ["胸", "背中", "脚", "体幹"], exerciseIds: [1, 9, 21, 28, 12], icon: "⚡" },
];

const sum = (items: SetLog[], key: keyof SetLog): number => items.reduce((a, i) => a + (Number(i[key]) || 0), 0);
const fmt = (v: number): number => Number.isInteger(v) ? v : parseFloat(v.toFixed(1));

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function WorkoutApp() {
  const [tab, setTab] = useState("record");
  const [muscleFilter, setMuscleFilter] = useState("全て");
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<SetLog[]>([]);
  const [hoverEx, setHoverEx] = useState<number | null>(null);
  const [hoverLog, setHoverLog] = useState<number | null>(null);
  const [hoverTemplate, setHoverTemplate] = useState<number | null>(null);
  const [bodyWeight, setBodyWeight] = useState(70);

  /* Set-editing state: tracks pending weight/reps per exercise before adding */
  const [pendingWeight, setPendingWeight] = useState<Record<number, number>>({});
  const [pendingReps, setPendingReps] = useState<Record<number, number>>({});

  /* Rest timer */
  const [restTime, setRestTime] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [restPreset, setRestPreset] = useState(90);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Personal Records (PR) state – simple in-session tracking */
  const [personalRecords, setPersonalRecords] = useState<Record<number, PRRecord>>({});

  useEffect(() => {
    if (restRunning && restTime > 0) {
      timerRef.current = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) { setRestRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [restRunning, restTime]);

  const startRest = (seconds?: number) => {
    setRestTime(seconds || restPreset);
    setRestRunning(true);
  };
  const stopRest = () => { setRestRunning(false); setRestTime(0); };

  const filtered = EXERCISE_DB.filter(ex => {
    const matchMuscle = muscleFilter === "全て" || ex.muscle === muscleFilter;
    const matchQuery = !query.trim() || ex.name.includes(query);
    return matchMuscle && matchQuery;
  });

  const addSet = (exercise: WExercise) => {
    const w = pendingWeight[exercise.id] ?? exercise.defaultWeight;
    const r = pendingReps[exercise.id] ?? exercise.defaultReps;
    const volume = w * r;
    const entry = {
      ...exercise,
      weight: w,
      reps: r,
      volume,
      uid: Date.now() + Math.random(),
      timestamp: new Date(),
    };
    setLogs(prev => [...prev, entry]);

    /* Update PR */
    const estimated1rm = w * (1 + r / 30);
    setPersonalRecords(prev => {
      const current = prev[exercise.id]?.estimated1rm || 0;
      if (estimated1rm > current) {
        return { ...prev, [exercise.id]: { weight: w, reps: r, estimated1rm, name: exercise.name } };
      }
      return prev;
    });

    startRest(restPreset);
  };

  const removeSet = (uid: number) => setLogs(prev => prev.filter(l => l.uid !== uid));

  const addTemplate = (template: Template) => {
    template.exerciseIds.forEach(eid => {
      const ex = EXERCISE_DB.find(e => e.id === eid);
      if (ex) {
        const w = ex.defaultWeight;
        const r = ex.defaultReps;
        setLogs(prev => [...prev, {
          ...ex, weight: w, reps: r, volume: w * r,
          uid: Date.now() + Math.random() * 1000 + eid,
          timestamp: new Date(),
        }]);
      }
    });
  };

  /* Stats */
  const totalVolume = sum(logs, "volume");
  const totalSets = logs.length;
  const muscleBreakdown = MUSCLE_GROUPS.slice(1).map(m => {
    const items = logs.filter(l => l.muscle === m);
    return { muscle: m, sets: items.length, volume: sum(items, "volume"), color: MUSCLE_COLORS[m] };
  }).filter(m => m.sets > 0);

  /* Grouped logs by exercise */
  const groupedLogs = logs.reduce((acc: Record<number, GroupedLog>, l) => {
    const key = l.id;
    if (!acc[key]) acc[key] = { exercise: l, sets: [] };
    acc[key].sets.push(l);
    return acc;
  }, {});

  const panel: CSSProperties = {
    background: "#FFFFFF", border: "1px solid #E5E7EB",
    borderRadius: 12, overflow: "hidden" as const, margin: "12px 16px",
  };
  const panelHdr: CSSProperties = {
    padding: "10px 16px", borderBottom: "1px solid #F3F4F6",
    background: "#F9FAFB", display: "flex", justifyContent: "space-between", alignItems: "center",
  };
  const panelTitle: CSSProperties = { fontSize: 10, letterSpacing: 2, color: "#6B7280", textTransform: "uppercase" as const, fontWeight: 700 };
  const Divider = () => <div style={{ height: 1, background: "#F3F4F6" }} />;

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{
      fontFamily: "'Outfit','Noto Sans JP',sans-serif",
      background: "#F9FAFB", minHeight: "100vh",
      maxWidth: 480, margin: "0 auto",
      color: "#111827", paddingBottom: 72,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <div style={{
        background: "#FFFFFF", borderBottom: "1px solid #E5E7EB",
        padding: "18px 20px 14px", position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>
              Strength Training System
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: "#111827" }}>筋トレ記録</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
            </div>
          </div>

          {/* Rest Timer Badge */}
          <div style={{
            border: `1.5px solid ${restRunning ? "#EF4444" : "#E5E7EB"}`,
            borderRadius: 6, padding: "6px 12px", textAlign: "center",
            background: restRunning ? "#FEF2F2" : "#F9FAFB",
            minWidth: 72, cursor: "pointer", transition: "all 0.2s",
          }} onClick={() => restRunning ? stopRest() : startRest()}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: restRunning ? "#EF4444" : "#9CA3AF", fontVariantNumeric: "tabular-nums" }}>
              {restRunning ? formatTime(restTime) : "⏱️"}
            </div>
            <div style={{ fontSize: 9, color: restRunning ? "#EF4444" : "#9CA3AF", letterSpacing: 1, textTransform: "uppercase" }}>
              {restRunning ? "休憩中" : "タイマー"}
            </div>
          </div>
        </div>

        {/* Summary grid */}
        <div style={{
          marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 1, background: "#E5E7EB", borderRadius: 8, overflow: "hidden", border: "1px solid #E5E7EB",
        }}>
          {[
            { label: "セット", val: `${totalSets}`, unit: "sets" },
            { label: "総重量", val: `${Math.round(totalVolume / 1000 * 10) / 10}`, unit: "t" },
            { label: "部位", val: `${muscleBreakdown.length}`, unit: "種" },
            { label: "体重", val: `${bodyWeight}`, unit: "kg" },
          ].map(({ label, val, unit }) => (
            <div key={label} style={{ background: "#FFFFFF", padding: "7px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{val}</div>
              <div style={{ fontSize: 9, color: "#CBD5E1" }}>{unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RECORD TAB ── */}
      {tab === "record" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>

          {/* Muscle group filter pills */}
          <div style={{ display: "flex", gap: 6, padding: "12px 16px 0", overflowX: "auto", scrollbarWidth: "none" }}>
            {MUSCLE_GROUPS.map(m => (
              <button key={m} onClick={() => setMuscleFilter(m)} style={{
                padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${muscleFilter === m ? "#111827" : "#E5E7EB"}`,
                background: muscleFilter === m ? "#111827" : "#FFFFFF",
                color: muscleFilter === m ? "#FFFFFF" : "#6B7280",
                fontSize: 12, fontWeight: muscleFilter === m ? 700 : 400,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
              }}>{m === "全て" ? "全て" : `${m}`}</button>
            ))}
          </div>

          {/* Exercise search */}
          <div style={{ ...panel, marginTop: 12 }}>
            <div style={panelHdr}>
              <span style={panelTitle}>種目データベース</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{EXERCISE_DB.length}種目</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #E5E7EB", background: "#FDFDFD" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="種目を検索..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1, fontSize: 16 }}>×</button>
              )}
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {filtered.length === 0 && (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>該当する種目が見つかりません</div>
              )}
              {filtered.map(ex => {
                const w = pendingWeight[ex.id] ?? ex.defaultWeight;
                const r = pendingReps[ex.id] ?? ex.defaultReps;
                const setsLogged = logs.filter(l => l.id === ex.id).length;
                return (
                  <div key={ex.id}
                    style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, cursor: "pointer", background: hoverEx === ex.id ? "#F9FAFB" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                    onMouseEnter={() => setHoverEx(ex.id)}
                    onMouseLeave={() => setHoverEx(null)}
                  >
                    <div style={{ fontSize: 22, flexShrink: 0 }}>{ex.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{ex.name}</span>
                        {setsLogged > 0 && (
                          <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#DBEAFE", color: "#2563EB", fontSize: 10, fontWeight: 700 }}>
                            {setsLogged}set
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: `${MUSCLE_COLORS[ex.muscle]}18`, color: MUSCLE_COLORS[ex.muscle], fontSize: 10, fontWeight: 700 }}>
                          {ex.muscle}
                        </span>
                      </div>
                      {/* Weight & Reps inline editor */}
                      <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                        <input type="number" value={w}
                          onChange={e => setPendingWeight(p => ({ ...p, [ex.id]: Number(e.target.value) }))}
                          style={{ width: 52, padding: "3px 6px", border: "1px solid #E5E7EB", borderRadius: 4, fontSize: 12, fontWeight: 700, textAlign: "right", color: "#374151", fontFamily: "inherit", outline: "none" }}
                        />
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>kg</span>
                        <span style={{ fontSize: 11, color: "#CBD5E1", margin: "0 2px" }}>×</span>
                        <input type="number" value={r}
                          onChange={e => setPendingReps(p => ({ ...p, [ex.id]: Number(e.target.value) }))}
                          style={{ width: 42, padding: "3px 6px", border: "1px solid #E5E7EB", borderRadius: 4, fontSize: 12, fontWeight: 700, textAlign: "right", color: "#374151", fontFamily: "inherit", outline: "none" }}
                        />
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>回</span>
                        <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>{fmt(w * r)} kg</span>
                      </div>
                    </div>
                    <button onClick={() => addSet(ex)} style={{
                      width: 28, height: 28, borderRadius: 6, background: "#111827", border: "none",
                      color: "#FFFFFF", fontSize: 20, fontWeight: 300, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0,
                    }}>+</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logged sets grouped by exercise */}
          {Object.values(groupedLogs).map(({ exercise, sets }) => (
            <div key={exercise.id} style={panel}>
              <div style={panelHdr}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{exercise.icon}</span>
                  <span style={panelTitle}>{exercise.name}</span>
                  <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, background: `${MUSCLE_COLORS[exercise.muscle]}18`, color: MUSCLE_COLORS[exercise.muscle], fontSize: 9, fontWeight: 700 }}>
                    {exercise.muscle}
                  </span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>
                  {sets.length} sets
                </span>
              </div>
              {sets.map((s, idx) => (
                <div key={s.uid}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, background: hoverLog === s.uid ? "#FEF2F2" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6", cursor: "default" }}
                  onMouseEnter={() => setHoverLog(s.uid)}
                  onMouseLeave={() => setHoverLog(null)}
                >
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#6B7280", flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{s.weight} kg</span>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>×</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{s.reps} 回</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", fontVariantNumeric: "tabular-nums", minWidth: 56, textAlign: "right" }}>
                    {fmt(s.volume)} kg
                  </div>
                  <button onClick={() => removeSet(s.uid)} style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: "transparent", border: "1px solid #FCA5A5",
                    color: "#DC2626", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: 6,
                  }}>×</button>
                </div>
              ))}
              {/* Set volume total */}
              <div style={{ padding: "8px 16px", display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center", background: "#FAFAFA" }}>
                <span style={{ fontSize: 10, color: "#9CA3AF", letterSpacing: 0.5 }}>合計ボリューム</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#374151", fontVariantNumeric: "tabular-nums" }}>{fmt(sum(sets, "volume"))} kg</span>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0 24px", color: "#9CA3AF", fontSize: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>NO RECORDS</div>
              上記の検索から種目を追加してください
            </div>
          )}
        </div>
      )}

      {/* ── TEMPLATES TAB ── */}
      {tab === "templates" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>ワークアウトテンプレート</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{TEMPLATES.length}件</span>
            </div>
            {TEMPLATES.map((tpl, idx) => (
              <div key={idx}
                style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12, borderBottom: "1px solid #F3F4F6", background: hoverTemplate === idx ? "#F9FAFB" : "transparent", transition: "background 0.1s", cursor: "pointer" }}
                onMouseEnter={() => setHoverTemplate(idx)}
                onMouseLeave={() => setHoverTemplate(null)}
              >
                <div style={{ fontSize: 28, flexShrink: 0 }}>{tpl.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{tpl.name}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    {tpl.muscles.map(m => (
                      <span key={m} style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: `${MUSCLE_COLORS[m]}18`, color: MUSCLE_COLORS[m], fontSize: 10, fontWeight: 700 }}>
                        {m}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                    {tpl.exerciseIds.map(eid => EXERCISE_DB.find(e => e.id === eid)?.name).filter(Boolean).join("、")}
                  </div>
                </div>
                <button onClick={() => addTemplate(tpl)} style={{
                  padding: "8px 14px", borderRadius: 8, background: "#111827", border: "none",
                  color: "#FFFFFF", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0, transition: "opacity 0.15s",
                }}>追加</button>
              </div>
            ))}
          </div>

          {/* Rest timer settings */}
          <div style={panel}>
            <div style={panelHdr}><span style={panelTitle}>休憩タイマー設定</span></div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "#6B7280", flex: 1 }}>デフォルト休憩時間</span>
                <input type="number" value={restPreset}
                  onChange={e => setRestPreset(Number(e.target.value))}
                  style={{ width: 60, padding: "5px 8px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14, fontWeight: 700, textAlign: "right", color: "#111827", fontFamily: "inherit", outline: "none" }}
                />
                <span style={{ fontSize: 13, color: "#9CA3AF" }}>秒</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[30, 60, 90, 120, 180].map(s => (
                  <button key={s} onClick={() => setRestPreset(s)} style={{
                    padding: "6px 14px", borderRadius: 20,
                    border: `1px solid ${restPreset === s ? "#111827" : "#E5E7EB"}`,
                    background: restPreset === s ? "#111827" : "#FFFFFF",
                    color: restPreset === s ? "#FFFFFF" : "#6B7280",
                    fontSize: 12, fontWeight: restPreset === s ? 700 : 400,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>{s}秒</button>
                ))}
              </div>
            </div>
          </div>

          {/* Body weight */}
          <div style={panel}>
            <div style={panelHdr}><span style={panelTitle}>体重</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              <span style={{ fontSize: 13, color: "#6B7280", flex: 1 }}>現在の体重</span>
              <input type="number" value={bodyWeight}
                onChange={e => setBodyWeight(Number(e.target.value))}
                style={{ width: 72, padding: "5px 8px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 15, fontWeight: 700, textAlign: "right", color: "#111827", fontFamily: "inherit", outline: "none" }}
              />
              <span style={{ fontSize: 13, color: "#9CA3AF" }}>kg</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SUMMARY TAB ── */}
      {tab === "summary" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>

          {/* Volume overview */}
          <div style={panel}>
            <div style={panelHdr}><span style={panelTitle}>トレーニング概要</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#E5E7EB" }}>
              {[
                { label: "総セット数", val: totalSets, unit: "sets" },
                { label: "総ボリューム", val: `${fmt(totalVolume)}`, unit: "kg" },
                { label: "種目数", val: Object.keys(groupedLogs).length, unit: "種目" },
                { label: "部位数", val: muscleBreakdown.length, unit: "部位" },
              ].map(({ label, val, unit }) => (
                <div key={label} style={{ background: "#FFFFFF", padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{val}</div>
                  <div style={{ fontSize: 10, color: "#CBD5E1" }}>{unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Muscle breakdown bars */}
          <div style={panel}>
            <div style={panelHdr}><span style={panelTitle}>部位別ボリューム</span></div>
            <div style={{ padding: "8px 16px 12px" }}>
              {muscleBreakdown.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: "#9CA3AF", fontSize: 12 }}>記録なし</div>
              ) : (
                muscleBreakdown.sort((a, b) => b.volume - a.volume).map(({ muscle, sets, volume, color }) => {
                  const maxVol = Math.max(...muscleBreakdown.map(m => m.volume));
                  const pct = maxVol > 0 ? (volume / maxVol) * 100 : 0;
                  return (
                    <div key={muscle} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />{muscle}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>
                          {fmt(volume)} kg
                          <span style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 4 }}>({sets} sets)</span>
                        </span>
                      </div>
                      <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: color, width: `${pct}%`, transition: "width 0.6s" }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Muscle pie-like distribution */}
          {muscleBreakdown.length > 0 && (
            <div style={panel}>
              <div style={panelHdr}><span style={panelTitle}>部位バランス</span></div>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", height: 20, borderRadius: 4, overflow: "hidden", gap: 1 }}>
                  {muscleBreakdown.map(({ muscle, volume, color }) => (
                    <div key={muscle} style={{ width: `${(volume / totalVolume) * 100}%`, background: color, transition: "width 0.8s" }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", marginTop: 14, flexWrap: "wrap", gap: 8 }}>
                  {muscleBreakdown.map(({ muscle, volume, color }) => (
                    <div key={muscle} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 2 }}>{muscle}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>
                        {totalVolume > 0 ? ((volume / totalVolume) * 100).toFixed(0) : 0}<span style={{ fontSize: 11 }}>%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Per-exercise table */}
          <div style={{ ...panel, marginBottom: 0 }}>
            <div style={panelHdr}>
              <span style={panelTitle}>種目別詳細</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{Object.keys(groupedLogs).length}種目</span>
            </div>
            {Object.keys(groupedLogs).length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "#9CA3AF", fontSize: 12 }}>記録なし</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["種目", "部位", "セット", "最大重量", "総ボリューム"].map(h => (
                        <th key={h} style={{ padding: "6px 10px", textAlign: h === "種目" || h === "部位" ? "left" : "right", color: "#6B7280", fontWeight: 600, fontSize: 10, letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedLogs).map(({ exercise, sets }) => (
                      <tr key={exercise.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "7px 10px", color: "#374151", whiteSpace: "nowrap" }}>{exercise.name}</td>
                        <td style={{ padding: "7px 10px" }}>
                          <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, background: `${MUSCLE_COLORS[exercise.muscle]}18`, color: MUSCLE_COLORS[exercise.muscle], fontSize: 10, fontWeight: 700 }}>
                            {exercise.muscle}
                          </span>
                        </td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#374151" }}>{sets.length}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#374151" }}>{Math.max(...sets.map(s => s.weight))} kg</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "#374151" }}>{fmt(sum(sets, "volume"))} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PR TAB ── */}
      {tab === "pr" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>パーソナルレコード（推定1RM）</span>
            </div>
            {Object.keys(personalRecords).length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#9CA3AF", fontSize: 12 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
                <div style={{ fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>NO RECORDS YET</div>
                種目を記録するとPRが表示されます
              </div>
            ) : (
              Object.values(personalRecords).sort((a, b) => b.estimated1rm - a.estimated1rm).map((pr, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12, borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: idx === 0 ? "linear-gradient(135deg,#FBBF24,#F59E0B)" : idx === 1 ? "linear-gradient(135deg,#D1D5DB,#9CA3AF)" : idx === 2 ? "linear-gradient(135deg,#D97706,#B45309)" : "#F3F4F6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: idx < 3 ? "#FFFFFF" : "#6B7280",
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{pr.name}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                      {pr.weight} kg × {pr.reps} 回
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{fmt(pr.estimated1rm)}</div>
                    <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 0.5 }}>推定1RM kg</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 1RM formula explanation */}
          <div style={{ ...panel, background: "#F9FAFB" }}>
            <div style={panelHdr}><span style={panelTitle}>推定1RMの計算式</span></div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, color: "#374151", marginBottom: 4 }}>Epley Formula</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#111827", background: "#FFFFFF", padding: "8px 12px", borderRadius: 6, border: "1px solid #E5E7EB", marginBottom: 8 }}>
                  1RM = 重量 × (1 + 回数 / 30)
                </div>
                <div>この式は1回の最大重量（1RM）を推定するために広く使用されています。セッション中の最高推定値がPRとして記録されます。</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Nav ── */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "#FFFFFF", borderTop: "1px solid #E5E7EB",
        display: "flex", justifyContent: "space-around",
        padding: "8px 0 16px", zIndex: 30,
      }}>
        {[
          {
            id: "record", label: "記録", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                <path d="M16 3l5 5-9 9H7v-5L16 3z" />
              </svg>
            )
          },
          {
            id: "templates", label: "メニュー", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            )
          },
          {
            id: "summary", label: "集計", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            )
          },
          {
            id: "pr", label: "PR", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 9H4.5a2.5 2.5 0 010-5C7 4 7 7 7 7" />
                <path d="M18 9h1.5a2.5 2.5 0 000-5C17 4 17 7 17 7" />
                <path d="M4 22h16" />
                <path d="M10 22V10a2 2 0 012-2h0a2 2 0 012 2v12" />
                <path d="M8 22v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                <path d="M12 6V2" />
              </svg>
            )
          },
        ].map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, border: "none", background: "none", cursor: "pointer",
            color: tab === id ? "#111827" : "#9CA3AF", padding: "4px 20px",
            transition: "color 0.15s",
          }}>
            {icon}
            <span style={{ fontSize: 10, fontWeight: tab === id ? 700 : 400 }}>{label}</span>
            {tab === id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#111827" }} />}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#E5E7EB;border-radius:2px}
      `}</style>
    </div>
  );
}
