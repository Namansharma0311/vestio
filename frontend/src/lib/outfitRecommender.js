import { TRENDS } from "./trends.js";
import { namedColorToHex, colorFamilyOf, isNeutralColor, colorDistanceScore, paletteMatchScore } from "./color.js";

const ROLE_TAGS = {
  top: ["Tops", "T-Shirts", "Shirts"],
  bottom: ["Pants", "Bottoms", "Skirts"],
  dress: ["Dresses"],
  shoes: ["Shoes"],
  bag: ["Bags"],
};

function roleOf(category) {
  const c = String(category || "");
  for (const [role, tags] of Object.entries(ROLE_TAGS)) {
    if (tags.some((t) => c.toLowerCase() === t.toLowerCase())) return role;
  }
  return null;
}

function trendAffinity(item, trend) {
  const hex = namedColorToHex(item.color);
  if (hex) {
    const fam = colorFamilyOf(hex);
    if (trend.families.includes(fam)) return 1;
    if (isNeutralColor(hex)) return 0.75;
    return 0.35;
  }
  if (item.season === "Winter" && trend.id === "dark-academia") return 0.8;
  if (item.season === "Summer" && trend.id === "coastal") return 0.8;
  return 0.55;
}

function seededJitter(key) {
  let h = 2166136261;
  for (const ch of String(key)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1000 / 1000;
}

function buildCombos(pool, trend) {
  const combos = [];
  const pick = (role) => {
    const list = pool[role] || [];
    return list.slice(0, 4);
  };

  if (pool.dress && pool.dress.length) {
    for (const dress of pick("dress")) {
      const base = { items: [dress], roles: new Set(["dress"]) };
      const shoeOptions = pick("shoes").length ? pick("shoes") : [null];
      const bagOptions = pick("bag").length ? pick("bag") : [null];
      for (const shoe of shoeOptions) {
        for (const bag of bagOptions) {
          combos.push({ items: [dress, ...(shoe ? [shoe] : []), ...(bag ? [bag] : [])].filter(Boolean), roles: base.roles });
        }
      }
    }
  }

  if (pool.top && pool.bottom) {
    for (const top of pick("top")) {
      for (const bottom of pick("bottom")) {
        const items = [top, bottom];
        if (pool.shoes && pool.shoes.length) items.push(pool.shoes[0]);
        if (pool.bag && pool.bag.length) items.push(pool.bag[0]);
        combos.push({ items: items.filter(Boolean), roles: new Set(["top", "bottom"]) });
      }
    }
  }
  return combos;
}

function scoreCombo(combo, trend, palette) {
  const n = combo.items.length;
  if (!n) return 0;

  let affinity = 0;
  for (const item of combo.items) affinity += trendAffinity(item, trend);
  affinity /= n;

  let harmony = 0;
  let pairs = 0;
  for (let i = 0; i < combo.items.length; i++) {
    for (let j = i + 1; j < combo.items.length; j++) {
      harmony += colorDistanceScore(combo.items[i].color, combo.items[j].color);
      pairs++;
    }
  }
  harmony = pairs ? harmony / pairs : 0.7;

  let paletteMatch = 0;
  let matched = 0;
  for (const item of combo.items) {
    if (!item.color) continue;
    paletteMatch += paletteMatchScore(item.color, palette);
    matched++;
  }
  const hasPalette = !!palette && palette.length > 0;
  if (matched) {
    paletteMatch = hasPalette ? paletteMatch / matched : 0.5;
  } else {
    paletteMatch = 0.5;
  }

  const hasTop = combo.roles.has("top") || combo.roles.has("dress");
  const hasBottom = combo.roles.has("bottom") || combo.roles.has("dress");
  const hasShoes = combo.roles.has("shoes");
  const hasBag = combo.roles.has("bag");
  let completeness = 0.4;
  if (hasShoes) completeness += 0.3;
  if (hasBag) completeness += 0.3;

  const favoriteBonus = combo.items.some((i) => i.favorite) ? 0.05 : 0;

  let total = affinity * 0.3 + harmony * 0.25 + paletteMatch * 0.2 + completeness * 0.25 + favoriteBonus;
  if (!hasPalette) total += paletteMatch * 0.15;
  total += seededJitter(combo.items.map((i) => i.id).sort().join("-")) * 0.02;

  return total;
}

function describe(combo, trend) {
  const names = combo.items.map((i) => i.name || i.category || "piece").filter(Boolean);
  const colors = [...new Set(combo.items.map((i) => i.color).filter(Boolean))].slice(0, 3);
  const colorBit = colors.length ? ` ${colors.join(" + ")}` : "";
  const paletteBit = "";
  return `${names.join(" + ")}${colorBit}. ${trend.blurb}${paletteBit}`;
}

export function recommendOutfits({ clothes = [], palette = null, count = 5 }) {
  if (!clothes || !clothes.length) return [];

  const items = clothes.map((c) => ({ ...c }));
  const byRole = { top: [], bottom: [], dress: [], shoes: [], bag: [] };
  for (const item of items) {
    const role = roleOf(item.category);
    if (role && byRole[role]) byRole[role].push(item);
  }

  const results = [];
  for (const trend of TRENDS) {
    const pool = {};
    for (const [role, list] of Object.entries(byRole)) {
      pool[role] = list
        .filter((i) => trendAffinity(i, trend) >= 0.4)
        .sort((a, b) => trendAffinity(b, trend) - trendAffinity(a, trend));
    }
    for (const combo of buildCombos(pool, trend)) {
      if (combo.items.length < 2) continue;
      const score = scoreCombo(combo, trend, palette);
      results.push({
        id: "look-" + trend.id + "-" + combo.items.map((i) => i.id).sort().join("-"),
        trend,
        items: combo.items,
        itemIds: combo.items.map((i) => i.id),
        score,
        reason: describe(combo, trend),
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  const seen = new Set();
  const unique = [];
  for (const r of results) {
    const key = r.itemIds.slice().sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(r);
  }

  const final = [];
  const usedTrends = new Set();
  for (const r of unique) {
    if (final.length >= count) break;
    if (usedTrends.has(r.trend.id)) continue;
    usedTrends.add(r.trend.id);
    final.push(r);
  }
  if (final.length < count) {
    for (const r of unique) {
      if (final.length >= count) break;
      if (final.includes(r)) continue;
      final.push(r);
    }
  }

  return final.sort((a, b) => b.score - a.score);
}
