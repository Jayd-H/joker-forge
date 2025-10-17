import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import { getRankId, JokerData } from "../../../data/BalatroUtils";
import { parseRankVariable } from "../variableUtils";

export const generatePassiveCombineRanks = (
  effect: Effect,
  joker?: JokerData,
): PassiveEffectResult => {
  const sourceRankType =
    (effect.params?.source_rank_type as string) || "specific";
  const sourceRanksString = (effect.params?.source_ranks as string) || "J,Q,K";
  const targetRank = (effect.params?.target_rank as string) || "J";
  const targetRankVar = parseRankVariable(effect.params?.target_rank as string, joker)
  const sourceRanks =
    sourceRankType === "specific"
      ? sourceRanksString.split(",").map((rank) => rank.trim())
      : [];
  const targetRankFinal = targetRankVar.isRankVariable ? `G.GAME.current_round.${targetRankVar.code}_card.rank` : targetRank
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
      `target_rank = "${targetRankFinal}"`,
    ],
    locVars: [],
    needsHook: {
      hookType: "combine_ranks",
      jokerKey: joker?.objectKey || "PLACEHOLDER",
      effectParams: {
        sourceRankType,
        sourceRanks,
        targetRankFinal,
      },
    },
  };
};

export const generateCombineRanksHook = (
  combineRanksJokers: Array<{
    jokerKey: string;
    params: {
      sourceRankType: string;
      sourceRanks: string[];
      targetRank: string;
    };
  }>,
  modPrefix: string
): string => {
  if (combineRanksJokers.length === 0) return "";

  let hookCode = "";

  // Check if any joker targets face_cards - if so, hook Card.is_face
  const faceCardJokers = combineRanksJokers.filter(
    ({ params }) => params.targetRank === "face_cards"
  );
  if (faceCardJokers.length > 0) {
    hookCode += `
local card_is_face_ref = Card.is_face
function Card:is_face(from_boss)
    local original_result = card_is_face_ref(self, from_boss)
    if original_result then return true end
    
    local card_id = self:get_id()
    if not card_id then return false end
`;
    faceCardJokers.forEach(({ jokerKey, params }) => {
      const fullJokerKey = `j_${modPrefix}_${jokerKey}`;
      hookCode += `
    if next(SMODS.find_card("${fullJokerKey}")) then`;
      if (params.sourceRankType === "all") {
        hookCode += `
        return true`;
      } else if (params.sourceRankType === "face_cards") {
        hookCode += `
        if card_id >= 11 and card_id <= 13 then return true end`;
      } else if (params.sourceRankType === "specific") {
        const sourceIds = params.sourceRanks.map((rank) => getRankId(rank));
        hookCode += `
        local source_ids = {${sourceIds.join(", ")}}
        for _, source_id in pairs(source_ids) do
            if card_id == source_id then return true end
        end`;
      }
      hookCode += `
    end`;
    });
    hookCode += `
    return false
end
`;
  }

  // For non-face_cards targets, hook Card:get_id
  const nonFaceCardJokers = combineRanksJokers.filter(
    ({ params }) => params.targetRank !== "face_cards"
  );
  if (nonFaceCardJokers.length > 0) {
    hookCode += `
local card_get_id_ref = Card.get_id
function Card:get_id()
    local original_id = card_get_id_ref(self)
    if not original_id then return original_id end
`;
    nonFaceCardJokers.forEach(({ jokerKey, params }) => {
      const fullJokerKey = `j_${modPrefix}_${jokerKey}`;
      const targetId = getRankId(params.targetRank);
      hookCode += `
    if next(SMODS.find_card("${fullJokerKey}")) then`;
      if (params.sourceRankType === "all") {
        hookCode += `
        return ${targetId}`;
      } else if (params.sourceRankType === "face_cards") {
        hookCode += `
        if original_id >= 11 and original_id <= 13 then return ${targetId} end`;
      } else if (params.sourceRankType === "specific") {
        const sourceIds = params.sourceRanks.map((rank) => getRankId(rank));
        hookCode += `
        local source_ids = {${sourceIds.join(", ")}}
        for _, source_id in pairs(source_ids) do
            if original_id == source_id then return ${targetId} end
        end`;
      }
      hookCode += `
    end`;
    });
    hookCode += `
    return original_id
end
`;
  }

  return hookCode;
};
