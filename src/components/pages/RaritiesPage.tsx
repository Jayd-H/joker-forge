import React, { useState, useMemo } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  SwatchIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { SketchPicker, ColorResult } from "react-color";
import Button from "../generic/Button";
import InputField from "../generic/InputField";
import Modal from "../generic/Modal";
import { validateJokerName } from "../generic/validationUtils";
import { RarityData } from "../data/BalatroUtils";
import { TrashIcon } from "@heroicons/react/24/solid";

interface RaritiesPageProps {
  modName: string;
  rarities: RarityData[];
  setRarities: React.Dispatch<React.SetStateAction<RarityData[]>>;
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
interface RarityCardProps {
  rarity: RarityData;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onQuickUpdate: (updates: Partial<RarityData>) => void;
}

const RarityCard: React.FC<RarityCardProps> = ({
  rarity,
  onEdit,
  onDelete,
  onDuplicate,
  onQuickUpdate,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [tempName, setTempName] = useState(rarity.name);
  const [tempWeight, setTempWeight] = useState(rarity.default_weight);

  const handleNameSave = () => {
    const validation = validateJokerName(tempName);
    if (validation.isValid) {
      onQuickUpdate({ name: tempName });
      setEditingName(false);
    }
  };

  const handleWeightSave = () => {
    onQuickUpdate({ default_weight: tempWeight });
    setEditingWeight(false);
  };

  const getBadgeColor = () => {
    if (rarity.badge_colour.startsWith("#")) {
      return rarity.badge_colour;
    }
    return `#${rarity.badge_colour}`;
  };

  return (
    <div className=" p-6 relative group">
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 bg-black-dark border-2 border-balatro-red rounded-lg p-2 hover:bg-balatro-redshadow cursor-pointer transition-colors flex items-center justify-center z-10"
      >
        <TrashIcon className="h-4 w-4 text-balatro-red" />
      </button>

      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-[#fff] font-bold text-sm border-2"
          style={{
            backgroundColor: getBadgeColor(),
            borderColor: getBadgeColor(),
          }}
        >
          {rarity.name.substring(0, 3).toUpperCase()}
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
                    setTempName(rarity.name);
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
                  setTempName(rarity.name);
                  setEditingName(true);
                }}
              >
                {rarity.name}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-white-darker text-sm">Key:</span>
            <span className="text-mint text-sm font-mono">{rarity.key}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white-darker text-sm">Weight:</span>
            {editingWeight ? (
              <input
                type="number"
                step="0.001"
                min="0"
                value={tempWeight}
                onChange={(e) => setTempWeight(parseFloat(e.target.value) || 0)}
                onBlur={handleWeightSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleWeightSave();
                  if (e.key === "Escape") {
                    setTempWeight(rarity.default_weight);
                    setEditingWeight(false);
                  }
                }}
                className="text-sm text-white-light bg-transparent border-none outline-none border-b border-mint w-20"
                autoFocus
              />
            ) : (
              <span
                className="text-white-light text-sm cursor-pointer hover:text-mint transition-colors"
                onClick={() => {
                  setTempWeight(rarity.default_weight);
                  setEditingWeight(true);
                }}
              >
                {rarity.default_weight}
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

const RaritiesPage: React.FC<RaritiesPageProps> = ({
  modName,
  rarities,
  setRarities,
  showConfirmation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRarity, setEditingRarity] = useState<RarityData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<Partial<RarityData>>({});

  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState("");

  const handleWeightClick = () => {
    setWeightInputValue((formData.default_weight || 0).toString());
    setIsEditingWeight(true);
  };

  const handleWeightInputBlur = () => {
    const numValue = parseFloat(weightInputValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
      setFormData((prev) => ({
        ...prev,
        default_weight: numValue,
      }));
    }
    setIsEditingWeight(false);
  };

  const handleWeightInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleWeightInputBlur();
    } else if (e.key === "Escape") {
      setIsEditingWeight(false);
    }
  };

  const filteredRarities = useMemo(() => {
    return rarities.filter(
      (rarity) =>
        rarity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rarity.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rarities, searchTerm]);

  const generateKeyFromName = (name: string): string => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^[0-9]+/, "") || "custom_rarity"
    );
  };

  const handleAddNewRarity = () => {
    const newRarity: RarityData = {
      id: crypto.randomUUID(),
      key: "new_rarity",
      name: "New Rarity",
      badge_colour: "6A7A8B",
      default_weight: 0.1,
    };
    setEditingRarity(newRarity);
    setFormData(newRarity);
    setShowEditModal(true);
  };

  const handleEditRarity = (rarity: RarityData) => {
    setEditingRarity(rarity);
    setFormData(rarity);
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingRarity(null);
    setFormData({});
  };

  const handleSaveRarity = () => {
    if (!formData.name?.trim()) return;

    const isEditing =
      editingRarity && rarities.find((r) => r.id === editingRarity.id);

    const rarityToSave: RarityData = {
      id: editingRarity?.id || crypto.randomUUID(),
      key: formData.key || generateKeyFromName(formData.name),
      name: formData.name,
      badge_colour: (formData.badge_colour || "6A7A8B").replace("#", ""),
      default_weight: formData.default_weight || 0,
    };

    if (isEditing) {
      setRarities((prev) =>
        prev.map((r) => (r.id === editingRarity.id ? rarityToSave : r))
      );
    } else {
      setRarities((prev) => [...prev, rarityToSave]);
    }

    closeModal();
  };

  const handleDeleteRarity = (rarity: RarityData) => {
    showConfirmation({
      type: "danger",
      title: "Delete Custom Rarity",
      description: `Are you sure you want to delete the "${rarity.name}" rarity? This action cannot be undone and may affect jokers using this rarity.`,
      confirmText: "Delete Rarity",
      cancelText: "Keep Rarity",
      confirmVariant: "danger",
      onConfirm: () => {
        setRarities((prev) => prev.filter((r) => r.id !== rarity.id));
      },
    });
  };

  const handleDuplicateRarity = (rarity: RarityData) => {
    const duplicated: RarityData = {
      ...rarity,
      id: crypto.randomUUID(),
      name: `${rarity.name} Copy`,
      key: generateKeyFromName(`${rarity.name} Copy`),
    };
    setRarities((prev) => [...prev, duplicated]);
  };

  const handleQuickUpdate = (
    rarity: RarityData,
    updates: Partial<RarityData>
  ) => {
    const updatedRarity = { ...rarity, ...updates };
    setRarities((prev) =>
      prev.map((r) => (r.id === rarity.id ? updatedRarity : r))
    );
  };

  const handleColorChange = (color: ColorResult) => {
    setFormData((prev) => ({
      ...prev,
      badge_colour: color.hex.replace("#", ""),
    }));
  };

  // Badge preview helper functions
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

  const getPreviewBadgeColor = () => {
    const color = formData.badge_colour || "6A7A8B";
    return color.startsWith("#") ? color : `#${color}`;
  };

  const isEditing =
    editingRarity && rarities.find((r) => r.id === editingRarity.id);

  const vanillaRarities = [
    { name: "Common", weight: "0.70", color: "#009dff" },
    { name: "Uncommon", weight: "0.25", color: "#4BC292" },
    { name: "Rare", weight: "0.05", color: "#fe5f55" },
    { name: "Legendary", weight: "0.00", color: "#b26cbb" },
  ];

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Rarities
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          {modName}
        </h1>

        <div className="flex justify-center mb-2">
          <Button
            variant="primary"
            onClick={handleAddNewRarity}
            icon={<PlusIcon className="h-5 w-5" />}
            size="md"
            className="shadow-lg hover:shadow-2xl transition-shadow"
          >
            Add New Rarity
          </Button>
        </div>

        <div className="flex items-center mb-2">
          <div className="flex items-center gap-6 text-white-darker text-sm">
            <div className="flex items-center">
              <SwatchIcon className="h-4 w-4 mr-2 text-mint" />
              {modName} • {filteredRarities.length} of {rarities.length} rarity
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex-1 relative group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white-darker group-focus-within:text-mint transition-colors" />
            <input
              type="text"
              placeholder="Search rarities by name or key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black-darker shadow-2xl border-2 border-black-lighter rounded-lg pl-12 pr-4 py-4 text-white-light tracking-wider placeholder-white-darker focus:outline-none focus:border-mint transition-all duration-200"
            />
          </div>
        </div>

        {filteredRarities.length === 0 && rarities.length > 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Rarities Found
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                No rarities match your current search criteria.
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
        ) : filteredRarities.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <SwatchIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Custom Rarities Yet :(
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                Create your first custom rarity to define new rarity levels for
                your jokers.
              </p>
              <Button
                variant="primary"
                onClick={handleAddNewRarity}
                icon={<PlusIcon className="h-5 w-5" />}
                fullWidth
              >
                Create Your First Rarity
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRarities.map((rarity) => (
              <RarityCard
                key={rarity.id}
                rarity={rarity}
                onEdit={() => handleEditRarity(rarity)}
                onDelete={() => handleDeleteRarity(rarity)}
                onDuplicate={() => handleDuplicateRarity(rarity)}
                onQuickUpdate={(updates) => handleQuickUpdate(rarity, updates)}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {showEditModal && (
            <Modal
              isOpen={showEditModal}
              onClose={closeModal}
              title={isEditing ? "Edit Rarity" : "Create New Rarity"}
              maxWidth="max-w-4xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col lg:flex-row gap-6 p-6">
                  <div className="flex-1 space-y-4">
                    <div className="p-4">
                      <div className="space-y-4">
                        <InputField
                          label="Rarity Name"
                          value={formData.name || ""}
                          onChange={(e) => {
                            const name = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              name,
                              key: generateKeyFromName(name),
                            }));
                          }}
                          placeholder="e.g. Mythic"
                        />
                        <InputField
                          label="Rarity Key"
                          value={formData.key || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              key: e.target.value,
                            }))
                          }
                          placeholder="e.g. mythic"
                        />
                        <p className="text-xs text-white-darker">
                          Unique identifier used in code.
                        </p>
                      </div>
                    </div>

                    <div className=" p-4">
                      <h3 className="text-white-light font-medium mb-4">
                        Shop Weight
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.001"
                            value={formData.default_weight || 0}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                default_weight: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="flex-1 h-2 bg-black-lighter rounded appearance-none cursor-pointer"
                          />
                          {isEditingWeight ? (
                            <input
                              type="number"
                              min="0"
                              max="1"
                              step="0.001"
                              value={weightInputValue}
                              onChange={(e) =>
                                setWeightInputValue(e.target.value)
                              }
                              onBlur={handleWeightInputBlur}
                              onKeyDown={handleWeightInputKeyDown}
                              autoFocus
                              className="text-mint font-mono w-16 text-sm rounded px-1 py-0.5 text-center border-0 outline-none focus:ring-1 focus:ring-mint/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          ) : (
                            <span
                              className="text-mint font-mono w-16 text-sm cursor-pointer hover:bg-black-lighter rounded px-1 py-0.5 text-center"
                              onClick={handleWeightClick}
                            >
                              {(formData.default_weight || 0).toFixed(3)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white-darker">
                          Higher values appear more frequently. Click the value
                          to edit directly.
                        </p>
                      </div>
                    </div>

                    <div className=" p-4">
                      <h3 className="text-white-light font-medium mb-3 flex items-center gap-2">
                        <InformationCircleIcon className="h-4 w-4" />
                        Vanilla Weights
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {vanillaRarities.map((rarity) => (
                          <div
                            key={rarity.name}
                            className="flex justify-between"
                          >
                            <span style={{ color: rarity.color }}>
                              {rarity.name}
                            </span>
                            <span className="text-white-darker font-mono">
                              {rarity.weight}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="text-white-light font-medium mb-4">
                      Badge Colour
                    </h3>
                    <div
                      className="mx-auto"
                      style={{
                        position: "relative",
                        zIndex: 1000,
                        pointerEvents: "auto",
                      }}
                    >
                      <SketchPicker
                        color={getPreviewBadgeColor()}
                        onChange={handleColorChange}
                        onChangeComplete={handleColorChange}
                        disableAlpha={true}
                        width="90%"
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

                    <div className="flex justify-center mb-8">
                      <div className="relative mx-6">
                        <div
                          className="absolute inset-0 rounded-xl translate-y-1"
                          style={{
                            backgroundColor: darkenColor(
                              getPreviewBadgeColor()
                            ),
                          }}
                        />
                        <div
                          className="rounded-xl text-center text-lg py-2 relative px-12"
                          style={{ backgroundColor: getPreviewBadgeColor() }}
                        >
                          <span
                            className="relative font-bold"
                            style={{ color: "#fff" }}
                          >
                            {formData.name || "Rarity"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-4 p-4 bg-black-dark border-t border-black-lighter">
                  <Button
                    variant="secondary"
                    onClick={closeModal}
                    className="mx-auto w-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveRarity}
                    className="mx-auto w-full"
                  >
                    {isEditing ? "Save Changes" : "Create Rarity"}
                  </Button>
                </div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RaritiesPage;
