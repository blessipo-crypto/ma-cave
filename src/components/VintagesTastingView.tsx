import React, { useState, useMemo } from "react";
import { VINTAGE_CATEGORIES } from "../data/vintages";
import { WineColor, WineReference, PersonalTastingNote } from "../types/wine";
import { getColorHex } from "../utils/sommelierHelpers";
import { VintageScoreChart } from "./WineCharts";
import { Star, Thermometer, Eye, Wind, GlassWater } from "lucide-react";

interface VintagesTastingViewProps {
  wines: WineReference[];
  notesMap: Record<string, PersonalTastingNote>;
  onSelectWine: (wine: WineReference) => void;
}

export const VintagesTastingView: React.FC<VintagesTastingViewProps> = ({
  wines,
  notesMap,
  onSelectWine,
}) => {
  const [colorFilter, setColorFilter] = useState<WineColor | "Tous">("Tous");

  const filteredCategories = useMemo(
    () =>
      VINTAGE_CATEGORIES.filter(
        (cat) => colorFilter === "Tous" || cat.color === colorFilter
      ),
    [colorFilter]
  );

  const tastedEntries = useMemo(() => {
    return Object.values(notesMap)
      .filter((n) => n.tasted || n.bottlesInCellar > 0 || n.notes.trim().length > 0)
      .map((note) => ({
        note,
        wine: wines.find((w) => w.id === note.wineId),
      }))
      .filter((entry): entry is { note: PersonalTastingNote; wine: WineReference } =>
        Boolean(entry.wine)
      )
      .sort((a, b) => b.note.score20 - a.note.score20);
  }, [notesMap, wines]);

  return (
    <div className="space-y-8">
      {/* Section 1: Best Vintages by Color & Wine Type */}
      <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 lg:p-7 space-y-6 shadow-[0_2px_12px_-4px_rgba(26,24,23,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D9] pb-4">
          <div>
            <div className="text-xs text-[#645D58] mb-1">
              Courbes des Millésimes · Cote par Couleur, Région &amp; Garde
            </div>
            <h1 className="font-editorial text-3xl font-semibold text-[#1A1817]">
              Meilleures Années par Couleur &amp; Type de Vin
            </h1>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F2EFE9] rounded-xl border border-[#E8E2D9]">
            {(["Tous", "Rouge", "Blanc", "Rosé"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColorFilter(c)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  colorFilter === c
                    ? "bg-[#821D35] text-white"
                    : "text-[#4E4742] hover:text-[#1A1817]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCategories.map((cat) => {
            const cStyle = getColorHex(cat.color);
            return (
              <div
                key={cat.id}
                className="border border-[#E8E2D9] rounded-2xl overflow-hidden bg-[#FAF9F6]"
              >
                <div className="p-4 bg-white border-b border-[#E8E2D9] flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#645D58]">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cStyle.swatch }}
                      />
                      <span className={`font-semibold ${cStyle.text}`}>{cat.color}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {cat.country} — {cat.region}
                      </span>
                    </div>
                    <h2 className="font-editorial text-xl font-semibold text-[#1A1817] mt-0.5">
                      {cat.title}
                    </h2>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-[#645D58]">Meilleure année</div>
                    <div className="font-mono-tabular text-2xl font-bold text-[#821D35]">
                      {cat.bestYear}
                    </div>
                  </div>
                </div>

                {/* Visual Vintage Score Bar Chart */}
                <VintageScoreChart
                  vintages={cat.vintages}
                  bestYear={cat.bestYear}
                  color={cat.color}
                />

                <div className="px-4 py-2.5 text-xs text-[#4E4742] border-b border-[#E8E2D9] leading-relaxed">
                  {cat.bestYearReason}
                </div>

                <div className="divide-y divide-[#E8E2D9]">
                  {cat.vintages.map((v) => (
                    <div
                      key={v.year}
                      className="px-4 py-2.5 flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`font-mono-tabular font-bold w-11 shrink-0 ${
                            v.year === cat.bestYear ? "text-[#821D35]" : "text-[#1A1817]"
                          }`}
                        >
                          {v.year}
                        </span>
                        <div>
                          <span className="font-semibold text-[#1A1817]">{v.status}</span>
                          <span className="text-[#4E4742] ml-2">{v.note}</span>
                        </div>
                      </div>
                      <span className="font-mono-tabular font-semibold text-[#1A1817] shrink-0">
                        {v.score20.toFixed(1)}/20
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Conseils Techniques de Dégustation & Températures */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden items-stretch shadow-[0_2px_12px_-4px_rgba(26,24,23,0.04)]">
        <div className="lg:col-span-5 relative min-h-[260px] bg-[#EFEAE0]">
          <img
            src="/src/assets/images/tasting_glasses_trio_1794793380320.jpg"
            alt="Trois verres de dégustation : vin rouge, vin blanc et vin rosé sur travertin"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-6 text-white">
            <div className="text-xs text-white/80">Méthode de dégustation professionnelle</div>
            <div className="font-editorial text-2xl font-semibold">
              L&apos;art de l&apos;analyse sensorielle en 3 temps
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 lg:p-8 space-y-5">
          <h2 className="font-editorial text-2xl font-semibold text-[#1A1817]">
            Conseils techniques de dégustation &amp; températures de service
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="border border-[#E8E2D9] rounded-xl p-4 bg-[#FAF9F6] space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[#1A1817]">
                <Eye className="w-4 h-4 text-[#821D35]" />
                1. Examen Visuel (Robe)
              </div>
              <p className="text-[#4E4742] leading-relaxed">
                Inclinez le verre à 45° sur fond blanc. Observez la limpidité, l&apos;intensité
                colorante et le disque : un bord violacé signe la jeunesse, un reflet tuilé ou
                ambré révèle l&apos;évolution.
              </p>
            </div>

            <div className="border border-[#E8E2D9] rounded-xl p-4 bg-[#FAF9F6] space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[#1A1817]">
                <Wind className="w-4 h-4 text-[#821D35]" />
                2. Examen Olfactif (1er &amp; 2e Nez)
              </div>
              <p className="text-[#4E4742] leading-relaxed">
                Sentez sans agiter (arômes primaires fruités/floraux), puis aérez par rotation pour
                libérer les notes secondaires (fermentation, brioche) et tertiaires (cuir, truffe,
                cèdre).
              </p>
            </div>

            <div className="border border-[#E8E2D9] rounded-xl p-4 bg-[#FAF9F6] space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[#1A1817]">
                <GlassWater className="w-4 h-4 text-[#821D35]" />
                3. Examen Gustatif &amp; Caudalies
              </div>
              <p className="text-[#4E4742] leading-relaxed">
                Évaluez l&apos;attaque, le milieu de bouche (équilibre alcool / acidité / tanins) et
                comptez les secondes de persistance aromatique (1 caudalie = 1 seconde après
                déglutition).
              </p>
            </div>
          </div>

          <div className="border border-[#E8E2D9] rounded-xl p-4 bg-[#F4F0E8] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1817]">
              <Thermometer className="w-4 h-4 text-[#821D35]" />
              Échelle des températures de service idéales
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-white border border-[#E8E2D9] rounded-xl p-3">
                <div className="font-mono-tabular font-bold text-[#9A711D]">8 – 10 °C</div>
                <div className="font-semibold text-[#1A1817] mt-0.5">Blancs vifs, Rosés &amp; Champagnes</div>
                <div className="text-[11px] text-[#645D58] mt-0.5">Sancerre, Muscadet, Provence</div>
              </div>
              <div className="bg-white border border-[#E8E2D9] rounded-xl p-3">
                <div className="font-mono-tabular font-bold text-[#9A711D]">11 – 13 °C</div>
                <div className="font-semibold text-[#1A1817] mt-0.5">Grands Blancs de garde</div>
                <div className="text-[11px] text-[#645D58] mt-0.5">Meursault, Condrieu, Musar Blanc</div>
              </div>
              <div className="bg-white border border-[#E8E2D9] rounded-xl p-3">
                <div className="font-mono-tabular font-bold text-[#821D35]">13 – 15 °C</div>
                <div className="font-semibold text-[#1A1817] mt-0.5">Rouges souples &amp; Vins Jaunes</div>
                <div className="text-[11px] text-[#645D58] mt-0.5">Pinot Noir, Gamay, Chinon, Cinsault</div>
              </div>
              <div className="bg-white border border-[#E8E2D9] rounded-xl p-3">
                <div className="font-mono-tabular font-bold text-[#821D35]">16 – 18 °C</div>
                <div className="font-semibold text-[#1A1817] mt-0.5">Grands Rouges structurés</div>
                <div className="text-[11px] text-[#645D58] mt-0.5">Bordeaux, Bekaa, Barolo, Rhône</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: My Personal Tasting & Rating Log */}
      <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 space-y-4 shadow-[0_2px_12px_-4px_rgba(26,24,23,0.04)]">
        <div className="border-b border-[#E8E2D9] pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#1A1817]">
              Mon Carnet de Dégustation &amp; Notes Personnelles ({tastedEntries.length})
            </h2>
            <p className="text-xs text-[#645D58]">
              Historique de vos bouteilles notées et de votre inventaire en cave
            </p>
          </div>
        </div>

        {tastedEntries.length === 0 ? (
          <p className="text-sm text-[#645D58] py-4">
            Vous n&apos;avez pas encore noté de bouteille. Ouvrez n&apos;importe quelle fiche de vin
            pour enregistrer votre note sur 20, vos étoiles, le nombre de bouteilles en cave et vos
            commentaires de dégustation.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8E2D9] text-[#645D58]">
                  <th className="py-2.5 pr-4 font-medium">Vin</th>
                  <th className="py-2.5 px-3 font-medium">Origine</th>
                  <th className="py-2.5 px-3 font-medium">Millésime</th>
                  <th className="py-2.5 px-3 font-medium">En cave</th>
                  <th className="py-2.5 px-3 font-medium">Ma Note</th>
                  <th className="py-2.5 pl-3 font-medium">Commentaires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {tastedEntries.map(({ note, wine }) => (
                  <tr
                    key={wine.id}
                    onClick={() => onSelectWine(wine)}
                    className="hover:bg-[#FAF9F6] cursor-pointer"
                  >
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-[#1A1817]">{wine.name}</div>
                      <div className="text-[11px] text-[#645D58]">{wine.color}</div>
                    </td>
                    <td className="py-3 px-3 text-[#4E4742]">
                      {wine.country} · {wine.region}
                    </td>
                    <td className="py-3 px-3 font-mono-tabular">
                      {note.favoriteVintage ?? wine.currentVintage}
                    </td>
                    <td className="py-3 px-3 font-mono-tabular font-semibold">
                      {note.bottlesInCellar} btl
                    </td>
                    <td className="py-3 px-3 font-mono-tabular font-semibold text-[#821D35]">
                      {note.tasted ? `${note.score20.toFixed(1)}/20` : "Non dégustée"}
                      {note.tasted && (
                        <span className="ml-1.5 inline-flex items-center text-[#B58932]">
                          <Star className="w-3 h-3 fill-[#B58932]" />
                          {note.stars}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pl-3 text-[#4E4742] max-w-xs truncate">
                      {note.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
