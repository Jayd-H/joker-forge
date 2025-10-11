import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";
import { parsePokerHandVariable } from "../variableUtils";
import { JokerData } from "../../../data/BalatroUtils";

export const generateLevelUpHandReturn = (
  triggerType: string = "hand_played",
  effect?: Effect,
  sameTypeCount: number = 0,
  joker?: JokerData
): EffectReturn => {
  const customMessage = effect?.customMessage;
  let valueCode: string;
  let configVariables: ConfigExtraVariable[] = [];

  if (effect) {
    const variableName =
      sameTypeCount === 0 ? "levels" : `levels${sameTypeCount + 1}`;

    const ret = generateConfigVariables(
      effect.params?.value,
      effect.id,
      variableName
    )

    valueCode = ret.valueCode
    configVariables = ret.configVariables
  } else {
    valueCode = "card.ability.extra.levels";
  }


  const customVar = parsePokerHandVariable(effect?.params?.hand_selection || "", joker)
  const targetHandVar = sameTypeCount === 0 ? `target_hand` : `target_hand${sameTypeCount + 1}`

  const handSelection = (effect?.params?.hand_selection as string) || "current";
  const specificHand = (effect?.params?.specific_hand as string) || "High Card";
  
  let handDeterminationCode = "";
  switch (handSelection) {
    case ("specific"):
      handDeterminationCode = `local ${targetHandVar} = "${specificHand}"`;
      break
    case ("random"):
      handDeterminationCode = `
        local available_hands = {}
        for hand, value in pairs(G.GAME.hands) do
          if value.visible and value.level >= to_big(1) then
            table.insert(available_hands, hand)
          end
        end
        local ${targetHandVar} = #available_hands > 0 and pseudorandom_element(available_hands, pseudoseed('level_up_hand')) or "High Card"
        `;
      break
    case ("most"):
      handDeterminationCode = `
        local temp_played = 0
        local temp_order = math.huge
        local ${targetHandVar}
        for hand, value in pairs(G.GAME.hands) do 
          if value.played > temp_played and value.visible then
            temp_played = value.played
            temp_order = value.order
            ${targetHandVar} = hand
          elseif value.played == temp_played and value.visible then
            if value.order < temp_order then
              temp_order = value.order
              ${targetHandVar} = hand
            end
          end
        end
      `;
      break
    case ("least"):
      handDeterminationCode = `
        local temp_played = math.huge
        local temp_order = math.huge
        local ${targetHandVar}
        for hand, value in pairs(G.GAME.hands) do 
          if value.played < temp_played and value.visible then
            temp_played = value.played
            temp_order = value.order
            ${targetHandVar} = hand
          elseif value.played == temp_played and value.visible then
            if value.order < temp_order then
              temp_order = value.order
              ${targetHandVar} = hand
            end
          end
        end
      `;
      break
    case ("current"):
      if (triggerType === "hand_discarded") {
        handDeterminationCode = `
          local text, poker_hands, text_disp, loc_disp_text = G.FUNCS.get_poker_hand_info(G.hand.highlighted)
          local ${targetHandVar} = text
        `;
      } else {
        handDeterminationCode = `local ${targetHandVar} = (context.scoring_name or "High Card")`;
      }
      break
    case ("default"):
      handDeterminationCode = `local ${targetHandVar} = "${customVar.code}"`;
      break
  }
  
  return {
    statement: `
      __PRE_RETURN_CODE__
      ${handDeterminationCode}
      __PRE_RETURN_CODE_END__
      level_up = ${valueCode},
      level_up_hand = ${targetHandVar}`,
    message: customMessage ? `"${customMessage}"` : `localize('k_level_up_ex')`,
    colour: "G.C.RED",
    configVariables: configVariables.length > 0 ? configVariables : undefined
  }
}
