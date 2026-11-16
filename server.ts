import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

app.post("/api/pairing", async (req, res) => {
  try {
    const { dish, colorPreference, grapePreference, location } = req.body ?? {};

    if (!dish || typeof dish !== "string" || dish.trim().length === 0) {
      return res.status(400).json({ error: "Veuillez saisir un plat ou un aliment." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Clé API Gemini non configurée côté serveur. Utilisation du moteur sommelier local.",
      });
    }

    const locationContext = location?.city
      ? `L'utilisateur est géolocalisé à ${location.city} (${location.country || ""}, lat: ${location.lat ?? ""}, lng: ${location.lng ?? ""}). Adapte le conseil de disponibilité locale et la température ambiante.`
      : "Aucune géolocalisation fournie.";

    const constraintsContext = [
      colorPreference && colorPreference !== "Toutes"
        ? `Préférence de couleur souhaitée : ${colorPreference}.`
        : "Toutes couleurs possibles (Rouge, Blanc, Rosé).",
      grapePreference
        ? `Cépage souhaité ou à privilégier si pertinent : ${grapePreference}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Tu es un Maître Sommelier français expert en œnologie mondiale et libanaise.
Analyse ce plat ou aliment pour un accord mets et vins en temps réel : "${dish.trim()}".
${constraintsContext}
${locationContext}

Fournis une réponse structurée en français, précise, technique et gourmande :
- Analyse culinaire du plat (gras, acidité, épices, cuisson, sauce).
- Couleur principale recommandée (Rouge, Blanc ou Rosé) et éventuellement une alternative.
- Style de vin exact.
- 3 à 4 cépages idéaux avec explication précise de l'accord.
- 3 appellations et régions (incluant France, Liban ou Monde selon pertinence) avec leurs meilleures années (millésimes d'exception) et température de service idéale en °C.
- 3 références de bouteilles concrètes avec producteur, région, pays, couleur, millésime conseillé, meilleur millésime historique récent, degré d'alcool estimé, niveau de force (Légère, Souple, Équilibrée, Structurée, Puissante), raison de l'accord et sites marchands fiables (ex: Wine-Searcher, iDealwine, Millésima, Vinatis, Lavinia).
- Conseils de service (carafage, verrerie, température) et remarque sur la disponibilité locale.`,
      config: {
        systemInstruction:
          "Tu es un maître sommelier rigoureux. Réponds uniquement en JSON valide conforme au schéma fourni, en français soigné, sans inventer de fausses URLs farfelues (utilise les domaines réels wine-searcher.com, idealwine.com, millesima.fr, vinatis.com, lavinia.com).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishAnalysis: {
              type: Type.STRING,
              description: "Analyse sensorielle et technique du plat (texture, sauce, épices, gras).",
            },
            recommendedColor: {
              type: Type.STRING,
              description: "Couleur principale recommandée : Rouge, Blanc ou Rosé.",
            },
            secondaryColor: {
              type: Type.STRING,
              description: "Couleur alternative pertinente ou Aucune.",
            },
            wineStyle: {
              type: Type.STRING,
              description: "Style de vin recommandé, ex: Rouge structuré & épicé ou Blanc sec minéral.",
            },
            sommelierRationale: {
              type: Type.STRING,
              description: "Explication œnologique détaillée de pourquoi cet accord fonctionne.",
            },
            servingAdvice: {
              type: Type.OBJECT,
              properties: {
                tempMinC: { type: Type.NUMBER },
                tempMaxC: { type: Type.NUMBER },
                decanting: { type: Type.STRING },
                glassware: { type: Type.STRING },
              },
              required: ["tempMinC", "tempMaxC", "decanting", "glassware"],
            },
            idealGrapes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  color: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["name", "color", "reason"],
              },
            },
            recommendedAppellations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  appellation: { type: Type.STRING },
                  region: { type: Type.STRING },
                  country: { type: Type.STRING },
                  bestVintages: { type: Type.STRING },
                  servingTempC: { type: Type.STRING },
                },
                required: ["appellation", "region", "country", "bestVintages", "servingTempC"],
              },
            },
            specificBottles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  producer: { type: Type.STRING },
                  region: { type: Type.STRING },
                  country: { type: Type.STRING },
                  color: { type: Type.STRING },
                  vintage: { type: Type.INTEGER },
                  bestVintage: { type: Type.INTEGER },
                  abv: { type: Type.NUMBER },
                  strengthLabel: { type: Type.STRING },
                  pairingReason: { type: Type.STRING },
                  merchantNames: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  "name",
                  "producer",
                  "region",
                  "country",
                  "color",
                  "vintage",
                  "bestVintage",
                  "abv",
                  "strengthLabel",
                  "pairingReason",
                  "merchantNames",
                ],
              },
            },
            localAvailabilityTip: {
              type: Type.STRING,
              description: "Conseil adapté à la position géolocalisée de l'utilisateur.",
            },
          },
          required: [
            "dishAnalysis",
            "recommendedColor",
            "wineStyle",
            "sommelierRationale",
            "servingAdvice",
            "idealGrapes",
            "recommendedAppellations",
            "specificBottles",
            "localAvailabilityTip",
          ],
        },
      },
    });

    const jsonText = (response.text ?? "{}").trim();
    const parsed = JSON.parse(jsonText);
    return res.json(parsed);
  } catch (error) {
    console.error("Erreur /api/pairing:", error);
    return res.status(500).json({
      error: "Impossible de générer l'accord en temps réel pour le moment.",
    });
  }
});

app.post("/api/wine-lookup", async (req, res) => {
  try {
    const { query } = req.body ?? {};
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return res.status(400).json({ error: "Veuillez préciser un nom de vin ou de domaine." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Clé API Gemini non configurée côté serveur.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Renseigne la fiche œnologique technique complète pour ce vin : "${query.trim()}".
Donne des valeurs réalistes et précises (couleur Rouge/Blanc/Rosé, producteur, pays, région, appellation, cépages, degré d'alcool, force de 1 à 5, millésime actuel conseillé, meilleure année historique récente, fenêtre de garde, température de service min/max en °C, carafage, verrerie, description technique de la vinification, surface viticole du domaine en ha et de l'appellation en ha, type de sol, altitude en m, notes de dégustation robe/nez/bouche/finale, et 4 accords mets et vins).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            producer: { type: Type.STRING },
            color: { type: Type.STRING },
            country: { type: Type.STRING },
            region: { type: Type.STRING },
            appellation: { type: Type.STRING },
            grapes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            abv: { type: Type.NUMBER },
            strength: { type: Type.INTEGER },
            currentVintage: { type: Type.INTEGER },
            bestVintage: { type: Type.INTEGER },
            drinkingWindow: { type: Type.STRING },
            tempMin: { type: Type.NUMBER },
            tempMax: { type: Type.NUMBER },
            decanting: { type: Type.STRING },
            glassware: { type: Type.STRING },
            vinification: { type: Type.STRING },
            vineyardSurfaceHa: { type: Type.NUMBER },
            regionSurfaceHa: { type: Type.NUMBER },
            soilType: { type: Type.STRING },
            altitudeM: { type: Type.STRING },
            robe: { type: Type.STRING },
            nez: { type: Type.STRING },
            bouche: { type: Type.STRING },
            finale: { type: Type.STRING },
            foodPairings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "name",
            "producer",
            "color",
            "country",
            "region",
            "appellation",
            "grapes",
            "abv",
            "strength",
            "currentVintage",
            "bestVintage",
            "drinkingWindow",
            "tempMin",
            "tempMax",
            "decanting",
            "glassware",
            "vinification",
            "vineyardSurfaceHa",
            "regionSurfaceHa",
            "soilType",
            "altitudeM",
            "robe",
            "nez",
            "bouche",
            "finale",
            "foodPairings",
          ],
        },
      },
    });

    const jsonText = (response.text ?? "{}").trim();
    return res.json(JSON.parse(jsonText));
  } catch (error) {
    console.error("Erreur /api/wine-lookup:", error);
    return res.status(500).json({ error: "Erreur lors de l'analyse œnologique." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Cellier d'Origine actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
