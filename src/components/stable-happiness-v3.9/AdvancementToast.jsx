/* ═══════════════════════════════════════════════════════════════════
   ADVANCEMENT TOAST - Minecraft-style advancement popup
   Slides in from the top when a player earns an advancement
   ═══════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useCallback, useRef } from "react";
import { COLORS } from "./config";

const TOAST_DURATION = 4000;
const ANIMATION_DURATION = 500;

function SingleToast({ advancement, onDone }) {
    const [phase, setPhase] = useState("enter"); // enter | visible | exit

    useEffect(() => {
        const enterTimer = setTimeout(() => setPhase("visible"), ANIMATION_DURATION);
        const exitTimer = setTimeout(() => setPhase("exit"), TOAST_DURATION - ANIMATION_DURATION);
        const doneTimer = setTimeout(onDone, TOAST_DURATION);
        return () => {
            clearTimeout(enterTimer);
            clearTimeout(exitTimer);
            clearTimeout(doneTimer);
        };
    }, [onDone]);

    const translateY = phase === "enter" ? "-120%" : phase === "exit" ? "-120%" : "0";
    const opacity = phase === "visible" ? 1 : 0;

    return (
        <div
            style={{
                transform: `translateX(-50%) translateY(${translateY})`,
                opacity,
                transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${ANIMATION_DURATION}ms ease`,
                position: "fixed",
                top: "32px",
                left: "50%",
                zIndex: 200,
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 22px 12px 16px",
                    background: "linear-gradient(135deg, rgba(20, 16, 8, 0.96), rgba(30, 24, 14, 0.94))",
                    border: `1.5px solid ${COLORS.gold}55`,
                    borderRadius: "6px",
                    boxShadow: `0 4px 32px rgba(0,0,0,0.6), 0 0 24px ${COLORS.gold}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
                    backdropFilter: "blur(16px)",
                    minWidth: "280px",
                    maxWidth: "420px",
                }}
            >
                {/* Icon frame */}
                <div
                    style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "4px",
                        border: `1.5px solid ${COLORS.gold}44`,
                        background: `linear-gradient(135deg, rgba(201,168,76,0.12), rgba(139,26,26,0.08))`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        flexShrink: 0,
                        boxShadow: `inset 0 0 12px ${COLORS.gold}10`,
                    }}
                >
                    {advancement.icon}
                </div>

                {/* Text */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                    <div
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "10px",
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: COLORS.gold,
                            opacity: 0.75,
                        }}
                    >
                        Advancement Made!
                    </div>
                    <div
                        style={{
                            fontFamily: "'Noto Serif JP', serif",
                            fontSize: "15px",
                            fontWeight: 700,
                            color: COLORS.paper,
                            letterSpacing: "0.08em",
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {advancement.title}
                    </div>
                    <div
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "12px",
                            color: COLORS.steel,
                            opacity: 0.55,
                            letterSpacing: "0.06em",
                        }}
                    >
                        {advancement.description}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdvancementToast() {
    const [queue, setQueue] = useState([]);
    const [current, setCurrent] = useState(null);
    const processingRef = useRef(false);

    // Process queue
    useEffect(() => {
        if (!current && queue.length > 0 && !processingRef.current) {
            processingRef.current = true;
            setCurrent(queue[0]);
            setQueue((q) => q.slice(1));
        }
    }, [queue, current]);

    const handleDone = useCallback(() => {
        setCurrent(null);
        processingRef.current = false;
    }, []);

    // Expose push method via window for the advancement manager
    useEffect(() => {
        window.__advancementToast = (advancement) => {
            setQueue((q) => [...q, advancement]);
        };
        return () => {
            delete window.__advancementToast;
        };
    }, []);

    if (!current) return null;

    return <SingleToast key={current.id} advancement={current} onDone={handleDone} />;
}
