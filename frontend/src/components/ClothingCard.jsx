import React from "react";
import { imageUrl } from "../config.js";
import { hapticTap } from "../hooks/useHaptics.js";

export default function ClothingCard({ item, selected, onToggleFavorite, onDelete, onSelect, selectable }) {
  return (
    <div
      className={`hangtag overflow-hidden group ${selectable ? "cursor-pointer" : ""} ${
        selected ? "ring-2 ring-moss" : ""
      }`}
      onClick={selectable ? () => { hapticTap("light"); onSelect?.(item); } : undefined}
    >
      <div className="aspect-square bg-line/40 relative">
        {item.imageUrl ? (
          <img src={imageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 font-display text-sm uppercase">
            No photo
          </div>
        )}
        {!selectable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              hapticTap("medium");
              onToggleFavorite?.(item);
            }}
            aria-label={item.favorite ? "Remove from favorites" : "Add to favorites"}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
              item.favorite ? "bg-clay text-white" : "bg-white/80 text-ink/50"
            }`}
          >
            ♥
          </button>
        )}
      </div>
      <div className="stitch" />
      <div className="p-3">
        <p className="font-display font-700 text-base leading-tight truncate">{item.name || "Untitled"}</p>
        <p className="text-xs text-ink/50 uppercase tracking-wide mt-0.5">{item.category}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {item.color && <span className="text-[10px] px-2 py-0.5 bg-canvas border border-line rounded-tag">{item.color}</span>}
          {item.season && <span className="text-[10px] px-2 py-0.5 bg-canvas border border-line rounded-tag">{item.season}</span>}
          {item.occasion && <span className="text-[10px] px-2 py-0.5 bg-canvas border border-line rounded-tag">{item.occasion}</span>}
        </div>
        {!selectable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              hapticTap("light");
              onDelete?.(item);
            }}
            className="mt-3 text-xs text-ink/40 hover:text-clay underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
