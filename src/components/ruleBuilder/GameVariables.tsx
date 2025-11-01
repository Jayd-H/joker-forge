import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  GAME_VARIABLE_CATEGORIES,
  GameVariable,
  GameVariableCategory,
  GameVariableSubcategory,
} from "../data/GameVars";
import {
  XMarkIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface GameVariablesProps {
  position: { x: number; y: number };
  selectedGameVariable: GameVariable | null;
  onSelectGameVariable: (variable: GameVariable) => void;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const GameVariables: React.FC<GameVariablesProps> = ({
  position,
  onSelectGameVariable,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Set<string>
  >(new Set());

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "panel-gameVariables",
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

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return GAME_VARIABLE_CATEGORIES;
    }

    const search = searchTerm.toLowerCase();
    return GAME_VARIABLE_CATEGORIES.map((category) => {
      const matchingVariables = category.variables.filter(
        (variable) =>
          variable.label.toLowerCase().includes(search) ||
          variable.description.toLowerCase().includes(search) ||
          variable.id.toLowerCase().includes(search)
      );

      const matchingSubcategories =
        category.subcategories
          ?.map((subcategory) => ({
            ...subcategory,
            variables: subcategory.variables.filter(
              (variable) =>
                variable.label.toLowerCase().includes(search) ||
                variable.description.toLowerCase().includes(search) ||
                variable.id.toLowerCase().includes(search)
            ),
          }))
          .filter((subcategory) => subcategory.variables.length > 0) || [];

      const categoryMatches = category.label.toLowerCase().includes(search);

      if (
        categoryMatches ||
        matchingVariables.length > 0 ||
        matchingSubcategories.length > 0
      ) {
        return {
          ...category,
          variables: categoryMatches ? category.variables : matchingVariables,
          subcategories: categoryMatches
            ? category.subcategories
            : matchingSubcategories,
        };
      }

      return null;
    }).filter(Boolean) as GameVariableCategory[];
  }, [searchTerm]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId);
      } else {
        newSet.add(subcategoryId);
      }
      return newSet;
    });
  };

  const handleVariableSelect = (variable: GameVariable) => {
    onSelectGameVariable(variable);
  };

  const renderVariable = (
    variable: GameVariable,
    isNested: boolean = false
  ) => (
    <div
      key={variable.id}
      className={`p-2.5 rounded-lg border border-black-lighter bg-black-darker cursor-pointer transition-all hover:bg-black-dark hover:border-mint/50 active:bg-mint/10 ${
        isNested ? "ml-4 mr-2" : ""
      }`}
      onClick={() => handleVariableSelect(variable)}
    >
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-white-light text-sm font-medium">
          {variable.label}
        </h4>
        <span className="text-xs px-1.5 py-0.5 bg-black-light text-white-dark rounded uppercase tracking-wider">
          {variable.category}
        </span>
      </div>

      <p className="text-white-darker text-xs leading-relaxed mb-2">
        {variable.description}
      </p>

      <div className="bg-black/40 rounded px-2 py-1">
        <code className="text-mint-lighter text-xs font-mono">
          ${variable.id}
        </code>
      </div>
    </div>
  );

  const renderSubcategory = (
    category: GameVariableCategory,
    subcategory: GameVariableSubcategory
  ) => {
    const subcategoryKey = `${category.id}-${subcategory.id}`;
    const isExpanded = expandedSubcategories.has(subcategoryKey);
    const hasVariables = subcategory.variables.length > 0;

    return (
      <div key={subcategoryKey} className="ml-6">
        <div
          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-black-dark/50 transition-colors"
          onClick={() => hasVariables && toggleSubcategory(subcategoryKey)}
        >
          {hasVariables && (
            <>
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-white-darker" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-white-darker" />
              )}
            </>
          )}
          <h4 className="text-white-light text-sm tracking-wide">
            {subcategory.label}
          </h4>
          <span className="text-xs text-white-darker">
            ({subcategory.variables.length})
          </span>
        </div>

        {isExpanded && (
          <div className="space-y-1.5 mt-2">
            {subcategory.variables.map((variable) =>
              renderVariable(variable, true)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (category: GameVariableCategory) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasContent =
      category.variables.length > 0 ||
      (category.subcategories && category.subcategories.length > 0);
    const IconComponent = category.icon;

    return (
      <div
        key={category.id}
        className="border-b border-black-lighter/30 last:border-b-0"
      >
        <div
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-black-dark/50 transition-colors"
          onClick={() => hasContent && toggleCategory(category.id)}
        >
          {hasContent && (
            <>
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-white-darker" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-white-darker" />
              )}
            </>
          )}
          <IconComponent className="h-5 w-5 text-mint-light" />
          <h3 className="text-white-light text-sm font-medium tracking-widest flex-1">
            {category.label}
          </h3>
          <span className="text-xs text-white-darker">
            (
            {category.variables.length +
              (category.subcategories?.reduce(
                (acc, sub) => acc + sub.variables.length,
                0
              ) || 0)}
            )
          </span>
        </div>

        {isExpanded && (
          <div className="pb-3">
            {category.variables.length > 0 && (
              <div className="space-y-1.5 px-3">
                {category.variables.map((variable) => renderVariable(variable))}
              </div>
            )}

            {category.subcategories && category.subcategories.length > 0 && (
              <div className="space-y-2 mt-3">
                {category.subcategories.map((subcategory) =>
                  renderSubcategory(category, subcategory)
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-96 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl select-none max-h-[70vh] z-40 flex flex-col"
    >
      <div
        className="flex items-center justify-between p-3 border-b border-black-lighter cursor-grab flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <Bars3Icon className="h-4 w-4 text-white-darker" />
          <h3 className="text-white-light text-sm font-medium tracking-wider">
            Game Variables
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 flex flex-col min-h-0 flex-1">
        <div className="relative mb-3 flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-white-darker" />
          </div>
          <input
            type="text"
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black-darker border border-black-lighter rounded-lg text-white-light placeholder-white-darker text-sm focus:outline-none focus:border-mint transition-colors"
          />
        </div>

        <div className="overflow-y-auto custom-scrollbar min-h-0 flex-1 -mx-3">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 px-3">
              <div className="text-white-darker text-sm">
                No variables found
              </div>
              <div className="text-white-darker text-xs mt-1">
                Try adjusting your search terms
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredCategories.map((category) => renderCategory(category))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameVariables;
