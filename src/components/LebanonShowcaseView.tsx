import React, { useState } from "react";
import { COUNTRIES_ATLAS } from "../data/regions";
import { GRAPE_VARIETIES } from "../data/grapes";
import { WineReference } from "../types/wine";
import { RegionGraphic } from "./RegionGraphic";
import { getColorHex } from "../utils/sommelierHelpers";
import { MapPin, Mountain, Sun, Wine } from "lucide-react";

interface LebanonShowcaseViewProps {
  wines: WineReference[];
  onSelectWine: (wine: WineReference) => void;
  onSelectGrapeAndGoToCellar: (grapeName: string) => void;
}

export const LebanonShowcaseView: React.FC<LebanonShowcaseViewProps> = ({
  wines,
  onSelectWine,
  onSelectGrapeAndGoToCellar,
}) => {
  const lebanon = COUNTRIES_ATLAS.find((c) => c.id === "liban")!;
  const [activeRegionId, setActiveRegionId] = useState(lebanon.regions[0].id);
  const activeRegion =
    lebanon.regions.find((r) => r.id === activeRegionId) ?? lebanon.regions[0];

  const lebaneseWines = wines.filter((w) => w.country.toLowerCase() === "liban");
  const indigenousGrapes = GRAPE_VARIETIES.filter((g) => g.originCountry === "Liban");

  return (
    <div className="space-y-8">
      {/* Editorial Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#E5DFD5] rounded-xl overflow-hidden items-stretch">
        <div className="lg:col-span-6 p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#665E5A] mb-2">
              Focus Patrimoine · 5 000 ans d&apos;histoire viticole phénicienne
            </div>
            <h1 className="font-editorial text-3xl lg:text-4xl font-semibold text-[#1C1817] leading-tight">
              Les Vins du Liban & leurs Terroirs d&apos;Altitude
            </h1>
            <p className="text-sm text-[#352F2C] mt-3 leading-relaxed">
              De la plaine millénaire de la <strong>Vallée de la Bekaa</strong> aux terrasses
              calcaires vertigineuses de <strong>Batroun</strong> et du <strong>Mont-Liban</strong>,
              le vignoble libanais s&apos;étend sur environ{" "}
              <span className="font-mono-tabular font-semibold">2 510 hectares</span> entre 850 et
              1 800 mètres d&apos;altitude. Protégé de l&apos;humidité maritime par la chaîne du
              Mont-Liban, il offre plus de 300 jours de soleil par an et une viticulture
              naturellement saine.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-[#E5DFD5]">
            <div>
              <div className="text-[11px] text-[#665E5A]">Surface totale</div>
              <div className="font-mono-tabular text-lg font-semibold text-[#1C1817]">2 510 ha</div>
            </div>
            <div>
              <div className="text-[11px] text-[#665E5A]">Altitude moyenne</div>
              <div className="font-mono-tabular text-lg font-semibold text-[#7B1E32]">
                900 – 1 800 m
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#665E5A]">Cépages indigènes</div>
              <div className="text-sm font-semibold text-[#1C1817] mt-0.5">Obeidi &amp; Merwah</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative min-h-[280px] bg-[#EFEAE0]">
          <img
            src="/src/assets/images/bekaa_valley_vineyard_1794793378905.jpg"
            alt="Vignoble de la Vallée de la Bekaa au Liban face au Mont-Liban enneigé"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
            <div className="text-xs text-white/85">
              Vallée de la Bekaa (1 000 m) · Mont-Liban &amp; Anti-Liban
            </div>
            <div className="font-editorial text-xl font-semibold mt-0.5">
              Terroirs calcaires baignés de soleil, rafraîchis par les neiges montagnardes
            </div>
          </div>
        </div>
      </div>

      {/* Topographic Cross-Section Graphic (Mediterranean -> Mount Lebanon -> Bekaa -> Anti-Lebanon) */}
      <div className="bg-white border border-[#E5DFD5] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#1C1817]">
              Coupe topographique & microclimat des vignobles libanais
            </h2>
            <p className="text-xs text-[#665E5A]">
              Pourquoi l&apos;altitude (900 à 1 800 m) préserve une acidité cristalline sous latitude
              méditerranéenne (34° N)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#4E4742]">
            <span className="flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-[#7B1E32]" />
              Amplitudes thermiques de 18 °C jour/nuit
            </span>
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-[#9A7B3E]" />
              3 100 h d&apos;ensoleillement/an
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 900 210"
          className="w-full h-auto border border-[#E5DFD5] rounded-lg bg-[#FAF8F4]"
          role="img"
          aria-label="Coupe topographique des régions viticoles du Liban"
        >
          {/* Sea */}
          <rect x="0" y="165" width="120" height="45" fill="#DCE4EA" />
          <text x="60" y="188" fontSize="10" textAnchor="middle" fill="#4E6172" fontWeight="600">
            Méditerranée (0 m)
          </text>

          {/* Mountain profile */}
          <path
            d="M120,165 L185,130 L270,82 L355,34 L415,108 L595,112 L685,62 L815,28 L900,58 L900,210 L120,210 Z"
            fill="#EAE3D5"
            stroke="#B8AE9B"
            strokeWidth="1.5"
          />

          {/* Altitude reference lines */}
          <line x1="120" y1="110" x2="880" y2="110" stroke="#D6CEBE" strokeDasharray="3 3" />
          <text x="885" y="106" fontSize="9" textAnchor="end" fill="#665E5A">
            1 000 m
          </text>
          <line x1="120" y1="62" x2="880" y2="62" stroke="#D6CEBE" strokeDasharray="3 3" />
          <text x="885" y="58" fontSize="9" textAnchor="end" fill="#665E5A">
            1 800 m
          </text>

          {/* Vineyard zones */}
          <circle cx="245" cy="96" r="6" fill="#7B1E32" />
          <text x="245" y="76" fontSize="10" textAnchor="middle" fontWeight="700" fill="#1C1817">
            Batroun &amp; Mont-Liban
          </text>
          <text x="245" y="88" fontSize="9" textAnchor="middle" fill="#665E5A">
            400 – 1 800 m (Merwah, Syrah)
          </text>

          <circle cx="505" cy="110" r="7" fill="#7B1E32" />
          <rect
            x="415"
            y="110"
            width="180"
            height="10"
            fill="#7B1E32"
            fillOpacity="0.2"
          />
          <text x="505" y="138" fontSize="11" textAnchor="middle" fontWeight="700" fill="#7B1E32">
            Vallée de la Bekaa (75 % du vignoble)
          </text>
          <text x="505" y="152" fontSize="9.5" textAnchor="middle" fill="#4E4742">
            900 – 1 350 m · Calcaires &amp; Argiles rouges (Musar, Ksara, Kefraya, Massaya, Tourelles)
          </text>

          <text x="355" y="25" fontSize="9.5" textAnchor="middle" fontWeight="600" fill="#4E4742">
            Crête du Mont-Liban (3 088 m)
          </text>
          <text x="795" y="22" fontSize="9.5" textAnchor="middle" fontWeight="600" fill="#4E4742">
            Anti-Liban (Obeidi)
          </text>
        </svg>
      </div>

      {/* Interactive Region Explorer for Lebanon */}
      <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DFD5] pb-4">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#1C1817]">
              Les 4 grandes régions viticoles du Liban
            </h2>
            <p className="text-xs text-[#665E5A]">
              Cliquez sur une région sur la carte ou ci-contre pour inspecter son terroir
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {lebanon.regions.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRegionId(r.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  r.id === activeRegion.id
                    ? "bg-[#7B1E32] text-white border-[#7B1E32]"
                    : "bg-[#FAF8F4] text-[#1C1817] border-[#D6CEBE] hover:border-[#7B1E32]"
                }`}
              >
                <MapPin className="w-3 h-3" />
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <RegionGraphic
          countryName="Liban"
          regionName={activeRegion.name}
          onSelectRegion={(reg) => setActiveRegionId(reg.id)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-editorial text-xl font-semibold text-[#1C1817]">
              {activeRegion.name} — Caractère œnologique
            </h3>
            <p className="text-sm text-[#352F2C] leading-relaxed">{activeRegion.description}</p>
            <p className="text-xs text-[#4E4742] bg-[#F3EFE8] p-3.5 rounded-lg border border-[#E5DFD5] leading-relaxed">
              <strong className="text-[#1C1817]">Vinification &amp; élevage : </strong>
              {activeRegion.vinificationTradition}
            </p>
          </div>
          <div className="lg:col-span-5 bg-[#FAF8F4] border border-[#E5DFD5] rounded-lg p-4 space-y-2.5 text-xs">
            <div>
              <span className="text-[#665E5A] block">Sous-appellations &amp; villages viticoles</span>
              <span className="font-semibold text-[#1C1817]">
                {activeRegion.flagshipAppellations.join(" · ")}
              </span>
            </div>
            <div>
              <span className="text-[#665E5A] block">Cépages majeurs</span>
              <span className="font-medium text-[#1C1817]">
                {activeRegion.topGrapes.join(" · ")}
              </span>
            </div>
            <div>
              <span className="text-[#665E5A] block">Meilleures années (Rouge / Blanc)</span>
              <span className="font-mono-tabular font-semibold text-[#7B1E32]">
                Rouge : {activeRegion.bestVintagesRed.join(", ")} · Blanc :{" "}
                {activeRegion.bestVintagesWhite.join(", ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Indigenous Lebanese Grapes */}
      <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-4">
        <div className="border-b border-[#E5DFD5] pb-3">
          <h2 className="font-editorial text-2xl font-semibold text-[#1C1817]">
            Trésors ampélographiques : les cépages indigènes du Liban
          </h2>
          <p className="text-xs text-[#665E5A]">
            Vignes pré-phylloxériques millénaires cultivées en altitude
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {indigenousGrapes.map((g) => (
            <div
              key={g.id}
              className="border border-[#E5DFD5] rounded-lg p-5 bg-[#FAF8F4] flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-editorial text-xl font-semibold text-[#1C1817]">{g.name}</h3>
                  <span className="text-xs font-semibold text-[#8A6914]">Blanc</span>
                </div>
                <p className="text-xs text-[#352F2C] leading-relaxed">{g.description}</p>
                <div className="text-xs text-[#4E4742]">
                  <strong className="text-[#1C1817]">Arômes : </strong>
                  {g.aromaticProfile.join(" · ")}
                </div>
                <div className="text-xs text-[#4E4742]">
                  <strong className="text-[#1C1817]">Vinification : </strong>
                  {g.vinificationStyle}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectGrapeAndGoToCellar(g.name)}
                className="mt-4 text-xs font-semibold text-[#7B1E32] hover:underline text-left"
              >
                Explorer les cuvées à base de {g.name.split(" ")[0]} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lebanese Wine References */}
      <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#1C1817]">
              Grands Vins Libanais en Cave ({lebaneseWines.length})
            </h2>
            <p className="text-xs text-[#665E5A]">
              Cliquez sur un flacon pour accéder à sa vinification, ses meilleures années et sites marchands
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lebaneseWines.map((wine) => {
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
                    <span>{wine.region}</span>
                  </div>
                  <div className="font-editorial text-lg font-semibold text-[#1C1817]">
                    {wine.name}
                  </div>
                  <div className="text-xs text-[#665E5A] mt-0.5">{wine.producer}</div>
                  <div className="text-xs text-[#4E4742] mt-2">
                    {wine.grapes.map((g) => g.name.split(" (")[0]).join(" · ")}
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#E5DFD5] flex items-center justify-between text-xs font-mono-tabular text-[#4E4742]">
                  <span>
                    <Wine className="w-3 h-3 inline mr-1 text-[#7B1E32]" />
                    Top : {wine.bestVintage}
                  </span>
                  <span>
                    {wine.abv.toFixed(1)}% · {wine.servingTempC.min}–{wine.servingTempC.max} °C
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
