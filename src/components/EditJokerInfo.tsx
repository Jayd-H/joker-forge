import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  PhotoIcon,
  ArrowPathIcon,
  SparklesIcon,
  BoltIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import InputField from "./generic/InputField";
import InputDropdown from "./generic/InputDropdown";
import Checkbox from "./generic/Checkbox";
import Button from "./generic/Button";
import BalatroJokerCard from "./generic/BalatroJokerCard";
import { JokerData } from "./JokerCard";
import { getAllVariables } from "./codeGeneration/Jokers/variableUtils";
import {
  validateJokerName,
  validateDescription,
  ValidationResult,
} from "./generic/validationUtils";
import {
  getRarityDropdownOptions,
  getRarityByValue,
  getRarityDisplayName,
  getRarityBadgeColor,
  type CustomRarity,
} from "./data/BalatroUtils";
import { applyAutoFormatting } from "./generic/balatroTextFormatter";

interface EditJokerInfoProps {
  isOpen: boolean;
  joker: JokerData;
  onClose: () => void;
  onSave: (joker: JokerData) => void;
  onDelete: (jokerId: string) => void;
  customRarities?: CustomRarity[];
  modPrefix: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const slugify = (text: string): string => {
  return (
    text
      .toLowerCase()
      .replace(/[\s\W_]+/g, "")
      .replace(/^[\d]/, "_$&") ||
    `joker_${Math.random().toString(36).substring(2, 8)}`
  );
};

const EditJokerInfo: React.FC<EditJokerInfoProps> = ({
  isOpen,
  joker,
  onClose,
  onSave,
  onDelete,
  customRarities = [],
}) => {
  const [formData, setFormData] = useState<JokerData>(joker);
  const [activeTab, setActiveTab] = useState<"visual" | "description">(
    "visual"
  );
  const [placeholderError, setPlaceholderError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayFileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [lastDescription, setLastDescription] = useState<string>("");
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(true);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [lastFormattedText, setLastFormattedText] = useState<string>("");

  const [placeholderCredits, setPlaceholderCredits] = useState<
    Record<number, string>
  >({});

  const [validationResults, setValidationResults] = useState<{
    name?: ValidationResult;
    description?: ValidationResult;
  }>({});

  const rarityOptions = getRarityDropdownOptions(customRarities);

  const validateField = (field: string, value: string) => {
    let result: ValidationResult;
    switch (field) {
      case "name":
        result = validateJokerName(value);
        break;
      case "description":
        result = validateDescription(value);
        break;
      default:
        return;
    }

    setValidationResults((prev) => ({
      ...prev,
      [field]: result,
    }));
  };

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const response = await fetch("/images/placeholderjokers/credit.txt");
        const text = await response.text();
        console.log("Raw credit file content:", JSON.stringify(text));

        const credits: Record<number, string> = {};

        text.split("\n").forEach((line, lineIndex) => {
          const trimmed = line.trim();
          console.log(`Line ${lineIndex}: "${trimmed}"`);

          if (trimmed && trimmed.includes(":")) {
            const [indexStr, nameStr] = trimmed.split(":");
            const index = indexStr?.trim();
            const name = nameStr?.trim();

            if (index && name) {
              const indexNum = parseInt(index);
              if (!isNaN(indexNum)) {
                credits[indexNum] = name;
              }
            }
          }
        });

        setPlaceholderCredits(credits);
      } catch (error) {
        console.error("Failed to load placeholder credits:", error);
      }
    };

    loadCredits();
  }, []);

  const handleSave = useCallback(() => {
    const nameValidation = validateJokerName(formData.name);
    const descValidation = validateDescription(formData.description);

    if (!nameValidation.isValid || !descValidation.isValid) {
      setValidationResults({
        name: nameValidation,
        description: descValidation,
      });
      return;
    }

    onSave(formData);
    onClose();
  }, [formData, onSave, onClose]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...joker,
        blueprint_compat: joker.blueprint_compat !== false,
        eternal_compat: joker.eternal_compat !== false,
        unlocked: joker.unlocked !== false,
        discovered: joker.discovered !== false,
        jokerKey: joker.jokerKey || slugify(joker.name),
        hasUserUploadedImage: joker.hasUserUploadedImage || false,
      });
      setPlaceholderError(false);
      setLastDescription(joker.description || "");
      setLastFormattedText("");
      setValidationResults({});
    }
  }, [isOpen, joker]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleSave]);

  if (!isOpen) return null;

  const toggleUndo = () => {
    const currentDesc = formData.description;
    handleInputChange("description", lastDescription, false);
    setLastDescription(currentDesc);
  };

  const parseTag = (tag: string): Record<string, string> => {
    const content = tag.slice(1, -1);
    if (!content) return {};

    const modifiers: Record<string, string> = {};
    const parts = content.split(",");

    for (const part of parts) {
      const [key, value] = part.split(":");
      if (key && value) {
        modifiers[key.trim()] = value.trim();
      }
    }

    return modifiers;
  };

  const buildTag = (modifiers: Record<string, string>): string => {
    if (Object.keys(modifiers).length === 0) return "{}";

    const parts = Object.entries(modifiers).map(
      ([key, value]) => `${key}:${value}`
    );
    return `{${parts.join(",")}}`;
  };

  const colorButtons = [
    { tag: "{C:red}", color: "bg-balatro-red", name: "Red" },
    { tag: "{C:blue}", color: "bg-balatro-blue", name: "Blue" },
    { tag: "{C:green}", color: "bg-balatro-green", name: "Green" },
    { tag: "{C:purple}", color: "bg-balatro-purple", name: "Purple" },
    { tag: "{C:attention}", color: "bg-balatro-orange", name: "Orange" },
    { tag: "{C:money}", color: "bg-balatro-money", name: "Money" },
    { tag: "{C:gold}", color: "bg-balatro-gold-new", name: "Gold" },
    { tag: "{C:white}", color: "bg-balatro-white", name: "White" },
    { tag: "{C:inactive}", color: "bg-balatro-grey", name: "Inactive" },
    { tag: "{C:default}", color: "bg-balatro-default", name: "Default" },
    { tag: "{C:hearts}", color: "bg-balatro-hearts", name: "Hearts" },
    { tag: "{C:clubs}", color: "bg-balatro-clubs", name: "Clubs" },
    { tag: "{C:diamonds}", color: "bg-balatro-diamonds", name: "Diamonds" },
    { tag: "{C:spades}", color: "bg-balatro-spades", name: "Spades" },
    { tag: "{C:tarot}", color: "bg-balatro-purple", name: "Tarot" },
    { tag: "{C:planet}", color: "bg-balatro-planet", name: "Planet" },
    { tag: "{C:spectral}", color: "bg-balatro-spectral", name: "Spectral" },
    { tag: "{C:enhanced}", color: "bg-balatro-enhanced-new", name: "Enhanced" },
    { tag: "{C:common}", color: "bg-balatro-common", name: "Common" },
    { tag: "{C:uncommon}", color: "bg-balatro-uncommon", name: "Uncommon" },
    { tag: "{C:rare}", color: "bg-balatro-rare", name: "Rare" },
    { tag: "{C:legendary}", color: "bg-balatro-legendary", name: "Legendary" },
    {
      tag: "{C:edition}",
      color: "bg-gradient-to-r from-purple-400 to-pink-400",
      name: "Edition",
    },
    {
      tag: "{C:dark_edition}",
      color: "bg-gray-900 border-2 border-purple-400",
      name: "Dark Edition",
    },
  ];

  const backgroundButtons = [
    { tag: "{X:red,C:white}", color: "bg-balatro-red", name: "Red BG" },
    { tag: "{X:blue,C:white}", color: "bg-balatro-blue", name: "Blue BG" },
    { tag: "{X:mult,C:white}", color: "bg-balatro-mult", name: "Mult BG" },
    { tag: "{X:chips,C:white}", color: "bg-balatro-chips", name: "Chips BG" },
    { tag: "{X:money,C:white}", color: "bg-balatro-money", name: "Money BG" },
    {
      tag: "{X:attention,C:white}",
      color: "bg-balatro-orange",
      name: "Attention BG",
    },
    {
      tag: "{X:legendary,C:white}",
      color: "bg-balatro-legendary",
      name: "Legendary BG",
    },
    {
      tag: "{X:edition,C:white}",
      color: "bg-gradient-to-r from-purple-400 to-pink-400",
      name: "Edition BG",
    },
  ];

  const handleOverlayImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let finalImageData: string;

          if (
            (img.width === 71 && img.height === 95) ||
            (img.width === 142 && img.height === 190)
          ) {
            if (img.width === 71 && img.height === 95) {
              finalImageData = upscaleImage(img);
            } else {
              finalImageData = reader.result as string;
            }

            setFormData({
              ...formData,
              overlayImagePreview: finalImageData,
            });
          } else {
            alert(
              `Overlay image dimensions must be either 71x95 or 142x190 pixels. Your image is ${img.width}x${img.height}.`
            );
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    field: string,
    value: string,
    shouldAutoFormat: boolean = true
  ) => {
    let finalValue = value;

    if (field === "description" && shouldAutoFormat) {
      const result = applyAutoFormatting(
        value,
        lastFormattedText,
        autoFormatEnabled,
        true
      );
      finalValue = result.formatted;

      if (result.hasChanges) {
        setLastFormattedText(finalValue);
      }

      setFormData({
        ...formData,
        [field]: finalValue,
      });
    } else if (field === "name") {
      setFormData({
        ...formData,
        [field]: value,
        jokerKey: slugify(value),
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }

    validateField(field, finalValue);
  };

  const handleNumberChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      [field]: isNaN(value) ? 0 : value,
    });
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData({
      ...formData,
      [field]: checked,
    });
  };

  const handleRarityChange = (value: string) => {
    const parsedValue = parseInt(value, 10);
    let newRarity: number | string;

    // If it's a valid vanilla rarity number (1-4), use as number
    if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 4) {
      newRarity = parsedValue;
    } else {
      // Otherwise it's a custom rarity, use as string
      newRarity = value;
    }

    const previousRarity = formData.rarity;
    const newFormData = {
      ...formData,
      rarity: newRarity,
      cost:
        formData.cost === getCostFromRarity(formData.rarity)
          ? getCostFromRarity(newRarity)
          : formData.cost,
    };

    const isVanillaLegendary = typeof newRarity === "number" && newRarity === 4;
    const wasVanillaLegendary =
      typeof previousRarity === "number" && previousRarity === 4;

    if (previousRarity !== newRarity) {
      if (isVanillaLegendary && !wasVanillaLegendary) {
        newFormData.appears_in_shop = false;
      } else if (wasVanillaLegendary && !isVanillaLegendary) {
        newFormData.appears_in_shop = true;
      }
    }

    setFormData(newFormData);
  };

  const getCostFromRarity = (rarity: number | string): number => {
    if (typeof rarity === "string") {
      return 5;
    }

    const rarityData = getRarityByValue(rarity, customRarities);
    if (rarityData?.isCustom) {
      return 5;
    }

    switch (rarity) {
      case 1:
        return 4;
      case 2:
        return 5;
      case 3:
        return 6;
      case 4:
        return 20;
      default:
        return 5;
    }
  };

  const upscaleImage = (img: HTMLImageElement): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 142;
    canvas.height = 190;

    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, 142, 190);
    }

    return canvas.toDataURL("image/png");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let finalImageData: string;

          if (
            (img.width === 71 && img.height === 95) ||
            (img.width === 142 && img.height === 190)
          ) {
            if (img.width === 71 && img.height === 95) {
              finalImageData = upscaleImage(img);
            } else {
              finalImageData = reader.result as string;
            }

            setFormData({
              ...formData,
              imagePreview: finalImageData,
              hasUserUploadedImage: true,
            });
            setPlaceholderError(false);
          } else {
            alert(
              `Image dimensions must be either 71x95 or 142x190 pixels. Your image is ${img.width}x${img.height}.`
            );
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const getImageCredit = (joker: JokerData): string | null => {
    if (joker.hasUserUploadedImage) {
      return null;
    }

    if (
      joker.placeholderCreditIndex &&
      placeholderCredits[joker.placeholderCreditIndex]
    ) {
      return placeholderCredits[joker.placeholderCreditIndex];
    }
    return null;
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this joker?")) {
      onDelete(joker.id);
      onClose();
    }
  };

  const allVariables = getAllVariables(formData);

  const insertVariable = (variableIndex: number) => {
    const placeholder = `#${variableIndex}#`;
    insertTagSmart(placeholder, false);
  };

  const insertTagSmart = (tag: string, autoClose: boolean = true) => {
    const textArea = document.getElementById(
      "joker-description-edit"
    ) as HTMLTextAreaElement;
    if (!textArea) return;

    const startPos = textArea.selectionStart;
    const endPos = textArea.selectionEnd;
    const currentValue = textArea.value;
    const selectedText = currentValue.substring(startPos, endPos);

    setLastDescription(currentValue);
    setLastFormattedText(currentValue);

    let newText: string;
    let newCursorPos: number;

    const tagMatch = selectedText.match(/^(\{[^}]*\})(.*?)(\{\})$/);

    if (tagMatch) {
      const [, openTag, content, closeTag] = tagMatch;
      const modifiers = parseTag(openTag);

      const newTagContent = tag.slice(1, -1);
      const [newKey, newValue] = newTagContent.split(":");

      if (newKey && newValue) {
        modifiers[newKey] = newValue;
      }

      const newOpenTag = buildTag(modifiers);
      const newSelectedText = `${newOpenTag}${content}${closeTag}`;

      newText =
        currentValue.substring(0, startPos) +
        newSelectedText +
        currentValue.substring(endPos);
      newCursorPos = startPos + newOpenTag.length + content.length + 2;
    } else if (selectedText) {
      if (autoClose) {
        newText =
          currentValue.substring(0, startPos) +
          tag +
          selectedText +
          "{}" +
          currentValue.substring(endPos);
        newCursorPos = startPos + tag.length + selectedText.length + 2;
      } else {
        newText =
          currentValue.substring(0, startPos) +
          tag +
          selectedText +
          currentValue.substring(endPos);
        newCursorPos = startPos + tag.length + selectedText.length;
      }
    } else {
      if (autoClose) {
        newText =
          currentValue.substring(0, startPos) +
          tag +
          "{}" +
          currentValue.substring(endPos);
        newCursorPos = startPos + tag.length;
      } else {
        newText =
          currentValue.substring(0, startPos) +
          tag +
          currentValue.substring(endPos);
        newCursorPos = startPos + tag.length;
      }
    }

    handleInputChange("description", newText, false);

    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertTag = (tag: string, autoClose: boolean = true) => {
    insertTagSmart(tag, autoClose);
  };

  const tabs = [
    { id: "visual", label: "Visual & Properties", icon: PhotoIcon },
    { id: "description", label: "Description", icon: DocumentTextIcon },
  ];

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "z") {
        e.preventDefault();
        toggleUndo();
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + "[s]" + value.substring(end);

      setLastDescription(value);
      setLastFormattedText(value);
      handleInputChange("description", newValue, false);

      setTimeout(() => {
        textarea.setSelectionRange(start + 3, start + 3);
      }, 0);
    }
  };

  const getValidationMessage = (field: "name" | "description") => {
    const result = validationResults[field];
    if (!result) return null;

    if (!result.isValid && result.error) {
      return {
        type: "error" as const,
        message: result.error,
        icon: ExclamationTriangleIcon,
      };
    }

    if (result.isValid && result.warning) {
      return {
        type: "warning" as const,
        message: result.warning,
        icon: InformationCircleIcon,
      };
    }

    return null;
  };

  return (
    <div className="fixed inset-0 flex bg-black-darker/80 backdrop-blur-sm items-center justify-center z-50 font-lexend">
      <div className="flex items-start gap-8 max-h-[90vh]">
        <div
          ref={modalRef}
          className="bg-black-dark border-2 border-black-lighter rounded-lg w-[100vh] h-[90vh] flex flex-col relative overflow-hidden"
        >
          <div className="flex ">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "visual" | "description")
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-black transition-all relative border-b-2 ${
                    isActive
                      ? "text-mint-lighter bg-black-dark border-mint"
                      : "text-white-darker hover:text-white-light hover:bg-black-dark border-b-2 border-black-lighter"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {index < tabs.length - 1 && !isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-4 bg-black-lighter"></div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto custom-scrollbar">
              {activeTab === "visual" && (
                <div className="p-6 space-y-6">
                  <PuzzlePieceIcon className="absolute top-4 right-8 h-32 w-32 text-black-lighter/20 -rotate-12 pointer-events-none" />

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-white-light font-medium text-base mb-4 flex items-center gap-2">
                        <PhotoIcon className="h-5 w-5 text-mint" />
                        Visual Assets
                      </h4>
                      <div className="flex gap-6">
                        <div className="flex-shrink-0">
                          <div className="aspect-[142/190] w-60 rounded-lg overflow-hidden relative">
                            {formData.imagePreview ? (
                              <>
                                <img
                                  src={formData.imagePreview}
                                  alt={formData.name}
                                  className="w-full h-full object-cover"
                                  draggable="false"
                                  onError={() => setPlaceholderError(true)}
                                />
                                {formData.overlayImagePreview && (
                                  <img
                                    src={formData.overlayImagePreview}
                                    alt={`${formData.name} overlay`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    draggable="false"
                                  />
                                )}
                              </>
                            ) : !placeholderError ? (
                              <img
                                src={
                                  !fallbackAttempted
                                    ? "/images/placeholderjokers/placeholder-joker.png"
                                    : "/images/placeholder-joker.png"
                                }
                                alt="Placeholder Joker"
                                className="w-full h-full object-cover"
                                draggable="false"
                                onError={() => {
                                  if (!fallbackAttempted) {
                                    setFallbackAttempted(true);
                                  } else {
                                    setPlaceholderError(true);
                                  }
                                }}
                              />
                            ) : (
                              <PhotoIcon className="h-16 w-16 text-white-darker opacity-50 mx-auto my-auto" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            ref={fileInputRef}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleOverlayImageUpload}
                            className="hidden"
                            ref={overlayFileInputRef}
                          />
                          <div className="space-y-2 mt-3">
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              variant="secondary"
                              className="w-full"
                              size="sm"
                              icon={<PhotoIcon className="h-4 w-4" />}
                            >
                              {formData.imagePreview
                                ? "Change Main Image"
                                : "Upload Main Image"}
                            </Button>
                            <Button
                              onClick={() =>
                                overlayFileInputRef.current?.click()
                              }
                              variant="secondary"
                              className="w-full"
                              size="sm"
                              icon={<SparklesIcon className="h-4 w-4" />}
                            >
                              {formData.overlayImagePreview
                                ? "Change Overlay"
                                : "Add Overlay"}
                            </Button>
                            {formData.overlayImagePreview && (
                              <Button
                                onClick={() =>
                                  handleInputChange(
                                    "overlayImagePreview",
                                    "",
                                    false
                                  )
                                }
                                variant="danger"
                                className="w-full"
                                size="sm"
                              >
                                Remove Overlay
                              </Button>
                            )}
                          </div>
                          <div className="text-center mt-2">
                            <p className="text-xs text-white-darker">
                              Accepted: 71×95px or 142×190px each
                            </p>
                            {(() => {
                              const credit = getImageCredit(formData);
                              return credit ? (
                                <p className="text-xs text-white-darker mt-1">
                                  Credit: {credit}
                                </p>
                              ) : null;
                            })()}
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div>
                            <InputField
                              value={formData.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value, false)
                              }
                              placeholder="Enter joker name"
                              separator={true}
                              label="Joker Name"
                              size="md"
                              error={
                                getValidationMessage("name")?.type === "error"
                                  ? getValidationMessage("name")?.message
                                  : undefined
                              }
                            />
                          </div>
                          <InputField
                            value={formData.jokerKey || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "jokerKey",
                                e.target.value,
                                false
                              )
                            }
                            placeholder="Enter joker key"
                            separator={true}
                            label="Joker Key (Code Name)"
                            size="md"
                          />
                          <p className="text-xs text-white-darker -mt-2">
                            Used in code generation. Auto-fills when you type
                            the name.
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <InputDropdown
                              value={formData.rarity.toString()}
                              onChange={handleRarityChange}
                              options={rarityOptions}
                              separator={true}
                              label="Rarity"
                            />
                            <InputField
                              value={formData.cost?.toString() || "4"}
                              onChange={(e) =>
                                handleNumberChange(
                                  "cost",
                                  parseInt(e.target.value)
                                )
                              }
                              placeholder="Cost"
                              separator={true}
                              type="number"
                              min={1}
                              label="Cost ($)"
                            />
                          </div>

                          <div>
                            <h4 className="text-white-light font-medium text-base mb-3 justify-center pt-2 flex tracking-wider items-center gap-2">
                              <BoltIcon className="h-5 w-5 text-mint" />
                              Joker Properties
                            </h4>
                            <div className="space-y-4 rounded-lg border border-black-lighter p-4 bg-black-darker/30">
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Compatibility
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                  <Checkbox
                                    id="blueprint_compat_edit"
                                    label="Blueprint Compatible"
                                    checked={
                                      formData.blueprint_compat !== false
                                    }
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "blueprint_compat",
                                        checked
                                      )
                                    }
                                  />
                                  <Checkbox
                                    id="eternal_compat_edit"
                                    label="Eternal Compatible"
                                    checked={formData.eternal_compat !== false}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "eternal_compat",
                                        checked
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Default State
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                  <Checkbox
                                    id="unlocked_edit"
                                    label="Unlocked by Default"
                                    checked={formData.unlocked !== false}
                                    onChange={(checked) =>
                                      handleCheckboxChange("unlocked", checked)
                                    }
                                  />
                                  <Checkbox
                                    id="discovered_edit"
                                    label="Already Discovered"
                                    checked={formData.discovered !== false}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "discovered",
                                        checked
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Forced Spawning
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                  <Checkbox
                                    id="force_eternal_edit"
                                    label="Always Spawn Eternal"
                                    checked={formData.force_eternal === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "force_eternal",
                                        checked
                                      )
                                    }
                                  />
                                  <Checkbox
                                    id="force_perishable_edit"
                                    label="Always Spawn Perishable"
                                    checked={formData.force_perishable === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "force_perishable",
                                        checked
                                      )
                                    }
                                  />
                                  <Checkbox
                                    id="force_rental_edit"
                                    label="Always Spawn Rental"
                                    checked={formData.force_rental === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "force_rental",
                                        checked
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Shop Availability
                                </p>
                                <div className="grid grid-cols-1 gap-y-2">
                                  <Checkbox
                                    id="appears_in_shop_edit"
                                    label={
                                      formData.rarity === 4
                                        ? "Force Appear in Shop (Legendary)"
                                        : "Appears in Shop"
                                    }
                                    checked={formData.appears_in_shop !== false}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "appears_in_shop",
                                        checked
                                      )
                                    }
                                    disabled={false}
                                  />
                                  {formData.rarity === 4 && (
                                    <p className="text-xs text-white-darker mt-1">
                                      Legendary jokers don't normally appear in
                                      shops. Enable this to force shop
                                      appearance.
                                    </p>
                                  )}
                                  {formData.rarity !== 4 &&
                                    formData.appears_in_shop === false && (
                                      <p className="text-xs text-white-darker mt-1">
                                        This joker will not appear in shops.
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "description" && (
                <div className="p-6 space-y-6">
                  <DocumentTextIcon className="absolute top-12 right-16 h-28 w-28 text-black-lighter/20 -rotate-6 pointer-events-none" />

                  <div className="bg-black-darker border border-black-lighter rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white-light font-medium text-sm flex items-center gap-2">
                        <DocumentTextIcon className="h-4 w-4 text-mint" />
                        Formatting Tools
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-white-darker">
                          Ctrl+Z to undo
                        </span>
                        <Button
                          size="sm"
                          variant={autoFormatEnabled ? "primary" : "secondary"}
                          onClick={() =>
                            setAutoFormatEnabled(!autoFormatEnabled)
                          }
                          icon={<SparklesIcon className="h-3 w-3" />}
                        >
                          Auto Format
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-white-light text-sm mb-3 font-medium">
                          Text Colors
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {colorButtons.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => insertTag(item.tag)}
                              title={item.name}
                              className={`w-8 h-8 ${item.color} rounded border border-black-lighter hover:scale-110 transition-transform z-10`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-white-light text-sm mb-3 font-medium">
                          Backgrounds
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {backgroundButtons.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => insertTag(item.tag)}
                              title={item.name}
                              className={`w-8 h-8 ${item.color} rounded border-2 border-white-light hover:scale-110 transition-transform`}
                            />
                          ))}
                        </div>
                      </div>

                      {allVariables.length > 0 && (
                        <div>
                          <p className="text-white-light text-sm mb-3 font-medium">
                            Variables
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {allVariables.map((variable, index) => (
                              <button
                                key={variable.id}
                                onClick={() => insertVariable(index + 1)}
                                className="px-3 py-1 bg-mint/20 border border-mint/40 rounded-md text-mint text-xs font-medium hover:bg-mint/30 transition-colors"
                                title={
                                  variable.description ||
                                  `Insert ${variable.name} variable`
                                }
                              >
                                {variable.name} (#{index + 1}#)
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-white-light text-sm mb-3 font-medium">
                          Special Effects
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("[s]", false)}
                            icon={<ArrowPathIcon className="h-3 w-3" />}
                          >
                            New Line
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("{s:1.1}")}
                            icon={<SparklesIcon className="h-3 w-3" />}
                          >
                            Scale
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("{E:1}")}
                            icon={<BoltIcon className="h-3 w-3" />}
                          >
                            Float
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertTag("{}")}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full -mt-2">
                    <InputField
                      id="joker-description-edit"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      multiline={true}
                      height="140px"
                      separator={true}
                      label="Description Text"
                      placeholder="Describe your joker's effects using Balatro formatting..."
                    />
                    {(() => {
                      const validationMsg = getValidationMessage("description");
                      return validationMsg ? (
                        <div
                          className={`flex items-center gap-2 mt-1 text-sm ${
                            validationMsg.type === "error"
                              ? "text-balatro-orange"
                              : "text-yellow-500"
                          }`}
                        >
                          <validationMsg.icon className="h-4 w-4" />
                          <span>{validationMsg.message}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 p-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button onClick={handleDelete} variant="danger" className="px-8">
              Delete
            </Button>
          </div>
        </div>

        <div className="flex-shrink-0 relative my-auto pb-40">
          <div className="relative pl-24" style={{ zIndex: 1000 }}>
            <BalatroJokerCard
              joker={formData}
              size="lg"
              rarityName={getRarityDisplayName(formData.rarity, customRarities)}
              rarityColor={getRarityBadgeColor(formData.rarity, customRarities)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJokerInfo;
