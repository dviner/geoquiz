export interface MapStyle {
  id: string;
  label: string;
  ocean: string;
  land: string;
  border: string;
  highlight: string;
  highlightBorder: string;
}

export const MAP_STYLES: MapStyle[] = [
  {
    id: "classic",
    label: "Classic",
    ocean: "#eff6ff",
    land: "#d4d4d8",
    border: "#ffffff",
    highlight: "#2563eb",
    highlightBorder: "#ffffff",
  },
  {
    id: "terrain",
    label: "Terrain",
    ocean: "#bfe3f0",
    land: "#bbdca0",
    border: "#eef7e6",
    highlight: "#e8590c",
    highlightBorder: "#ffffff",
  },
  {
    id: "dark",
    label: "Dark",
    ocean: "#0f172a",
    land: "#334155",
    border: "#0f172a",
    highlight: "#facc15",
    highlightBorder: "#ffffff",
  },
  {
    id: "contrast",
    label: "High Contrast",
    ocean: "#ffffff",
    land: "#111827",
    border: "#ffffff",
    highlight: "#dc2626",
    highlightBorder: "#000000",
  },
];

export const DEFAULT_MAP_STYLE_ID = "classic";
