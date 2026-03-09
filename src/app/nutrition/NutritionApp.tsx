import { useState, useRef, useEffect, CSSProperties } from "react";

interface Food {
  id: number; name: string; qty: string;
  cal: number; protein: number; fat: number; carb: number;
  fiber: number; na: number; dairy?: boolean;
}
interface Exercise {
  id: number; name: string; met: number; unit: string; icon: string;
}
interface FoodLog extends Food { uid: number }
interface ExerciseLog extends Exercise { minutes: number; burned: number; uid: number }
interface Logs { [key: string]: FoodLog[] }
interface Drink {
  id: number; name: string; qty: string; ml: number;
  cal: number; sugar: number; caffeine: number;
}
interface DrinkLog extends Drink { uid: number }
interface DrinkTotals { ml: number; cal: number; sugar: number; caffeine: number }
interface NutritionTotals { cal: number; protein: number; fat: number; carb: number; fiber: number; na: number }
interface HistoryEntry {
  date: string; logs: Logs; exercises: ExerciseLog[]; drinks: DrinkLog[];
  totals: NutritionTotals; drinkTotals: DrinkTotals; burnedCal: number;
}

const FOOD_DB: Food[] = [
  { id: 1, name: "白米", qty: "茶碗1杯(150g)", cal: 252, protein: 3.8, fat: 0.5, carb: 55.7, fiber: 0.5, na: 1 },
  { id: 2, name: "玄米", qty: "茶碗1杯(150g)", cal: 228, protein: 4.2, fat: 1.5, carb: 47.0, fiber: 2.1, na: 1 },
  { id: 3, name: "食パン", qty: "1枚(60g)", cal: 158, protein: 5.3, fat: 2.5, carb: 28.0, fiber: 1.3, na: 300 },
  { id: 4, name: "うどん（茹）", qty: "1玉(250g)", cal: 263, protein: 6.5, fat: 1.0, carb: 54.6, fiber: 1.3, na: 225 },
  { id: 5, name: "鶏むね肉（皮なし）", qty: "100g", cal: 116, protein: 23.3, fat: 1.9, carb: 0, fiber: 0, na: 42 },
  { id: 6, name: "鶏もも肉", qty: "100g", cal: 204, protein: 19.0, fat: 14.2, carb: 0, fiber: 0, na: 60 },
  { id: 7, name: "豚ロース", qty: "100g", cal: 263, protein: 19.3, fat: 19.2, carb: 0.2, fiber: 0, na: 55 },
  { id: 8, name: "牛もも肉（赤身）", qty: "100g", cal: 182, protein: 21.2, fat: 10.7, carb: 0.6, fiber: 0, na: 46 },
  { id: 9, name: "サーモン", qty: "100g", cal: 204, protein: 21.4, fat: 12.7, carb: 0.1, fiber: 0, na: 59 },
  { id: 10, name: "マグロ（赤身）", qty: "100g", cal: 125, protein: 26.4, fat: 1.4, carb: 0.1, fiber: 0, na: 49 },
  { id: 11, name: "卵", qty: "1個(50g)", cal: 76, protein: 6.2, fat: 5.2, carb: 0.2, fiber: 0, na: 71 },
  { id: 12, name: "木綿豆腐", qty: "1/2丁(150g)", cal: 108, protein: 9.9, fat: 6.3, carb: 2.4, fiber: 0.5, na: 6 },
  { id: 13, name: "牛乳", qty: "200ml", cal: 134, protein: 6.6, fat: 7.6, carb: 9.6, fiber: 0, na: 100, dairy: true },
  { id: 14, name: "無脂肪ヨーグルト", qty: "100g", cal: 42, protein: 3.7, fat: 0.2, carb: 5.7, fiber: 0, na: 48, dairy: true },
  { id: 15, name: "ブロッコリー", qty: "100g", cal: 33, protein: 4.3, fat: 0.5, carb: 5.3, fiber: 4.4, na: 20 },
  { id: 16, name: "ほうれん草", qty: "100g", cal: 20, protein: 2.2, fat: 0.4, carb: 3.1, fiber: 2.8, na: 16 },
  { id: 17, name: "トマト", qty: "中1個(150g)", cal: 29, protein: 1.1, fat: 0.2, carb: 5.8, fiber: 1.5, na: 6 },
  { id: 18, name: "バナナ", qty: "1本(100g)", cal: 86, protein: 1.1, fat: 0.2, carb: 22.5, fiber: 1.1, na: 1 },
  { id: 19, name: "りんご", qty: "中1/2個(150g)", cal: 81, protein: 0.2, fat: 0.2, carb: 21.2, fiber: 1.8, na: 1 },
  { id: 20, name: "アーモンド", qty: "10粒(15g)", cal: 92, protein: 3.2, fat: 7.9, carb: 3.0, fiber: 1.8, na: 1 },
  { id: 21, name: "プロテイン（WPC）", qty: "1杯(30g)", cal: 114, protein: 21.0, fat: 2.4, carb: 4.2, fiber: 0, na: 80, dairy: true },
  { id: 22, name: "オリーブオイル", qty: "大さじ1(12g)", cal: 111, protein: 0, fat: 12.0, carb: 0, fiber: 0, na: 0 },
  { id: 23, name: "味噌汁", qty: "1杯(180ml)", cal: 29, protein: 2.1, fat: 1.0, carb: 3.3, fiber: 0.9, na: 700 },
  { id: 24, name: "鮭おにぎり", qty: "1個(110g)", cal: 201, protein: 6.2, fat: 2.0, carb: 39.2, fiber: 0.5, na: 380 },
  { id: 25, name: "納豆卵かけごはん（ネギ入り）", qty: "1杯(約270g)", cal: 391, protein: 17.8, fat: 9.8, carb: 55.2, fiber: 3.1, na: 290 },
  { id: 26, name: "コーンフレーク", qty: "1杯(40g)", cal: 152, protein: 2.8, fat: 0.4, carb: 34.6, fiber: 0.9, na: 260 },
  { id: 27, name: "カカオニブ", qty: "大さじ1(10g)", cal: 57, protein: 1.4, fat: 4.0, carb: 4.0, fiber: 2.7, na: 1 },
  { id: 28, name: "プロテイン（アイソレート）", qty: "1杯(30g)", cal: 110, protein: 25.0, fat: 0.5, carb: 1.5, fiber: 0, na: 60, dairy: true },
  { id: 29, name: "納豆", qty: "1パック(45g)", cal: 90, protein: 7.4, fat: 4.5, carb: 5.4, fiber: 3.0, na: 2 },
  { id: 30, name: "おでん", qty: "1人前(約400g)", cal: 230, protein: 18.0, fat: 5.5, carb: 28.0, fiber: 3.5, na: 1200 },
];

const DRINK_DB: Drink[] = [
  { id: 1, name: "水", qty: "コップ1杯(200ml)", ml: 200, cal: 0, sugar: 0, caffeine: 0 },
  { id: 2, name: "緑茶", qty: "1杯(200ml)", ml: 200, cal: 4, sugar: 0, caffeine: 40 },
  { id: 3, name: "コーヒー（ブラック）", qty: "1杯(200ml)", ml: 200, cal: 8, sugar: 0, caffeine: 120 },
  { id: 4, name: "コーヒー（ミルク入り）", qty: "1杯(200ml)", ml: 200, cal: 30, sugar: 3, caffeine: 120 },
  { id: 5, name: "紅茶", qty: "1杯(200ml)", ml: 200, cal: 2, sugar: 0, caffeine: 50 },
  { id: 6, name: "オレンジジュース", qty: "1杯(200ml)", ml: 200, cal: 84, sugar: 20, caffeine: 0 },
  { id: 7, name: "コーラ", qty: "1缶(350ml)", ml: 350, cal: 157, sugar: 39, caffeine: 35 },
  { id: 8, name: "エナジードリンク", qty: "1缶(250ml)", ml: 250, cal: 115, sugar: 27, caffeine: 80 },
  { id: 9, name: "豆乳", qty: "1杯(200ml)", ml: 200, cal: 92, sugar: 5.6, caffeine: 0 },
  { id: 10, name: "スポーツドリンク", qty: "1本(500ml)", ml: 500, cal: 105, sugar: 25, caffeine: 0 },
  { id: 11, name: "炭酸水", qty: "1杯(200ml)", ml: 200, cal: 0, sugar: 0, caffeine: 0 },
  { id: 12, name: "ココア", qty: "1杯(200ml)", ml: 200, cal: 130, sugar: 15, caffeine: 12 },
  { id: 13, name: "味噌汁", qty: "1杯(180ml)", ml: 180, cal: 29, sugar: 2, caffeine: 0 },
  { id: 14, name: "ほうじ茶", qty: "1杯(200ml)", ml: 200, cal: 0, sugar: 0, caffeine: 30 },
  { id: 15, name: "麦茶", qty: "1杯(200ml)", ml: 200, cal: 2, sugar: 0, caffeine: 0 },
];

const EXERCISE_DB: Exercise[] = [
  { id: 1, name: "ウォーキング", met: 3.5, unit: "分", icon: "🚶" },
  { id: 2, name: "ジョギング", met: 7.0, unit: "分", icon: "🏃" },
  { id: 3, name: "ランニング（速め）", met: 9.8, unit: "分", icon: "🏃" },
  { id: 4, name: "サイクリング", met: 6.8, unit: "分", icon: "🚴" },
  { id: 5, name: "水泳", met: 8.0, unit: "分", icon: "🏊" },
  { id: 6, name: "筋力トレーニング", met: 5.0, unit: "分", icon: "🏋️" },
  { id: 7, name: "HIIT", met: 12.0, unit: "分", icon: "⚡" },
  { id: 8, name: "ヨガ", met: 2.5, unit: "分", icon: "🧘" },
  { id: 9, name: "縄跳び", met: 10.0, unit: "分", icon: "🪢" },
  { id: 10, name: "階段昇降", met: 8.0, unit: "分", icon: "🪜" },
  { id: 11, name: "ストレッチ", met: 2.3, unit: "分", icon: "🤸" },
  { id: 12, name: "バスケットボール", met: 8.0, unit: "分", icon: "🏀" },
  { id: 13, name: "テニス", met: 7.3, unit: "分", icon: "🎾" },
  { id: 14, name: "サッカー", met: 7.0, unit: "分", icon: "⚽" },
  { id: 15, name: "ダンス", met: 5.5, unit: "分", icon: "💃" },
];

const MEAL_SLOTS = ["朝食", "昼食", "夕食", "間食"];
const DEFAULT_GOALS: Record<string, number> = { cal: 2000, protein: 80, fat: 55, carb: 250, fiber: 21, na: 2500 };

const sum = (items: FoodLog[], key: keyof FoodLog): number => items.reduce((a, f) => a + (Number(f[key]) || 0), 0);
const pct = (v: number, max: number): number => Math.min(100, max > 0 ? (v / max) * 100 : 0);
const fmt = (v: number): number => Number.isInteger(v) ? v : parseFloat(v.toFixed(1));

const statusColor = (p: number): string =>
  p <= 60 ? "#2563EB" : p <= 100 ? "#16A34A" : p <= 120 ? "#D97706" : "#DC2626";

const Divider = () => <div style={{ height: 1, background: "#F3F4F6" }} />;

function MetricRow({ label, value, unit, goal }: { label: string; value: number; unit: string; goal?: number }) {
  const p = goal ? pct(value, goal) : null;
  const col = p !== null ? statusColor(p) : "#111827";
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "9px 0", gap: 8 }}>
      <div style={{ width: 130, fontSize: 12, color: "#6B7280", letterSpacing: 0.3, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1 }}>
        {goal && (
          <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden", marginBottom: 0 }}>
            <div style={{ height: "100%", borderRadius: 2, background: col, width: `${pct(value, goal)}%`, transition: "width 0.6s ease" }} />
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3, minWidth: 100, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: col, fontVariantNumeric: "tabular-nums" }}>{fmt(value)}</span>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>/{goal ?? ""} {unit}</span>
      </div>
    </div>
  );
}

export default function NutritionApp() {
  const [tab, setTab] = useState("record");
  const [meal, setMeal] = useState("朝食");
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<Logs>({
    朝食: [
      { id: 25, name: "納豆卵かけごはん（ネギ入り）", qty: "1杯(約270g)", cal: 391, protein: 17.8, fat: 9.8, carb: 55.2, fiber: 3.1, na: 290, uid: 1 },
      { id: 26, name: "コーンフレーク", qty: "1杯(40g)", cal: 152, protein: 2.8, fat: 0.4, carb: 34.6, fiber: 0.9, na: 260, uid: 2 },
      { id: 27, name: "カカオニブ", qty: "大さじ1(10g)", cal: 57, protein: 1.4, fat: 4.0, carb: 4.0, fiber: 2.7, na: 1, uid: 3 },
      { id: 28, name: "プロテイン（アイソレート）", qty: "1杯(30g)", cal: 110, protein: 25.0, fat: 0.5, carb: 1.5, fiber: 0, na: 60, dairy: true, uid: 4 },
    ],
    昼食: [], 夕食: [], 間食: [],
  });
  const [goals, setGoals] = useState<Record<string, number>>(DEFAULT_GOALS);
  const [editGoals, setEditGoals] = useState(false);
  const [tmpGoals, setTmpGoals] = useState<Record<string, number>>(DEFAULT_GOALS);
  const [hoverFood, setHoverFood] = useState<number | null>(null);
  const [hoverLog, setHoverLog] = useState<number | null>(null);
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [exQuery, setExQuery] = useState("");
  const [bodyWeight, setBodyWeight] = useState(65);
  const [hoverEx, setHoverEx] = useState<number | null>(null);
  const [hoverExLog, setHoverExLog] = useState<number | null>(null);
  const [exMinutes, setExMinutes] = useState<Record<number, number>>({});
  const [drinks, setDrinks] = useState<DrinkLog[]>([]);
  const [drinkQuery, setDrinkQuery] = useState("");
  const [hoverDrink, setHoverDrink] = useState<number | null>(null);
  const [hoverDrinkLog, setHoverDrinkLog] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nutrition-history");
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const allItems = Object.values(logs).flat();
  const totals = {
    cal: sum(allItems, "cal"),
    protein: sum(allItems, "protein"),
    fat: sum(allItems, "fat"),
    carb: sum(allItems, "carb"),
    fiber: sum(allItems, "fiber"),
    na: sum(allItems, "na"),
  };
  const drinkTotals: DrinkTotals = {
    ml: drinks.reduce((a, d) => a + d.ml, 0),
    cal: drinks.reduce((a, d) => a + d.cal, 0),
    sugar: drinks.reduce((a, d) => a + d.sugar, 0),
    caffeine: drinks.reduce((a, d) => a + d.caffeine, 0),
  };

  const filtered = query.trim()
    ? FOOD_DB.filter(f => f.name.includes(query) || f.qty.includes(query))
    : FOOD_DB;
  const filteredDrinks = drinkQuery.trim()
    ? DRINK_DB.filter(d => d.name.includes(drinkQuery))
    : DRINK_DB;

  const addFood = (food: Food) => {
    setLogs(p => ({ ...p, [meal]: [...p[meal], { ...food, uid: Date.now() + Math.random() }] }));
    setQuery("");
    inputRef.current?.focus();
  };
  const removeFood = (slot: string, uid: number) =>
    setLogs(p => ({ ...p, [slot]: p[slot].filter(f => f.uid !== uid) }));
  const addDrink = (d: Drink) => {
    setDrinks(p => [...p, { ...d, uid: Date.now() + Math.random() }]);
    setDrinkQuery("");
  };
  const removeDrink = (uid: number) => setDrinks(p => p.filter(d => d.uid !== uid));

  const burnedCal = exercises.reduce((a: number, e: ExerciseLog) => a + e.burned, 0);

  const saveToHistory = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const entry: HistoryEntry = {
      date: dateStr, logs: { ...logs }, exercises: [...exercises],
      drinks: [...drinks], totals: { ...totals }, drinkTotals: { ...drinkTotals }, burnedCal,
    };
    const newHistory = [entry, ...history.filter(h => h.date !== dateStr)];
    setHistory(newHistory);
    try { localStorage.setItem("nutrition-history", JSON.stringify(newHistory)); } catch { /* ignore */ }
    setToast("✅ 保存しました");
    setTimeout(() => setToast(""), 2500);
  };

  const resetAll = () => {
    if (confirm("本日の記録をすべてリセットしますか？")) {
      setLogs({ 朝食: [], 昼食: [], 夕食: [], 間食: [] });
      setExercises([]);
      setDrinks([]);
    }
  };

  const deleteHistoryEntry = (date: string) => {
    if (confirm(`${date} の記録を削除しますか？`)) {
      const newHistory = history.filter(h => h.date !== date);
      setHistory(newHistory);
      try { localStorage.setItem("nutrition-history", JSON.stringify(newHistory)); } catch { /* ignore */ }
    }
  };
  const netCal = totals.cal - burnedCal;
  const remaining = goals.cal - netCal;
  const over = remaining < 0;

  const panel: CSSProperties = {
    background: "#FFFFFF", border: "1px solid #E5E7EB",
    borderRadius: 12, overflow: "hidden", margin: "12px 16px",
  };
  const panelHdr: CSSProperties = {
    padding: "10px 16px", borderBottom: "1px solid #F3F4F6",
    background: "#F9FAFB", display: "flex", justifyContent: "space-between", alignItems: "center",
  };
  const panelTitle: CSSProperties = { fontSize: 10, letterSpacing: 2, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 };

  return (
    <div style={{
      fontFamily: "'Outfit','Noto Sans JP',sans-serif",
      background: "#F9FAFB", minHeight: "100vh",
      maxWidth: 480, margin: "0 auto",
      color: "#111827", paddingBottom: 72,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "#FFFFFF", borderBottom: "1px solid #E5E7EB",
        padding: "18px 20px 14px", position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>
              Clinical Nutrition System
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: "#111827" }}>栄養管理記録</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
            </div>
          </div>
          <div style={{
            border: `1.5px solid ${over ? "#DC2626" : "#16A34A"}`,
            borderRadius: 6, padding: "6px 12px", textAlign: "center",
            background: over ? "#FEF2F2" : "#F0FDF4",
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: over ? "#DC2626" : "#16A34A", fontVariantNumeric: "tabular-nums" }}>
              {Math.abs(Math.round(remaining))}
            </div>
            <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase" }}>
              {over ? "超過 kcal" : "残り kcal"}
            </div>
          </div>
        </div>

        {/* Summary grid */}
        <div style={{
          marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 1, background: "#E5E7EB", borderRadius: 8, overflow: "hidden", border: "1px solid #E5E7EB",
        }}>
          {[
            { label: "摂取", val: `${Math.round(totals.cal)}`, unit: "kcal" },
            { label: "消費", val: `${Math.round(burnedCal)}`, unit: "kcal" },
            { label: "純収支", val: `${Math.round(netCal)}`, unit: "kcal" },
            { label: "P", val: `${fmt(totals.protein)}`, unit: "g" },
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
          {/* Meal tabs */}
          <div style={{ display: "flex", gap: 6, padding: "12px 16px 0", overflowX: "auto", scrollbarWidth: "none" }}>
            {MEAL_SLOTS.map(m => (
              <button key={m} onClick={() => setMeal(m)} style={{
                padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${meal === m ? "#111827" : "#E5E7EB"}`,
                background: meal === m ? "#111827" : "#FFFFFF",
                color: meal === m ? "#FFFFFF" : "#6B7280",
                fontSize: 12, fontWeight: meal === m ? 700 : 400,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
              }}>{m}</button>
            ))}
          </div>

          {/* Search */}
          <div style={{ ...panel, marginTop: 12 }}>
            <div style={panelHdr}>
              <span style={panelTitle}>食品検索データベース</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{FOOD_DB.length}品目</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #E5E7EB", background: "#FDFDFD" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`${meal}に追加する食品を検索...`}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1, fontSize: 16 }}>×</button>
              )}
            </div>
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {filtered.length === 0 && (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>該当する食品が見つかりません</div>
              )}
              {filtered.map(f => (
                <div key={f.id}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, cursor: "pointer", background: hoverFood === f.id ? "#F9FAFB" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={() => setHoverFood(f.id)}
                  onMouseLeave={() => setHoverFood(null)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{f.name}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{f.qty}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                      {[
                        { label: `P ${f.protein}g`, col: "#2563EB" },
                        { label: `F ${f.fat}g`, col: "#D97706" },
                        { label: `C ${f.carb}g`, col: "#059669" },
                      ].map(({ label, col }) => (
                        <span key={label} style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: `${col}18`, color: col, fontSize: 10, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          {label}
                        </span>
                      ))}
                      {f.dairy && (
                        <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#FEF3C710", border: "1px solid #FDE68A", color: "#92400E", fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>
                          🥛 乳製品
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{f.cal}</div>
                      <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 0.5 }}>kcal</div>
                    </div>
                    <button onClick={() => addFood(f)} style={{
                      width: 28, height: 28, borderRadius: 6, background: "#111827", border: "none",
                      color: "#FFFFFF", fontSize: 20, fontWeight: 300, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0,
                    }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logged items */}
          {MEAL_SLOTS.filter(s => logs[s].length > 0).map(slot => (
            <div key={slot} style={panel}>
              <div style={panelHdr}>
                <span style={panelTitle}>{slot}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(sum(logs[slot], "cal"))} kcal
                </span>
              </div>
              {logs[slot].map(f => (
                <div key={f.uid}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, background: hoverLog === f.uid ? "#FEF2F2" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6", cursor: "default" }}
                  onMouseEnter={() => setHoverLog(f.uid)}
                  onMouseLeave={() => setHoverLog(null)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{f.name}</span>
                      {f.dairy && (
                        <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E", fontSize: 9, fontWeight: 700, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
                          🥛 乳製品
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>{f.qty}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums", minWidth: 56, textAlign: "right" }}>
                    {f.cal} kcal
                  </div>
                  <button onClick={() => removeFood(slot, f.uid)} style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: "transparent", border: "1px solid #FCA5A5",
                    color: "#DC2626", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: 6,
                  }}>×</button>
                </div>
              ))}
            </div>
          ))}

          {allItems.length === 0 && drinks.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0 24px", color: "#9CA3AF", fontSize: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>NO RECORDS</div>
              上記の検索から食品を追加してください
            </div>
          )}

          {/* Drink search */}
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>🥤 飲み物データベース</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{DRINK_DB.length}品目</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #E5E7EB", background: "#FDFDFD" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={drinkQuery}
                onChange={e => setDrinkQuery(e.target.value)}
                placeholder="飲み物を検索..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }}
              />
              {drinkQuery && (
                <button onClick={() => setDrinkQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1, fontSize: 16 }}>×</button>
              )}
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {filteredDrinks.length === 0 && (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>該当する飲み物が見つかりません</div>
              )}
              {filteredDrinks.map(d => (
                <div key={d.id}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, cursor: "pointer", background: hoverDrink === d.id ? "#F9FAFB" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={() => setHoverDrink(d.id)}
                  onMouseLeave={() => setHoverDrink(null)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{d.name}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{d.qty}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#2563EB18", color: "#2563EB", fontSize: 10, fontWeight: 700 }}>{d.ml}ml</span>
                      {d.cal > 0 && <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#D9770618", color: "#D97706", fontSize: 10, fontWeight: 700 }}>{d.cal}kcal</span>}
                      {d.caffeine > 0 && <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#7C3AED18", color: "#7C3AED", fontSize: 10, fontWeight: 700 }}>☕{d.caffeine}mg</span>}
                      {d.sugar > 0 && <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#DC262618", color: "#DC2626", fontSize: 10, fontWeight: 700 }}>糖{d.sugar}g</span>}
                    </div>
                  </div>
                  <button onClick={() => addDrink(d)} style={{
                    width: 28, height: 28, borderRadius: 6, background: "#111827", border: "none",
                    color: "#FFFFFF", fontSize: 20, fontWeight: 300, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0,
                  }}>+</button>
                </div>
              ))}
            </div>
          </div>

          {/* Logged drinks */}
          {drinks.length > 0 && (
            <div style={panel}>
              <div style={panelHdr}>
                <span style={panelTitle}>飲み物記録</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", fontVariantNumeric: "tabular-nums" }}>
                  💧{drinkTotals.ml}ml
                </span>
              </div>
              {drinks.map(d => (
                <div key={d.uid}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, background: hoverDrinkLog === d.uid ? "#EFF6FF" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={() => setHoverDrinkLog(d.uid)}
                  onMouseLeave={() => setHoverDrinkLog(null)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{d.name}</span>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>{d.qty}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", fontVariantNumeric: "tabular-nums", minWidth: 50, textAlign: "right" }}>
                    {d.ml}ml
                  </div>
                  <button onClick={() => removeDrink(d.uid)} style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: "transparent", border: "1px solid #FCA5A5",
                    color: "#DC2626", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: 6,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Reset button */}
          {(allItems.length > 0 || drinks.length > 0 || exercises.length > 0) && (
            <div style={{ padding: "12px 16px" }}>
              <button onClick={resetAll} style={{
                width: "100%", padding: "12px", borderRadius: 10,
                border: "1px solid #FCA5A5", background: "#FEF2F2",
                color: "#DC2626", fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", letterSpacing: 0.5,
              }}>🗑 本日の記録をリセット</button>
            </div>
          )}
        </div>
      )}

      {/* ── SUMMARY TAB ── */}
      {tab === "summary" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <div style={panel}>
            <div style={panelHdr}><span style={panelTitle}>栄養素摂取状況</span></div>
            <div style={{ padding: "0 16px" }}>
              <MetricRow label="エネルギー" value={totals.cal} unit="kcal" goal={goals.cal} />
              <Divider /><MetricRow label="タンパク質" value={totals.protein} unit="g" goal={goals.protein} />
              <Divider /><MetricRow label="脂質" value={totals.fat} unit="g" goal={goals.fat} />
              <Divider /><MetricRow label="炭水化物" value={totals.carb} unit="g" goal={goals.carb} />
              <Divider /><MetricRow label="食物繊維" value={totals.fiber} unit="g" goal={goals.fiber} />
              <Divider /><MetricRow label="ナトリウム" value={totals.na} unit="mg" goal={goals.na} />
            </div>
          </div>

          {/* PFC */}
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>PFCバランス</span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>推奨 P13-20% / F20-30% / C50-65%</span>
            </div>
            <div style={{ padding: 16 }}>
              {(() => {
                const pcalP = totals.protein * 4, pcalF = totals.fat * 9, pcalC = totals.carb * 4;
                const tot = pcalP + pcalF + pcalC || 1;
                const pP = (pcalP / tot * 100).toFixed(1), pF = (pcalF / tot * 100).toFixed(1), pC = (pcalC / tot * 100).toFixed(1);
                return (
                  <>
                    <div style={{ display: "flex", height: 20, borderRadius: 4, overflow: "hidden", gap: 1 }}>
                      <div style={{ width: `${pP}%`, background: "#2563EB", transition: "width 0.8s" }} />
                      <div style={{ width: `${pF}%`, background: "#D97706", transition: "width 0.8s" }} />
                      <div style={{ width: `${pC}%`, background: "#059669", transition: "width 0.8s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                      {[{ l: "タンパク質", p: pP, c: "#2563EB", cal: pcalP }, { l: "脂質", p: pF, c: "#D97706", cal: pcalF }, { l: "炭水化物", p: pC, c: "#059669", cal: pcalC }].map(x => (
                        <div key={x.l} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 2 }}>{x.l}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: x.c, fontVariantNumeric: "tabular-nums" }}>{x.p}<span style={{ fontSize: 12 }}>%</span></div>
                          <div style={{ fontSize: 10, color: "#9CA3AF" }}>{Math.round(x.cal)} kcal</div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Meal bars */}
          <div style={panel}>
            <div style={panelHdr}><span style={panelTitle}>食事別カロリー</span></div>
            <div style={{ padding: "8px 16px 12px" }}>
              {MEAL_SLOTS.map((slot, i) => {
                const cal = sum(logs[slot], "cal"), p = pct(cal, goals.cal);
                const cols = ["#FBBF24", "#34D399", "#60A5FA", "#F87171"];
                return (
                  <div key={slot} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>{slot}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>
                        {Math.round(cal)} kcal
                        <span style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 4 }}>({p.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: cols[i], width: `${p}%`, transition: "width 0.6s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ ...panel, marginBottom: 0 }}>
            <div style={panelHdr}>
              <span style={panelTitle}>摂取食品一覧</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{allItems.length}件</span>
            </div>
            {allItems.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "#9CA3AF", fontSize: 12 }}>記録なし</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["食品名", "食事", "kcal", "P(g)", "F(g)", "C(g)"].map(h => (
                        <th key={h} style={{ padding: "6px 10px", textAlign: h === "食品名" || h === "食事" ? "left" : "right", color: "#6B7280", fontWeight: 600, fontSize: 10, letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MEAL_SLOTS.flatMap(slot => logs[slot].map(f => (
                      <tr key={f.uid} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "7px 10px", color: "#374151", whiteSpace: "nowrap" }}>{f.name}</td>
                        <td style={{ padding: "7px 10px", color: "#9CA3AF", fontSize: 11 }}>{slot}</td>
                        {[f.cal, f.protein, f.fat, f.carb].map((v, i) => (
                          <td key={i} style={{ padding: "7px 10px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#374151" }}>{fmt(v)}</td>
                        ))}
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Drink summary */}
          {drinks.length > 0 && (
            <div style={panel}>
              <div style={panelHdr}><span style={panelTitle}>💧 飲み物サマリー</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#E5E7EB" }}>
                {[
                  { label: "水分量", val: `${drinkTotals.ml}`, unit: "ml", col: "#2563EB" },
                  { label: "カフェイン", val: `${fmt(drinkTotals.caffeine)}`, unit: "mg", col: "#7C3AED" },
                  { label: "糖分", val: `${fmt(drinkTotals.sugar)}`, unit: "g", col: "#DC2626" },
                ].map(({ label, val, unit, col }) => (
                  <div key={label} style={{ background: "#FFFFFF", padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums" }}>{val}</div>
                    <div style={{ fontSize: 9, color: "#CBD5E1" }}>{unit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div style={{ padding: "12px 16px" }}>
            <button onClick={saveToHistory} style={{
              width: "100%", padding: "14px", borderRadius: 10,
              border: "none", background: "#111827",
              color: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", letterSpacing: 0.5,
              transition: "opacity 0.15s",
            }}>📥 本日のデータを保存</button>
          </div>
        </div>
      )}

      {/* ── GOALS TAB ── */}
      {tab === "goals" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>目標値設定</span>
              {editGoals ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ border: "1px solid #FCA5A5", borderRadius: 8, background: "#FFFFFF", color: "#DC2626", fontSize: 12, fontWeight: 600, padding: "5px 12px", cursor: "pointer" }}
                    onClick={() => setEditGoals(false)}>キャンセル</button>
                  <button style={{ border: "none", borderRadius: 8, background: "#111827", color: "#FFF", fontSize: 12, fontWeight: 600, padding: "5px 12px", cursor: "pointer" }}
                    onClick={() => { setGoals({ ...tmpGoals }); setEditGoals(false); }}>保存</button>
                </div>
              ) : (
                <button style={{ border: "1px solid #E5E7EB", borderRadius: 8, background: "#FFFFFF", color: "#374151", fontSize: 12, fontWeight: 600, padding: "5px 12px", cursor: "pointer" }}
                  onClick={() => { setTmpGoals({ ...goals }); setEditGoals(true); }}>編集</button>
              )}
            </div>
            <div style={{ padding: "0 16px" }}>
              {[
                { key: "cal", label: "エネルギー", unit: "kcal", note: "基礎代謝＋活動量" },
                { key: "protein", label: "タンパク質", unit: "g", note: "体重×1.0〜2.0g目安" },
                { key: "fat", label: "脂質", unit: "g", note: "総エネルギーの20〜30%" },
                { key: "carb", label: "炭水化物", unit: "g", note: "総エネルギーの50〜65%" },
                { key: "fiber", label: "食物繊維", unit: "g", note: "成人推奨値 21g/日以上" },
                { key: "na", label: "ナトリウム", unit: "mg", note: "食塩換算 6g/日未満" },
              ].map(({ key, label, unit, note }, i, arr) => (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "center", padding: "12px 0", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{label}</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{note}</div>
                    </div>
                    {editGoals ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input type="number" value={tmpGoals[key]}
                          onChange={e => setTmpGoals(g => ({ ...g, [key]: Number(e.target.value) }))}
                          style={{ width: 80, padding: "5px 8px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14, fontWeight: 700, textAlign: "right", color: "#111827", fontFamily: "inherit", outline: "none" }}
                        />
                        <span style={{ fontSize: 11, color: "#9CA3AF", minWidth: 28 }}>{unit}</span>
                      </div>
                    ) : (
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{goals[key]}</span>
                        <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 3 }}>{unit}</span>
                      </div>
                    )}
                  </div>
                  {i < arr.length - 1 && <Divider />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...panel, background: "#F9FAFB" }}>
            <div style={panelHdr}><span style={panelTitle}>目標値の色分け基準</span></div>
            <div style={{ padding: "12px 16px" }}>
              {[
                { col: "#2563EB", range: "〜60%", desc: "摂取不足" },
                { col: "#16A34A", range: "60〜100%", desc: "適切範囲" },
                { col: "#D97706", range: "100〜120%", desc: "若干過剰" },
                { col: "#DC2626", range: "120%〜", desc: "過剰摂取" },
              ].map(({ col, range, desc }) => (
                <div key={range} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: col, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#374151", minWidth: 70, fontVariantNumeric: "tabular-nums" }}>{range}</span>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ── EXERCISE TAB ── */}
      {tab === "exercise" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>

          {/* Body weight input */}
          <div style={{ ...panel, marginTop: 12 }}>
            <div style={panelHdr}>
              <span style={panelTitle}>体重（消費カロリー計算用）</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              <span style={{ fontSize: 13, color: "#6B7280", flex: 1 }}>現在の体重</span>
              <input type="number" value={bodyWeight}
                onChange={e => setBodyWeight(Number(e.target.value))}
                style={{ width: 72, padding: "5px 8px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 15, fontWeight: 700, textAlign: "right", color: "#111827", fontFamily: "inherit", outline: "none" }}
              />
              <span style={{ fontSize: 13, color: "#9CA3AF" }}>kg</span>
            </div>
          </div>

          {/* Calorie balance panel */}
          <div style={{ ...panel }}>
            <div style={panelHdr}><span style={panelTitle}>カロリー収支</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#E5E7EB", margin: "0" }}>
              {[
                { label: "摂取", val: Math.round(totals.cal), col: "#374151" },
                { label: "消費", val: Math.round(burnedCal), col: "#059669" },
                { label: "純収支", val: Math.round(netCal), col: netCal > goals.cal ? "#DC2626" : "#2563EB" },
              ].map(({ label, val, col }) => (
                <div key={label} style={{ background: "#FFFFFF", padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums" }}>{val}</div>
                  <div style={{ fontSize: 9, color: "#CBD5E1" }}>kcal</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 16px" }}>
              <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  background: netCal > goals.cal ? "#DC2626" : "#16A34A",
                  width: `${Math.min(100, (netCal / goals.cal) * 100)}%`,
                  transition: "width 0.6s",
                }} />
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "right" }}>
                目標 {goals.cal} kcal に対して {Math.round((netCal / goals.cal) * 100)}%
              </div>
            </div>
          </div>

          {/* Exercise search */}
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>運動を追加</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{EXERCISE_DB.length}種目</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #E5E7EB", background: "#FDFDFD" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input value={exQuery} onChange={e => setExQuery(e.target.value)}
                placeholder="運動を検索..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }}
              />
              {exQuery && <button onClick={() => setExQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1, fontSize: 16 }}>×</button>}
            </div>
            <div style={{ maxHeight: 260, overflowY: "auto" }}>
              {EXERCISE_DB.filter(e => !exQuery.trim() || e.name.includes(exQuery)).map(ex => {
                const mins = exMinutes[ex.id] || 30;
                const burned = Math.round((ex.met * bodyWeight * 3.5 / 200) * mins);
                return (
                  <div key={ex.id}
                    style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, background: hoverEx === ex.id ? "#F9FAFB" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                    onMouseEnter={() => setHoverEx(ex.id)} onMouseLeave={() => setHoverEx(null)}
                  >
                    <div style={{ fontSize: 22, flexShrink: 0 }}>{ex.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{ex.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <input type="number" value={mins}
                          onChange={e => setExMinutes(m => ({ ...m, [ex.id]: Number(e.target.value) }))}
                          style={{ width: 46, padding: "2px 6px", border: "1px solid #E5E7EB", borderRadius: 4, fontSize: 12, fontWeight: 700, textAlign: "right", color: "#374151", fontFamily: "inherit", outline: "none" }}
                        />
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>分</span>
                        <span style={{ fontSize: 11, color: "#059669", fontWeight: 700, fontVariantNumeric: "tabular-nums", marginLeft: 4 }}>
                          −{burned} kcal
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExercises(p => [...p, { ...ex, minutes: mins, burned, uid: Date.now() + Math.random() }])}
                      style={{ width: 28, height: 28, borderRadius: 6, background: "#111827", border: "none", color: "#FFFFFF", fontSize: 20, fontWeight: 300, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0 }}
                    >+</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logged exercises */}
          {exercises.length > 0 && (
            <div style={panel}>
              <div style={panelHdr}>
                <span style={panelTitle}>本日の運動記録</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", fontVariantNumeric: "tabular-nums" }}>
                  −{Math.round(burnedCal)} kcal
                </span>
              </div>
              {exercises.map(e => (
                <div key={e.uid}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, background: hoverExLog === e.uid ? "#F0FDF4" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={() => setHoverExLog(e.uid)} onMouseLeave={() => setHoverExLog(null)}
                >
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{e.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{e.name}</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>{e.minutes}分</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", fontVariantNumeric: "tabular-nums", minWidth: 60, textAlign: "right" }}>
                    −{e.burned} kcal
                  </div>
                  <button onClick={() => setExercises(p => p.filter(x => x.uid !== e.uid))} style={{
                    width: 24, height: 24, borderRadius: 4, background: "transparent", border: "1px solid #FCA5A5",
                    color: "#DC2626", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 6,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>📋 保存済み記録</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{history.length}件</span>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#9CA3AF", fontSize: 12 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>NO HISTORY</div>
                集計タブから記録を保存してください
              </div>
            ) : (
              history.map(entry => {
                const isExpanded = expandedDate === entry.date;
                const netC = entry.totals.cal - entry.burnedCal;
                return (
                  <div key={entry.date} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <div
                      onClick={() => setExpandedDate(isExpanded ? null : entry.date)}
                      style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 10, cursor: "pointer", background: isExpanded ? "#F9FAFB" : "transparent", transition: "background 0.1s" }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{entry.date}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#374151", background: "#F3F4F6", padding: "1px 7px", borderRadius: 4 }}>{Math.round(entry.totals.cal)} kcal</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", background: "#2563EB18", padding: "1px 7px", borderRadius: 4 }}>P{fmt(entry.totals.protein)}g</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#D97706", background: "#D9770618", padding: "1px 7px", borderRadius: 4 }}>F{fmt(entry.totals.fat)}g</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#05966918", padding: "1px 7px", borderRadius: 4 }}>C{fmt(entry.totals.carb)}g</span>
                          {entry.drinkTotals.ml > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "1px 7px", borderRadius: 4 }}>💧{entry.drinkTotals.ml}ml</span>}
                        </div>
                      </div>
                      <span style={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0, transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "0 16px 12px", background: "#FAFAFA" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#E5E7EB", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
                          {[
                            { label: "摂取", val: Math.round(entry.totals.cal), unit: "kcal" },
                            { label: "消費", val: Math.round(entry.burnedCal), unit: "kcal" },
                            { label: "純収支", val: Math.round(netC), unit: "kcal" },
                          ].map(({ label, val, unit }) => (
                            <div key={label} style={{ background: "#FFFFFF", padding: "8px", textAlign: "center" }}>
                              <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1 }}>{label}</div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{val}</div>
                              <div style={{ fontSize: 9, color: "#CBD5E1" }}>{unit}</div>
                            </div>
                          ))}
                        </div>
                        {MEAL_SLOTS.filter(s => entry.logs[s]?.length > 0).map(slot => (
                          <div key={slot} style={{ marginBottom: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", letterSpacing: 1, marginBottom: 2, textTransform: "uppercase" }}>{slot}</div>
                            {entry.logs[slot].map((f, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 12, color: "#374151" }}>
                                <span>{f.name}</span>
                                <span style={{ fontVariantNumeric: "tabular-nums", color: "#6B7280" }}>{f.cal}kcal</span>
                              </div>
                            ))}
                          </div>
                        ))}
                        {entry.drinks.length > 0 && (
                          <div style={{ marginBottom: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: 1, marginBottom: 2 }}>💧 飲み物</div>
                            {entry.drinks.map((d, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 12, color: "#374151" }}>
                                <span>{d.name}</span>
                                <span style={{ fontVariantNumeric: "tabular-nums", color: "#6B7280" }}>{d.ml}ml</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {entry.exercises.length > 0 && (
                          <div style={{ marginBottom: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#059669", letterSpacing: 1, marginBottom: 2 }}>🏃 運動</div>
                            {entry.exercises.map((e, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 12, color: "#374151" }}>
                                <span>{e.icon} {e.name} ({e.minutes}分)</span>
                                <span style={{ fontVariantNumeric: "tabular-nums", color: "#059669" }}>−{e.burned}kcal</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <button onClick={() => deleteHistoryEntry(entry.date)} style={{
                          width: "100%", padding: "8px", borderRadius: 6,
                          border: "1px solid #FCA5A5", background: "#FEF2F2",
                          color: "#DC2626", fontSize: 11, fontWeight: 700, cursor: "pointer",
                          fontFamily: "inherit", marginTop: 6,
                        }}>🗑 この記録を削除</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
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
            id: "summary", label: "集計", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            )
          },
          {
            id: "goals", label: "目標", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            )
          },
          {
            id: "exercise", label: "運動", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 3a3 3 0 0 0-3 3l-7 3a3 3 0 0 0-1 0L4 8a1 1 0 0 0 0 2l3 1a3 3 0 0 0 1 0l7 3a3 3 0 1 0 .75-1.911l-7-3a3 3 0 0 0 0-.178l7-3A3 3 0 0 0 18 3z" />
              </svg>
            )
          },
          {
            id: "history", label: "履歴", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            )
          },
        ].map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, border: "none", background: "none", cursor: "pointer",
            color: tab === id ? "#111827" : "#9CA3AF", padding: "4px 12px",
            transition: "color 0.15s",
          }}>
            {icon}
            <span style={{ fontSize: 10, fontWeight: tab === id ? 700 : 400 }}>{label}</span>
            {tab === id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#111827" }} />}
          </button>
        ))}
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "#111827", color: "#FFFFFF", padding: "10px 24px",
          borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 50,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "fadeIn 0.25s ease",
        }}>{toast}</div>
      )}

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
