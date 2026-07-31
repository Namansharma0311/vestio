import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

const CLOTHES_KEY = 'ck_clothes';
const OUTFITS_KEY = 'ck_outfits';
const SYNC_INTERVAL = 30000;

function readLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function stripImages(items) {
  return items.map(({ image, ...rest }) => rest);
}

function hexToArgb(hex) {
  if (hex.startsWith('rgba')) {
    const m = hex.match(/[\d.]+/g);
    if (m && m.length >= 3) {
      const r = parseInt(m[0]) & 0xff;
      const g = parseInt(m[1]) & 0xff;
      const b = parseInt(m[2]) & 0xff;
      const a = m.length >= 4 ? Math.round(parseFloat(m[3]) * 255) & 0xff : 255;
      return (a << 24) | (r << 16) | (g << 8) | b;
    }
  }
  if (hex.startsWith('#')) {
    let h = hex.slice(1);
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (h.length === 6) return 0xff000000 | (parseInt(h, 16) & 0xffffff);
    if (h.length === 8) return parseInt(h, 16);
  }
  return 0xff000000;
}

const THEMES_RAW = {
  default: { canvas:"#FAF7F1",surface:"#FFFFFF",ink:"#21201D",accent:"#4B5C3F",border:"#DEDACE",muted:"rgba(33,32,29,0.5)" },
  light: { canvas:"#FFFFFF",surface:"#F5F5F5",ink:"#1A1A1A",accent:"#2563EB",border:"#E5E7EB",muted:"rgba(0,0,0,0.45)" },
  dark: { canvas:"#121212",surface:"#1E1E1E",ink:"#E0E0E0",accent:"#90EE90",border:"#333333",muted:"rgba(224,224,224,0.5)" },
  cherry: { canvas:"#FFF5F5",surface:"#FFFFFF",ink:"#1A0505",accent:"#DC2840",border:"#FECACA",muted:"rgba(26,5,5,0.5)" },
  cherryBlack: { canvas:"#0A0A0A",surface:"#1A1A1A",ink:"#F5F5F5",accent:"#DC2840",border:"#333333",muted:"rgba(245,245,245,0.5)" },
  cherryCream: { canvas:"#FFF8F0",surface:"#FFFFFF",ink:"#1A0800",accent:"#DC2840",border:"#F0DCC8",muted:"rgba(26,8,0,0.5)" },
  typoMax: { canvas:"#F5F0E8",surface:"#FFFFFF",ink:"#000000",accent:"#D62828",border:"#000000",muted:"rgba(0,0,0,0.4)" },
};

export function useWidgetSync() {
  const sync = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const clothes = readLocalStorage(CLOTHES_KEY);
      const outfits = readLocalStorage(OUTFITS_KEY);
      const themeId = localStorage.getItem('ck_theme') || 'default';
      const t = THEMES_RAW[themeId] || THEMES_RAW.default;
      await Capacitor.Plugins.WidgetSync.syncData({
        clothes: JSON.stringify(stripImages(clothes)),
        outfits: JSON.stringify(outfits),
        canvasColor: hexToArgb(t.canvas),
        surfaceColor: hexToArgb(t.surface),
        inkColor: hexToArgb(t.ink),
        accentColor: hexToArgb(t.accent),
        borderColor: hexToArgb(t.border),
        mutedColor: hexToArgb(t.muted),
      });
    } catch {}
  }, []);

  useEffect(() => {
    sync();
    const id = setInterval(sync, SYNC_INTERVAL);

    const onStorage = (e) => {
      if (e.key === CLOTHES_KEY || e.key === OUTFITS_KEY) sync();
    };
    const onDataChange = (e) => {
      if (e.detail?.key === CLOTHES_KEY || e.detail?.key === OUTFITS_KEY) sync();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('ck-data-change', onDataChange);

    return () => {
      clearInterval(id);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ck-data-change', onDataChange);
    };
  }, [sync]);

  return sync;
}
