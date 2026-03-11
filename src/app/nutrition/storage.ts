/**
 * Storage abstraction for the Nutrition App.
 *
 * Current implementation: localStorage
 * Future: swap LocalStorageProvider with a FirestoreProvider
 * that implements the same NutritionStorage interface.
 */

// ─── Types (shared with NutritionApp) ───

export interface Food {
    id: number; name: string; qty: string;
    cal: number; protein: number; fat: number; carb: number;
    fiber: number; na: number; dairy?: boolean;
}

export interface Exercise {
    id: number; name: string; met: number; unit: string; icon: string;
}

export interface FoodLog extends Food { uid: number }
export interface ExerciseLog extends Exercise { minutes: number; burned: number; uid: number }
export interface Logs { [key: string]: FoodLog[] }

export interface Drink {
    id: number; name: string; qty: string; ml: number;
    cal: number; sugar: number; caffeine: number;
}
export interface DrinkLog extends Drink { uid: number }

export interface DrinkTotals { ml: number; cal: number; sugar: number; caffeine: number }
export interface NutritionTotals { cal: number; protein: number; fat: number; carb: number; fiber: number; na: number }

export interface HistoryEntry {
    date: string; logs: Logs; exercises: ExerciseLog[]; drinks: DrinkLog[];
    totals: NutritionTotals; drinkTotals: DrinkTotals; burnedCal: number;
}

export interface HamaSushiItem extends Food {
    category: "nigiri" | "gunkan" | "side";
}

export interface TondenItem extends Food {
    category: "gozen" | "sushi" | "don" | "soba_udon" | "single";
}

// ─── Session state shape ───

export interface NutritionSessionData {
    logs: Logs;
    exercises: ExerciseLog[];
    drinks: DrinkLog[];
    goals: Record<string, number>;
    bodyWeight: number;
}

// ─── Storage interface ───

export interface NutritionStorage {
    /** Load session data for today. Returns null if none saved. */
    loadSession(): NutritionSessionData | null;

    /** Persist session data for today. */
    saveSession(data: NutritionSessionData): void;

    /** Load history entries. */
    loadHistory(): HistoryEntry[];

    /** Save a history entry (upserts by date). */
    saveHistory(entries: HistoryEntry[]): void;
}

// ─── localStorage implementation ───

const STORAGE_KEYS = {
    session: "nutrition-session",
    sessionDate: "nutrition-session-date",
    history: "nutrition-history",
} as const;

function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

export class LocalStorageProvider implements NutritionStorage {
    loadSession(): NutritionSessionData | null {
        try {
            const savedDate = localStorage.getItem(STORAGE_KEYS.sessionDate);
            // Only restore if the saved session is from today
            if (savedDate !== todayStr()) {
                localStorage.removeItem(STORAGE_KEYS.session);
                localStorage.removeItem(STORAGE_KEYS.sessionDate);
                return null;
            }
            const raw = localStorage.getItem(STORAGE_KEYS.session);
            if (!raw) return null;
            return JSON.parse(raw) as NutritionSessionData;
        } catch {
            return null;
        }
    }

    saveSession(data: NutritionSessionData): void {
        try {
            localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(data));
            localStorage.setItem(STORAGE_KEYS.sessionDate, todayStr());
        } catch { /* quota exceeded, etc. */ }
    }

    loadHistory(): HistoryEntry[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.history);
            if (!raw) return [];
            return JSON.parse(raw) as HistoryEntry[];
        } catch {
            return [];
        }
    }

    saveHistory(entries: HistoryEntry[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(entries));
        } catch { /* ignore */ }
    }
}

// ─── Default singleton ───

export const storage: NutritionStorage = new LocalStorageProvider();
