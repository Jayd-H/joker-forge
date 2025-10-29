import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateConfigVariables } from "../gameVariableUtils";

export const generateEditBoosterPacksEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerAndConsumableCode(effect, sameTypeCount, 'joker')
    case "consumable":
      return generateJokerAndConsumableCode(effect, sameTypeCount, 'consumable')
    case "voucher":
    case "deck":
      return generateVoucherAndDeckCode(effect, sameTypeCount)

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
}

const generateJokerAndConsumableCode = (
  effect: Effect,
  sameTypeCount: number = 0,
  itemType: string
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const selected_type = effect.params?.selected_type || "size";
  const customMessage = effect.customMessage;

  const variableName =
    sameTypeCount === 0 ? "booster_packs_edit" : `booster_packs_edit${sameTypeCount + 1}`;
  
  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'joker'
  )

  let EditBoosterCode = "";

  
  if (itemType === "consumable") {
    EditBoosterCode += `
      G.E_MANAGER:add_event(Event({
      trigger = 'after',
          delay = 0.4,`
  }

  if (selected_type !== "none") { 
    if (selected_type === "size") {
      switch (operation) {
        case "add": 
          const addMessage = customMessage
            ? `"${customMessage}"`
            : `"+"..tostring(${valueCode}).." Booster Size"`;
            EditBoosterCode += `
                func = function()
            card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.DARK_EDITION})
            G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) +${valueCode}
                    return true
                end`;
          break;
        case "subtract":
          const subtractMessage = customMessage
            ? `"${customMessage}"`
            : `"-"..tostring(${valueCode}).." Booster Size"`;
            EditBoosterCode += `
                func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
            G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) -${valueCode}
                    return true
                end`;
          break;
        case "set":
          const setMessage = customMessage
            ? `"${customMessage}"`
            : `"Booster Size "..tostring(${valueCode})`;
            EditBoosterCode += `
                func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
            G.GAME.modifiers.booster_size_mod = ${valueCode}
                    return true
                end`;
          break
      }
    }

    if (selected_type === "choice") {
      switch (operation) {
        case "add":
          const addMessage = customMessage
            ? `"${customMessage}"`
            : `"+"..tostring(${valueCode}).." Booster Choice"`;
            EditBoosterCode += `
                func = function()
            card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.DARK_EDITION})
            G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) +${valueCode}
                    return true
                end`;
          break;
        case "subtract":
          const subtractMessage = customMessage
            ? `"${customMessage}"`
            : `"-"..tostring(${valueCode}).." Booster Choice"`;
            EditBoosterCode += `
                func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
            G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) -${valueCode}
                    return true
                end`;
          break;
        case "set":
          const setMessage = customMessage
            ? `"${customMessage}"`
            : `"Booster Choice "..tostring(${valueCode})`;
            EditBoosterCode += `
                func = function()
                  card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                  G.GAME.modifiers.booster_choice_mod = ${valueCode}
                  return true
                end`;
      }
    }
  }

  if (itemType === "consumable") {
    EditBoosterCode += `
      }))`
  }

  return {
    statement: EditBoosterCode,
    colour: "G.C.BLUE",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  }
};

const generateVoucherAndDeckCode = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const selected_type = effect.params?.selected_type || "size";
  const variableName =
    sameTypeCount === 0 ? "edited_booster" : `edited_booster${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    'voucher'
  );

  let EditBoosterCode = "";


  if (selected_type !== "none") { 
    if (selected_type === "size") {
      if (operation === "add") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) +${valueCode}
                return true
            end
        }))
        `;
      } else if (operation === "subtract") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) -${valueCode}
                return true
            end
        }))
        `;
      } else if (operation === "set") {
        EditBoosterCode += `
        G.E_MANAGER:add_event(Event({
            func = function()
        G.GAME.modifiers.booster_size_mod = ${valueCode}
                return true
            end
        }))
        `;
      }
    }

    if (selected_type === "choice") {
      if (operation === "add") {
        EditBoosterCode += `
          G.E_MANAGER:add_event(Event({
              func = function()
          G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) +${valueCode}
                  return true
              end
          }))
          `;
      } else if (operation === "subtract") {
        EditBoosterCode += `
          G.E_MANAGER:add_event(Event({
              func = function()
          G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) -${valueCode}
                  return true
              end
          }))
          `;
      } else if (operation === "set") {
        EditBoosterCode += `
          G.E_MANAGER:add_event(Event({
              func = function()
          G.GAME.modifiers.booster_choice_mod = ${valueCode}
                  return true
              end
          }))
          `;
      }
    }
  }

  return {
    statement: EditBoosterCode,
    colour: "G.C.BLUE",
    configVariables,
  };
};
