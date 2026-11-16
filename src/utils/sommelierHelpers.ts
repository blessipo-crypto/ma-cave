import { WineColor, WineRegionProfile, UserLocation, FoodPairingResult } from "../types/wine";
import { ALL_REGIONS_FLAT } from "../data/regions";
import { WINES_CATALOG } from "../data/wines";
import { GRAPE_VARIETIES } from "../data/grapes";

export const PRESET_LOCATIONS: UserLocation[] = [
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522, source: "preset", ambientTempC: 18 },
  { city: "Bordeaux", country: "France", lat: 44.8378, lng: -0.5792, source: "preset", ambientTempC: 19 },
  { city: "Lyon", country: "France", lat: 45.764, lng: 4.8357, source: "preset", ambientTempC: 18 },
  { city: "Marseille", country: "France", lat: 43.2965, lng: 5.3698, source: "preset", ambientTempC: 22 },
  { city: "Beyrouth", country: "Liban", lat: 33.8938, lng: 35.5018, source: "preset", ambientTempC: 24 },
  { city: "Zahle (Bekaa)", country: "Liban", lat: 33.8463, lng: 35.902, source: "preset", ambientTempC: 20 },
  { city: "Genève", country: "Suisse", lat: 46.2044, lng: 6.1432, source: "preset", ambientTempC: 16 },
  { city: "Bruxelles", country: "Belgique", lat: 50.8503, lng: 4.3517, source: "preset", ambientTempC: 16 },
  { city: "Milan", country: "Italie", lat: 45.4642, lng: 9.19, source: "preset", ambientTempC: 19 },
  { city: "Madrid", country: "Espagne", lat: 40.4168, lng: -3.7038, source: "preset", ambientTempC: 21 },
];

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function getNearestRegions(
  location: UserLocation,
  limit = 4
): Array<{ region: WineRegionProfile; distanceKm: number }> {
  return ALL_REGIONS_FLAT.map((region) => ({
    region,
    distanceKm: haversineDistanceKm(
      location.lat,
      location.lng,
      region.coordinates.lat,
      region.coordinates.lng
    ),
  }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export function getStrengthLabel(strength: number): string {
  switch (strength) {
    case 1:
      return "Très légère";
    case 2:
      return "Souple & fine";
    case 3:
      return "Équilibrée";
    case 4:
      return "Structurée";
    case 5:
      return "Puissante & corsée";
    default:
      return "Équilibrée";
  }
}

export function getColorHex(color: WineColor): {
  swatch: string;
  text: string;
  subtleBg: string;
  border: string;
} {
  if (color === "Rouge") {
    return {
      swatch: "#7B1E32",
      text: "text-[#7B1E32]",
      subtleBg: "bg-[#7B1E32]/8",
      border: "border-[#7B1E32]/25",
    };
  }
  if (color === "Blanc") {
    return {
      swatch: "#B9922F",
      text: "text-[#8A6914]",
      subtleBg: "bg-[#C9A64B]/12",
      border: "border-[#C9A64B]/35",
    };
  }
  return {
    swatch: "#C86B6B",
    text: "text-[#A34848]",
    subtleBg: "bg-[#D47A7A]/12",
    border: "border-[#D47A7A]/35",
  };
}

export function buildLocalFallbackPairing(
  dish: string,
  colorPreference: string,
  grapePreference: string,
  location: UserLocation | null
): FoodPairingResult {
  const lower = dish.toLowerCase();

  let color: WineColor = "Rouge";
  if (
    colorPreference === "Blanc" ||
    colorPreference === "Rosé" ||
    colorPreference === "Rouge"
  ) {
    color = colorPreference;
  } else if (
    /(poisson|bar|dorade|homard|huître|coquillage|crabe|saumon|turbot|sole|fromage blanc|chèvre|asperge|ceviche|sushi)/.test(
      lower
    )
  ) {
    color = "Blanc";
  } else if (
    /(mezzé|taboulé|salade|grillade d'été|bouillabaisse|tapas|tomate|burrata|rouget)/.test(lower)
  ) {
    color = "Rosé";
  }

  const matchingWines = WINES_CATALOG.filter((w) => {
    const colorOk = w.color === color;
    const grapeOk =
      !grapePreference ||
      w.grapes.some((g) => g.name.toLowerCase().includes(grapePreference.toLowerCase()));
    return colorOk && grapeOk;
  }).slice(0, 3);

  const fallbackWines =
    matchingWines.length > 0
      ? matchingWines
      : WINES_CATALOG.filter((w) => w.color === color).slice(0, 3);

  const matchingGrapes = GRAPE_VARIETIES.filter(
    (g) =>
      g.colors.includes(color) &&
      (!grapePreference || g.name.toLowerCase().includes(grapePreference.toLowerCase()))
  ).slice(0, 3);

  const tempRange =
    color === "Rouge"
      ? { min: 16, max: 18 }
      : color === "Blanc"
      ? { min: 9, max: 12 }
      : { min: 9, max: 11 };

  const nearest = location ? getNearestRegions(location, 2) : [];

  return {
    dishAnalysis: `Analyse gastronomique de « ${dish} » : profil aromatique et équilibre texture/sauce orientant vers un vin ${color.toLowerCase()} expressif et équilibré.`,
    recommendedColor: color,
    secondaryColor: color === "Rouge" ? "Blanc structuré" : "Rosé gastronomique",
    wineStyle:
      color === "Rouge"
        ? "Rouge équilibré aux tanins souples ou structurés"
        : color === "Blanc"
        ? "Blanc sec tendu et aromatique"
        : "Rosé sec méditerranéen de gastronomie",
    sommelierRationale:
      color === "Rouge"
        ? "Les protéines et sucs de cuisson se lient aux tanins mûrs du vin, tandis que l'acidité préserve la digestibilité en fin de bouche."
        : color === "Blanc"
        ? "L'acidité naturelle et la minéralité réveillent la finesse du mets sans en masquer les saveurs délicates."
        : "La fraîcheur fruitée et la légère structure phénolique accompagnent idéalement les herbes, épices douces et plats solaires.",
    servingAdvice: {
      tempMinC: tempRange.min,
      tempMaxC: tempRange.max,
      decanting:
        color === "Rouge"
          ? "Carafage 45 min à 1h recommandé pour ouvrir le bouquet."
          : "Servir directement dans un verre tulipe frais sans glace excessive.",
      glassware:
        color === "Rouge" ? "Grand verre tulipe à Bordeaux/Bourgogne" : "Verre tulipe à vin blanc",
    },
    idealGrapes: matchingGrapes.map((g) => ({
      name: g.name,
      color,
      reason: g.description.slice(0, 140) + "…",
    })),
    recommendedAppellations: fallbackWines.map((w) => ({
      appellation: w.appellation,
      region: w.region,
      country: w.country,
      bestVintages: [w.bestVintage, ...w.otherTopVintages.slice(0, 2)].join(", "),
      servingTempC: `${w.servingTempC.min}–${w.servingTempC.max} °C`,
    })),
    specificBottles: fallbackWines.map((w) => ({
      name: w.name,
      producer: w.producer,
      region: w.region,
      country: w.country,
      color: w.color,
      vintage: w.currentVintage,
      bestVintage: w.bestVintage,
      abv: w.abv,
      strengthLabel: getStrengthLabel(w.strength),
      pairingReason: `Accord recommandé sur ${dish} grâce à son profil ${w.tastingNotes.bouche.toLowerCase()}`,
      merchantNames: w.merchants.map((m) => m.name),
    })),
    localAvailabilityTip:
      nearest.length > 0
        ? `Depuis ${location?.city} (${location?.country}), vous êtes à proximité de ${nearest[0].region.name} (${nearest[0].distanceKm} km) et ${nearest[1]?.region.name} (${nearest[1]?.distanceKm} km). Privilégiez une température de service légèrement rafraîchie (${tempRange.min} °C) en cas de pièce chaude.`
        : "Activez la géolocalisation pour adapter les recommandations d'approvisionnement local.",
    source: "local",
  };
}
