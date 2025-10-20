import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import { parseRankVariable, parseSuitVariable } from "../variableUtils";
import { JokerData } from "../../../data/BalatroUtils";
import { EDITIONS, getModPrefix } from "../../../data/BalatroUtils";

export const generateEditCardReturn = (
  effect: Effect,
  triggerType: string,
  joker?: JokerData
): EffectReturn => {
  const newRank = (effect.params?.new_rank as string) || "none";
  const newSuit = (effect.params?.new_suit as string) || "none";
  const newEnhancement = (effect.params?.new_enhancement as string) || "none";
  const newSeal = (effect.params?.new_seal as string) || "none";
  const newEdition = (effect.params?.new_edition as string) || "none";
  const customMessage = effect.customMessage;

  const rankVar = parseRankVariable(newRank, joker)
  const suitVar = parseSuitVariable(newSuit, joker)

  let modificationCode = "";
  const target = 'context.other_card'

  if (newRank !== "none" || newSuit !== "none") {
    let suitParam = "nil";
    let rankParam = "nil";
 
    if (suitVar.isSuitVariable) {
      suitParam = `ranks[${suitVar.code}]`;
      modificationCode += `
      local ranks = {
          [2] = '2', [3] = '3', [4] = '4', [5] = '5', [6] = '6', 
          [7] = '7', [8] = '8', [9] = '9', [10] = 'T', 
          [11] = 'Jack', [12] = 'Queen', [13] = 'King', [14] = 'Ace'
      }`
    } else if (newSuit === "random") {
      suitParam = "pseudorandom_element(SMODS.Suits, 'edit_card_suit').key";
    } else if (newSuit !== "none") {
      suitParam = `"${newSuit}"`;
    }

    if (rankVar.isRankVariable) {
      rankParam = `${rankVar.code}`;
    } else if (newRank === "random") {
      rankParam = "pseudorandom_element(SMODS.Ranks, 'edit_card_rank').key";
    } else if (newRank !== "none") {
      rankParam = `"${newRank}"`;
    }

    modificationCode += `
                assert(SMODS.change_base(${target}, ${suitParam}, ${rankParam}))`;
  }

  if (newEnhancement === "remove") {
    modificationCode += `
                ${target}:set_ability(G.P_CENTERS.c_base)`;
  } else if (newEnhancement === "random") {
    modificationCode += `
                local enhancement_pool = {}
                for _, enhancement in pairs(G.P_CENTER_POOLS.Enhanced) do
                    if enhancement.key ~= 'm_stone' then
                        enhancement_pool[#enhancement_pool + 1] = enhancement
                    end
                end
                local random_enhancement = pseudorandom_element(enhancement_pool, 'edit_card_enhancement')
                ${target}:set_ability(random_enhancement)`;
  } else if (newEnhancement !== "none") {
    modificationCode += `
                ${target}:set_ability(G.P_CENTERS.${newEnhancement})`;
  }

  if (newSeal === "remove") {
    modificationCode += `
                context.other_card:set_seal(nil)`;
  } else if (newSeal === "random") {
    modificationCode += `
                local random_seal = SMODS.poll_seal({mod = 10, guaranteed = true})
                if random_seal then
                    ${target}:set_seal(random_seal, true)
                end`;
  } else if (newSeal !== "none") {
    modificationCode += `
                context.other_card:set_seal("${newSeal}", true)`;
  }

  if (newEdition === "remove") {
    modificationCode += `
                ${target}:set_edition(nil)`;
  } else if (newEdition === "random") {
    const editionPool = EDITIONS().map(edition => `'${
                edition.key.startsWith('e_') ? edition.key : `e_${getModPrefix}_${edition.key}`}'`)    
    modificationCode += `
                local edition = pseudorandom_element({${editionPool}}, 'random edition')
                if random_edition then
                    ${target}:set_edition(random_edition, true)
                end`;
  } else if (newEdition !== "none") {
    modificationCode += `
                ${target}:set_edition("${newEdition}", true)`;
  }

  const scoringTriggers = ["card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${modificationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage ? `"${customMessage}"` : `"Card Modified!"`,
      colour: "G.C.BLUE",
    };
  } else {
    return {
      statement: `func = function()${modificationCode}
                    end`,
      message: customMessage ? `"${customMessage}"` : `"Card Modified!"`,
      colour: "G.C.BLUE",
    };
  }
};
