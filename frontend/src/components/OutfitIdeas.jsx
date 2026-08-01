import React, { useRef, useState } from "react";
import { imageUrl, isCapacitor } from "../config.js";
import { extractPalette, namedColorToHex } from "../lib/color.js";
import { recommendOutfits } from "../lib/outfitRecommender.js";
import { hapticTap } from "../hooks/useHaptics.js";

function Icon({ name, size = 20, className = "" }) {
  return (
    <span className={`material-symbols-outlined leading-none ${className}`} style={{ fontSize: size }}>
      {name}
    </span>
  );
}

function ItemChip({ item }) {
  return (
    <div className="flex flex-col items-center gap-1 w-[64px]">
      <div className="w-14 h-14 rounded-tag overflow-hidden border border-line bg-canvas">
        {item.imageUrl ? (
          <img src={imageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: namedColorToHex(item.color) || item.color || "#eee" }}
          />
        )}
      </div>
      <span className="text-[9px] text-ink/50 uppercase tracking-wide text-center leading-tight line-clamp-2">
        {item.category || "piece"}
      </span>
    </div>
  );
}

export default function OutfitIdeas({ clothes, onUseLook }) {
  const fileInputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [inspoFile, setInspoFile] = useState(null);
  const [inspoPreview, setInspoPreview] = useState(null);
  const [palette, setPalette] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function pickPhoto() {
    hapticTap("light");
    try {
      if (isCapacitor()) {
        const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
        const photo = await Camera.getPhoto({
          quality: 70,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt,
          width: 720,
          height: 720,
        });
        const format = photo.format || "jpeg";
        const resp = await fetch(photo.webPath);
        const blob = await resp.blob();
        setInspoFile(new File([blob], `inspo.${format}`, { type: `image/${format}` }));
        setInspoPreview(photo.webPath);
      } else {
        fileInputRef.current?.click();
      }
    } catch {
      // user cancelled
    }
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setInspoFile(f);
    setInspoPreview(URL.createObjectURL(f));
  }

  async function generate() {
    hapticTap("medium");
    if (!clothes || clothes.length === 0) {
      setError("Add some clothes to your closet first, then come back here.");
      setSuggestions([]);
      return;
    }
    setLoading(true);
    setError("");
    setSuggestions([]);
    let pal = null;
    if (inspoFile) {
      try {
        pal = await extractPalette(inspoFile);
      } catch {
        pal = null;
      }
    }
    const recs = recommendOutfits({ clothes, palette: pal, count: 5 });
    setPalette(pal);
    setSuggestions(recs);
    if (recs.length === 0) {
      setError("Not enough matching pieces for a look yet — try adding more clothes, then generate again.");
    }
    setLoading(false);
  }

  function clearInspo() {
    setInspoFile(null);
    setInspoPreview(null);
    setPalette(null);
  }

  return (
    <div className="mt-5">
      <button
        onClick={() => {
          hapticTap("light");
          setOpen((o) => !o);
        }}
        className="w-full flex items-center justify-between gap-3 border border-dashed border-ink/20 rounded-tag px-4 py-3 hover:bg-canvas"
      >
        <span className="flex items-center gap-2 font-display font-700 uppercase tracking-wide text-sm">
          <Icon name="auto_awesome" size={18} className="text-moss" />
          AI outfit ideas
        </span>
        <span className="flex items-center gap-1 text-xs text-ink/40">
          <Icon name="trending_up" size={14} />
          Global trends
          <Icon name={open ? "expand_less" : "expand_more"} size={18} />
        </span>
      </button>

      {open && (
        <div className="hangtag mt-3 p-4">
          <p className="text-sm text-ink/70 mb-3">
            Pick a photo of an outfit you like and VESTIO will suggest looks from your own closet that match today's
            global style trends. No photo? Just hit generate — you'll get trend-based looks from your wardrobe.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button
              onClick={pickPhoto}
              className="flex items-center gap-2 bg-canvas border border-line px-4 py-2 rounded-tag text-sm font-display font-700 uppercase tracking-wide hover:bg-white"
            >
              <Icon name={inspoPreview ? "photo_library" : "add_a_photo"} size={16} />
              {inspoPreview ? "Change inspo" : "Add inspo photo"}
            </button>
            {inspoPreview && (
              <div className="relative">
                <img
                  src={inspoPreview}
                  alt="Inspiration"
                  className="w-14 h-14 rounded-tag object-cover border border-line"
                />
                {palette && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex overflow-hidden rounded-tag border border-white shadow">
                    {palette.map((p) => (
                      <span key={p.hex} className="w-3.5 h-2" style={{ background: p.hex }} title={`${p.pct}%`} />
                    ))}
                  </div>
                )}
                <button
                  onClick={clearInspo}
                  aria-label="Remove inspo photo"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink text-canvas flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 bg-moss hover:bg-mossdark text-white px-4 py-2 rounded-tag text-sm font-display font-700 uppercase tracking-wide disabled:opacity-50"
            >
              {loading ? <Icon name="progress_activity" size={16} className="animate-spin" /> : <Icon name="auto_awesome" size={16} />}
              Generate looks
            </button>
          </div>

          {error && <p className="text-xs text-clay mb-3">{error}</p>}

          {suggestions.length > 0 && (
            <div className="space-y-3">
              {suggestions.map((s) => (
                <div key={s.id} className="hangtag p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-tag uppercase tracking-wide font-display font-700"
                      style={{ background: `${s.trend.color}22`, color: s.trend.color }}
                    >
                      <Icon name="trending_up" size={12} />
                      {s.trend.name}
                    </span>
                    <button
                      onClick={() => {
                        hapticTap("medium");
                        onUseLook(s.itemIds);
                      }}
                      className="text-[11px] font-display font-700 uppercase tracking-wide px-3 py-1.5 rounded-tag bg-ink text-canvas hover:bg-moss"
                    >
                      Use this look
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {s.items.map((item) => (
                      <ItemChip key={item.id} item={item} />
                    ))}
                  </div>
                  <p className="text-xs text-ink/50">{s.reason}</p>
                </div>
              ))}
            </div>
          )}

          {!loading && suggestions.length === 0 && !error && (
            <p className="text-xs text-ink/40">Tap "Generate looks" to see suggestions matched to global trends.</p>
          )}
        </div>
      )}
    </div>
  );
}
