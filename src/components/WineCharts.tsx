import React from "react";
import { WineReference, WineColor, VintageEntry } from "../types/wine";
import { GRAPE_VARIETIES } from "../data/grapes";
import { getColorHex } from "../utils/sommelierHelpers";

/* 1. Cellar Composition Visual Bar Chart */
export const CellarDistributionBar: React.FC<{ wines: WineReference[] }> = ({ wines }) => {
  const total = wines.length || 1;
  const reds = wines.filter((w) => w.color === "Rouge").length;
  const whites = wines.filter((w) => w.color === "Blanc").length;
  const roses = wines.filter((w) => w.color === "Rosé").length;

  const pctRed = Math.round((reds / total) * 100);
  const pctWhite = Math.round((whites / total) * 100);
  const pctRose = Math.max(0, 100 - pctRed - pctWhite);

  // Top 5 countries
  const countryCounts = wines.reduce<Record<string, number>>((acc, w) => {
    acc[w.country] = (acc[w.country] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(26,24,23,0.05)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Left: Color Distribution Stacked Graphic */}
      <div className="lg:col-span-6 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1A1817]">Répartition chromatique de la sélection</span>
          <span className="font-mono-tabular text-[#645D58]">{wines.length} cuvées</span>
        </div>
        <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-[#F2EFE9] p-0.5 gap-0.5">
          {reds > 0 && (
            <div
              className="h-full rounded-l-full transition-all duration-300"
              style={{ width: `${(reds / total) * 100}%`, backgroundColor: "#821D35" }}
              title={`Rouge : ${reds}`}
            />
          )}
          {whites > 0 && (
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${(whites / total) * 100}%`, backgroundColor: "#CFA649" }}
              title={`Blanc : ${whites}`}
            />
          )}
          {roses > 0 && (
            <div
              className="h-full rounded-r-full transition-all duration-300"
              style={{ width: `${(roses / total) * 100}%`, backgroundColor: "#D87C7C" }}
              title={`Rosé : ${roses}`}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-5 text-xs text-[#4E4742]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#821D35]" />
            Rouge <strong className="font-mono-tabular text-[#1A1817]">{reds}</strong> ({pctRed}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CFA649]" />
            Blanc <strong className="font-mono-tabular text-[#1A1817]">{whites}</strong> ({pctWhite}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D87C7C]" />
            Rosé <strong className="font-mono-tabular text-[#1A1817]">{roses}</strong> ({pctRose}%)
          </span>
        </div>
      </div>

      {/* Right: Top Countries Mini Bar Chart */}
      <div className="lg:col-span-6 space-y-2 border-t lg:border-t-0 lg:border-l border-[#E8E2D9] pt-4 lg:pt-0 lg:pl-6">
        <div className="text-xs font-semibold text-[#1A1817] mb-1">
          Principales origines représentées
        </div>
        <div className="grid grid-cols-5 gap-2.5 items-end h-14">
          {topCountries.map(([country, count]) => {
            const maxCount = topCountries[0]?.[1] || 1;
            const heightPct = Math.max(22, Math.round((count / maxCount) * 100));
            return (
              <div key={country} className="flex flex-col items-center justify-end h-full gap-1">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#821D35] to-[#A63A53] transition-all duration-300"
                    style={{ height: `${heightPct}%` }}
                    title={`${country} : ${count} vins`}
                  />
                </div>
                <span className="text-[11px] text-[#4E4742] truncate max-w-full font-medium">
                  {country}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* 2. SVG Sensory 5-Axis Radar Chart for WineDetailModal */
export const WineSensoryRadar: React.FC<{ wine: WineReference }> = ({ wine }) => {
  const mainGrape = GRAPE_VARIETIES.find((g) =>
    wine.grapes[0]?.name.toLowerCase().includes(g.name.split(" (")[0].toLowerCase())
  );

  const puissance = wine.strength; // 1..5
  const acidite = mainGrape?.acidity ?? (wine.color === "Blanc" ? 4 : 3);
  const structure =
    wine.color === "Rouge"
      ? mainGrape?.tannins ?? 4
      : wine.color === "Rosé"
      ? 2
      : Math.min(5, Math.max(2, Math.round(wine.abv - 10)));
  const garde = Math.min(5, Math.max(1, Math.round((wine.bestVintage < 2021 ? 4 : 2) + (wine.strength >= 4 ? 1 : 0))));
  const alcool = Math.min(5, Math.max(1, Math.round((wine.abv - 10) * 1.1)));

  const axes = [
    { label: "Puissance", val: puissance },
    { label: "Acidité", val: acidite },
    { label: wine.color === "Rouge" ? "Tanins" : "Ampleur", val: structure },
    { label: "Garde", val: garde },
    { label: "Alcool", val: alcool },
  ];

  const cx = 135;
  const cy = 115;
  const maxR = 72;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    const r = (value / 5) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const polygonPoints = axes
    .map((a, idx) => {
      const pt = getPoint(idx, a.val);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(" ");

  const accentColor = getColorHex(wine.color).swatch;

  return (
    <div className="bg-[#FAF9F6] border border-[#E8E2D9] rounded-xl p-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-xs mb-1">
        <span className="font-semibold text-[#1A1817]">Empreinte sensorielle</span>
        <span className="font-mono-tabular text-[#645D58]">Échelle / 5</span>
      </div>

      <svg viewBox="0 0 270 225" className="w-full max-w-[260px] h-auto" role="img" aria-label="Graphique radar sensoriel">
        {/* Concentric pentagons */}
        {[1, 2, 3, 4, 5].map((ring) => {
          const pts = axes
            .map((_, idx) => {
              const p = getPoint(idx, ring);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <polygon
              key={ring}
              points={pts}
              fill="none"
              stroke="#E2DBD0"
              strokeWidth={ring === 5 ? "1.2" : "0.8"}
            />
          );
        })}

        {/* Axis spokes & labels */}
        {axes.map((axis, idx) => {
          const outer = getPoint(idx, 5);
          const labelPt = getPoint(idx, 6.25);
          return (
            <g key={axis.label}>
              <line
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="#E2DBD0"
                strokeWidth="0.9"
              />
              <text
                x={labelPt.x}
                y={labelPt.y + 3}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#4E4742"
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill={accentColor}
          fillOpacity={0.22}
          stroke={accentColor}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Vertex dots */}
        {axes.map((axis, idx) => {
          const pt = getPoint(idx, axis.val);
          return (
            <circle
              key={axis.label}
              cx={pt.x}
              cy={pt.y}
              r={3.5}
              fill={accentColor}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
};

/* 3. Drinking Window & Serving Temp Visual Gauge */
export const DrinkingWindowTimeline: React.FC<{
  currentVintage: number;
  bestVintage: number;
  drinkingWindow: string;
  color: WineColor;
}> = ({ currentVintage, bestVintage, drinkingWindow, color }) => {
  const parts = drinkingWindow.match(/\d{4}/g);
  const start = parts && parts[0] ? Number(parts[0]) : currentVintage + 2;
  const end = parts && parts[1] ? Number(parts[1]) : start + 15;
  const currentYear = 2026;

  const spanMin = Math.min(bestVintage, currentVintage, start) - 1;
  const spanMax = Math.max(end, currentYear + 5);
  const totalSpan = Math.max(1, spanMax - spanMin);

  const leftPct = Math.max(0, Math.min(90, ((start - spanMin) / totalSpan) * 100));
  const widthPct = Math.max(10, Math.min(100 - leftPct, ((end - start) / totalSpan) * 100));
  const nowPct = Math.max(2, Math.min(98, ((currentYear - spanMin) / totalSpan) * 100));

  const swatch = getColorHex(color).swatch;

  return (
    <div className="bg-[#FAF9F6] border border-[#E8E2D9] rounded-xl p-4 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#1A1817]">Courbe d&apos;évolution &amp; apogée</span>
        <span className="font-mono-tabular font-semibold text-[#821D35]">{drinkingWindow}</span>
      </div>

      <div className="relative h-5 flex items-center">
        <div className="w-full h-2 rounded-full bg-[#E8E2D9]" />
        <div
          className="absolute h-2.5 rounded-full opacity-85"
          style={{
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            backgroundColor: swatch,
          }}
        />
        {/* Current year marker */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center"
          style={{ left: `${nowPct}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-3 h-3 rounded-full bg-[#1A1817] border-2 border-white shadow-xs mt-1" />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono-tabular text-[#645D58]">
        <span>Vendange {currentVintage}</span>
        <span>Aujourd&apos;hui ({currentYear})</span>
        <span>Garde max {end}</span>
      </div>
    </div>
  );
};

/* 4. Vintage Category Score Sparkline Graphic */
export const VintageScoreChart: React.FC<{
  vintages: VintageEntry[];
  bestYear: number;
  color: WineColor;
}> = ({ vintages, bestYear, color }) => {
  const sorted = [...vintages].sort((a, b) => a.year - b.year);
  const swatch = getColorHex(color).swatch;

  return (
    <div className="px-4 pt-3 pb-2 bg-white border-b border-[#E8E2D9]">
      <div className="flex items-end gap-2 h-20">
        {sorted.map((v) => {
          // Map 16..20 score20 to visual height 25%..100%
          const pct = Math.max(20, Math.min(100, ((v.score20 - 15.5) / 4.5) * 100));
          const isBest = v.year === bestYear;
          return (
            <div
              key={v.year}
              className="flex-1 flex flex-col items-center justify-end h-full gap-1 group"
              title={`${v.year} : ${v.score20}/20 (${v.status})`}
            >
              <span className="font-mono-tabular text-[10px] font-semibold text-[#4E4742]">
                {v.score20}
              </span>
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-200"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: isBest ? swatch : "#D8D0C2",
                    opacity: isBest ? 1 : 0.75,
                  }}
                />
              </div>
              <span
                className={`font-mono-tabular text-[10px] ${
                  isBest ? "font-bold text-[#821D35]" : "text-[#645D58]"
                }`}
              >
                {v.year}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
