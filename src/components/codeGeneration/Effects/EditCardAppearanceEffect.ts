import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateEditApperanceEffectCode = (
  effect: Effect,
  itemType: string,
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect)
    case "consumable":
      return generateConsumableCode(effect)
    case "card":
      return generateCardCode(effect)
    case "voucher":
      return generateVoucherCode(effect)
    case "deck":
      return generateDeckCode(effect)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerCode = (
  effect: Effect,
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