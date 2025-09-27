import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateLevelUpHandReturn = (effect: Effect): EffectReturn => {
  const handType = effect.params?.hand_type || "Pair";
  const levels = effect.params?.levels || 1;
  const customMessage = effect.customMessage;
  const pokerHandPoolActive = (effect.params.pokerhand_pool as Array<boolean>) || [];
  const pokerHandPoolPokerHands = [
    "'High Card'","'Pair'","'Two Pair'","'Three of a Kind'",
    "'Straight'","'Flush'","'Full House'","'Four of a Kind'",
    "'Straight Flush'","'Five of a Kind'","'Flush Five'","'Flush House'"
  ]

  const levelsCode = generateGameVariableCode(levels);

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
  const configVariables: string[] = [];
  if (handType !== "random" && handType !== "all") {
    configVariables.push(`hand_type = "${handType}"`);
  }
  if (!(typeof levels === "string" && levels.startsWith("GAMEVAR:"))) {
    configVariables.push(`levels = ${levels}`);
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
