import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import type {
  EffectTypeDefinition,
  Rule,
  Condition,
  Effect,
  RandomGroup,
  ConditionTypeDefinition,
  LoopGroup,
  SelectedItem,
} from "./types";
import RuleCard from "./RuleCard";
import FloatingDock from "./FloatingDock";
import BlockPalette from "./BlockPalette";
import Variables from "./Variables";
import Inspector from "./Inspector";
import Button from "../generic/Button";
import {
  CheckCircleIcon,
  ArrowsPointingInIcon,
  WindowIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { getConditionTypeById } from "../data/Jokers/Conditions";
import { getEffectTypeById } from "../data/Jokers/Effects";
import GameVariables from "./GameVariables";
import { GameVariable } from "../data/Jokers/GameVars";
import { motion } from "framer-motion";
import { getConsumableConditionTypeById } from "../data/Consumables/Conditions";
import { getConsumableEffectTypeById } from "../data/Consumables/Effects";
import {
  JokerData,
  ConsumableData,
  EnhancementData,
  SealData,
  EditionData,
} from "../data/BalatroUtils";
import { getCardConditionTypeById } from "../data/Card/Conditions";
import { getCardEffectTypeById } from "../data/Card/Effects";
import { UserConfigContext } from "../Contexts";

export type ItemData =
  | JokerData
  | ConsumableData
  | EnhancementData
  | SealData
  | EditionData;
type ItemType = "joker" | "consumable" | "card";

interface RuleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: Rule[]) => void;
  existingRules: Rule[];
  item: ItemData;
  onUpdateItem: (updates: Partial<ItemData>) => void;
  itemType: ItemType;
}

interface PanelState {
  id: string;
  isVisible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  positionSet: boolean;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRules = [],
  item,
  onUpdateItem,
  itemType,
}) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext);

  const [activeId, setActiveId] = useState<string | null>(null);

  const [inspectorIsOpen, setInspectorIsOpen] = useState(false);

  const [isFirstSelection, setIsFirstSelection] = useState(true);

  const getConditionType =
    itemType === "joker"
      ? getConditionTypeById
      : itemType === "consumable"
      ? getConsumableConditionTypeById
      : getCardConditionTypeById;
  const getEffectType =
    itemType === "joker"
      ? getEffectTypeById
      : itemType === "consumable"
      ? getConsumableEffectTypeById
      : getCardEffectTypeById;

  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [panState, setPanState] = useState({ x: 0, y: 0, scale: 1 });
  const [backgroundOffset, setBackgroundOffset] = useState({ x: 0, y: 0 });
  const [gridSnapping, setGridSnapping] = useState<boolean>(
    userConfig.defaultGridSnap ?? false
  );
  const [panels, setPanels] = useState<Record<string, PanelState>>(() => {
    const basePanels = {
      blockPalette: {
        id: "blockPalette",
        isVisible: true,
        position: { x: 20, y: 20 },
        size: { width: 320, height: 1200 },
        positionSet: true,
      },
      jokerInfo: {
        id: "jokerInfo",
        isVisible: false,
        position: { x: 0, y: 0 },
        size: { width: 320, height: 200 },
        positionSet: false,
      },
      gameVariables: {
        id: "gameVariables",
        isVisible: false,
        position: { x: 20, y: 20 },
        size: { width: 320, height: 500 },
        positionSet: true,
      },
      inspector: {
        id: "inspector",
        isVisible: false,
        position: { x: 0, y: 0 },
        size: { width: 384, height: 600 },
        positionSet: false,
      },
    };

    // Only add variables panel for non-consumables
    if (itemType !== "consumable") {
      return {
        ...basePanels,
        variables: {
          id: "variables",
          isVisible: false,
          position: { x: 0, y: 0 },
          size: { width: 320, height: 300 },
          positionSet: false,
        },
      };
    }

    return basePanels;
  });

  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [showNoRulesMessage, setShowNoRulesMessage] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const [selectedGameVariable, setSelectedGameVariable] =
    useState<GameVariable | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSaveAndClose = useCallback(() => {
    onSave(rules);
    onClose();
  }, [onSave, onClose, rules]);

  const handleRecenter = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
      setPanState({ x: 0, y: 0, scale: 1 });
      setBackgroundOffset({ x: 0, y: 0 });
    }
  };

  const handleResetPosition = () => {
    rules.forEach((rule, index) => {
      rule.position = { x: 800 + index * 340, y: 300 };
    });
    handleRecenter(); // why would you look elsewhere if the windows are at the center
  };

  const getCenterPosition = () => {
    const screenCenterX =
      (typeof window !== "undefined" ? window.innerWidth : 1200) / 2;
    const screenCenterY =
      (typeof window !== "undefined" ? window.innerHeight : 800) / 2;
    const transformCenterX = screenCenterX - panState.x;
    const transformCenterY = screenCenterY - panState.y;
    return {
      x: transformCenterX - 160,
      y: transformCenterY - 200,
    };
  };

  const togglePanel = useCallback(
    (panelId: string) => {
      // Don't allow toggling variables panel for consumables
      if (panelId === "variables" && itemType === "consumable") {
        return;
      }

      setPanels((prev) => {
        const panel = prev[panelId];

        // If panel doesn't exist (like variables for consumables), do nothing
        if (!panel) {
          return prev;
        }

        const findPosition = (
          panels: Record<string, PanelState>,
          targetPanelId: string
        ): { x: number; y: number } => {
          const panelSize = panels[targetPanelId].size;
          const padding = 20;
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight - 100;

          const blockPalettePanel = panels["blockPalette"];
          const variablesPanel = panels["variables"];
          const gameVariablesPanel = panels["gameVariables"];

          const blockPaletteX = 20;
          const blockPaletteWidth = 320;
          const variablesHeight = 300;

          if (targetPanelId === "variables") {
            const baseX = blockPalettePanel?.isVisible
              ? blockPaletteX + blockPaletteWidth + padding
              : blockPaletteX;
            return {
              x: baseX,
              y: blockPaletteX,
            };
          }

          if (targetPanelId === "gameVariables") {
            const baseX = blockPalettePanel?.isVisible
              ? blockPaletteX + blockPaletteWidth + padding
              : blockPaletteX;
            return {
              x: baseX,
              y: blockPaletteX + variablesHeight + padding,
            };
          }

          if (targetPanelId === "blockPalette") {
            const variablesAtBlockPaletteX =
              variablesPanel?.isVisible &&
              variablesPanel.position.x === blockPaletteX;
            const gameVariablesAtBlockPaletteX =
              gameVariablesPanel?.isVisible &&
              gameVariablesPanel.position.x === blockPaletteX;

            if (variablesAtBlockPaletteX || gameVariablesAtBlockPaletteX) {
              return {
                x: blockPaletteX + blockPaletteWidth + padding,
                y: blockPaletteX,
              };
            }

            return {
              x: blockPaletteX,
              y: blockPaletteX,
            };
          }

          const positions = [
            { x: viewportWidth - panelSize.width - padding, y: padding },
            { x: padding, y: padding },
            {
              x: viewportWidth - panelSize.width - padding,
              y: viewportHeight - panelSize.height - padding,
            },
            { x: viewportWidth / 2 - panelSize.width / 2, y: padding },
            {
              x: viewportWidth / 2 - panelSize.width / 2,
              y: viewportHeight / 2 - panelSize.height / 2,
            },
          ];

          const hasOverlap = (
            position: { x: number; y: number },
            size: { width: number; height: number },
            excludePanelId: string
          ): boolean => {
            const rect1 = {
              left: position.x,
              top: position.y,
              right: position.x + size.width,
              bottom: position.y + size.height,
            };
            return Object.values(panels).some((panel) => {
              if (panel.id === excludePanelId || !panel.isVisible) return false;
              const rect2 = {
                left: panel.position.x,
                top: panel.position.y,
                right: panel.position.x + panel.size.width,
                bottom: panel.position.y + panel.size.height,
              };
              return !(
                rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom
              );
            });
          };

          for (const position of positions) {
            if (!hasOverlap(position, panelSize, targetPanelId)) {
              return position;
            }
          }

          return {
            x: Math.random() * 200 + padding,
            y: Math.random() * 200 + padding,
          };
        };

        const newState = {
          ...prev,
          [panelId]: {
            ...panel,
            isVisible: !panel.isVisible,
            position:
              panel.isVisible || panel.positionSet
                ? panel.position
                : findPosition(prev, panelId),
            positionSet: panel.positionSet || !panel.isVisible,
          },
        };
        return newState;
      });
    },
    [itemType]
  );

  useEffect(() => {
    if (isOpen) {
      setRules(
        existingRules.map((rule) => ({
          ...rule,
          randomGroups: rule.randomGroups || [],
        }))
      );
      setSelectedItem(null);
      setSelectedGameVariable(null);
      setIsInitialLoadComplete(true);
      setIsFirstSelection(true);

      // Reset the no rules message state
      setShowNoRulesMessage(false);

      // If there are no existing rules, delay showing the message
      if (existingRules.length === 0) {
        const timer = setTimeout(() => {
          setShowNoRulesMessage(true);
        }, 200); // 800ms delay

        return () => clearTimeout(timer);
      }
    } else {
      // Reset states when closing
      setIsInitialLoadComplete(false);
      setShowNoRulesMessage(false);
    }
  }, [isOpen, existingRules]);

  useEffect(() => {
    setSelectedGameVariable(null);
  }, [selectedItem]);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          modalRef.current &&
          !modalRef.current.contains(event.target as Node)
        ) {
          handleSaveAndClose();
        }
      };

      const handleKeyPress = (event: KeyboardEvent) => {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        switch (event.key.toLowerCase()) {
          case "b":
            togglePanel("blockPalette");
            break;
          case "i":
            togglePanel("jokerInfo");
            break;
          case "v":
            // Only allow variables panel for jokers
            if (itemType === "joker") {
              togglePanel("variables");
            }
            break;
          case "g":
            togglePanel("gameVariables");
            break;
          case "p":
            togglePanel("inspector");
            break;
          case "s":
            setGridSnapping((prev) => !prev);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyPress);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [isOpen, handleSaveAndClose, togglePanel, itemType]);

  useEffect(() => {
    if (!selectedItem) return;

    if (inspectorIsOpen) {
      if (!panels.inspector.isVisible) {
        togglePanel("inspector");
      }
      setInspectorIsOpen(false);
    } else if (isFirstSelection) {
      if (!panels.inspector.isVisible) {
        togglePanel("inspector");
      }
      setIsFirstSelection(false);
    }
  }, [
    selectedItem,
    inspectorIsOpen,
    isFirstSelection,
    panels.inspector.isVisible,
    togglePanel,
  ]);

  const updatePanelPosition = (
    panelId: string,
    position: { x: number; y: number }
  ) => {
    setPanels((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        position,
        positionSet: true,
      },
    }));
  };

  const generateAutoTitle = (
    item: Condition | Effect,
    typeDefinition: ConditionTypeDefinition | EffectTypeDefinition,
    isCondition: boolean
  ): string => {
    const baseLabel = typeDefinition.label;
    const params = item.params;

    if (!params || Object.keys(params).length === 0) {
      return baseLabel;
    }

    const prefix = isCondition ? "If " : "";
    const skipValues = [
      "none",
      "dont_change",
      "no_edition",
      "remove",
      "any",
      "specific",
    ];
    const processedParams = new Set<string>();

    let title = "";

    if (params.operator && params.value !== undefined) {
      const operatorMap: Record<string, string> = {
        equals: "=",
        not_equals: "≠",
        greater_than: ">",
        less_than: "<",
        greater_equals: "≥",
        less_equals: "≤",
      };
      const op =
        params.operator &&
        Object.prototype.hasOwnProperty.call(
          operatorMap,
          params.operator as string
        )
          ? operatorMap[params.operator as string]
          : params.operator;

      let valueDisplay = params.value;
      if (
        typeDefinition.id === "player_money" ||
        typeDefinition.id === "add_dollars"
      ) {
        valueDisplay = `$${params.value}`;
      }

      title = `${prefix}${baseLabel
        .replace("Player ", "")
        .replace("Remaining ", "")} ${op} ${valueDisplay}`;
      processedParams.add("operator");
      processedParams.add("value");
    } else if (params.value !== undefined && !params.operator) {
      title = `${prefix}${baseLabel} = ${params.value}`;
      processedParams.add("value");
    } else if (params.specific_rank || params.rank_group) {
      const rank = params.specific_rank || params.rank_group;
      title = `${prefix}Card Rank = ${rank}`;
      processedParams.add("specific_rank");
      processedParams.add("rank_group");
    } else if (params.specific_suit || params.suit_group) {
      const suit = params.specific_suit || params.suit_group;
      title = `${prefix}Card Suit = ${suit}`;
      processedParams.add("specific_suit");
      processedParams.add("suit_group");
    } else if (!isCondition && params.operation && params.value !== undefined) {
      const operationMap: { [key: string]: string } = {
        add: "+",
        subtract: "-",
        set: "Set to",
      };
      const op = operationMap[params.operation as string] || params.operation;
      const target = baseLabel
        .replace("Edit ", "")
        .replace("Add ", "")
        .replace("Apply ", "");
      title = `${op} ${params.value} ${target}`;
      processedParams.add("operation");
      processedParams.add("value");
    } else if (!isCondition) {
      if (params.value !== undefined && baseLabel.startsWith("Add")) {
        let valueDisplay = params.value;
        if (typeDefinition.id === "add_dollars") {
          valueDisplay = `$${params.value}`;
        }
        title = `Add ${valueDisplay} ${baseLabel.replace("Add ", "")}`;
        processedParams.add("value");
      } else if (params.value !== undefined && baseLabel.startsWith("Apply")) {
        title = `Apply ${params.value}x ${baseLabel
          .replace("Apply x", "")
          .replace("Apply ", "")}`;
        processedParams.add("value");
      } else if (params.repetitions !== undefined) {
        title = `Retrigger ${params.repetitions}x`;
        processedParams.add("repetitions");
      } else if (
        typeDefinition.id === "level_up_hand" &&
        params.value !== undefined
      ) {
        title = `Level Up Hand ${params.value}x`;
        processedParams.add("value");
      } else {
        title = baseLabel;
      }
    } else {
      title = baseLabel;
    }

    const additionalParams: string[] = [];

    Object.entries(params).forEach(([key, value]) => {
      if (
        processedParams.has(key) ||
        !value ||
        skipValues.includes(value as string)
      ) {
        return;
      }

      const stringValue = value as string;

      if (
        key === "suit" ||
        key === "rank" ||
        key === "enhancement" ||
        key === "seal" ||
        key === "edition"
      ) {
        if (stringValue === "random") {
          additionalParams.push("random " + key);
        } else {
          additionalParams.push(stringValue);
        }
      } else if (key === "joker_type" && stringValue === "random") {
        additionalParams.push("random joker");
      } else if (key === "joker_key" && stringValue !== "j_joker") {
        additionalParams.push(stringValue);
      } else if (key === "rarity" && stringValue !== "random") {
        additionalParams.push(stringValue);
      } else if (key === "is_negative" && stringValue === "negative") {
        additionalParams.push("negative");
      } else if (key === "tarot_card" && stringValue !== "random") {
        additionalParams.push(stringValue.replace("_", " "));
      } else if (key === "planet_card" && stringValue !== "random") {
        additionalParams.push(stringValue.replace("_", " "));
      } else if (key === "spectral_card" && stringValue !== "random") {
        additionalParams.push(stringValue.replace("_", " "));
      } else if (key === "consumable_type" && stringValue !== "random") {
        additionalParams.push(stringValue);
      } else if (key === "specific_card" && stringValue !== "random") {
        additionalParams.push(stringValue.replace("_", " "));
      } else if (key === "specific_tag") {
        additionalParams.push(stringValue.replace("_", " "));
      } else if (key === "selection_method" && stringValue !== "random") {
        additionalParams.push(stringValue + " selection");
      } else if (key === "position" && stringValue !== "first") {
        additionalParams.push(stringValue + " position");
      } else if (key === "hand_selection" && stringValue !== "current") {
        additionalParams.push(stringValue + " hand");
      } else if (key === "specific_hand") {
        additionalParams.push(stringValue.toLowerCase());
      } else if (key === "card_scope" && stringValue !== "scoring") {
        additionalParams.push(stringValue + " cards");
      } else if (key === "quantifier" && stringValue !== "all") {
        additionalParams.push(stringValue.replace("_", " "));
      } else if (key === "count" && !title.includes(stringValue)) {
        additionalParams.push(stringValue + " cards");
      } else if (key === "property_type") {
        additionalParams.push("by " + stringValue);
      } else if (key === "size_type" && stringValue !== "remaining") {
        additionalParams.push(stringValue);
      } else if (key === "blind_type") {
        additionalParams.push(stringValue + " blind");
      } else if (key === "card_index" && stringValue !== "any") {
        if (stringValue === "1") additionalParams.push("1st card");
        else if (stringValue === "2") additionalParams.push("2nd card");
        else if (stringValue === "3") additionalParams.push("3rd card");
        else if (stringValue === "4") additionalParams.push("4th card");
        else if (stringValue === "5") additionalParams.push("5th card");
        else additionalParams.push(stringValue + " card");
      } else if (key === "card_rank" && stringValue !== "any") {
        additionalParams.push("rank " + stringValue);
      } else if (key === "card_suit" && stringValue !== "any") {
        additionalParams.push("suit " + stringValue);
      } else if (
        key === "new_rank" ||
        key === "new_suit" ||
        key === "new_enhancement" ||
        key === "new_seal" ||
        key === "new_edition"
      ) {
        const cleanKey = key.replace("new_", "");
        additionalParams.push("→ " + cleanKey + " " + stringValue);
      }
    });

    if (additionalParams.length > 0) {
      title += ", " + additionalParams.join(", ");
    }

    return title;
  };

  const updateRulePosition = (
    ruleId: string,
    position: { x: number; y: number }
  ) => {
    const snappedPosition = gridSnapping
      ? {
          x: Math.round(position.x / 20) * 20,
          y: Math.round(position.y / 20) * 20,
        }
      : position;
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, position: snappedPosition } : rule
      )
    );
  };

  const duplicateRule = (ruleId: string) => {
    const newRuleId = crypto.randomUUID();
    setRules((prevRules) => {
      const ruleToDuplicate = prevRules.find((r) => r.id === ruleId);
      if (!ruleToDuplicate) {
        return prevRules;
      }

      const newRule = {
        ...ruleToDuplicate,
        id: newRuleId,
        position: {
          x: (ruleToDuplicate.position?.x || 0) + 30,
          y: (ruleToDuplicate.position?.y || 0) + 30,
        },
        conditionGroups: ruleToDuplicate.conditionGroups.map((group) => ({
          ...group,
          id: crypto.randomUUID(),
          conditions: group.conditions.map((condition) => ({
            ...condition,
            id: crypto.randomUUID(),
          })),
        })),
        effects: ruleToDuplicate.effects.map((effect) => ({
          ...effect,
          id: crypto.randomUUID(),
        })),
        randomGroups: ruleToDuplicate.randomGroups.map((group) => ({
          ...group,
          id: crypto.randomUUID(),
        })),
        loops: ruleToDuplicate.loops.map((group) => ({
          ...group,
          id: crypto.randomUUID(),
        }))
      };
      setSelectedItem({ type: "trigger", ruleId: newRuleId });
      return [...prevRules, newRule];
    });
  };

  const addTrigger = (triggerId: string) => {
    const centerPos = getCenterPosition();
    const newRule: Rule = {
      id: crypto.randomUUID(),
      trigger: triggerId,
      blueprintCompatible: true,
      conditionGroups: [],
      effects: [],
      randomGroups: [],
      loops: [],
      position: centerPos,
    };
    setRules((prev) => [...prev, newRule]);
    setSelectedItem({ type: "trigger", ruleId: newRule.id });
  };

  const addCondition = useCallback(
    (conditionType: string) => {
      if (!selectedItem) return;
      const conditionTypeData = getConditionType(conditionType);
      const defaultParams: Record<string, unknown> = {};
      if (conditionTypeData) {
        conditionTypeData.params.forEach((param) => {
          if (param.default !== undefined) {
            defaultParams[param.id] = param.default;
          }
        });
      }
      const newCondition: Condition = {
        id: crypto.randomUUID(),
        type: conditionType,
        negate: false,
        params: defaultParams,
      };

      let targetGroupId = selectedItem.groupId;

      setRules((prev) => {
        return prev.map((rule) => {
          if (rule.id === selectedItem.ruleId) {
            if (selectedItem.groupId && selectedItem.type === "condition") {
              return {
                ...rule,
                conditionGroups: rule.conditionGroups.map((group) =>
                  group.id === selectedItem.groupId
                    ? {
                        ...group,
                        conditions: [...group.conditions, newCondition],
                      }
                    : group
                ),
              };
            }
            if (rule.conditionGroups.length === 0) {
              const newGroupId = crypto.randomUUID();
              targetGroupId = newGroupId;
              return {
                ...rule,
                conditionGroups: [
                  {
                    id: newGroupId,
                    operator: "and",
                    conditions: [newCondition],
                  },
                ],
              };
            } else {
              targetGroupId = rule.conditionGroups[0].id;
              return {
                ...rule,
                conditionGroups: rule.conditionGroups.map((group, index) => {
                  if (index === 0) {
                    return {
                      ...group,
                      conditions: [...group.conditions, newCondition],
                    };
                  }
                  return group;
                }),
              };
            }
          }
          return rule;
        });
      });
      setSelectedItem({
        type: "condition",
        ruleId: selectedItem.ruleId,
        itemId: newCondition.id,
        groupId: targetGroupId,
      });
    },
    [selectedItem, getConditionType]
  );

  const addConditionGroup = (ruleId: string) => {
    const newGroup = {
      id: crypto.randomUUID(),
      operator: "and" as const,
      conditions: [],
    };
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: [...rule.conditionGroups, newGroup],
          };
        }
        return rule;
      })
    );
    setSelectedItem({
      type: "condition",
      ruleId: ruleId,
      groupId: newGroup.id,
    });
  };

  const deleteConditionGroup = (ruleId: string, groupId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.filter(
              (group) => group.id !== groupId
            ),
          };
        }
        return rule;
      })
    );
    if (selectedItem && selectedItem.groupId === groupId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
  };

  const toggleGroupOperator = (ruleId: string, groupId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.map((group) => {
              if (group.id === groupId) {
                return {
                  ...group,
                  operator: group.operator === "and" ? "or" : "and",
                };
              }
              return group;
            }),
          };
        }
        return rule;
      })
    );
  };

  const addRandomGroup = (ruleId: string) => {
    const newGroup: RandomGroup = {
      id: crypto.randomUUID(),
      chance_numerator: 1,
      chance_denominator: 4,
      respect_probability_effects: true,
      custom_key: "",
      effects: [],
    };
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            randomGroups: [...rule.randomGroups, newGroup],
          };
        }
        return rule;
      })
    );
    setSelectedItem({
      type: "randomgroup",
      ruleId: ruleId,
      randomGroupId: newGroup.id,
    });
  };

  const addLoopGroup = (ruleId: string) => {
    const newLoop: LoopGroup = {
      id: crypto.randomUUID(),
      repetitions: 1,
      effects: [],
    };
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            loops: [...rule.loops, newLoop],
          };
        }
        return rule;
      })
    );
    setSelectedItem({
      type: "loopgroup",
      ruleId: ruleId,
      loopGroupId: newLoop.id,
    });
  };

  const toggleBlueprintCompatibility = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            blueprintCompatible: !rule.blueprintCompatible,
          };
        }
        return rule;
      })
    );
  };

  const deleteRandomGroup = (ruleId: string, randomGroupId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          const groupToDelete = rule.randomGroups.find(
            (g) => g.id === randomGroupId
          );
          return {
            ...rule,
            randomGroups: rule.randomGroups.filter(
              (group) => group.id !== randomGroupId
            ),
            effects: groupToDelete
              ? [...rule.effects, ...groupToDelete.effects]
              : rule.effects,
          };
        }
        return rule;
      })
    );
    if (selectedItem && selectedItem.randomGroupId === randomGroupId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
  };

  const deleteLoopGroup = (ruleId: string, loopGroupId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          const groupToDelete = rule.loops.find(
            (g) => g.id === loopGroupId
          );
          return {
            ...rule,
            loops: rule.loops.filter(
              (group) => group.id !== loopGroupId
            ),
            effects: groupToDelete
              ? [...rule.effects, ...groupToDelete.effects]
              : rule.effects,
          };
        }
        return rule;
      })
    );
    if (selectedItem && selectedItem.loopGroupId === loopGroupId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
  };

  const updateRandomGroup = (
    ruleId: string,
    randomGroupId: string,
    updates: Partial<RandomGroup>
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            randomGroups: rule.randomGroups.map((group) =>
              group.id === randomGroupId ? { ...group, ...updates } : group
            ),
          };
        }
        return rule;
      })
    );
  };

  const updateLoopGroup = (
    ruleId: string,
    loopGroupId: string,
    updates: Partial<LoopGroup>
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            loops: rule.loops.map((group) =>
              group.id === loopGroupId ? { ...group, ...updates } : group
            ),
          };
        }
        return rule;
      })
    );
  };

  const createRandomGroupFromEffect = (ruleId: string, effectId: string) => {
    const newGroup: RandomGroup = {
      id: crypto.randomUUID(),
      chance_numerator: 1,
      chance_denominator: 4,
      respect_probability_effects: true,
      custom_key: "",
      effects: [],
    };
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id !== ruleId) return rule;
        let movedEffect: Effect | null = null;
        const updatedRule = { ...rule };

        updatedRule.effects = rule.effects.filter((effect) => {
          if (effect.id === effectId) {
            movedEffect = effect;
            return false;
          }
          return true;
        });

        updatedRule.randomGroups = rule.randomGroups.map((group) => ({
          ...group,
          effects: group.effects.filter((effect) => {
            if (effect.id === effectId) {
              movedEffect = effect;
              return false;
            }
            return true;
          }),
        }));

        if (movedEffect) {
          newGroup.effects = [movedEffect];
          updatedRule.randomGroups = [...updatedRule.randomGroups, newGroup];
        }

        return updatedRule;
      })
    );
    setSelectedItem({
      type: "randomgroup",
      ruleId: ruleId,
      randomGroupId: newGroup.id,
    });
  };

  const createLoopGroupFromEffect = (ruleId: string, effectId: string) => {
    const newGroup: LoopGroup = {
      id: crypto.randomUUID(),
      repetitions: 1,
      effects: [],
    };
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id !== ruleId) return rule;
        let movedEffect: Effect | null = null;
        const updatedRule = { ...rule };

        updatedRule.effects = rule.effects.filter((effect) => {
          if (effect.id === effectId) {
            movedEffect = effect;
            return false;
          }
          return true;
        });

        updatedRule.loops = rule.loops.map((group) => ({
          ...group,
          effects: group.effects.filter((effect) => {
            if (effect.id === effectId) {
              movedEffect = effect;
              return false;
            }
            return true;
          }),
        }));

        if (movedEffect) {
          newGroup.effects = [movedEffect];
          updatedRule.loops = [...updatedRule.loops, newGroup];
        }

        return updatedRule;
      })
    );
    setSelectedItem({
      type: "randomgroup",
      ruleId: ruleId,
      randomGroupId: newGroup.id,
    });
  };

  const addEffect = (effectType: string) => {
    if (!selectedItem) return;

    const effectTypeData = getEffectType(effectType);
    const defaultParams: Record<string, unknown> = {};
    if (effectTypeData) {
      effectTypeData.params.forEach((param) => {
        if (param.default !== undefined) {
          defaultParams[param.id] = param.default;
        }
      });
    }

    const newEffect: Effect = {
      id: crypto.randomUUID(),
      type: effectType,
      params: defaultParams,
    };

    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === selectedItem.ruleId) {
          if (selectedItem.randomGroupId) {
            return {
              ...rule,
              randomGroups: rule.randomGroups.map((group) =>
                group.id === selectedItem.randomGroupId
                  ? { ...group, effects: [...group.effects, newEffect] }
                  : group
              ),
            };
          } else if (selectedItem.loopGroupId) {
            return {
              ...rule,
              loops: rule.loops.map((group) =>
                group.id === selectedItem.loopGroupId
                  ? { ...group, effects: [...group.effects, newEffect] }
                  : group
              ),
            };
          } else {
            return {
              ...rule,
              effects: [...rule.effects, newEffect],
            };
          }
        }
        return rule;
      })
    );
    setSelectedItem({
      type: "effect",
      ruleId: selectedItem.ruleId,
      itemId: newEffect.id,
      randomGroupId: selectedItem.randomGroupId,
    });
  };

  const updateCondition = (
    ruleId: string,
    conditionId: string,
    updates: Partial<Condition>
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.map((group) => ({
              ...group,
              conditions: group.conditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, ...updates }
                  : condition
              ),
            })),
          };
        }
        return rule;
      })
    );
  };

  const updateEffect = (
    ruleId: string,
    effectId: string,
    updates: Partial<Effect>
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          const updatedRule = { ...rule };
          updatedRule.effects = rule.effects.map((effect) =>
            effect.id === effectId ? { ...effect, ...updates } : effect
          );
          updatedRule.randomGroups = rule.randomGroups.map((group) => ({
            ...group,
            effects: group.effects.map((effect) =>
              effect.id === effectId ? { ...effect, ...updates } : effect
            ),
          }));
          return updatedRule;
        }
        return rule;
      })
    );
  };

  const deleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    if (selectedItem && selectedItem.ruleId === ruleId) {
      setSelectedItem(null);
    }
  };

  const deleteCondition = (ruleId: string, conditionId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups
              .map((group) => ({
                ...group,
                conditions: group.conditions.filter(
                  (condition) => condition.id !== conditionId
                ),
              }))
              .filter((group) => group.conditions.length > 0),
          };
        }
        return rule;
      })
    );
    if (selectedItem && selectedItem.itemId === conditionId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
  };

  const deleteEffect = (ruleId: string, effectId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            effects: rule.effects.filter((effect) => effect.id !== effectId),
            randomGroups: rule.randomGroups.map((group) => ({
              ...group,
              effects: group.effects.filter((effect) => effect.id !== effectId),
            })),
            loops: rule.loops.map((group) => ({
              ...group,
              effects: group.effects.filter((effect) => effect.id !== effectId),
            })),
          };
        }
        return rule;
      })
    );
    if (selectedItem && selectedItem.itemId === effectId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
  };

  const getSelectedRule = () => {
    if (!selectedItem) return null;
    return rules.find((rule) => rule.id === selectedItem.ruleId) || null;
  };

  const getSelectedCondition = () => {
    if (
      !selectedItem ||
      selectedItem.type !== "condition" ||
      !selectedItem.itemId
    )
      return null;
    const rule = getSelectedRule();
    if (!rule) return null;
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find(
        (c) => c.id === selectedItem.itemId
      );
      if (condition) return condition;
    }
    return null;
  };

  const getSelectedEffect = () => {
    if (!selectedItem || selectedItem.type !== "effect" || !selectedItem.itemId)
      return null;
    const rule = getSelectedRule();
    if (!rule) return null;

    const effectInMain = rule.effects.find((e) => e.id === selectedItem.itemId);
    if (effectInMain) return effectInMain;

    for (const group of rule.randomGroups) {
      const effectInGroup = group.effects.find(
        (e) => e.id === selectedItem.itemId
      );
      if (effectInGroup) return effectInGroup;
    }
    
    for (const group of rule.loops) {
      const effectInGroup = group.effects.find(
        (e) => e.id === selectedItem.itemId
      );
      if (effectInGroup) return effectInGroup;
    }
    return null;
  };

  const getSelectedRandomGroup = () => {
    if (
      !selectedItem ||
      selectedItem.type !== "randomgroup" ||
      !selectedItem.randomGroupId
    )
      return null;
    const rule = getSelectedRule();
    if (!rule) return null;
    return (
      rule.randomGroups.find((g) => g.id === selectedItem.randomGroupId) || null
    );
  };

  const getSelectedLoopGroup = () => {
    if (
      !selectedItem ||
      selectedItem.type !== "loopgroup" ||
      !selectedItem.loopGroupId
    )
      return null;
    const rule = getSelectedRule();
    if (!rule) return null;
    return (
      rule.loops.find((g) => g.id === selectedItem.loopGroupId) || null
    );
  };

  const updateConditionOperator = (
    ruleId: string,
    conditionId: string,
    operator: "and" | "or"
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.map((group) => ({
              ...group,
              conditions: group.conditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, operator }
                  : condition
              ),
            })),
          };
        }
        return rule;
      })
    );
  };

  const getParameterCount = (params: Record<string, unknown>) => {
    return Object.keys(params).length;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    const activeId = active.id as string;

    if (activeId.startsWith("panel-")) {
      const panelId = activeId.replace("panel-", "");
      const currentPanel = panels[panelId];
      if (delta && currentPanel) {
        const newPosition = {
          x: Math.max(0, currentPanel.position.x + delta.x),
          y: Math.max(0, currentPanel.position.y + delta.y),
        };
        updatePanelPosition(panelId, newPosition);
      }
      setActiveId(null);
      return;
    }

    if (!over || active.id === over.id) {
      return;
    }

    const overId = over.id as string;

    setRules((currentRules) => {
      let activeRule: Rule | undefined;
      let containerWithActive: (Condition[] | Effect[]) | undefined;
      let containerWithOver: (Condition[] | Effect[]) | undefined;

      for (const rule of currentRules) {
        for (const group of rule.conditionGroups) {
          if (group.conditions.some((c) => c.id === activeId)) {
            activeRule = rule;
            containerWithActive = group.conditions;
          }
          if (group.conditions.some((c) => c.id === overId)) {
            containerWithOver = group.conditions;
          }
        }

        if (rule.effects.some((e) => e.id === activeId)) {
          activeRule = rule;
          containerWithActive = rule.effects;
        }
        if (rule.effects.some((e) => e.id === overId)) {
          containerWithOver = rule.effects;
        }

        for (const group of rule.randomGroups) {
          if (group.effects.some((e) => e.id === activeId)) {
            activeRule = rule;
            containerWithActive = group.effects;
          }
          if (group.effects.some((e) => e.id === overId)) {
            containerWithOver = group.effects;
          }
        }

        if (activeRule) break;
      }

      if (
        !activeRule ||
        !containerWithActive ||
        !containerWithOver ||
        containerWithActive !== containerWithOver
      ) {
        return currentRules;
      }

      const oldIndex = containerWithActive.findIndex((i) => i.id === activeId);
      const newIndex = containerWithOver.findIndex((i) => i.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return currentRules;
      }

      let reorderedItems: Condition[] | Effect[];
      if (
        activeRule.conditionGroups.some(
          (group) => group.conditions === containerWithActive
        )
      ) {
        reorderedItems = arrayMove(
          containerWithActive as Condition[],
          oldIndex,
          newIndex
        );
      } else {
        reorderedItems = arrayMove(
          containerWithActive as Effect[],
          oldIndex,
          newIndex
        );
      }

      return currentRules.map((rule) => {
        if (rule.id !== activeRule?.id) {
          return rule;
        }
        if (
          activeRule.conditionGroups.some(
            (group) => group.conditions === containerWithActive
          )
        ) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.map((group) =>
              group.conditions === containerWithActive
                ? { ...group, conditions: reorderedItems as Condition[] }
                : group
            ),
          };
        } else if (rule.effects === containerWithActive) {
          return {
            ...rule,
            effects: reorderedItems as Effect[],
          };
        } else {
          return {
            ...rule,
            randomGroups: rule.randomGroups.map((group) =>
              group.effects === containerWithActive
                ? { ...group, effects: reorderedItems as Effect[] }
                : group
            ),
          };
        }
      });
    });
  };

  const createAlternatingDotPattern = () => {
    const dotSize = 3;
    return `
      radial-gradient(circle at 0px 0px, #1e2b30 ${dotSize}px, transparent ${dotSize}px),
      radial-gradient(circle at 0px 0px, #1e2b30 ${dotSize}px, transparent ${dotSize}px)
    `;
  };

  const handleGameVariableApplied = useCallback(() => {
    setSelectedGameVariable(null);
  }, []);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex bg-black-dark items-center justify-center z-[60] font-lexend">
      <div
        ref={modalRef}
        className="bg-black-darker rounded-lg w-full h-full overflow-hidden border-2 border-black-light flex flex-col"
      >
        <div className="flex px-4 py-2 border-b-2 border-black-light z-50">
          <h2 className="text-xs text-white-light font-extralight tracking-widest mx-auto">
            Rule Builder - {itemType} Mode
          </h2>
        </div>
        <div className="flex-grow relative overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              backgroundImage: createAlternatingDotPattern(),
              backgroundSize: "40px 40px, 40px 40px",
              backgroundPosition: `${backgroundOffset.x % 40}px ${
                backgroundOffset.y % 40
              }px, ${(backgroundOffset.x + 20) % 40}px ${
                (backgroundOffset.y + 20) % 40
              }px`,
              backgroundColor: "#161E21",
            }}
          />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black-dark backdrop-blur-md border border-black-lighter rounded-lg px-3 py-1 flex items-center gap-3">
            <div className="text-white-darker text-xs">
              Pan: {Math.round(panState.x)}, {Math.round(panState.y)}
            </div>
            <button
              onClick={handleRecenter}
              className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
              title="Recenter View"
            >
              <ArrowsPointingInIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetPosition}
              className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
              title="Reset Window Position"
            >
              <WindowIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setUserConfig((prevConfig) => ({
                  ...prevConfig,
                  defaultGridSnap: !gridSnapping,
                }));
                setGridSnapping((prev) => !prev);
              }}
              className={
                gridSnapping
                  ? "p-1 text-mint-light hover:text-mint-lighter transition-colors cursor-pointer"
                  : "p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
              }
              title="Toggle Grid Snapping (S)"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-black-lighter" />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAndClose}
              icon={<CheckCircleIcon className="h-4 w-4" />}
              className="text-xs cursor-pointer"
            >
              Save & Close
            </Button>
          </div>
          {isInitialLoadComplete &&
            rules.length === 0 &&
            showNoRulesMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: 0.1,
                }}
                className="absolute inset-0 flex items-center justify-center z-40"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2,
                    ease: "easeOut",
                  }}
                  className="text-center bg-black-dark backdrop-blur-sm rounded-lg p-8 border-2 border-black-lighter shadow-2xl"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="text-white-darker text-lg mb-3"
                  >
                    No Rules Created
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="text-white-darker text-sm max-w-md"
                  >
                    Select a trigger from the Block Palette to create your first
                    rule.
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={
              activeId && activeId.startsWith("panel-")
                ? []
                : [restrictToVerticalAxis]
            }
          >
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              initialPositionX={0}
              initialPositionY={0}
              minScale={1}
              maxScale={1}
              centerOnInit={false}
              limitToBounds={false}
              wheel={{
                disabled: true,
              }}
              pinch={{
                disabled: true,
              }}
              doubleClick={{
                disabled: true,
              }}
              panning={{
                velocityDisabled: true,
              }}
              onTransformed={(_, state) => {
                setPanState({
                  x: state.positionX,
                  y: state.positionY,
                  scale: state.scale,
                });
                setBackgroundOffset({
                  x: state.positionX,
                  y: state.positionY,
                });
              }}
            >
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="w-full h-full relative"
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  minWidth: "100%",
                  minHeight: "100%",
                }}
              >
                <div className="relative z-10">
                  <div className="p-6 min-h-screen">
                    <div className="relative">
                      {rules.map((rule, index) => (
                        <div
                          key={rule.id}
                          className="absolute"
                          style={{
                            left: rule.position?.x || 0,
                            top: rule.position?.y || 0,
                            zIndex:
                              selectedItem?.ruleId === rule.id
                                ? 50 + index
                                : 20 + index,
                          }}
                        >
                          <RuleCard
                            rule={rule}
                            ruleIndex={index}
                            selectedItem={selectedItem}
                            onSelectItem={setSelectedItem}
                            onDuplicateRule={duplicateRule}
                            onDeleteRule={deleteRule}
                            onDeleteCondition={deleteCondition}
                            onDeleteConditionGroup={deleteConditionGroup}
                            onDeleteEffect={deleteEffect}
                            onAddConditionGroup={addConditionGroup}
                            onAddRandomGroup={addRandomGroup}
                            onAddLoop={addLoopGroup}
                            onToggleBlueprintCompatibility={
                              toggleBlueprintCompatibility
                            }
                            onDeleteRandomGroup={deleteRandomGroup}
                            onDeleteLoopGroup={deleteLoopGroup}
                            onToggleGroupOperator={toggleGroupOperator}
                            onUpdatePosition={updateRulePosition}
                            isRuleSelected={selectedItem?.ruleId === rule.id}
                            item={item}
                            itemType={itemType}
                            generateConditionTitle={(condition) => {
                              const conditionType = getConditionType(
                                condition.type
                              );
                              if (!conditionType) return condition.type; // Fallback if type not found
                              return generateAutoTitle(
                                condition,
                                conditionType,
                                true
                              );
                            }}
                            generateEffectTitle={(effect) => {
                              const effectType = getEffectType(effect.type);
                              if (!effectType) return effect.type; // Fallback if type not found
                              return generateAutoTitle(
                                effect,
                                effectType,
                                false
                              );
                            }}
                            getParameterCount={getParameterCount}
                            onUpdateConditionOperator={updateConditionOperator}
                            onRuleDoubleClick={() => {
                              setInspectorIsOpen(true);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TransformComponent>
            </TransformWrapper>

            {panels.blockPalette.isVisible && (
              <BlockPalette
                position={panels.blockPalette.position}
                selectedRule={getSelectedRule()}
                onAddTrigger={addTrigger}
                onAddCondition={addCondition}
                onAddEffect={addEffect}
                onClose={() => togglePanel("blockPalette")}
                onPositionChange={(position) =>
                  updatePanelPosition("blockPalette", position)
                }
                itemType={itemType}
              />
            )}
            {itemType !== "consumable" && panels.variables?.isVisible && (
              <Variables
                position={panels.variables.position}
                item={item as Exclude<ItemData, ConsumableData>}
                onUpdateItem={onUpdateItem}
                onClose={() => togglePanel("variables")}
                onPositionChange={(position) =>
                  updatePanelPosition("variables", position)
                }
              />
            )}
            {panels.inspector.isVisible && (
              <Inspector
                position={panels.inspector.position}
                joker={item as JokerData}
                selectedRule={getSelectedRule()}
                selectedCondition={getSelectedCondition()}
                selectedEffect={getSelectedEffect()}
                selectedRandomGroup={getSelectedRandomGroup()}
                selectedLoopGroup={getSelectedLoopGroup()}
                onUpdateCondition={updateCondition}
                onUpdateEffect={updateEffect}
                onUpdateRandomGroup={updateRandomGroup}
                onUpdateLoopGroup={updateLoopGroup}
                onUpdateJoker={
                  onUpdateItem as (updates: Partial<JokerData>) => void
                }
                onClose={() => togglePanel("inspector")}
                onPositionChange={(position) =>
                  updatePanelPosition("inspector", position)
                }
                onToggleVariablesPanel={() => togglePanel("variables")}
                onToggleGameVariablesPanel={() => togglePanel("gameVariables")}
                onCreateRandomGroupFromEffect={createRandomGroupFromEffect}
                onCreateLoopGroupFromEffect={createLoopGroupFromEffect}
                selectedGameVariable={selectedGameVariable}
                onGameVariableApplied={handleGameVariableApplied}
                selectedItem={selectedItem}
                itemType={itemType}
              />
            )}

            {panels.gameVariables.isVisible && (
              <GameVariables
                position={panels.gameVariables.position}
                selectedGameVariable={selectedGameVariable}
                onSelectGameVariable={setSelectedGameVariable}
                onClose={() => togglePanel("gameVariables")}
                onPositionChange={(position) =>
                  updatePanelPosition("gameVariables", position)
                }
              />
            )}
            <FloatingDock
              panels={panels}
              onTogglePanel={togglePanel}
              itemType={itemType}
            />
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default RuleBuilder;
