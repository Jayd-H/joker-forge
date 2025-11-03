import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type {
  Rule,
  Condition,
  Effect,
  RandomGroup,
  ConditionParameter,
  EffectParameter,
  ShowWhenCondition,
  LoopGroup,
} from "./types";
import { getModPrefix, JokerData } from "../data/BalatroUtils";
import {
  addSuitVariablesToOptions,
  addRankVariablesToOptions,
  getAllVariables,
  addPokerHandVariablesToOptions,
  addNumberVariablesToOptions,
  addJokerVariablesToOptions,
  getNumberVariables,
} from "../codeGeneration/Jokers/variableUtils";

import { getTriggerById } from "../data/Triggers";
import { getConditionTypeById } from "../data/Conditions";
import { getEffectTypeById } from "../data/Effects";

import InputField from "../generic/InputField";
import InputDropdown from "../generic/InputDropdown";
import Button from "../generic/Button";
import {
  EyeIcon,
  InformationCircleIcon,
  VariableIcon,
  XMarkIcon,
  Bars3Icon,
  PlusIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  ArrowsRightLeftIcon,
  PlayCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ChartPieIcon, PercentBadgeIcon } from "@heroicons/react/16/solid";
import {
  validateVariableName,
  validateCustomMessage,
} from "../generic/validationUtils";
import { GameVariable, getGameVariableById } from "../data/GameVars";
import { CubeIcon } from "@heroicons/react/24/outline";
import { SelectedItem } from "./types";
import  Checkbox  from "../generic/Checkbox";
import { addTextVariablesToOptions } from "../codeGeneration/userVariableUtils";


interface InspectorProps {
  position: { x: number; y: number };
  joker: JokerData;
  selectedRule: Rule | null;
  selectedCondition: Condition | null;
  selectedEffect: Effect | null;
  selectedRandomGroup: RandomGroup | null;
  selectedLoopGroup: LoopGroup | null;
  onUpdateCondition: (
    ruleId: string,
    conditionId: string,
    updates: Partial<Condition>
  ) => void;
  onUpdateEffect: (
    ruleId: string,
    effectId: string,
    updates: Partial<Effect>
  ) => void;
  onUpdateRandomGroup: (
    ruleId: string,
    randomGroupId: string,
    updates: Partial<RandomGroup>
  ) => void;
  onUpdateLoopGroup: (
    ruleId: string,
    randomGroupId: string,
    updates: Partial<LoopGroup>
  ) => void;
  onUpdateJoker: (updates: Partial<JokerData>) => void;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onToggleVariablesPanel: () => void;
  onToggleGameVariablesPanel: () => void;
  onCreateRandomGroupFromEffect: (ruleId: string, effectId: string) => void;
  onCreateLoopGroupFromEffect: (ruleId: string, effectId: string) => void;
  selectedGameVariable: GameVariable | null;
  onGameVariableApplied: () => void;
  selectedItem: SelectedItem;
  itemType: "joker" | "consumable" | "card" | "voucher" | "deck";
}

interface ParameterFieldProps {
  param: ConditionParameter | EffectParameter;
  value: unknown;
  selectedRule: Rule;
  onChange: (value: unknown) => void;
  parentValues?: Record<string, unknown>;
  availableVariables?: Array<{ value: string; label: string }>;
  onCreateVariable?: (name: string, initialValue: number) => void;
  onOpenVariablesPanel?: () => void;
  onOpenGameVariablesPanel?: () => void;
  selectedGameVariable?: GameVariable | null;
  onGameVariableApplied?: () => void;
  isEffect?: boolean;
  joker?: JokerData;
  itemType: "joker" | "consumable" | "card" | "voucher" | "deck";
}

interface ChanceInputProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  availableVariables: Array<{ value: string; label: string }>;
  onCreateVariable: (name: string, initialValue: number) => void;
  onOpenVariablesPanel: () => void;
  onOpenGameVariablesPanel: () => void;
  selectedGameVariable?: GameVariable | null;
  onGameVariableApplied?: () => void;
  itemType: "joker" | "consumable" | "card" | "voucher" | "deck";
}

const ChanceInput: React.FC<ChanceInputProps> = React.memo(
  ({
    label,
    value,
    onChange,
    availableVariables,
    onOpenVariablesPanel,
    onOpenGameVariablesPanel,
    selectedGameVariable,
    onGameVariableApplied,
    itemType,
  }) => {
    const [isVariableMode, setIsVariableMode] = React.useState(
      typeof value === "string" &&
        !value.startsWith("GAMEVAR:") &&
        !value.startsWith("RANGE:")
    );
    const [isRangeMode, setIsRangeMode] = React.useState(
      typeof value === "string" && value.startsWith("RANGE:")
    );
    const [inputValue, setInputValue] = React.useState("");

    const numericValue = typeof value === "number" ? value : 1;
    const actualValue = value || numericValue;

    React.useEffect(() => {
      if (typeof value === "number") {
        setInputValue(value.toString());
      }
    }, [value]);

    const parseRangeValue = (rangeStr: string | number | unknown) => {
      if (typeof rangeStr === "string" && rangeStr.startsWith("RANGE:")) {
        const parts = rangeStr.replace("RANGE:", "").split("|");
        return {
          min: parseFloat(parts[0] || "1"),
          max: parseFloat(parts[1] || "5"),
        };
      }
      return { min: 1, max: 5 };
    };

    const rangeValues =
      isRangeMode && typeof actualValue === "string"
        ? parseRangeValue(actualValue)
        : { min: 1, max: 5 };

    React.useEffect(() => {
      const isVar =
        typeof value === "string" &&
        !value.startsWith("GAMEVAR:") &&
        !value.startsWith("RANGE:");
      const isRange = typeof value === "string" && value.startsWith("RANGE:");
      setIsVariableMode(isVar);
      setIsRangeMode(isRange);
    }, [value]);

    React.useEffect(() => {
      if (selectedGameVariable) {
        const currentValue = value;
        const isAlreadyGameVar =
          typeof currentValue === "string" &&
          currentValue.startsWith("GAMEVAR:");
        const multiplier = isAlreadyGameVar
          ? parseFloat(currentValue.split("|")[1] || "1")
          : 1;
        const startsFrom = isAlreadyGameVar
          ? parseFloat(currentValue.split("|")[2] || "0")
          : 0;

        onChange(
          `GAMEVAR:${selectedGameVariable.id}|${multiplier}|${startsFrom}`
        );
        onGameVariableApplied?.();
      }
    }, [selectedGameVariable, value, onChange, onGameVariableApplied]);

    const handleModeChange = (mode: "number" | "variable" | "range") => {
      if (mode === "number") {
        setIsVariableMode(false);
        setIsRangeMode(false);
        onChange(numericValue);
      } else if (mode === "variable") {
        setIsVariableMode(true);
        setIsRangeMode(false);
        onChange("");
      } else if (mode === "range") {
        setIsVariableMode(false);
        setIsRangeMode(true);
        onChange("RANGE:1|5");
      }
    };

    const handleNumberChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      if (newValue === "" || newValue === "-") {
        onChange(0);
        return;
      }

      const parsed = parseFloat(newValue);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    };

    return (
      <div className="flex flex-col gap-2 items-center">
        <div className="flex items-center gap-2">
          <span className="text-white-light text-sm">{label}</span>
          {itemType !== "consumable" && (
            <button
              onClick={() =>
                handleModeChange(isVariableMode ? "number" : "variable")
              }
              className={`p-1 rounded transition-colors cursor-pointer ${
                isVariableMode
                  ? "bg-mint/20 text-mint"
                  : "bg-black-lighter text-white-darker hover:text-mint"
              }`}
              title="Toggle variable mode"
            >
              <VariableIcon className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={onOpenGameVariablesPanel}
            className={`p-1 rounded transition-colors cursor-pointer ${
              typeof value === "string" && value.startsWith("GAMEVAR:")
                ? "bg-mint/20 text-mint"
                : "bg-black-lighter text-white-darker hover:text-mint"
            }`}
            title="Use game variable"
          >
            <CubeIcon className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleModeChange(isRangeMode ? "number" : "range")}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isRangeMode
                ? "bg-mint/20 text-mint"
                : "bg-black-lighter text-white-darker hover:text-mint"
            }`}
            title="Toggle range mode"
          >
            <ArrowsRightLeftIcon className="h-3 w-3" />
          </button>
        </div>

        {isRangeMode ? (
          <div className="flex items-center gap-2 w-full">
            <InputField
              type="number"
              value={rangeValues.min.toString()}
              onChange={(e) => {
                const newMin = parseFloat(e.target.value) ?? 1;
                onChange(`RANGE:${newMin}|${rangeValues.max}`);
              }}
              size="sm"
              className="w-16"
              placeholder="Min"
            />
            <span className="text-white-light text-xs">to</span>
            <InputField
              type="number"
              value={rangeValues.max.toString()}
              onChange={(e) => {
                const newMax = parseFloat(e.target.value) ?? 1;
                onChange(`RANGE:${rangeValues.min}|${newMax}`);
              }}
              size="sm"
              className="w-16"
              placeholder="Max"
            />
          </div>
        ) : isVariableMode && itemType !== "consumable" ? (
          <div className="space-y-2 w-full">
            {availableVariables.length > 0 ? (
              <InputDropdown
                value={(actualValue as string) || ""}
                onChange={(newValue) => onChange(newValue)}
                options={availableVariables}
                placeholder="Select variable"
                className="bg-black-dark"
                size="sm"
              />
            ) : (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={onOpenVariablesPanel}
                icon={<PlusIcon className="h-4 w-4" />}
                className="cursor-pointer"
              >
                Create Variable
              </Button>
            )}
          </div>
        ) : (
          <InputField
            type="number"
            value={inputValue}
            onChange={handleNumberChange}
            size="sm"
            className="w-20"
          />
        )}
      </div>
    );
  }
);

ChanceInput.displayName = "ChanceInput";

function hasShowWhen(param: ConditionParameter | EffectParameter): param is (
  | ConditionParameter
  | EffectParameter
) & {
  showWhen: ShowWhenCondition;
} {
  return "showWhen" in param && param.showWhen !== undefined;
}

const ParameterField: React.FC<ParameterFieldProps> = ({
  param,
  value,
  selectedRule,
  onChange,
  parentValues = {},
  availableVariables = [],
  onOpenVariablesPanel,
  onOpenGameVariablesPanel,
  selectedGameVariable,
  onGameVariableApplied,
  isEffect = false,
  joker = null,
  itemType,
}) => {
  const [isVariableMode, setIsVariableMode] = React.useState(
    typeof value === "string" &&
      !value.startsWith("GAMEVAR:") &&
      !value.startsWith("RANGE:")
  );
  const [isRangeMode, setIsRangeMode] = React.useState(
    typeof value === "string" && value.startsWith("RANGE:")
  );
  const [inputValue, setInputValue] = React.useState("");
  const [inputError, setInputError] = React.useState<string>("");

  const [showStartsFromTooltip, setShowStartsFromTooltip] =
    React.useState(false);
  const [showMultiplierTooltip, setShowMultiplierTooltip] =
    React.useState(false);

  React.useEffect(() => {
    if (param.type === "number" && typeof value === "number") {
      setInputValue(value.toString());
    }
  }, [param.type, value]);        

  React.useEffect(() => {
    const isVar =
      typeof value === "string" &&
      !value.startsWith("GAMEVAR:") &&
      !value.startsWith("RANGE:");
    const isRange = typeof value === "string" && value.startsWith("RANGE:");
    setIsVariableMode(isVar);
    setIsRangeMode(isRange);
  }, [value]);

  React.useEffect(() => {
    if (selectedGameVariable && param.type === "number") {
      const currentValue = value;
      const isAlreadyGameVar =
        typeof currentValue === "string" && currentValue.startsWith("GAMEVAR:");
      const multiplier = isAlreadyGameVar
        ? parseFloat(currentValue.split("|")[1] || "1")
        : 1;
      const startsFrom = isAlreadyGameVar
        ? parseFloat(currentValue.split("|")[2] || "0")
        : 0;

      onChange(
        `GAMEVAR:${selectedGameVariable.id}|${multiplier}|${startsFrom}`
      );
      onGameVariableApplied?.();
    }
  }, [
    selectedGameVariable,
    param.type,
    onChange,
    onGameVariableApplied,
    value,
  ]);

  if (hasShowWhen(param)) {
    const { parameter, values } = param.showWhen;
    const parentValue = parentValues[parameter];
    if (Array.isArray(parentValue) && typeof parentValue[0] === "boolean") {
      if (!values.some(value => parentValue[parseFloat(value)])) {
        return null;
      }
    } else if (typeof parentValue === "string") {
      if (!values.includes(parentValue)) {
        return null;
      }
    }
  }

  switch (param.type) {
    case "select": {
      let options: Array<{ value: string; label: string; exempt?: string[] }> = [];

      if (typeof param.options === "function") {
        // Check if the function expects parentValues parameter
        if (param.options.length > 0) {
          // Function expects parentValues
          options = param.options(parentValues || {});
        } else {
          // Function with no parameters, but expects parentValues argument
          options = param.options(parentValues || {});
        }
      } else if (Array.isArray(param.options)) {
        options = param.options.map((option) => ({
          value: option.value,
          label: option.label,
          exempt: option.exempt
        }));
      }

      const trigger = selectedRule.trigger
      if (param.variableTypes?.includes("joker_context")) {
        if (trigger === "joker_evaluated") {
            options.push({value: "evaled_joker", label: "Evaluated Joker"})
        }
        if (selectedRule.conditionGroups.some(groups => groups.conditions.some(
          condition => condition.type === "joker_selected" && condition.negate === false
        ))) {
          options.push({value: "selected_joker", label: "Selected Joker", exempt: ["joker", "card", "voucher", "deck"] })
        }
      }

      if (param.variableTypes?.includes("rank_context")) {
        if (trigger === "card_scored") {
          options.push({value: "scored_card", label: "Scored Card Rank"})
        }
        if (trigger === "card_destroyed") {
          options.push({value: "destroyed_card", label: "Destroyed Card Rank"})
        }
        if (trigger === "card_discarded") {
          options.push({value: "discarded_card", label: "Discarded Card Rank"})
        }
        if (trigger === "card_held_in_hand" || trigger === "card_held_in_hand_end_of_round") {
          options.push({value: "held_card", label: "Card Held in Hand Rank"})
        }
        if (trigger === "card_added") {
          options.push({value: "added_card", label: "Added Card Rank"})
        } 
      }

      if (param.variableTypes?.includes("suit_context")) {
        if (trigger === "card_scored") {
          options.push({value: "scored_card", label: "Scored Card Suit"})
        }
        if (trigger === "card_destroyed") {
          options.push({value: "destroyed_card", label: "Destroyed Card Suit"})
        }
        if (trigger === "card_discarded") {
          options.push({value: "discarded_card", label: "Discarded Card Suit"})
        }
        if (trigger === "card_held_in_hand" || trigger === "card_held_in_hand_end_of_round") {
          options.push({value: "held_card", label: "Card Held in Hand Suit"})
        }
        if (trigger === "card_added") {
          options.push({value: "added_card", label: "Added Card Suit"})
        } 
      }

      if (param.id === "variable_name" && joker && param.label) {
        if (param.variableTypes?.includes("number")) {
          const numberVariables =
            joker.userVariables?.filter((v) => v.type === "number") || [];
          options.push(...numberVariables.map((variable) => ({
            value: variable.name,
            label: variable.name,
          })))}
        if (param.variableTypes?.includes("suit")) {
          const suitVariables =
            joker.userVariables?.filter((v) => v.type === "suit") || [];
          options.push(...suitVariables.map((variable) => ({
            value: variable.name,
            label: variable.name,
          })))}
        if (param.variableTypes?.includes("rank")) {
          const rankVariables =
            joker.userVariables?.filter((v) => v.type === "rank") || [];
          options.push(...rankVariables.map((variable) => ({
            value: variable.name,
            label: variable.name,
          })))}
        if (param.variableTypes?.includes("pokerhand")) {
          const pokerHandVariables =
            joker.userVariables?.filter((v) => v.type === "pokerhand") || [];
          options.push(...pokerHandVariables.map((variable) => ({
            value: variable.name,
            label: variable.name,
          })))}
        if (param.variableTypes?.includes("joker")) {
          const jokerVariables =
            joker.userVariables?.filter((v) => v.type === "joker") || [];
          options.push(...jokerVariables.map((variable) => ({
            value: variable.name,
            label: variable.name,
          })))}
        if (param.variableTypes?.includes("text")) {
          const textVariables =
            joker.userVariables?.filter((v) => v.type === "text") || [];
          options.push(...textVariables.map((variable) => ({
            value: variable.name,
            label: variable.name,
          })))}
      } else {

        if (param.variableTypes?.includes("number") && joker) {
          options = addNumberVariablesToOptions(options, joker)
        }

        if (param.variableTypes?.includes("suit") && joker) {
          options = addSuitVariablesToOptions(options, joker)
        }

        if (param.variableTypes?.includes("rank") && joker) {
          options = addRankVariablesToOptions(options, joker)
        }

        if (param.variableTypes?.includes("pokerhand") && joker) {
          options = addPokerHandVariablesToOptions(options, joker)
        }

        if (param.variableTypes?.includes("joker") && joker) {
          options = addJokerVariablesToOptions(options, joker)
        }

        if (param.variableTypes?.includes("text") && joker) {
          options = addTextVariablesToOptions(options, joker)
        }
      }

      options.filter(option => !option.exempt?.includes(itemType))

      return (
        <InputDropdown
          label={String(param.label)}
          labelPosition="center"
          value={(value as string) || ""}
          onChange={(newValue) => onChange(newValue)}
          options={options}
          className="bg-black-dark"
          size="sm"
        />
      );
    }

    case "number": {
      const isGameVariable =
        typeof value === "string" && value.startsWith("GAMEVAR:");
      const gameVariableId = isGameVariable
        ? value.replace("GAMEVAR:", "").split("|")[0]
        : null;
      const gameVariableMultiplier = isGameVariable
        ? parseFloat(value.replace("GAMEVAR:", "").split("|")[1] || "1")
        : 1;
      const gameVariableStartsFrom = isGameVariable
        ? parseFloat(value.replace("GAMEVAR:", "").split("|")[2] || "0")
        : 0;
      const gameVariable = gameVariableId
        ? getGameVariableById(gameVariableId)
        : null;

      const parseRangeValue = (rangeStr: string) => {
        if (rangeStr.startsWith("RANGE:")) {
          const parts = rangeStr.replace("RANGE:", "").split("|");
          return {
            min: parseFloat(parts[0] || "1"),
            max: parseFloat(parts[1] || "5"),
          };
        }
        return { min: 1, max: 5 };
      };

      const rangeValues =
        isRangeMode && typeof value === "string"
          ? parseRangeValue(value)
          : { min: 1, max: 5 };

      const numericValue =
        !isGameVariable && !isRangeMode && typeof value === "number"
          ? value
          : typeof param.default === "number"
          ? param.default
          : 0;

      const handleModeChange = (mode: "number" | "variable" | "range") => {
        if (mode === "number") {
          setIsVariableMode(false);
          setIsRangeMode(false);
          onChange(numericValue);
          setInputValue(numericValue.toString());
        } else if (mode === "variable") {
          setIsVariableMode(true);
          setIsRangeMode(false);
          onChange("");
        } else if (mode === "range") {
          setIsVariableMode(false);
          setIsRangeMode(true);
          onChange("RANGE:1|5");
        }
      };

      const handleNumberChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (newValue === "" || newValue === "-") {
          onChange(0);
          return;
        }

        const parsed = parseFloat(newValue);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      };

      const handleGameVariableChange = (
        field: "multiplier" | "startsFrom",
        newValue: string
      ) => {
        const parsed = parseFloat(newValue) || 0;
        if (field === "multiplier") {
          onChange(
            `GAMEVAR:${gameVariableId}|${parsed}|${gameVariableStartsFrom}`
          );
        } else {
          onChange(
            `GAMEVAR:${gameVariableId}|${gameVariableMultiplier}|${parsed}`
          );
        }
      };

      const handleRangeChange = (field: "min" | "max", newValue: string) => {
        const parsed = parseFloat(newValue) ?? 1;
        if (field === "min") {
          onChange(`RANGE:${parsed}|${rangeValues.max}`);
        } else {
          onChange(`RANGE:${rangeValues.min}|${parsed}`);
        }
      };

      return (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white-light text-sm">
              {String(param.label)}
            </span>
            {itemType !== "consumable" && (
              <button
                onClick={() =>
                  handleModeChange(isVariableMode ? "number" : "variable")
                }
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isVariableMode
                    ? "bg-mint/20 text-mint"
                    : "bg-black-lighter text-white-darker hover:text-mint"
                }`}
                title="Toggle variable mode"
              >
                <VariableIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onOpenGameVariablesPanel}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isGameVariable
                  ? "bg-mint/20 text-mint"
                  : "bg-black-lighter text-white-darker hover:text-mint"
              }`}
              title="Use game variable"
            >
              <CubeIcon className="h-4 w-4" />
            </button>
            {isEffect && (
              <button
                onClick={() =>
                  handleModeChange(isRangeMode ? "number" : "range")
                }
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isRangeMode
                    ? "bg-mint/20 text-mint"
                    : "bg-black-lighter text-white-darker hover:text-mint"
                }`}
                title="Toggle range mode"
              >
                <ArrowsRightLeftIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {isGameVariable ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-mint/10 border border-mint/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <CubeIcon className="h-4 w-4 text-mint" />
                  <span className="text-mint text-sm font-medium">
                    {gameVariable?.label || "Unknown Game Variable"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onChange(numericValue);
                    setInputValue(numericValue.toString());
                  }}
                  className="p-1 text-mint hover:text-white transition-colors cursor-pointer"
                  title="Remove game variable"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white-light text-sm">Starts From</span>
                  <div
                    className="relative"
                    onMouseEnter={() => setShowStartsFromTooltip(true)}
                    onMouseLeave={() => setShowStartsFromTooltip(false)}
                  >
                    <InformationCircleIcon className="h-4 w-4 text-white-darker hover:text-white-light cursor-help transition-colors" />
                    {showStartsFromTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/4 mb-2 px-3 py-2 bg-black-darker border border-black-lighter rounded-lg text-sm text-white-light w-72 z-50 shadow-lg pointer-events-none">
                        Value that the Game Variable starts from. (e.g. 1 for
                        XMult)
                      </div>
                    )}
                  </div>
                </div>
                <InputField
                  type="number"
                  value={gameVariableStartsFrom.toString()}
                  onChange={(e) =>
                    handleGameVariableChange("startsFrom", e.target.value)
                  }
                  size="sm"
                />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white-light text-sm">Multiplier</span>
                  <div
                    className="relative"
                    onMouseEnter={() => setShowMultiplierTooltip(true)}
                    onMouseLeave={() => setShowMultiplierTooltip(false)}
                  >
                    <InformationCircleIcon className="h-4 w-4 text-white-darker hover:text-white-light cursor-help transition-colors" />
                    {showMultiplierTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/4 mb-2 px-3 py-2 bg-black-darker border border-black-lighter rounded-lg text-sm text-white-light w-72 z-50 shadow-lg pointer-events-none">
                        Factor that the Game Variable with multiply with /
                        increment by. (e.g. 0.1 for XMult)
                      </div>
                    )}
                  </div>
                </div>
                <InputField
                  type="number"
                  value={gameVariableMultiplier.toString()}
                  onChange={(e) =>
                    handleGameVariableChange("multiplier", e.target.value)
                  }
                  size="sm"
                />
              </div>
            </div>
          ) : isRangeMode && isEffect ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-mint/10 border border-mint/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowsRightLeftIcon className="h-4 w-4 text-mint" />
                  <span className="text-mint text-sm font-medium">
                    Range Mode: {rangeValues.min} to {rangeValues.max}
                  </span>
                </div>
                <button
                  onClick={() => handleModeChange("number")}
                  className="p-1 text-mint hover:text-white transition-colors cursor-pointer"
                  title="Remove range mode"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              <div>
                <span className="text-white-light text-sm mb-2 block">
                  Minimum Value
                </span>
                <InputField
                  type="number"
                  value={rangeValues.min.toString()}
                  onChange={(e) => handleRangeChange("min", e.target.value)}
                  size="sm"
                />
              </div>
              <div>
                <span className="text-white-light text-sm mb-2 block">
                  Maximum Value
                </span>
                <InputField
                  type="number"
                  value={rangeValues.max.toString()}
                  onChange={(e) => handleRangeChange("max", e.target.value)}
                  size="sm"
                />
              </div>
            </div>
          ) : isVariableMode && itemType !== "consumable" ? (
            <div className="space-y-2">
              {availableVariables && availableVariables.length > 0 ? (
                <InputDropdown
                  value={(value as string) || ""}
                  onChange={(newValue) => onChange(newValue)}
                  options={availableVariables}
                  placeholder="Select variable"
                  className="bg-black-dark"
                  size="sm"
                />
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => onOpenVariablesPanel?.()}
                  icon={<PlusIcon className="h-4 w-4" />}
                  className="cursor-pointer"
                >
                  Create Variable
                </Button>
              )}
            </div>
          ) : (
            <InputField
              type="number"
              value={inputValue}
              onChange={handleNumberChange}
              size="sm"
              labelPosition="center"
            />
          )}
        </>
      );
    }

    case "text": {
      const isVariableName = param.id === "variable_name";

      return (
        <div>
          <InputField
            label={String(param.label)}
            value={(value as string) || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              onChange(newValue);

              if (isVariableName) {
                const validation = validateVariableName(newValue);
                setInputError(
                  validation.isValid ? "" : validation.error || "Invalid name"
                );
              }
            }}
            className="text-sm"
            size="sm"
            error={isVariableName ? inputError : undefined}
          />
          {isVariableName && inputError && (
            <div className="flex items-center gap-2 mt-1 text-balatro-red text-sm">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>{inputError}</span>
            </div>
          )}
        </div>
      );
    }

    case "checkbox" : {
      const boxes = param.checkboxOptions || []

      return (
        <div className="flex flex-col w-full select-none overflow-y-auto">
            {param.label && (
        <div className={`flex justify-center`}>
          <div className="bg-black border-2 border-black-light rounded-md px-4 pb-2 -mb-2 relative">
            <span className={`text-white-light text-sm`}>
              {param.label}
            </span>
          </div>
        </div>
      )}
    <div  className="bg-black-dark border-2 border-black-lighter rounded-md pb-1 pt-1 -mb-2 relative">
      {boxes?.map((checkbox) => (
        <div 
          className="px-4 pb-2 -mb-2 relative"
          key={checkbox.value}>
          <input
            type="checkbox"
            checked={checkbox.checked}
            onChange={() => {
              const index = boxes.indexOf(checkbox)
              if (param.checkboxOptions && Array.isArray(value)) {
                param.checkboxOptions[index].checked = value[index] == true ? false : true
              }
              onChange(boxes[index].checked)
            }}
            className="w-4 h-4 text-mint bg-black-darker border-black-lighter rounded focus:ring-mint focus:ring-2"
          />
          <label className="px-2 text-white-light text-sm">
            {checkbox.label}
          </label>
        </div>
      ))}
      </div>
    </div>  
      );
    }

    default:
      return null;
  }
};

const Inspector: React.FC<InspectorProps> = ({
  position,
  joker,
  selectedRule,
  selectedCondition,
  selectedEffect,
  selectedRandomGroup,
  selectedLoopGroup,
  onUpdateCondition,
  onUpdateEffect,
  onUpdateRandomGroup,
  onUpdateLoopGroup,
  onUpdateJoker,
  onClose,
  onToggleVariablesPanel,
  onToggleGameVariablesPanel,
  onCreateRandomGroupFromEffect,
  onCreateLoopGroupFromEffect,
  selectedGameVariable,
  onGameVariableApplied,
  selectedItem,
  itemType,
}) => {
  const [customMessageValidationError, setCustomMessageValidationError] =
    useState<string>("");

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "panel-inspector",
  });

  const style = transform
    ? {
        position: "absolute" as const,
        left: position.x + transform.x,
        top: position.y + transform.y,
      }
    : {
        position: "absolute" as const,
        left: position.x,
        top: position.y,
      };

  const getTrigger = getTriggerById

  const getConditionType = getConditionTypeById

  const getEffectType = getEffectTypeById

  const availableVariables = getNumberVariables(joker).map(
    (variable: { name: string }) => ({
      value: variable.name,
      label: variable.name,
    })
  );

  const handleCreateVariable = (name: string, initialValue: number) => {
    const validation = validateVariableName(name);

    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const existingNames = getAllVariables(joker).map((v) =>
      v.name.toLowerCase()
    );
    if (existingNames.includes(name.toLowerCase())) {
      alert("Variable name already exists");
      return;
    }

    const newVariable = {
      id: crypto.randomUUID(),
      name,
      initialValue,
    };

    const updatedVariables = [...(joker.userVariables || []), newVariable];
    onUpdateJoker({ userVariables: updatedVariables });
  };

  React.useEffect(() => {
    setCustomMessageValidationError("");
  }, [selectedEffect?.id]);

  React.useEffect(() => {
    if (selectedGameVariable && selectedItem) {
      if (selectedItem.type === "condition" && selectedCondition) {
        if (selectedCondition.id == "Generic Compare") {
          const valueParam = selectedCondition.params.value;
          if (valueParam !== undefined) {
            const currentValue = valueParam;
            const isAlreadyGameVar =
              typeof currentValue === "string" &&
              currentValue.startsWith("GAMEVAR:");
            const multiplier = isAlreadyGameVar
              ? parseFloat(currentValue.split("|")[1] || "1")
              : 1;
            const startsFrom = isAlreadyGameVar
              ? parseFloat(currentValue.split("|")[2] || "0")
              : 0;

            onUpdateCondition(selectedRule?.id || "", selectedCondition.id, {
              params: {
                ...selectedCondition.params,
                value: `GAMEVAR:${selectedGameVariable.id}|${multiplier}|${startsFrom}`,
              },
            });
          }
          onGameVariableApplied();
        } else {
          let valueParam, item;
          if (selectedCondition.params.value1 === 0) {
            valueParam = selectedCondition.params.value1;
            item = "value1";
          } else {
            valueParam = selectedCondition.params.value2;
            item = "value2";
          }
          if (valueParam !== undefined) {
            const currentValue = valueParam;
            const isAlreadyGameVar =
              typeof currentValue === "string" &&
              currentValue.startsWith("GAMEVAR:");
            const multiplier = isAlreadyGameVar
              ? parseFloat(currentValue.split("|")[1] || "1")
              : 1;
            const startsFrom = isAlreadyGameVar
              ? parseFloat(currentValue.split("|")[2] || "0")
              : 0;

            onUpdateCondition(selectedRule?.id || "", selectedCondition.id, {
              params: {
                ...selectedCondition.params,
                [item]: `GAMEVAR:${selectedGameVariable.id}|${multiplier}|${startsFrom}`,
              },
            });
          }
          onGameVariableApplied();
        }
      } else if (selectedItem.type === "effect" && selectedEffect) {
        const valueParam =
          selectedEffect.params.value || selectedEffect.params.repetitions;
        if (valueParam !== undefined) {
          const currentValue = valueParam;
          const isAlreadyGameVar =
            typeof currentValue === "string" &&
            currentValue.startsWith("GAMEVAR:");
          const multiplier = isAlreadyGameVar
            ? parseFloat(currentValue.split("|")[1] || "1")
            : 1;
          const startsFrom = isAlreadyGameVar
            ? parseFloat(currentValue.split("|")[2] || "0")
            : 0;

          const paramKey =
            selectedEffect.params.value !== undefined ? "value" : "repetitions";
          onUpdateEffect(selectedRule?.id || "", selectedEffect.id, {
            params: {
              ...selectedEffect.params,
              [paramKey]: `GAMEVAR:${selectedGameVariable.id}|${multiplier}|${startsFrom}`,
            }
          });
          onGameVariableApplied();
        }
      } else if (selectedItem.type === "randomgroup" && selectedRandomGroup) {
        onUpdateRandomGroup(selectedRule?.id || "", selectedRandomGroup.id, {
          chance_numerator: `GAMEVAR:${selectedGameVariable.id}|1|0`,
        });
        onGameVariableApplied();
      } else if (selectedItem.type === "loopgroup" && selectedLoopGroup) {
        onUpdateLoopGroup(selectedRule?.id || "", selectedLoopGroup.id, {
          repetitions: `GAMEVAR:${selectedGameVariable.id}|1|0`,
        });
        onGameVariableApplied();
      }
    }
  }, [
    selectedGameVariable,
    selectedItem,
    selectedCondition,
    selectedEffect,
    selectedRandomGroup,
    selectedLoopGroup,
    selectedRule?.id,
    onUpdateCondition,
    onUpdateEffect,
    onUpdateRandomGroup,
    onUpdateLoopGroup,
    onGameVariableApplied,
  ]);

  const renderTriggerInfo = () => {
    if (!selectedRule) return null;
    const trigger = getTrigger(selectedRule.trigger);
    if (!trigger) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-trigger/20 to-transparent border border-trigger/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-trigger/20 rounded-lg flex items-center justify-center">
              <EyeIcon className="h-5 w-5 text-trigger" />
            </div>
            <div>
              <h4 className="text-trigger font-medium text-lg">
                {trigger.label[itemType]}
              </h4>
              <span className="text-white-darker text-xs uppercase tracking-wider">
                Trigger Event ({itemType})
              </span>
            </div>
          </div>
          <p className="text-white-light text-sm leading-relaxed">
            {trigger.description[itemType]}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <div className="text-white-light text-sm font-medium mb-1">
              Conditions
            </div>
            <div className="text-mint text-2xl font-bold">
              {selectedRule.conditionGroups.reduce(
                (total, group) => total + group.conditions.length,
                0
              )}
            </div>
          </div>
          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <div className="text-white-light text-sm font-medium mb-1">
              Effects
            </div>
            <div className="text-mint text-2xl font-bold">
              {selectedRule.effects.length +
                selectedRule.randomGroups.reduce(
                  (sum, group) => sum + group.effects.length,
                  0
                ) +
                selectedRule.loops.reduce(
                  (sum, group) => sum + group.effects.length,
                  0
                )}
            </div>
          </div>
          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <div className="text-white-light text-sm font-medium mb-1">
              Random Groups
            </div>
            <div className="text-mint text-2xl font-bold">
              {selectedRule.randomGroups.length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConditionEditor = () => {
    if (!selectedCondition || !selectedRule) return null;
    const conditionType = getConditionType(selectedCondition.type);
    if (!conditionType) return null;

    const paramsToRender = conditionType.params.filter((param) => {
      if (!hasShowWhen(param)) return true;
      const { parameter, values } = param.showWhen;
      const parentValue = selectedCondition.params[parameter];
      return values.includes(parentValue as string) && !param.exemptObjects?.includes(itemType);
    });

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-condition/20 to-transparent border border-condition/30 rounded-lg p-4 relative">
          <button
            onClick={() =>
              onUpdateCondition(selectedRule.id, selectedCondition.id, {
                negate: !selectedCondition.negate,
              })
            }
            className={`absolute top-4 right-4 p-2 rounded-lg border-2 transition-colors cursor-pointer z-10 ${
              selectedCondition.negate
                ? "bg-balatro-red/20 border-balatro-red text-balatro-red"
                : "bg-black-darker border-black-lighter text-white-darker hover:border-balatro-red hover:text-balatro-red"
            }`}
            title={
              selectedCondition.negate ? "Remove negation" : "Negate condition"
            }
          >
            <NoSymbolIcon className="h-4 w-4 text-balatro-red" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-condition/20 rounded-lg flex items-center justify-center">
              <InformationCircleIcon className="h-5 w-5 text-condition" />
            </div>
            <div className="flex-1 pr-12">
              <h4 className="text-condition font-medium text-lg">
                {conditionType.label}
              </h4>
              <span className="text-white-darker text-xs uppercase tracking-wider">
                Condition Logic ({itemType})
              </span>
            </div>
          </div>
          <p className="text-white-light text-sm leading-relaxed">
            {conditionType.description}
          </p>
        </div>

        {paramsToRender.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-condition rounded-full"></div>
              Parameters
            </h5>
            {paramsToRender.map((param) => (
              <div
                key={param.id}
                className="bg-black-darker border border-black-lighter rounded-lg p-3"
              >
                <ParameterField
                  param={param}
                  value={selectedCondition.params[param.id]}
                  selectedRule={selectedRule}
                  onChange={(value) => {
                    const newParams = {
                      ...selectedCondition.params,
                      [param.id]: value,
                    };
                    onUpdateCondition(selectedRule.id, selectedCondition.id, {
                      params: newParams,
                    });
                  }}
                  parentValues={selectedCondition.params}
                  availableVariables={availableVariables}
                  onCreateVariable={handleCreateVariable}
                  onOpenVariablesPanel={onToggleVariablesPanel}
                  onOpenGameVariablesPanel={onToggleGameVariablesPanel}
                  selectedGameVariable={selectedGameVariable}
                  onGameVariableApplied={onGameVariableApplied}
                  isEffect={false}
                  joker={joker}
                  itemType={itemType}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRandomGroupEditor = () => {
    if (!selectedRandomGroup || !selectedRule) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-mint/20 to-transparent border border-mint/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-mint/20 rounded-lg flex items-center justify-center">
              <PercentBadgeIcon className="h-5 w-5 text-mint" />
            </div>
            <div>
              <h4 className="text-mint font-medium text-lg">Random Group</h4>
              <span className="text-white-darker text-xs uppercase tracking-wider">
                Chance-Based Effects
              </span>
            </div>
          </div>
          <p className="text-white-light text-sm leading-relaxed">
            Effects in this group will all be triggered together if the random
            chance succeeds.
          </p>
        </div>

        <div className="space-y-3">
          <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-mint rounded-full"></div>
            Chance Configuration
          </h5>

          <div className="bg-mint/10 border border-mint/30 rounded-lg p-4">
            <div className="flex flex-col items-center gap-4">
              <ChanceInput
                key="numerator"
                label="Numerator"
                value={selectedRandomGroup.chance_numerator}
                onChange={(value) => {
                  onUpdateRandomGroup(selectedRule.id, selectedRandomGroup.id, {
                    chance_numerator: value,
                  });
                }}
                availableVariables={availableVariables}
                onCreateVariable={handleCreateVariable}
                onOpenVariablesPanel={onToggleVariablesPanel}
                onOpenGameVariablesPanel={onToggleGameVariablesPanel}
                selectedGameVariable={selectedGameVariable}
                onGameVariableApplied={onGameVariableApplied}
                itemType={itemType}
              />
              <span className="text-white-light text-sm">in</span>
              <ChanceInput
                key="denominator"
                label="Denominator"
                value={selectedRandomGroup.chance_denominator}
                onChange={(value) => {
                  onUpdateRandomGroup(selectedRule.id, selectedRandomGroup.id, {
                    chance_denominator: value,
                  });
                }}
                availableVariables={availableVariables}
                onCreateVariable={handleCreateVariable}
                onOpenVariablesPanel={onToggleVariablesPanel}
                onOpenGameVariablesPanel={onToggleGameVariablesPanel}
                selectedGameVariable={selectedGameVariable}
                onGameVariableApplied={onGameVariableApplied}
                itemType={itemType}
              />
            </div>
          </div>
          <div className="space-y-3">
            <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-mint rounded-full"></div>
              Advanced Configuration
            </h5>

            <div className="bg-mint/10 border border-mint/30 rounded-lg p-4">
              <div className="flex flex-col items-center gap-4">
                <div className="space-y-6 p-2">
                  <Checkbox
                    id="respect_probability_effects"
                    label="Affected by Probability Effects"
                    checked={
                      selectedRule.trigger === "change_probability"
                        ? false
                        : selectedRandomGroup.respect_probability_effects !==
                          false
                    }
                    disabled={selectedRule.trigger === "change_probability"}
                    onChange={(checked) => {
                      onUpdateRandomGroup(
                        selectedRule.id,
                        selectedRandomGroup.id,
                        {
                          respect_probability_effects: checked,
                        }
                      );
                    }}
                  />
                  <InputField
                    key="custom_key"
                    value={selectedRandomGroup.custom_key}
                    onChange={(e) => {
                      onUpdateRandomGroup(
                        selectedRule.id,
                        selectedRandomGroup.id,
                        {
                          custom_key: e.target.value,
                        }
                      );
                    }}
                    placeholder={(() => {
                      let classPrefix: string;
                      let key: string;
                      switch (itemType) {
                        case "joker":
                          classPrefix = "j";
                          key = joker.objectKey || "";
                          break;
                        case "consumable":
                          classPrefix = "c";
                          // @ts-expect-error: The inspector can take more than JokerData
                          key = joker.consumableKey || "";
                          break;
                        case "card":
                          classPrefix = "m";
                          // @ts-expect-error: The inspector can take more than JokerData
                          key = joker.sealKey || joker.enhancementKey || "";
                          break;
                        default:
                          classPrefix = "j";
                          key = joker.objectKey || "";
                      }
                      const modPrefix = getModPrefix();

                      return `${classPrefix}_${modPrefix}_${key}`;
                    })()}
                    label="Custom Probability key"
                    type="text"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <div className="text-white-light text-sm font-medium mb-2">
              Effects in this group
            </div>
            <div className="text-mint text-lg font-bold">
              {selectedRandomGroup.effects.length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLoopGroupEditor = () => {
    if (!selectedLoopGroup || !selectedRule) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-balatro-blue/20 to-transparent border border-balatro-blue/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-balatro-blue/20 rounded-lg flex items-center justify-center">
              <PlayCircleIcon className="h-5 w-5 text-balatro-blue" />
            </div>
            <div>
              <h4 className="text-balatro-blue font-medium text-lg">
                Loop Group
              </h4>
              <span className="text-white-darker text-xs uppercase tracking-wider">
                Repeat Effects
              </span>
            </div>
          </div>
          <p className="text-white-light text-sm leading-relaxed">
            Effects in this group will all be triggered together for the amount
            of repetitions you set.
          </p>
        </div>

        <div className="space-y-3">
          <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-balatro-blue rounded-full"></div>
            Loop Configuration
          </h5>

          <div className="bg-balatro-blue/10 border border-balatro-blue/30 rounded-lg p-4">
            <div className="flex flex-col items-center gap-4">
              <span className="text-white-light text-sm">Loop</span>
              <ChanceInput
                key="repetitions"
                label=""
                value={selectedLoopGroup.repetitions}
                onChange={(value) => {
                  onUpdateLoopGroup(selectedRule.id, selectedLoopGroup.id, {
                    repetitions: value,
                  });
                }}
                availableVariables={availableVariables}
                onCreateVariable={handleCreateVariable}
                onOpenVariablesPanel={onToggleVariablesPanel}
                onOpenGameVariablesPanel={onToggleGameVariablesPanel}
                selectedGameVariable={selectedGameVariable}
                onGameVariableApplied={onGameVariableApplied}
                itemType={itemType}
              />
              <span className="text-white-light text-sm">Time(s)</span>
            </div>
          </div>

          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <div className="text-white-light text-sm font-medium mb-2">
              Effects in this group
            </div>
            <div className="text-balatro-blue text-lg font-bold">
              {selectedLoopGroup.effects.length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEffectEditor = () => {
    if (!selectedEffect || !selectedRule) return null;
    const effectType = getEffectType(selectedEffect.type);
    if (!effectType) return null;

    const paramsToRender = effectType.params.filter((param) => {
      if (param.type == "checkbox") {
        let index = 0
        param.checkboxOptions?.map(box => {
          const checklist = selectedEffect.params[param.id] as Array<boolean>
          if (checklist) {
          box.checked = !checklist[index] ? false : true
          index += 1
        }})
      }

      if (!hasShowWhen(param)) return true;

      const { parameter, values } = param.showWhen;
      const parentValue = selectedEffect.params[parameter];
      if (Array.isArray(parentValue) && typeof parentValue[0] === "boolean") {
        if (!values.some(value => parentValue[parseFloat(value)])) {
          return null;
        } else return true
      } else if (typeof parentValue === "string") {
        if (!values.includes(parentValue)) {
          return null;
        } else return true
      } else return null
    })



    const isInRandomGroup = selectedRule.randomGroups.some((group) =>
      group.effects.some((effect) => effect.id === selectedEffect.id)
    );
    const isInLoopGroup = selectedRule.loops.some((group) =>
      group.effects.some((effect) => effect.id === selectedEffect.id)
    );

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-effect/20 to-transparent border border-effect/30 rounded-lg p-4 relative">
          {!isInRandomGroup && !isInLoopGroup && (
            <button
              onClick={() =>
                onCreateRandomGroupFromEffect(
                  selectedRule.id,
                  selectedEffect.id
                )
              }
              className="absolute top-4 right-4 p-2 rounded-lg border-2 transition-colors cursor-pointer z-10 bg-black-darker border-mint text-mint hover:bg-mint/20"
              title="Create Random Group"
            >
              <PercentBadgeIcon className="h-4 w-4" />
            </button>
          )}
          {!isInRandomGroup && !isInLoopGroup && (
            <button
              onClick={() =>
                onCreateLoopGroupFromEffect(selectedRule.id, selectedEffect.id)
              }
              className="absolute top-4 right-16 p-2 rounded-lg border-2 transition-colors cursor-pointer z-10 bg-black-darker border-balatro-blue text-balatro-blue hover:bg-balatro-blue/20"
              title="Create Loop Group"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-effect/20 rounded-lg flex items-center justify-center">
              <InformationCircleIcon className="h-5 w-5 text-effect" />
            </div>
            <div className="flex-1 pr-12">
              <h4 className="text-effect font-medium text-lg">
                {effectType.label}
              </h4>
              <span className="text-white-darker text-xs uppercase tracking-wider">
                Effect Action ({itemType})
              </span>
            </div>
          </div>
          <p className="text-white-light text-sm leading-relaxed">
            {effectType.description}
          </p>
        </div>

        <div className="space-y-3">
          <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-effect rounded-full"></div>
            Custom Message
          </h5>
          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <InputField
              label="Message"
              value={selectedEffect.customMessage || ""}
              onChange={(e) => {
                const value = e.target.value;
                const validation = validateCustomMessage(value);

                if (validation.isValid) {
                  setCustomMessageValidationError("");
                } else {
                  setCustomMessageValidationError(
                    validation.error || "Invalid message"
                  );
                }

                onUpdateEffect(selectedRule.id, selectedEffect.id, {
                  customMessage: value || undefined,
                });
              }}
              placeholder="Leave blank for default message"
              size="sm"
            />
            {customMessageValidationError && (
              <div className="flex items-center gap-2 mt-1 text-balatro-red text-sm">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>{customMessageValidationError}</span>
              </div>
            )}
          </div>
        </div>

        {paramsToRender.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-effect rounded-full"></div>
              Parameters
            </h5>
            {paramsToRender.map((param) => (
              <div
                key={param.id}
                className="bg-black-darker border border-black-lighter rounded-lg p-3"
              >
                <ParameterField
                  param={param}
                  value={selectedEffect.params[param.id]}
                  selectedRule={selectedRule}
                  onChange={(value) => { 
                    if (param.type == "checkbox"){
                      value = param.checkboxOptions?.map(box => box.checked ? true : false) 
                    }
                    const newParams = {
                      ...selectedEffect.params,
                      [param.id]: value,
                    };
                    onUpdateEffect(selectedRule.id, selectedEffect.id, {
                      params: newParams,
                    });
                }}
                  parentValues={selectedEffect.params}
                  availableVariables={availableVariables}
                  onCreateVariable={handleCreateVariable}
                  onOpenVariablesPanel={onToggleVariablesPanel}
                  onOpenGameVariablesPanel={onToggleGameVariablesPanel}
                  selectedGameVariable={selectedGameVariable}
                  onGameVariableApplied={onGameVariableApplied}
                  isEffect={true}
                  joker={joker}
                  itemType={itemType}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-96 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl max-h-[calc(100vh-6rem)] z-40 flex flex-col"
    >
      <div
        className="flex items-center justify-between p-3 border-b border-black-lighter cursor-grab active:cursor-grabbing flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <Bars3Icon className="h-4 w-4 text-white-darker" />
          <ChartPieIcon className="h-5 w-5 text-white-light" />
          <h3 className="text-white-light text-sm font-medium tracking-wider">
            Inspector ({itemType})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto custom-scrollbar min-h-0 flex-1">
        <div className="w-1/4 h-[1px] bg-black-lighter mx-auto mb-6"></div>

        {!selectedRule && (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <InformationCircleIcon className="h-12 w-12 text-white-darker mx-auto mb-3 opacity-50" />
              <p className="text-white-darker text-sm">
                Select a rule to view its properties
              </p>
            </div>
          </div>
        )}

        {selectedRule &&
          !selectedCondition &&
          !selectedEffect &&
          !selectedRandomGroup &&
          !selectedLoopGroup &&
          renderTriggerInfo()}
        {selectedCondition && renderConditionEditor()}
        {selectedEffect && renderEffectEditor()}
        {selectedRandomGroup && renderRandomGroupEditor()}
        {selectedLoopGroup && renderLoopGroupEditor()}
      </div>
    </div>
  );
};

export default Inspector;
