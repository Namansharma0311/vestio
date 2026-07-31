import React, { useState, useEffect, useRef } from "react";

export default function PixelSplash({ onComplete }) {
  const [phase, setPhase] = useState("scaleIn"); // scaleIn -> hold -> fadeout -> done
  const [opacity, setOpacity] = useState(1);
  const [iconScale, setIconScale] = useState(0.5);
  const [iconOpacity, setIconOpacity] = useState(0);
  const [taglineOpacity, setTaglineOpacity] = useState(0);

  useEffect(() => {
    let raf;
    let start = null;
    const duration = 500;

    function animate(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setIconScale(0.5 + 0.5 * ease);
      setIconOpacity(ease);
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setPhase("hold");
      }
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase === "hold") {
      const t1 = setTimeout(() => setTaglineOpacity(1), 200);
      const t2 = setTimeout(() => setPhase("fadeout"), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (phase === "fadeout") {
      let raf;
      let start = null;
      const duration = 350;
      function fade(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        setOpacity(1 - progress);
        if (progress < 1) {
          raf = requestAnimationFrame(fade);
        } else {
          setPhase("done");
          onComplete?.();
        }
      }
      raf = requestAnimationFrame(fade);
      return () => cancelAnimationFrame(raf);
    }
  }, [phase, onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center flex-col"
      style={{ background: "#1a1a2e", opacity }}
    >
      <div
        style={{
          transform: `scale(${iconScale})`,
          opacity: iconOpacity,
          transition: phase === "fadeout" ? "none" : undefined,
        }}
      >
        <img
          src="/icon.png"
          alt="VESTIO"
          className="w-28 h-28 object-contain"
          style={{ imageRendering: "auto", filter: "drop-shadow(0 8px 32px rgba(144,238,144,0.3))" }}
        />
      </div>
      <p
        className="text-white/40 text-xs mt-5 font-body tracking-[0.3em] uppercase"
        style={{
          opacity: taglineOpacity,
          transition: "opacity 0.3s ease",
        }}
      >
        your digital closet
      </p>
    </div>
  );
}
