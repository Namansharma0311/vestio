import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { hapticTap } from "../hooks/useHaptics.js";

const CATEGORIES = [
  { key: "all", label: "All", icon: "search" },
  { key: "clothes", label: "Wardrobe", icon: "dry_cleaning" },
  { key: "outfits", label: "Outfits", icon: "style" },
  { key: "music", label: "Music", icon: "music_note" },
];

function ItemCard({ item, type, onClick }) {
  const isClothes = type === "clothes";
  return (
    <button
      onClick={() => { hapticTap("light"); onClick(); }}
      className="flex items-center gap-3 w-full p-3 rounded-xl bg-surface border border-line hover:border-moss/40 transition-all text-left"
    >
      <div className="w-11 h-11 rounded-lg bg-canvas border border-line flex items-center justify-center overflow-hidden shrink-0">
        {isClothes && item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-ink/30" style={{ fontSize: 20 }}>
            {isClothes ? "dry_cleaning" : type === "outfits" ? "style" : "music_note"}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-700 text-sm truncate">{item.name || "Untitled"}</p>
        <p className="text-xs text-muted truncate">
          {isClothes
            ? [item.brand, item.color, item.category].filter(Boolean).join(" · ")
            : type === "outfits"
            ? `${(item.items || item.itemIds || []).length} items`
            : item.artist || ""}
        </p>
      </div>
      <span className="material-symbols-outlined text-ink/20" style={{ fontSize: 18 }}>chevron_right</span>
    </button>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [clothes, setClothes] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [c, o] = await Promise.all([api.listClothes({}), api.listOutfits()]);
        if (!cancelled) {
          setClothes(c.items || c);
          setOutfits(o);
        }
      } catch {}
      try {
        const res = await fetch("https://itunes.apple.com/us/rss/topsongs/limit=25/json");
        const data = await res.json();
        if (!cancelled) {
          const feed = data?.feed?.entry || [];
          setTrending(feed.map((e) => ({
            name: e["im:name"]?.label || "",
            artist: e["im:artist"]?.label || "",
            image: e["im:image"]?.[2]?.label || "",
            link: e.link?.attributes?.href || "",
          })));
        }
      } catch {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const q = query.toLowerCase().trim();

  const matchedClothes = q
    ? clothes.filter((c) =>
        [c.name, c.brand, c.color, c.category, c.season, c.occasion]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(q))
      )
    : [];

  const matchedOutfits = q
    ? outfits.filter((o) =>
        o.name?.toLowerCase().includes(q) ||
        (o.items || []).some((i) => i.name?.toLowerCase().includes(q))
      )
    : [];

  const matchedMusic = q
    ? trending.filter((t) =>
        t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      )
    : [];

  const showClothes = activeTab === "all" || activeTab === "clothes";
  const showOutfits = activeTab === "all" || activeTab === "outfits";
  const showMusic = activeTab === "all" || activeTab === "music";
  const hasResults = matchedClothes.length || matchedOutfits.length || matchedMusic.length;
  const hasQuery = q.length > 0;

  return (
    <div className="space-y-4">
      <h1 className="font-display font-800 text-3xl">Search</h1>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-ink/30" style={{ fontSize: 20 }}>search</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search wardrobe, outfits, music..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-line text-sm font-body focus:outline-none focus:ring-2 focus:ring-moss/30 transition-all"
        />
        {q && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { hapticTap("light"); setActiveTab(cat.key); }}
            className={`px-3 py-1.5 rounded-full text-xs font-display font-600 uppercase tracking-wide whitespace-nowrap transition-all ${
              activeTab === cat.key
                ? "bg-moss text-white"
                : "bg-surface border border-line text-muted hover:border-moss/40"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <span className="material-symbols-outlined text-moss animate-spin" style={{ fontSize: 28 }}>progress_activity</span>
        </div>
      )}

      {!loading && hasQuery && !hasResults && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-ink/15" style={{ fontSize: 48 }}>search_off</span>
          <p className="text-sm text-muted mt-2 font-body">No results for "{query}"</p>
        </div>
      )}

      {!loading && hasQuery && hasResults && (
        <div className="space-y-5">
          {showClothes && matchedClothes.length > 0 && (
            <div>
              <h3 className="font-display font-700 text-xs uppercase tracking-wider text-muted mb-2 pl-1">
                Wardrobe ({matchedClothes.length})
              </h3>
              <div className="space-y-2">
                {matchedClothes.slice(0, activeTab === "clothes" ? 50 : 5).map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    type="clothes"
                    onClick={() => navigate("/")}
                  />
                ))}
              </div>
            </div>
          )}

          {showOutfits && matchedOutfits.length > 0 && (
            <div>
              <h3 className="font-display font-700 text-xs uppercase tracking-wider text-muted mb-2 pl-1">
                Outfits ({matchedOutfits.length})
              </h3>
              <div className="space-y-2">
                {matchedOutfits.slice(0, activeTab === "outfits" ? 50 : 5).map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    type="outfits"
                    onClick={() => navigate("/outfits")}
                  />
                ))}
              </div>
            </div>
          )}

          {showMusic && matchedMusic.length > 0 && (
            <div>
              <h3 className="font-display font-700 text-xs uppercase tracking-wider text-muted mb-2 pl-1">
                Music ({matchedMusic.length})
              </h3>
              <div className="space-y-2">
                {matchedMusic.slice(0, activeTab === "music" ? 50 : 5).map((item, i) => (
                  <ItemCard
                    key={i}
                    item={item}
                    type="music"
                    onClick={() => navigate("/ai")}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !hasQuery && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-ink/10" style={{ fontSize: 56 }}>manage_search</span>
          <p className="text-sm text-muted mt-3 font-body">Type to search your wardrobe, outfits, and trending music</p>
        </div>
      )}
    </div>
  );
}
