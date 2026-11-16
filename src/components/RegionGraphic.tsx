import React from "react";
import { WineRegionProfile, CountryProfile } from "../types/wine";
import { ALL_REGIONS_FLAT, COUNTRIES_ATLAS } from "../data/regions";

interface RegionGraphicProps {
  countryName: string;
  regionName: string;
  compact?: boolean;
  onSelectRegion?: (region: WineRegionProfile) => void;
}

export const RegionGraphic: React.FC<RegionGraphicProps> = ({
  countryName,
  regionName,
  compact = false,
  onSelectRegion,
}) => {
  const country: CountryProfile | undefined =
    COUNTRIES_ATLAS.find((c) => c.name.toLowerCase() === countryName.toLowerCase()) ||
    COUNTRIES_ATLAS.find((c) =>
      c.regions.some((r) => r.name.toLowerCase() === regionName.toLowerCase())
    );

  const region: WineRegionProfile | undefined =
    country?.regions.find(
      (r) =>
        r.name.toLowerCase() === regionName.toLowerCase() ||
        regionName.toLowerCase().includes(r.name.toLowerCase()) ||
        r.name.toLowerCase().includes(regionName.toLowerCase())
    ) ||
    ALL_REGIONS_FLAT.find((r) => r.name.toLowerCase() === regionName.toLowerCase()) ||
    country?.regions[0];

  const mapType = country?.mapType ?? "world";
  const regionsToPlot =
    mapType === "world"
      ? ALL_REGIONS_FLAT.filter((r) => r.countryId !== "france" && r.countryId !== "liban")
      : country?.regions ?? [];

  const sunPct = region ? Math.min(100, Math.round((region.sunshineHours / 3300) * 100)) : 70;
  const rainPct = region ? Math.min(100, Math.round((region.rainfallMm / 1500) * 100)) : 45;

  return (
    <div className="bg-[#F6F3EC] border border-[#E8E2D9] rounded-2xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(26,24,23,0.05)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E2D9] bg-white">
        <div className="flex items-center gap-2 text-xs text-[#645D58]">
          <span className="font-semibold text-[#1A1817]">{country?.name ?? countryName}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#821D35] font-medium">{region?.name ?? regionName}</span>
        </div>
        {region && (
          <span className="font-mono-tabular text-xs text-[#645D58]">
            {region.coordinates.lat.toFixed(2)}° N, {region.coordinates.lng.toFixed(2)}° E
          </span>
        )}
      </div>

      <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"} gap-0`}>
        {/* SVG Cartography */}
        <div
          className={`${
            compact ? "" : "lg:col-span-6 lg:border-r border-[#E8E2D9]"
          } p-4 flex items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-[#F1ECE2]`}
        >
          {mapType === "france" && (
            <svg
              viewBox="0 0 320 290"
              className="w-full max-w-[300px] h-auto"
              role="img"
              aria-label={`Carte viticole de France : ${region?.name}`}
            >
              <defs>
                <radialGradient id="frBeacon" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#821D35" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#821D35" stopOpacity="0" />
                </radialGradient>
              </defs>
              <path
                d="M158,20 L195,28 L242,60 L272,82 L264,122 L245,152 L255,198 L266,232 L236,256 L192,254 L164,268 L112,262 L92,226 L98,175 L64,126 L36,105 L54,82 L106,72 L124,42 Z"
                fill="#FFFFFF"
                stroke="#C9C0AF"
                strokeWidth="1.5"
              />
              <path
                d="M284,238 L294,244 L292,270 L282,274 L278,254 Z"
                fill="#FFFFFF"
                stroke="#C9C0AF"
                strokeWidth="1.2"
              />
              {/* Rivers */}
              <path d="M78,125 Q132,120 178,142" fill="none" stroke="#B7CAD6" strokeWidth="1.2" strokeDasharray="2 2" />
              <path d="M115,65 Q162,76 205,92" fill="none" stroke="#B7CAD6" strokeWidth="1.2" strokeDasharray="2 2" />
              <path d="M214,132 Q216,192 208,248" fill="none" stroke="#B7CAD6" strokeWidth="1.4" />
              <path d="M104,202 Q132,228 164,245" fill="none" stroke="#B7CAD6" strokeWidth="1.2" />
              {regionsToPlot.map((r) => {
                const isActive = region?.id === r.id;
                return (
                  <g
                    key={r.id}
                    className={onSelectRegion ? "cursor-pointer" : ""}
                    onClick={() => onSelectRegion?.(r)}
                  >
                    {isActive && (
                      <>
                        <circle cx={r.mapPin.x} cy={r.mapPin.y} r={20} fill="url(#frBeacon)" />
                        <circle
                          cx={r.mapPin.x}
                          cy={r.mapPin.y}
                          r={11}
                          fill="none"
                          stroke="#821D35"
                          strokeOpacity="0.45"
                          strokeWidth="1"
                        />
                      </>
                    )}
                    <circle
                      cx={r.mapPin.x}
                      cy={r.mapPin.y}
                      r={isActive ? 5.5 : 3.5}
                      fill={isActive ? "#821D35" : "#6E6761"}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <text
                      x={r.mapPin.x + (r.mapPin.x > 220 ? -8 : 8)}
                      y={r.mapPin.y + 3}
                      textAnchor={r.mapPin.x > 220 ? "end" : "start"}
                      fontSize={isActive ? "9.8" : "7.6"}
                      fontWeight={isActive ? "700" : "500"}
                      fill={isActive ? "#821D35" : "#57504B"}
                    >
                      {r.name.replace("Vallée de la ", "").replace("Vallée du ", "")}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {mapType === "lebanon" && (
            <svg
              viewBox="0 0 320 265"
              className="w-full max-w-[300px] h-auto"
              role="img"
              aria-label={`Carte viticole du Liban : ${region?.name}`}
            >
              <defs>
                <radialGradient id="lbBeacon" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#821D35" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#821D35" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="115" height="265" fill="#E3ECF2" fillOpacity="0.7" />
              <text
                x="44"
                y="140"
                fontSize="8"
                fill="#5E7487"
                transform="rotate(-90 44 140)"
                textAnchor="middle"
                letterSpacing="2"
              >
                MER MÉDITERRANÉE
              </text>
              <path
                d="M150,25 L220,28 L254,48 L242,102 L212,158 L178,202 L154,238 L104,242 L118,186 L128,125 L136,68 Z"
                fill="#FFFFFF"
                stroke="#C9C0AF"
                strokeWidth="1.6"
              />
              <path d="M155,55 L146,105 L142,155 L134,195" fill="none" stroke="#C5BBA8" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />
              <path d="M232,52 L222,115 L196,175" fill="none" stroke="#C5BBA8" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />
              <ellipse
                cx="186"
                cy="142"
                rx="24"
                ry="48"
                transform="rotate(18 186 142)"
                fill="#821D35"
                fillOpacity="0.08"
                stroke="#821D35"
                strokeOpacity="0.3"
                strokeDasharray="3 2"
              />
              <path d="M196,112 Q182,165 148,220" fill="none" stroke="#89ABC0" strokeWidth="1.4" />
              {regionsToPlot.map((r) => {
                const isActive = region?.id === r.id;
                return (
                  <g
                    key={r.id}
                    className={onSelectRegion ? "cursor-pointer" : ""}
                    onClick={() => onSelectRegion?.(r)}
                  >
                    {isActive && (
                      <>
                        <circle cx={r.mapPin.x} cy={r.mapPin.y} r={20} fill="url(#lbBeacon)" />
                        <circle cx={r.mapPin.x} cy={r.mapPin.y} r={11} fill="none" stroke="#821D35" strokeOpacity="0.45" />
                      </>
                    )}
                    <circle
                      cx={r.mapPin.x}
                      cy={r.mapPin.y}
                      r={isActive ? 5.5 : 3.5}
                      fill={isActive ? "#821D35" : "#6E6761"}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <text
                      x={r.mapPin.x + 9}
                      y={r.mapPin.y + 3}
                      fontSize={isActive ? "9.8" : "7.8"}
                      fontWeight={isActive ? "700" : "500"}
                      fill={isActive ? "#821D35" : "#4E4742"}
                    >
                      {r.name.replace(" & Nord-Liban", "").replace(" & Sud-Liban", "").replace(" (Kesrouan & Chouf)", "")}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {mapType === "italy" && (
            <svg viewBox="0 0 320 265" className="w-full max-w-[300px] h-auto" role="img" aria-label={`Carte viticole d'Italie : ${region?.name}`}>
              <path
                d="M65,45 L145,38 L175,68 L150,92 L182,135 L230,175 L252,196 L224,205 L208,236 L192,232 L198,200 L156,162 L125,118 L90,94 L62,82 Z"
                fill="#FFFFFF"
                stroke="#C9C0AF"
                strokeWidth="1.5"
              />
              <path d="M150,238 L184,234 L178,255 L148,248 Z" fill="#FFFFFF" stroke="#C9C0AF" strokeWidth="1.2" />
              {regionsToPlot.map((r) => {
                const isActive = region?.id === r.id;
                return (
                  <g key={r.id} className={onSelectRegion ? "cursor-pointer" : ""} onClick={() => onSelectRegion?.(r)}>
                    {isActive && <circle cx={r.mapPin.x} cy={r.mapPin.y} r={13} fill="#821D35" fillOpacity={0.18} stroke="#821D35" />}
                    <circle cx={r.mapPin.x} cy={r.mapPin.y} r={isActive ? 5.5 : 3.5} fill={isActive ? "#821D35" : "#6E6761"} stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x={r.mapPin.x + 9} y={r.mapPin.y + 3} fontSize="9.5" fontWeight={isActive ? "700" : "500"} fill={isActive ? "#821D35" : "#4E4742"}>
                      {r.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {mapType === "spain" && (
            <svg viewBox="0 0 320 265" className="w-full max-w-[300px] h-auto" role="img" aria-label={`Carte viticole d'Espagne : ${region?.name}`}>
              <path
                d="M52,55 L145,45 L245,62 L272,82 L242,145 L212,192 L152,226 L92,218 L64,175 L58,108 Z"
                fill="#FFFFFF"
                stroke="#C9C0AF"
                strokeWidth="1.5"
              />
              {regionsToPlot.map((r) => {
                const isActive = region?.id === r.id;
                return (
                  <g key={r.id} className={onSelectRegion ? "cursor-pointer" : ""} onClick={() => onSelectRegion?.(r)}>
                    {isActive && <circle cx={r.mapPin.x} cy={r.mapPin.y} r={13} fill="#821D35" fillOpacity={0.18} stroke="#821D35" />}
                    <circle cx={r.mapPin.x} cy={r.mapPin.y} r={isActive ? 5.5 : 3.5} fill={isActive ? "#821D35" : "#6E6761"} stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x={r.mapPin.x + 9} y={r.mapPin.y + 3} fontSize="9.5" fontWeight={isActive ? "700" : "500"} fill={isActive ? "#821D35" : "#4E4742"}>
                      {r.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {mapType === "world" && (
            <svg viewBox="0 0 340 245" className="w-full max-w-[320px] h-auto" role="img" aria-label={`Carte viticole mondiale : ${country?.name ?? countryName}`}>
              <path d="M22,52 L88,48 L96,88 L72,118 L48,112 L25,84 Z" fill="#FFFFFF" stroke="#C9C0AF" strokeWidth="1.1" />
              <path d="M78,136 L112,148 L118,194 L94,228 L82,195 Z" fill="#FFFFFF" stroke="#C9C0AF" strokeWidth="1.1" />
              <path d="M142,46 L212,42 L226,86 L195,104 L145,102 Z" fill="#FFFFFF" stroke="#C9C0AF" strokeWidth="1.1" />
              <path d="M150,115 L205,112 L214,168 L184,212 L158,176 Z" fill="#FFFFFF" stroke="#C9C0AF" strokeWidth="1.1" />
              <path d="M214,52 L298,55 L290,126 L242,135 L218,108 Z" fill="#FFFFFF" stroke="#C9C0AF" strokeWidth="1.1" />
              <path d="M254,174 L296,172 L305,216 L262,212 Z" fill="#FFFFFF" stroke="#C9C0AF" strokeWidth="1.1" />
              <line x1="0" y1="126" x2="340" y2="126" stroke="#D6CEBE" strokeDasharray="2 3" />
              <rect x="0" y="64" width="340" height="36" fill="#821D35" fillOpacity="0.045" />
              <rect x="0" y="176" width="340" height="36" fill="#821D35" fillOpacity="0.045" />
              {region && (
                <g>
                  <circle cx={region.mapPin.x} cy={region.mapPin.y} r={14} fill="#821D35" fillOpacity={0.18} stroke="#821D35" />
                  <circle cx={region.mapPin.x} cy={region.mapPin.y} r={5.5} fill="#821D35" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text
                    x={region.mapPin.x > 220 ? region.mapPin.x - 10 : region.mapPin.x + 10}
                    y={region.mapPin.y - 6}
                    textAnchor={region.mapPin.x > 220 ? "end" : "start"}
                    fontSize="9.5"
                    fontWeight="700"
                    fill="#821D35"
                  >
                    {region.countryName} · {region.name}
                  </text>
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Terroir Metrics, Climate Bars & Soil Strata Graphic */}
        {region && (
          <div className={`${compact ? "" : "lg:col-span-6"} p-4 flex flex-col justify-between gap-4`}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white border border-[#E8E2D9] rounded-xl p-3">
                  <div className="text-[#645D58]">Surface viticole</div>
                  <div className="font-mono-tabular text-sm font-semibold text-[#1A1817] mt-0.5">
                    {region.surfaceHa.toLocaleString("fr-FR")} ha
                  </div>
                </div>
                <div className="bg-white border border-[#E8E2D9] rounded-xl p-3">
                  <div className="text-[#645D58]">Altitude des vignes</div>
                  <div className="font-mono-tabular text-sm font-semibold text-[#1A1817] mt-0.5">
                    {region.altitudeRangeM}
                  </div>
                </div>
              </div>

              {/* Climate Dual Visual Bars */}
              <div className="bg-white border border-[#E8E2D9] rounded-xl p-3 space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#645D58]">Ensoleillement annuel</span>
                    <span className="font-mono-tabular font-semibold text-[#1A1817]">
                      {region.sunshineHours.toLocaleString("fr-FR")} h/an
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F2EFE9] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D4A742] to-[#B58932]"
                      style={{ width: `${sunPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#645D58]">Pluviométrie annuelle</span>
                    <span className="font-mono-tabular font-semibold text-[#1A1817]">
                      {region.rainfallMm} mm/an
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F2EFE9] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7F9EB2] to-[#567C96]"
                      style={{ width: `${rainPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Soil Strata Graphic */}
            <div className="bg-white border border-[#E8E2D9] rounded-xl p-3">
              <div className="flex items-center justify-between text-xs text-[#645D58] mb-1.5">
                <span className="font-medium text-[#1A1817]">Stratigraphie des sols</span>
                <span className="font-mono-tabular">100 %</span>
              </div>
              <div className="h-3.5 w-full rounded-full overflow-hidden flex border border-[#E2DBD0] p-0.5 gap-0.5 bg-[#FAF9F6]">
                {region.soils.map((soil) => (
                  <div
                    key={soil.label}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${soil.percent}%`, backgroundColor: soil.colorHex }}
                    title={`${soil.label} (${soil.percent}%)`}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {region.soils.map((soil) => (
                  <div key={soil.label} className="flex items-center gap-1.5 text-[11px] text-[#4E4742]">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: soil.colorHex }}
                    />
                    <span>{soil.label}</span>
                    <span className="font-mono-tabular text-[#645D58]">{soil.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
