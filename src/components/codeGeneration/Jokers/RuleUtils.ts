import { JokerData } from "../../data/BalatroUtils";
import { generateTriggerContext } from "./triggerUtils";
import { generateConditionChain } from "./conditionUtils";
import {
  generateEffectReturnStatement,
  ConfigExtraVariable,
} from "./effectUtils";
import type { Rule } from "../../ruleBuilder/types";
import { convertRandomGroupsForCodegen, convertLoopGroupsForCodegen } from ".";
import { processPassiveEffects } from "./effectUtils";

interface CalculateFunctionResult {
  code: string;
  configVariables: ConfigExtraVariable[];
}

export interface RuleAttributes {
  hasRetriggerEffects: boolean;
  hasNonRetriggerEffects: boolean;
  hasDeleteEffects: boolean;
  hasFixProbabilityEffects: boolean;
  hasModProbabilityEffects: boolean;
  hasConditions: boolean;
  hasNoConditions: boolean;
  hasGroupRules: boolean;
  hasNonGroupRules: boolean;
  isForCardTrigger: boolean;
  blueprintCompatible: boolean;
}

const getAllRulesWithAttributes = (
  joker: JokerData)  => {
  const rules = joker.rules || []

  const rulesWithRetriggerEffects = rules.filter(rule => rule.effects.some(
    effect => effect.type === "retrigger_cards"))
  const rulesWithNonRetriggerEffects = rules.filter(rule => rule.effects.some(
    effect => effect.type !== "retrigger_cards"))
  const rulesWithDeleteEffects = rules.filter(rule => rule.effects.some(
    effect => effect.type === "delete_triggered_card"))
  const rulesWithFixProbabilityEffects = rules.filter(rule => rule.effects.some(
    effect => effect.type === "fix_probability"))
  const rulesWithModProbabilityEffects = rules.filter(rule => rule.effects.some(
    effect => effect.type === "mod_probability"))
  const rulesWithForCardTrigger = rules.filter(rule => 
    rule.trigger === "played_cards_before_scoring")
  const rulesWithConditions = rules.filter(rule => 
    generateConditionChain(rule, joker).length > 0)
  const rulesWithNoConditions = rules.filter(rule => 
    generateConditionChain(rule, joker).length === 0)
  const rulesWithGroups = rules.filter(rule => 
    [...rule.randomGroups, ...rule.loops].length > 0)
  const rulesWithNoGroups = rules.filter(rule => 
    [...rule.randomGroups, ...rule.loops].length === 0)
  const blueprintCompatibleRules = rules.filter(rule => 
    rule.blueprintCompatible == true)

  return {
    rulesWithRetriggerEffects,
    rulesWithNonRetriggerEffects,
    rulesWithDeleteEffects,
    rulesWithFixProbabilityEffects,
    rulesWithModProbabilityEffects,
    rulesWithConditions,
    rulesWithNoConditions,
    rulesWithGroups,
    rulesWithNoGroups,
    rulesWithForCardTrigger,
    blueprintCompatibleRules,
  }}

const getRuleAttributes = (
  joker: JokerData,
  currentRule: Rule,
) : RuleAttributes => {
    const activeRule = getAllRulesWithAttributes(joker)
  return {
    isForCardTrigger: activeRule.rulesWithForCardTrigger.includes(currentRule) ? true : false,
    hasRetriggerEffects: activeRule.rulesWithRetriggerEffects.includes(currentRule) ? true : false,
    hasNonRetriggerEffects: activeRule.rulesWithNonRetriggerEffects.includes(currentRule) ? true : false,
    hasDeleteEffects: activeRule.rulesWithDeleteEffects.includes(currentRule) ? true : false,
    hasFixProbabilityEffects: activeRule.rulesWithFixProbabilityEffects.includes(currentRule) ? true : false,
    hasModProbabilityEffects: activeRule.rulesWithModProbabilityEffects.includes(currentRule) ? true : false,
    hasConditions: activeRule.rulesWithConditions.includes(currentRule) ? true : false,
    hasNoConditions: activeRule.rulesWithNoConditions.includes(currentRule) ? true : false,
    hasGroupRules: activeRule.rulesWithGroups.includes(currentRule) ? true : false,
    hasNonGroupRules: activeRule.rulesWithNoGroups.includes(currentRule) ? true : false,
    blueprintCompatible: activeRule.blueprintCompatibleRules.includes(currentRule) ? true : false }
}

const generateTriggerCode = (
  currentRule: RuleAttributes, 
  triggerType: string, 
  sortedRules: Rule[],
  target: string 
) =>  {
  let triggerContext : string = '', afterCode, triggerCode = ''

  const reg = (target === 'reg')
  const retriggerEffects = (target === 'retrigger') 
  const nonRetriggerEffects = (target === 'non_retrigger')
  const deleteEffects = (target === 'delete')
  const fixProbabilityEffects = (target === 'fix')
  const modProbabilityEffects = (target === 'mod')
  const forCardTrigger = (target === 'for_card')
  const bc = currentRule.blueprintCompatible

  if (currentRule.hasDeleteEffects)
    {triggerCode += `
      if context.destroy_card and context.destroy_card.should_destroy ${bc ? "" : "and not context.blueprint"} then
      return { remove = true }
      end`}
  if (retriggerEffects) {
  triggerContext =
    triggerType === "card_held_in_hand" || triggerType === "card_held_in_hand_end_of_round"? 
    `context.repetition and context.cardarea == G.hand and (next(context.card_effects[1]) or #context.card_effects > 1) ${bc ? "" : "and not context.blueprint"}`: 
    `context.repetition and context.cardarea == G.play ${bc ? "" : "and not context.blueprint"}`}
  else if (nonRetriggerEffects) {
  triggerContext =
    triggerType === "card_held_in_hand" || triggerType === "card_held_in_hand_end_of_round" ?
    `context.individual and context.cardarea == G.hand and not context.end_of_round ${bc ? "" : "and not context.blueprint"}` :
    triggerType === "card_discarded"? `context.discard 
    ${bc ? "" : "and not context.blueprint"}` : 
    `context.individual and context.cardarea == G.play ${bc ? "" : "and not context.blueprint"}`} 
  else if (deleteEffects) {
    triggerContext =
      triggerType === "card_held_in_hand" || triggerType === "card_held_in_hand_end_of_round" ? 
      `context.individual and context.cardarea == G.hand and not context.end_of_round ${bc ? "" : "and not context.blueprint"}` : 
      triggerType === "card_discarded" ? 
      `context.discard ${bc ? "" : "and not context.blueprint"}` : 
      `context.individual and context.cardarea == G.play ${bc ? "" : "and not context.blueprint"}`}
  else if (fixProbabilityEffects) {
    triggerContext = `context.fix_probability ${bc ? "" : "and not context.blueprint"}`
    afterCode = `local numerator, denominator = context.numerator, context.denominator`}
  else if (modProbabilityEffects) {
    triggerContext = `context.mod_probability ${bc ? "" : "and not context.blueprint"}`
    afterCode = `local numerator, denominator = context.numerator, context.denominator`}
  else if (forCardTrigger) {
    triggerContext = `context.before ${bc ? '' : ' and not context.blueprint'}`
    afterCode = `for i, used_card in ipairs(context.scoring_hand) do`
  }
  else if (reg) {
    triggerContext = generateTriggerContext(triggerType, sortedRules, currentRule).check}
  
  triggerCode += `
  if ${triggerContext} then`

  if (deleteEffects) {
    triggerCode += `
        context.other_card.should_destroy = false`}

  if (afterCode) {
    triggerCode += `
    ${afterCode}`
  }
  
  return triggerCode 
}

const generateConditionCode = (
  currentRule:RuleAttributes,
  rule:Rule, 
  joker:JokerData,
  hasAnyConditions: boolean,
  newTrigger: boolean,
 ) => {
  
  if (currentRule.hasNoConditions && !hasAnyConditions) {return ''}
  
  const condition = generateConditionChain(rule, joker)
  let conditionCode = ''

  const elseStatement = (hasAnyConditions && !newTrigger )

  if (condition) {
    const conditional = elseStatement ? "elseif" : "if"
          conditionCode += `
              ${conditional} ${condition} then`
  } else {
          if (elseStatement) {
            conditionCode += `
            else`;
          }
        }

  const hasDeleteInRegularEffects = (rule.effects || []).some(
                (effect) => effect.type === "delete_triggered_card"
              );

  if (hasDeleteInRegularEffects) {
        conditionCode += `
            context.other_card.should_destroy = true`}

  return conditionCode 
}


const generateEffectCode = (
  rule : Rule, 
  modprefix : string,
  jokerKey? : string,
  globalEffectCounts? : Map <string,number>,
  target? : string,
  targetType? : boolean,
) => {
  let effectCode = '', configVariables

  const allEffects = (target !== 'reg' && targetType) ? (rule.effects || []).filter(
    effect => effect.type === target) : 
    (target !== 'reg' && !targetType) ? (rule.effects || []).filter(
      effect => effect.type !== target) : 
    (rule.effects)

  const allRandomGroups = (target !== 'reg' && targetType) ? (rule.randomGroups || []).filter(
    group => group.effects.some(effect => effect.type === target)) : 
    (target !== 'reg' && !targetType) ? (rule.randomGroups || []).filter(
      group => group.effects.some(effect => effect.type !== target)) : 
    (rule.randomGroups) 

  const allLoopGroups = (target !== 'reg' && targetType) ? (rule.loops || []).filter(
    group => group.effects.some(effect => effect.type === target)) :
    (target !== 'reg' && !targetType) ? (rule.loops || []).filter(
      group => group.effects.some(effect => effect.type !== target)) :
    (rule.loops)

  const effectResult = generateEffectReturnStatement(
                allEffects,
                convertRandomGroupsForCodegen(allRandomGroups),
                convertLoopGroupsForCodegen(allLoopGroups),
                rule,
                modprefix,
                jokerKey,
                rule.id,
                globalEffectCounts,
              )
  
  if (effectResult.configVariables) {
      configVariables = effectResult.configVariables}

  if (effectResult.preReturnCode) {
      effectCode += `
          ${effectResult.preReturnCode}`}

  if (effectResult.statement) {
      effectCode += `
          ${effectResult.statement}`}
  
  if (effectResult.priorFunctionCode) {
    const priorFunctionCode = effectResult.priorFunctionCode
    return {effectCode, configVariables, priorFunctionCode}
  }
  

return {effectCode, configVariables}
}

const generateCodeForRuleType = (
  rule : Rule,
  currentRule : RuleAttributes,
  joker : JokerData,
  triggerType : string,
  sortedRules : Rule[],
  hasAnyConditions : boolean,
  modPrefix : string,
  targetTrigger : string,
  targetEffect : string,
  newTrigger : boolean,
  jokerKey? : string,
  globalEffectCounts? : Map <string,number>,
  targetPolarity? : boolean,
) => {
  let configVariables, triggerCode = ''
  let ruleCode = ''

  if (targetTrigger !== 'reg') {
    if (newTrigger) {
      triggerCode = generateTriggerCode(currentRule, triggerType, sortedRules, targetTrigger)
    }
    const conditionCode = generateConditionCode(currentRule, rule, joker, hasAnyConditions, newTrigger)
    const effectResult= generateEffectCode(rule, modPrefix, jokerKey, globalEffectCounts, targetEffect, targetPolarity)
    
    const effectCode = effectResult.effectCode
    configVariables = effectResult.configVariables
    
    if (effectCode) {
      ruleCode += `${triggerCode}${conditionCode}${effectCode}`
    }

    if (effectResult.priorFunctionCode){
      const priorFunctionCode = effectResult.priorFunctionCode
      return {ruleCode, configVariables, priorFunctionCode}
    }

  } else {
    if (newTrigger) {
      triggerCode = generateTriggerCode(currentRule, triggerType, sortedRules, 'reg') 
    }   
    const conditionCode = generateConditionCode(currentRule, rule, joker, hasAnyConditions, newTrigger)
    const effectResult= generateEffectCode(rule, modPrefix, jokerKey, globalEffectCounts, 'reg')
    
    const effectCode = effectResult.effectCode
    configVariables = effectResult.configVariables

    if (effectCode) {
      ruleCode += `${triggerCode}${conditionCode}${effectCode}`
    }

    if (effectResult.priorFunctionCode){
      const priorFunctionCode = effectResult.priorFunctionCode
      return {ruleCode, configVariables, priorFunctionCode}
    }
  }

  return {ruleCode, configVariables}
}

const applyIndents = (
  code : string,
  finalIndent : number
) => {
  let finalCode = ''
  let indentCount = 1
  const indents = (count:number)=>{
    let str = ''
    for (let i = 0; i < count; i++) {
      str += '    '
    }
  return str}
  const stringLines = code.split(`
`)
  
  for (let i = 0; i < stringLines.length; i++) {
    
    let line = stringLines[i]
    
    line = line.trimStart()

    if ( line.includes('end') && !line.includes('pend') && !line.includes('end_')|| 
         ( line.includes('}') && !line.includes('{') ) || 
         ( line.includes('else') ) ) {
      indentCount -= 1
    }

    if (line.includes('end') && (stringLines[i+1] || '').includes('else')) {
      line = ''
      indentCount += 1}

    const indent = indents(indentCount)

    if (line !== '') {
    finalCode += `
${indent}${line}`}

    if (line.includes('if ') || line.includes('else') || line.includes('function(') || 
        (line.includes('{') && !line.includes('}')) || line.includes('for ') || 
        line.includes('while ') || line.includes('do ') || line.includes(' then'))
        {indentCount += 1}
  }

  while (indentCount > finalIndent){
    indentCount -= 1
    const indent = indents(indentCount)
    finalCode += `
${indent}end`
  }

  return finalCode
}



export const generateCalculateFunction = (
  rules : Rule[],
  joker : JokerData,
  modprefix : string,
) : CalculateFunctionResult => {
  const jokerKey = joker.objectKey;
  const rulesByTrigger: Record<string, Rule[]> = {};
  rules.forEach(rule => {
    if (!rulesByTrigger[rule.trigger]) {
      rulesByTrigger[rule.trigger] = [];
    }
    rulesByTrigger[rule.trigger].push(rule);});

  const allConfigVariables: ConfigExtraVariable[] = [];
  const globalEffectCounts = new Map<string, number>();

  let ruleCode = `calculate = function(self, card, context)`;
  let priorFunctionCode = `calc_dollar_bonus = function(self, card)
` //Change later if more prior Functions are added
  
  Object.entries(rulesByTrigger).forEach(([triggerType, triggerRules]) => {
    const sortedRules = [...triggerRules].sort((a, b) => {
      const aHasConditions = generateConditionChain(a, joker).length > 0;
      const bHasConditions = generateConditionChain(b, joker).length > 0;

      if (aHasConditions && !bHasConditions) return -1;
      if (!aHasConditions && bHasConditions) return 1;
      return 0;
    });

  let hasAnyConditions = false
  let currentTriggerContext = '' 
  let newTrigger = false
  let oldBlueprintable: boolean

  sortedRules.forEach(rule => {
    const currentRule : RuleAttributes = getRuleAttributes(joker, rule) 
    const currentPriorFunctionCode = priorFunctionCode

    if (currentTriggerContext !== rule.trigger) {

      if (currentTriggerContext !== '' && currentRule.isForCardTrigger) {
        ruleCode = applyIndents(ruleCode, 3)
        } else { 
        ruleCode = applyIndents(ruleCode, 2)
      }
      newTrigger = true
      currentTriggerContext = rule.trigger
    } else {
      if (oldBlueprintable == rule.blueprintCompatible){
        ruleCode = applyIndents(ruleCode, 3)
        newTrigger = false
      } else {
        ruleCode = applyIndents(ruleCode, 2)
        newTrigger = true
      }
    }
    oldBlueprintable = rule.blueprintCompatible

    if (currentRule.hasRetriggerEffects) {
        const retrigCode = generateCodeForRuleType(
          rule, currentRule, joker, triggerType, sortedRules, 
          hasAnyConditions, modprefix, 'retrigger', 'retrigger_cards',
          newTrigger, jokerKey, globalEffectCounts, true)
        ruleCode += `${retrigCode.ruleCode}`
        allConfigVariables.push(...(retrigCode.configVariables || [] ))

        if (retrigCode.priorFunctionCode){
          priorFunctionCode += `${retrigCode.priorFunctionCode}
          `
        }

        if (currentRule.hasNonRetriggerEffects) {
          ruleCode = applyIndents(ruleCode, 2)

          const nonretrigCode = generateCodeForRuleType(
            rule, currentRule, joker, triggerType, sortedRules, 
            hasAnyConditions, modprefix, 'non_retrigger', 'retrigger_cards',
            newTrigger, jokerKey, globalEffectCounts, false)
            
          ruleCode += `${nonretrigCode.ruleCode}`
          allConfigVariables.push(...(nonretrigCode.configVariables || [] ))

          if (nonretrigCode.priorFunctionCode){
          priorFunctionCode += `${retrigCode.priorFunctionCode}
            `
          }
      }}
    else if (currentRule.hasDeleteEffects) {
      const delCode = generateCodeForRuleType(
        rule, currentRule, joker, triggerType, sortedRules, 
        hasAnyConditions, modprefix, 'delete', 'delete_triggered_card',
        newTrigger, jokerKey, globalEffectCounts, true)

      ruleCode += `${delCode.ruleCode}`

      allConfigVariables.push(...(delCode.configVariables || [] ))

      if (delCode.priorFunctionCode){
          priorFunctionCode += `${delCode.priorFunctionCode}
          `
        }
    }
    else if (currentRule.isForCardTrigger) {
      const forCardCode = generateCodeForRuleType(
        rule, currentRule, joker, triggerType, sortedRules, 
        hasAnyConditions, modprefix, 'for_card', 'reg',
        newTrigger, jokerKey, globalEffectCounts, true)

      ruleCode += `${forCardCode.ruleCode}`
      allConfigVariables.push(...(forCardCode.configVariables || [] ))

      if (forCardCode.priorFunctionCode){
          priorFunctionCode += `${forCardCode.priorFunctionCode}
          `
        }
    }
    else if (currentRule.hasFixProbabilityEffects || currentRule.hasModProbabilityEffects) {
      if (currentRule.hasFixProbabilityEffects) {
        const fixCode = generateCodeForRuleType(
          rule, currentRule, joker, triggerType, sortedRules, 
          hasAnyConditions, modprefix, 'fix', 'fix_probability',
          newTrigger, jokerKey, globalEffectCounts, true)

        ruleCode += `${fixCode.ruleCode}
            return {
      numerator = numerator, 
      denominator = denominator
    }`

        allConfigVariables.push(...(fixCode.configVariables || [] ))

        if (fixCode.priorFunctionCode){
          priorFunctionCode += `${fixCode.priorFunctionCode}
          `
        }
      }
      if (currentRule.hasModProbabilityEffects) {
        if (currentRule.hasFixProbabilityEffects) {        
          ruleCode = applyIndents(ruleCode, 2)
}
        const modCode = generateCodeForRuleType(
          rule, currentRule, joker, triggerType, sortedRules, 
          hasAnyConditions, modprefix, 'mod', 'mod_probability',
          newTrigger, jokerKey, globalEffectCounts, true)

        ruleCode += `${modCode.ruleCode}
    return {
      numerator = numerator, 
      denominator = denominator
    }`
        ruleCode = applyIndents(ruleCode, 3)

        allConfigVariables.push(...(modCode.configVariables || [] ))

        if (modCode.priorFunctionCode){
          priorFunctionCode += `${modCode.priorFunctionCode}
          `
        }

      }}
    else {
      const regCode = generateCodeForRuleType(
        rule, currentRule, joker, triggerType, sortedRules, 
        hasAnyConditions, modprefix, 'reg', 'reg', newTrigger,
        jokerKey, globalEffectCounts)

      ruleCode += `${regCode.ruleCode}`
      allConfigVariables.push(...(regCode.configVariables || [] ))

      if (regCode.priorFunctionCode){
          priorFunctionCode += `${regCode.priorFunctionCode}
          `
        }
    }
    
    if (currentRule.hasConditions) {
      hasAnyConditions = true
    }

    if (currentPriorFunctionCode !== priorFunctionCode) {
      priorFunctionCode += 'else'
    } 

})})
  processPassiveEffects(joker).filter((effect) => effect.calculateFunction).forEach((effect) => {
      ruleCode = applyIndents(ruleCode, 2)
      ruleCode += `
${effect.calculateFunction}`})   

  ruleCode += `
end`
  
  ruleCode = checkAnyRules(ruleCode)

  if (priorFunctionCode !== `calc_dollar_bonus = function(self, card)
`) {
    priorFunctionCode = priorFunctionCode.slice(0,priorFunctionCode.lastIndexOf("else"))
    priorFunctionCode = applyIndents(priorFunctionCode, 1)
    priorFunctionCode += `,`
    
    ruleCode = `${priorFunctionCode}
    ${ruleCode}`
  }

  ruleCode = applyIndents(ruleCode, 1)


  return {
    code: ruleCode,
    configVariables: allConfigVariables,
}}

const checkAnyRules = (
  code : string
) => {
  let tempCode = code

  while (tempCode.includes("end")){
    tempCode = tempCode.replace("end","")
  }

  tempCode = tempCode.replace("calculate = function(self, card, context)","")
  tempCode = tempCode.trim()

  if (!tempCode) {
    return ''
  } else {
    return code
  }
}