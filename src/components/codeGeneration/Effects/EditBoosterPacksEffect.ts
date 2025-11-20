import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../lib/effectUtils";
import { generateConfigVariables, generateValueCode } from "../lib/gameVariableUtils";

export const generateEditBoosterPacksPassiveEffectCode = (
  effect: Effect,
): PassiveEffectResult => {
  const operation = effect.params?.operation.value || "add";
  const selectedType = effect.params?.selected_type.value || "size";

  const valueCode = generateValueCode(effect.params.value.value as string, effect.params.value.valueType);

  let addToDeckValueCode = "";
  let removeFromDeckValueCode = "";

  switch (operation) {
    case "subtract":
      addToDeckValueCode = `-${valueCode}`;
      removeFromDeckValueCode = `+${valueCode}`;
      break;
    case "set":
      addToDeckValueCode = `difference`;
      removeFromDeckValueCode = `difference`;
      break;
    case "add":
    default:
      addToDeckValueCode = `+${valueCode}`;
      removeFromDeckValueCode = `-${valueCode}`;
      break;
  }

  let addToDeck = ''
  let removeFromDeck = ''

  if (selectedType === "size") {
    if (operation !== 'set') {
      addToDeck = `G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) ${addToDeckValueCode}`
      removeFromDeck = `G.GAME.modifiers.booster_size_mod = (G.GAME.modifiers.booster_size_mod or 0) ${removeFromDeckValueCode}`
    } else {
      addToDeck = `
        local card.ability.extra.original_booster_size = G.GAME.modifiers.booster_size_mod or 0
        local difference = ${addToDeckValueCode} - G.GAME.modifiers.booster_size_mod
        G.GAME.modifiers.booster_size_mod = G.GAME.modifiers.booster_size_mod + difference`
      removeFromDeck = `
        if card.ability.extra.original_booster_size then
          local difference = card.ability.extra.original_booster_size - G.GAME.modifiers.booster_size_mod
          G.GAME.modifiers.booster_size_mod = G.GAME.modifiers.booster_size_mod + difference
        end`    
    }
  }
  if (selectedType === "choice") {
    if (operation !== 'set') {
      addToDeck = `G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) ${addToDeckValueCode}`
      removeFromDeck = `G.GAME.modifiers.booster_choice_mod = (G.GAME.modifiers.booster_choice_mod or 0) ${removeFromDeckValueCode}`
    } else {
      addToDeck = `
        local card.ability.extra.original_booster_choices = G.GAME.modifiers.booster_choice_mod or 0
        local difference = ${addToDeckValueCode} - G.GAME.modifiers.booster_choice_mod
        G.GAME.modifiers.booster_choice_mod = G.GAME.modifiers.booster_choice_mod + difference`
      removeFromDeck = `
        if card.ability.extra.original_booster_choices then
          local difference = card.ability.extra.original_booster_choices - G.GAME.modifiers.booster_choice_mod
          G.GAME.modifiers.booster_choice_mod = G.GAME.modifiers.booster_choice_mod + difference
        end`    
    }
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [],
    locVars: [],
  };
};

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
  const operation = effect.params?.operation.value || "add";
  const selected_type = effect.params?.selected_type.value || "size";
  const customMessage = effect.customMessage;

  const variableName =
    sameTypeCount === 0 ? "booster_packs_edit" : `booster_packs_edit${sameTypeCount + 1}`;
  
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
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
        case "add": {
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
        }
        case "subtract": {
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
        }
        case "set": {
          const setMessage = customMessage
            ? `"${customMessage}"`
            : `"Booster Size "..tostring(${valueCode})`;
          EditBoosterCode += `
                func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
            G.GAME.modifiers.booster_size_mod = ${valueCode}
                    return true
                end`;
          break;
        }
      }
    }

    if (selected_type === "choice") {
      switch (operation) {
        case "add": {
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
        }
        case "subtract": {
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
        }
        case "set": {
          const setMessage = customMessage
            ? `"${customMessage}"`
            : `"Booster Choice "..tostring(${valueCode})`;
          EditBoosterCode += `
                func = function()
                  card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                  G.GAME.modifiers.booster_choice_mod = ${valueCode}
                  return true
                end`;
          break;
        }
      }
    }
  }

  if (itemType === "consumable") {
    EditBoosterCode += `
      }))`
      
    EditBoosterCode = `
    __PRE_RETURN_CODE__
    ${EditBoosterCode}
    __PRE_RETURN_CODE_END__`
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
  const operation = effect.params?.operation.value || "add";
  const selected_type = effect.params?.selected_type.value || "size";
  const variableName =
    sameTypeCount === 0 ? "edited_booster" : `edited_booster${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
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
