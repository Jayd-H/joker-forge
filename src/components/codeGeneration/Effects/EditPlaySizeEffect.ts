import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn, PassiveEffectResult } from "../effectUtils";
import { generateConfigVariables, parseGameVariable, parseRangeVariable } from "../gameVariableUtils";
import { generateGameVariableCode } from "../Consumables/gameVariableUtils";

export const generateEditPlaySizePassiveEffectCode = (
  effect: Effect,
): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) { /// change to generateConfigVariables maybe, i dunno, i dont see it necessary
    valueCode = generateGameVariableCode(effectValue as string);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `handsize_passive`;
    valueCode = `pseudorandom('${seedName}', ${rangeParsed.min}, ${rangeParsed.max})`;
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    valueCode = (effectValue as number | boolean).toString();
  }

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `SMODS.change_play_limit(${valueCode})`;
      removeFromDeck = `SMODS.change_play_limit(-${valueCode})`;
      break;
    case "subtract":
      addToDeck = `SMODS.change_play_limit(-${valueCode})`;
      removeFromDeck = `SMODS.change_play_limit(${valueCode})`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_play_size = G.GAME.starting_params.play_limit
        local difference = ${valueCode} - G.GAME.starting_params.play_limit
        SMODS.change_play_limit(difference)`;
      removeFromDeck = `if card.ability.extra.original_play_size then
            local difference = card.ability.extra.original_play_size - G.GAME.starting_params.play_limit
            SMODS.change_play_limit(difference)
        end`;
      break;
    default:
      addToDeck = `SMODS.change_play_limit(${valueCode})`;
      removeFromDeck = `SMODS.change_play_limit(-${valueCode})`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [],
    locVars: [],
  };
};

export const generateEditPlaySizeEffectCode = (
  effect: Effect,
  itemType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";

  const variableName =
    sameTypeCount === 0 ? "play_size" : `play_size${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName,
    itemType
  )

  let value = valueCode
  let setCode = ''
  switch (operation){
    case "subtract":
      value = `-${valueCode}`
      break
    case "set":
      value = `difference`
      setCode = `                  
      local current_play_size = G.GAME.starting_params.play_limit
      local target_play_size = ${valueCode}
      local difference = target_play_size - current_play_size`
      break
    case "add":
    default:
      value = `${valueCode}`
      break
  }

  const customMessage = effect.customMessage;
  const addMessage = customMessage
    ? `"${customMessage}"`
    : `"+"..tostring(${valueCode}).." Play Size"`;
  let functionCode = ``
  
  if (itemType === "consumable") {
    functionCode += `__PRE_RETURN_CODE__`
  }
  
  if (itemType === "consumable" || itemType === "voucher" || itemType === "deck") {
    functionCode += `
      G.E_MANAGER:add_event(Event({`
  }

  if (itemType === "consumable") {
    functionCode += `
      trigger = 'after',
      delay = 0.4,
      func = function()`
  }

  const evalStatusText = itemType === "joker" || itemType === "consumable"
    ? `card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.BLUE})`
    : ``

  functionCode += `
    func = function()
      ${evalStatusText}
      ${setCode}
      SMODS.change_play_limit(${value})
      return true
    end`

  if (itemType === "consumable" || itemType === "voucher" || itemType === "deck") {
    functionCode += `
      }))`
  }
  
  if (itemType === "consumable") {
    functionCode += `
    delay(0.6)
__PRE_RETURN_CODE_END__`;
  }

  return {
    statement: functionCode,
    colour: "G.C.WHITE",
    configVariables
  }
}