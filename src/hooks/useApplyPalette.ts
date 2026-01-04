import { useEffect } from "react";
import type { Palette } from "../types";
import { defaultPalette } from "../constants/palettes";

export const useApplyPalette = (palette?: Palette) => {
  useEffect(() => {
    const active = palette ?? defaultPalette;
    const root = document.documentElement;
    root.style.setProperty("--color-primary", active.primary);
    root.style.setProperty("--color-secondary", active.secondary);
    root.style.setProperty("--color-accent", active.accent);
    root.style.setProperty("--color-neutral", active.neutral);
    root.style.setProperty("--color-surface", "#ffffff");
    root.style.setProperty("--color-ink", "#0f172a");
  }, [palette]);
};
