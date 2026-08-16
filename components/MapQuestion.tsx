"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { Region } from "@/lib/types";
import { MAP_STYLES } from "@/lib/mapStyles";
import { useMapStyle } from "@/hooks/useMapStyle";

const GEO_URL = "/countries-50m.json";
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

const REGION_VIEWS: Record<Region, { center: [number, number]; scale: number; label: string }> = {
  world: { center: [10, 10], scale: 130, label: "World" },
  europe: { center: [20, 50], scale: 420, label: "Europe" },
  africa: { center: [20, 2], scale: 320, label: "Africa" },
  asia: { center: [95, 30], scale: 300, label: "Asia" },
  "north-america": { center: [-100, 45], scale: 260, label: "North America" },
  "south-america": { center: [-60, -20], scale: 260, label: "South America" },
  oceania: { center: [140, -25], scale: 380, label: "Oceania" },
};

interface MapQuestionProps {
  countryIds: string[];
  /** The continent-focused tab to offer alongside the always-available World view. Omitted when no single continent applies (e.g. answers spanning multiple continents). */
  region?: Region;
  /** [longitude, latitude] to drop a pin at — used for capital-city questions. */
  markerCoordinates?: [number, number];
}

function ZoomableMap({
  countryIds,
  center,
  scale,
  markerCoordinates,
}: {
  countryIds: string[];
  center: [number, number];
  scale: number;
  markerCoordinates?: [number, number];
}) {
  const { style } = useMapStyle();
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: center,
    zoom: 1,
  });

  const zoomIn = () => setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.6, MAX_ZOOM) }));
  const zoomOut = () => setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.6, MIN_ZOOM) }));
  const resetView = () => setPosition({ coordinates: center, zoom: 1 });

  const geographyStyle = (isTarget: boolean) => ({
    default: {
      fill: isTarget ? style.highlight : style.land,
      stroke: isTarget ? style.highlightBorder : style.border,
      strokeWidth: isTarget ? 1 : 0.5,
      outline: "none",
    },
    hover: {
      fill: isTarget ? style.highlight : style.land,
      stroke: isTarget ? style.highlightBorder : style.border,
      strokeWidth: isTarget ? 1 : 0.5,
      outline: "none",
    },
    pressed: {
      fill: isTarget ? style.highlight : style.land,
      stroke: isTarget ? style.highlightBorder : style.border,
      strokeWidth: isTarget ? 1 : 0.5,
      outline: "none",
    },
  });

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
      style={{ background: style.ocean }}
    >
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ center, scale }}
        width={800}
        height={480}
        style={{ width: "100%", height: "auto", touchAction: "none" }}
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onMoveEnd={setPosition}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isTarget = countryIds.includes(geo.id);
                return <Geography key={geo.rsmKey} geography={geo} style={geographyStyle(isTarget)} />;
              })
            }
          </Geographies>
          {markerCoordinates && (
            <Marker coordinates={markerCoordinates}>
              <circle r={5 / position.zoom} fill={style.highlight} stroke="#fff" strokeWidth={1.5 / position.zoom} />
              <circle r={1.5 / position.zoom} fill="#fff" />
            </Marker>
          )}
        </ZoomableGroup>
      </ComposableMap>

      <div className="absolute bottom-2 right-2 flex flex-col gap-1">
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-neutral-700 shadow hover:bg-white dark:bg-neutral-800/90 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-neutral-700 shadow hover:bg-white dark:bg-neutral-800/90 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          −
        </button>
        {position.zoom > 1 && (
          <button
            type="button"
            onClick={resetView}
            aria-label="Reset zoom"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-neutral-700 shadow hover:bg-white dark:bg-neutral-800/90 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            ⟲
          </button>
        )}
      </div>
    </div>
  );
}

export function MapQuestion({ countryIds, region, markerCoordinates }: MapQuestionProps) {
  const hasContinentTab = !!region && region !== "world";
  const [tab, setTab] = useState<"world" | Region>(hasContinentTab ? region! : "world");
  const { style, setStyleId } = useMapStyle();

  const activeRegion = hasContinentTab && tab !== "world" ? region! : "world";
  const { center, scale } = REGION_VIEWS[activeRegion];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center gap-3">
        {hasContinentTab && (
          <div className="flex gap-1.5">
            {(["world", region!] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  tab === key
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {REGION_VIEWS[key].label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-1">
          {MAP_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyleId(s.id)}
              title={s.label}
              aria-label={`${s.label} map style`}
              aria-pressed={style.id === s.id}
              className={`h-5 w-5 rounded-full transition ${
                style.id === s.id
                  ? "ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-neutral-950"
                  : "opacity-70 hover:opacity-100"
              }`}
              style={{ background: `linear-gradient(135deg, ${s.land} 50%, ${s.highlight} 50%)` }}
            />
          ))}
        </div>
      </div>

      <ZoomableMap
        key={activeRegion}
        countryIds={countryIds}
        center={center}
        scale={scale}
        markerCoordinates={markerCoordinates}
      />
    </div>
  );
}
