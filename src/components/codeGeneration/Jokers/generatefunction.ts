import { JokerData } from "../../data/BalatroUtils";
import { generateTriggerContext } from "./triggerUtils";
import { generateConditionChain } from "./conditionUtils";
import {
  generateEffectReturnStatement,
  ConfigExtraVariable,
} from "./effectUtils";
import type { Rule } from "../../ruleBuilder/types";
import { convertRandomGroupsForCodegen, convertLoopGroupsForCodegen } from ".";

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
  const rulesWithRetriggerEffects = sortedRules.filter(rule => rule.effects.map(
    effect => effect.type == "retrigger_cards"))
  const rulesWithDeleteEffects = sortedRules.filter(rule => rule.effects.map(
    effect => effect.type == "delete_triggered_card") && rule.trigger !== "card_discarded")
  const rulesWithFixProbabiltyEffects = sortedRules.filter(rule => rule.effects.map(
    effect => effect.type == "fix_probabilty"))
  const rulesWithModProbabiltyEffects = sortedRules.filter(rule => rule.effects.map(
    effect => effect.type == "mod_probabilty"))
  const rulesWithConditions = sortedRules.filter(rule => 
    generateConditionChain(rule, joker).length > 0)
  const rulesWithGroups = sortedRules.filter(rule => 
    (rule.randomGroups || []).length > 0 || (rule.loops || []).length > 0)
  const blueprintCompatibleRules = sortedRules.filter(rule => 
    rule.blueprintCompatible == true)

  return {
    rulesWithRetriggerEffects,
    rulesWithDeleteEffects,
    rulesWithFixProbabiltyEffects,
    rulesWithModProbabiltyEffects,
    rulesWithConditions,
    rulesWithGroups,
    blueprintCompatibleRules
  }}

const getRuleAttributes = (
  sortedRules:Rule[],
  joker: JokerData,
) : RuleAttributes => {
    const Rule = getAllRulesWithAttributes(sortedRules, joker)
  return {
      hasRetriggerEffects: Rule.rulesWithRetriggerEffects.length > 0 ? true : false,
      hasNonRetriggerEffects: sortedRules.some(rule => rule.trigger !in Rule.rulesWithRetriggerEffects),
      hasDeleteEffects: Rule.rulesWithDeleteEffects.length > 0 ? true : false,
      hasFixProbabilityEffects: Rule.rulesWithFixProbabiltyEffects.length > 0 ? true : false,
      hasModProbabilityEffects: Rule.rulesWithModProbabiltyEffects.length > 0 ? true : false,
      hasConditions: Rule.rulesWithConditions.length > 0 ? true : false,
      hasNoConditions: sortedRules.some(rule => rule.trigger !in Rule.rulesWithConditions),
      hasGroupRules: Rule.rulesWithGroups.length > 0  ? true : false,
      hasNonGroupRules: sortedRules.some(rule => rule.trigger !in Rule.rulesWithGroups),
      blueprintCompatible: Rule.blueprintCompatibleRules.length > 0  ? true : false }
}

const generateTriggerCode = (
  currentRule: RuleAttributes, 
  triggerType: string, 
  sortedRules: Rule[],
  conflicts: boolean,
  target?: string 
)=>{
  let triggerContext, afterCode, triggerCode = ''
  // If conflicts, then the code will expect a target for which rule type to resolve first for the function
  const retriggerEffects = (target == 'retrigger') || (currentRule.hasRetriggerEffects && !conflicts)
  const nonRetriggerEffects = (target == 'non_retrigger') || (currentRule.hasNonRetriggerEffects && !conflicts)
  const deleteEffects = (target == 'delete') || (currentRule.hasDeleteEffects && !conflicts)
  const fixProbabilityEffects = (target == 'fix') || (currentRule.hasFixProbabilityEffects && !conflicts)
  const modProbabilityEffects = (target == 'mod') || (currentRule.hasModProbabilityEffects && !conflicts)
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
  else {
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
  joker:JokerData ) => {
  
  if (currentRule.hasNoConditions) {return ''}
  
  let condition = (generateConditionChain(rule, joker) || 'true')
  
  let conditionCode = ''

  const conditional = currentRule.hasConditions ? "elseif" : "if"
        conditionCode += `
            ${conditional} ${condition} then`

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
  conflicts : boolean,
  triggerType : string,
  modprefix : string,
  jokerKey? : string,
  globalEffectCounts? : Map <string,number> ,
  target? : string,
  targetType? : boolean,
) => {
  let effectCode = '', configVariables

  const allEffects = (conflicts && targetType) ? (conflicts && !targetType) ?
    (rule.effects || []).filter(effect => effect.type === target) : 
    (rule.effects || []).filter(effect => effect.type !== target) : 
    (rule.effects)

  const allRandomGroups = (conflicts && targetType) ? (conflicts && !targetType) ?
    (rule.randomGroups || []).filter(group => group.effects.some(effect => effect.type === target)) : 
    (rule.randomGroups || []).filter(group => group.effects.some(effect => effect.type !== target)) : 
    (rule.randomGroups)

  const allLoopGroups = (conflicts && targetType) ? (conflicts && !targetType) ?
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
                globalEffectCounts
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
  modPrefix : string,
  targetTrigger : string,
  targetEffect : string,
  targetPolarity : boolean,
  jokerKey? : string,
  globalEffectCounts? : Map <string,number>,
) => {
  let ruleCode = ''

  const triggerCode = generateTriggerCode(currentRule, triggerType, sortedRules, true, targetTrigger)
  const conditionCode = generateConditionCode(currentRule, rule, joker)
  const effectResult= generateEffectCode(rule, true, triggerType, modPrefix, jokerKey, globalEffectCounts, targetEffect, targetPolarity)
  const effectCode = effectResult.effectCode
  const configVariables = effectResult.configVariables
  
  ruleCode += `${triggerCode}${conditionCode}${effectCode}`

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
      str += '  '
    }
  return str}
  const stringLines = code.split(`
`)
  
  for (let i = 0; i < stringLines.length; i++) {
    
    let line = stringLines[i]
    while (line.startsWith(' ')){
      line = line.slice(1)}

    if (line.includes('end') || line.includes('}') && !line.includes('{') ) {indentCount -= 1}
    
    const indent = indents(indentCount)

    finalCode += `
${indent}${line}`

    if (line.includes('if') || line.includes('else') || line.includes('function') || 
        line.includes('return') && !line.includes('}') || line.includes('for') || 
        line.includes('while') || line.includes('do') || line.includes('then')) {
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

  rules.forEach(rule => {
    const currentRule : RuleAttributes = getRuleAttributes(sortedRules, joker)    
    
    if (currentRule.hasRetriggerEffects){
        const retrigCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, modprefix,'retrigger','retrigger_cards',true,jokerKey,globalEffectCounts)
        ruleCode += `${retrigCode.ruleCode}`
        allConfigVariables.push(...(retrigCode.configVariables || [] ))
        if (currentRule.hasNonRetriggerEffects){
        const nonretrigCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, modprefix,'non_retrigger','retrigger_cards',false,jokerKey,globalEffectCounts)
        ruleCode += `${nonretrigCode.ruleCode}`
        allConfigVariables.push(...(nonretrigCode.configVariables || [] ))
      }}
    else if (currentRule.hasDeleteEffects){
      const delCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, modprefix,'delete','delete_triggered_card',true,jokerKey,globalEffectCounts)
      ruleCode += `${delCode.ruleCode}`
      allConfigVariables.push(...(delCode.configVariables || [] ))
    }
    else if (currentRule.hasFixProbabilityEffects||currentRule.hasModProbabilityEffects){
      if (currentRule.hasFixProbabilityEffects){
        const fixCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, modprefix,'fix','fix_probability',true,jokerKey,globalEffectCounts)
        ruleCode += `${fixCode.ruleCode}`
        allConfigVariables.push(...(fixCode.configVariables || [] ))
      }
      if (currentRule.hasModProbabilityEffects){
        const modCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, modprefix,'mod','mod_probability',true,jokerKey,globalEffectCounts)
        ruleCode += `${modCode.ruleCode}`
        allConfigVariables.push(...(modCode.configVariables || [] ))
      }}
    else {
      const regCode = generateCodeForRuleType(rule, currentRule, joker, triggerType, sortedRules, modprefix,'reg','',true,jokerKey,globalEffectCounts)
      ruleCode += `${regCode.ruleCode}`
      allConfigVariables.push(...(regCode.configVariables || [] ))
    }})
  })
  ruleCode = applyIndents(ruleCode)
  return {
    code: ruleCode,
    configVariables: allConfigVariables,
}}

