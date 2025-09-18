import React, { useState, useMemo, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import {
  PlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  SwatchIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CakeIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { SketchPicker, ColorResult } from "react-color";
import ConsumableCard from "./consumables/ConsumableCard";
import EditConsumableInfo from "./consumables/EditConsumableInfo";
import Button from "../generic/Button";
import InputField from "../generic/InputField";
import Modal from "../generic/Modal";
import { Suspense, lazy } from "react";
const RuleBuilder = lazy(() => import("../ruleBuilder/RuleBuilder"));
import RuleBuilderLoading from "../generic/RuleBuilderLoading";
import type { Rule } from "../ruleBuilder/types";
import { validateJokerName } from "../generic/validationUtils";
import {
  ConsumableSetData,
  slugify,
  ConsumableData,
} from "../data/BalatroUtils";
import { exportSingleConsumable } from "../codeGeneration/Consumables";
import { UserConfigContext } from "../Contexts";
import { updateGameObjectIds, getObjectName } from "../generic/GameObjectOrdering";


interface ConsumablesPageProps {
  modName: string;
  consumables: ConsumableData[];
  setConsumables: React.Dispatch<React.SetStateAction<ConsumableData[]>>;
  selectedConsumableId: string | null;
  setSelectedConsumableId: React.Dispatch<React.SetStateAction<string | null>>;
  modPrefix: string;
  consumableSets: ConsumableSetData[];
  setConsumableSets: React.Dispatch<React.SetStateAction<ConsumableSetData[]>>;
  showConfirmation: (options: {
    type?: "default" | "warning" | "danger" | "success";
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "primary" | "secondary" | "danger";
    icon?: React.ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
}

interface ConsumableSetCardProps {
  set: ConsumableSetData;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onQuickUpdate: (updates: Partial<ConsumableSetData>) => void;
}

interface EditConsumableSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingSet: ConsumableSetData | null;
  setFormData: ConsumableSetData;
  onFormDataChange: (updates: Partial<ConsumableSetData>) => void;
}

const ConsumableSetCard: React.FC<ConsumableSetCardProps> = ({
  set,
  onEdit,
  onDelete,
  onDuplicate,
  onQuickUpdate,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [editingShopRate, setEditingShopRate] = useState(false);
  const [tempName, setTempName] = useState(set.name);
  const [tempShopRate, setTempShopRate] = useState(set.shop_rate ?? 1);

  const handleNameSave = () => {
    const validation = validateJokerName(tempName);
    if (validation.isValid) {
      onQuickUpdate({ name: tempName });
      setEditingName(false);
    }
  };

  const handleShopRateSave = () => {
    onQuickUpdate({ shop_rate: tempShopRate });
    setEditingShopRate(false);
  };

  const getPrimaryColor = () => {
    if (set.primary_colour.startsWith("#")) {
      return set.primary_colour;
    }
    return `#${set.primary_colour}`;
  };

  return (
    <div className="p-6 relative group">
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 bg-black-dark border-2 border-balatro-red rounded-lg p-2 hover:bg-balatro-redshadow cursor-pointer transition-colors flex items-center justify-center z-10"
      >
        <TrashIcon className="h-4 w-4 text-balatro-red" />
      </button>

      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-sm border-2 relative overflow-hidden"
          style={{
            backgroundColor: getPrimaryColor(),
            borderColor: getPrimaryColor(),
          }}
        >
          <span className="relative text-[#fff]">
            {set.name.substring(0, 3).toUpperCase()}
          </span>
        </div>

        <div className="flex-1">
          <div className="mb-2">
            {editingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave();
                  if (e.key === "Escape") {
                    setTempName(set.name);
                    setEditingName(false);
                  }
                }}
                className="text-xl font-medium text-white-light bg-transparent border-none outline-none border-b-2 border-mint"
                autoFocus
              />
            ) : (
              <h3
                className="text-xl font-medium text-white-light cursor-pointer hover:text-mint transition-colors"
                onClick={() => {
                  setTempName(set.name);
                  setEditingName(true);
                }}
              >
                {set.name}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-white-darker text-sm">Key:</span>
            <span className="text-white-light text-sm font-mono">
              {set.key}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white-darker text-sm">Shop Rate:</span>
            {editingShopRate ? (
              <input
                type="number"
                step="0.1"
                min="0"
                value={tempShopRate}
                onChange={(e) =>
                  setTempShopRate(parseFloat(e.target.value) ?? 1)
                }
                onBlur={handleShopRateSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleShopRateSave();
                  if (e.key === "Escape") {
                    setTempShopRate(set.shop_rate ?? 1);
                    setEditingShopRate(false);
                  }
                }}
                className="text-sm text-white-light bg-transparent border-none outline-none border-b border-mint w-20"
                autoFocus
              />
            ) : (
              <span
                className="text-white-light text-sm cursor-pointer hover:text-mint transition-colors"
                onClick={() => {
                  setTempShopRate(set.shop_rate ?? 1);
                  setEditingShopRate(true);
                }}
              >
                {set.shop_rate ?? 1}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-black-lighter pt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={onEdit}
          icon={<PencilIcon className="h-4 w-4" />}
        >
          Edit
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onDuplicate}
          icon={<DocumentDuplicateIcon className="h-4 w-4" />}
        >
          Duplicate
        </Button>
      </div>
    </div>
  );
};

const EditConsumableSetModal: React.FC<EditConsumableSetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSet,
  setFormData,
  onFormDataChange,
}) => {
  const generateKeyFromName = (name: string): string => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^[0-9]+/, "") || "custom_set"
    );
  };

  const handleColorChange = (color: ColorResult) => {
    const colorHex = color.hex.replace("#", "");
    onFormDataChange({
      primary_colour: colorHex,
      secondary_colour: colorHex,
    });
  };

  const getPreviewColor = () => {
    const color = setFormData.primary_colour || "666666";
    return color.startsWith("#") ? color : `#${color}`;
  };

  const darkenColor = (hexColor: string, amount: number = 0.4): string => {
    const hex = hexColor.replace("#", "");

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));

    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  };

  const isEditingExistingSet = editingSet && setFormData.id === editingSet.id;

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditingExistingSet
          ? "Edit Consumable Set"
          : "Create New Consumable Set"
      }
      maxWidth="max-w-5xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="p-4">
                <div className="space-y-4">
                  <InputField
                    label="Set Name"
                    value={setFormData.name || ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      onFormDataChange({
                        name,
                        key: generateKeyFromName(name),
                        collection_name: `${name} Cards`,
                      });
                    }}
                    placeholder="e.g. Mystical"
                  />
                  <InputField
                    label="Set Key"
                    value={setFormData.key || ""}
                    onChange={(e) =>
                      onFormDataChange({
                        key: e.target.value,
                      })
                    }
                    placeholder="e.g. mystical"
                  />
                  <p className="text-xs text-white-darker">
                    Unique identifier used in code.
                  </p>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-white-light font-medium mb-4">
                  Collection Settings
                </h3>
                <div className="space-y-3">
                  <InputField
                    label="Collection Name"
                    value={setFormData.collection_name || ""}
                    onChange={(e) =>
                      onFormDataChange({
                        collection_name: e.target.value,
                      })
                    }
                    placeholder="e.g. Mystical Cards"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Collection Row 1"
                      value={
                        setFormData.collection_rows?.[0]?.toString() || "4"
                      }
                      onChange={(e) =>
                        onFormDataChange({
                          collection_rows: [
                            parseInt(e.target.value) || 4,
                            setFormData.collection_rows?.[1] || 5,
                          ],
                        })
                      }
                      type="number"
                      min="1"
                      max="10"
                    />
                    <InputField
                      label="Collection Row 2"
                      value={
                        setFormData.collection_rows?.[1]?.toString() || "5"
                      }
                      onChange={(e) =>
                        onFormDataChange({
                          collection_rows: [
                            setFormData.collection_rows?.[0] || 4,
                            parseInt(e.target.value) || 5,
                          ],
                        })
                      }
                      type="number"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-white-light font-medium mb-4">
                  Shop Settings
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={setFormData.shop_rate ?? 1}
                      onChange={(e) =>
                        onFormDataChange({
                          shop_rate: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 h-2 bg-black-lighter rounded appearance-none cursor-pointer"
                    />
                    <span className="text-mint font-mono w-16 text-sm">
                      {(setFormData.shop_rate ?? 1).toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-white-darker">
                    Shop appearance rate.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 mt-4 space-y-4">
              <div>
                <h3 className="text-white-light font-medium mb-4">Set Color</h3>
                <div
                  className="mx-auto"
                  style={{
                    position: "relative",
                    zIndex: 1000,
                    pointerEvents: "auto",
                  }}
                >
                  <SketchPicker
                    color={getPreviewColor()}
                    onChange={handleColorChange}
                    onChangeComplete={handleColorChange}
                    disableAlpha={true}
                    width="100%"
                    styles={{
                      default: {
                        picker: {
                          background: "#1A1A1A",
                          border: "1px solid #333333",
                          borderRadius: "0.5rem",
                          boxShadow: "none",
                          fontFamily: "inherit",
                          pointerEvents: "auto",
                          position: "relative",
                          zIndex: 1001,
                        },
                        saturation: {
                          pointerEvents: "auto",
                          cursor: "crosshair",
                          userSelect: "none",
                          touchAction: "none",
                        },
                        hue: {
                          pointerEvents: "auto",
                          cursor: "pointer",
                          userSelect: "none",
                          touchAction: "none",
                        },
                        alpha: {
                          pointerEvents: "auto",
                          cursor: "pointer",
                          userSelect: "none",
                          touchAction: "none",
                        },
                        color: {
                          cursor: "pointer",
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <div className="relative mx-6">
                  <div
                    className="absolute inset-0 rounded-xl translate-y-1"
                    style={{
                      backgroundColor: darkenColor(getPreviewColor()),
                    }}
                  />
                  <div
                    className="rounded-xl text-center text-lg py-2 relative px-12"
                    style={{
                      backgroundColor: getPreviewColor(),
                    }}
                  >
                    <span className="relative font-bold text-[#fff]">
                      {setFormData.name || "Set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4 p-4 bg-black-dark border-t border-black-lighter">
          <Button
            variant="secondary"
            onClick={onClose}
            className="mx-auto w-full"
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} className="mx-auto w-full">
            {isEditingExistingSet ? "Save Changes" : "Create Set"}
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
};

const FloatingTabDock: React.FC<{
  activeTab: "consumables" | "sets";
  onTabChange: (tab: "consumables" | "sets") => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "consumables" as const,
      icon: CakeIcon,
      label: "Consumables",
    },
    {
      id: "sets" as const,
      icon: SwatchIcon,
      label: "Sets",
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black-dark border-2 border-black-lighter rounded-full px-3 py-2 shadow-2xl">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative group p-3 rounded-full transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-mint/20 border-2 border-mint text-mint scale-110"
                      : "bg-black-darker/50 border-2 border-black-lighter text-white-darker hover:border-mint hover:text-mint hover:scale-105"
                  }
                `}
                title={tab.label}
              >
                <Icon className="h-5 w-5" />

                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black-darker border border-black-lighter rounded-lg px-2 py-1 whitespace-nowrap">
                    <span className="text-white-light text-xs font-medium">
                      {tab.label}
                    </span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black-lighter"></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

type SortOption<T = ConsumableData | ConsumableSetData> = {
  value: string;
  label: string;
  sortFn: (a: T, b: T) => number;
};

let availablePlaceholders: string[] | null = null;
let upscaledPlaceholders: string[] | null = null;

const upscaleImage = (imageSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width === 71 && img.height === 95) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 142;
        canvas.height = 190;

        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, 142, 190);
        }

        resolve(canvas.toDataURL("image/png"));
      } else {
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

const getRandomPlaceholderConsumable = async (): Promise<{
  imageData: string;
  creditIndex?: number;
}> => {
  if (upscaledPlaceholders && upscaledPlaceholders.length > 0) {
    const randomIndex = Math.floor(Math.random() * upscaledPlaceholders.length);
    const imagePath = availablePlaceholders?.[randomIndex];
    const match = imagePath?.match(/placeholder-consumable-(\d+)\.png/);
    const imageNumber = match ? parseInt(match[1], 10) : randomIndex + 1;

    return {
      imageData: upscaledPlaceholders[randomIndex],
      creditIndex: imageNumber,
    };
  }

  if (availablePlaceholders && availablePlaceholders.length > 0) {
    const upscaled = await Promise.all(
      availablePlaceholders.map((placeholder) => upscaleImage(placeholder))
    );
    upscaledPlaceholders = upscaled;
    const randomIndex = Math.floor(Math.random() * upscaled.length);
    const match = availablePlaceholders[randomIndex].match(
      /placeholder-consumable-(\d+)\.png/
    );
    const imageNumber = match ? parseInt(match[1], 10) : 1;

    return {
      imageData: upscaled[randomIndex],
      creditIndex: imageNumber,
    };
  }

  const checkImage = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  };

  const placeholders: string[] = [];
  let counter = 1;
  let keepChecking = true;

  while (keepChecking) {
    const imagePath = `/images/placeholderconsumables/placeholder-consumable-${counter}.png`;

    if (await checkImage(imagePath)) {
      placeholders.push(imagePath);
      counter++;
    } else {
      keepChecking = false;
    }
  }

  availablePlaceholders = placeholders;

  if (placeholders.length === 0) {
    return { imageData: "/images/placeholder-consumable.png" };
  }

  const upscaled = await Promise.all(
    placeholders.map((placeholder) => upscaleImage(placeholder))
  );
  upscaledPlaceholders = upscaled;

  const randomIndex = Math.floor(Math.random() * upscaled.length);
  const match = placeholders[randomIndex].match(
    /placeholder-consumable-(\d+)\.png/
  );
  const imageNumber = match ? parseInt(match[1], 15) : 1;

  return {
    imageData: upscaled[randomIndex],
    creditIndex: imageNumber,
  };
};

const isPlaceholderConsumable = (imagePath: string): boolean => {
  return (
    imagePath.includes("/images/placeholderconsumables/") ||
    imagePath.includes("placeholder-consumable") ||
    imagePath.startsWith("data:image")
  );
};

const ConsumablesPage: React.FC<ConsumablesPageProps> = ({
  modName,
  consumables,
  setConsumables,
  selectedConsumableId,
  setSelectedConsumableId,
  modPrefix,
  consumableSets,
  setConsumableSets,
  showConfirmation,
}) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext);
  const [activeTab, setActiveTab] = useState<"consumables" | "sets">(
    "consumables"
  );
  const [editingConsumable, setEditingConsumable] =
    useState<ConsumableData | null>(null);
  const [editingSet, setEditingSet] = useState<ConsumableSetData | null>(null);
  const [showEditSetModal, setShowEditSetModal] = useState(false);
  const [setFormData, setSetFormData] = useState<ConsumableSetData>({
    id: "",
    key: "",
    name: "",
    primary_colour: "666666",
    secondary_colour: "666666",
    collection_rows: [4, 5],
    shop_rate: 1,
    collection_name: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [setFilter, setSetFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(
    userConfig.filters.consumablesFilter ?? "name-asc"
  );
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [filtersMenuPosition, setFiltersMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentConsumableForRules, setCurrentConsumableForRules] =
    useState<ConsumableData | null>(null);

  const sortButtonRef = React.useRef<HTMLButtonElement>(null);
  const filtersButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);
  const filtersMenuRef = React.useRef<HTMLDivElement>(null);

  const consumableSortOptions: SortOption<ConsumableData>[] = useMemo(
    () => [
      {
        value: "id-desc",
        label: "Id Value (Most to Least)",
        sortFn: (a, b) => b.orderValue - a.orderValue,
      },
      {
        value: "id-asc",
        label: "Id Value (Least to Most)",
        sortFn: (a, b) => a.orderValue - b.orderValue,
      },
      {
        value: "name-asc",
        label: "Name (A-Z)",
        sortFn: (a, b) => a.name.localeCompare(b.name),
      },
      {
        value: "name-desc",
        label: "Name (Z-A)",
        sortFn: (a, b) => b.name.localeCompare(a.name),
      },
      {
        value: "set-asc",
        label: "Set (A-Z)",
        sortFn: (a, b) => a.set.localeCompare(b.set),
      },
      {
        value: "set-desc",
        label: "Set (Z-A)",
        sortFn: (a, b) => b.set.localeCompare(a.set),
      },
      {
        value: "cost-asc",
        label: "Cost (Low to High)",
        sortFn: (a, b) => (a.cost || 0) - (b.cost || 0),
      },
      {
        value: "cost-desc",
        label: "Cost (High to Low)",
        sortFn: (a, b) => (b.cost || 0) - (a.cost || 0),
      },
      {
        value: "rules-desc",
        label: "Rules (Most to Least)",
        sortFn: (a, b) => (b.rules?.length || 0) - (a.rules?.length || 0),
      },
      {
        value: "rules-asc",
        label: "Rules (Least to Most)",
        sortFn: (a, b) => (a.rules?.length || 0) - (b.rules?.length || 0),
      },
    ],
    []
  );

  const setSortOptions: SortOption<ConsumableSetData>[] = useMemo(
    () => [
      {
        value: "name-asc",
        label: "Name (A-Z)",
        sortFn: (a, b) => a.name.localeCompare(b.name),
      },
      {
        value: "name-desc",
        label: "Name (Z-A)",
        sortFn: (a, b) => b.name.localeCompare(a.name),
      },
      {
        value: "key-asc",
        label: "Key (A-Z)",
        sortFn: (a, b) => a.key.localeCompare(b.key),
      },
      {
        value: "key-desc",
        label: "Key (Z-A)",
        sortFn: (a, b) => b.key.localeCompare(a.key),
      },
    ],
    []
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortButtonRef.current &&
        !sortButtonRef.current.contains(event.target as Node) &&
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node)
      ) {
        setShowSortMenu(false);
      }
      if (
        filtersButtonRef.current &&
        !filtersButtonRef.current.contains(event.target as Node) &&
        filtersMenuRef.current &&
        !filtersMenuRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showSortMenu && sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setSortMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 224,
        width: 224,
      });
    }
  }, [showSortMenu]);

  useEffect(() => {
    if (showFilters && filtersButtonRef.current) {
      const rect = filtersButtonRef.current.getBoundingClientRect();
      setFiltersMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 256,
        width: 256,
      });
    }
  }, [showFilters]);

  const generateKeyFromName = (name: string): string => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^[0-9]+/, "") || "custom_set"
    );
  };

  const handleAddNewConsumable = async () => {
    const placeholderResult = await getRandomPlaceholderConsumable();

    const newConsumable: ConsumableData = {
      id: crypto.randomUUID(),
      name: "New Consumable",
      description:
        "A {C:purple}custom{} consumable with {C:blue}unique{} effects.",
      imagePreview: placeholderResult.imageData,
      overlayImagePreview: "",
      orderValue: consumables.length+1,
      set: "Tarot",
      cost: 3,
      unlocked: true,
      discovered: true,
      hidden: false,
      rules: [],
      placeholderCreditIndex: placeholderResult.creditIndex,
      objectKey: slugify("New Consumable"),
      objectType: "consumable",
    };
    newConsumable.objectKey = getObjectName(newConsumable,consumables,newConsumable.objectKey)
    setConsumables([...consumables, newConsumable]);
    setEditingConsumable(newConsumable);
  };

  const handleAddNewSet = () => {
    const newSet: ConsumableSetData = {
      id: crypto.randomUUID(),
      key: "new_set",
      name: "New Set",
      primary_colour: "666666",
      secondary_colour: "666666",
      collection_rows: [4, 5],
      shop_rate: 1,
      collection_name: "New Set Cards",
    };
    setEditingSet(newSet);
    setSetFormData(newSet);
    setShowEditSetModal(true);
  };

  const handleEditSet = (set: ConsumableSetData) => {
    setEditingSet(set);
    setSetFormData(set);
    setShowEditSetModal(true);
  };

  const closeSetModal = () => {
    setShowEditSetModal(false);
    setEditingSet(null);
    setSetFormData({
      id: "",
      key: "",
      name: "",
      primary_colour: "666666",
      secondary_colour: "666666",
      collection_rows: [4, 5],
      shop_rate: 1,
      collection_name: "",
    });
  };

  const handleSaveSet = () => {
    if (!setFormData.name?.trim()) return;

    const isEditing =
      editingSet && consumableSets.find((s) => s.id === editingSet.id);

    const setToSave: ConsumableSetData = {
      id: editingSet?.id || crypto.randomUUID(),
      key: setFormData.key || generateKeyFromName(setFormData.name),
      name: setFormData.name,
      primary_colour: (setFormData.primary_colour || "666666").replace("#", ""),
      secondary_colour: (setFormData.secondary_colour || "666666").replace(
        "#",
        ""
      ),
      collection_rows: setFormData.collection_rows || [4, 5],
      default_card: setFormData.default_card,
      shop_rate: setFormData.shop_rate ?? 1,
      collection_name:
        setFormData.collection_name || `${setFormData.name} Cards`,
    };

    if (isEditing) {
      setConsumableSets((prev) =>
        prev.map((s) => (s.id === editingSet.id ? setToSave : s))
      );
    } else {
      setConsumableSets((prev) => [...prev, setToSave]);
    }

    closeSetModal();
  };

  const handleDeleteSet = (set: ConsumableSetData) => {
    showConfirmation({
      type: "danger",
      title: "Delete Consumable Set",
      description: `Are you sure you want to delete the "${set.name}" set? This action cannot be undone and may affect consumables using this set.`,
      confirmText: "Delete Set",
      cancelText: "Keep Set",
      confirmVariant: "danger",
      onConfirm: () => {
        setConsumableSets((prev) => prev.filter((s) => s.id !== set.id));
      },
    });
  };
  const handleDuplicateSet = (set: ConsumableSetData) => {
    const duplicated: ConsumableSetData = {
      ...set,
      id: crypto.randomUUID(),
      name: `${set.name} Copy`,
      key: generateKeyFromName(`${set.name} Copy`),
    };
    setConsumableSets((prev) => [...prev, duplicated]);
  };

  const handleQuickUpdateSet = (
    set: ConsumableSetData,
    updates: Partial<ConsumableSetData>
  ) => {
    const updatedSet = { ...set, ...updates };
    setConsumableSets((prev) =>
      prev.map((s) => (s.id === set.id ? updatedSet : s))
    );
  };

  const handleSaveConsumable = (updatedConsumable: ConsumableData) => {
    setConsumables((prev) =>
      prev.map((consumable) =>
        consumable.id === updatedConsumable.id ? updatedConsumable : consumable
      )
    );
  };

  const handleDeleteConsumable = (consumableId: string) => {
    const removedConsumable = consumables.filter(cons => cons.id !== consumableId)[0]
    setConsumables((prev) =>prev.filter((consumable) => consumable.id !== consumableId));

    if (selectedConsumableId === consumableId) {
      const remainingConsumables = consumables.filter((consumable) => consumable.id !== consumableId);
      setSelectedConsumableId(remainingConsumables.length > 0 ? remainingConsumables[0].id : null)
      consumables = updateGameObjectIds(removedConsumable, consumables, 'remove', removedConsumable.orderValue)
  }};

  const handleDuplicateConsumable = async (consumable: ConsumableData) => {
    const dupeName = slugify(getObjectName(consumable,consumables))
    if (isPlaceholderConsumable(consumable.imagePreview)) {
      const placeholderResult = await getRandomPlaceholderConsumable();
      const duplicatedConsumable: ConsumableData = {
        ...consumable,
        id: crypto.randomUUID(),
        name: consumable.name,
        imagePreview: placeholderResult.imageData,
        placeholderCreditIndex: placeholderResult.creditIndex,
        objectKey: `${dupeName}`,
        orderValue: consumable.orderValue+1,
      };
      setConsumables([...consumables, duplicatedConsumable]);
      consumables = updateGameObjectIds(duplicatedConsumable, consumables, 'insert', duplicatedConsumable.orderValue)
    } else {
      const duplicatedConsumable: ConsumableData = {
        ...consumable,
        id: crypto.randomUUID(),
        name: `${dupeName}`,
        objectKey: slugify(`${dupeName}`),
        orderValue: consumable.orderValue+1,
      };
      setConsumables([...consumables, duplicatedConsumable]);
      consumables = updateGameObjectIds(duplicatedConsumable, consumables, 'insert', duplicatedConsumable.orderValue)
  }};

  const handleExportConsumable = (consumable: ConsumableData) => {
    try {
      exportSingleConsumable(consumable);
    } catch (error) {
      console.error("Failed to export consumable:", error);
    }
  };

  const handleQuickUpdate = (
    consumable: ConsumableData,
    updates: Partial<ConsumableData>
  ) => {
    const updatedConsumable = { ...consumable, ...updates };
    handleSaveConsumable(updatedConsumable);
  };

  const handleEditInfo = (consumable: ConsumableData) => {
    setEditingConsumable(consumable);
  };

  const handleEditRules = (consumable: ConsumableData) => {
    setCurrentConsumableForRules(consumable);
    setShowRuleBuilder(true);
  };

  const handleSaveRules = (rules: Rule[]) => {
    if (currentConsumableForRules) {
      const updatedConsumable = { ...currentConsumableForRules, rules };
      handleSaveConsumable(updatedConsumable);
      setCurrentConsumableForRules(updatedConsumable);
    }
  };

  const handleUpdateConsumableFromRuleBuilder = (
    updates: Partial<ConsumableData>
  ) => {
    if (currentConsumableForRules) {
      const updatedConsumable = { ...currentConsumableForRules, ...updates };
      handleSaveConsumable(updatedConsumable);
      setCurrentConsumableForRules(updatedConsumable);
    }
  };

  const handleSortMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showFilters) setShowFilters(false);
    setShowSortMenu(!showSortMenu);
  };

  const currentSortOptions =
    activeTab === "consumables" ? consumableSortOptions : setSortOptions;

  const filteredAndSortedConsumables = useMemo(() => {
    const filtered = consumables.filter((consumable) => {
      const matchesSearch =
        consumable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumable.description.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesSet = true;
      if (setFilter !== null) {
        matchesSet = consumable.set === setFilter;
      }

      return matchesSearch && matchesSet;
    });

    const currentSort = consumableSortOptions.find(
      (option) => option.value === sortBy
    );
    if (currentSort) {
      filtered.sort(currentSort.sortFn);
    }

    return filtered;
  }, [consumables, searchTerm, setFilter, sortBy, consumableSortOptions]);

  const filteredAndSortedSets = useMemo(() => {
    const filtered = consumableSets.filter(
      (set) =>
        set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentSort = setSortOptions.find(
      (option) => option.value === sortBy
    );
    if (currentSort) {
      filtered.sort(currentSort.sortFn);
    }

    return filtered;
  }, [consumableSets, searchTerm, sortBy, setSortOptions]);

  const setOptions = [
    { value: null, label: "All Sets", count: consumables.length },
    {
      value: "Tarot",
      label: "Tarot",
      count: consumables.filter((c) => c.set === "Tarot").length,
    },
    {
      value: "Planet",
      label: "Planet",
      count: consumables.filter((c) => c.set === "Planet").length,
    },
    {
      value: "Spectral",
      label: "Spectral",
      count: consumables.filter((c) => c.set === "Spectral").length,
    },
    ...consumableSets.map((set) => ({
      value: set.key,
      label: set.name,
      count: consumables.filter((c) => c.set === set.key).length,
    })),
  ];

  const getSetColor = (set: string | null) => {
    switch (set) {
      case "Tarot":
        return "text-balatro-purple";
      case "Planet":
        return "text-balatro-blue";
      case "Spectral":
        return "text-balatro-spectral";
      default:
        return "text-white-light";
    }
  };

  const currentSortLabel =
    currentSortOptions.find((option) => option.value === sortBy)?.label ||
    "Id Value (Most to Least)";

  return (
    <div className="min-h-screen pb-24">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Consumables
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          {modName}
        </h1>

        <div className="flex justify-center mb-2">
          <Button
            variant="primary"
            onClick={
              activeTab === "consumables"
                ? handleAddNewConsumable
                : handleAddNewSet
            }
            icon={<PlusIcon className="h-5 w-5" />}
            size="md"
            className="shadow-lg hover:shadow-2xl transition-shadow"
          >
            {activeTab === "consumables" ? "Add New Consumable" : "Add New Set"}
          </Button>
        </div>

        <div className="flex items-center mb-2">
          <div>
            <div className="flex items-center gap-6 text-white-darker text-sm">
              <div className="flex items-center">
                {activeTab === "consumables" ? (
                  <DocumentTextIcon className="h-4 w-4 mr-2 text-mint" />
                ) : (
                  <SwatchIcon className="h-4 w-4 mr-2 text-mint" />
                )}
                {modName} •{" "}
                {activeTab === "consumables"
                  ? `${filteredAndSortedConsumables.length} of ${
                      consumables.length
                    } consumable${consumables.length !== 1 ? "s" : ""}`
                  : `${filteredAndSortedSets.length} of ${
                      consumableSets.length
                    } set${consumableSets.length !== 1 ? "s" : ""}`}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white-darker group-focus-within:text-mint transition-colors" />
              <input
                type="text"
                placeholder={`Search ${activeTab} by name${
                  activeTab === "consumables" ? " or description" : " or key"
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black-darker shadow-2xl border-2 border-black-lighter rounded-lg pl-12 pr-4 py-4 text-white-light tracking-wider placeholder-white-darker focus:outline-none focus:border-mint transition-all duration-200"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <button
                  ref={sortButtonRef}
                  onClick={handleSortMenuToggle}
                  className="flex items-center gap-2 bg-black-dark text-white-light px-4 py-4 border-2 border-black-lighter rounded-lg hover:border-mint transition-colors cursor-pointer"
                >
                  <ArrowsUpDownIcon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{currentSortLabel}</span>
                </button>
              </div>
              {activeTab === "consumables" && (
                <div className="relative">
                  <button
                    ref={filtersButtonRef}
                    onClick={() => {
                      if (showSortMenu) setShowSortMenu(false);
                      setShowFilters(!showFilters);
                    }}
                    className="flex items-center gap-2 bg-black-dark text-white-light px-4 py-4 border-2 border-black-lighter rounded-lg hover:border-mint transition-colors cursor-pointer"
                  >
                    <SwatchIcon className="h-4 w-4" />
                    <span className="whitespace-nowrap">
                      {setFilter
                        ? setOptions.find((opt) => opt.value === setFilter)
                            ?.label
                        : "All Sets"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {activeTab === "consumables" ? (
          filteredAndSortedConsumables.length === 0 &&
          consumables.length > 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="rounded-2xl p-8 max-w-md">
                <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
                <h3 className="text-white-light text-xl font-light mb-3">
                  No Consumables Found
                </h3>
                <p className="text-white-darker text-sm mb-6 leading-relaxed">
                  No consumables match your current search and filter criteria.
                  Try adjusting your filters or search terms.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setSetFilter(null);
                  }}
                  fullWidth
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : filteredAndSortedConsumables.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="rounded-2xl p-8 max-w-md">
                <DocumentTextIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
                <h3 className="text-white-light text-xl font-light mb-3">
                  No Consumables Yet :(
                </h3>
                <p className="text-white-darker text-sm mb-6 leading-relaxed">
                  Create your first consumable to get started with editing its
                  information and defining its custom rules.
                </p>
                <Button
                  variant="primary"
                  onClick={handleAddNewConsumable}
                  icon={<PlusIcon className="h-5 w-5" />}
                  fullWidth
                >
                  Create Your First Consumable
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-14">
              {filteredAndSortedConsumables.map((consumable) => {
                const customSet = consumableSets.find(
                  (s) => s.key === consumable.set
                );
                const setColor = customSet
                  ? customSet.primary_colour.startsWith("#")
                    ? customSet.primary_colour
                    : `#${customSet.primary_colour}`
                  : consumable.set === "Tarot"
                  ? "#b26cbb"
                  : consumable.set === "Planet"
                  ? "#13afce"
                  : consumable.set === "Spectral"
                  ? "#4584fa"
                  : "#666666";
                const setName = customSet?.name || consumable.set;
                const availableSetOptions = [
                  { value: "Tarot", label: "Tarot" },
                  { value: "Planet", label: "Planet" },
                  { value: "Spectral", label: "Spectral" },
                  ...consumableSets.map((set) => ({
                    value: set.key,
                    label: set.name,
                  })),
                ];
                return (
                  <ConsumableCard
                    key={consumable.id}
                    consumable={consumable}
                    consumables={consumables}
                    onEditInfo={() => handleEditInfo(consumable)}
                    onEditRules={() => handleEditRules(consumable)}
                    onDelete={() => handleDeleteConsumable(consumable.id)}
                    onDuplicate={() => handleDuplicateConsumable(consumable)}
                    onExport={() => handleExportConsumable(consumable)}
                    onQuickUpdate={(updates) =>
                      handleQuickUpdate(consumable, updates)
                    }
                    setName={setName}
                    setColor={setColor}
                    availableSetOptions={availableSetOptions}
                    showConfirmation={showConfirmation}
                  />
                );
              })}
            </div>
          )
        ) : filteredAndSortedSets.length === 0 && consumableSets.length > 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Sets Found
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                No sets match your current search criteria.
              </p>
              <Button
                variant="secondary"
                onClick={() => setSearchTerm("")}
                fullWidth
              >
                Clear Search
              </Button>
            </div>
          </div>
        ) : filteredAndSortedSets.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <SwatchIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Custom Sets Yet :(
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                Create your first custom consumable set to define new categories
                for your consumables.
              </p>
              <Button
                variant="primary"
                onClick={handleAddNewSet}
                icon={<PlusIcon className="h-5 w-5" />}
                fullWidth
              >
                Create Your First Set
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedSets.map((set) => (
              <ConsumableSetCard
                key={set.id}
                set={set}
                onEdit={() => handleEditSet(set)}
                onDelete={() => handleDeleteSet(set)}
                onDuplicate={() => handleDuplicateSet(set)}
                onQuickUpdate={(updates) => handleQuickUpdateSet(set, updates)}
              />
            ))}
          </div>
        )}

        {editingConsumable && (
          <EditConsumableInfo
            isOpen={!!editingConsumable}
            consumable={editingConsumable}
            consumables={consumables}
            onClose={() => setEditingConsumable(null)}
            onSave={handleSaveConsumable}
            onDelete={handleDeleteConsumable}
            modPrefix={modPrefix}
            availableSets={consumableSets}
            showConfirmation={showConfirmation}
          />
        )}

        <EditConsumableSetModal
          isOpen={showEditSetModal}
          onClose={closeSetModal}
          onSave={handleSaveSet}
          editingSet={editingSet}
          setFormData={setFormData}
          onFormDataChange={(updates) =>
            setSetFormData((prev) => ({ ...prev, ...updates }))
          }
        />
      </div>

      <FloatingTabDock activeTab={activeTab} onTabChange={setActiveTab} />

      {showSortMenu &&
        ReactDOM.createPortal(
          <div
            ref={sortMenuRef}
            className="fixed bg-black-darker border-2 border-black-lighter rounded-xl shadow-xl overflow-hidden"
            style={{
              top: `${sortMenuPosition.top}px`,
              left: `${sortMenuPosition.left}px`,
              width: `${sortMenuPosition.width}px`,
              zIndex: 99999,
            }}
          >
            <div className="p-2">
              <h3 className="text-white-light font-medium text-sm mb-2 px-3 py-1">
                Sort By
              </h3>
              <div className="space-y-1">
                {currentSortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserConfig((prevConfig) => ({
                        ...prevConfig,
                        filters: {
                          ...prevConfig.filters,
                          consumablesFilter: option.value,
                        },
                      }));
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      sortBy === option.value
                        ? "bg-mint/20 border border-mint text-mint"
                        : "hover:bg-black-lighter text-white-darker hover:text-white-light"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      {showFilters &&
        activeTab === "consumables" &&
        ReactDOM.createPortal(
          <div
            ref={filtersMenuRef}
            className="fixed bg-black-darker border-2 border-black-lighter rounded-xl shadow-xl overflow-hidden"
            style={{
              top: `${filtersMenuPosition.top}px`,
              left: `${filtersMenuPosition.left}px`,
              width: `${filtersMenuPosition.width}px`,
              zIndex: 99999,
            }}
          >
            <div className="p-3 border-b border-black-lighter">
              <h3 className="text-white-light font-medium text-sm mb-3">
                Filter by Set
              </h3>
              <div className="space-y-1">
                {setOptions.map((option) => (
                  <button
                    key={option.value || "all"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSetFilter(option.value);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      setFilter === option.value
                        ? "bg-mint/20 border border-mint text-mint"
                        : "hover:bg-black-lighter"
                    }`}
                  >
                    <span className={getSetColor(option.value)}>
                      {option.label}
                    </span>
                    <span className="text-white-darker ml-1">
                      ({option.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {(searchTerm || setFilter !== null) && (
              <div className="p-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                    setSetFilter(null);
                    setShowFilters(false);
                  }}
                  fullWidth
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>,
          document.body
        )}

      {showRuleBuilder && currentConsumableForRules && (
        <Suspense fallback={<RuleBuilderLoading />}>
          <RuleBuilder
            isOpen={showRuleBuilder}
            onClose={() => {
              setShowRuleBuilder(false);
              setCurrentConsumableForRules(null);
            }}
            onSave={handleSaveRules}
            existingRules={currentConsumableForRules.rules || []}
            item={currentConsumableForRules}
            onUpdateItem={handleUpdateConsumableFromRuleBuilder}
            itemType="consumable"
          />
        </Suspense>
      )}
    </div>
  );
};

export default ConsumablesPage;
