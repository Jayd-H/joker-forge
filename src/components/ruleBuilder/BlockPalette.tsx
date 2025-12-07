import React, { useState, useMemo, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Rule,
  GlobalEffectTypeDefinition,
  GlobalTriggerDefinition,
  GlobalConditionTypeDefinition,
} from "./types";
import BlockComponent from "./BlockComponent";
import {
  SwatchIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  BoltIcon,
  PuzzlePieceIcon,
  BeakerIcon,
} from "@heroicons/react/16/solid";

import {
  TRIGGER_CATEGORIES,
  getTriggers,
  CategoryDefinition
} from "../data/Triggers"

import {
  CONDITION_CATEGORIES,
  getConditionsForTrigger,
} from "../data/Conditions"

import {
  EFFECT_CATEGORIES,
  getEffectsForTrigger,
} from "../data/Effects"

interface BlockPaletteProps {
  position: { x: number; y: number };
  selectedRule: Rule | null;
  onAddTrigger: (triggerId: string) => void;
  onAddCondition: (conditionType: string) => void;
  onAddEffect: (effectType: string) => void;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  itemType: "joker" | "consumable" | "card" | "voucher" | "deck";
}

type FilterType = "triggers" | "conditions" | "effects";

const BlockPalette: React.FC<BlockPaletteProps> = ({
  position,
  selectedRule,
  onAddTrigger,
  onAddCondition,
  onAddEffect,
  onClose,
  itemType,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [activeFilter, setActiveFilter] = useState<FilterType>(
    selectedRule ? "conditions" : "triggers"
  );
  const [previousSelectedRule, setPreviousSelectedRule] = useState<Rule | null>(
    selectedRule
  );

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "panel-blockPalette",
  });

  const triggers = getTriggers(itemType)

  const triggerCategories = TRIGGER_CATEGORIES
  const conditionCategories = CONDITION_CATEGORIES
  const effectCategories = EFFECT_CATEGORIES

  const getConditionsForTriggerFn = getConditionsForTrigger
  const getEffectsForTriggerFn = getEffectsForTrigger

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

  useEffect(() => {
    const ruleChanged = selectedRule !== previousSelectedRule;
    const hasRuleNow = !!selectedRule;

    if (ruleChanged && hasRuleNow && activeFilter === "triggers") {
      setActiveFilter("conditions");
    }

    setPreviousSelectedRule(selectedRule);
  }, [selectedRule, previousSelectedRule, activeFilter]);

  useEffect(() => {
    setExpandedCategories(new Set());
  }, [activeFilter]);

  const availableConditions = useMemo(() => {
    return selectedRule ? getConditionsForTriggerFn(selectedRule.trigger, itemType) : [];
  }, [selectedRule, getConditionsForTriggerFn, itemType]);

  const availableEffects = useMemo(() => {
    return selectedRule ? getEffectsForTriggerFn(selectedRule.trigger, itemType) : [];
  }, [selectedRule, getEffectsForTriggerFn, itemType]);

  const categorizedItems = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    const filteredTriggers = triggers.filter(
      (trigger) =>
        trigger.label[itemType].toLowerCase().includes(normalizedSearch) ||
        trigger.description[itemType].toLowerCase().includes(normalizedSearch)
    );

    const triggersByCategory: Record<
      string,
      { category: CategoryDefinition; items: GlobalTriggerDefinition[] }
    > = {};

    triggerCategories.forEach((category) => {
      triggersByCategory[category.label] = {
        category,
        items: [],
      };
    });

    const uncategorizedCategory: CategoryDefinition = {
      label: "Other",
      icon: SparklesIcon,
    };
    triggersByCategory["Other"] = {
      category: uncategorizedCategory,
      items: [],
    };

    filteredTriggers.forEach((trigger) => {
      const categoryLabel = trigger.category || "Other";
      if (triggersByCategory[categoryLabel] && trigger.objectUsers.includes(itemType)) {
        triggersByCategory[categoryLabel].items.push(trigger);
      } else if (trigger.objectUsers.includes(itemType)) {
        triggersByCategory["Other"].items.push(trigger);
      }
    });

    Object.keys(triggersByCategory).forEach((categoryLabel) => {
      if (triggersByCategory[categoryLabel].items.length === 0) {
        delete triggersByCategory[categoryLabel];
      }
    });

    const filteredConditions = availableConditions.filter(
      (condition) =>
        condition.label.toLowerCase().includes(normalizedSearch) ||
        condition.description.toLowerCase().includes(normalizedSearch)
    );

    const conditionsByCategory: Record<
      string,
      { category: CategoryDefinition; items: GlobalConditionTypeDefinition[] }
    > = {};

    conditionCategories.forEach((category) => {
      conditionsByCategory[category.label] = {
        category,
        items: [],
      };
    });

    conditionsByCategory["Other"] = {
      category: uncategorizedCategory,
      items: [],
    };

    filteredConditions.forEach((condition) => {
      const categoryLabel = condition.category || "Other";
      if (conditionsByCategory[categoryLabel]) {
        conditionsByCategory[categoryLabel].items.push(condition);
      } else {
        conditionsByCategory["Other"].items.push(condition);
      }
    });

    Object.keys(conditionsByCategory).forEach((categoryLabel) => {
      if (conditionsByCategory[categoryLabel].items.length === 0) {
        delete conditionsByCategory[categoryLabel];
      }
    });

    const filteredEffects = availableEffects.filter(
      (effect) =>
        effect.label.toLowerCase().includes(normalizedSearch) ||
        effect.description.toLowerCase().includes(normalizedSearch)
    );

    const effectsByCategory: Record<
      string,
      { category: CategoryDefinition; items: GlobalEffectTypeDefinition[] }
    > = {};

    effectCategories.forEach((category) => {
      effectsByCategory[category.label] = {
        category,
        items: [],
      };
    });

    effectsByCategory["Other"] = {
      category: uncategorizedCategory,
      items: [],
    };

    filteredEffects.forEach((effect) => {
      const categoryLabel = effect.category || "Other";
      if (effectsByCategory[categoryLabel]) {
        effectsByCategory[categoryLabel].items.push(effect);
      } else {
        effectsByCategory["Other"].items.push(effect);
      }
    });

    Object.keys(effectsByCategory).forEach((categoryLabel) => {
      if (effectsByCategory[categoryLabel].items.length === 0) {
        delete effectsByCategory[categoryLabel];
      }
    });

    return {
      triggers: triggersByCategory,
      conditions: conditionsByCategory,
      effects: effectsByCategory,
    };
  }, [
    searchTerm,
    availableConditions,
    availableEffects,
    triggers,
    triggerCategories,
    conditionCategories,
    effectCategories,
    itemType,
  ]);

  useEffect(() => {
    const section =
      activeFilter === "triggers"
        ? categorizedItems.triggers
        : activeFilter === "conditions"
        ? categorizedItems.conditions
        : categorizedItems.effects;

    const total = Object.values(section).reduce(
      (sum, { items }) => sum + items.length,
      0
    );

    if (total > 0 && total < 8) {
      const allLabels = Object.values(section).map(
        ({ category }) => category.label
      );
      setExpandedCategories(new Set(allLabels));
    }

  }, [activeFilter, searchTerm]);

  const shouldShowSection = (sectionType: FilterType) => {
    if (!selectedRule && sectionType !== "triggers") {
      return false;
    }

    return activeFilter === sectionType;
  };

  const toggleCategory = (categoryLabel: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryLabel)) {
        newSet.delete(categoryLabel);
      } else {
        newSet.add(categoryLabel);
      }
      return newSet;
    });
  };

  const handleFilterToggle = (filterType: FilterType) => {
    setActiveFilter(filterType);
  };

  const renderCategory = (
    categoryData: {
      category: CategoryDefinition;
      items:
        | GlobalTriggerDefinition[]
        | GlobalConditionTypeDefinition[]
        | GlobalEffectTypeDefinition[];
    },
    type: "trigger" | "condition" | "effect",
    onAdd: (id: string) => void
  ) => {
    const { category, items } = categoryData;
    const isExpanded = expandedCategories.has(category.label);
    const IconComponent = category.icon;

    const getItemName = (
      item: GlobalTriggerDefinition | GlobalConditionTypeDefinition | GlobalEffectTypeDefinition
    ): string => {
      const label = item.label
      if (typeof label === "string") {
        return label
      } 
      if (typeof label[itemType] === "string"){
        return label[itemType]
      }
      return ""
    }

    return (
      <div key={category.label} className="mb-3">
        <button
          onClick={() => toggleCategory(category.label)}
          className="w-full flex items-center justify-between p-2 hover:bg-black-light rounded-md transition-colors"
        >
          <div className="flex items-center gap-2 text-left">
            <IconComponent className="h-4 w-4 text-mint-light flex-shrink-0" />
            <span className="text-left text-white-light text-xs font-medium tracking-wider uppercase whitespace-nowrap flex items-center gap-1">
              {category.label}
            </span>
            <span className="text-white-darker text-xs font-normal">
              ({items.length})
            </span>
          </div>
          {isExpanded ? (
            <ChevronDownIcon className="h-3 w-3 text-white-darker" />
          ) : (
            <ChevronRightIcon className="h-3 w-3 text-white-darker" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2 ml-1 mr-1">
                {items.map((item, index) => (
                  <motion.div
                    key={`${activeFilter}-${item.id}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      delay: index * 0.03,
                      duration: 0.15,
                      ease: "easeOut",
                    }}
                    className="px-2"
                  >
                    <BlockComponent
                      label={getItemName(item)}
                      type={type}
                      onClick={() => onAdd(item.id)}
                      variant="palette"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderSection = (
    categorizedData: Record<
      string,
      {
        category: CategoryDefinition;
        items:
          | GlobalTriggerDefinition[]
          | GlobalConditionTypeDefinition[]
          | GlobalEffectTypeDefinition[];
      }
    >,
    type: "trigger" | "condition" | "effect",
    onAdd: (id: string) => void,
    sectionKey: FilterType
  ) => {
    if (!shouldShowSection(sectionKey)) return null;

    const totalItems = Object.values(categorizedData).reduce(
      (sum, { items }) => sum + items.length,
      0
    );

    if (totalItems === 0 && searchTerm) return null;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {Object.values(categorizedData).map((categoryData) =>
            renderCategory(categoryData, type, onAdd)
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-80 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl z-40"
    >
      <div
        className="flex items-center justify-between p-3 border-b border-black-lighter cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <Bars3Icon className="h-4 w-4 text-white-darker" />
          <SwatchIcon className="h-5 w-5 text-white-light" />
          <h3 className="text-white-light text-sm font-medium tracking-wider">
            Block Palette ({itemType})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        <div className="w-1/4 h-[1px] bg-black-lighter mx-auto mb-4"></div>

        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => handleFilterToggle("triggers")}
            className={`p-2 rounded-md transition-colors cursor-pointer border ${
              activeFilter === "triggers"
                ? "bg-trigger text-black border-trigger"
                : "bg-black-darker text-trigger border-trigger hover:bg-trigger hover:text-black"
            }`}
            title="Filter Triggers"
          >
            <BoltIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleFilterToggle("conditions")}
            disabled={!selectedRule}
            className={`p-2 rounded-md transition-colors cursor-pointer border ${
              !selectedRule
                ? "bg-black-darker text-white-darker border-black-lighter cursor-not-allowed opacity-50"
                : activeFilter === "conditions"
                ? "bg-condition text-white border-condition"
                : "bg-black-darker text-condition border-condition hover:bg-condition hover:text-white"
            }`}
            title="Filter Conditions"
          >
            <BeakerIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleFilterToggle("effects")}
            disabled={!selectedRule}
            className={`p-2 rounded-md transition-colors cursor-pointer border ${
              !selectedRule
                ? "bg-black-darker text-white-darker border-black-lighter cursor-not-allowed opacity-50"
                : activeFilter === "effects"
                ? "bg-effect text-black border-effect"
                : "bg-black-darker text-effect border-effect hover:bg-effect hover:text-black"
            }`}
            title="Filter Effects"
          >
            <PuzzlePieceIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mint stroke-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blocks..."
              className="w-full bg-black-darker border border-black-lighter rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-white-darker focus:outline-none focus:border-mint transition-colors"
            />
          </div>
        </div>

        <div className="h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
          {renderSection(
            categorizedItems.triggers,
            "trigger",
            onAddTrigger,
            "triggers"
          )}

          {renderSection(
            categorizedItems.conditions,
            "condition",
            onAddCondition,
            "conditions"
          )}

          {renderSection(
            categorizedItems.effects,
            "effect",
            onAddEffect,
            "effects"
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockPalette;
