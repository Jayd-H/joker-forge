import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../../lib/effectUtils";

export const generateCombineRanksPassiveEffectCode = (
  effect: Effect, 
  jokerKey: string,
): PassiveEffectResult => {
  const sourceRankType =
    (effect.params?.source_rank_type.value as string) || "specific";
  const sourceRanksString = (effect.params?.source_ranks.value as string) || "J,Q,K";
  const targetRank = (effect.params?.target_rank.value as string) || "J";
  const sourceRanks =
    sourceRankType === "specific"
      ? sourceRanksString.split(",").map((rank) => rank.trim())
      : [];
  
  const configVariables = [
    { name: "source_rank_type", value: `${sourceRankType}` },
    { name: "source_ranks", value: `{${sourceRankType === "specific" ? sourceRanks.map((rank) => `"${rank}"`).join(", ") : [] }}`},
    { name: "target_rank", value: `"${targetRank}"`},
  ]

  return {
    addToDeck: `-- Combine ranks effect enabled`,
    removeFromDeck: `-- Combine ranks effect disabled`,
    configVariables,
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