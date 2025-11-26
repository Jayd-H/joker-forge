import type { Effect } from "../../ruleBuilder/types";
import type { ConfigExtraVariable, EffectReturn } from "../lib/effectUtils";
import type { EditionData, EnhancementData, JokerData, SealData } from "../../data/BalatroUtils";
import {
  generateConfigVariables,
  generateValueCode,
} from "../lib/gameVariableUtils";
import { parsePokerHandVariable } from "../lib/userVariableUtils";

export const generateLevelUpHandEffectCode = (
  effect: Effect,
  itemType: string,
  triggerType: string,
  sameTypeCount: number = 0,
  joker?: JokerData,
  card?: EnhancementData | EditionData | SealData,

): EffectReturn => {
  switch(itemType) {
    case "joker":
      return generateJokerCode(effect, sameTypeCount, triggerType, joker)
    case "consumable":
      return generateConsumableCode(effect)
    case "card":
      return generateCardCode(effect, sameTypeCount, card)

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
  triggerType: string,
  joker?: JokerData,
): EffectReturn => {
  const customMessage = effect?.customMessage;

  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    "levels",
    sameTypeCount,
    'joker',
    joker,
  )

  const customVar = parsePokerHandVariable(effect?.params?.hand_selection || "", joker)
  const targetHandVar = sameTypeCount === 0 ? `target_hand` : `target_hand${sameTypeCount + 1}`

  const handSelection = (effect?.params?.hand_selection?.value as string) || "current";
  const specificHand = (effect?.params?.specific_hand?.value as string) || "High Card";
  
  let handDeterminationCode = "";
   if (handSelection === "specific") {
      handDeterminationCode = `local ${targetHandVar} = "${specificHand}"`;
      
    } else if (handSelection === "random") {
      handDeterminationCode = `
        local available_hands = {}
        for hand, value in pairs(G.GAME.hands) do
          if value.visible and value.level >= to_big(1) then
            table.insert(available_hands, hand)
          end
        end
        local ${targetHandVar} = #available_hands > 0 and pseudorandom_element(available_hands, pseudoseed('level_up_hand')) or "High Card"`;
      
    } else if (handSelection === "most") {
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
      
     } else if (handSelection === "least") {
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
    } else if (handSelection === "current") {
      if (triggerType === "hand_discarded") {
        handDeterminationCode = `
          local text, poker_hands, text_disp, loc_disp_text = G.FUNCS.get_poker_hand_info(G.hand.highlighted)
          local ${targetHandVar} = text
        `;
      } else {
        handDeterminationCode = `local ${targetHandVar} = (context.scoring_name or "High Card")`;
      }
    } else {
      handDeterminationCode = `local ${targetHandVar} = ${customVar.code}`;
  }
  
  return {
    statement: `
      __PRE_RETURN_CODE__
      ${handDeterminationCode}
      level_up_hand(card, ${targetHandVar}, true, ${valueCode})
      __PRE_RETURN_CODE_END__`,
    message: customMessage ? `"${customMessage}"` : `localize('k_level_up_ex')`,
    colour: "G.C.RED",
    configVariables,
  }
}


const generateConsumableCode = (
  effect: Effect,
): EffectReturn => {
  const handType = (effect.params?.hand_type?.value as string) || "Pair";
  const customMessage = effect.customMessage;
  const levels = effect.params?.levels
  const pokerHandPoolActive = (effect.params.pokerhand_pool?.value as Array<boolean>) || [];
  const pokerHandPoolPokerHands = [
    "'High Card'","'Pair'","'Two Pair'","'Three of a Kind'",
    "'Straight'","'Flush'","'Full House'","'Four of a Kind'",
    "'Straight Flush'","'Five of a Kind'","'Flush Five'","'Flush House'"
  ]

  const levelsCode = generateValueCode(levels, 'consumable');

  let levelUpCode = "";

    levelUpCode += `
        __PRE_RETURN_CODE__
        update_hand_text({ sound = 'button', volume = 0.7, pitch = 0.8, delay = 0.3 },`
    
    if (handType === "all") {
        levelUpCode += `
                { handname = localize('k_all_hands'), chips = '...', mult = '...', level = '' })`
    } else if (handType === "random") {
        levelUpCode += `
                { handname = '???', chips = '???', mult = '???', level = '' })`
    } else {
        levelUpCode += `
                { handname = localize('${handType}', 'poker_hands'), 
                  chips = G.GAME.hands['${handType}'].chips, 
                  mult = G.GAME.hands['${handType}'].mult, 
                  level = G.GAME.hands['${handType}'].level })`
    }

    levelUpCode += `
                G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.2,
                func = function()
                    play_sound('tarot1')
                    card:juice_up(0.8, 0.5)
                    G.TAROT_INTERRUPT_PULSE = true
                    return true
                end
            }))
            update_hand_text({ delay = 0 }, { mult = '+', StatusText = true })
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.9,
                func = function()
                    play_sound('tarot1')
                    card:juice_up(0.8, 0.5)
                    return true
                end
            }))
            update_hand_text({ delay = 0 }, { chips = '+', StatusText = true })
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.9,
                func = function()
                    play_sound('tarot1')
                    card:juice_up(0.8, 0.5)
                    G.TAROT_INTERRUPT_PULSE = nil
                    return true
                end
            }))
            update_hand_text({ sound = 'button', volume = 0.7, pitch = 0.9, delay = 0 }, { level = '+'..tostring(${levelsCode}) })
            delay(1.3)`

    if (handType === "all") {
        levelUpCode += `
            for poker_hand_key, _ in pairs(G.GAME.hands) do
                level_up_hand(card, poker_hand_key, true, ${levelsCode})
            end
            update_hand_text({ sound = 'button', volume = 0.7, pitch = 1.1, delay = 0 },
                { mult = 0, chips = 0, handname = '', level = '' })
            __PRE_RETURN_CODE_END__`
    } else if (handType === "random") {
        levelUpCode += `            
            local hand_pool = {}
            for hand_key, _ in pairs(G.GAME.hands) do
                table.insert(hand_pool, hand_key)
            end
            local random_hand = pseudorandom_element(hand_pool, 'random_hand_levelup')
            level_up_hand(card, random_hand, true, ${levelsCode})
            
            update_hand_text({sound = 'button', volume = 0.7, pitch = 1.1, delay = 0}, 
                {handname=localize(random_hand, 'poker_hands'), 
                 chips = G.GAME.hands[random_hand].chips, 
                 mult = G.GAME.hands[random_hand].mult, 
                 level=G.GAME.hands[random_hand].level})`
    } else if (handType === "pool") {
        const pokerhand_pool = []
        for (let i = 0; i < pokerHandPoolActive.length; i++){
            if (pokerHandPoolActive[i] == true){
                pokerhand_pool.push(pokerHandPoolPokerHands[i])
        }}
        levelUpCode += `            
            local hand_pool = {${pokerhand_pool}}
            local random_hand = pseudorandom_element(hand_pool, 'random_hand_levelup')
            level_up_hand(card, random_hand, true, ${levelsCode})
            
            update_hand_text({sound = 'button', volume = 0.7, pitch = 1.1, delay = 0}, 
                {handname=localize(random_hand, 'poker_hands'), 
                 chips = G.GAME.hands[random_hand].chips, 
                 mult = G.GAME.hands[random_hand].mult, 
                 level = G.GAME.hands[random_hand].level})`
    } else {
        levelUpCode += `
            level_up_hand(card, "${handType}", true, ${levelsCode})
            update_hand_text({sound = 'button', volume = 0.7, pitch = 1.1, delay = 0}, 
                {handname=localize('${handType}', 'poker_hands'), 
                 chips = G.GAME.hands['${handType}'].chips, 
                 mult = G.GAME.hands['${handType}'].mult, 
                 level=G.GAME.hands['${handType}'].level})`
    }

    if (handType !== "all") {
        levelUpCode += `    
            delay(1.3)
            __PRE_RETURN_CODE_END__`
    }

  // Only add config variable if it's not a game variable and not "all" or "random"
  const configVariables: ConfigExtraVariable[] = [];
  if (handType !== "random" && handType !== "all") {
    configVariables.push({name: `hand_type`, value: `${handType}`});
  }
  if (!(levels?.valueType === "game_var")) {
    configVariables.push({name: `levels`, value: `${levels}`});
  }

  const result: EffectReturn = {
    statement: levelUpCode,
    colour: "G.C.SECONDARY_SET.Planet",
    configVariables,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};


const generateCardCode = (
  effect: Effect,
  sameTypeCount: number = 0,
  card?: EditionData | EnhancementData | SealData
): EffectReturn => {
  const customMessage = effect?.customMessage;
  const { valueCode, configVariables } = generateConfigVariables(
    effect,
    'value',
    "levels",
    sameTypeCount,
    card?.objectType ?? 'enhancement',
    card
  );

  const targetHandVar =
    sameTypeCount === 0 ? `target_hand` : `target_hand${sameTypeCount + 1}`;

  const handSelection = (effect?.params?.hand_selection?.value as string) || "current";
  const specificHand = (effect?.params?.specific_hand?.value as string) || "High Card";

  let handDeterminationCode = "";
  switch (handSelection) {
    case "specific":
      handDeterminationCode = `${targetHandVar} = "${specificHand}"`;
      break;
    case "random":
      handDeterminationCode = `
                local available_hands = {}
                for hand, value in pairs(G.GAME.hands) do
                  if value.visible and value.level >= to_big(1) then
                    table.insert(available_hands, hand)
                  end
                end
                ${targetHandVar} = #available_hands > 0 and pseudorandom_element(available_hands, pseudoseed('level_up_hand_enhanced')) or "High Card"`;
      break;
    case "most":
      handDeterminationCode = `
                local temp_played = 0
                local temp_order = math.huge
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
                end`;
      break;
    case "least":
      handDeterminationCode = `
                local temp_played = math.huge
                local temp_order = math.huge
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
                end`;
      break;
    case "current":
      handDeterminationCode = `${targetHandVar} = context.scoring_name or "High Card"`;
      break;
  }

  return {
    statement: `__PRE_RETURN_CODE__
                local ${targetHandVar}
                ${handDeterminationCode}
                __PRE_RETURN_CODE_END__
                level_up = ${valueCode},
                level_up_hand = ${targetHandVar}`,
    message: customMessage ? `"${customMessage}"` : `localize('k_level_up_ex')`,
    colour: "G.C.RED",
    configVariables
  } 
}