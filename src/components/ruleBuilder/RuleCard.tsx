import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  Rule,
  ConditionGroup,
  Condition,
  Effect,
  RandomGroup,
  SelectedItem,
  LoopGroup,
} from "./types";

import { getTriggerById } from "../data/Jokers/Triggers";
import { getConditionTypeById } from "../data/Jokers/Conditions";
import { getEffectTypeById } from "../data/Jokers/Effects";
import { getConsumableTriggerById } from "../data/Consumables/Triggers";
import { getConsumableConditionTypeById } from "../data/Consumables/Conditions";
import { getConsumableEffectTypeById } from "../data/Consumables/Effects";

import BlockComponent from "./BlockComponent";
import { ChevronDownIcon, Bars3Icon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  TrashIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import {
  JokerData,
  ConsumableData,
  EnhancementData,
  SealData,
  EditionData,
  VoucherData,
} from "../data/BalatroUtils";
import { WrenchIcon } from "@heroicons/react/24/solid";

import { getCardTriggerById } from "../data/Card/Triggers";
import { getCardConditionTypeById } from "../data/Card/Conditions";
import { getCardEffectTypeById } from "../data/Card/Effects";

import { getVoucherTriggerById } from "../data/Vouchers/Triggers";
import { getVoucherEffectTypeById } from "../data/Vouchers/Effects";

interface RuleCardProps {
  rule: Rule;
  ruleIndex: number;
  selectedItem: SelectedItem
  onSelectItem: (item: {
    type: "trigger" | "condition" | "effect" | "randomgroup" | "loopgroup";
    ruleId: string;
    itemId?: string;
    groupId?: string;
    randomGroupId?: string;
    loopGroupId?: string
  }) => void;
  onDeleteRule: (ruleId: string) => void;
  onDuplicateRule: (ruleId: string) => void;
  onDeleteCondition: (ruleId: string, conditionId: string) => void;
  onDeleteConditionGroup: (ruleId: string, groupId: string) => void;
  onDeleteEffect: (ruleId: string, effectId: string) => void;
  onAddConditionGroup: (ruleId: string) => void;
  onAddRandomGroup: (ruleId: string) => void;
  onAddLoop: (ruleId: string) => void;
  onToggleBlueprintCompatibility: (ruleId: string) => void;
  onDeleteRandomGroup: (ruleId: string, randomGroupId: string) => void;
  onDeleteLoopGroup: (ruleId: string, randomGroupId: string) => void;
  onToggleGroupOperator?: (ruleId: string, groupId: string) => void;
  onUpdatePosition: (
    ruleId: string,
    position: { x: number; y: number }
  ) => void;
  isRuleSelected: boolean;
  item: JokerData | ConsumableData | EnhancementData | SealData | EditionData | VoucherData;
  itemType: "joker" | "consumable" | "card" | "voucher";
  generateConditionTitle: (condition: Condition) => string;
  generateEffectTitle: (effect: Effect) => string;
  getParameterCount: (params: Record<string, unknown>) => number;
  onUpdateConditionOperator: (
    ruleId: string,
    conditionId: string,
    operator: "and" | "or"
  ) => void;
  onRuleDoubleClick: () => void;
}

const SortableCondition: React.FC<{
  condition: Condition;
  ruleId: string;
  groupId: string;
  isSelected: boolean;
  isNegated: boolean;
  onSelect: () => void;
  onDelete: () => void;
  parameterCount: number;
  dynamicTitle: string;
  itemType: "joker" | "consumable" | "card" | "voucher";
}> = ({
  condition,
  isSelected,
  isNegated,
  onSelect,
  onDelete,
  parameterCount,
  dynamicTitle,
  itemType,
}) => {
  const getConditionType =
    itemType === "joker"
      ? getConditionTypeById
      : itemType === "consumable"
      ? getConsumableConditionTypeById
      : getCardConditionTypeById
  const conditionType = getConditionType(condition.type);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: condition.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex justify-center -mt-3"
    >
      <BlockComponent
        type="condition"
        label={conditionType?.label || "Unknown Condition"}
        dynamicTitle={dynamicTitle}
        isSelected={isSelected}
        onClick={(e) => {
          e?.stopPropagation();
          onSelect();
        }}
        showTrash={true}
        onDelete={() => {
          onDelete();
        }}
        parameterCount={parameterCount}
        isNegated={isNegated}
        isDraggable={true}
        dragHandleProps={listeners}
        variant="condition"
      />
    </div>
  );
};

const SortableEffect: React.FC<{
  effect: Effect;
  ruleId: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  parameterCount: number;
  dynamicTitle: string;
  randomGroupId?: string;
  itemType: "joker" | "consumable" | "card" | "voucher";
}> = ({
  effect,
  isSelected,
  onSelect,
  onDelete,
  parameterCount,
  dynamicTitle,
  itemType,
}) => {
  const getEffectType =
    itemType === "joker"
      ? getEffectTypeById
      : itemType === "consumable"
      ? getConsumableEffectTypeById
      : itemType === "card"
      ? getCardEffectTypeById
      : getVoucherEffectTypeById;
  const effectType = getEffectType(effect.type);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: effect.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex justify-center"
    >
      <BlockComponent
        type="effect"
        label={effectType?.label || "Unknown Effect"}
        dynamicTitle={dynamicTitle}
        isSelected={isSelected}
        onClick={(e) => {
          e?.stopPropagation();
          onSelect();
        }}
        showTrash={true}
        onDelete={() => {
          onDelete();
        }}
        parameterCount={parameterCount}
        isDraggable={true}
        dragHandleProps={listeners}
        variant="palette"
      />
    </div>
  );
};

const RandomGroupContainer: React.FC<{
  group: RandomGroup;
  children: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ group, children, isSelected, onSelect, onDelete }) => {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 bg-mint/5 relative transition-all min-h-[120px] w-full max-w-full ${
        isSelected ? "border-mint" : "border-mint/30"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-mint text-xs tracking-wider font-medium">
          {group.chance_numerator} in {group.chance_denominator} chance{" "}
          {isSelected && "(SELECTED)"}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-full h-full flex items-center rounded justify-center"
            title="Delete Random Group"
          >
            <XMarkIcon className="h-4 w-4 text-mint/60 hover:text-mint cursor-pointer transition-colors" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

const LoopGroupContainer: React.FC<{
  group: LoopGroup;
  children: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ group, children, isSelected, onSelect, onDelete }) => {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 bg-mint/5 relative transition-all min-h-[120px] w-full max-w-full ${
        isSelected ? "border-balatro-blue" : "border-balatro-blue/30"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-balatro-blue text-xs tracking-wider font-medium">
          Loop {group.repetitions} times{" "}
          {isSelected && "(SELECTED)"}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-full h-full flex items-center rounded justify-center"
            title="Delete the Loop"
          >
            <XMarkIcon className="h-4 w-4 text-balatro-blue/60 hover:text-balatro-blue cursor-pointer transition-colors" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  ruleIndex,
  selectedItem,
  onSelectItem,
  onDuplicateRule,
  onDeleteRule,
  onDeleteCondition,
  onDeleteConditionGroup,
  onDeleteEffect,
  onAddConditionGroup,
  onToggleBlueprintCompatibility,
  onAddRandomGroup,
  onAddLoop,
  onDeleteRandomGroup,
  onDeleteLoopGroup,
  onToggleGroupOperator,
  onUpdatePosition,
  isRuleSelected,
  generateConditionTitle,
  generateEffectTitle,
  getParameterCount,
  onUpdateConditionOperator,
  itemType,
  onRuleDoubleClick,
}) => {
  const getTrigger =
    itemType === "joker"
      ? getTriggerById
      : itemType === "consumable"
      ? getConsumableTriggerById
      : itemType === "card"
      ? getCardTriggerById
      : getVoucherTriggerById;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groupOperators, setGroupOperators] = useState<Record<string, string>>(
    {}
  );
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
  });

  const transformOffset = isDragging ? dragOffset : { x: 0, y: 0 };

  const handleCardMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setDragOffset({ x: deltaX, y: deltaY });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      const finalPosition = {
        x: (rule.position?.x || 0) + dragOffset.x,
        y: (rule.position?.y || 0) + dragOffset.y,
      };
      onUpdatePosition(rule.id, finalPosition);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isDragging, rule.id, rule.position, dragOffset, onUpdatePosition]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const trigger = getTrigger(rule.trigger);
  const allConditions = rule.conditionGroups.flatMap(
    (group) => group.conditions
  );
  const totalConditions = allConditions.length;
  const totalEffects =
    rule.effects.length +
    rule.randomGroups.reduce((sum, group) => sum + group.effects.length, 0) +
    rule.loops.reduce((sum, group) => sum + group.effects.length, 0);

  const snapFadeUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };
  const quickFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
  const slideFromRight = {
    initial: { opacity: 0, x: 20, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.9 },
  };
  const cardEntrance = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  };
  const popIn = {
    initial: { opacity: 0, scale: 0.8, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -10 },
  };

  const isItemSelected = (
    type: "trigger" | "condition" | "effect" | "randomgroup" | "loopgroup",
    itemId?: string,
    groupId?: string,
    randomGroupId?: string,
    loopGroupId?: string
  ) => {
    if (!selectedItem || selectedItem.ruleId !== rule.id) return false;
    if (selectedItem.type !== type) return false;
    if (type === "trigger") return true;
    if (type === "condition" && groupId && selectedItem.groupId !== groupId)
      return false;
    if (
      type === "randomgroup" &&
      randomGroupId &&
      selectedItem.randomGroupId !== randomGroupId
    )
      return false;
    if (
      type === "loopgroup" &&
      loopGroupId &&
      selectedItem.loopGroupId !== loopGroupId
    )
      return false;
    if (type === "effect") {
      if (selectedItem.itemId !== itemId) return false;
      if (randomGroupId && selectedItem.randomGroupId !== randomGroupId)
        return false;
      if (!randomGroupId && selectedItem.randomGroupId) return false;
      if (loopGroupId && selectedItem.loopGroupId !== loopGroupId)
        return false;
      if (!loopGroupId && selectedItem.loopGroupId) return false;
      return true;
    }
    return selectedItem.itemId === itemId;
  };

  const isGroupSelected = (groupId: string) => {
    return (
      selectedItem?.ruleId === rule.id && selectedItem?.groupId === groupId
    );
  };
  const isRandomGroupSelected = (randomGroupId: string) => {
    return (
      selectedItem?.ruleId === rule.id &&
      selectedItem?.randomGroupId === randomGroupId
    );
  };
  const isLoopGroupSelected = (loopGroupId: string) => {
    return (
      selectedItem?.ruleId === rule.id &&
      selectedItem?.loopGroupId === loopGroupId
    );
  };

  const handleDuplicateRule = () => onDuplicateRule(rule.id);

  const handleConditionOperatorToggle = (
    groupId: string,
    conditionIndex: number
  ) => {
    const group = rule.conditionGroups.find((g) => g.id === groupId);
    if (group && group.conditions[conditionIndex]) {
      const condition = group.conditions[conditionIndex];
      const newOperator =
        (condition.operator || "and") === "and" ? "or" : "and";
      onUpdateConditionOperator(rule.id, condition.id, newOperator);
    }
  };

  const handleGroupOperatorToggle = (groupIndex: number, groupId: string) => {
    const key = `group-${groupIndex}`;
    const newOperator = (groupOperators[key] || "AND") === "AND" ? "OR" : "AND";
    setGroupOperators((prev) => ({ ...prev, [key]: newOperator }));
    onToggleGroupOperator?.(rule.id, groupId);
  };

  const renderConditionGroup = (group: ConditionGroup, groupIndex: number) => {
    const isSelected = isGroupSelected(group.id);
    return (
      <motion.div
        key={group.id}
        className="relative"
        variants={popIn}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.15, delay: 0.03 }}
      >
        <div
          className={`border-2 border-dashed rounded-lg p-4 bg-black-darker/50 relative ${
            isSelected ? "border-mint" : "border-black-lighter"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem({
              type: "condition",
              ruleId: rule.id,
              groupId: group.id,
            });
          }}
        >
          <div className="flex items-center justify-between mb-10">
            <div className="text-white-darker text-xs tracking-wider">
              CONDITION GROUP {groupIndex + 1} {isSelected && "(SELECTED)"}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConditionGroup(rule.id, group.id);
                }}
                className="w-full h-full flex items-center rounded justify-center"
                title="Delete Condition Group"
              >
                <XMarkIcon className="h-4 w-4 text-white-dark hover:text-white-lighter cursor-pointer transition-colors" />
              </button>
            </div>
          </div>
          <SortableContext
            items={group.conditions.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {group.conditions.map((condition, conditionIndex) => {
                const currentOperator = condition.operator || "and";
                return (
                  <motion.div key={condition.id}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <SortableCondition
                        condition={condition}
                        ruleId={rule.id}
                        groupId={group.id}
                        isSelected={isItemSelected(
                          "condition",
                          condition.id,
                          group.id
                        )}
                        isNegated={condition.negate}
                        onSelect={() =>
                          onSelectItem({
                            type: "condition",
                            ruleId: rule.id,
                            itemId: condition.id,
                            groupId: group.id,
                          })
                        }
                        onDelete={() =>
                          onDeleteCondition(rule.id, condition.id)
                        }
                        parameterCount={getParameterCount(condition.params)}
                        dynamicTitle={generateConditionTitle(condition)}
                        itemType={itemType}
                      />
                    </div>
                    {conditionIndex < group.conditions.length - 1 && (
                      <div
                        className="text-center py-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            handleConditionOperatorToggle(
                              group.id,
                              conditionIndex
                            )
                          }
                          className="px-3 text-white-darker text-sm font-medium tracking-wider cursor-pointer rounded transition-colors hover:bg-black-light"
                        >
                          {currentOperator.toUpperCase()}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </SortableContext>
        </div>
        {groupIndex < rule.conditionGroups.length - 1 && (
          <div className="text-center py-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGroupOperatorToggle(groupIndex, group.id);
              }}
              className="px-3 text-white-darker text-sm font-medium tracking-wider cursor-pointer rounded transition-colors hover:bg-black-light"
            >
              {groupOperators[`group-${groupIndex}`] ||
                group.operator?.toUpperCase() ||
                "AND"}
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  const renderRandomGroup = (group: RandomGroup) => {
    return (
      <motion.div
        key={`rg-motion-${group.id}`}
        className="relative"
        variants={popIn}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.15, delay: 0.03 }}
      >
        <RandomGroupContainer
          group={group}
          isSelected={isRandomGroupSelected(group.id)}
          onSelect={() =>
            onSelectItem({
              type: "randomgroup",
              ruleId: rule.id,
              randomGroupId: group.id,
            })
          }
          onDelete={() => onDeleteRandomGroup(rule.id, group.id)}
        >
          <SortableContext
            id={group.id}
            items={group.effects.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {group.effects.map((effect) => (
                <div key={effect.id} onClick={(e) => e.stopPropagation()}>
                  <SortableEffect
                    effect={effect}
                    ruleId={rule.id}
                    isSelected={isItemSelected("effect", effect.id)}
                    onSelect={() =>
                      onSelectItem({
                        type: "effect",
                        ruleId: rule.id,
                        itemId: effect.id,
                      })
                    }
                    onDelete={() => onDeleteEffect(rule.id, effect.id)}
                    parameterCount={getParameterCount(effect.params)}
                    dynamicTitle={generateEffectTitle(effect)}
                    itemType={itemType}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </RandomGroupContainer>
      </motion.div>
    );
  };

  const renderLoopGroup = (group: LoopGroup) => {
    return (
      <motion.div
        key={`rg-motion-${group.id}`}
        className="relative"
        variants={popIn}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.15, delay: 0.03 }}
      >
        <LoopGroupContainer
          group={group}
          isSelected={isLoopGroupSelected(group.id)}
          onSelect={() =>
            onSelectItem({
              type: "loopgroup",
              ruleId: rule.id,
              loopGroupId: group.id, ///////
            })
          }
          onDelete={() => onDeleteLoopGroup(rule.id, group.id)}
        >
          <SortableContext
            id={group.id}
            items={group.effects.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {group.effects.map((effect) => (
                <div key={effect.id} onClick={(e) => e.stopPropagation()}>
                  <SortableEffect
                    effect={effect}
                    ruleId={rule.id}
                    isSelected={isItemSelected("effect", effect.id)}
                    onSelect={() =>
                      onSelectItem({
                        type: "effect",
                        ruleId: rule.id,
                        itemId: effect.id,
                      })
                    }
                    onDelete={() => onDeleteEffect(rule.id, effect.id)}
                    parameterCount={getParameterCount(effect.params)}
                    dynamicTitle={generateEffectTitle(effect)}
                    itemType={itemType}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </LoopGroupContainer>
      </motion.div>
    );
  };

  return (
    <div
      className="w-80 relative pl-8 select-none"
      style={{
        zIndex: isRuleSelected ? 30 : 20,
        pointerEvents: "auto",
        transform: `translate(${transformOffset.x}px, ${transformOffset.y}px)`,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelectItem({ type: "trigger", ruleId: rule.id });
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onRuleDoubleClick();
      }}
      onMouseDown={handleCardMouseDown}
    >
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="absolute left-0 top-9 -ml-6 bg-black-dark border-2 border-black-lighter rounded-lg z-20 flex flex-col gap-2 py-2 p-[6px]"
            variants={slideFromRight}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-redshadow"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.05 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRule(rule.id);
                }}
                className="w-full h-full flex items-center rounded justify-center transition-colors hover:bg-balatro-redshadow active:bg-balatro-blackshadow cursor-pointer"
                title="Delete Rule"
              >
                <TrashIcon className="h-4 w-4 text-balatro-red transition-colors" />
              </button>
            </motion.div>
            <motion.div
              className="w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-blue"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.05 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateRule();
                }}
                className="w-full h-full flex items-center rounded justify-center transition-colors hover:bg-balatro-blue/20 cursor-pointer"
                title="Duplicate Rule"
              >
                <DocumentDuplicateIcon className="h-4 w-4 text-balatro-blue" />
              </button>
            </motion.div>
            <motion.div
              className="w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-white-darker"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.05 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen(false);
                }}
                className="w-full h-full flex items-center rounded justify-center transition-colors hover:bg-white-darker/20 cursor-pointer"
                title="Close Menu"
              >
                <XMarkIcon className="h-4 w-4 text-white-darker" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`w-80 relative`}
        variants={cardEntrance}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex justify-center relative"
          variants={snapFadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.15 }}
          onMouseDown={handleHeaderMouseDown}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div
            className={`bg-black border-2 rounded-t-md px-8 py-2 pt-1 relative ${
              isRuleSelected ? "border-mint" : "border-black-light"
            } `}
          >
            <span className="text-white-light text-sm tracking-widest">
              Rule {ruleIndex}
            </span>
          </div>
        </motion.div>

        <motion.div
          className={`
            bg-black-dark border-2 rounded-lg overflow-hidden -mt-2 relative
            ${isRuleSelected ? "border-mint" : "border-black-lighter"}
          `}
          style={{ pointerEvents: "auto" }}
          variants={snapFadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.18, delay: 0.05 }}
        >
          <div
            className="bg-black-darker px-3 py-2 border-b border-black-lighter"
            onMouseDown={handleHeaderMouseDown}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div className="flex justify-between items-center">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen(!sidebarOpen);
                }}
                className="p-1 text-white-darker hover:bg-black-light rounded transition-colors cursor-pointer"
                title="Open Menu"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.05 }}
              >
                <Bars3Icon className="h-4 w-4" />
              </motion.button>
              <motion.div
                className="flex items-center gap-3"
                variants={quickFade}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.12, delay: 0.08 }}
              >
                {totalConditions > 0 && (
                  <span className="text-white-darker text-xs">
                    {totalConditions} Condition{totalConditions !== 1 && "s"}
                  </span>
                )}
                {totalEffects > 0 && (
                  <span className="text-white-darker text-xs">
                    {totalEffects} Effect{totalEffects !== 1 && "s"}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {rule.conditionGroups.length > 0 && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onAddConditionGroup(rule.id)}
                        className="w-6 h-6 bg-black-darker rounded-lg flex items-center justify-center border-2 border-mint hover:bg-mint/20 transition-colors cursor-pointer"
                        title="Add Condition Group"
                      >
                        <PlusIcon className="h-3 w-3 text-mint" />
                      </button>
                    </div>
                  )}
                  <div onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onAddLoop(rule.id)}
                      className="w-6 h-6 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-blue hover:bg-effect/20 transition-colors cursor-pointer"
                      title="Add a Loop"
                    >
                      <ArrowPathIcon className="h-3 w-3 text-balatro-blue" />
                    </button>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onAddRandomGroup(rule.id)}
                      className="w-6 h-6 bg-black-darker rounded-lg flex items-center justify-center border-2 border-effect hover:bg-effect/20 transition-colors cursor-pointer"
                      title="Add Random Group"
                    >
                      <PlusIcon className="h-3 w-3 text-effect" />
                    </button>
                  </div>
                  {itemType === "joker" && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {rule.blueprintCompatible ?? true ? (
                        <button
                          onClick={() =>
                            onToggleBlueprintCompatibility(rule.id)
                          }
                          className="w-6 h-6 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-blue hover:bg-balatro-blue/20 transition-colors cursor-pointer"
                          title="Copied by Blueprint"
                        >
                          <WrenchIcon className="h-3 w-3 text-balatro-blue" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            onToggleBlueprintCompatibility(rule.id)
                          }
                          className="w-6 h-6 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-red hover:bg-balatro-red/20 transition-colors cursor-pointer"
                          title="Not Copied by Blueprint"
                        >
                          <WrenchIcon className="h-3 w-3 text-balatro-red" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            className="p-4 space-y-3"
            variants={quickFade}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.15, delay: 0.1 }}
          >
            <motion.div
              variants={snapFadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.12, delay: 0.12 }}
              className="flex justify-center"
            >
              <BlockComponent
                type="trigger"
                label={trigger?.label || "Unknown Trigger"}
                isSelected={isItemSelected("trigger")}
                onClick={(e) => {
                  e?.stopPropagation();
                  onSelectItem({ type: "trigger", ruleId: rule.id });
                }}
                variant="default"
              />
            </motion.div>

            {(rule.conditionGroups.length > 0 ||
              rule.effects.length > 0 ||
              rule.randomGroups.length > 0 ||
              rule.loops.length > 0
            ) && (
              <motion.div
                className="flex justify-center"
                variants={quickFade}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.1, delay: 0.15 }}
              >
                <ChevronDownIcon className="h-5 w-5 text-white-darker" />
              </motion.div>
            )}

            {rule.conditionGroups.length > 0 && (
              <motion.div
                variants={quickFade}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.1, delay: 0.17 }}
                className="space-y-3"
              >
                {rule.conditionGroups.map((group, index) =>
                  renderConditionGroup(group, index)
                )}
              </motion.div>
            )}

            {(rule.effects.length > 0 || rule.randomGroups.length > 0 || rule.loops.length > 0) &&
              rule.conditionGroups.length > 0 && (
                <motion.div
                  className="flex justify-center"
                  variants={quickFade}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.1, delay: 0.2 }}
                >
                  <ChevronDownIcon className="h-5 w-5 text-white-darker" />
                </motion.div>
              )}

            <motion.div
              className="space-y-3"
              variants={quickFade}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.1, delay: 0.22 }}
            >
              <SortableContext
                items={rule.effects.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {rule.effects.map((effect) => (
                    <div key={effect.id}>
                      <SortableEffect
                        effect={effect}
                        ruleId={rule.id}
                        isSelected={isItemSelected("effect", effect.id)}
                        onSelect={() =>
                          onSelectItem({
                            type: "effect",
                            ruleId: rule.id,
                            itemId: effect.id,
                          })
                        }
                        onDelete={() => onDeleteEffect(rule.id, effect.id)}
                        parameterCount={getParameterCount(effect.params)}
                        dynamicTitle={generateEffectTitle(effect)}
                        itemType={itemType}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </motion.div>

            <motion.div
              className="space-y-3"
              variants={quickFade}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.1, delay: 0.24 }}
            >
              {rule.randomGroups.map((group) => renderRandomGroup(group))}
            </motion.div>
            <motion.div
              className="space-y-3"
              variants={quickFade}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.1, delay: 0.24 }}
            >
              {rule.loops.map((group) => renderLoopGroup(group))}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RuleCard;
