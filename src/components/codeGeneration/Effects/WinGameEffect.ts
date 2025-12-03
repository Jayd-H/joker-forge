import type { Effect } from "../../ruleBuilder/types";
import type { EffectReturn } from "../lib/effectUtils";

export const generateWinGameEffectCode = (
  effect: Effect,
): EffectReturn => {
  const customMessage = effect.customMessage;
  const Win_type = (effect.params?.win_type as string) || "blind";

  let WinGameCode = ""

if (Win_type === "blind") {
  WinGameCode = `
  G.E_MANAGER:add_event(Event({
    blocking = false,
    func = function()
        if G.STATE == G.STATES.SELECTING_HAND then
          G.GAME.chips = G.GAME.blind.chips
          G.STATE = G.STATES.HAND_PLAYED
          G.STATE_COMPLETE = true
          end_round()
          return true
        end
    end
}))`;
} else if (Win_type === "run") {
  WinGameCode = `
  win_game()
  G.GAME.won = true`;
}

  return {
    statement: `__PRE_RETURN_CODE__${WinGameCode}__PRE_RETURN_CODE_END__`,
    message: customMessage ? `"${customMessage}"` : `"Win!"`,
    colour: "G.C.ORANGE"
  }
}