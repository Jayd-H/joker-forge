import { TAG_TYPES } from "../../data/BalatroUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateCreateTagEffectCode = (
  effect: Effect,
  triggerType: string,
): EffectReturn => {
  const tagType = (effect.params?.tag_type as string) || "random";
  const specificTag = (effect.params?.specific_tag as string) || "double";
  const customMessage = effect.customMessage;
  const keyVar = effect.params?.variable as string || "keyVar"

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let tagCreationCode = "";

  if (tagType === "random") {
    tagCreationCode = `
            G.E_MANAGER:add_event(Event({
                func = function()
                    local selected_tag = pseudorandom_element(G.P_TAGS, pseudoseed("create_tag")).key
                    local tag = Tag(selected_tag)
                    if tag.name == "Orbital Tag" then
                        local _poker_hands = {}
                        for k, v in pairs(G.GAME.hands) do
                            if v.visible then
                                _poker_hands[#_poker_hands + 1] = k
                            end
                        end
                        tag.ability.orbital_hand = pseudorandom_element(_poker_hands, "jokerforge_orbital")
                    end
                    tag:set_ability()
                    add_tag(tag)
                    play_sound('holo1', 1.2 + math.random() * 0.1, 0.4)
                    return true
                end
            }))`;
  } else if (tagType === "keyvar"){
    tagCreationCode = `
        G.E_MANAGER:add_event(Event({
            func = function()
                local tag = Tag(card.ability.extra.${keyVar})
                if tag.name == "Orbital Tag" then
                    local _poker_hands = {}
                    for k, v in pairs(G.GAME.hands) do
                        if v.visible then
                            _poker_hands[#_poker_hands + 1] = k
                        end
                    end
                    tag.ability.orbital_hand = pseudorandom_element(_poker_hands, "jokerforge_orbital")
                end
                tag:set_ability()
                add_tag(tag)
                play_sound('holo1', 1.2 + math.random() * 0.1, 0.4)
                return true
            end
        }))`;
  } else {
    const tagKey = TAG_TYPES[specificTag] || "tag_double";
    tagCreationCode = `
            G.E_MANAGER:add_event(Event({
                func = function()
                    local tag = Tag("${tagKey}")
                    if tag.name == "Orbital Tag" then
                        local _poker_hands = {}
                        for k, v in pairs(G.GAME.hands) do
                            if v.visible then
                                _poker_hands[#_poker_hands + 1] = k
                            end
                        end
                        tag.ability.orbital_hand = pseudorandom_element(_poker_hands, "jokerforge_orbital")
                    end
                    tag:set_ability()
                    add_tag(tag)
                    play_sound('holo1', 1.2 + math.random() * 0.1, 0.4)
                    return true
                end
            }))`;
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${tagCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage ? `"${customMessage}"` : `"Created Tag!"`,
      colour: "G.C.GREEN",
    };
  } else {
    return {
      statement: `func = function()${tagCreationCode}
                    return true
                end`,
      message: customMessage ? `"${customMessage}"` : `"Created Tag!"`,
      colour: "G.C.GREEN",
    };
  }
}