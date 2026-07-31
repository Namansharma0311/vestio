import { Haptics, ImpactStyle } from "@capacitor/haptics";

let supported = true;
try {
  if (typeof window !== "undefined" && !window.Capacitor?.isNativePlatform?.()) {
    supported = false;
  }
} catch {
  supported = false;
}

export function hapticTap(style = "light") {
  if (!supported) return;
  const map = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  };
  Haptics.impact({ style: map[style] || ImpactStyle.Light }).catch(() => {});
}

export function hapticVibrate(ms = 10) {
  if (!supported) return;
  Haptics.vibrate({ duration: ms }).catch(() => {});
}
