/* ═══════════════════════════════════════════════════════════════════
   UI COMPONENTS - React UI Components
   ═══════════════════════════════════════════════════════════════════ */

import { COLORS } from "./config";

export function BladeRule({ width = "80px", color = COLORS.blood, style = {} }) {
    return <div style={{ width, height: "1px", background: `linear-gradient(90deg, transparent, ${color}, transparent)`, margin: "1.5rem 0", ...style }} />;
}

export function TopBar() {
    return <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 20, padding: "1.5rem 3vw", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to bottom, rgba(4,4,10,0.95), transparent)", pointerEvents: "none" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(11px, 1vw, 13px)", letterSpacing: "0.35em", textTransform: "uppercase", color: COLORS.steel, opacity: 0.5 }}>安定した幸福</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(10px, 0.9vw, 12px)", letterSpacing: "0.3em", textTransform: "uppercase", color: COLORS.gold, opacity: 0.3 }}>Stable Happiness</div>
    </header>;
}

export function NavDots({ activeSection, sections }) {
    return <nav style={{ position: "fixed", left: "2vw", top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: "14px" }}>
        {sections.map((s, i) => {
            const active = activeSection === i;
            const a = s.fairy.aura;
            const r = (a >> 16) & 0xFF, g = (a >> 8) & 0xFF, b = a & 0xFF;
            return <a key={s.id} href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
                style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", textDecoration: "none" }}>
                <div style={{
                    width: active ? "28px" : "7px", height: "7px", borderRadius: "4px",
                    background: active ? `rgb(${r},${g},${b})` : "rgba(200,196,186,0.1)",
                    transition: "all 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
                    boxShadow: active ? `0 0 16px rgba(${r},${g},${b},0.5)` : "none",
                }} />
                {active && <span style={{
                    fontFamily: "'Cormorant Garamond', serif", fontSize: "10px", letterSpacing: "0.2em",
                    textTransform: "uppercase", color: `rgba(${r},${g},${b},0.65)`, whiteSpace: "nowrap",
                    animation: "fadeIn 0.5s ease",
                }}>{s.fairy.name}</span>}
            </a>;
        })}
    </nav>;
}

export function Section({ data, index, activeSection }) {
    const isActive = activeSection === index;
    const isHero = index === 0;
    const fc = data.fairy.color;
    const rgb = `${Math.round(fc[0] * 255)},${Math.round(fc[1] * 255)},${Math.round(fc[2] * 255)}`;

    return <section id={data.id} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "flex-start", padding: "0 8vw", position: "relative", zIndex: 4 }}>
        <div style={{
            maxWidth: isHero ? "680px" : "500px",
            marginLeft: isHero ? "auto" : index % 2 === 0 ? "0" : "auto",
            marginRight: isHero ? "auto" : index % 2 !== 0 ? "0" : "auto",
            textAlign: isHero ? "center" : "left",
            opacity: isActive ? 1 : 0.04,
            transform: isActive ? "translateY(0) scale(1)" : "translateY(50px) scale(0.97)",
            transition: "opacity 1.2s cubic-bezier(0.25,0.46,0.45,0.94), transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}>
            {!isHero && <div style={{
                display: "inline-block", padding: "3px 12px", marginBottom: "0.8rem",
                border: `1px solid rgba(${rgb},0.2)`, borderRadius: "20px",
                fontFamily: "'Cormorant Garamond', serif", fontSize: "10px",
                letterSpacing: "0.25em", textTransform: "uppercase",
                color: `rgba(${rgb},0.55)`, boxShadow: `0 0 15px rgba(${rgb},0.06)`,
            }}>{data.fairy.name}</div>}

            <div style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: isHero ? "clamp(80px, 14vw, 200px)" : "clamp(55px, 10vw, 140px)",
                fontWeight: 900, color: "transparent",
                WebkitTextStroke: isHero ? `1.5px ${COLORS.steel}` : `1px rgba(${rgb},0.5)`,
                lineHeight: 1, marginBottom: "0.15em",
                textShadow: `0 0 80px rgba(${rgb},${isHero ? 0.3 : 0.12})`, position: "relative",
            }}>
                {data.kanji}
                {isHero && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "120%", height: "2px", background: `linear-gradient(90deg, transparent, ${COLORS.blood}, transparent)`, opacity: 0.4, animation: "slashReveal 2.5s ease-out forwards" }} />}
            </div>

            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(10px, 1.2vw, 14px)", textTransform: "uppercase", letterSpacing: "0.45em", color: `rgba(${rgb},0.6)`, marginBottom: "0.4rem" }}>{data.romaji}</div>

            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isHero ? "clamp(22px, 3.2vw, 44px)" : "clamp(17px, 2.3vw, 32px)", fontWeight: 300, color: COLORS.paper, letterSpacing: "0.12em", marginBottom: "0.8rem" }}>{data.english}</h2>

            <BladeRule width={isHero ? "110px" : "70px"} color={isHero ? COLORS.blood : `rgba(${rgb},0.45)`} style={isHero ? { margin: "1.2rem auto" } : {}} />

            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(14px, 1.5vw, 18px)", lineHeight: 1.9, color: COLORS.steel, opacity: 0.6, fontWeight: 300, maxWidth: "460px" }}>{data.body}</p>

            {isHero && <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", opacity: 0.25 }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: COLORS.steel }}>Scroll</span>
                <div style={{ width: "1px", height: "36px", background: `linear-gradient(to bottom, ${COLORS.steel}, transparent)`, animation: "scrollDown 2.5s ease-in-out infinite" }} />
            </div>}
        </div>
    </section>;
}

export function IntentBadge({ intentCategory }) {
    if (!intentCategory || intentCategory === "default") return null;

    const categoryLabels = {
        creativity: "Creative Mode",
        focus: "Focus Mode",
        calm: "Calm Mode",
        exploration: "Explorer Mode",
        healing: "Healing Mode",
    };

    const categoryColors = {
        creativity: "#ff9966",
        focus: "#66aaff",
        calm: "#88ddaa",
        exploration: "#ffcc44",
        healing: "#dd88dd",
    };

    return <div style={{
        position: "fixed",
        bottom: "3vh",
        left: "3vw",
        zIndex: 25,
        padding: "6px 14px",
        background: "rgba(4,4,10,0.85)",
        border: `1px solid ${categoryColors[intentCategory]}33`,
        borderRadius: "20px",
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "10px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: categoryColors[intentCategory],
        boxShadow: `0 0 20px ${categoryColors[intentCategory]}22`,
        backdropFilter: "blur(8px)",
    }}>
        {categoryLabels[intentCategory]}
    </div>;
}
