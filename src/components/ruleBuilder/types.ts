// Rule structure for the Rule Builder: Trigger -> Condition(s) -> Effect(s)
export interface Rule {
  position: { x: number; y: number };
  id: string;
  trigger: string;
  blueprintCompatible: boolean;
  conditionGroups: ConditionGroup[];
  effects: Effect[];
  randomGroups: RandomGroup[];
  loops: LoopGroup[]
}

// A group of effects with shared random chance
export interface RandomGroup {
  id: string;
  chance_numerator: number | string;
  chance_denominator: number | string;
  respect_probability_effects: boolean;
  custom_key: string;
  effects: Effect[];
}

export interface LoopGroup {
  id: string;
  repetitions: number | string;
  effects: Effect[];
}

// A group of conditions with a logical operator (AND/OR)
export interface ConditionGroup {
  id: string;
  operator: string; // "and" or "or"
  conditions: Condition[];
}

// A single condition with parameters
export interface Condition {
  id: string;
  type: string;
  negate: boolean; // For NOT logic
  params: Record<string, unknown>;
  operator?: string;
}

// An effect with parameters
export interface Effect {
  id: string;
  type: string;
  params: Record<string, unknown>;
  customMessage?: string;
}

// Interface for trigger definitions
export interface TriggerDefinition {
  id: string;
  label: string;
  description: string;
  category: string;
  objectUsers?: (string)[]
}

export interface GlobalTriggerDefinition {
  id: string;
  label: Record <string, string>;
  description: Record <string, string>;
  category: string;
  objectUsers: Array <string>
}

// When a parameter should be shown based on other parameter values
export interface ShowWhenCondition {
  parameter: string;
  values: string[];
}

// Interface for condition parameter options
export interface ConditionParameterOption {
  value: string;
  label: string;
}

// Interface for condition parameters
export interface ConditionParameter {
  id: string;
  type: "select" | "number" | "range" | "text";
  label: string;
  description?: string;
  options?:
    | ConditionParameterOption[]
    | (() => ConditionParameterOption[])
    | ((parentValues: Record<string, unknown>) => ConditionParameterOption[]);
  min?: number;
  max?: number;
  default?: unknown;
  showWhen?: ShowWhenCondition;
  variableTypes?: Array<"number" | "suit" | "rank" | "pokerhand" | "joker" | "card_context" | "joker_context">;
  exemptObjects?: string[]
}

// Interface for condition type definitions
export interface ConditionTypeDefinition {
  id: string;
  label: string;
  description: string;
  params: ConditionParameter[];
  applicableTriggers?: string[];
  category: string;
}

export interface GlobalConditionTypeDefinition {
  id: string;
  label: string;
  description: string;
  params: ConditionParameter[];
  applicableTriggers?: string[];
  category: string;
  objectUsers: string[]
}

// Interface for effect parameter options
export interface EffectParameterOption {
  value: string;
  label: string;  
  checked?: boolean;
}

// Interface for effect parameters
export interface EffectParameter {
  id: string;
  type: "select" | "number" | "range" | "text" | "checkbox";
  label: string;
  description?: string;
  options?:
    | EffectParameterOption[]
    | (() => EffectParameterOption[])
    | ((parentValues: Record<string, unknown>) => EffectParameterOption[]);
  checkboxOptions?: EffectParameterOption[]
  min?: number;
  max?: number;
  default?: unknown;
  showWhen?: ShowWhenCondition;
  variableTypes?: Array<"number" | "suit" | "rank" | "pokerhand" | "joker" | "card_context" | "joker_context">;
  exemptObjects?: string[]
}

// Interface for effect type definitions
export interface EffectTypeDefinition {
  id: string;
  label: string;
  description: string;
  params: EffectParameter[];
  applicableTriggers?: string[];
  category: string;
}

export interface GlobalEffectTypeDefinition {
  id: string;
  label: string;
  description: string;
  params: EffectParameter[];
  applicableTriggers?: string[];
  category: string;
  objectUsers: string[]
}

// Interface for logical operators
export interface LogicalOperator {
  value: string;
  label: string;
}

// Interface for selected items in the rule builder
export type SelectedItem = {
  type: "trigger" | "condition" | "effect" | "randomgroup" | "loopgroup";
  ruleId: string;
  itemId?: string;
  groupId?: string;
  randomGroupId?: string;
  loopGroupId?: string;
} | null;

// Export logical operators
export const LOGICAL_OPERATORS: LogicalOperator[] = [
  { value: "and", label: "AND" },
  { value: "or", label: "OR" },
];
