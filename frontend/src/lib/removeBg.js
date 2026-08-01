import { removeBackground } from "@imgly/background-removal";

export function isSkin(r, g, b) {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return y > 60 && cb > 80 && cb < 135 && cr > 135 && cr < 180;
}

export function removeSkinPixels(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    if (isSkin(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
    }
  }
}

function toCanvas(blob) {
  return createImageBitmap(blob).then((bmp) => {
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    canvas.getContext("2d").drawImage(bmp, 0, 0);
    bmp.close && bmp.close();
    return canvas;
  });
}

function boundingBox(ctx, width, height) {
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

function canvasToBlob(canvas, type = "image/jpeg", quality = 0.92) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function prepare(file, maxDim = 1024) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  try {
    if (scale >= 1) {
      bmp.close && bmp.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close && bmp.close();
    return canvasToBlob(canvas, "image/jpeg", 0.9);
  } catch (e) {
    return file;
  }
}

export async function extractClothing(file, { removeSkin = true, onProgress, onPhase } = {}) {
  const prepared = await prepare(file);
  let last = 0;
  const segmented = await removeBackground(prepared, {
    model: "isnet_quint8",
    progress: (key, current, total) => {
      if (total <= 0) return;
      const p = Math.min(1, current / total);
      if (p >= last) last = p;
      if (typeof onPhase === "function") onPhase("download");
      if (typeof onProgress === "function") onProgress(p * 0.85);
    },
  });
  if (prepared && typeof prepared.close === "function") prepared.close();
  if (typeof onPhase === "function") onPhase("cutout");
  if (typeof onProgress === "function") onProgress(0.9);

  const canvas = await toCanvas(segmented);
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (removeSkin) {
    const imageData = ctx.getImageData(0, 0, width, height);
    removeSkinPixels(imageData);
    ctx.putImageData(imageData, 0, 0);
  }

  let trimmed = canvas;
  const box = boundingBox(ctx, width, height);
  if (box.maxX >= box.minX && box.maxY >= box.minY) {
    const pad = Math.round(Math.min(width, height) * 0.02);
    const sx = Math.max(0, box.minX - pad);
    const sy = Math.max(0, box.minY - pad);
    const sw = Math.min(width - sx, box.maxX - box.minX + 1 + pad * 2);
    const sh = Math.min(height - sy, box.maxY - box.minY + 1 + pad * 2);
    const crop = document.createElement("canvas");
    crop.width = sw;
    crop.height = sh;
    crop.getContext("2d").drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    trimmed = crop;
  }

  const white = document.createElement("canvas");
  white.width = trimmed.width;
  white.height = trimmed.height;
  const wctx = white.getContext("2d");
  wctx.fillStyle = "#ffffff";
  wctx.fillRect(0, 0, white.width, white.height);
  wctx.drawImage(trimmed, 0, 0);

  if (typeof onProgress === "function") onProgress(1);
  return canvasToBlob(white);
}
