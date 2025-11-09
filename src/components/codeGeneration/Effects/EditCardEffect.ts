import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { EDITIONS, JokerData } from "../../data/BalatroUtils";
import { parseRankVariable, parseSuitVariable } from "../lib/userVariableUtils";

export const generateEditCardEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string, 
  modPrefix: string, 
  joker?: JokerData,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType, modPrefix, joker)
    case "card":
      return generateCardCode(effect, triggerType)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  triggerType: string,
  modPrefix: string,
  joker?: JokerData
): EffectReturn => {
  const newRank = (effect.params?.new_rank as string) || "none";
  const newSuit = (effect.params?.new_suit as string) || "none";
  const newEnhancement = (effect.params?.new_enhancement as string) || "none";
  const newSeal = (effect.params?.new_seal as string) || "none";
  const newEdition = (effect.params?.new_edition as string) || "none";
  const customMessage = effect.customMessage;

  const editionPool = EDITIONS().map(edition => `'${
    edition.key.startsWith('e_') ? edition.key : `e_${modPrefix}_${edition.key}`}'`)    

  const variableUsers = effect.params?.variables as boolean[] || [false, false, false];
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
  } else if (variableUsers[0]) {
    modificationCode += `
  
      ${target}:set_ability(G.P_CENTERS[card.ability.extra.${newEnhancement}])`;
  } else if (newEnhancement !== "none") {
    modificationCode += `
      ${target}:set_ability(G.P_CENTERS.${newEnhancement})`;
  }

  if (newSeal === "remove") {
    modificationCode += `
      ${target}:set_seal(nil)`;
  } else if (newSeal === "random") {
    modificationCode += `
      local random_seal = SMODS.poll_seal({mod = 10, guaranteed = true})
      if random_seal then
          ${target}:set_seal(random_seal, true)
      end`;
  } else if (variableUsers[1]) {
    modificationCode += `
      ${target}:set_seal(card.ability.extra.${newSeal}, true)`;
  } else if (newSeal !== "none") {
    modificationCode += `
      ${target}:set_seal("${newSeal}", true)`;
  }

  if (newEdition === "remove") {
    modificationCode += `
      ${target}:set_edition(nil)`;
  } else if (newEdition === "random") {
    modificationCode += `
      local edition = pseudorandom_element({${editionPool}}, 'random edition')
      if random_edition then
          ${target}:set_edition(random_edition, true)
      end`;
  } else if (variableUsers[2]) {
    modificationCode += `
      ${target}:set_edition(card.ability.extra.${newEdition}, true)`;
  }  else if (newEdition !== "none") {
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

const generateCardCode = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const newRank = (effect.params?.new_rank as string) || "none";
  const newSuit = (effect.params?.new_suit as string) || "none";
  const newEnhancement = (effect.params?.new_enhancement as string) || "none";
  const newSeal = (effect.params?.new_seal as string) || "none";
  const newEdition = (effect.params?.new_edition as string) || "none";
  const customMessage = effect.customMessage;

  // For card_discarded, we use context.other_card, for others we use card
  const targetCard =
    triggerType === "card_discarded" ? "context.other_card" : "card";

  let modificationCode = "";

  if (newRank !== "none" || newSuit !== "none") {
    let suitParam = "nil";
    let rankParam = "nil";

    if (newSuit === "random") {
      suitParam = "pseudorandom_element(SMODS.Suits, 'edit_card_suit').key";
    } else if (newSuit !== "none") {
      suitParam = `"${newSuit}"`;
    }

    if (newRank === "random") {
      rankParam = "pseudorandom_element(SMODS.Ranks, 'edit_card_rank').key";
    } else if (newRank !== "none") {
      rankParam = `"${newRank}"`;
    }

    modificationCode += `
      assert(SMODS.change_base(${targetCard}, ${suitParam}, ${rankParam}))`;
  }

  if (newEnhancement === "remove") {
    modificationCode += `
      ${targetCard}:set_ability(G.P_CENTERS.c_base)`;
  } else if (newEnhancement === "random") {
    modificationCode += `
      local enhancement_pool = {}
      for _, enhancement in pairs(G.P_CENTER_POOLS.Enhanced) do
          if enhancement.key ~= 'm_stone' then
              enhancement_pool[#enhancement_pool + 1] = enhancement
          end
      end
      local random_enhancement = pseudorandom_element(enhancement_pool, 'edit_card_enhancement')
      ${targetCard}:set_ability(random_enhancement)`;
  } else if (newEnhancement !== "none") {
    modificationCode += `
      ${targetCard}:set_ability(G.P_CENTERS.${newEnhancement})`;
  }

  if (newSeal === "remove") {
    modificationCode += `
                ${targetCard}:set_seal(nil)`;
  } else if (newSeal === "random") {
    modificationCode += `
                local random_seal = SMODS.poll_seal({mod = 10})
                if random_seal then
                    ${targetCard}:set_seal(random_seal, true)
                end`;
  } else if (newSeal !== "none") {
    modificationCode += `
                ${targetCard}:set_seal("${newSeal}", true)`;
  }

  if (newEdition === "remove") {
    modificationCode += `
                ${targetCard}:set_edition(nil)`;
  } else if (newEdition === "random") {
    modificationCode += `
                local random_edition = poll_edition('edit_card_edition', nil, true, true)
                if random_edition then
                    ${targetCard}:set_edition(random_edition, true)
                end`;
  } else if (newEdition !== "none") {
    modificationCode += `
                ${targetCard}:set_edition("${newEdition}", true)`;
  }

  const scoringTriggers = ["card_scored"];
  const isScoring = scoringTriggers.includes(triggerType || "");

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
}