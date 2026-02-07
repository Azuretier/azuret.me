/* ═══════════════════════════════════════════════════════════════════
   STABLE HAPPINESS v3.9 - Module Index
   ═══════════════════════════════════════════════════════════════════ */

// Main component export
export { default } from "./main";
export { default as KatanaFairyTypewriter } from "./main";

// Config and utilities
export { COLORS, SECTIONS, getSectionsForIntent, detectIntentCategory, INTENT_CONTENT } from "./config";

// UI Components
export { BladeRule, TopBar, NavDots, Section, IntentBadge } from "./components";

// MainCanvas component
export { default as MainCanvas } from "./MainCanvas";

// Builders for custom scenes
export {
    buildVoxelWorld,
    buildBoardEdgeGlow,
    createSword,
    buildFairyAura,
    buildFairyCore,
    buildFlourish,
    buildSparkExplosion,
    buildAmbient,
    buildTextSystem,
} from "./builders";

// Shaders for custom effects
export {
    TEXT_VERT, TEXT_FRAG,
    KANJI_VERT, KANJI_FRAG,
    FAIRY_VERT, FAIRY_FRAG,
    FLOURISH_VERT, FLOURISH_FRAG,
    SPARK_VERT, SPARK_FRAG,
    EDGE_GLOW_VERT, EDGE_GLOW_FRAG,
    AMB_VERT, AMB_FRAG,
} from "./shaders";

// Utilities
export { renderTextToCanvas, renderKanjiCanvas } from "./utils";
