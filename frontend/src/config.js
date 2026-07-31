export function isCapacitor() {
  try {
    return !!window.Capacitor;
  } catch {
    return false;
  }
}

function isAndroid() {
  try {
    if (window.Capacitor && typeof window.Capacitor.getPlatform === "function") {
      return window.Capacitor.getPlatform() === "android";
    }
    return /android/i.test(navigator.userAgent);
  } catch {
    return false;
  }
}

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("data:")) return path;
  if (path.startsWith("http")) return path;
  return path;
}
