/* ═══════════════════════════════════════════════════════════════════
   CONFIG - Colors, Sections & Intent-Based Content
   ═══════════════════════════════════════════════════════════════════ */

export const COLORS = {
    void: "#04040a",
    steel: "#c4c4c8",
    blood: "#8b1a1a",
    gold: "#c9a84c",
    paper: "#e8e0d0",
};

// Intent categories and their corresponding content variations
export const INTENT_CONTENT = {
    // Default/neutral intent
    default: {
        hero: {
            body: "Like the stillness of a blade at rest — true power lies not in motion, but in the unwavering calm before it.",
        },
        happiness: {
            body: "Not the fleeting spark of pleasure, but the deep ember that warms without burning.",
        },
        balance: {
            body: "The katana's edge exists between two planes — stable happiness lives in equilibrium.",
        },
        forging: {
            body: "A blade is folded a thousand times. Happiness is forged through what we endure and release.",
        },
        stillness: {
            body: "In the silence after the cut, truth is revealed. The silence you carry within storms.",
        },
    },

    // Creative/artistic intent
    creativity: {
        hero: {
            body: "Creation begins in stillness — the blank canvas, the uncut stone, the silent breath before the first stroke.",
        },
        happiness: {
            body: "Joy flows through the act of making — each creation a mirror reflecting your inner light.",
        },
        balance: {
            body: "Between vision and execution lies the dance of mastery — where imagination meets craftsmanship.",
        },
        forging: {
            body: "Every masterpiece endures the fire of revision. Your art is forged in the crucible of dedication.",
        },
        stillness: {
            body: "In the pause between inspiration and action, genius awakens. Trust the creative silence.",
        },
    },

    // Focus/productivity intent
    focus: {
        hero: {
            body: "Deep focus is the blade that cuts through chaos — sharpen your attention, master your domain.",
        },
        happiness: {
            body: "True fulfillment emerges from flow — the state where effort becomes effortless presence.",
        },
        balance: {
            body: "Productivity and peace are not opposites — they are partners in the dance of meaningful work.",
        },
        forging: {
            body: "Excellence is forged through deliberate practice. Each focused hour compounds into mastery.",
        },
        stillness: {
            body: "Before the storm of productivity, find your center. From stillness springs sustainable action.",
        },
    },

    // Calm/relaxation intent
    calm: {
        hero: {
            body: "Let the waves of thought settle. In the calm depths, clarity awaits like a patient friend.",
        },
        happiness: {
            body: "Happiness is not found in the chase — it arrives when you stop running and simply breathe.",
        },
        balance: {
            body: "Rest is not the absence of progress — it is the foundation upon which growth is built.",
        },
        forging: {
            body: "Even the strongest blade needs time to cool. Your peace is forged in moments of gentle restoration.",
        },
        stillness: {
            body: "Embrace the quiet. In the sanctuary of stillness, your spirit remembers its natural rhythm.",
        },
    },

    // Exploration/curiosity intent
    exploration: {
        hero: {
            body: "Every journey begins with a single step into the unknown — stability comes from trusting the path.",
        },
        happiness: {
            body: "Wonder is the compass of the soul — follow your curiosity to discover unexpected joy.",
        },
        balance: {
            body: "Between the known and unknown lies the edge of growth — balance gives you courage to explore.",
        },
        forging: {
            body: "The explorer's spirit is forged through countless horizons. Each discovery shapes who you become.",
        },
        stillness: {
            body: "In the pause before discovery, anticipation blooms. The greatest adventures begin in contemplation.",
        },
    },

    // Healing/recovery intent
    healing: {
        hero: {
            body: "Healing is not a destination — it is the gentle art of returning to yourself, one breath at a time.",
        },
        happiness: {
            body: "Your wounds are not weaknesses — they are the spaces where light enters to transform you.",
        },
        balance: {
            body: "Recovery honors both strength and vulnerability — the balance of accepting what was and embracing what is.",
        },
        forging: {
            body: "Like gold refined by fire, your resilience is forged through trials. You emerge stronger, more luminous.",
        },
        stillness: {
            body: "In the quiet of healing, seeds of renewal take root. Trust the process. Trust yourself.",
        },
    },
};

// Base sections configuration
const BASE_SECTIONS = [
    {
        id: "hero",
        kanji: "安定",
        romaji: "Antei",
        english: "Stability",
        fairy: {
            color: [0.3, 0.6, 1.0],
            aura: 0x4488ff,
            sword: 0x6699cc,
            name: "水 Water Spirit",
        },
    },
    {
        id: "happiness",
        kanji: "幸福",
        romaji: "Kōfuku",
        english: "Happiness",
        fairy: {
            color: [1.0, 0.75, 0.2],
            aura: 0xffcc33,
            sword: 0xddaa22,
            name: "陽 Sun Spirit",
        },
    },
    {
        id: "balance",
        kanji: "均衡",
        romaji: "Kinkō",
        english: "Balance",
        fairy: {
            color: [0.4, 1.0, 0.6],
            aura: 0x44ff88,
            sword: 0x44cc66,
            name: "風 Wind Spirit",
        },
    },
    {
        id: "forging",
        kanji: "鍛造",
        romaji: "Tanzō",
        english: "Forging",
        fairy: {
            color: [1.0, 0.3, 0.15],
            aura: 0xff4422,
            sword: 0xcc3311,
            name: "火 Fire Spirit",
        },
    },
    {
        id: "stillness",
        kanji: "静寂",
        romaji: "Seijaku",
        english: "Stillness",
        fairy: {
            color: [0.85, 0.55, 0.85],
            aura: 0xdd88dd,
            sword: 0xbb66bb,
            name: "月 Moon Spirit",
        },
    },
];

/**
 * Detects the intent category from user input
 * @param {string} intentText - Raw intent text from user
 * @returns {string} - Intent category key
 */
export function detectIntentCategory(intentText) {
    if (!intentText) return "default";

    const text = intentText.toLowerCase();

    // Keywords for each intent category
    const intentKeywords = {
        creativity: [
            "creat", "art", "design", "inspir", "imagin", "make", "build", "craft",
            "write", "draw", "paint", "music", "compose", "invent", "innovate",
            "express", "artistic", "creative", "making", "creating"
        ],
        focus: [
            "focus", "product", "work", "concentrat", "study", "learn", "efficien",
            "accomplish", "achieve", "goal", "task", "deep work", "flow", "perform",
            "deadline", "project", "coding", "develop"
        ],
        calm: [
            "calm", "relax", "peace", "quiet", "rest", "serene", "tranquil", "unwind",
            "destress", "meditat", "mindful", "breathe", "gentle", "soft", "ease",
            "sooth", "comfort", "chill", "zen"
        ],
        exploration: [
            "explor", "discover", "curious", "wonder", "learn", "journey", "adventure",
            "new", "unknown", "search", "find", "understand", "grow", "expand",
            "question", "seek", "wander"
        ],
        healing: [
            "heal", "recover", "restor", "renew", "comfort", "support", "grief",
            "pain", "loss", "hope", "strength", "resilience", "transform", "release",
            "let go", "accept", "overcome", "therapy", "wellness"
        ],
    };

    // Score each category
    let bestCategory = "default";
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(intentKeywords)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                score += 1;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
        }
    }

    return bestScore > 0 ? bestCategory : "default";
}

/**
 * Returns sections with content optimized for the given intent
 * @param {string} intentText - Raw intent text from user
 * @returns {Array} - Sections array with customized content
 */
export function getSectionsForIntent(intentText) {
    const category = detectIntentCategory(intentText);
    const content = INTENT_CONTENT[category] || INTENT_CONTENT.default;

    return BASE_SECTIONS.map((section) => ({
        ...section,
        body: content[section.id]?.body || INTENT_CONTENT.default[section.id].body,
        intentCategory: category,
    }));
}

// Default export for backwards compatibility
export const SECTIONS = getSectionsForIntent("");
