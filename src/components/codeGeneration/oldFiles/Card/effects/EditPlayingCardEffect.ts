import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateEditPlayingCardReturn = (
  effect: Effect,
  trigger?: string
): EffectReturn => {
  const newRank = (effect.params?.new_rank as string) || "none";
  const newSuit = (effect.params?.new_suit as string) || "none";
  const newEnhancement = (effect.params?.new_enhancement as string) || "none";
  const newSeal = (effect.params?.new_seal as string) || "none";
  const newEdition = (effect.params?.new_edition as string) || "none";
  const customMessage = effect.customMessage;

  // For card_discarded, we use context.other_card, for others we use card
  const targetCard =
    trigger === "card_discarded" ? "context.other_card" : "card";

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
  const isScoring = scoringTriggers.includes(trigger || "");

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
