import type { Palette } from "../types";

export const defaultPalette: Palette = {
  primary: "#0f766e",
  secondary: "#e2e8f0",
  accent: "#f97316",
  neutral: "#0f172a",
};

export const presetPalettes: Array<{ name: string; palette: Palette }> = [
  {
    name: "Mare Serena",
    palette: {
      primary: "#0f766e",
      secondary: "#e2e8f0",
      accent: "#f97316",
      neutral: "#0f172a",
    },
  },
  {
    name: "Sol Quente",
    palette: {
      primary: "#ea580c",
      secondary: "#fff7ed",
      accent: "#0f172a",
      neutral: "#7c2d12",
    },
  },
  {
    name: "Jardim Vivo",
    palette: {
      primary: "#16a34a",
      secondary: "#ecfccb",
      accent: "#0ea5e9",
      neutral: "#052e16",
    },
  },
  {
    name: "Lavanda Suave",
    palette: {
      primary: "#7c3aed",
      secondary: "#ede9fe",
      accent: "#f43f5e",
      neutral: "#1e1b4b",
    },
  },
  {
    name: "Marinho Chic",
    palette: {
      primary: "#0f172a",
      secondary: "#e2e8f0",
      accent: "#38bdf8",
      neutral: "#1e293b",
    },
  },
];
