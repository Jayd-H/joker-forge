import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import type { ConsumableData, DeckData, EditionData, EnhancementData, JokerData, SealData, VoucherData } from "../../data/BalatroUtils";

export const generateEditApperanceReturn = (
  effect: Effect,
  itemType: string,
  joker?: JokerData,
  consumable?: ConsumableData,
  card?: EnhancementData | EditionData | SealData,
  voucher?: VoucherData,
  deck?: DeckData,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, 0, joker)
    case "consumable":
      return generateConsumableCode(effect, consumable)
    case "card":
      return generateCardCode(effect, card)
    case "voucher":
      return generateVoucherCode(effect, voucher)
    case "deck":
      return generateDeckCode(effect, deck)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
  sameTypeCount: number = 0,
  joker?: JokerData
): EffectReturn => {
  const card_apperance = effect.params?.card_apperance || "appear";
  const key = effect.params.key as string || "";
  const customMessage = effect.customMessage;

  let editweightCode = "";
if (card_apperance !== "none") {
    if (card_apperance === "appear") {
        editweightCode += `
        G.P_CENTERS["${key}"].in_pool = function() return true end
        `;
  } else if (card_apperance === "disapper") {
        editweightCode += `
        G.P_CENTERS["${key}"].in_pool = function() return false end
        `;
  }
}

  return {
    statement: editweightCode,
    message: customMessage ? `"${customMessage}"`: "",
    colour: "G.C.MONEY",
  };
};

const generateConsumableCode = (
  effect: Effect,
  consumable?: ConsumableData
): EffectReturn => {
  const card_apperance = effect.params?.card_apperance || "appear";
  const key = effect.params.key as string || "";
  const customMessage = effect.customMessage;

  let editweightCode = "";
if (card_apperance !== "none") {
    if (card_apperance === "appear") {
        editweightCode += `
        G.P_CENTERS["${key}"].in_pool = function() return true end
        `;
  } else if (card_apperance === "disapper") {
        editweightCode += `
        G.P_CENTERS["${key}"].in_pool = function() return false end
        `;
  }
}

  return {
    statement: editweightCode,
    message: customMessage ? `"${customMessage}"`: "",
    colour: "G.C.MONEY",
  };
}

const generateCardCode = (
  effect: Effect,
  card?: EditionData | EnhancementData | SealData
): EffectReturn => {
  const card_apperance = effect.params?.card_apperance || "appear";
  const key = effect.params.key as string || "";
  const customMessage = effect.customMessage;

  let editweightCode = "";
if (card_apperance !== "none") {
    if (card_apperance === "appear") {
        editweightCode += `
        G.P_CENTERS["${key}"].in_pool = function() return true end
        `;
  } else if (card_apperance === "disapper") {
        editweightCode += `
        G.P_CENTERS["${key}"].in_pool = function() return false end
        `;
  }
}

  return {
    statement: editweightCode,
    message: customMessage ? `"${customMessage}"`: "",
    colour: "G.C.MONEY",
  };
}

const generateVoucherCode = (
  effect: Effect,
  voucher?: VoucherData
): EffectReturn => {
  const card_apperance = effect.params?.card_apperance || "appear";
  const key = effect.params.key as string || "";

  let editweightCode = "";
if (card_apperance !== "none") {
    if (card_apperance === "appear") {
        editweightCode += `
        G.P_CENTERS["${key}"].in_pool = function() return true end
        `;
  } else if (card_apperance === "disapper") {
        editweightCode += `
        G.P_CENTERS["${key}"].in_pool = function() return false end
        `;
  }
}

  return {
    statement: editweightCode,
    colour: "G.C.MONEY",
  };
}

const generateDeckCode = (
  effect: Effect,
  deck?: DeckData
): EffectReturn => {
  const card_apperance = effect.params?.card_apperance || "appear";
  const key = effect.params.key as string || "";

  let editweightCode = "";
if (card_apperance !== "none") {
    if (card_apperance === "appear") {
        editweightCode += `
        G.P_CENTERS["${key}"].in_pool = function() return true end
        `;
  } else if (card_apperance === "disapper") {
        editweightCode += `
        G.P_CENTERS["${key}"].in_pool = function() return false end
        `;
  }
}

  return {
    statement: editweightCode,
    colour: "G.C.MONEY",
  };
}