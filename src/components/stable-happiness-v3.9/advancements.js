/* ═══════════════════════════════════════════════════════════════════
   ADVANCEMENTS - Minecraft-style advancement system
   Tracks player actions and awards advancements when criteria are met
   ═══════════════════════════════════════════════════════════════════ */

export const ADVANCEMENTS = {
    first_steps: {
        id: "first_steps",
        title: "はじめの一歩",
        description: "Enter the experience",
        icon: "🌸",
        category: "journey",
    },
    souls_purpose: {
        id: "souls_purpose",
        title: "魂の目的",
        description: "Share your intention",
        icon: "✨",
        category: "journey",
    },
    water_spirit: {
        id: "water_spirit",
        title: "水の精霊",
        description: "Encounter the Water Spirit",
        icon: "💧",
        category: "spirits",
    },
    sun_spirit: {
        id: "sun_spirit",
        title: "陽の精霊",
        description: "Encounter the Sun Spirit",
        icon: "☀",
        category: "spirits",
    },
    wind_spirit: {
        id: "wind_spirit",
        title: "風の精霊",
        description: "Encounter the Wind Spirit",
        icon: "🍃",
        category: "spirits",
    },
    fire_spirit: {
        id: "fire_spirit",
        title: "火の精霊",
        description: "Encounter the Fire Spirit",
        icon: "🔥",
        category: "spirits",
    },
    moon_spirit: {
        id: "moon_spirit",
        title: "月の精霊",
        description: "Encounter the Moon Spirit",
        icon: "🌙",
        category: "spirits",
    },
    all_spirits: {
        id: "all_spirits",
        title: "五精霊の邂逅",
        description: "Encounter all five spirits",
        icon: "⛩",
        category: "spirits",
    },
    the_journey: {
        id: "the_journey",
        title: "旅の果て",
        description: "Reach the end of the scroll",
        icon: "🗡",
        category: "journey",
    },
    creative_soul: {
        id: "creative_soul",
        title: "創造の魂",
        description: "Enter Creative Mode",
        icon: "🎨",
        category: "intent",
    },
    focused_mind: {
        id: "focused_mind",
        title: "集中の心",
        description: "Enter Focus Mode",
        icon: "🎯",
        category: "intent",
    },
    calm_spirit: {
        id: "calm_spirit",
        title: "静穏の霊",
        description: "Enter Calm Mode",
        icon: "🧘",
        category: "intent",
    },
    explorer_heart: {
        id: "explorer_heart",
        title: "探検の心",
        description: "Enter Explorer Mode",
        icon: "🧭",
        category: "intent",
    },
    healer_touch: {
        id: "healer_touch",
        title: "癒しの手",
        description: "Enter Healing Mode",
        icon: "💜",
        category: "intent",
    },
    patient_observer: {
        id: "patient_observer",
        title: "忍耐の観察者",
        description: "Stay with a spirit for 30 seconds",
        icon: "👁",
        category: "journey",
    },
};

// Maps section index to spirit advancement id
const SECTION_SPIRIT_MAP = [
    "water_spirit",
    "sun_spirit",
    "wind_spirit",
    "fire_spirit",
    "moon_spirit",
];

// Maps intent category to advancement id
const INTENT_ADVANCEMENT_MAP = {
    creativity: "creative_soul",
    focus: "focused_mind",
    calm: "calm_spirit",
    exploration: "explorer_heart",
    healing: "healer_touch",
};

const STORAGE_KEY = "sh_advancements";

/**
 * Creates an advancement manager that tracks state and fires callbacks
 * @param {function} onAdvancement - Called with advancement data when earned
 * @returns {object} - Manager with action methods
 */
export function createAdvancementManager(onAdvancement) {
    // Load saved state
    let earned = {};
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) earned = JSON.parse(saved);
    } catch {
        earned = {};
    }

    const visitedSections = new Set();
    let sectionTimer = { section: -1, start: 0 };

    function award(id) {
        if (earned[id]) return;
        const adv = ADVANCEMENTS[id];
        if (!adv) return;
        earned[id] = Date.now();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(earned));
        } catch { /* ignore */ }
        onAdvancement(adv);
    }

    function isEarned(id) {
        return !!earned[id];
    }

    return {
        /** Call when the experience begins (intent submitted or skipped) */
        onExperienceStart() {
            award("first_steps");
        },

        /** Call when user submits an intent (not skipped) */
        onIntentSubmit(intentCategory) {
            award("souls_purpose");
            const advId = INTENT_ADVANCEMENT_MAP[intentCategory];
            if (advId) award(advId);
        },

        /** Call on each frame/tick with the currently active section index */
        onSectionActive(sectionIndex) {
            // Spirit encounter
            const spiritId = SECTION_SPIRIT_MAP[sectionIndex];
            if (spiritId && !isEarned(spiritId)) {
                visitedSections.add(sectionIndex);
                award(spiritId);

                // Check if all spirits visited
                if (visitedSections.size >= 5 && !isEarned("all_spirits")) {
                    award("all_spirits");
                }
            } else {
                visitedSections.add(sectionIndex);
                if (visitedSections.size >= 5 && !isEarned("all_spirits")) {
                    award("all_spirits");
                }
            }

            // Patient observer timer
            if (sectionIndex !== sectionTimer.section) {
                sectionTimer.section = sectionIndex;
                sectionTimer.start = Date.now();
            } else if (!isEarned("patient_observer")) {
                if (Date.now() - sectionTimer.start >= 30000) {
                    award("patient_observer");
                }
            }
        },

        /** Call when scroll reaches the bottom */
        onScrollBottom(scrollProgress) {
            if (scrollProgress >= 0.95 && !isEarned("the_journey")) {
                award("the_journey");
            }
        },

        /** Get all earned advancement ids */
        getEarned() {
            return { ...earned };
        },
    };
}
