import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import ClothingCard from "../components/ClothingCard.jsx";
import OutfitIdeas from "../components/OutfitIdeas.jsx";
import { hapticTap } from "../hooks/useHaptics.js";

export default function Outfits() {
  const [clothes, setClothes] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("");
  const [building, setBuilding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, o] = await Promise.all([api.listClothes(), api.listOutfits()]);
      setClothes(c.items || c);
      setOutfits(o);
      setLoading(false);
    })();
  }, []);

  function toggleSelect(item) {
    setSelected((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  }

  async function saveOutfit() {
    if (selected.length === 0) return;
    const outfit = await api.createOutfit(name || "Untitled outfit", selected);
    const hydrated = { ...outfit, items: clothes.filter((c) => selected.includes(c.id)) };
    setOutfits((prev) => [hydrated, ...prev]);
    setSelected([]);
    setName("");
    setBuilding(false);
  }

  async function removeOutfit(id) {
    if (!confirm("Delete this outfit?")) return;
    await api.deleteOutfit(id);
    setOutfits((prev) => prev.filter((o) => o.id !== id));
  }

  if (loading) return <p className="text-ink/40 text-sm">Loading…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-4xl">Outfit builder</h1>
          <p className="text-ink/50 text-sm mt-1">Mix and match pieces into looks.</p>
        </div>
        <button
          onClick={() => { hapticTap("light"); setBuilding((b) => !b); }}
          className="bg-moss hover:bg-mossdark text-white font-display font-700 uppercase tracking-wide px-5 py-2.5 rounded-tag"
        >
          {building ? "Cancel" : "+ Build outfit"}
        </button>
      </div>

      {building && (
        <div className="hangtag p-4 mb-6 sticky top-[72px] z-10" style={{ backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)", background: "color-mix(in srgb, var(--c-surface) 85%, transparent)" }}>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <input
              placeholder="Outfit name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-line rounded-tag px-3 py-2 bg-canvas focus:bg-white text-sm flex-1 min-w-[200px]"
            />
            <button
              onClick={() => { hapticTap("medium"); saveOutfit(); }}
              disabled={selected.length === 0}
              className="bg-ink text-canvas font-display font-700 uppercase text-sm px-4 py-2 rounded-tag disabled:opacity-40"
            >
              Save outfit ({selected.length})
            </button>
          </div>
          {clothes.length === 0 ? (
            <p className="text-sm text-ink/50">Add some clothes first to build an outfit.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {clothes.map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  selectable
                  selected={selected.includes(item.id)}
                  onSelect={toggleSelect}
                />
              ))}
            </div>
          )}
          <OutfitIdeas clothes={clothes} onUseLook={(ids) => setSelected(ids)} />
        </div>
      )}

      {outfits.length === 0 ? (
        <div className="hangtag p-10 text-center">
          <p className="font-display text-xl mb-1">No outfits yet</p>
          <p className="text-ink/50 text-sm">Build your first look from pieces in your closet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="hangtag p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-700 text-lg">{outfit.name}</h3>
                <button onClick={() => removeOutfit(outfit.id)} className="text-xs text-ink/40 hover:text-clay underline">
                  Delete
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {outfit.items.map((item) => (
                  <ClothingCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
