import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateEditCardReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const newRank = (effect.params?.new_rank as string) || "none";
  const newSuit = (effect.params?.new_suit as string) || "none";
  const newEnhancement = (effect.params?.new_enhancement as string) || "none";
  const newSeal = (effect.params?.new_seal as string) || "none";
  const newEdition = (effect.params?.new_edition as string) || "none";
  const customMessage = effect.customMessage;


  let modificationCode = "";
  let target = 'context.other_card'

  if (triggerType == "played_cards_before_scoring"){
    target = 'c'
  }

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
                assert(SMODS.change_base(context.other_card, ${suitParam}, ${rankParam}))`;
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
    modificationCode += `
                local random_edition = poll_edition('edit_card_edition', nil, true, true)
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
