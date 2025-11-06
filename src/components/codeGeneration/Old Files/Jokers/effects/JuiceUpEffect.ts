import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";

export const generateJuiceUpReturn = (
  effect: Effect,
  sameTypeCount: number = 0,
  effectType: string,
): EffectReturn => {
  const mode = effect.params?.mode || "onetime";

  const configVariables: ConfigExtraVariable[] = [];

  const scaleVariableName =
    sameTypeCount === 0 ? "scale" : `scale${sameTypeCount + 1}`;
  const scaleRet = generateConfigVariables(
    effect.params.scale,
    effect.id,
    scaleVariableName
  )

  scaleRet.configVariables.forEach((cv) => {
    configVariables.push(cv)
  })
  const scaleValueCode = scaleRet.valueCode

  const rotationVariableName =
    sameTypeCount === 0 ? "rotation" : `rotation${sameTypeCount + 1}`;
  const rotationRet = generateConfigVariables(
    effect.params.rotation,
    effect.id,
    rotationVariableName
  )

  rotationRet.configVariables.forEach((cv) => {
    configVariables.push(cv)
  })
  const rotationValueCode = rotationRet.valueCode

  let cardType: string;
  if (effectType == "card") {
    cardType = "target_card"
  } else {
    cardType = "card"
  }

  let statement = `__PRE_RETURN_CODE__
      local target_card = context.other_card`;

  if (mode === "constant") {
      statement += `
      local function juice_card_until_(card, eval_func, first, delay) -- balatro function doesn't allow for custom scale and rotation
          G.E_MANAGER:add_event(Event({
              trigger = 'after',delay = delay or 0.1, blocking = false, blockable = false, timer = 'REAL',
              func = (function() if eval_func(card) then if not first or first then ${cardType}:juice_up(${scaleValueCode}, ${rotationValueCode}) end;juice_card_until_(card, eval_func, nil, 0.8) end return true end)
          }))
      end`
  }
  
  statement += `
  __PRE_RETURN_CODE_END__`

  switch (mode) {
    case "constant":
      statement += `func = function()
                        local eval = function() return not G.RESET_JIGGLES end
                        juice_card_until_(card, eval, true)
                        return true
                    end`;
      break;
    case "onetime":
      statement += `func = function()
                      ${cardType}:juice_up(${scaleValueCode}, ${rotationValueCode})
                      return true
                    end`;
      break;
  }

  return {
    statement,
    colour: "G.C.WHITE",
    configVariables
  }
}
