"use client";

import { useCallback, useSyncExternalStore } from "react";
import { MAP_STYLES, DEFAULT_MAP_STYLE_ID } from "@/lib/mapStyles";

const STORAGE_KEY = "geoquiz.mapStyleId";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && MAP_STYLES.some((s) => s.id === stored) ? stored : DEFAULT_MAP_STYLE_ID;
}

function getServerSnapshot(): string {
  return DEFAULT_MAP_STYLE_ID;
}

export function useMapStyle() {
  const styleId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setStyleId = useCallback((id: string) => {
    window.localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new Event("storage"));
  }, []);

  const style = MAP_STYLES.find((s) => s.id === styleId) ?? MAP_STYLES[0];
  return { style, styleId, setStyleId };
}
