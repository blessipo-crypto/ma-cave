import React, { useState, useMemo } from "react";
import { COUNTRIES_ATLAS } from "../data/regions";
import { WineReference, WineRegionProfile } from "../types/wine";
import { RegionGraphic } from "./RegionGraphic";
import { getColorHex } from "../utils/sommelierHelpers";
import { MapPin, ArrowRight } from "lucide-react";

interface AtlasRegionsViewProps {
  wines: WineReference[];
  onSelectWine: (wine: WineReference) => void;
  onSelectGrapeAndGoToCellar: (grapeName: string) => void;
}

export const AtlasRegionsView: React.FC<AtlasRegionsViewProps> = ({
  wines,
  onSelectWine,
  onSelectGrapeAndGoToCellar,
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>("france");
  const activeCountry = useMemo(
    () => COUNTRIES_ATLAS.find((c) => c.id === selectedCountryId) ?? COUNTRIES_ATLAS[0],
    [selectedCountryId]
  );

  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    activeCountry.regions[0].id
  );

  const activeRegion: WineRegionProfile = useMemo(() => {
    const found = activeCountry.regions.find((r) => r.id === selectedRegionId);
    return found ?? activeCountry.regions[0];
  }, [activeCountry, selectedRegionId]);

  const handleSelectCountry = (countryId: string) => {
    setSelectedCountryId(countryId);
    const nextCountry = COUNTRIES_ATLAS.find((c) => c.id === countryId);
    if (nextCountry && nextCountry.regions[0]) {
      setSelectedRegionId(nextCountry.regions[0].id);
    }
  };

  const regionWines = useMemo(
    () =>
      wines.filter(
        (w) =>
          w.country.toLowerCase() === activeCountry.name.toLowerCase() &&
          (w.region.toLowerCase() === activeRegion.name.toLowerCase() ||
            activeRegion.name.toLowerCase().includes(w.region.toLowerCase()) ||
            w.region.toLowerCase().includes(activeRegion.name.toLowerCase()))
      ),
    [wines, activeCountry, activeRegion]
  );

  const countryWines = useMemo(
    () => wines.filter((w) => w.country.toLowerCase() === activeCountry.name.toLowerCase()),
    [wines, activeCountry]
  );

  return (
    <div className="space-y-8">
      {/* Editorial Intro + Hero Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-white border border-[#E5DFD5] rounded-xl overflow-hidden">
        <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#665E5A] mb-2">
              Atlas Viticole Mondial · France, Liban & Grands Terroirs
            </div>
            <h1 className="font-editorial text-3xl lg:text-4xl font-semibold text-[#1C1817] leading-tight">
              Pays, Régions Viticoles & Meilleurs Cépages
            </h1>
            <p className="text-sm text-[#4E4742] mt-3 leading-relaxed max-w-2xl">
              Explorez chaque grand pays producteur et ses régions viticoles avec leur graphique géographique,
              surface en hectares, stratigraphie des sols, meilleurs cépages et vins de référence disponibles.
            </p>
          </div>

          {/* Country Selector Bar */}
          <div className="mt-6">
            <div className="text-xs font-medium text-[#665E5A] mb-2">Sélectionner un pays :</div>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES_ATLAS.map((c) => {
                const active = c.id === activeCountry.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCountry(c.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? "bg-[#7B1E32] text-white border-[#7B1E32]"
                        : "bg-[#FAF8F4] text-[#1C1817] border-[#D6CEBE] hover:border-[#7B1E32]"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[220px] bg-[#EFEAE0]">
          <img
            src={
              activeCountry.id === "liban"
                ? "/src/assets/images/bekaa_valley_vineyard_1794793378905.jpg"
                : "/src/assets/images/french_terroir_estate_1794793378949.jpg"
            }
            alt={`Vignoble de ${activeCountry.name}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-5 text-white">
            <div className="text-xs text-white/80">{activeCountry.worldRank}</div>
            <div className="font-editorial text-2xl font-semibold mt-0.5">
              {activeCountry.name} —{" "}
              <span className="font-mono-tabular text-lg">
                {activeCountry.totalSurfaceHa.toLocaleString("fr-FR")} ha
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Country Overview: Best Grapes + Top Available Wines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-5">
          <div className="border-b border-[#E5DFD5] pb-3">
            <h2 className="font-editorial text-2xl font-semibold text-[#1C1817]">
              Meilleurs cépages de {activeCountry.name}
            </h2>
            <p className="text-xs text-[#665E5A] mt-1">{activeCountry.overview}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeCountry.bestGrapes.map((g) => {
              const cStyle = getColorHex(g.color);
              return (
                <div
                  key={g.name}
                  className="border border-[#E5DFD5] rounded-lg p-3.5 bg-[#FAF8F4] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-[#1C1817]">{g.name}</span>
                      <span className={`text-xs font-medium ${cStyle.text}`}>{g.color}</span>
                    </div>
                    <p className="text-xs text-[#4E4742] leading-relaxed">{g.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectGrapeAndGoToCellar(g.name)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#7B1E32] hover:underline w-fit"
                  >
                    Voir les vins de ce cépage
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-4">
          <div className="border-b border-[#E5DFD5] pb-3">
            <h2 className="font-editorial text-2xl font-semibold text-[#1C1817]">
              Vins incontournables disponibles
            </h2>
            <p className="text-xs text-[#665E5A] mt-1">
              Références majeures de {activeCountry.name} ({countryWines.length} fiches détaillées en cave)
            </p>
          </div>

          <ul className="space-y-2 text-xs text-[#352F2C]">
            {activeCountry.topAvailableWines.map((wineName) => (
              <li
                key={wineName}
                className="py-2 border-b border-[#E5DFD5] last:border-b-0 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B1E32] shrink-0" />
                <span className="font-medium">{wineName}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Region Selector + Interactive Graphic */}
      <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DFD5] pb-4">
          <div>
            <div className="text-xs text-[#665E5A]">
              Régions viticoles · {activeCountry.name}
            </div>
            <h2 className="font-editorial text-2xl font-semibold text-[#1C1817]">
              {activeRegion.name}
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {activeCountry.regions.map((r) => {
              const isSelected = r.id === activeRegion.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRegionId(r.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#1C1817] text-white border-[#1C1817]"
                      : "bg-[#FAF8F4] text-[#1C1817] border-[#D6CEBE] hover:border-[#1C1817]"
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  {r.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Integrated SVG Regional Graphic */}
        <RegionGraphic
          countryName={activeCountry.name}
          regionName={activeRegion.name}
          onSelectRegion={(reg) => setSelectedRegionId(reg.id)}
        />

        {/* Region Technical Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-editorial text-xl font-semibold text-[#1C1817]">
              Terroir & tradition de vinification
            </h3>
            <p className="text-sm text-[#352F2C] leading-relaxed">{activeRegion.description}</p>
            <p className="text-xs text-[#4E4742] leading-relaxed bg-[#F3EFE8] p-3.5 rounded-lg border border-[#E5DFD5]">
              <strong className="text-[#1C1817]">Vinification typique : </strong>
              {activeRegion.vinificationTradition}
            </p>
          </div>

          <div className="lg:col-span-5 space-y-3 text-xs">
            <div className="border border-[#E5DFD5] rounded-lg p-4 bg-[#FAF8F4] space-y-2.5">
              <div>
                <span className="text-[#665E5A] block">Climat</span>
                <span className="font-medium text-[#1C1817]">{activeRegion.climate}</span>
              </div>
              <div>
                <span className="text-[#665E5A] block">Appellations phares</span>
                <span className="font-medium text-[#1C1817]">
                  {activeRegion.flagshipAppellations.join(" · ")}
                </span>
              </div>
              <div>
                <span className="text-[#665E5A] block">Meilleurs millésimes (Rouge / Blanc)</span>
                <span className="font-mono-tabular font-semibold text-[#7B1E32]">
                  Rouge : {activeRegion.bestVintagesRed.join(", ") || "—"} · Blanc :{" "}
                  {activeRegion.bestVintagesWhite.join(", ") || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottles from this Region */}
        <div className="pt-4 border-t border-[#E5DFD5]">
          <h3 className="font-editorial text-xl font-semibold text-[#1C1817] mb-3">
            Bouteilles référencées de {activeRegion.name} ({regionWines.length})
          </h3>
          {regionWines.length === 0 ? (
            <p className="text-xs text-[#665E5A]">
              Sélectionnez une autre région ou ajoutez une bouteille de cette région via le bouton « Ajouter un vin ».
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regionWines.map((wine) => {
                const cStyle = getColorHex(wine.color);
                return (
                  <button
                    key={wine.id}
                    type="button"
                    onClick={() => onSelectWine(wine)}
                    className="text-left bg-[#FAF8F4] hover:bg-white border border-[#E5DFD5] hover:border-[#7B1E32] rounded-lg p-4 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#665E5A] mb-1">
                        <span
                          className="inline-block w-2 h-2 rounded-xs"
                          style={{ backgroundColor: cStyle.swatch }}
                        />
                        <span className={`font-semibold ${cStyle.text}`}>{wine.color}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{wine.appellation}</span>
                      </div>
                      <div className="font-editorial text-lg font-semibold text-[#1C1817]">
                        {wine.name}
                      </div>
                      <div className="text-xs text-[#665E5A] mt-0.5">{wine.producer}</div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-[#E5DFD5] flex items-center justify-between text-xs font-mono-tabular text-[#4E4742]">
                      <span>Millésime {wine.currentVintage} (Top {wine.bestVintage})</span>
                      <span>{wine.servingTempC.min}–{wine.servingTempC.max} °C</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
