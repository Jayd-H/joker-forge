import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { ConsumableData, UserVariable } from "../data/BalatroUtils";
import { getVariableUsageDetails } from "../codeGeneration/lib/userVariableUtils";
import {
  SUITS,
  RANKS,
  POKER_HANDS,
  SUIT_VALUES,
  POKER_HAND_VALUES,
} from "../data/BalatroUtils";
import {
  CommandLineIcon,
  XMarkIcon,
  Bars3Icon,
  ExclamationTriangleIcon,
  HashtagIcon,
  SparklesIcon,
  CubeIcon,
  RectangleStackIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import InputField from "../generic/InputField";
import InputDropdown from "../generic/InputDropdown";
import Button from "../generic/Button";
import { validateVariableName } from "../generic/validationUtils";
import { ItemData } from "./RuleBuilder";
import { SlashIcon } from "@heroicons/react/24/outline";

interface VariablesProps {
  position: { x: number; y: number };
  item: Exclude<ItemData, ConsumableData>;
  onUpdateItem: (updates: Partial<ItemData>) => void;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const SUIT_OPTIONS = SUITS.map((suit) => ({
  value: suit.value,
  label: `${suit.label}`,
}));

const RANK_OPTIONS = RANKS.map((rank) => ({
  value: rank.label,
  label: rank.label,
}));

const POKER_HAND_OPTIONS = POKER_HANDS.map((hand) => ({
  value: hand.value,
  label: hand.label,
}));

const VARIABLE_TYPE_OPTIONS = [
  { value: "number", label: "Number Variable", icon: HashtagIcon },
  { value: "suit", label: "Suit Variable", icon: SparklesIcon },
  { value: "rank", label: "Rank Variable", icon: CubeIcon },
  {
    value: "pokerhand",
    label: "Poker Hand Variable",
    icon: HandRaisedIcon,
  },
  {
    value: "key",
    label: "Key Variable",
    icon: RectangleStackIcon,
  },
  { value: "text", label: "Text Variable", icon: SlashIcon },
];

type SuitValue = (typeof SUIT_VALUES)[number];
type RankLabel =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "Jack"
  | "Queen"
  | "King"
  | "Ace";
type PokerHandValue = (typeof POKER_HAND_VALUES)[number];


const Variables: React.FC<VariablesProps> = ({
  position,
  item,
  onUpdateItem,
  onClose,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const [newVariableType, setNewVariableType] = useState<
    "number" | "suit" | "rank" | "pokerhand" | "key" | "text"
  >("number");
  const [newVariableName, setNewVariableName] = useState("");
  const [newVariableValue, setNewVariableValue] = useState("0");
  const [newVariableSuit, setNewVariableSuit] = useState<SuitValue>(
    SUIT_VALUES[0]
  );
  const [newVariableRank, setNewVariableRank] = useState<RankLabel>("Ace");
  const [newVariablePokerHand, setNewVariablePokerHand] =
    useState<PokerHandValue>(POKER_HAND_VALUES[0]);
  const [newVariableKey, setNewVariableKey] = useState<string>("none");
  const [newVariableText, setNewVariableText] = useState<string>("Hello");

  const [nameValidationError, setNameValidationError] = useState<string>("");
  const [editValidationError, setEditValidationError] = useState<string>("");

  const [editingType, setEditingType] = useState<
    "number" | "suit" | "rank" | "pokerhand" | "key" | "text"
  >("number");
  const [editingName, setEditingName] = useState("");
  const [editingValue, setEditingValue] = useState(0);
  const [editingSuit, setEditingSuit] = useState<SuitValue>(SUIT_VALUES[0]);
  const [editingRank, setEditingRank] = useState<RankLabel>("Ace");
  const [editingJoker, setEditingJoker] = useState<string>("j_joker");
  const [editingText, setEditingText] = useState<string>("Hello");
  const [editingPokerHand, setEditingPokerHand] = useState<PokerHandValue>(
    POKER_HAND_VALUES[0]
  );

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "panel-variables",
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

  const usageDetails = useMemo(() => getVariableUsageDetails(item), [item]);
  const userVariables =
    "userVariables" in item &&
    Array.isArray((item as { userVariables: UserVariable[] }).userVariables)
      ? (item as { userVariables: UserVariable[] }).userVariables
      : [];

  const getUsageInfo = (variableName: string) => {
    const usages = usageDetails.filter(
      (usage) => usage.variableName === variableName
    );
    const ruleNumbers = [...new Set(usages.map((usage) => usage.ruleIndex))];
    return {
      count: usages.length,
      rules: ruleNumbers,
    };
  };

  const validateNewVariableName = (name: string) => {
    const validation = validateVariableName(name.trim());
    if (!validation.isValid) {
      setNameValidationError(validation.error || "Invalid variable name");
      return false;
    }

    const existingNames = userVariables.map((v: UserVariable) =>
      v.name.toLowerCase()
    );
    if (existingNames.includes(name.trim().toLowerCase())) {
      setNameValidationError("Variable name already exists");
      return false;
    }

    setNameValidationError("");
    return true;
  };

  const validateEditVariableName = (
    name: string,
    currentVariableId: string
  ) => {
    const validation = validateVariableName(name);
    if (!validation.isValid) {
      setEditValidationError(validation.error || "Invalid variable name");
      return false;
    }

    const existingNames = userVariables
      .filter((v: UserVariable) => v.id !== currentVariableId)
      .map((v: UserVariable) => v.name.toLowerCase());

    if (existingNames.includes(name.toLowerCase())) {
      setEditValidationError("Variable name already exists");
      return false;
    }

    setEditValidationError("");
    return true;
  };

  const handleAddVariable = () => {
    if (!validateNewVariableName(newVariableName)) {
      return;
    }

    const newVariable: UserVariable = {
      id: crypto.randomUUID(),
      name: newVariableName.trim(),
      type: newVariableType,
    };

    if (newVariableType === "number") {
      newVariable.initialValue = parseFloat(newVariableValue) || 0;
    } else if (newVariableType === "key") {
      newVariable.initialKey = newVariableKey;
    }else if (newVariableType === "suit") {
      newVariable.initialSuit = newVariableSuit;
    } else if (newVariableType === "rank") {
      newVariable.initialRank = newVariableRank;
    } else if (newVariableType === "pokerhand") {
      newVariable.initialPokerHand = newVariablePokerHand;
    } else if (newVariableType === "text") {
      newVariable.initialText = newVariableText;
    }

    const updatedVariables = [...userVariables, newVariable];
    onUpdateItem({ userVariables: updatedVariables });

    setNewVariableName("");
    setNewVariableValue("0");
    setNewVariableSuit(SUIT_VALUES[0]);
    setNewVariableRank("Ace");
    setNewVariablePokerHand(POKER_HAND_VALUES[0]);
    setNewVariableKey("none");
    setNewVariableText("Hello");
    setNewVariableType("number");
    setNameValidationError("");
    setShowAddForm(false);
  };

  const handleDeleteVariable = (variableId: string) => {
    const updatedVariables = userVariables.filter(
      (v: UserVariable) => v.id !== variableId
    );
    onUpdateItem({ userVariables: updatedVariables });
  };

  const handleStartEdit = (variable: UserVariable) => {
    setEditingVariable(variable.id);
    setEditingName(variable.name);
    setEditingType(variable.type || "number");
    setEditingValue(variable.initialValue || 0);
    setEditingText(variable.initialText || "");
    setEditingSuit((variable.initialSuit as SuitValue) || SUIT_VALUES[0]);
    setEditingRank((variable.initialRank as RankLabel) || "Ace");
    setEditingPokerHand(
      (variable.initialPokerHand) || POKER_HAND_VALUES[0]
    );
    setEditingJoker((variable.initialKey as string) || "j_joker");
    setEditValidationError("");
  };

  const handleSaveEdit = (variableId: string) => {
    if (!validateEditVariableName(editingName, variableId)) {
      return;
    }

    const updatedVariable: UserVariable = {
      id: variableId,
      name: editingName,
      type: editingType,
    };

    if (editingType === "number") {
      updatedVariable.initialValue = editingValue;
    } else if (editingType === "key") {
      updatedVariable.initialKey = editingJoker;
    } else if (editingType === "suit") {
      updatedVariable.initialSuit = editingSuit;
    } else if (editingType === "rank") {
      updatedVariable.initialRank = editingRank;
    } else if (editingType === "pokerhand") {
      updatedVariable.initialPokerHand = editingPokerHand;
    } else if (editingType === "text") {
      updatedVariable.initialText = editingText;
    }

    const updatedVariables = userVariables.map((v: UserVariable) =>
      v.id === variableId ? updatedVariable : v
    );
    onUpdateItem({ userVariables: updatedVariables });
    setEditingVariable(null);
    setEditValidationError("");
  };

  const handleCancelEdit = () => {
    setEditingVariable(null);
    setEditValidationError("");
  };

  const getVariableDisplayValue = (variable: UserVariable) => {
    if (variable.type === "suit") {
      const suit = variable.initialSuit || SUIT_VALUES[0];
      return suit;
    } else if (variable.type === "text") {
      const text = variable.initialText || "Hello";
      return text;
    } else if (variable.type === "rank") {
      const rank = variable.initialRank || "Ace";
      return rank;
    } else if (variable.type === "pokerhand") {
      const pokerHand = variable.initialPokerHand || POKER_HAND_VALUES[0];
      return pokerHand;
    } else if (variable.type === "key") {
      const pokerHand = variable.initialKey || "j_joker";
      return pokerHand;
    } else {
      return variable.initialValue?.toString() || "0";
    }
  };

  const getVariableIcon = (
    type: "number" | "suit" | "rank" | "pokerhand" | "key" | "text" | undefined
  ) => {
    switch (type) {
      case "suit":
        return SparklesIcon;
      case "rank":
        return CubeIcon;
      case "pokerhand":
        return RectangleStackIcon;
      default:
        return HashtagIcon;
    }
  };

  const getVariableColor = (
    type: "number" | "suit" | "rank" | "pokerhand" | "key" | "text" | undefined
  ) => {
    switch (type) {
      case "suit":
        return "text-purple-400";
      case "rank":
        return "text-blue-400";
      case "pokerhand":
        return "text-green-400";
      default:
        return "text-mint";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-80 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl z-40"
    >
      <div
        className="flex items-center justify-between p-4 border-b border-black-lighter cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-3">
          <Bars3Icon className="h-4 w-4 text-white-darker" />
          <CommandLineIcon className="h-5 w-5 text-white-light" />
          <div>
            <h3 className="text-white-light text-sm font-medium tracking-wider">
              Variables
            </h3>
            <p className="text-white-darker text-xs">
              {userVariables.length} variable
              {userVariables.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2 mb-4">
          {userVariables.length === 0 && !showAddForm ? (
            <div className="text-center py-8">
              <CommandLineIcon className="h-12 w-12 text-white-darker mx-auto mb-3 opacity-50" />
              <p className="text-white-darker text-sm">
                No variables created yet
              </p>
              <p className="text-white-darker text-xs mt-1">
                Create variables to store and modify values in your joker
              </p>
            </div>
          ) : (
            userVariables.map((variable) => {
              const usageInfo = getUsageInfo(variable.name);
              const isEditing = editingVariable === variable.id;
              const VariableIcon = getVariableIcon(variable.type);
              const colorClass = getVariableColor(variable.type);

              return (
                <div
                  key={variable.id}
                  className="bg-black-darker border border-black-lighter rounded-lg p-3"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <InputField
                          value={editingName}
                          onChange={(e) => {
                            setEditingName(e.target.value);
                            if (editValidationError) {
                              validateEditVariableName(
                                e.target.value,
                                variable.id
                              );
                            }
                          }}
                          label="Name"
                          size="sm"
                        />
                        {editValidationError && (
                          <div className="flex items-center gap-2 mt-1 text-balatro-red text-sm">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>{editValidationError}</span>
                          </div>
                        )}
                      </div>

                      <InputDropdown
                        label="Type"
                        value={editingType}
                        onChange={(value) =>
                          setEditingType(
                            value as "number" | "suit" | "rank" | "pokerhand" | "key" | "text"
                          )
                        }
                        options={VARIABLE_TYPE_OPTIONS}
                        size="sm"
                      />

                      {editingType === "number" && (
                        <InputField
                          value={editingValue.toString()}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setEditingValue(value);
                          }}
                          type="number"
                          label="Initial Value"
                          size="sm"
                        />
                      )}

                      {editingType === "key" && (
                        <InputField
                          value={editingJoker.toString()}
                          onChange={(e) => {
                            const value = (e.target.value) || "j_joker";
                            setEditingJoker(value as string)
                          }}
                          type="string"
                          label="Initial Joker"
                          size="sm"
                        />
                      )}

                      {editingType === "suit" && (
                        <InputDropdown
                          label="Initial Suit"
                          value={editingSuit}
                          onChange={(value) =>
                            setEditingSuit(value as SuitValue)
                          }
                          options={SUIT_OPTIONS}
                          size="sm"
                        />
                      )}

                      {editingType === "rank" && (
                        <InputDropdown
                          label="Initial Rank"
                          value={editingRank}
                          onChange={(value) =>
                            setEditingRank(value as RankLabel)
                          }
                          options={RANK_OPTIONS}
                          size="sm"
                        />
                      )}

                      {editingType === "pokerhand" && (
                        <InputDropdown
                          label="Initial Poker Hand"
                          value={editingPokerHand}
                          onChange={(value) =>
                            setEditingPokerHand(value as PokerHandValue)
                          }
                          options={POKER_HAND_OPTIONS}
                          size="sm"
                        />
                      )}

                      {editingType === "text" && (
                        <InputField
                          value={editingText.toString()}
                          onChange={(e) => {
                            const value = (e.target.value) || "Hello";
                            setEditingText(value as string)
                          }}
                          type="string"
                          label="Initial Text"
                          size="sm"
                        />
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveEdit(variable.id)}
                          disabled={!!editValidationError}
                          className="cursor-pointer flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="cursor-pointer"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <VariableIcon className={`h-4 w-4 ${colorClass}`} />
                          <span
                            className={`text-sm font-mono font-medium ${colorClass}`}
                          >
                            ${variable.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(variable)}
                            className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteVariable(variable.id)}
                            className="p-1 text-balatro-red hover:text-white transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white-darker">
                          {variable.type === "number" ? "Initial:" : "Value:"}{" "}
                          {getVariableDisplayValue(variable)}
                        </span>
                        {usageInfo.count > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-white-darker text-xs">
                              Used in:
                            </span>
                            {usageInfo.rules.map((ruleNum) => (
                              <span
                                key={ruleNum}
                                className={
                                  "bg-opacity-20 text-xs px-1.5 py-0.5 rounded text-white"
                                }
                              >
                                {ruleNum + 1}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {showAddForm && (
            <div className="bg-black-darker border-2 border-mint/50 rounded-lg p-3">
              <div className="space-y-3">
                <div>
                  <InputField
                    value={newVariableName}
                    onChange={(e) => {
                      setNewVariableName(e.target.value);
                      validateNewVariableName(e.target.value);
                    }}
                    placeholder="myVariable"
                    label="Name"
                    size="sm"
                  />
                  {nameValidationError && (
                    <div className="flex items-center gap-2 mt-1 text-balatro-red text-sm">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span>{nameValidationError}</span>
                    </div>
                  )}
                </div>

                <InputDropdown
                  label="Type"
                  value={newVariableType}
                  onChange={(value) =>
                    setNewVariableType(
                      value as "number" | "suit" | "rank" | "pokerhand" | "key" | "text"
                    )
                  }
                  options={VARIABLE_TYPE_OPTIONS}
                  size="sm"
                />

                {newVariableType === "number" && (
                  <InputField
                    value={newVariableValue}
                    onChange={(e) => setNewVariableValue(e.target.value)}
                    placeholder="0"
                    label="Initial Value"
                    type="number"
                    size="sm"
                  />
                )}

                {newVariableType === "key" && (
                  <InputField
                    value={newVariableKey}
                    onChange={(e) => setNewVariableKey(e.target.value)}
                    placeholder="none"
                    label="Initial Key"
                    type="string"
                    size="sm"
                  />
                )}

                {newVariableType === "text" && (
                  <InputField
                    value={newVariableText}
                    onChange={(e) => setNewVariableText(e.target.value)}
                    placeholder="Hello"
                    label="Initial Text"
                    type="string"
                    size="sm"
                  />
                )}

                {newVariableType === "suit" && (
                  <InputDropdown
                    label="Initial Suit"
                    value={newVariableSuit}
                    onChange={(value) => setNewVariableSuit(value as SuitValue)}
                    options={SUIT_OPTIONS}
                    size="sm"
                  />
                )}

                {newVariableType === "rank" && (
                  <InputDropdown
                    label="Initial Rank"
                    value={newVariableRank}
                    onChange={(value) => setNewVariableRank(value as RankLabel)}
                    options={RANK_OPTIONS}
                    size="sm"
                  />
                )}

                {newVariableType === "pokerhand" && (
                  <InputDropdown
                    label="Initial Poker Hand"
                    value={newVariablePokerHand}
                    onChange={(value) =>
                      setNewVariablePokerHand(value as PokerHandValue)
                    }
                    options={POKER_HAND_OPTIONS}
                    size="sm"
                  />
                )}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddVariable}
                    disabled={!newVariableName.trim() || !!nameValidationError}
                    className="cursor-pointer flex-1"
                  >
                    Create
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewVariableName("");
                      setNewVariableValue("0");
                      setNewVariableSuit(SUIT_VALUES[0]);
                      setNewVariableRank("Ace");
                      setNewVariableText("Hello");
                      setNewVariableKey("none");
                      setNewVariablePokerHand(POKER_HAND_VALUES[0]);
                      setNewVariableType("number");
                      setNameValidationError("");
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!showAddForm && (
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => setShowAddForm(true)}
            icon={<PlusIcon className="h-4 w-4" />}
            className="cursor-pointer"
          >
            Add Variable
          </Button>
        )}
      </div>
    </div>
  );
};

export default Variables;
