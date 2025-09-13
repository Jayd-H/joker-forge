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

interface RuleAttributes {
  hasRetriggerEffects: boolean;
  hasNonRetriggerEffects: boolean;
  hasDeleteEffects: boolean;
  hasFixProbabilityEffects: boolean;
  hasModProbabilityEffects: boolean;
  hasConditions: boolean;
  hasNoConditions: boolean;
  hasGroupRules: boolean;
  hasNonGroupRules: boolean;
  blueprintCompatible: boolean;
}

const getAllRulesWithAttributes = (
  sortedRules:Rule[],
  joker: JokerData)  => {

  const rulesWithRetriggerEffects = sortedRules.filter(rule => rule.effects.some(
    effect => effect.type === "retrigger_cards"))
  const rulesWithDeleteEffects = sortedRules.filter(rule => rule.effects.some(
    effect => effect.type === "delete_triggered_card"))
  const rulesWithFixProbabilityEffects = sortedRules.filter(rule => rule.effects.some(
    effect => effect.type === "fix_probability"))
  const rulesWithModProbabilityEffects = sortedRules.filter(rule => rule.effects.some(
    effect => effect.type === "mod_probability"))
  const rulesWithConditions = sortedRules.filter(rule => 
    generateConditionChain(rule, joker).length > 0)
  const rulesWithGroups = sortedRules.filter(rule => 
    (rule.randomGroups || []).length > 0 || (rule.loops || []).length > 0)
  const blueprintCompatibleRules = sortedRules.filter(rule => 
    rule.blueprintCompatible == true)

  return {
    rulesWithRetriggerEffects,
    rulesWithDeleteEffects,
    rulesWithFixProbabilityEffects,
    rulesWithModProbabilityEffects,
    rulesWithConditions,
    rulesWithGroups,
    blueprintCompatibleRules
  }}

const getRuleAttributes = (
  sortedRules:Rule[],
  joker: JokerData,
  currentRule: Rule,
) : RuleAttributes => {
    const Rule = getAllRulesWithAttributes(sortedRules, joker)
  return {
      hasRetriggerEffects: Rule.rulesWithRetriggerEffects.includes(currentRule) ? true : false,
      hasNonRetriggerEffects: sortedRules.some(rule => rule.trigger !in Rule.rulesWithRetriggerEffects),
      hasDeleteEffects: Rule.rulesWithDeleteEffects.includes(currentRule) ? true : false,
      hasFixProbabilityEffects: Rule.rulesWithFixProbabilityEffects.includes(currentRule) ? true : false,
      hasModProbabilityEffects: Rule.rulesWithModProbabilityEffects.includes(currentRule) ? true : false,
      hasConditions: Rule.rulesWithConditions.includes(currentRule) ? true : false,
      hasNoConditions: sortedRules.some(rule => rule.trigger !in Rule.rulesWithConditions),
      hasGroupRules: Rule.rulesWithGroups.includes(currentRule) ? true : false,
      hasNonGroupRules: sortedRules.some(rule => rule.trigger !in Rule.rulesWithGroups),
      blueprintCompatible: Rule.blueprintCompatibleRules.includes(currentRule) ? true : false }
}

const generateTriggerCode = (
  currentRule: RuleAttributes, 
  triggerType: string, 
  sortedRules: Rule[],
  target?: string 
)=>{
  let triggerContext, afterCode, triggerCode = ''
  const reg = (target == 'reg')

  const retriggerEffects = (target == 'retrigger') || (currentRule.hasRetriggerEffects &&  !reg)
  const nonRetriggerEffects = (target == 'non_retrigger') || (currentRule.hasNonRetriggerEffects && !reg)
  const deleteEffects = (target == 'delete') || (currentRule.hasDeleteEffects && !reg)
  const fixProbabilityEffects = (target == 'fix') || (currentRule.hasFixProbabilityEffects &&  !reg)
  const modProbabilityEffects = (target == 'mod') || (currentRule.hasModProbabilityEffects &&  !reg)
  const bc = currentRule.blueprintCompatible

  if (currentRule.hasDeleteEffects)
    {triggerCode += `
        if context.destroy_card and context.destroy_card.should_destroy ${bc ? "" : "and not context.blueprint"} then
        return { remove = true }
        end`}
  if (retriggerEffects){
  triggerContext =
          triggerType === "card_held_in_hand" || triggerType === "card_held_in_hand_end_of_round"? 
          `context.repetition and context.cardarea == G.hand and (next(context.card_effects[1]) or #context.card_effects > 1) ${bc ? "" : "and not context.blueprint"}`: 
          `context.repetition and context.cardarea == G.play ${bc ? "" : "and not context.blueprint"}`}
  else if (nonRetriggerEffects){
  triggerContext =
            triggerType === "card_held_in_hand" || triggerType === "card_held_in_hand_end_of_round" ?
            `context.individual and context.cardarea == G.hand and not context.end_of_round ${bc ? "" : "and not context.blueprint"}` :
            triggerType === "card_discarded"? `context.discard 
            ${bc ? "" : "and not context.blueprint"}` : 
            `context.individual and context.cardarea == G.play ${bc ? "" : "and not context.blueprint"}`} 
  else if (deleteEffects){
    triggerContext =
            triggerType === "card_held_in_hand" || triggerType === "card_held_in_hand_end_of_round" ? 
            `context.individual and context.cardarea == G.hand and not context.end_of_round ${bc ? "" : "and not context.blueprint"}` : 
            triggerType === "card_discarded" ? 
            `context.discard ${bc ? "" : "and not context.blueprint"}` : 
            `context.individual and context.cardarea == G.play ${bc ? "" : "and not context.blueprint"}`}
  else if (fixProbabilityEffects){
    triggerContext = `context.fix_probability ${bc ? "" : "and not context.blueprint"}`
    afterCode = `local numerator, denominator = context.numerator, context.denominator`}
  else if (modProbabilityEffects){
    triggerContext = `context.mod_probability ${bc ? "" : "and not context.blueprint"}`
    afterCode = `local numerator, denominator = context.numerator, context.denominator`}
  else if (reg) {
    const context = generateTriggerContext(triggerType, sortedRules)
    triggerContext = context.check}
  
  triggerCode += `
  if ${triggerContext} then`

  if (deleteEffects){
    triggerCode += `
        context.other_card.should_destroy = false`}

  if (afterCode){
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
 ) => {
  
  if (currentRule.hasNoConditions) {return ''}
  
  let condition = generateConditionChain(rule, joker)

  let conditionCode = ''
  if (condition){
    const conditional = hasAnyConditions ? "elseif" : "if"
          conditionCode += `
              ${conditional} ${condition} then`
  } else {
          if (hasAnyConditions) {
            conditionCode += `
            else`;
          }
        }

  const hasDeleteInRegularEffects = (rule.effects || []).some(
                (effect) => effect.type === "delete_triggered_card"
              );

  if (hasDeleteInRegularEffects){
        conditionCode += `
            context.other_card.should_destroy = true`}

  return conditionCode 
}


const generateEffectCode = (
  rule : Rule, 
  triggerType : string,
  modprefix : string,
  jokerKey? : string,
  globalEffectCounts? : Map <string,number>,
  target? : string,
  targetType? : boolean,
) => {
  let effectCode = '', configVariables

  const allEffects = (target !== 'reg' && targetType) ? (target !== 'reg' && !targetType) ?
    (rule.effects || []).filter(effect => effect.type === target) : 
    (rule.effects || []).filter(effect => effect.type !== target) : 
    (rule.effects)

  const allRandomGroups = (target !== 'reg' && targetType) ? (target !== 'reg' && !targetType) ? 
    (rule.randomGroups || []).filter(group => group.effects.some(effect => effect.type === target)) : 
    (rule.randomGroups || []).filter(group => group.effects.some(effect => effect.type !== target)) : 
    (rule.randomGroups) 

  const allLoopGroups = (target !== 'reg' && targetType) ? (target !== 'reg' && !targetType) ?
    (rule.loops || []).filter(group => group.effects.some(effect => effect.type === target)) :
    (rule.loops || []).filter(group => group.effects.some(effect => effect.type !== target)) :
    (rule.loops)

  const effectResult = generateEffectReturnStatement(
                allEffects,
                convertRandomGroupsForCodegen(allRandomGroups),
                convertLoopGroupsForCodegen(allLoopGroups),
                triggerType,
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
  jokerKey? : string,
  globalEffectCounts? : Map <string,number>,
  targetPolarity? : boolean,
) => {
  let configVariables
  let ruleCode = ''
  if (targetTrigger !== 'reg'){
    const triggerCode = generateTriggerCode(currentRule, triggerType, sortedRules, targetTrigger)
    const conditionCode = generateConditionCode(currentRule, rule, joker, hasAnyConditions)
    const effectResult= generateEffectCode(rule, triggerType, modPrefix, jokerKey, globalEffectCounts, targetEffect, targetPolarity)
    const effectCode = effectResult.effectCode
    configVariables = effectResult.configVariables
    
    ruleCode += `${triggerCode}${conditionCode}${effectCode}`
  } else {
    const triggerCode = generateTriggerCode(currentRule, triggerType, sortedRules, 'reg')
    const conditionCode = generateConditionCode(currentRule, rule, joker, hasAnyConditions)
    const effectResult= generateEffectCode(rule, triggerType, modPrefix, jokerKey, globalEffectCounts, 'reg',)
    const effectCode = effectResult.effectCode
    configVariables = effectResult.configVariables
    
    ruleCode += `${triggerCode}${conditionCode}${effectCode}`
  }

  return {ruleCode, configVariables}
}

const applyIndents = (
  code : string
) => {
  let finalCode = ''
  let indentCount = 0
  const indents = (count:number)=>{
    let str = ''
    for (let i = 0; i < count; i++){
      str += '    '
    }
  return str}
  const stringLines = code.split(`
`)
  
  for (let i = 0; i < stringLines.length; i++) {
    
    let line = stringLines[i]
    while (line.startsWith(' ')){
      line = line.slice(1)}

    if (line.includes('end') || line.includes('}') && !line.includes('{') || line.includes('else') ) 
      {indentCount -= 1}
    
    const indent = indents(indentCount)

    finalCode += `
${indent}${line}`

    if (line.includes('if') || line.includes('else') || line.includes('function') || 
        line.includes('return') && !line.includes('}') || line.includes('for') || 
        line.includes('while') || line.includes('do') || line.includes('then') ||
        line.includes('= {') && !line.includes('}') ) {
          indentCount += 1}
  }
  return finalCode
}

export const generateCalcFunction = (
  rules : Rule[],
  joker : JokerData,
  modprefix : string,
) : CalculateFunctionResult => {
  const jokerKey = joker.jokerKey;
  const rulesByTrigger: Record<string, Rule[]> = {};
  rules.forEach((rule) => {
    if (!rulesByTrigger[rule.trigger]) {
      rulesByTrigger[rule.trigger] = [];
    }
    rulesByTrigger[rule.trigger].push(rule);});

  const allConfigVariables: ConfigExtraVariable[] = [];
  const globalEffectCounts = new Map<string, number>();

  let ruleCode = `calculate = function(self, card, context)`;

  Object.entries(rulesByTrigger).forEach(([triggerType, triggerRules]) => {
    const sortedRules = [...triggerRules].sort((a, b) => {
      const aHasConditions = generateConditionChain(a, joker).length > 0;
      const bHasConditions = generateConditionChain(b, joker).length > 0;

      if (aHasConditions && !bHasConditions) return -1;
      if (!aHasConditions && bHasConditions) return 1;
      return 0;
    });

  let hasAnyConditions = false

  rules.forEach(rule => {
    const currentRule : RuleAttributes = getRuleAttributes(sortedRules, joker, rule)    

    if (currentRule.hasRetriggerEffects){
        const retrigCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, hasAnyConditions, modprefix,'retrigger','retrigger_cards',jokerKey,globalEffectCounts,false)
        ruleCode += `${retrigCode.ruleCode}`
        allConfigVariables.push(...(retrigCode.configVariables || [] ))
        if (currentRule.hasNonRetriggerEffects){
          const nonretrigCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, hasAnyConditions, modprefix,'non_retrigger','retrigger_cards',jokerKey,globalEffectCounts,true)
          ruleCode += `${nonretrigCode.ruleCode}`
          allConfigVariables.push(...(nonretrigCode.configVariables || [] ))
      }}
    else if (currentRule.hasDeleteEffects){
      const delCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, hasAnyConditions, modprefix,'delete','delete_triggered_card',jokerKey,globalEffectCounts,true)
      ruleCode += `${delCode.ruleCode}`
      allConfigVariables.push(...(delCode.configVariables || [] ))
    }
    else if (currentRule.hasFixProbabilityEffects || currentRule.hasModProbabilityEffects){
      if (currentRule.hasFixProbabilityEffects){
        const fixCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, hasAnyConditions, modprefix,'fix','fix_probability',jokerKey,globalEffectCounts,true)
        ruleCode += `${fixCode.ruleCode}`
        allConfigVariables.push(...(fixCode.configVariables || [] ))
      }
      if (currentRule.hasModProbabilityEffects){
        const modCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, hasAnyConditions, modprefix,'mod','mod_probability',jokerKey,globalEffectCounts,true)
        ruleCode += `${modCode.ruleCode}`
        allConfigVariables.push(...(modCode.configVariables || [] ))
      }}
    else {
      const regCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, hasAnyConditions, modprefix,'reg','reg',jokerKey,globalEffectCounts)
      ruleCode += `${regCode.ruleCode}`
      allConfigVariables.push(...(regCode.configVariables || [] ))
    }
    if (currentRule.hasConditions) {
        ruleCode += `
            end`
        hasAnyConditions = true
      }
      
    if (currentRule.hasFixProbabilityEffects || currentRule.hasModProbabilityEffects){
        ruleCode += `
        return {
          numerator = numerator, 
          denominator = denominator
        }
          end`}

      ruleCode += `
    end`
    })
  })

  processPassiveEffects(joker).filter((effect) => effect.calculateFunction).forEach((effect) => {
      ruleCode += `
${effect.calculateFunction}`})
  
  ruleCode += `
end`

  ruleCode = applyIndents(ruleCode)

  return {
    code: ruleCode,
    configVariables: allConfigVariables,
}}
