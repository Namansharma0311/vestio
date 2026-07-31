import { isCapacitor } from "../config.js";

const REQUEST_TIMEOUT = 15000;
const CLOTHES_KEY = "ck_clothes";
const OUTFITS_KEY = "ck_outfits";

let onUnauthorized = null;

export function setOnUnauthorized(cb) {
  onUnauthorized = cb;
}

function getToken() {
  return localStorage.getItem("ck_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("ck_token", token);
  else localStorage.removeItem("ck_token");
}

export function getStoredToken() {
  return getToken();
}

function getApiBase() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  if (isCapacitor()) {
    return import.meta.env.VITE_API_URL || "";
  }
  return "";
}

const BASE = getApiBase();

async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isForm && body) headers["Content-Type"] = "application/json";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") throw new Error("Request timed out");
    throw new Error(`Network error: ${err.message || "Could not reach server"}`);
  }
  clearTimeout(timer);

  if (res.status === 401 && token && onUnauthorized) {
    onUnauthorized();
    throw new Error("Session expired — please log in again");
  }

  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) throw new Error(data?.error || "Something went wrong");
  return data;
}

function getLocal(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function setLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('ck-data-change', { detail: { key } }));
}

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function formDataToObj(formData) {
  const obj = {};
  for (const [key, value] of formData.entries()) {
    if (key === "image" && value instanceof File) {
      obj.imageUrl = await fileToDataUrl(value);
    } else {
      obj[key] = value;
    }
  }
  if (obj.favorite === "true") obj.favorite = true;
  else if (obj.favorite === "false") obj.favorite = false;
  return obj;
}

const PAGE_SIZE = 20;

export const api = {
  me: () => request("/api/auth/me"),
  register: (email, password) => request("/api/auth/register", { method: "POST", body: { email, password } }),
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  updateProfile: (data) => request("/api/auth/profile", { method: "PUT", body: data }),
  changePassword: (currentPassword, newPassword) => request("/api/auth/password", { method: "PUT", body: { currentPassword, newPassword } }),
  deleteAccount: () => request("/api/auth/account", { method: "DELETE" }),

  listClothes: (params = {}) => {
    let items = getLocal(CLOTHES_KEY);

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter((i) =>
        (i.name || "").toLowerCase().includes(q) ||
        (i.brand || "").toLowerCase().includes(q) ||
        (i.color || "").toLowerCase().includes(q)
      );
    }
    if (params.category) items = items.filter((i) => i.category === params.category);
    if (params.season) items = items.filter((i) => i.season === params.season);
    if (params.occasion) items = items.filter((i) => i.occasion === params.occasion);
    if (params.favorite === "true") items = items.filter((i) => i.favorite);

    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const page = parseInt(params.page) || 1;
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return Promise.resolve({ items: paged, page, totalPages, total });
  },

  createClothing: async (formData) => {
    const obj = await formDataToObj(formData);
    const items = getLocal(CLOTHES_KEY);
    const item = {
      id: genId(),
      name: obj.name || "",
      category: obj.category || "",
      color: obj.color || "",
      brand: obj.brand || "",
      season: obj.season || "",
      occasion: obj.occasion || "",
      favorite: obj.favorite || false,
      imageUrl: obj.imageUrl || null,
      createdAt: new Date().toISOString(),
    };
    items.unshift(item);
    setLocal(CLOTHES_KEY, items);
    return item;
  },

  updateClothing: async (id, formData) => {
    const obj = await formDataToObj(formData);
    const items = getLocal(CLOTHES_KEY);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Item not found");
    items[idx] = { ...items[idx], ...obj };
    setLocal(CLOTHES_KEY, items);
    return items[idx];
  },

  deleteClothing: (id) => {
    const items = getLocal(CLOTHES_KEY);
    setLocal(CLOTHES_KEY, items.filter((i) => i.id !== id));
    return Promise.resolve({ success: true });
  },

  listOutfits: () => {
    const outfits = getLocal(OUTFITS_KEY);
    const clothes = getLocal(CLOTHES_KEY);
    const hydrated = outfits.map((o) => ({
      ...o,
      items: clothes.filter((c) => (o.itemIds || []).includes(c.id)),
    }));
    return Promise.resolve(hydrated);
  },

  createOutfit: (name, itemIds) => {
    const outfits = getLocal(OUTFITS_KEY);
    const outfit = {
      id: genId(),
      name: name || "Untitled outfit",
      itemIds,
      createdAt: new Date().toISOString(),
    };
    outfits.unshift(outfit);
    setLocal(OUTFITS_KEY, outfits);
    return Promise.resolve(outfit);
  },

  deleteOutfit: (id) => {
    const outfits = getLocal(OUTFITS_KEY);
    setLocal(OUTFITS_KEY, outfits.filter((o) => o.id !== id));
    return Promise.resolve({ success: true });
  },
};
