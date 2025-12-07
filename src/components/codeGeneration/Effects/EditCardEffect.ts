import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";
import { EDITIONS } from "../../data/BalatroUtils";

export const generateEditCardEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string, 
  modPrefix: string, 
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, triggerType, modPrefix)
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
): EffectReturn => {
  const newRank = effect.params?.new_rank
  const newSuit = effect.params?.new_suit
  const newEnhancement = effect.params?.new_enhancement
  const newSeal = effect.params?.new_seal
  const newEdition = effect.params?.new_edition
  const customMessage = effect.customMessage;

  const editionPool = EDITIONS().map(edition => `'${
    edition.key.startsWith('e_') ? edition.key : `e_${modPrefix}_${edition.key}`}'`)    

  let modificationCode = "";

  const scoringTriggers = ["card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);
  const target = isScoring ? 'scored_card' : 'context.other_card'

  if (newRank.value !== "none" || newSuit.value !== "none") {
    let suitParam = "nil";
    let rankParam = "nil";
 
    if (newSuit.valueType === "user_var") {
      suitParam = `G.GAME.current_round.${newSuit.value}_card.suit`;
    } else if (newSuit.value === "random") {
      suitParam = "pseudorandom_element(SMODS.Suits, 'edit_card_suit').key";
    } else if (newSuit.value !== "none") {
      suitParam = `"${newSuit.value}"`;
    }

    if (newRank.valueType === "user_var") {
      rankParam = `G.GAME.current_round.${newRank.value}_card.rank`;
    } else if (newRank.value === "random") {
      rankParam = "pseudorandom_element(SMODS.Ranks, 'edit_card_rank').key";
    } else if (newRank.value !== "none") {
      rankParam = `"${newRank.value}"`;
    }

    modificationCode += `
      assert(SMODS.change_base(${target}, ${suitParam}, ${rankParam}))`;
  }

  if (newEnhancement.value === "remove") {
    modificationCode += `
      ${target}:set_ability(G.P_CENTERS.c_base)`;
  } else if (newEnhancement.value === "random") {
    modificationCode += `
      local enhancement_pool = {}
      for _, enhancement in pairs(G.P_CENTER_POOLS.Enhanced) do
          if enhancement.key ~= 'm_stone' then
              enhancement_pool[#enhancement_pool + 1] = enhancement
          end
      end
      local random_enhancement = pseudorandom_element(enhancement_pool, 'edit_card_enhancement')
      ${target}:set_ability(random_enhancement)`;
  } else if (newEnhancement.valueType === "user_var") {
    modificationCode += `
  
      ${target}:set_ability(G.P_CENTERS[card.ability.extra.${newEnhancement.value}])`;
  } else if (newEnhancement.value !== "none") {
    modificationCode += `
      ${target}:set_ability(G.P_CENTERS.${newEnhancement.value})`;
  }

  if (newSeal.value === "remove") {
    modificationCode += `
      ${target}:set_seal(nil)`;
  } else if (newSeal.value === "random") {
    modificationCode += `
      local random_seal = SMODS.poll_seal({mod = 10, guaranteed = true})
      if random_seal then
          ${target}:set_seal(random_seal, true)
      end`;
  } else if (newSeal.valueType === "user_var") {
    modificationCode += `
      ${target}:set_seal(card.ability.extra.${newSeal.value}, true)`;
  } else if (newSeal.value !== "none") {
    modificationCode += `
      ${target}:set_seal("${newSeal.value}", true)`;
  }

  if (newEdition.value === "remove") {
    modificationCode += `
      ${target}:set_edition(nil)`;
  } else if (newEdition.value === "random") {
    modificationCode += `
      local edition = pseudorandom_element({${editionPool}}, 'random edition')
      if random_edition then
          ${target}:set_edition(random_edition, true)
      end`;
  } else if (newEdition.valueType === "user_var") {
    modificationCode += `
      ${target}:set_edition(card.ability.extra.${newEdition.value}, true)`;
  }  else if (newEdition.value !== "none") {
    modificationCode += `
      ${target}:set_edition("${(newEdition.value as string).startsWith("e_") ? newEdition.value : `e_${newEdition.value}`}", true)`;
  }

  if (isScoring) {
    const message = customMessage ? `"${customMessage}"` : `"Card Modified!"`
    return {
      statement: `
        __PRE_RETURN_CODE__
        local scored_card = context.other_card
        G.E_MANAGER:add_event(Event({
          func = function()
            ${modificationCode}
            card_eval_status_text(scored_card, 'extra', nil, nil, nil, {message = ${message}, colour = G.C.ORANGE})
            return true
          end
        }))
        __PRE_RETURN_CODE_END__`,
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
  const newRank = (effect.params?.new_rank.value as string) || "none";
  const newSuit = (effect.params?.new_suit.value as string) || "none";
  const newEnhancement = (effect.params?.new_enhancement.value as string) || "none";
  const newSeal = (effect.params?.new_seal.value as string) || "none";
  const newEdition = (effect.params?.new_edition.value as string) || "none";
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