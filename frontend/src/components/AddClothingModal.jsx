import React, { useState } from "react";
import { CATEGORIES, SEASONS, OCCASIONS } from "../constants.js";
import { api } from "../api/client.js";
import { isCapacitor } from "../config.js";
import { hapticTap } from "../hooks/useHaptics.js";

const initial = { name: "", category: "", color: "", brand: "", season: "", occasion: "" };

async function pickImage() {
  if (!isCapacitor()) return null;
  const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
  const photo = await Camera.getPhoto({
    quality: 80,
    resultType: CameraResultType.Uri,
    source: CameraSource.Prompt,
    width: 1024,
    height: 1024,
  });
  const resp = await fetch(photo.webPath);
  const blob = await resp.blob();
  const ext = photo.format || "jpeg";
  return new File([blob], `photo.${ext}`, { type: `image/${ext}` });
}

export default function AddClothingModal({ onClose, onCreated }) {
  const [fields, setFields] = useState(initial);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleFile(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleCamera() {
    try {
      const f = await pickImage();
      if (f) {
        setFile(f);
        setPreview(URL.createObjectURL(f));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fields.category) {
      setError("Pick a category for this item");
      return;
    }
    setError("");
    setSaving(true);
    hapticTap("medium");
    try {
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
      if (file) formData.append("image", file);
      const item = await api.createClothing(formData);
      onCreated(item);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-20" onClick={onClose}>
      <div
        className="hangtag w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="stitch mb-5" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-800 text-2xl">Add a piece</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>
        {error && <p className="text-sm text-clay mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60 font-display font-600">Photo</label>
            <div className="mt-1 flex items-center gap-3">
              <div className="w-20 h-20 bg-canvas border border-line rounded-tag overflow-hidden flex items-center justify-center text-ink/30 text-xs">
                {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : "None"}
              </div>
              <div className="flex flex-col gap-2">
                {isCapacitor() ? (
                  <button
                    type="button"
                    onClick={handleCamera}
                    className="text-sm bg-ink text-canvas px-3 py-1.5 rounded-tag font-display uppercase"
                  >
                    Take photo
                  </button>
                ) : (
                  <input type="file" accept="image/*" onChange={handleFile} className="text-sm" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs uppercase tracking-wide text-ink/60 font-display font-600">Name</label>
              <input
                value={fields.name}
                onChange={(e) => setFields({ ...fields, name: e.target.value })}
                placeholder="e.g. Linen button-up"
                className="mt-1 w-full border border-line rounded-tag px-3 py-2 bg-canvas focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60 font-display font-600">Category</label>
              <select
                value={fields.category}
                onChange={(e) => setFields({ ...fields, category: e.target.value })}
                className="mt-1 w-full border border-line rounded-tag px-3 py-2 bg-canvas focus:bg-white"
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60 font-display font-600">Color</label>
              <input
                value={fields.color}
                onChange={(e) => setFields({ ...fields, color: e.target.value })}
                className="mt-1 w-full border border-line rounded-tag px-3 py-2 bg-canvas focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60 font-display font-600">Brand</label>
              <input
                value={fields.brand}
                onChange={(e) => setFields({ ...fields, brand: e.target.value })}
                className="mt-1 w-full border border-line rounded-tag px-3 py-2 bg-canvas focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60 font-display font-600">Season</label>
              <select
                value={fields.season}
                onChange={(e) => setFields({ ...fields, season: e.target.value })}
                className="mt-1 w-full border border-line rounded-tag px-3 py-2 bg-canvas focus:bg-white"
              >
                <option value="">Either</option>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60 font-display font-600">Occasion</label>
              <select
                value={fields.occasion}
                onChange={(e) => setFields({ ...fields, occasion: e.target.value })}
                className="mt-1 w-full border border-line rounded-tag px-3 py-2 bg-canvas focus:bg-white"
              >
                <option value="">Either</option>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-moss hover:bg-mossdark text-white font-display font-700 uppercase tracking-wide py-2.5 rounded-tag disabled:opacity-60"
          >
            {saving ? "Saving…" : "Add to closet"}
          </button>
        </form>
      </div>
    </div>
  );
}
