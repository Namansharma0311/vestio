import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

const FADE_IN = 180;

export default function PageTransition({ children }) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const prevPath = useRef(location.pathname);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setReady(true);
      return;
    }
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      setReady(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setReady(true);
        });
      });
    }
  }, [location.pathname]);

  return (
    <div
      style={{
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(6px)",
        transition: `opacity ${FADE_IN}ms cubic-bezier(0.25, 0.1, 0.25, 1), transform ${FADE_IN}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
