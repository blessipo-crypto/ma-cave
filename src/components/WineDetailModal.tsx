import React, { useState, useEffect } from "react";
import { X, ExternalLink, Thermometer, Star, Wine as WineIcon, Check, Plus, Minus } from "lucide-react";
import { WineReference, PersonalTastingNote } from "../types/wine";
import { RegionGraphic } from "./RegionGraphic";
import { WineSensoryRadar, DrinkingWindowTimeline } from "./WineCharts";
import { getColorHex, getStrengthLabel } from "../utils/sommelierHelpers";

interface WineDetailModalProps {
  wine: WineReference | null;
  note?: PersonalTastingNote;
  onSaveNote: (note: PersonalTastingNote) => void;
  onClose: () => void;
  onSelectGrape?: (grapeName: string) => void;
}

export const WineDetailModal: React.FC<WineDetailModalProps> = ({
  wine,
  note,
  onSaveNote,
  onClose,
  onSelectGrape,
}) => {
  const [tasted, setTasted] = useState(note?.tasted ?? false);
  const [bottlesInCellar, setBottlesInCellar] = useState(note?.bottlesInCellar ?? 0);
  const [score20, setScore20] = useState(note?.score20 ?? 16);
  const [stars, setStars] = useState(note?.stars ?? 4);
  const [robeRating, setRobeRating] = useState(note?.robeRating ?? 4);
  const [nezRating, setNezRating] = useState(note?.nezRating ?? 4);
  const [boucheRating, setBoucheRating] = useState(note?.boucheRating ?? 4);
  const [longueurRating, setLongueurRating] = useState(note?.longueurRating ?? 4);
  const [favoriteVintage, setFavoriteVintage] = useState(
    note?.favoriteVintage ?? wine?.currentVintage ?? 2020
  );
  const [notesText, setNotesText] = useState(note?.notes ?? "");
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (!wine) return;
    setTasted(note?.tasted ?? false);
    setBottlesInCellar(note?.bottlesInCellar ?? 0);
    setScore20(note?.score20 ?? 16);
    setStars(note?.stars ?? 4);
    setRobeRating(note?.robeRating ?? 4);
    setNezRating(note?.nezRating ?? 4);
    setBoucheRating(note?.boucheRating ?? 4);
    setLongueurRating(note?.longueurRating ?? 4);
    setFavoriteVintage(note?.favoriteVintage ?? wine.currentVintage);
    setNotesText(note?.notes ?? "");
    setSavedToast(false);
  }, [wine, note]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!wine) return null;

  const colorStyle = getColorHex(wine.color);

  const handleSave = () => {
    onSaveNote({
      wineId: wine.id,
      tasted,
      bottlesInCellar,
      score20,
      stars,
      robeRating,
      nezRating,
      boucheRating,
      longueurRating,
      favoriteVintage,
      tastedDate: new Date().toISOString().slice(0, 10),
      notes: notesText,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2400);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1A1817]/55 backdrop-blur-[3px] flex items-center justify-center p-4 lg:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF9F6] border border-[#DFD8CC] rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Dossier Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#E8E2D9] px-6 py-4 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#645D58] mb-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: colorStyle.swatch }}
              />
              <span className={`font-semibold ${colorStyle.text}`}>{wine.color}</span>
              <span aria-hidden="true">·</span>
              <span>{wine.country}</span>
              <span aria-hidden="true">·</span>
              <span>{wine.region}</span>
              <span aria-hidden="true">·</span>
              <span>{wine.appellation}</span>
            </div>
            <h2 className="font-editorial text-2xl lg:text-3xl font-semibold text-[#1A1817] leading-tight">
              {wine.name}
            </h2>
            <p className="text-sm text-[#645D58] mt-0.5">{wine.producer}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-[#E8E2D9] bg-[#FAF9F6] hover:bg-[#F2EFE9] text-[#1A1817] transition-colors shrink-0"
            aria-label="Fermer la fiche"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Key Technical Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-[#E8E2D9] rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(26,24,23,0.04)]">
              <div>
                <div className="text-xs text-[#645D58]">Millésime conseillé</div>
                <div className="font-mono-tabular text-xl font-semibold text-[#1A1817]">
                  {wine.currentVintage}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#645D58]">Meilleure année</div>
                <div className="font-mono-tabular text-xl font-semibold text-[#821D35]">
                  {wine.bestVintage}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#645D58]">Degré d&apos;alcool</div>
                <div className="font-mono-tabular text-xl font-semibold text-[#1A1817]">
                  {wine.abv.toFixed(1)} %
                </div>
              </div>
              <div>
                <div className="text-xs text-[#645D58]">Température idéale</div>
                <div className="font-mono-tabular text-xl font-semibold text-[#1A1817]">
                  {wine.servingTempC.min}–{wine.servingTempC.max} °C
                </div>
              </div>
            </div>

            {/* Graphic Sensory & Timeline Duo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WineSensoryRadar wine={wine} />
              <div className="flex flex-col justify-between gap-4">
                <DrinkingWindowTimeline
                  currentVintage={wine.currentVintage}
                  bestVintage={wine.bestVintage}
                  drinkingWindow={wine.drinkingWindow}
                  color={wine.color}
                />
                <div className="bg-white border border-[#E8E2D9] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1A1817]">Force &amp; Structure</span>
                    <span className="font-medium text-[#821D35]">{getStrengthLabel(wine.strength)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <span
                        key={lvl}
                        className={`flex-1 h-2 rounded-full ${
                          lvl <= wine.strength ? "bg-[#821D35]" : "bg-[#E8E2D9]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {wine.grapes.map((g) => (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => {
                          onSelectGrape?.(g.name);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#F5F2EB] hover:bg-[#EAE3D7] border border-[#E2DBD0] text-xs font-medium text-[#1A1817] transition-colors whitespace-nowrap"
                      >
                        {g.name}
                        {g.percentage ? (
                          <span className="font-mono-tabular text-[#645D58] ml-1.5">
                            {g.percentage}%
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Integrated Country & Region Graphic */}
            <div>
              <h3 className="font-editorial text-xl font-semibold text-[#1A1817] mb-2.5">
                Origine géographique &amp; graphique du terroir
              </h3>
              <RegionGraphic countryName={wine.country} regionName={wine.region} />
            </div>

            {/* Technical Vinification & Surface Viticole */}
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 space-y-4">
              <h3 className="font-editorial text-xl font-semibold text-[#1A1817]">
                Vinification &amp; surface viticole
              </h3>
              <p className="text-sm text-[#352F2C] leading-relaxed">{wine.vinification}</p>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-3 border-t border-[#E8E2D9] text-xs">
                <div>
                  <dt className="text-[#645D58]">Surface du domaine</dt>
                  <dd className="font-mono-tabular font-semibold text-[#1A1817] mt-0.5 text-sm">
                    {wine.vineyardSurfaceHa} hectares
                  </dd>
                </div>
                <div>
                  <dt className="text-[#645D58]">Surface de la région ({wine.region})</dt>
                  <dd className="font-mono-tabular font-semibold text-[#1A1817] mt-0.5 text-sm">
                    {wine.regionSurfaceHa.toLocaleString("fr-FR")} hectares
                  </dd>
                </div>
                <div>
                  <dt className="text-[#645D58]">Nature des sols</dt>
                  <dd className="font-medium text-[#1A1817] mt-0.5">{wine.soilType}</dd>
                </div>
                <div>
                  <dt className="text-[#645D58]">Altitude &amp; Rendement</dt>
                  <dd className="font-mono-tabular font-medium text-[#1A1817] mt-0.5">
                    {wine.altitudeM} · {wine.yieldHlHa}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[#645D58]">Autres grands millésimes conseillés</dt>
                  <dd className="font-mono-tabular font-medium text-[#1A1817] mt-0.5">
                    {wine.otherTopVintages.join(" · ")}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Merchant Reference Sites */}
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5">
              <h3 className="font-editorial text-xl font-semibold text-[#1A1817] mb-1">
                Sites référençant ce vin à la vente
              </h3>
              <p className="text-xs text-[#645D58] mb-3">
                Consultez la disponibilité et la cote actuelle sur les places marchandes :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {wine.merchants.map((m) => (
                  <a
                    key={m.name}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF9F6] hover:border-[#821D35] hover:bg-white transition-colors text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#1A1817]">{m.name}</div>
                      <div className="text-[#645D58] text-[11px]">{m.type}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#821D35] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Conseils Techniques de Dégustation & Service */}
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
                <h3 className="font-editorial text-xl font-semibold text-[#1A1817]">
                  Conseils techniques de dégustation
                </h3>
                <span className="flex items-center gap-1 text-xs font-mono-tabular text-[#821D35] font-semibold">
                  <Thermometer className="w-3.5 h-3.5" />
                  {wine.servingTempC.min}–{wine.servingTempC.max} °C
                </span>
              </div>

              <div className="space-y-3 text-sm leading-relaxed">
                <div>
                  <span className="font-semibold text-xs text-[#1A1817] block">Examen visuel (Robe)</span>
                  <span className="text-[#4E4742] text-xs">{wine.tastingNotes.robe}</span>
                </div>
                <div>
                  <span className="font-semibold text-xs text-[#1A1817] block">Examen olfactif (Nez)</span>
                  <span className="text-[#4E4742] text-xs">{wine.tastingNotes.nez}</span>
                </div>
                <div>
                  <span className="font-semibold text-xs text-[#1A1817] block">Examen gustatif (Bouche)</span>
                  <span className="text-[#4E4742] text-xs">{wine.tastingNotes.bouche}</span>
                </div>
                <div>
                  <span className="font-semibold text-xs text-[#1A1817] block">Finale &amp; Caudalies</span>
                  <span className="text-[#4E4742] text-xs">{wine.tastingNotes.finale}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E2D9] space-y-1.5 text-xs">
                <div>
                  <span className="font-semibold text-[#1A1817]">Carafage : </span>
                  <span className="text-[#4E4742]">{wine.decanting}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#1A1817]">Verrerie recommandée : </span>
                  <span className="text-[#4E4742]">{wine.glassware}</span>
                </div>
              </div>
            </div>

            {/* Accords Mets & Vins */}
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5">
              <h3 className="font-editorial text-xl font-semibold text-[#1A1817] mb-2.5">
                Accords mets et vins recommandés
              </h3>
              <ul className="space-y-2 text-sm text-[#352F2C]">
                {wine.foodPairings.map((dish) => (
                  <li key={dish} className="flex items-start gap-2.5">
                    <WineIcon className="w-4 h-4 text-[#821D35] mt-0.5 shrink-0" />
                    <span>{dish}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Personal Rating & Cellar Management */}
            <div className="bg-[#F4F0E8] border border-[#DDD5C7] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-xl font-semibold text-[#1A1817]">
                  Ma notation &amp; suivi en cave
                </h3>
                <button
                  type="button"
                  onClick={() => setTasted(!tasted)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                    tasted
                      ? "bg-[#821D35] text-white border-[#821D35]"
                      : "bg-white text-[#1A1817] border-[#D6CEBE] hover:border-[#821D35]"
                  }`}
                >
                  {tasted ? "Bouteille dégustée" : "Marquer dégustée"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-[#E8E2D9] rounded-xl p-3">
                  <div className="text-[11px] text-[#645D58] mb-1">En cave (bouteilles)</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBottlesInCellar(Math.max(0, bottlesInCellar - 1))}
                      className="p-1 rounded-lg border border-[#E8E2D9] hover:bg-[#F2EFE9]"
                      aria-label="Retirer une bouteille"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono-tabular font-semibold text-sm w-6 text-center">
                      {bottlesInCellar}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBottlesInCellar(bottlesInCellar + 1)}
                      className="p-1 rounded-lg border border-[#E8E2D9] hover:bg-[#F2EFE9]"
                      aria-label="Ajouter une bouteille"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="bg-white border border-[#E8E2D9] rounded-xl p-3">
                  <label className="text-[11px] text-[#645D58] block mb-1">
                    Millésime dégusté
                  </label>
                  <input
                    type="number"
                    min={1950}
                    max={2026}
                    value={favoriteVintage}
                    onChange={(e) => setFavoriteVintage(Number(e.target.value))}
                    className="w-full font-mono-tabular text-sm font-semibold text-[#1A1817] bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-white border border-[#E8E2D9] rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1A1817]">Note globale (/20)</span>
                  <span className="font-mono-tabular text-base font-bold text-[#821D35]">
                    {score20.toFixed(1)} / 20
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={20}
                  step={0.5}
                  value={score20}
                  onChange={(e) => setScore20(Number(e.target.value))}
                  className="w-full accent-[#821D35]"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#645D58]">Appréciation</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStars(s)}
                        aria-label={`${s} étoiles`}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= stars
                              ? "fill-[#B58932] text-[#B58932]"
                              : "text-[#D6CEBE]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {[
                  { label: "Robe", val: robeRating, setter: setRobeRating },
                  { label: "Nez", val: nezRating, setter: setNezRating },
                  { label: "Bouche", val: boucheRating, setter: setBoucheRating },
                  { label: "Longueur", val: longueurRating, setter: setLongueurRating },
                ].map((metric) => (
                  <div key={metric.label} className="bg-white border border-[#E8E2D9] rounded-xl p-2.5">
                    <div className="flex justify-between mb-1">
                      <span className="text-[#645D58]">{metric.label}</span>
                      <span className="font-mono-tabular font-semibold">{metric.val}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={metric.val}
                      onChange={(e) => metric.setter(Number(e.target.value))}
                      className="w-full accent-[#821D35]"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1817] block mb-1.5">
                  Commentaires personnels de dégustation
                </label>
                <textarea
                  rows={3}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Impressions au nez, évolution à l'ouverture, accord réalisé à table..."
                  className="w-full rounded-xl border border-[#DFD8CC] bg-white px-3 py-2 text-xs text-[#1A1817] focus:outline-none focus:border-[#821D35]"
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2.5 px-4 rounded-xl bg-[#821D35] hover:bg-[#691529] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {savedToast ? (
                  <>
                    <Check className="w-4 h-4" />
                    Évaluation enregistrée dans ma cave
                  </>
                ) : (
                  "Enregistrer ma note de dégustation"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
