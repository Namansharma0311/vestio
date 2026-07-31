import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api/client.js";
import { CATEGORIES, SEASONS, OCCASIONS } from "../constants.js";
import ClothingCard from "../components/ClothingCard.jsx";
import AddClothingModal from "../components/AddClothingModal.jsx";
import { hapticTap } from "../hooks/useHaptics.js";

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filters, setFilters] = useState({ search: "", category: "", season: "", occasion: "", favorite: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listClothes({ ...filters, page });
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function toggleFavorite(item) {
    const formData = new FormData();
    formData.append("favorite", String(!item.favorite));
    const updated = await api.updateClothing(item.id, formData);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  }

  async function handleDelete(item) {
    if (!confirm(`Remove "${item.name || "this item"}" from your closet?`)) return;
    await api.deleteClothing(item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setTotal((t) => t - 1);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-4xl">Your wardrobe</h1>
          <p className="text-ink/50 text-sm mt-1">{total} item{total === 1 ? "" : "s"} catalogued</p>
        </div>
        <button
          onClick={() => { hapticTap("medium"); setShowAdd(true); }}
          className="bg-moss hover:bg-mossdark text-white font-display font-700 uppercase tracking-wide px-5 py-2.5 rounded-tag"
        >
          + Add piece
        </button>
      </div>

      <div className="hangtag p-4 mb-6 flex flex-wrap gap-3 items-center sticky top-[72px] z-10" style={{ backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)", background: "color-mix(in srgb, var(--c-surface) 85%, transparent)" }}>
        <input
          placeholder="Search name, brand, color…"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border border-line rounded-tag px-3 py-2 bg-canvas focus:bg-white text-sm flex-1 min-w-[180px]"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="border border-line rounded-tag px-3 py-2 bg-canvas text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filters.season}
          onChange={(e) => setFilters({ ...filters, season: e.target.value })}
          className="border border-line rounded-tag px-3 py-2 bg-canvas text-sm"
        >
          <option value="">Any season</option>
          {SEASONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.occasion}
          onChange={(e) => setFilters({ ...filters, occasion: e.target.value })}
          className="border border-line rounded-tag px-3 py-2 bg-canvas text-sm"
        >
          <option value="">Any occasion</option>
          {OCCASIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.favorite === "true"}
            onChange={(e) => setFilters({ ...filters, favorite: e.target.checked ? "true" : "" })}
          />
          Favorites only
        </label>
      </div>

      {loading ? (
        <p className="text-ink/40 text-sm">Loading your closet…</p>
      ) : items.length === 0 ? (
        <div className="hangtag p-10 text-center">
          <p className="font-display text-xl mb-1">Nothing here yet</p>
          <p className="text-ink/50 text-sm">Add your first piece to start your digital closet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <ClothingCard key={item.id} item={item} onToggleFavorite={toggleFavorite} onDelete={handleDelete} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-line rounded-tag disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-sm text-ink/50">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm border border-line rounded-tag disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showAdd && (
        <AddClothingModal
          onClose={() => setShowAdd(false)}
          onCreated={(item) => {
            setItems((prev) => [item, ...prev]);
            setTotal((t) => t + 1);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}
