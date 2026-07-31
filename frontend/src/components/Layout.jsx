import React, { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { StatusBar } from "@capacitor/status-bar";
import { useAuth } from "../context/AuthContext.jsx";
import { useCategory } from "../context/CategoryContext.jsx";
import { hapticTap } from "../hooks/useHaptics.js";
import { isCapacitor } from "../config.js";

const CATEGORY_COLORS = {
  hindi: { dot: "#DC2840", label: "H", name: "Hindi" },
  english: { dot: "#2563EB", label: "E", name: "English" },
  kpop: { dot: "#EC4899", label: "K", name: "K-pop" },
};

function Icon({ name, size = 22 }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {name}
    </span>
  );
}

function CategoryBar({ activeCategory, onCategoryChange }) {
  return (
    <div className="fixed left-0 right-0 z-50 pointer-events-none flex justify-center" style={{ bottom: "88px" }}>
      <div className="pointer-events-auto px-3 py-1.5 rounded-full bg-surface/80 backdrop-blur-xl border border-line/60 flex items-center gap-1" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
        <div className="flex items-center gap-1">
          {Object.entries(CATEGORY_COLORS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => { hapticTap("light"); onCategoryChange(key); }}
              className={`relative w-8 h-8 rounded-full transition-all flex items-center justify-center ${activeCategory === key ? "scale-110" : "opacity-70 hover:opacity-100"}`}
              style={{
                background: activeCategory === key ? config.dot : "var(--c-surface)",
                border: `2px solid ${activeCategory === key ? config.dot : "var(--c-border)"}`,
              }}
              aria-label={config.name}
            >
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[8px] font-display font-700" style={{ background: config.dot }}>
                {config.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeCategory, setActiveCategory } = useCategory();

  function handleNavTap() {
    hapticTap("light");
  }

  useEffect(() => {
    if (!isCapacitor()) return;
    StatusBar.setStyle({ style: "DARK" }).catch(() => {});
  }, []);

  const isSettings = location.pathname === "/settings";
  const isSearch = location.pathname === "/search";
  const isAI = location.pathname === "/ai";

  const isActive = (path, end) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  const navBtn = (active) =>
    `w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
      active
        ? "bg-moss text-white shadow-lg shadow-moss/30"
        : "bg-surface/80 text-ink/40 hover:text-ink hover:bg-line/50 border border-line"
    }`;

  const searchActive = isSearch;

  return (
    <div className="min-h-screen" style={{ color: "var(--c-ink)" }}>
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-20 border-b border-line pt-safe">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {isSettings ? (
            <button
              onClick={() => { hapticTap("light"); navigate(-1); }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/80 hover:bg-line/50 transition-colors"
              title="Back"
            >
              <Icon name="arrow_back" size={22} />
            </button>
          ) : isAI ? (
            <button
              onClick={() => { hapticTap("light"); navigate(-1); }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/80 hover:bg-line/50 transition-colors"
              title="Back"
            >
              <Icon name="arrow_back" size={22} />
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-2 group" onClick={handleNavTap}>
              <span className="material-symbols-outlined text-moss" style={{ fontSize: 26 }}>checkroom</span>
              <span className="font-display font-800 text-2xl tracking-tight">
                VEST<span className="text-moss">IO</span>
              </span>
            </Link>
          )}
          {!isSettings && !isAI && <div className="w-10" />}
        </div>
      </header>

      <main className={`max-w-6xl mx-auto px-4 sm:px-6 pt-6 w-full ${isSettings ? "pb-6" : isAI ? "pb-16" : "pb-24"}`}>{children}</main>

      {!isSettings && !isAI && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none" style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
          <nav className="pointer-events-auto mx-4 mb-2 px-4 py-2.5 rounded-full bg-surface/80 backdrop-blur-xl border border-line/60 flex items-center gap-2" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)" }}>
            <NavLink to="/" className={navBtn(isActive("/", true))} end onClick={handleNavTap} title="Wardrobe">
              <Icon name="dry_cleaning" size={20} />
            </NavLink>
            <NavLink to="/outfits" className={navBtn(isActive("/outfits"))} onClick={handleNavTap} title="Outfits">
              <Icon name="style" size={20} />
            </NavLink>
            <NavLink to="/search" className={`${navBtn(searchActive)} w-12 h-12`} onClick={handleNavTap} title="Search">
              <Icon name="search" size={24} />
            </NavLink>
            <NavLink to="/ai" className={navBtn(isActive("/ai"))} onClick={handleNavTap} title="Kuchupuchu">
              <Icon name="auto_awesome" size={20} />
            </NavLink>
            <NavLink to="/settings" className={navBtn(isActive("/settings"))} onClick={handleNavTap} title="Settings">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="profile" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <span className="text-xs font-display font-700 uppercase">
                  {(user?.username || user?.email || "?").charAt(0)}
                </span>
              )}
            </NavLink>
          </nav>
        </div>
      )}

      {isAI && <CategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />}
    </div>
  );
}