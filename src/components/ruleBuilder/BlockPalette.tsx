import React, { useState, useMemo, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Rule,
  TriggerDefinition,
  ConditionTypeDefinition,
  EffectTypeDefinition,
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
  TRIGGERS,
  TRIGGER_CATEGORIES,
  type CategoryDefinition,
} from "../data/Jokers/Triggers";
import {
  getConditionsForTrigger,
  CONDITION_CATEGORIES,
} from "../data/Jokers/Conditions";
import {
  getEffectsForTrigger,
  EFFECT_CATEGORIES,
} from "../data/Jokers/Effects";

import {
  CONSUMABLE_TRIGGERS,
  CONSUMABLE_TRIGGER_CATEGORIES,
} from "../data/Consumables/Triggers";
import {
  getConsumableConditionsForTrigger,
  CONSUMABLE_CONDITION_CATEGORIES,
} from "../data/Consumables/Conditions";
import {
  getConsumableEffectsForTrigger,
  CONSUMABLE_EFFECT_CATEGORIES,
} from "../data/Consumables/Effects";
import { CARD_TRIGGERS, CARD_TRIGGER_CATEGORIES } from "../data/Card/Triggers";
import { VOUCHER_TRIGGERS, VOUCHER_TRIGGER_CATEGORIES } from "../data/Vouchers/Triggers";
import { DECK_TRIGGERS, DECK_TRIGGER_CATEGORIES } from "../data/Decks/Triggers";
import {
  CARD_CONDITION_CATEGORIES,
  getCardConditionsForTrigger,
} from "../data/Card/Conditions";
import {
  CARD_EFFECT_CATEGORIES,
  getCardEffectsForTrigger,
} from "../data/Card/Effects";
import {
  getVoucherConditionsForTrigger,
} from "../data/Vouchers/Conditions";
import {
  VOUCHER_EFFECT_CATEGORIES,
  getVoucherEffectsForTrigger,
} from "../data/Vouchers/Effects";
import {
  DECK_EFFECT_CATEGORIES,
  getDeckEffectsForTrigger,
} from "../data/Decks/Effects";

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

  const triggers =
    itemType === "joker"
      ? TRIGGERS
      : itemType === "consumable"
      ? CONSUMABLE_TRIGGERS
      : itemType === "card"
      ? CARD_TRIGGERS
      : itemType === "voucher"
      ? VOUCHER_TRIGGERS
      : DECK_TRIGGERS

  const triggerCategories =
    itemType === "joker"
      ? TRIGGER_CATEGORIES
      : itemType === "consumable"
      ? CONSUMABLE_TRIGGER_CATEGORIES
      : itemType === "card"
      ? CARD_TRIGGER_CATEGORIES
      : itemType === "voucher"
      ? VOUCHER_TRIGGER_CATEGORIES
      : DECK_TRIGGER_CATEGORIES

  const conditionCategories =
    itemType === "joker"
      ? CONDITION_CATEGORIES
      : itemType === "consumable"
      ? CONSUMABLE_CONDITION_CATEGORIES
      : CARD_CONDITION_CATEGORIES

  const effectCategories =
    itemType === "joker"
      ? EFFECT_CATEGORIES
      : itemType === "consumable"
      ? CONSUMABLE_EFFECT_CATEGORIES
      : itemType === "card"
      ? CARD_EFFECT_CATEGORIES
      : itemType === "voucher"
      ? VOUCHER_EFFECT_CATEGORIES
      : DECK_EFFECT_CATEGORIES

  const getConditionsForTriggerFn =
    itemType === "joker"
      ? getConditionsForTrigger
      : itemType === "consumable"
      ? getConsumableConditionsForTrigger
      : itemType === "card"
      ? getCardConditionsForTrigger
      : getVoucherConditionsForTrigger

  const getEffectsForTriggerFn =
    itemType === "joker"
      ? getEffectsForTrigger
      : itemType === "consumable"
      ? getConsumableEffectsForTrigger
      : itemType === "card"
      ? getCardEffectsForTrigger
      : itemType === "voucher"
      ? getVoucherEffectsForTrigger
      : getDeckEffectsForTrigger

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
    return selectedRule ? getConditionsForTriggerFn(selectedRule.trigger) : [];
  }, [selectedRule, getConditionsForTriggerFn]);

  const availableEffects = useMemo(() => {
    return selectedRule ? getEffectsForTriggerFn(selectedRule.trigger) : [];
  }, [selectedRule, getEffectsForTriggerFn]);

  const categorizedItems = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    const filteredTriggers = triggers.filter(
      (trigger) =>
        trigger.label.toLowerCase().includes(normalizedSearch) ||
        trigger.description.toLowerCase().includes(normalizedSearch)
    );

    const triggersByCategory: Record<
      string,
      { category: CategoryDefinition; items: TriggerDefinition[] }
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
      if (triggersByCategory[categoryLabel]) {
        triggersByCategory[categoryLabel].items.push(trigger);
      } else {
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
      { category: CategoryDefinition; items: ConditionTypeDefinition[] }
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
      { category: CategoryDefinition; items: EffectTypeDefinition[] }
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
  }, [activeFilter, categorizedItems, searchTerm]);

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
        | TriggerDefinition[]
        | ConditionTypeDefinition[]
        | EffectTypeDefinition[];
    },
    type: "trigger" | "condition" | "effect",
    onAdd: (id: string) => void
  ) => {
    const { category, items } = categoryData;
    const isExpanded = expandedCategories.has(category.label);
    const IconComponent = category.icon;

    return (
      <div key={category.label} className="mb-3">
        <button
          onClick={() => toggleCategory(category.label)}
          className="w-full flex items-center justify-between p-2 hover:bg-black-light rounded-md transition-colors"
        >
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4 text-mint-light" />
            <span className="text-white-light text-xs font-medium tracking-wider uppercase">
              {category.label}
            </span>
            <span className="text-white-darker text-xs">({items.length})</span>
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
                      label={item.label}
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
          | TriggerDefinition[]
          | ConditionTypeDefinition[]
          | EffectTypeDefinition[];
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
