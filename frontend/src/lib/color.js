const NAMED_COLORS = {
  black: "#000000",
  white: "#ffffff",
  gray: "#808080",
  grey: "#808080",
  silver: "#c0c0c0",
  charcoal: "#36454f",
  stone: "#797c80",
  taupe: "#483c32",
  beige: "#f5f5dc",
  cream: "#fffdd0",
  ivory: "#fffff0",
  ecru: "#cdb891",
  tan: "#d2b48c",
  khaki: "#c3b091",
  sand: "#c2b280",
  nude: "#e8c4a0",
  brown: "#8b4513",
  camel: "#b98a57",
  maroon: "#800000",
  burgundy: "#800020",
  wine: "#722f37",
  red: "#ff0000",
  scarlet: "#ff2400",
  crimson: "#dc143c",
  rust: "#b7410e",
  orange: "#ffa500",
  tangerine: "#f28500",
  peach: "#ffdab9",
  coral: "#ff7f50",
  salmon: "#fa8072",
  yellow: "#ffd700",
  mustard: "#e1ad01",
  gold: "#d4af37",
  lemon: "#fff44f",
  olive: "#808000",
  green: "#008000",
  forest: "#228b22",
  emerald: "#50c878",
  mint: "#98ff98",
  sage: "#9caf88",
  lime: "#32cd32",
  teal: "#008080",
  turquoise: "#40e0d0",
  cyan: "#00ffff",
  aqua: "#7fffd4",
  blue: "#0000ff",
  navy: "#000080",
  royal: "#4169e1",
  sky: "#87ceeb",
  babyblue: "#89cff0",
  powder: "#b0e0e6",
  denim: "#1560bd",
  indigo: "#4b0082",
  purple: "#800080",
  violet: "#ee82ee",
  lavender: "#e6e6fa",
  lilac: "#c8a2c8",
  magenta: "#ff00ff",
  fuchsia: "#ff00ff",
  pink: "#ffc0cb",
  hotpink: "#ff69b4",
  rose: "#ff007f",
  blush: "#ffb6c1",
  champagne: "#f7e7ce",
  metallic: "#b9b9b9",
  neon: "#39ff14",
};

export function namedColorToHex(name) {
  if (!name) return null;
  const key = String(name)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (key.startsWith("light")) {
    const base = NAMED_COLORS[key.replace("light", "")];
    if (base) return base;
  }
  if (key.startsWith("dark")) {
    const base = NAMED_COLORS[key.replace("dark", "")];
    if (base) return base;
  }
  return NAMED_COLORS[key] || null;
}

export function hexToRgb(hex) {
  if (!hex) return null;
  let h = String(hex).replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s, l };
}

function colorFamily(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "neutral";
  const { h, s, l } = rgbToHsl(rgb);
  if (l < 0.08) return "black";
  if (l > 0.93 && s < 0.15) return "white";
  if (s < 0.14) return "neutral";
  if (h >= 345 || h < 12) return s < 0.45 ? "muted-warm" : "red";
  if (h < 30) return "warm";
  if (h < 70) return "yellow";
  if (h < 165) return "green";
  if (h < 200) return "teal";
  if (h < 250) return "blue";
  if (h < 290) return "purple";
  return "pink";
}

export function colorFamilyOf(nameOrHex) {
  const hex = /^#/.test(String(nameOrHex || "")) ? nameOrHex : namedColorToHex(nameOrHex);
  return colorFamily(hex);
}

export function isNeutralColor(nameOrHex) {
  return ["neutral", "black", "white"].includes(colorFamilyOf(nameOrHex));
}

export function colorDistanceScore(a, b) {
  const hexA = /^#/.test(String(a || "")) ? a : namedColorToHex(a);
  const hexB = /^#/.test(String(b || "")) ? b : namedColorToHex(b);
  if (!hexA || !hexB) return 0.6;
  const fa = colorFamily(hexA);
  const fb = colorFamily(hexB);
  if (fa === fb) {
    if (fa === "neutral" || fa === "black" || fa === "white") return 0.7;
    return 0.95;
  }
  if (["neutral", "black", "white"].includes(fa) || ["neutral", "black", "white"].includes(fb)) return 0.8;
  const pair = [fa, fb].sort().join("-");
  const complementary = [
    "red-green",
    "red-teal",
    "warm-blue",
    "yellow-purple",
    "green-pink",
    "teal-pink",
    "blue-warm",
    "red-cyan",
  ];
  if (complementary.includes(pair)) return 0.85;
  const warmGroup = ["warm", "yellow", "muted-warm", "red"];
  const coolGroup = ["teal", "blue", "purple", "green", "pink"];
  if (warmGroup.includes(fa) && warmGroup.includes(fb)) return 0.7;
  if (coolGroup.includes(fa) && coolGroup.includes(fb)) return 0.65;
  return 0.4;
}

function hueDistance(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

function hslScoreFromHex(hexA, hexB) {
  const r1 = hexToRgb(hexA);
  const r2 = hexToRgb(hexB);
  if (!r1 || !r2) return 0.5;
  const a = rgbToHsl(r1);
  const b = rgbToHsl(r2);
  if (a.s < 0.12 || b.s < 0.12 || a.l > 0.93 || b.l > 0.93 || a.l < 0.08 || b.l < 0.08) return 0.8;
  const d = hueDistance(a.h, b.h);
  if (d <= 25) return 0.95;
  if (d >= 150 && d <= 210) return 0.9;
  return 0.45;
}

export function paletteMatchScore(itemColor, palette) {
  if (!palette || palette.length === 0) return 0.5;
  const hex = /^#/.test(String(itemColor || "")) ? itemColor : namedColorToHex(itemColor);
  if (!hex) return 0.5;
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  let best = 1;
  for (const p of palette) {
    const prgb = hexToRgb(p.hex);
    if (!prgb) continue;
    const dist = Math.sqrt((rgb.r - prgb.r) ** 2 + (rgb.g - prgb.g) ** 2 + (rgb.b - prgb.b) ** 2);
    const score = Math.max(0, 1 - dist / 380);
    if (score < best) best = score;
  }
  return best;
}

export async function extractPalette(file, count = 4) {
  const bmp = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 140 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const buckets = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 125) continue;
      const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
      const cur = buckets.get(key);
      if (cur) {
        cur.r += r;
        cur.g += g;
        cur.b += b;
        cur.n += 1;
      } else {
        buckets.set(key, { r, g, b, n: 1 });
      }
    }
    const total = data.length / 4;
    const ranked = [];
    for (const bucket of buckets.values()) {
      const s = bucket.n / total;
      const r = bucket.r / bucket.n;
      const g = bucket.g / bucket.n;
      const b = bucket.b / bucket.n;
      const { s: sat } = rgbToHsl({ r, g, b });
      const weight = s * (0.45 + sat * 0.9);
      ranked.push({ hex: rgbToHex({ r: Math.round(r), g: Math.round(g), b: Math.round(b) }), pct: Math.round(s * 100), weight });
    }
    ranked.sort((a, b) => b.weight - a.weight);
    const picked = [];
    for (const entry of ranked) {
      if (picked.length >= count) break;
      if (picked.some((p) => Math.abs(hexToRgb(p.hex)?.r - hexToRgb(entry.hex)?.r) < 24 && Math.abs(hexToRgb(p.hex)?.g - hexToRgb(entry.hex)?.g) < 24 && Math.abs(hexToRgb(p.hex)?.b - hexToRgb(entry.hex)?.b) < 24)) {
        continue;
      }
      picked.push(entry);
    }
    return picked;
  } finally {
    bmp.close?.();
  }
}

function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}
