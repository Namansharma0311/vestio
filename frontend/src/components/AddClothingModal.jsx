import React, { useState } from "react";
import { CATEGORIES, SEASONS, OCCASIONS } from "../constants.js";
import { api } from "../api/client.js";
import { isCapacitor } from "../config.js";
import { hapticTap } from "../hooks/useHaptics.js";
import { extractClothing } from "../lib/removeBg.js";

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
  const [processedFile, setProcessedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("download");
  const [removeBg, setRemoveBg] = useState(true);
  const [removeSkin, setRemoveSkin] = useState(true);
  const [bgNote, setBgNote] = useState(null);

  async function processPhoto(f) {
    setFile(f);
    setProcessedFile(null);
    setPreview(URL.createObjectURL(f));
    if (!removeBg) return;
    setProcessing(true);
    setProgress(0);
    setPhase("download");
    setBgNote(null);
    try {
      const blob = await extractClothing(f, {
        removeSkin,
        onPhase: (p) => setPhase(p),
        onProgress: (p) => {
          setProgress((prev) => (p >= prev ? p : prev));
        },
      });
      const processed = new File([blob], `${(f.name || "photo").replace(/\.[^.]+$/, "")}.jpg`, {
        type: "image/jpeg",
      });
      setProcessedFile(processed);
      setPreview(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setProcessedFile(null);
      setBgNote("Background removal couldn't run (check your connection) — using the original photo.");
    } finally {
      setProcessing(false);
    }
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    processPhoto(f);
  }

  async function handleCamera() {
    try {
      const f = await pickImage();
      if (f) processPhoto(f);
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleRemoveBg(v) {
    setRemoveBg(v);
    if (file) processPhoto(file);
  }

  function toggleRemoveSkin(v) {
    setRemoveSkin(v);
    if (file && removeBg) processPhoto(file);
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
      const image = processedFile || file;
      if (image) formData.append("image", image);
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
              <div className="relative w-20 h-20 bg-white border border-line rounded-tag overflow-hidden flex items-center justify-center text-ink/30 text-xs">
                {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : "None"}
                {processing && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                    <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    <span className="text-[9px] text-white font-display font-700">{Math.round(progress * 100)}%</span>
                  </div>
                )}              </div>
              <div className="flex flex-col gap-2">
                {isCapacitor() ? (
                  <button
                    type="button"
                    onClick={handleCamera}
                    disabled={processing}
                    className="text-sm bg-ink text-canvas px-3 py-1.5 rounded-tag font-display uppercase disabled:opacity-50"
                  >
                    Take photo
                  </button>
                ) : (
                  <input type="file" accept="image/*" onChange={handleFile} className="text-sm" />
                )}
                {bgNote && <span className="text-[11px] text-clay max-w-[180px]">{bgNote}</span>}
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={removeBg}
                  onChange={(e) => toggleRemoveBg(e.target.checked)}
                  className="accent-moss w-4 h-4"
                />
                <span className="font-display font-600 uppercase tracking-wide text-xs">Auto-cut out (remove background)</span>
              </label>
              {removeBg && (
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={removeSkin}
                    onChange={(e) => toggleRemoveSkin(e.target.checked)}
                    className="accent-moss w-4 h-4"
                  />
                  <span className="font-display font-600 uppercase tracking-wide text-xs">Remove face, hands &amp; skin</span>
                </label>
              )}
              {removeBg && (
                <p className="text-[11px] text-muted">
                  {processing
                    ? phase === "download"
                      ? "Downloading the AI model… (first time only, ~40 MB)"
                      : "Cutting out your outfit…"
                    : "Clothes are kept on a clean white background. You can re-run it any time by picking the photo again."}
                </p>
              )}
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
            disabled={saving || processing}
            className="w-full bg-moss hover:bg-mossdark text-white font-display font-700 uppercase tracking-wide py-2.5 rounded-tag disabled:opacity-60"
          >
            {saving ? "Saving…" : processing ? "Cutting out…" : "Add to closet"}
          </button>
        </form>
      </div>
    </div>
  );
}
