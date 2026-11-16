export type WineColor = "Rouge" | "Blanc" | "Rosé";

export type StrengthLevel = 1 | 2 | 3 | 4 | 5;

export interface MerchantSite {
  name: string;
  url: string;
  type: "Comparateur" | "Enchères & Grands Crus" | "Caviste en ligne" | "Direct Domaine";
}

export interface GrapeAllocation {
  name: string;
  percentage?: number;
}

export interface WineReference {
  id: string;
  name: string;
  producer: string;
  color: WineColor;
  country: string;
  region: string;
  subRegion?: string;
  appellation: string;
  grapes: GrapeAllocation[];
  abv: number;
  strength: StrengthLevel;
  currentVintage: number;
  bestVintage: number;
  otherTopVintages: number[];
  drinkingWindow: string;
  servingTempC: {
    min: number;
    max: number;
  };
  decanting: string;
  glassware: string;
  vinification: string;
  vineyardSurfaceHa: number;
  regionSurfaceHa: number;
  soilType: string;
  altitudeM: string;
  yieldHlHa: string;
  tastingNotes: {
    robe: string;
    nez: string;
    bouche: string;
    finale: string;
  };
  foodPairings: string[];
  merchants: MerchantSite[];
  priceTier: "€" | "€€" | "€€€" | "€€€€";
  isUserAdded?: boolean;
}

export interface GrapeVariety {
  id: string;
  name: string;
  colors: WineColor[];
  originCountry: string;
  originRegion: string;
  strength: StrengthLevel;
  acidity: StrengthLevel;
  tannins: 0 | 1 | 2 | 3 | 4 | 5;
  abvRange: string;
  servingTempC: string;
  aromaticProfile: string[];
  vinificationStyle: string;
  keyRegions: string[];
  pairingsByColor: Partial<Record<WineColor, string[]>>;
  description: string;
}

export interface SoilComposition {
  label: string;
  percent: number;
  colorHex: string;
}

export interface WineRegionProfile {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
  surfaceHa: number;
  altitudeRangeM: string;
  climate: string;
  sunshineHours: number;
  rainfallMm: number;
  coordinates: { lat: number; lng: number };
  mapPin: { x: number; y: number };
  topGrapes: string[];
  flagshipAppellations: string[];
  bestVintagesRed: number[];
  bestVintagesWhite: number[];
  bestVintagesRose?: number[];
  soils: SoilComposition[];
  description: string;
  vinificationTradition: string;
}

export interface CountryProfile {
  id: string;
  name: string;
  totalSurfaceHa: number;
  worldRank: string;
  mapType: "france" | "lebanon" | "italy" | "spain" | "world";
  coordinates: { lat: number; lng: number };
  bestGrapes: Array<{
    name: string;
    color: WineColor;
    note: string;
  }>;
  topAvailableWines: string[];
  overview: string;
  regions: WineRegionProfile[];
}

export interface VintageEntry {
  year: number;
  score20: number;
  status: "Exceptionnel" | "Apogée" | "À garder" | "À boire" | "Prêt";
  note: string;
}

export interface VintageCategory {
  id: string;
  title: string;
  color: WineColor;
  country: string;
  region: string;
  bestYear: number;
  bestYearReason: string;
  vintages: VintageEntry[];
}

export interface PersonalTastingNote {
  wineId: string;
  tasted: boolean;
  bottlesInCellar: number;
  score20: number;
  stars: number;
  robeRating: number;
  nezRating: number;
  boucheRating: number;
  longueurRating: number;
  tastedDate: string;
  notes: string;
  favoriteVintage?: number;
}

export interface UserLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
  source: "gps" | "preset";
  ambientTempC?: number;
}

export interface FoodPairingResult {
  dishAnalysis: string;
  recommendedColor: string;
  secondaryColor?: string;
  wineStyle: string;
  sommelierRationale: string;
  servingAdvice: {
    tempMinC: number;
    tempMaxC: number;
    decanting: string;
    glassware: string;
  };
  idealGrapes: Array<{
    name: string;
    color: string;
    reason: string;
  }>;
  recommendedAppellations: Array<{
    appellation: string;
    region: string;
    country: string;
    bestVintages: string;
    servingTempC: string;
  }>;
  specificBottles: Array<{
    name: string;
    producer: string;
    region: string;
    country: string;
    color: string;
    vintage: number;
    bestVintage: number;
    abv: number;
    strengthLabel: string;
    pairingReason: string;
    merchantNames: string[];
  }>;
  localAvailabilityTip: string;
  source?: "gemini" | "local";
}
