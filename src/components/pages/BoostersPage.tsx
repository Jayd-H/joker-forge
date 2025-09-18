import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import ReactDOM from "react-dom";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  GiftIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "../generic/Button";
import InputDropdown from "../generic/InputDropdown";
import InputField from "../generic/InputField";
import {
  ConsumableSetData,
  BoosterData,
  BoosterCardRule,
  getConsumableSetDropdownOptions,
  ENHANCEMENTS,
  EDITIONS,
  SUITS,
  RANKS,
  SEALS,
  getRarityDropdownOptions,
  slugify,
} from "../data/BalatroUtils";
import BoosterCard from "./boosters/BoosterCard";
import EditBoosterInfo from "./boosters/EditBoosterInfo";
import { UserConfigContext } from "../Contexts";
import { updateGameObjectIds, getObjectName } from "../generic/GameObjectOrdering";

interface BoostersPageProps {
  modName: string;
  boosters: BoosterData[];
  setBoosters: React.Dispatch<React.SetStateAction<BoosterData[]>>;
  selectedBoosterId: string | null;
  setSelectedBoosterId: React.Dispatch<React.SetStateAction<string | null>>;
  modPrefix: string;
  consumableSets: ConsumableSetData[];
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

interface EditBoosterRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: BoosterCardRule[]) => void;
  cardRules: BoosterCardRule[];
  boosterType: "joker" | "consumable" | "playing_card";
  consumableSets: ConsumableSetData[];
}

interface CardRuleEditorProps {
  cardRules: BoosterCardRule[];
  onCardRulesChange: (rules: BoosterCardRule[]) => void;
  boosterType: "joker" | "consumable" | "playing_card";
  consumableSets: ConsumableSetData[];
}

const EditBoosterRulesModal: React.FC<EditBoosterRulesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cardRules,
  boosterType,
  consumableSets,
}) => {
  const [localRules, setLocalRules] = useState<BoosterCardRule[]>(cardRules);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalRules(cardRules);
  }, [cardRules, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onSave(localRules);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onSave, localRules]);

  if (!isOpen) return null;

  const getBoosterTypeColor = () => {
    switch (boosterType) {
      case "joker":
        return "text-balatro-purple";
      case "consumable":
        return "text-mint";
      case "playing_card":
        return "text-balatro-blue";
      default:
        return "text-balatro-gold-new";
    }
  };

  const getBoosterTypeLabel = () => {
    switch (boosterType) {
      case "joker":
        return "Joker";
      case "consumable":
        return "Consumable";
      case "playing_card":
        return "Playing Card";
      default:
        return "Unknown";
    }
  };

  const handleAddRule = () => {
    const newRule: BoosterCardRule = {
      weight: 1,
      ...(boosterType === "consumable" && { set: "Tarot" }),
    };
    setLocalRules([...localRules, newRule]);
  };

  return (
    <div className="fixed inset-0 flex bg-black-darker/80 backdrop-blur-sm items-center justify-center z-50 font-lexend">
      <div
        ref={modalRef}
        className="bg-black-dark border-2 border-black-lighter rounded-lg w-[80vh] max-h-[80vh] flex flex-col relative overflow-hidden"
      >
        <div className="p-6 pb-4">
          <h3 className="text-white-light text-lg font-medium flex items-center gap-2">
            <Cog6ToothIcon className="h-5 w-5 text-mint" />
            Pack Rules Configuration
          </h3>
        </div>

        <div className="px-6 pb-4 border-b border-black-lighter">
          <div className="flex items-center justify-between">
            <h4 className="text-white-light font-medium">
              <span className={getBoosterTypeColor()}>
                {getBoosterTypeLabel()}
              </span>{" "}
              Pack Rules
            </h4>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddRule}
              icon={<PlusIcon className="h-4 w-4" />}
            >
              Add Rule
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <CardRuleEditor
            cardRules={localRules}
            onCardRulesChange={setLocalRules}
            boosterType={boosterType}
            consumableSets={consumableSets}
          />
        </div>

        <div className="flex gap-4 p-4 border-t border-black-lighter">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onSave(localRules)}
            className="flex-1"
          >
            Save Rules
          </Button>
        </div>
      </div>
    </div>
  );
};

export const CardRuleEditor: React.FC<CardRuleEditorProps> = ({
  cardRules,
  onCardRulesChange,
  boosterType,
  consumableSets,
}) => {
  const handleUpdateRule = (
    index: number,
    updates: Partial<BoosterCardRule>
  ) => {
    const updatedRules = cardRules.map((rule, i) =>
      i === index ? { ...rule, ...updates } : rule
    );
    onCardRulesChange(updatedRules);
  };

  const handleRemoveRule = (index: number) => {
    const updatedRules = cardRules.filter((_, i) => i !== index);
    onCardRulesChange(updatedRules);
  };

  const getConsumableSetOptions = () =>
    getConsumableSetDropdownOptions(consumableSets);

  type Enhancement = { key: string; label: string };
  type Edition = { key: string; label: string };
  type Suit = { value: string; label: string };
  type Rank = { value: string; label: string };
  type Seal = { key: string; label: string };

  const enhancementOptions = [
    { value: "", label: "Any Enhancement" },
    { value: "none", label: "No Enhancement" },
    ...ENHANCEMENTS().map((enh: Enhancement) => ({
      value: enh.key,
      label: enh.label,
    })),
  ];

  const editionOptions = [
    { value: "", label: "Any Edition" },
    { value: "none", label: "No Edition" },
    ...EDITIONS().map((ed: Edition) => ({ value: ed.key, label: ed.label })),
  ];

  const editionOptionsConsumable = [
    { value: "", label: "Any Edition" },
    { value: "none", label: "No Edition" },
    { value: "e_negative", label: "Negative (+1 Joker slot)" },
  ];

  const suitOptions = [
    { value: "", label: "Any Suit" },
    ...SUITS.map((suit: Suit) => ({ value: suit.value, label: suit.label })),
  ];

  const rankOptions = [
    { value: "", label: "Any Rank" },
    ...RANKS.map((rank: Rank) => ({ value: rank.value, label: rank.label })),
  ];

  const sealOptions = [
    { value: "", label: "Any Seal" },
    { value: "none", label: "No Seal" },
    ...SEALS().map((seal: Seal) => ({ value: seal.key, label: seal.label })),
  ];

  const rarityOptions = [
    { value: "", label: "Any Rarity" },
    ...getRarityDropdownOptions(),
  ];

  const specificTypeOptions = [
    { value: "", label: "Random from type" },
    ...(boosterType === "consumable"
      ? [{ value: "consumable", label: "Specific Consumable" }]
      : []),
    ...(boosterType === "joker"
      ? [{ value: "joker", label: "Specific Joker" }]
      : []),
  ];

  const getBoosterTypeColor = () => {
    switch (boosterType) {
      case "joker":
        return "text-balatro-purple";
      case "consumable":
        return "text-mint";
      case "playing_card":
        return "text-balatro-blue";
      default:
        return "text-balatro-gold-new";
    }
  };

  return (
    <div className="space-y-3">
      {cardRules.length === 0 ? (
        <div className="text-center py-8 border border-black-lighter rounded-lg">
          <div className="text-white-darker text-sm">
            No rules defined. Add rules to specify what cards this pack can
            contain.
          </div>
        </div>
      ) : (
        cardRules.map((rule, index) => (
          <div
            key={index}
            className="bg-black-darker border border-black-lighter rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getBoosterTypeColor()}`}>
                  Rule #{index + 1}
                </span>
              </div>
              <button
                onClick={() => handleRemoveRule(index)}
                className="text-balatro-red hover:text-red-400 p-1 cursor-pointer"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {boosterType === "playing_card" ? (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-white-light text-sm font-medium mb-2">
                    Weight
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.05"
                      value={rule.weight ?? 1}
                      onChange={(e) =>
                        handleUpdateRule(index, {
                          weight: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 h-2 bg-black-lighter rounded appearance-none cursor-pointer"
                    />
                    <span className="text-mint font-mono w-12 text-sm">
                      {(rule.weight ?? 1).toFixed(2)}
                    </span>
                  </div>
                </div>
                <InputDropdown
                  label="Suit"
                  value={rule.suit || ""}
                  onChange={(value) => handleUpdateRule(index, { suit: value })}
                  options={suitOptions}
                  size="sm"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-white-light text-sm font-medium mb-2">
                    Weight
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.05"
                      value={rule.weight ?? 1}
                      onChange={(e) =>
                        handleUpdateRule(index, {
                          weight: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 h-2 bg-black-lighter rounded appearance-none cursor-pointer"
                    />
                    <span className="text-mint font-mono w-12 text-sm">
                      {(rule.weight ?? 1).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div>
                  <InputDropdown
                    label="Specific Type"
                    value={rule.specific_type || ""}
                    onChange={(value) =>
                      handleUpdateRule(index, {
                        specific_type: value as "consumable" | "joker" | null,
                        specific_key: "",
                      })
                    }
                    options={specificTypeOptions}
                    size="sm"
                  />
                </div>
              </div>
            )}

            {rule.specific_type && (
              <div className="mb-3">
                <InputField
                  label={`Specific ${
                    rule.specific_type === "consumable" ? "Consumable" : "Joker"
                  } Key`}
                  type="text"
                  value={rule.specific_key || ""}
                  onChange={(e) =>
                    handleUpdateRule(index, {
                      specific_key: e.target.value,
                    })
                  }
                  placeholder={
                    rule.specific_type === "consumable"
                      ? "e.g. c_fool"
                      : "e.g. j_joker"
                  }
                  size="sm"
                  darkmode
                />
              </div>
            )}

            {!rule.specific_type && (
              <div className="grid grid-cols-2 gap-3">
                {boosterType === "consumable" && (
                  <>
                    <InputDropdown
                      label="Set"
                      value={rule.set || "Tarot"}
                      onChange={(value) =>
                        handleUpdateRule(index, { set: value })
                      }
                      options={getConsumableSetOptions()}
                      size="sm"
                    />
                    <InputDropdown
                      label="Edition"
                      value={rule.edition || ""}
                      onChange={(value) =>
                        handleUpdateRule(index, { edition: value })
                      }
                      options={editionOptionsConsumable}
                      size="sm"
                    />
                  </>
                )}

                {boosterType === "joker" && (
                  <>
                    <InputField
                      label="Pool (Optional)"
                      type="text"
                      value={rule.pool || ""}
                      onChange={(e) =>
                        handleUpdateRule(index, {
                          pool: e.target.value || undefined,
                        })
                      }
                      placeholder="e.g. food, jokers_pool, jokerforging"
                      size="sm"
                    />
                    <InputDropdown
                      label="Rarity"
                      value={rule.rarity || ""}
                      onChange={(value) =>
                        handleUpdateRule(index, { rarity: value })
                      }
                      options={rarityOptions}
                      size="sm"
                    />
                    <InputDropdown
                      label="Edition"
                      value={rule.edition || ""}
                      onChange={(value) =>
                        handleUpdateRule(index, { edition: value })
                      }
                      options={editionOptions}
                      size="sm"
                    />
                  </>
                )}

                {boosterType === "playing_card" && (
                  <>
                    <InputDropdown
                      label="Rank"
                      value={rule.rank || ""}
                      onChange={(value) =>
                        handleUpdateRule(index, { rank: value })
                      }
                      options={rankOptions}
                      size="sm"
                    />
                    <InputDropdown
                      label="Enhancement"
                      value={rule.enhancement || ""}
                      onChange={(value) =>
                        handleUpdateRule(index, {
                          enhancement: value,
                        })
                      }
                      options={enhancementOptions}
                      size="sm"
                    />
                    <InputDropdown
                      label="Edition"
                      value={rule.edition || ""}
                      onChange={(value) =>
                        handleUpdateRule(index, { edition: value })
                      }
                      options={editionOptions}
                      size="sm"
                    />
                    <InputDropdown
                      label="Seal"
                      value={rule.seal || ""}
                      onChange={(value) =>
                        handleUpdateRule(index, { seal: value })
                      }
                      options={sealOptions}
                      size="sm"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

type SortOption = {
  value: string;
  label: string;
  sortFn: (a: BoosterData, b: BoosterData) => number;
};

const getRandomPlaceholderBooster = async (): Promise<{
  imageData: string;
  creditIndex?: number;
}> => {
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
    const imagePath = `/images/placeholderboosters/placeholder-booster-${counter}.png`;

    if (await checkImage(imagePath)) {
      placeholders.push(imagePath);
      counter++;
    } else {
      keepChecking = false;
    }
  }

  if (placeholders.length === 0) {
    return { imageData: "/images/placeholder-booster.png" };
  }

  const randomIndex = Math.floor(Math.random() * placeholders.length);
  const match = placeholders[randomIndex].match(
    /placeholder-booster-(\d+)\.png/
  );
  const imageNumber = match ? parseInt(match[1], 10) : 1;

  return {
    imageData: placeholders[randomIndex],
    creditIndex: imageNumber,
  };
};

const isPlaceholderBooster = (imagePath: string): boolean => {
  return (
    imagePath.includes("/images/placeholderboosters/") ||
    imagePath.includes("placeholder-booster") ||
    imagePath.startsWith("data:image")
  );
};

const BoostersPage: React.FC<BoostersPageProps> = ({
  modName,
  boosters,
  setBoosters,
  selectedBoosterId,
  setSelectedBoosterId,
  consumableSets,
  showConfirmation,
  modPrefix,
}) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext);
  const [editingBooster, setEditingBooster] = useState<BoosterData | null>(null);
  const [editingRules, setEditingRules] = useState<BoosterData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [formData, setFormData] = useState<BoosterData>({
    id: "",
    name: "",
    description: "",
    orderValue: NaN,
    imagePreview: "",
    cost: 4,
    weight: 1,
    draw_hand: false,
    instant_use: false,
    booster_type: "joker",
    config: { extra: 3, choose: 1 },
    card_rules: [],
    discovered: true,
    objectKey: "",
    objectType: "booster",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(
    userConfig.filters.boostersFilter ?? "id-desc"
  );
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const sortButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);

  const sortOptions: SortOption[] = useMemo(
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
        value: "cost-asc",
        label: "Cost (Low to High)",
        sortFn: (a, b) => a.cost - b.cost,
      },
      {
        value: "cost-desc",
        label: "Cost (High to Low)",
        sortFn: (a, b) => b.cost - a.cost,
      },
      {
        value: "weight-asc",
        label: "Weight (Low to High)",
        sortFn: (a, b) => a.weight - b.weight,
      },
      {
        value: "weight-desc",
        label: "Weight (High to Low)",
        sortFn: (a, b) => b.weight - a.weight,
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

  const handleAddNewBooster = async () => {
    const placeholderResult = await getRandomPlaceholderBooster();
    const key = modPrefix + "_boosters";

    const newBooster: BoosterData = {
      id: crypto.randomUUID(),
      name: "New Booster Pack",
      description:
        "A {C:purple}custom{} booster pack with {C:blue}unique{} cards.",
      imagePreview: placeholderResult.imageData,
      orderValue: boosters.length+1,
      cost: 4,
      weight: 1,
      draw_hand: false,
      instant_use: false,
      booster_type: "joker",
      config: { extra: 3, choose: 1 },
      card_rules: [],
      discovered: true,
      placeholderCreditIndex: placeholderResult.creditIndex,
      objectKey: slugify("New Booster Pack"),
      group_key: key,
      objectType: "booster",
    };
    newBooster.objectKey = getObjectName(newBooster,boosters,newBooster.objectKey)
    setBoosters([...boosters, newBooster]);
    setEditingBooster(newBooster);
    setFormData(newBooster);
    setShowEditModal(true);
  };

  const handleEditBooster = (booster: BoosterData) => {
    setEditingBooster(booster);
    setFormData(booster);
    setShowEditModal(true);
  };

  const handleEditRules = (booster: BoosterData) => {
    setEditingRules(booster);
    setShowRulesModal(true);
  };

  const handleSaveBooster = () => {
    if (!formData.name?.trim()) return;

    const isEditing =
      editingBooster && boosters.find((b) => b.id === editingBooster.id);

    const boosterToSave: BoosterData = {
      ...formData,
      id: editingBooster?.id || crypto.randomUUID(),
    };

    if (isEditing) {
      setBoosters((prev) =>
        prev.map((b) => (b.id === editingBooster.id ? boosterToSave : b))
      );
    } else {
      setBoosters((prev) => [...prev, boosterToSave]);
    }

    closeModal();
  };

  const handleSaveRules = (rules: BoosterCardRule[]) => {
    if (editingRules) {
      const updatedBooster = { ...editingRules, card_rules: rules };
      setBoosters((prev) =>
        prev.map((b) => (b.id === editingRules.id ? updatedBooster : b))
      );
    }
    setShowRulesModal(false);
    setEditingRules(null);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingBooster(null);
    setFormData({
      id: "",
      name: "",
      description: "",
      imagePreview: "",
      cost: 4,
      orderValue: NaN,
      weight: 1,
      draw_hand: false,
      instant_use: false,
      booster_type: "joker",
      config: { extra: 3, choose: 1 },
      card_rules: [],
      discovered: true,
      objectKey: "",
      objectType: "booster",
    });
  };

  const handleDeleteBooster = (boosterId: string) => {
    const removedBooster = boosters.filter(booster => booster.id !== boosterId)[0]
    setBoosters((prev) => prev.filter((booster) => booster.id !== boosterId));

    if (selectedBoosterId === boosterId) {
      const remainingBoosters = boosters.filter((booster) => booster.id !== boosterId);
      setSelectedBoosterId(remainingBoosters.length > 0 ? remainingBoosters[0].id : null);
    boosters = updateGameObjectIds(removedBooster, boosters, 'remove', removedBooster.orderValue)
    }};

  const handleDuplicateBooster = async (booster: BoosterData) => {
    const dupeName = slugify(getObjectName(booster,boosters))
    if (isPlaceholderBooster(booster.imagePreview)) {
      const placeholderResult = await getRandomPlaceholderBooster();
      const duplicatedBooster: BoosterData = {
        ...booster,
        id: crypto.randomUUID(),
        name: booster.name,
        imagePreview: placeholderResult.imageData,
        placeholderCreditIndex: placeholderResult.creditIndex,
        orderValue: booster.orderValue+1,
        objectKey: `${dupeName}`,
      };
      setBoosters([...boosters, duplicatedBooster]);
      boosters = updateGameObjectIds(duplicatedBooster, boosters, 'insert', duplicatedBooster.orderValue)
    } else {
      const duplicatedBooster: BoosterData = {
        ...booster,
        id: crypto.randomUUID(),
        name: `${booster.name} Copy`,
        objectKey: slugify(`${booster.name} Copy`),
      };
      setBoosters([...boosters, duplicatedBooster]);
      boosters = updateGameObjectIds(duplicatedBooster, boosters, 'insert', duplicatedBooster.orderValue)
    }
  };

  const handleQuickUpdate = (
    booster: BoosterData,
    updates: Partial<BoosterData>
  ) => {
    const updatedBooster = { ...booster, ...updates };
    setBoosters((prev) =>
      prev.map((b) => (b.id === booster.id ? updatedBooster : b))
    );
  };

  const handleSortMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSortMenu(!showSortMenu);
  };

  const filteredAndSortedBoosters = useMemo(() => {
    const filtered = boosters.filter((booster) => {
      const matchesSearch =
        booster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booster.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    const currentSort = sortOptions.find((option) => option.value === sortBy);
    if (currentSort) {
      filtered.sort(currentSort.sortFn);
    }

    return filtered;
  }, [boosters, searchTerm, sortBy, sortOptions]);

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ||
    "Id Value (Most to Least)";

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Booster Packs
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          {modName}
        </h1>

        <div className="flex justify-center mb-2">
          <Button
            variant="primary"
            onClick={handleAddNewBooster}
            icon={<PlusIcon className="h-5 w-5" />}
            size="md"
            className="shadow-lg hover:shadow-2xl transition-shadow"
          >
            Add New Booster Pack
          </Button>
        </div>

        <div className="flex items-center mb-2">
          <div>
            <div className="flex items-center gap-6 text-white-darker text-sm">
              <div className="flex items-center">
                <GiftIcon className="h-4 w-4 mr-2 text-mint" />
                {modName} • {filteredAndSortedBoosters.length} of{" "}
                {boosters.length} booster
                {boosters.length !== 1 ? "s" : ""}
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
                placeholder="Search boosters by name or description..."
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
            </div>
          </div>
        </div>

        {filteredAndSortedBoosters.length === 0 && boosters.length > 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Boosters Found
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                No boosters match your current search criteria. Try adjusting
                your search terms.
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
        ) : filteredAndSortedBoosters.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <GiftIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Booster Packs Yet :(
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                Create your first booster pack to get started with custom pack
                designs and configurations.
              </p>
              <Button
                variant="primary"
                onClick={handleAddNewBooster}
                icon={<PlusIcon className="h-5 w-5" />}
                fullWidth
              >
                Create Your First Booster Pack
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-14">
            {filteredAndSortedBoosters.map((booster) => (
              <BoosterCard
                key={booster.id}
                booster={booster}
                boosters={boosters}
                onEditInfo={() => handleEditBooster(booster)}
                onEditRules={() => handleEditRules(booster)}
                onDelete={() => handleDeleteBooster(booster.id)}
                onDuplicate={() => handleDuplicateBooster(booster)}
                onQuickUpdate={(updates) => handleQuickUpdate(booster, updates)}
                showConfirmation={showConfirmation}
              />
            ))}
          </div>
        )}
        {editingBooster && (
        <EditBoosterInfo
          isOpen={showEditModal}
          booster={editingBooster}
          boosters={boosters}
          onClose={closeModal}
          onSave={handleSaveBooster}
          editingBooster={editingBooster}
          formData={formData}
          onFormDataChange={(updates) =>
            setFormData((prev) => ({ ...prev, ...updates }))
          }
        />)}

        <EditBoosterRulesModal
          isOpen={showRulesModal}
          onClose={() => {
            setShowRulesModal(false);
            setEditingRules(null);
          }}
          onSave={handleSaveRules}
          cardRules={editingRules?.card_rules || []}
          boosterType={editingRules?.booster_type || "joker"}
          consumableSets={consumableSets}
        />
      </div>

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
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserConfig((prevConfig) => ({
                        ...prevConfig,
                        filters: {
                          ...prevConfig.filters,
                          boostersFilter: option.value,
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
    </div>
  );
};

export default BoostersPage;
export { EditBoosterRulesModal };
