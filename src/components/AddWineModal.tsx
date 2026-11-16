import React, { useState } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { WineReference, WineColor, StrengthLevel } from "../types/wine";

interface AddWineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWine: (wine: WineReference) => void;
}

export const AddWineModal: React.FC<AddWineModalProps> = ({ isOpen, onClose, onAddWine }) => {
  const [lookupQuery, setLookupQuery] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [producer, setProducer] = useState("");
  const [color, setColor] = useState<WineColor>("Rouge");
  const [country, setCountry] = useState("France");
  const [region, setRegion] = useState("Bordeaux");
  const [appellation, setAppellation] = useState("");
  const [grapesText, setGrapesText] = useState("Cabernet Sauvignon, Merlot");
  const [abv, setAbv] = useState(13.5);
  const [strength, setStrength] = useState<StrengthLevel>(4);
  const [currentVintage, setCurrentVintage] = useState(2020);
  const [bestVintage, setBestVintage] = useState(2016);
  const [drinkingWindow, setDrinkingWindow] = useState("2025 – 2040");
  const [tempMin, setTempMin] = useState(16);
  const [tempMax, setTempMax] = useState(18);
  const [decanting, setDecanting] = useState("Carafage 1 heure recommandé.");
  const [glassware, setGlassware] = useState("Grand verre tulipe");
  const [vinification, setVinification] = useState(
    "Vendanges manuelles, fermentation en cuves thermo-régulées et élevage de 14 mois en fûts de chêne français."
  );
  const [vineyardSurfaceHa, setVineyardSurfaceHa] = useState(25);
  const [regionSurfaceHa, setRegionSurfaceHa] = useState(30000);
  const [soilType, setSoilType] = useState("Argilo-calcaire et graves");
  const [altitudeM, setAltitudeM] = useState("120 m");
  const [robe, setRobe] = useState("Rubis profond et brillant.");
  const [nez, setNez] = useState("Fruits noirs mûrs, épices douces et notes boisées subtiles.");
  const [bouche, setBouche] = useState("Équilibrée, tanins soyeux et belle fraîcheur.");
  const [finale, setFinale] = useState("Longue et harmonieuse.");
  const [pairingsText, setPairingsText] = useState("Viande rouge grillée, Agneau rôti, Fromages affinés");

  if (!isOpen) return null;

  const handleAutoLookup = async () => {
    if (!lookupQuery.trim()) return;
    setIsLookingUp(true);
    setLookupError(null);
    try {
      const res = await fetch("/api/wine-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: lookupQuery.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la recherche.");
      }
      setName(data.name || lookupQuery);
      setProducer(data.producer || "");
      if (data.color === "Rouge" || data.color === "Blanc" || data.color === "Rosé") {
        setColor(data.color);
      }
      setCountry(data.country || "France");
      setRegion(data.region || "");
      setAppellation(data.appellation || "");
      if (Array.isArray(data.grapes)) setGrapesText(data.grapes.join(", "));
      if (data.abv) setAbv(Number(data.abv));
      if (data.strength >= 1 && data.strength <= 5) setStrength(data.strength as StrengthLevel);
      if (data.currentVintage) setCurrentVintage(Number(data.currentVintage));
      if (data.bestVintage) setBestVintage(Number(data.bestVintage));
      if (data.drinkingWindow) setDrinkingWindow(data.drinkingWindow);
      if (data.tempMin) setTempMin(Number(data.tempMin));
      if (data.tempMax) setTempMax(Number(data.tempMax));
      if (data.decanting) setDecanting(data.decanting);
      if (data.glassware) setGlassware(data.glassware);
      if (data.vinification) setVinification(data.vinification);
      if (data.vineyardSurfaceHa) setVineyardSurfaceHa(Number(data.vineyardSurfaceHa));
      if (data.regionSurfaceHa) setRegionSurfaceHa(Number(data.regionSurfaceHa));
      if (data.soilType) setSoilType(data.soilType);
      if (data.altitudeM) setAltitudeM(data.altitudeM);
      if (data.robe) setRobe(data.robe);
      if (data.nez) setNez(data.nez);
      if (data.bouche) setBouche(data.bouche);
      if (data.finale) setFinale(data.finale);
      if (Array.isArray(data.foodPairings)) setPairingsText(data.foodPairings.join(", "));
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Recherche impossible.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const q = encodeURIComponent(name.trim());
    const newWine: WineReference = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      producer: producer.trim() || "Domaine personnel",
      color,
      country: country.trim() || "France",
      region: region.trim() || "Autre",
      appellation: appellation.trim() || region.trim(),
      grapes: grapesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((g) => ({ name: g })),
      abv: Number(abv) || 13.5,
      strength,
      currentVintage: Number(currentVintage) || 2020,
      bestVintage: Number(bestVintage) || 2016,
      otherTopVintages: [Number(bestVintage) || 2016, Number(currentVintage) || 2020],
      drinkingWindow,
      servingTempC: { min: Number(tempMin) || 15, max: Number(tempMax) || 17 },
      decanting,
      glassware,
      vinification,
      vineyardSurfaceHa: Number(vineyardSurfaceHa) || 20,
      regionSurfaceHa: Number(regionSurfaceHa) || 10000,
      soilType,
      altitudeM,
      yieldHlHa: "40 hl/ha",
      tastingNotes: { robe, nez, bouche, finale },
      foodPairings: pairingsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      merchants: [
        { name: "Wine-Searcher", url: `https://www.wine-searcher.com/find/${q}`, type: "Comparateur" },
        { name: "iDealwine", url: `https://www.idealwine.com/fr/acheter-vin/${q}.jsp`, type: "Enchères & Grands Crus" },
        { name: "Vinatis", url: `https://www.vinatis.com/recherche?search=${q}`, type: "Caviste en ligne" },
      ],
      priceTier: "€€",
      isUserAdded: true,
    };
    onAddWine(newWine);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1C1817]/55 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F4] border border-[#D6CEBE] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#FAF8F4] border-b border-[#E5DFD5] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#1C1817]">
              Ajouter une bouteille à ma cave
            </h2>
            <p className="text-xs text-[#665E5A]">
              Saisissez manuellement ou complétez automatiquement la fiche technique
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-[#E5DFD5] bg-white hover:bg-[#F3EFE8]"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sommelier Auto-Lookup */}
          <div className="bg-[#F3EFE8] border border-[#D6CEBE] rounded-lg p-4">
            <label className="text-xs font-semibold text-[#1C1817] block mb-2">
              Pré-remplissage automatique par le Sommelier
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAutoLookup())}
                placeholder="Ex : Château Rayas Châteauneuf-du-Pape, Château Ksara Cuvée du Pape..."
                className="flex-1 rounded-md border border-[#D6CEBE] bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#7B1E32]"
              />
              <button
                type="button"
                onClick={handleAutoLookup}
                disabled={isLookingUp || !lookupQuery.trim()}
                className="px-4 py-2 rounded-md bg-[#7B1E32] hover:bg-[#611626] disabled:opacity-50 text-white text-xs font-medium flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                {isLookingUp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyse...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Compléter la fiche
                  </>
                )}
              </button>
            </div>
            {lookupError && <p className="text-xs text-[#7B1E32] mt-2">{lookupError}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#665E5A] mb-1">Nom du vin / Cuvée *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Château Musar Blanc"
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-[#665E5A] mb-1">Producteur / Domaine</label>
                <input
                  value={producer}
                  onChange={(e) => setProducer(e.target.value)}
                  placeholder="Domaine..."
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#665E5A] mb-1">Couleur</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value as WineColor)}
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2"
                >
                  <option value="Rouge">Rouge</option>
                  <option value="Blanc">Blanc</option>
                  <option value="Rosé">Rosé</option>
                </select>
              </div>
              <div>
                <label className="block text-[#665E5A] mb-1">Pays</label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-[#665E5A] mb-1">Région viticole</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[#665E5A] mb-1">Cépages (séparés par des virgules)</label>
                <input
                  value={grapesText}
                  onChange={(e) => setGrapesText(e.target.value)}
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-[#665E5A] mb-1">Appellation</label>
                <input
                  value={appellation}
                  onChange={(e) => setAppellation(e.target.value)}
                  placeholder="AOC / DOCG..."
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[#665E5A] mb-1">Degré (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={abv}
                  onChange={(e) => setAbv(Number(e.target.value))}
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2 font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-[#665E5A] mb-1">Force (1–5)</label>
                <select
                  value={strength}
                  onChange={(e) => setStrength(Number(e.target.value) as StrengthLevel)}
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2"
                >
                  <option value={1}>1 - Légère</option>
                  <option value={2}>2 - Souple</option>
                  <option value={3}>3 - Équilibrée</option>
                  <option value={4}>4 - Structurée</option>
                  <option value={5}>5 - Puissante</option>
                </select>
              </div>
              <div>
                <label className="block text-[#665E5A] mb-1">Millésime</label>
                <input
                  type="number"
                  value={currentVintage}
                  onChange={(e) => setCurrentVintage(Number(e.target.value))}
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2 font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-[#665E5A] mb-1">Meilleure année</label>
                <input
                  type="number"
                  value={bestVintage}
                  onChange={(e) => setBestVintage(Number(e.target.value))}
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2 font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-[#665E5A] mb-1">Surface (ha)</label>
                <input
                  type="number"
                  value={vineyardSurfaceHa}
                  onChange={(e) => setVineyardSurfaceHa(Number(e.target.value))}
                  className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2 font-mono-tabular"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#665E5A] mb-1">Descriptif technique de la vinification</label>
              <textarea
                rows={2}
                value={vinification}
                onChange={(e) => setVinification(e.target.value)}
                className="w-full rounded-md border border-[#D6CEBE] bg-white px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-[#D6CEBE] bg-white text-[#1C1817] font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-[#7B1E32] hover:bg-[#611626] text-white font-semibold"
              >
                Ajouter à ma cave
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
