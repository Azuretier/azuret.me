/* ═══════════════════════════════════════════════════════════════════
   STABLE HAPPINESS v3.9 - Main Entry Point
   Intent-aware experience with modular architecture
   ═══════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useCallback, useRef } from "react";
import { COLORS, getSectionsForIntent, detectIntentCategory } from "./config";
import MainCanvas from "./MainCanvas";
import { BladeRule, TopBar, NavDots, Section, IntentBadge } from "./components";
import { createAdvancementManager } from "./advancements";
import AdvancementToast from "./AdvancementToast";

/* ═══════════════════════════════════════════════════════════════════
   INTENT DIALOG - Ask visitor for their intent
   ═══════════════════════════════════════════════════════════════════ */

function IntentDialog({ onSubmit, onSkip }) {
  const [intent, setIntent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(intent.trim());
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(4,4,10,0.95)",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{
        maxWidth: "500px",
        padding: "3rem",
        textAlign: "center",
        animation: "fadeIn 1s ease",
      }}>
        <div style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "clamp(40px, 8vw, 80px)",
          fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: `1px ${COLORS.steel}`,
          marginBottom: "1rem",
          textShadow: `0 0 60px rgba(201,168,76,0.2)`,
        }}>
          幸福
        </div>

        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(10px, 1.2vw, 13px)",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: COLORS.gold,
          opacity: 0.6,
          marginBottom: "2rem",
        }}>
          Personalize Your Journey
        </div>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(14px, 1.5vw, 18px)",
          lineHeight: 1.8,
          color: COLORS.steel,
          opacity: 0.7,
          marginBottom: "2rem",
        }}>
          Share your intention for this moment, and we will tune the experience to resonate with your purpose.
        </p>

        <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
          <input
            type="text"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="e.g., Creative focus, Calm exploration, Deep healing..."
            maxLength={80}
            style={{
              width: "100%",
              padding: "1rem 1.5rem",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${COLORS.gold}33`,
              borderRadius: "8px",
              color: COLORS.paper,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "16px",
              letterSpacing: "0.05em",
              outline: "none",
              transition: "all 0.3s ease",
              marginBottom: "1.5rem",
            }}
            onFocus={(e) => e.target.style.borderColor = `${COLORS.gold}66`}
            onBlur={(e) => e.target.style.borderColor = `${COLORS.gold}33`}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "1rem 2rem",
              background: `linear-gradient(135deg, ${COLORS.blood}88, ${COLORS.gold}44)`,
              border: `1px solid ${COLORS.gold}44`,
              borderRadius: "8px",
              color: COLORS.paper,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "14px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.4s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = `0 8px 30px rgba(201,168,76,0.25)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Begin Experience
          </button>
        </form>

        <button
          onClick={onSkip}
          style={{
            background: "none",
            border: "none",
            color: COLORS.steel,
            opacity: 0.4,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "12px",
            letterSpacing: "0.15em",
            cursor: "pointer",
            transition: "opacity 0.3s ease",
          }}
          onMouseEnter={(e) => e.target.style.opacity = 0.7}
          onMouseLeave={(e) => e.target.style.opacity = 0.4}
        >
          Skip personalization
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════ */

export default function KatanaFairyTypewriter() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showIntentDialog, setShowIntentDialog] = useState(true);
  const [userIntent, setUserIntent] = useState("");
  const [sections, setSections] = useState(() => getSectionsForIntent(""));

  // Advancement system
  const advManagerRef = useRef(null);
  if (!advManagerRef.current) {
    advManagerRef.current = createAdvancementManager((adv) => {
      if (window.__advancementToast) window.__advancementToast(adv);
    });
  }

  // Handle intent submission
  const handleIntentSubmit = useCallback((intent) => {
    setUserIntent(intent);
    setSections(getSectionsForIntent(intent));
    setShowIntentDialog(false);
    const category = detectIntentCategory(intent);
    advManagerRef.current.onExperienceStart();
    if (intent) advManagerRef.current.onIntentSubmit(category);
  }, []);

  // Skip intent dialog
  const handleIntentSkip = useCallback(() => {
    setShowIntentDialog(false);
    advManagerRef.current.onExperienceStart();
  }, []);

  // Load fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Noto+Serif+JP:wght@400;700;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setLoaded(true), 600);
  }, []);

  // Scroll handling
  useEffect(() => {
    const onScroll = () => {
      const st = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      const sp = dh > 0 ? st / dh : 0;
      setScrollProgress(sp);
      setActiveSection(Math.min(sections.length - 1, Math.max(0, Math.round(st / window.innerHeight))));
      // Advancement: scroll bottom
      advManagerRef.current.onScrollBottom(sp);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections.length]);

  // Advancement: track active section and patient observer timer
  useEffect(() => {
    if (showIntentDialog) return;
    advManagerRef.current.onSectionActive(activeSection);
    const interval = setInterval(() => {
      advManagerRef.current.onSectionActive(activeSection);
    }, 2000);
    return () => clearInterval(interval);
  }, [activeSection, showIntentDialog]);

  // Get current intent category for badge
  const intentCategory = detectIntentCategory(userIntent);

  return <div style={{
    background: COLORS.void, color: COLORS.paper, minHeight: "100vh",
    overflowX: "hidden", cursor: "crosshair",
    opacity: loaded ? 1 : 0, transition: "opacity 2s ease",
  }}>
    <style>{`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { background: ${COLORS.void}; overflow-x: hidden; }
      ::selection { background: ${COLORS.blood}; color: ${COLORS.paper}; }
      a { text-decoration: none; }
      @keyframes slashReveal { 0%{width:0%;opacity:0} 50%{width:120%;opacity:0.55} 100%{width:120%;opacity:0.25} }
      @keyframes scrollDown { 0%,100%{transform:translateY(0);opacity:0.2} 50%{transform:translateY(14px);opacity:0.6} }
      @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      .scroll-blade { position:fixed; top:0; left:0; height:2px; z-index:30;
        background:linear-gradient(90deg,${COLORS.blood},${COLORS.gold},${COLORS.blood});
        transition:width 0.1s ease-out;
        box-shadow:0 0 12px rgba(139,26,26,0.5),0 0 40px rgba(201,168,76,0.15); }
      .noise-overlay { position:fixed; top:0;left:0;right:0;bottom:0; z-index:3;
        pointer-events:none; opacity:0.022;
        background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size:256px 256px; }
      .vignette { position:fixed; top:0;left:0;right:0;bottom:0; z-index:3;
        pointer-events:none;
        background:radial-gradient(ellipse at center,transparent 28%,rgba(4,4,10,0.9) 100%); }
    `}</style>

    <AdvancementToast />

    {showIntentDialog && (
      <IntentDialog onSubmit={handleIntentSubmit} onSkip={handleIntentSkip} />
    )}

    {!showIntentDialog && (
      <>
        <MainCanvas scrollProgress={scrollProgress} activeSection={activeSection} sections={sections} />
        <div className="noise-overlay" />
        <div className="vignette" />
        <div className="scroll-blade" style={{ width: `${scrollProgress * 100}%` }} />

        <TopBar />
        <NavDots activeSection={activeSection} sections={sections} />
        <IntentBadge intentCategory={intentCategory} />

        <div style={{ position: "fixed", right: "2.5vw", top: "50%", transform: "translateY(-50%)", zIndex: 10, writingMode: "vertical-rl", fontFamily: "'Noto Serif JP', serif", fontSize: "clamp(11px, 1.1vw, 15px)", color: COLORS.gold, opacity: 0.15, letterSpacing: "0.5em", userSelect: "none", textShadow: "0 0 25px rgba(201,168,76,0.25)" }}>安定した幸福の道</div>

        <div style={{ position: "fixed", bottom: "3vh", right: "3vw", zIndex: 10, width: "50px", height: "50px", border: `1.5px solid ${COLORS.blood}`, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Serif JP', serif", fontSize: "19px", color: COLORS.blood, opacity: 0.35, transform: "rotate(-5deg)", userSelect: "none", boxShadow: "0 0 20px rgba(139,26,26,0.12)" }}>幸</div>

        {sections.map((s, i) => (
          <Section key={s.id} data={s} index={i} activeSection={activeSection} />
        ))}

        <footer style={{ padding: "3.5rem 8vw", textAlign: "center", position: "relative", zIndex: 4 }}>
          <BladeRule width="55px" color={COLORS.gold} style={{ margin: "0 auto 1.2rem" }} />
          <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "13px", color: COLORS.steel, opacity: 0.18, letterSpacing: "0.2em" }}>一期一会 — One moment, one meeting</p>
        </footer>
      </>
    )}
  </div>;
}
