import React, { useState, useMemo } from "react";
import { WineColor, UserLocation, FoodPairingResult, WineReference } from "../types/wine";
import { GRAPE_VARIETIES } from "../data/grapes";
import { buildLocalFallbackPairing, getColorHex } from "../utils/sommelierHelpers";
import { Search, Loader2, Thermometer, ExternalLink, UtensilsCrossed } from "lucide-react";

interface PairingsSommelierViewProps {
  location: UserLocation | null;
  wines: WineReference[];
  onSelectWine: (wine: WineReference) => void;
}

const PRESET_DISHES = [
  "Magret de canard aux figues et épices",
  "Mezzés libanais, taboulé, houmous & halloumi grillé",
  "Turbot sauvage rôti au beurre blanc",
  "Gigot d'agneau de 7 heures aux herbes",
  "Plateau de fruits de mer & huîtres",
  "Comté affiné 30 mois & morilles",
  "Bouillabaisse marseillaise",
  "Risotto crémeux aux truffes blanches",
];

export const PairingsSommelierView: React.FC<PairingsSommelierViewProps> = ({
  location,
  wines,
  onSelectWine,
}) => {
  // Real-time Dish Query State
  const [dishQuery, setDishQuery] = useState("");
  const [colorPreference, setColorPreference] = useState<string>("Toutes");
  const [grapePreference, setGrapePreference] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [pairingResult, setPairingResult] = useState<FoodPairingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Matrix Color + Grape Selector State
  const [matrixColor, setMatrixColor] = useState<WineColor>("Rouge");
  const availableGrapesForMatrix = useMemo(
    () => GRAPE_VARIETIES.filter((g) => g.colors.includes(matrixColor)),
    [matrixColor]
  );
  const [matrixGrapeId, setMatrixGrapeId] = useState<string>("cabernet-sauvignon");

  const activeMatrixGrape = useMemo(
    () =>
      availableGrapesForMatrix.find((g) => g.id === matrixGrapeId) ??
      availableGrapesForMatrix[0],
    [availableGrapesForMatrix, matrixGrapeId]
  );

  const matrixMatchingWines = useMemo(() => {
    if (!activeMatrixGrape) return [];
    return wines.filter(
      (w) =>
        w.color === matrixColor &&
        w.grapes.some((g) =>
          g.name.toLowerCase().includes(activeMatrixGrape.name.split(" (")[0].toLowerCase())
        )
    );
  }, [wines, matrixColor, activeMatrixGrape]);

  const runRealtimePairing = async (customDish?: string) => {
    const query = (customDish ?? dishQuery).trim();
    if (!query) return;
    if (customDish) setDishQuery(customDish);

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/pairing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dish: query,
          colorPreference,
          grapePreference,
          location,
        }),
      });
      if (!response.ok) {
        throw new Error("Service temps réel indisponible, bascule sur le moteur local.");
      }
      const data: FoodPairingResult = await response.json();
      setPairingResult({ ...data, source: "gemini" });
    } catch {
      const fallback = buildLocalFallbackPairing(
        query,
        colorPreference,
        grapePreference,
        location
      );
      setPairingResult(fallback);
      setErrorMsg("Analyse générée via le moteur œnologique local de la cave.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Real-Time Food & Wine Pairing Workbench */}
      <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 lg:p-8 space-y-6">
        <div className="border-b border-[#E5DFD5] pb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs text-[#665E5A] mb-1">
              Sommelier Interactif · Correspondance Couleur, Type de Vin, Millésimes &amp; Service
            </div>
            <h1 className="font-editorial text-3xl font-semibold text-[#1C1817]">
              Accords Mets &amp; Vins en Temps Réel
            </h1>
          </div>
          {location && (
            <div className="text-xs text-[#4E4742] font-mono-tabular">
              Position active : <strong className="text-[#1C1817]">{location.city}</strong> ({location.country})
            </div>
          )}
        </div>

        {/* Query Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <UtensilsCrossed className="w-4 h-4 text-[#665E5A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dishQuery}
                onChange={(e) => setDishQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runRealtimePairing()}
                placeholder="Saisissez un plat ou un aliment (ex : Magret de canard aux cerises, Bar rôti, Comté...)"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#D6CEBE] bg-[#FAF8F4] text-sm text-[#1C1817] focus:outline-none focus:border-[#7B1E32] focus:bg-white"
              />
            </div>

            <div className="lg:col-span-2">
              <select
                value={colorPreference}
                onChange={(e) => setColorPreference(e.target.value)}
                className="w-full py-3 px-3 rounded-lg border border-[#D6CEBE] bg-[#FAF8F4] text-xs font-medium text-[#1C1817]"
                aria-label="Préférence de couleur"
              >
                <option value="Toutes">Toute couleur</option>
                <option value="Rouge">Rouge uniquement</option>
                <option value="Blanc">Blanc uniquement</option>
                <option value="Rosé">Rosé uniquement</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={grapePreference}
                onChange={(e) => setGrapePreference(e.target.value)}
                className="w-full py-3 px-3 rounded-lg border border-[#D6CEBE] bg-[#FAF8F4] text-xs font-medium text-[#1C1817]"
                aria-label="Cépage optionnel"
              >
                <option value="">Cépage libre</option>
                {GRAPE_VARIETIES.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => runRealtimePairing()}
                disabled={isLoading || !dishQuery.trim()}
                className="w-full h-full py-3 px-4 rounded-lg bg-[#7B1E32] hover:bg-[#611626] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Accord...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Trouver l&apos;accord
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Dish Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#665E5A] mr-1">Suggestions rapides :</span>
            {PRESET_DISHES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => runRealtimePairing(preset)}
                className="px-2.5 py-1 rounded-md border border-[#E5DFD5] bg-[#FAF8F4] hover:border-[#7B1E32] text-xs text-[#352F2C] transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && <p className="text-xs text-[#665E5A] italic">{errorMsg}</p>}

        {/* Real-time Pairing Output */}
        {pairingResult && (
          <div className="pt-4 border-t border-[#E5DFD5] space-y-6">
            {/* Summary Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-[#FAF8F4] border border-[#D6CEBE] rounded-lg p-5">
              <div className="lg:col-span-8 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-[#7B1E32]">
                    Couleur recommandée : {pairingResult.recommendedColor}
                  </span>
                  {pairingResult.secondaryColor && pairingResult.secondaryColor !== "Aucune" && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#4E4742]">
                        Alternative : {pairingResult.secondaryColor}
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[#1C1817]">{pairingResult.wineStyle}</span>
                </div>

                <h2 className="font-editorial text-2xl font-semibold text-[#1C1817]">
                  Accord pour « {dishQuery} »
                </h2>
                <p className="text-xs text-[#4E4742] leading-relaxed">{pairingResult.dishAnalysis}</p>
                <p className="text-sm text-[#1C1817] leading-relaxed">
                  {pairingResult.sommelierRationale}
                </p>
              </div>

              <div className="lg:col-span-4 bg-white border border-[#E5DFD5] rounded-lg p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-2">
                  <span className="font-semibold text-[#1C1817]">Service idéal</span>
                  <span className="font-mono-tabular font-semibold text-[#7B1E32] flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    {pairingResult.servingAdvice.tempMinC}–{pairingResult.servingAdvice.tempMaxC} °C
                  </span>
                </div>
                <div>
                  <span className="text-[#665E5A] block">Carafage</span>
                  <span className="text-[#1C1817]">{pairingResult.servingAdvice.decanting}</span>
                </div>
                <div>
                  <span className="text-[#665E5A] block">Verrerie</span>
                  <span className="text-[#1C1817]">{pairingResult.servingAdvice.glassware}</span>
                </div>
                <div className="pt-1 border-t border-[#E5DFD5]">
                  <span className="text-[#665E5A] block">Conseil selon votre position</span>
                  <span className="text-[#352F2C]">{pairingResult.localAvailabilityTip}</span>
                </div>
              </div>
            </div>

            {/* Grapes + Appellations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-[#E5DFD5] rounded-lg p-5 space-y-3">
                <h3 className="font-editorial text-xl font-semibold text-[#1C1817]">
                  Cépages recommandés
                </h3>
                <div className="space-y-3">
                  {pairingResult.idealGrapes.map((g) => (
                    <div key={g.name} className="border-b border-[#E5DFD5] last:border-b-0 pb-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#1C1817]">
                        <span>{g.name}</span>
                        <span className="text-[#7B1E32]">{g.color}</span>
                      </div>
                      <p className="text-xs text-[#4E4742] mt-1">{g.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-[#E5DFD5] rounded-lg p-5 space-y-3">
                <h3 className="font-editorial text-xl font-semibold text-[#1C1817]">
                  Appellations &amp; Meilleures Années
                </h3>
                <div className="space-y-3">
                  {pairingResult.recommendedAppellations.map((a) => (
                    <div key={a.appellation} className="border-b border-[#E5DFD5] last:border-b-0 pb-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1C1817]">{a.appellation}</span>
                        <span className="font-mono-tabular text-[#665E5A]">{a.servingTempC}</span>
                      </div>
                      <div className="text-xs text-[#665E5A]">
                        {a.country} · {a.region}
                      </div>
                      <div className="text-xs font-mono-tabular text-[#7B1E32] mt-0.5">
                        Meilleurs millésimes : {a.bestVintages}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Specific Bottles & Merchant Sites */}
            <div>
              <h3 className="font-editorial text-xl font-semibold text-[#1C1817] mb-3">
                Bouteilles accordées &amp; sites marchands
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pairingResult.specificBottles.map((b) => (
                  <div
                    key={b.name}
                    className="border border-[#E5DFD5] rounded-lg p-4 bg-[#FAF8F4] flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs text-[#665E5A] mb-1">
                        <span className="font-semibold text-[#7B1E32]">{b.color}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{b.country}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{b.region}</span>
                      </div>
                      <div className="font-editorial text-lg font-semibold text-[#1C1817]">
                        {b.name}
                      </div>
                      <div className="text-xs text-[#665E5A]">{b.producer}</div>
                      <div className="mt-2 font-mono-tabular text-xs text-[#4E4742]">
                        Millésime {b.vintage} (Top {b.bestVintage}) · {b.abv}% · {b.strengthLabel}
                      </div>
                      <p className="text-xs text-[#352F2C] mt-2 leading-relaxed">
                        {b.pairingReason}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-[#E5DFD5] flex flex-wrap gap-2">
                      {b.merchantNames.slice(0, 3).map((mName) => {
                        const q = encodeURIComponent(`${b.name} ${b.producer}`);
                        const href = mName.toLowerCase().includes("ideal")
                          ? `https://www.idealwine.com/fr/acheter-vin/${q}.jsp`
                          : mName.toLowerCase().includes("vinatis")
                          ? `https://www.vinatis.com/recherche?search=${q}`
                          : mName.toLowerCase().includes("milles")
                          ? `https://www.millesima.fr/catalogsearch/result/?q=${q}`
                          : `https://www.wine-searcher.com/find/${q}`;
                        return (
                          <a
                            key={mName}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7B1E32] hover:underline"
                          >
                            {mName}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color + Grape Pairing Matrix */}
      <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DFD5] pb-4">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#1C1817]">
              Accords Mets &amp; Vins selon la Couleur et le Cépage
            </h2>
            <p className="text-xs text-[#665E5A]">
              Choisissez une couleur puis un cépage pour obtenir les accords gastronomiques et
              références correspondantes
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F3EFE8] rounded-lg border border-[#E5DFD5]">
            {(["Rouge", "Blanc", "Rosé"] as WineColor[]).map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => {
                  setMatrixColor(col);
                  const first = GRAPE_VARIETIES.find((g) => g.colors.includes(col));
                  if (first) setMatrixGrapeId(first.id);
                }}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  matrixColor === col
                    ? "bg-[#7B1E32] text-white"
                    : "text-[#4E4742] hover:text-[#1C1817]"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {availableGrapesForMatrix.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setMatrixGrapeId(g.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
                activeMatrixGrape?.id === g.id
                  ? "bg-[#1C1817] text-white border-[#1C1817]"
                  : "bg-[#FAF8F4] text-[#1C1817] border-[#D6CEBE] hover:border-[#1C1817]"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {activeMatrixGrape && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-6 bg-[#FAF8F4] border border-[#E5DFD5] rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-2xl font-semibold text-[#1C1817]">
                  {activeMatrixGrape.name} ({matrixColor})
                </h3>
                <span className="font-mono-tabular text-xs font-semibold text-[#7B1E32]">
                  {activeMatrixGrape.servingTempC}
                </span>
              </div>
              <p className="text-xs text-[#352F2C] leading-relaxed">
                {activeMatrixGrape.description}
              </p>
              <div className="pt-2 border-t border-[#E5DFD5]">
                <div className="text-xs font-semibold text-[#1C1817] mb-2">
                  Plats &amp; accords idéaux pour ce cépage en {matrixColor} :
                </div>
                <ul className="space-y-1.5 text-xs text-[#352F2C]">
                  {(activeMatrixGrape.pairingsByColor[matrixColor] ?? []).map((dish) => (
                    <li key={dish} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7B1E32]" />
                      <span>{dish}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-semibold text-[#1C1817]">
                Références de cave correspondantes ({matrixMatchingWines.length})
              </div>
              {matrixMatchingWines.length === 0 ? (
                <p className="text-xs text-[#665E5A]">
                  Aucune bouteille spécifique enregistrée pour cette combinaison exacte. Utilisez le
                  moteur temps réel ci-dessus pour explorer les cuvées mondiales.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {matrixMatchingWines.map((wine) => {
                    const cStyle = getColorHex(wine.color);
                    return (
                      <button
                        key={wine.id}
                        type="button"
                        onClick={() => onSelectWine(wine)}
                        className="w-full text-left border border-[#E5DFD5] hover:border-[#7B1E32] bg-[#FAF8F4] hover:bg-white rounded-lg p-3.5 transition-colors flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-[11px] text-[#665E5A]">
                            <span className={`font-semibold ${cStyle.text}`}>{wine.color}</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {wine.country} — {wine.region}
                            </span>
                          </div>
                          <div className="font-editorial text-lg font-semibold text-[#1C1817]">
                            {wine.name}
                          </div>
                        </div>
                        <div className="text-right font-mono-tabular text-xs text-[#4E4742] shrink-0">
                          <div>{wine.currentVintage} (Top {wine.bestVintage})</div>
                          <div>{wine.servingTempC.min}–{wine.servingTempC.max} °C</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
