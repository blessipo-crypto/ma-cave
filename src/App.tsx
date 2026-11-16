import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Search,
  MapPin,
  LayoutGrid,
  Table as TableIcon,
  Star,
  Thermometer,
  RotateCcw,
  Plus,
  Compass,
  Wine as WineIcon,
} from "lucide-react";
import {
  WineReference,
  WineColor,
  PersonalTastingNote,
  UserLocation,
} from "./types/wine";
import { WINES_CATALOG } from "./data/wines";
import { GRAPE_VARIETIES } from "./data/grapes";
import { COUNTRIES_ATLAS } from "./data/regions";
import {
  PRESET_LOCATIONS,
  getNearestRegions,
  getStrengthLabel,
  getColorHex,
} from "./utils/sommelierHelpers";
import { WineDetailModal } from "./components/WineDetailModal";
import { AddWineModal } from "./components/AddWineModal";
import { AtlasRegionsView } from "./components/AtlasRegionsView";
import { LebanonShowcaseView } from "./components/LebanonShowcaseView";
import { PairingsSommelierView } from "./components/PairingsSommelierView";
import { VintagesTastingView } from "./components/VintagesTastingView";
import { RegionGraphic } from "./components/RegionGraphic";
import { CellarDistributionBar } from "./components/WineCharts";

type AppTab = "cave" | "regions" | "liban" | "accords" | "millesimes";
type ViewMode = "grid" | "table";
type AbvRange = "all" | "light" | "medium" | "full" | "strong";

const INITIAL_NOTES: Record<string, PersonalTastingNote> = {
  "chateau-musar-rouge": {
    wineId: "chateau-musar-rouge",
    tasted: true,
    bottlesInCellar: 3,
    score20: 18.5,
    stars: 5,
    robeRating: 5,
    nezRating: 5,
    boucheRating: 5,
    longueurRating: 5,
    tastedDate: "2026-10-14",
    favoriteVintage: 2016,
    notes: "Bouquet fascinant de figue sèche, cèdre du Liban et épices douces après 1h de carafe.",
  },
  "puligny-montrachet-leflaive": {
    wineId: "puligny-montrachet-leflaive",
    tasted: true,
    bottlesInCellar: 2,
    score20: 19,
    stars: 5,
    robeRating: 5,
    nezRating: 5,
    boucheRating: 5,
    longueurRating: 5,
    tastedDate: "2026-09-22",
    favoriteVintage: 2017,
    notes: "Tension crayeuse magnifique, noisette fraîche et longueur saline interminable.",
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("cave");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Persistent personal wines & tasting notes
  const [customWines, setCustomWines] = useState<WineReference[]>(() => {
    try {
      const saved = localStorage.getItem("cellier_custom_wines_v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notesMap, setNotesMap] = useState<Record<string, PersonalTastingNote>>(() => {
    try {
      const saved = localStorage.getItem("cellier_notes_v1");
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cellier_custom_wines_v1", JSON.stringify(customWines));
    } catch {
      // ignore storage quota errors
    }
  }, [customWines]);

  useEffect(() => {
    try {
      localStorage.setItem("cellier_notes_v1", JSON.stringify(notesMap));
    } catch {
      // ignore storage quota errors
    }
  }, [notesMap]);

  const allWines = useMemo(() => [...customWines, ...WINES_CATALOG], [customWines]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [colorFilter, setColorFilter] = useState<WineColor | "Toutes">("Toutes");
  const [selectedGrape, setSelectedGrape] = useState<string>("");
  const [strengthFilter, setStrengthFilter] = useState<number | null>(null);
  const [abvFilter, setAbvFilter] = useState<AbvRange>("all");
  const [countryFilter, setCountryFilter] = useState<string>("Tous");
  const [regionFilter, setRegionFilter] = useState<string>("Toutes");
  const [onlyMyCellarOrTasted, setOnlyMyCellarOrTasted] = useState(false);

  // Modals
  const [selectedWine, setSelectedWine] = useState<WineReference | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Geolocation
  const [userLocation, setUserLocation] = useState<UserLocation | null>(PRESET_LOCATIONS[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setActiveTab("cave");
        setTimeout(() => searchInputRef.current?.focus(), 40);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleRequestGPS = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Géolocalisation non prise en charge par votre navigateur.");
      return;
    }
    setIsLocating(true);
    setGeoStatus(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          city: "Votre position GPS",
          country: "Détectée",
          lat: latitude,
          lng: longitude,
          source: "gps",
          ambientTempC: 19,
        });
        setIsLocating(false);
        setGeoStatus("Position GPS activée.");
      },
      () => {
        setIsLocating(false);
        setGeoStatus("Accès GPS refusé — sélectionnez une ville ci-contre.");
      },
      { timeout: 6000 }
    );
  };

  const nearestRegions = useMemo(
    () => (userLocation ? getNearestRegions(userLocation, 3) : []),
    [userLocation]
  );

  // Dynamic country & region lists
  const availableCountries = useMemo(
    () => ["Tous", ...Array.from(new Set(allWines.map((w) => w.country)))],
    [allWines]
  );

  const availableRegions = useMemo(() => {
    const subset =
      countryFilter === "Tous"
        ? allWines
        : allWines.filter((w) => w.country === countryFilter);
    return ["Toutes", ...Array.from(new Set(subset.map((w) => w.region)))];
  }, [allWines, countryFilter]);

  // Grape list filtered by active color
  const visibleGrapes = useMemo(() => {
    if (colorFilter === "Toutes") return GRAPE_VARIETIES;
    return GRAPE_VARIETIES.filter((g) => g.colors.includes(colorFilter));
  }, [colorFilter]);

  const activeGrapeObj = useMemo(() => {
    if (!selectedGrape) return null;
    return (
      GRAPE_VARIETIES.find(
        (g) =>
          g.name.toLowerCase() === selectedGrape.toLowerCase() ||
          selectedGrape.toLowerCase().includes(g.name.split(" (")[0].toLowerCase()) ||
          g.name.toLowerCase().includes(selectedGrape.split(" (")[0].toLowerCase())
      ) ?? null
    );
  }, [selectedGrape]);

  // Main Filtered Wines
  const filteredWines = useMemo(() => {
    return allWines.filter((wine) => {
      if (colorFilter !== "Toutes" && wine.color !== colorFilter) return false;
      if (strengthFilter !== null && wine.strength !== strengthFilter) return false;

      if (abvFilter === "light" && wine.abv >= 12.5) return false;
      if (abvFilter === "medium" && (wine.abv < 12.5 || wine.abv > 13.5)) return false;
      if (abvFilter === "full" && (wine.abv <= 13.5 || wine.abv > 14.5)) return false;
      if (abvFilter === "strong" && wine.abv <= 14.5) return false;

      if (countryFilter !== "Tous" && wine.country !== countryFilter) return false;
      if (regionFilter !== "Toutes" && wine.region !== regionFilter) return false;

      if (selectedGrape) {
        const needle = selectedGrape.split(" (")[0].toLowerCase();
        const hasGrape = wine.grapes.some((g) =>
          g.name.toLowerCase().includes(needle)
        );
        if (!hasGrape) return false;
      }

      if (onlyMyCellarOrTasted) {
        const n = notesMap[wine.id];
        if (!n || (!n.tasted && n.bottlesInCellar <= 0)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const haystack = [
          wine.name,
          wine.producer,
          wine.country,
          wine.region,
          wine.appellation,
          ...wine.grapes.map((g) => g.name),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [
    allWines,
    colorFilter,
    strengthFilter,
    abvFilter,
    countryFilter,
    regionFilter,
    selectedGrape,
    onlyMyCellarOrTasted,
    notesMap,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setColorFilter("Toutes");
    setSelectedGrape("");
    setStrengthFilter(null);
    setAbvFilter("all");
    setCountryFilter("Tous");
    setRegionFilter("Toutes");
    setOnlyMyCellarOrTasted(false);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    colorFilter !== "Toutes" ||
    selectedGrape !== "" ||
    strengthFilter !== null ||
    abvFilter !== "all" ||
    countryFilter !== "Tous" ||
    regionFilter !== "Toutes" ||
    onlyMyCellarOrTasted;

  const totalBottlesInCellar = useMemo(
    () =>
      Object.values(notesMap).reduce((acc, n) => acc + (n.bottlesInCellar || 0), 0),
    [notesMap]
  );
  const totalTasted = useMemo(
    () => Object.values(notesMap).filter((n) => n.tasted).length,
    [notesMap]
  );

  const handleSaveNote = (note: PersonalTastingNote) => {
    setNotesMap((prev) => ({
      ...prev,
      [note.wineId]: note,
    }));
  };

  const handleSelectGrapeAndJump = (grapeName: string) => {
    setSelectedGrape(grapeName);
    setActiveTab("cave");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1A1817]">
      {/* Strictly Compliant 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#FAF9F6]/92 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab("cave")}
            className="font-editorial text-2xl font-semibold tracking-tight text-[#1A1817] whitespace-nowrap shrink-0"
          >
            Cellier d&apos;Origine
          </button>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {[
              { id: "cave", label: "Ma Cave & Cépages" },
              { id: "regions", label: "Pays & Régions" },
              { id: "liban", label: "Vins du Liban" },
              { id: "accords", label: "Accords & Sommelier" },
              { id: "millesimes", label: "Millésimes & Dégustation" },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as AppTab)}
                  className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? "border-[#821D35] text-[#821D35] font-semibold"
                      : "border-transparent text-[#57504B] hover:text-[#1A1817]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#821D35] hover:bg-[#691529] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un vin
            </button>
          </div>
        </div>

        {/* Mobile/Tablet fallback sub-nav */}
        <div className="md:hidden flex items-center gap-4 px-6 pb-2.5 overflow-x-auto text-xs font-medium">
          {[
            { id: "cave", label: "Ma Cave & Cépages" },
            { id: "regions", label: "Pays & Régions" },
            { id: "liban", label: "Vins du Liban" },
            { id: "accords", label: "Accords & Sommelier" },
            { id: "millesimes", label: "Millésimes & Dégustation" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as AppTab)}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === item.id
                  ? "border-[#821D35] text-[#821D35] font-semibold"
                  : "border-transparent text-[#645D58]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-7">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === "cave" && (
            <div className="space-y-6">
              {/* Editorial Cellar Hero + KPI Strip (when unfiltered) */}
              {!hasActiveFilters && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden items-stretch shadow-[0_2px_16px_-4px_rgba(26,24,23,0.06)]">
                    <div className="lg:col-span-7 p-7 lg:p-9 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-medium text-[#645D58] mb-2">
                          Encyclopédie de Cave · France, Liban &amp; Vignobles du Monde
                        </div>
                        <h1 className="font-editorial text-3xl lg:text-[40px] font-semibold text-[#1A1817] leading-[1.15] text-balance">
                          Explorez chaque cépage, son terroir et son millésime d&apos;exception
                        </h1>
                        <p className="text-[15px] text-[#4E4742] mt-3.5 leading-relaxed max-w-2xl">
                          Filtrez vos vins par couleur, cépage, puissance et degré d&apos;alcool.
                          Consultez le descriptif technique de vinification, la carte géographique,
                          les meilleures années et enregistrez vos notes de dégustation.
                        </p>
                      </div>

                      <div className="mt-7 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab("accords")}
                          className="px-4 py-2.5 rounded-xl bg-[#1A1817] hover:bg-[#352F2C] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Accord Mets &amp; Vins en temps réel
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("liban")}
                          className="px-4 py-2.5 rounded-xl border border-[#DFD8CC] bg-[#FAF9F6] hover:border-[#821D35] text-[#1A1817] text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Découvrir les vins du Liban
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-5 relative min-h-[240px] bg-[#EFEAE0]">
                      <img
                        src="/src/assets/images/cellar_hero_banner_1794793378945.jpg"
                        alt="Cave voûtée en pierre calcaire avec fûts de chêne et table de dégustation"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* 4-column full-width KPI strip below hero split */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#E8E2D9] rounded-2xl px-5 py-4 shadow-[0_2px_10px_-4px_rgba(26,24,23,0.04)]">
                      <div className="text-xs text-[#645D58]">Références en catalogue</div>
                      <div className="font-mono-tabular text-2xl font-semibold text-[#1A1817] mt-1">
                        {allWines.length} cuvées
                      </div>
                    </div>
                    <div className="bg-white border border-[#E8E2D9] rounded-2xl px-5 py-4 shadow-[0_2px_10px_-4px_rgba(26,24,23,0.04)]">
                      <div className="text-xs text-[#645D58]">Cépages documentés</div>
                      <div className="font-mono-tabular text-2xl font-semibold text-[#1A1817] mt-1">
                        {GRAPE_VARIETIES.length} variétés
                      </div>
                    </div>
                    <div className="bg-white border border-[#E8E2D9] rounded-2xl px-5 py-4 shadow-[0_2px_10px_-4px_rgba(26,24,23,0.04)]">
                      <div className="text-xs text-[#645D58]">Bouteilles dans ma cave</div>
                      <div className="font-mono-tabular text-2xl font-semibold text-[#821D35] mt-1">
                        {totalBottlesInCellar} flacons
                      </div>
                    </div>
                    <div className="bg-white border border-[#E8E2D9] rounded-2xl px-5 py-4 shadow-[0_2px_10px_-4px_rgba(26,24,23,0.04)]">
                      <div className="text-xs text-[#645D58]">Dégustations notées</div>
                      <div className="font-mono-tabular text-2xl font-semibold text-[#1A1817] mt-1">
                        {totalTasted} avis
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Geolocation & Local Availability Bar */}
              <div className="bg-white border border-[#E8E2D9] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_2px_10px_-4px_rgba(26,24,23,0.04)]">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={handleRequestGPS}
                    disabled={isLocating}
                    className="px-3.5 py-2 rounded-xl border border-[#DFD8CC] bg-[#FAF9F6] hover:border-[#821D35] font-medium text-[#1A1817] flex items-center gap-1.5 whitespace-nowrap transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#821D35]" />
                    {isLocating ? "Localisation..." : "Me géolocaliser (GPS)"}
                  </button>

                  <select
                    value={userLocation?.source === "preset" ? userLocation.city : "custom"}
                    onChange={(e) => {
                      const found = PRESET_LOCATIONS.find((l) => l.city === e.target.value);
                      if (found) {
                        setUserLocation(found);
                        setGeoStatus(null);
                      }
                    }}
                    className="rounded-xl border border-[#DFD8CC] bg-[#FAF9F6] px-3 py-2 text-xs font-medium text-[#1A1817]"
                    aria-label="Ville de référence"
                  >
                    {userLocation?.source === "gps" && (
                      <option value="custom">Position GPS actuelle</option>
                    )}
                    {PRESET_LOCATIONS.map((loc) => (
                      <option key={loc.city} value={loc.city}>
                        {loc.city} ({loc.country})
                      </option>
                    ))}
                  </select>

                  {geoStatus && <span className="text-[#645D58]">{geoStatus}</span>}
                </div>

                {userLocation && nearestRegions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#4E4742]">
                    <span className="font-semibold text-[#1A1817] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#821D35]" />
                      Terroirs les plus proches :
                    </span>
                    {nearestRegions.map((item, idx) => (
                      <React.Fragment key={item.region.id}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <button
                          type="button"
                          onClick={() => {
                            setCountryFilter(item.region.countryName);
                            setRegionFilter(item.region.name);
                          }}
                          className="hover:text-[#821D35] hover:underline font-medium"
                        >
                          {item.region.name}{" "}
                          <span className="font-mono-tabular text-[#645D58]">
                            ({item.distanceKm.toLocaleString("fr-FR")} km)
                          </span>
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* PC Workbench Split: Left Filter Rail (300px) + Right Catalog */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Filter Rail */}
                <aside className="lg:col-span-3 bg-white border border-[#E8E2D9] rounded-2xl p-5 space-y-5 lg:sticky lg:top-20 shadow-[0_2px_12px_-4px_rgba(26,24,23,0.04)]">
                  <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
                    <h2 className="font-editorial text-xl font-semibold text-[#1A1817]">
                      Filtres de cave
                    </h2>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-xs text-[#821D35] hover:underline flex items-center gap-1 font-medium"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-xs font-medium text-[#645D58] mb-1.5">
                      Recherche rapide (touche /)
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#645D58] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Domaine, appellation, cépage..."
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#DFD8CC] bg-[#FAF9F6] text-xs text-[#1A1817] focus:outline-none focus:border-[#821D35] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Wine Color */}
                  <div>
                    <label className="block text-xs font-medium text-[#645D58] mb-1.5">
                      Couleur du vin
                    </label>
                    <div className="grid grid-cols-4 gap-1 p-1 bg-[#F2EFE9] rounded-xl border border-[#E8E2D9]">
                      {(["Toutes", "Rouge", "Blanc", "Rosé"] as const).map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setColorFilter(col)}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                            colorFilter === col
                              ? "bg-[#821D35] text-white"
                              : "text-[#4E4742] hover:text-[#1A1817]"
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cépage Selector */}
                  <div>
                    <label className="block text-xs font-medium text-[#645D58] mb-1.5">
                      Cépage ({visibleGrapes.length} variétés)
                    </label>
                    <select
                      value={selectedGrape}
                      onChange={(e) => setSelectedGrape(e.target.value)}
                      className="w-full rounded-xl border border-[#DFD8CC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1817]"
                    >
                      <option value="">Tous les cépages</option>
                      {visibleGrapes.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name} ({g.colors.join("/")})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Force / Puissance */}
                  <div>
                    <label className="block text-xs font-medium text-[#645D58] mb-1.5">
                      Force / Structure du vin
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const active = strengthFilter === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setStrengthFilter(active ? null : lvl)}
                            title={getStrengthLabel(lvl)}
                            className={`py-1.5 rounded-lg border text-xs font-mono-tabular font-semibold transition-colors ${
                              active
                                ? "bg-[#821D35] text-white border-[#821D35]"
                                : "bg-[#FAF9F6] text-[#1A1817] border-[#DFD8CC] hover:border-[#821D35]"
                            }`}
                          >
                            {lvl}/5
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-[#645D58] mt-1">
                      {strengthFilter ? getStrengthLabel(strengthFilter) : "1 Légère → 5 Puissante"}
                    </div>
                  </div>

                  {/* Degré d'alcool */}
                  <div>
                    <label className="block text-xs font-medium text-[#645D58] mb-1.5">
                      Degré d&apos;alcool (% vol.)
                    </label>
                    <select
                      value={abvFilter}
                      onChange={(e) => setAbvFilter(e.target.value as AbvRange)}
                      className="w-full rounded-xl border border-[#DFD8CC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1817] font-mono-tabular"
                    >
                      <option value="all">Tous les degrés</option>
                      <option value="light">Moins de 12,5 %</option>
                      <option value="medium">12,5 % – 13,5 %</option>
                      <option value="full">13,6 % – 14,5 %</option>
                      <option value="strong">Plus de 14,5 %</option>
                    </select>
                  </div>

                  {/* Pays & Région */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#645D58] mb-1.5">
                        Pays d&apos;origine
                      </label>
                      <select
                        value={countryFilter}
                        onChange={(e) => {
                          setCountryFilter(e.target.value);
                          setRegionFilter("Toutes");
                        }}
                        className="w-full rounded-xl border border-[#DFD8CC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1817]"
                      >
                        {availableCountries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#645D58] mb-1.5">
                        Région viticole
                      </label>
                      <select
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        className="w-full rounded-xl border border-[#DFD8CC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1817]"
                      >
                        {availableRegions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* My Tasted / Cellar Filter */}
                  <label className="flex items-center gap-2.5 pt-2 border-t border-[#E8E2D9] text-xs text-[#1A1817] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyMyCellarOrTasted}
                      onChange={(e) => setOnlyMyCellarOrTasted(e.target.checked)}
                      className="rounded border-[#DFD8CC] accent-[#821D35]"
                    />
                    <span>Uniquement ma cave &amp; dégustées</span>
                  </label>
                </aside>

                {/* Right Main Catalog */}
                <section className="lg:col-span-9 space-y-5">
                  {/* Graphic Distribution Strip */}
                  {filteredWines.length > 0 && <CellarDistributionBar wines={filteredWines} />}

                  {/* Active Cépage Technical Dossier Banner */}
                  {activeGrapeObj && (
                    <div className="bg-white border border-[#DFD8CC] rounded-2xl p-5 space-y-4 shadow-[0_2px_12px_-4px_rgba(26,24,23,0.05)]">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8E2D9] pb-3">
                        <div>
                          <div className="text-xs text-[#645D58]">
                            Fiche Cépage · Origine : {activeGrapeObj.originCountry} (
                            {activeGrapeObj.originRegion}) · {activeGrapeObj.colors.join(" / ")}
                          </div>
                          <h2 className="font-editorial text-2xl font-semibold text-[#1A1817]">
                            {activeGrapeObj.name}
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedGrape("")}
                          className="text-xs text-[#821D35] hover:underline font-semibold"
                        >
                          Afficher tous les cépages
                        </button>
                      </div>

                      <p className="text-sm text-[#352F2C] leading-relaxed">
                        {activeGrapeObj.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-[#FAF9F6] border border-[#E8E2D9] rounded-xl p-4">
                        <div>
                          <div className="text-[#645D58]">Profil aromatique</div>
                          <div className="font-semibold text-[#1A1817] mt-0.5">
                            {activeGrapeObj.aromaticProfile.join(" · ")}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#645D58]">Service &amp; Degré</div>
                          <div className="font-mono-tabular font-semibold text-[#1A1817] mt-0.5">
                            {activeGrapeObj.servingTempC} · {activeGrapeObj.abvRange}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#645D58]">Accords Mets &amp; Vins</div>
                          <div className="font-medium text-[#1A1817] mt-0.5">
                            {Object.entries(activeGrapeObj.pairingsByColor)
                              .map(([col, dishes]) => `${col} : ${(dishes ?? []).slice(0, 2).join(", ")}`)
                              .join(" | ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Region Graphic Preview when a region/country is filtered */}
                  {regionFilter !== "Toutes" && (
                    <RegionGraphic
                      countryName={
                        countryFilter !== "Tous"
                          ? countryFilter
                          : filteredWines[0]?.country ?? "France"
                      }
                      regionName={regionFilter}
                      compact
                    />
                  )}

                  {/* Catalog Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-sm text-[#4E4742]">
                      <span className="font-mono-tabular font-semibold text-[#1A1817]">
                        {filteredWines.length}
                      </span>{" "}
                      {filteredWines.length > 1
                        ? "références correspondantes"
                        : "référence correspondante"}
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-[#F2EFE9] rounded-xl border border-[#E8E2D9]">
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                          viewMode === "grid"
                            ? "bg-white text-[#1A1817] shadow-xs"
                            : "text-[#645D58] hover:text-[#1A1817]"
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Grille éditoriale
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("table")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                          viewMode === "table"
                            ? "bg-white text-[#1A1817] shadow-xs"
                            : "text-[#645D58] hover:text-[#1A1817]"
                        }`}
                      >
                        <TableIcon className="w-3.5 h-3.5" />
                        Tableau technique
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {filteredWines.length === 0 ? (
                    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-10 text-center space-y-3">
                      <WineIcon className="w-8 h-8 text-[#B8AE9B] mx-auto" />
                      <h3 className="font-editorial text-2xl font-semibold text-[#1A1817]">
                        Aucune bouteille ne correspond à ces critères
                      </h3>
                      <p className="text-sm text-[#645D58] max-w-md mx-auto">
                        Élargissez la plage de degré d&apos;alcool, changez de cépage ou ajoutez
                        votre propre référence à votre cave.
                      </p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="px-4 py-2 rounded-xl bg-[#821D35] text-white text-xs font-semibold"
                      >
                        Réinitialiser les filtres
                      </button>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredWines.map((wine) => {
                        const cStyle = getColorHex(wine.color);
                        const note = notesMap[wine.id];
                        return (
                          <button
                            key={wine.id}
                            type="button"
                            onClick={() => setSelectedWine(wine)}
                            className="text-left bg-white hover:border-[#821D35] border border-[#E8E2D9] rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgba(26,24,23,0.12)] flex flex-col justify-between group"
                          >
                            {/* Subtle graphic color top ribbon */}
                            <div
                              className="h-1.5 w-full"
                              style={{ backgroundColor: cStyle.swatch, opacity: 0.85 }}
                            />

                            <div className="p-5 flex-1 flex flex-col justify-between w-full">
                              <div>
                                {/* Zero-pill unboxed metadata */}
                                <div className="flex items-center justify-between gap-2 text-xs text-[#645D58] mb-2">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span
                                      className="inline-block w-2 h-2 rounded-full shrink-0"
                                      style={{ backgroundColor: cStyle.swatch }}
                                    />
                                    <span className={`font-semibold ${cStyle.text}`}>
                                      {wine.color}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span className="truncate">
                                      {wine.country} — {wine.region}
                                    </span>
                                  </div>
                                  {note?.tasted && (
                                    <span className="font-mono-tabular font-semibold text-[#B58932] flex items-center gap-0.5 shrink-0">
                                      <Star className="w-3.5 h-3.5 fill-[#B58932]" />
                                      {note.score20.toFixed(1)}
                                    </span>
                                  )}
                                </div>

                                <h3 className="font-editorial text-[21px] font-semibold text-[#1A1817] group-hover:text-[#821D35] transition-colors leading-snug">
                                  {wine.name}
                                </h3>
                                <p className="text-xs text-[#645D58] mt-0.5 truncate">
                                  {wine.producer}
                                </p>

                                <div className="mt-3 text-xs text-[#352F2C] line-clamp-1">
                                  {wine.grapes
                                    .map(
                                      (g) =>
                                        `${g.name.split(" (")[0]}${
                                          g.percentage ? ` ${g.percentage}%` : ""
                                        }`
                                    )
                                    .join(" · ")}
                                </div>
                              </div>

                              {/* Visual Strength Meter + Vintages + Temp */}
                              <div className="mt-4 pt-3.5 border-t border-[#E8E2D9] space-y-2.5 text-xs">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[#645D58]">Force</span>
                                  <div className="flex items-center gap-1 flex-1 max-w-[110px]">
                                    {[1, 2, 3, 4, 5].map((lvl) => (
                                      <span
                                        key={lvl}
                                        className={`h-1.5 flex-1 rounded-full ${
                                          lvl <= wine.strength ? "bg-[#821D35]" : "bg-[#EAE4D9]"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-mono-tabular font-semibold text-[#1A1817]">
                                    {wine.abv.toFixed(1)} %
                                  </span>
                                </div>

                                <div className="flex items-center justify-between font-mono-tabular text-[#4E4742]">
                                  <span>
                                    Millésime{" "}
                                    <strong className="text-[#1A1817]">
                                      {wine.currentVintage}
                                    </strong>
                                  </span>
                                  <span>
                                    Top{" "}
                                    <strong className="text-[#821D35]">{wine.bestVintage}</strong>
                                  </span>
                                </div>

                                <div className="flex items-center justify-between font-mono-tabular text-[#645D58]">
                                  <span className="flex items-center gap-1">
                                    <Thermometer className="w-3.5 h-3.5 text-[#821D35]" />
                                    {wine.servingTempC.min}–{wine.servingTempC.max} °C
                                  </span>
                                  {note && note.bottlesInCellar > 0 ? (
                                    <span className="font-sans font-semibold text-[#821D35]">
                                      En cave : {note.bottlesInCellar} btl
                                    </span>
                                  ) : (
                                    <span className="font-sans text-[#645D58]">
                                      {wine.vineyardSurfaceHa} ha
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E8E2D9] rounded-2xl overflow-x-auto shadow-[0_2px_10px_-4px_rgba(26,24,23,0.04)]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#E8E2D9] bg-[#FAF9F6] text-[#645D58]">
                            <th className="py-3 px-4 font-medium">Cuvée &amp; Domaine</th>
                            <th className="py-3 px-3 font-medium">Couleur</th>
                            <th className="py-3 px-3 font-medium">Pays &amp; Région</th>
                            <th className="py-3 px-3 font-medium">Cépages</th>
                            <th className="py-3 px-3 font-medium text-right">Degré</th>
                            <th className="py-3 px-3 font-medium text-right">Force</th>
                            <th className="py-3 px-3 font-medium text-right">Millésime / Top</th>
                            <th className="py-3 px-3 font-medium text-right">Service</th>
                            <th className="py-3 px-4 font-medium text-right">Ma Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E2D9]">
                          {filteredWines.map((wine) => {
                            const cStyle = getColorHex(wine.color);
                            const note = notesMap[wine.id];
                            return (
                              <tr
                                key={wine.id}
                                onClick={() => setSelectedWine(wine)}
                                className="hover:bg-[#FAF9F6] cursor-pointer transition-colors"
                              >
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-[#1A1817]">{wine.name}</div>
                                  <div className="text-[11px] text-[#645D58]">{wine.producer}</div>
                                </td>
                                <td className={`py-3 px-3 font-semibold ${cStyle.text}`}>
                                  {wine.color}
                                </td>
                                <td className="py-3 px-3 text-[#352F2C]">
                                  {wine.country} · {wine.region}
                                </td>
                                <td className="py-3 px-3 text-[#4E4742] max-w-[180px] truncate">
                                  {wine.grapes.map((g) => g.name.split(" (")[0]).join(", ")}
                                </td>
                                <td className="py-3 px-3 text-right font-mono-tabular">
                                  {wine.abv.toFixed(1)}%
                                </td>
                                <td className="py-3 px-3 text-right font-mono-tabular">
                                  {wine.strength}/5
                                </td>
                                <td className="py-3 px-3 text-right font-mono-tabular">
                                  {wine.currentVintage} /{" "}
                                  <strong className="text-[#821D35]">{wine.bestVintage}</strong>
                                </td>
                                <td className="py-3 px-3 text-right font-mono-tabular">
                                  {wine.servingTempC.min}–{wine.servingTempC.max} °C
                                </td>
                                <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-[#B58932]">
                                  {note?.tasted ? `${note.score20.toFixed(1)}/20` : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {activeTab === "regions" && (
            <AtlasRegionsView
              wines={allWines}
              onSelectWine={setSelectedWine}
              onSelectGrapeAndGoToCellar={handleSelectGrapeAndJump}
            />
          )}

          {activeTab === "liban" && (
            <LebanonShowcaseView
              wines={allWines}
              onSelectWine={setSelectedWine}
              onSelectGrapeAndGoToCellar={handleSelectGrapeAndJump}
            />
          )}

          {activeTab === "accords" && (
            <PairingsSommelierView
              location={userLocation}
              wines={allWines}
              onSelectWine={setSelectedWine}
            />
          )}

          {activeTab === "millesimes" && (
            <VintagesTastingView
              wines={allWines}
              notesMap={notesMap}
              onSelectWine={setSelectedWine}
            />
          )}
        </motion.div>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E8E2D9] bg-[#FAF9F6] mt-12">
        <div className="max-w-[1440px] mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#645D58]">
          <div>
            Cellier d&apos;Origine — Atlas œnologique &amp; cave personnelle ({COUNTRIES_ATLAS.length} pays ·{" "}
            {GRAPE_VARIETIES.length} cépages · {allWines.length} références)
          </div>
          <div>L&apos;abus d&apos;alcool est dangereux pour la santé, à consommer avec modération.</div>
        </div>
      </footer>

      {/* Modals */}
      <WineDetailModal
        wine={selectedWine}
        note={selectedWine ? notesMap[selectedWine.id] : undefined}
        onSaveNote={handleSaveNote}
        onClose={() => setSelectedWine(null)}
        onSelectGrape={handleSelectGrapeAndJump}
      />

      <AddWineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWine={(newWine) => {
          setCustomWines((prev) => [newWine, ...prev]);
          setSelectedWine(newWine);
        }}
      />
    </div>
  );
}
