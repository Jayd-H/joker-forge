import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../../effectUtils";

export const generateCombineRanksPassiveEffectCode = (
  effect: Effect, 
  jokerKey: string,
): PassiveEffectResult => {
  const sourceRankType =
    (effect.params?.source_rank_type as string) || "specific";
  const sourceRanksString = (effect.params?.source_ranks as string) || "J,Q,K";
  const targetRank = (effect.params?.target_rank as string) || "J";
  const sourceRanks =
    sourceRankType === "specific"
      ? sourceRanksString.split(",").map((rank) => rank.trim())
      : [];

  return {
    addToDeck: `-- Combine ranks effect enabled`,
    removeFromDeck: `-- Combine ranks effect disabled`,
    configVariables: [
      `source_rank_type = "${sourceRankType}"`,
      ...(sourceRankType === "specific"
        ? [
            `source_ranks = {${sourceRanks
              .map((rank) => `"${rank}"`)
              .join(", ")}}`,
          ]
        : []),
      `target_rank = "${targetRank}"`,
    ],
    locVars: [],
    needsHook: {
      hookType: "combine_ranks",
      jokerKey: jokerKey || "PLACEHOLDER",
      effectParams: {
        sourceRankType,
        sourceRanks,
      },
    },
  };
}