import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import {
  PhotoIcon,
  SparklesIcon,
  BoltIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  PlusIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import InputField from "../../generic/InputField";
import InputDropdown from "../../generic/InputDropdown";
import Checkbox from "../../generic/Checkbox";
import Button from "../../generic/Button";
import BalatroCard from "../../generic/BalatroCard";
import InfoDescriptionBox from "../../generic/InfoDescriptionBox";
import { getAllVariables } from "../../codeGeneration/Jokers/variableUtils";
import { JokerData, UserVariable } from "../../data/BalatroUtils";
import {
  validateJokerName,
  validateDescription,
  ValidationResult,
} from "../../generic/validationUtils";
import {
  getRarityDropdownOptions,
  getRarityByValue,
  getRarityDisplayName,
  getRarityBadgeColor,
  RarityData,
  slugify,
} from "../../data/BalatroUtils";
import { applyAutoFormatting } from "../../generic/balatroTextFormatter";
import {
  BuildingStorefrontIcon,
  LockOpenIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import {
  unlockOptions,
  unlockTriggerOptions,
} from "../../codeGeneration/Jokers/unlockUtils";
import { UserConfigContext } from "../../Contexts";
import { updateGameObjectIds, getObjectName } from "../../generic/GameObjectOrdering";

interface EditJokerInfoProps {
  isOpen: boolean;
  joker: JokerData;
  jokers: JokerData[];
  onClose: () => void;
  onSave: (joker: JokerData) => void;
  onDelete: (jokerId: string) => void;
  customRarities?: RarityData[];
  modPrefix: string;
  showConfirmation: (options: {
    type?: "default" | "warning" | "danger" | "success";
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
}

interface PropertyRuleProps {
  formData: JokerData;
  index: number;
}

type UnlockTrigger = keyof typeof unlockOptions;

const EditJokerInfo: React.FC<EditJokerInfoProps> = ({
  isOpen,
  joker,
  jokers,
  onClose,
  onSave,
  onDelete,
  customRarities = [],
  showConfirmation,
}) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext);
  const [formData, setFormData] = useState<JokerData>(joker);
  const [activeTab, setActiveTab] = useState<
    "visual" | "description" | "settings"
  >("visual");
  const [placeholderError, setPlaceholderError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayFileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [lastDescription, setLastDescription] = useState<string>("");
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(
    userConfig.defaultAutoFormat ?? true
  );
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [lastFormattedText, setLastFormattedText] = useState<string>("");

  const [placeholderCredits, setPlaceholderCredits] = useState<
    Record<number, string>
  >({});

  const [validationResults, setValidationResults] = useState<{
    name?: ValidationResult;
    description?: ValidationResult;
  }>({});

  const [poolsInput, setPoolsInput] = useState("");

  const rarityOptions = getRarityDropdownOptions(customRarities);

  const unlockOperatorOptions = [
    { value: "equals", label: "equals" },
    { value: "greater_than", label: "greater than" },
    { value: "less_than", label: "less than" },
    { value: "greater_equals", label: "greater than or equal" },
    { value: "less_equals", label: "less than or equal" },
  ];

  const forcedEditionOptions = [
    { value: "", label: "None" },
    { value: "foil", label: "Always Spawn Foil" },
    { value: "holographic", label: "Always Spawn Holographic" },
    { value: "polychrome", label: "Always Spawn Polychrome" },
    { value: "negative", label: "Always Spawn Negative" },
  ];

  const handleForcedEditionChange = (value: string) => {
    setFormData({
      ...formData,
      force_foil: value === "foil",
      force_holographic: value === "holographic",
      force_polychrome: value === "polychrome",
      force_negative: value === "negative",
    });
  };

  const getForcedEditionValue = (): string => {
    if (formData.force_foil) return "foil";
    if (formData.force_holographic) return "holographic";
    if (formData.force_polychrome) return "polychrome";
    if (formData.force_negative) return "negative";
    return "";
  };

  const PropertyRule: React.FC<PropertyRuleProps> = ({ formData, index }) => {
    const propertyCategoryOptions = useMemo(() => {
      if (!formData.unlockTrigger) return [];
      return unlockOptions[formData.unlockTrigger]?.categories ?? [];
    }, [formData.unlockTrigger]);

    const selectedPropertyCategory =
      formData.unlockProperties?.[index]?.category;
    const propertyOptions = useMemo(() => {
      if (!formData.unlockTrigger) return [];
      const category = unlockOptions[formData.unlockTrigger]?.categories?.find(
        (c) => c.value === selectedPropertyCategory
      );

      return category?.options ?? [];
    }, [formData.unlockTrigger, selectedPropertyCategory]);

    return (
      <div key={index} className="grid grid-cols-19 gap-4">
        <div className="col-span-9">
          <InputDropdown
            value={formData.unlockProperties?.[index].category || ""}
            onChange={(value) => handleUnlockPropertyCategory(value, index)}
            options={propertyCategoryOptions || []}
            separator={true}
            label="Category"
          />
        </div>
        <div className="col-span-9">
          <InputDropdown
            value={formData.unlockProperties?.[index].property || ""}
            onChange={(value) => handleUnlockProperty(value, index)}
            options={propertyOptions || []}
            separator={true}
            label="Property"
            className="col-span-5"
          />
        </div>
        <div className="w-11 h-11 bg-black-dark border-2 border-balatro-red rounded-lg p-1 hover:bg-balatro-redshadow cursor-pointer transition-colors flex items-center justify-center z-10 self-end place-self-center">
          <button
            onClick={() => handleDeleteProperty(index)}
            className="w-full h-full flex items-center cursor-pointer justify-center"
          >
            <TrashIcon className="h-5 w-5 text-balatro-red" />
          </button>
        </div>
      </div>
    );
  };

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
        objectKey: getObjectName(joker,jokers,joker.objectKey || slugify(joker.name)),
        hasUserUploadedImage: joker.hasUserUploadedImage || false,
      });
      setPlaceholderError(false);
      setLastDescription(joker.description || "");
      setLastFormattedText("");
      setValidationResults({});
      setPoolsInput((joker.pools || []).join(", "));
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
      const tempKey = getObjectName(joker, jokers, value)
      setFormData({
        ...formData,
        [field]: value,
        objectKey: slugify(tempKey),
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
    if (field === "unlocked") {
      setFormData({
        ...formData,
        unlockTrigger: undefined,
        unlockOperator: "",
        unlockCount: 1,
        unlockDescription: "",
        unlockProperties: [],
        [field]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [field]: checked,
      });
    }
  };

  const handleCardAppearanceCheckboxChange = (
    field: string,
    checked: boolean
  ) => {
    if (field === "shop") {
      setFormData({
        ...formData,
        appears_in_shop: checked,
      });
    } else {
      setFormData({
        ...formData,
        cardAppearance: {
          ...formData.cardAppearance,
          [field]: checked,
        },
      });
    }
  };

  const handleRarityChange = (value: string) => {
    const parsedValue = parseInt(value, 10);
    let newRarity: number | string;

    if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 4) {
      newRarity = parsedValue;
    } else {
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

  const addPropertyHidden =
    (formData.unlockTrigger === "career_stat" &&
      formData.unlockProperties?.length) ||
    !formData.unlockTrigger ||
    formData.unlockTrigger === "chip_score";

  const handleAddProperty = () => {
    const newProperty: { category: string; property: string } = {
      category: "",
      property: "",
    };
    setFormData((prevFormData) => ({
      ...prevFormData,
      unlockProperties: [...(prevFormData.unlockProperties ?? []), newProperty],
    }));
  };

  const handleDeleteProperty = (index: number) => {
    const updatedProperties = formData.unlockProperties?.filter(
      (_, i) => i !== index
    );
    setFormData((prevFormData) => ({
      ...prevFormData,
      unlockProperties: updatedProperties,
    }));
  };

  const handleUnlockTrigger = (value: string) => {
    setFormData({
      ...formData,
      unlockTrigger: value as UnlockTrigger,
      unlockProperties: [],
    });
  };

  const handleUnlockPropertyCategory = (value: string, index: number) => {
    setFormData({
      ...formData,
      unlockProperties: formData.unlockProperties?.map((propertyRule, i) =>
        i === index ? { ...propertyRule, category: value } : propertyRule
      ),
    });
  };
  const handleUnlockProperty = (value: string, index: number) => {
    setFormData({
      ...formData,
      unlockProperties: formData.unlockProperties?.map((propertyRule, i) =>
        i === index ? { ...propertyRule, property: value } : propertyRule
      ),
    });
  };

  const handleUnlockOperator = (value: string) => {
    setFormData({
      ...formData,
      unlockOperator: value,
    });
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
    showConfirmation({
      type: "danger",
      title: "Delete Joker",
      description: `Are you sure you want to delete "${formData.name}"? This action cannot be undone.`,
      confirmText: "Delete Forever",
      cancelText: "Keep It",
      onConfirm: () => {
        onDelete(joker.id);
        onClose();
        jokers = updateGameObjectIds(joker, jokers, 'remove', joker.orderValue) 
      },
    });
  };

  const allVariables = getAllVariables(formData);

  const VariableDisplay = (variable: UserVariable) => {
    if (variable.type === "suit") return variable.initialSuit || "Spades";
    if (variable.type === "rank") return variable.initialRank || "Ace";
    if (variable.type === "pokerhand")
      return variable.initialPokerHand || "High Card";
    return variable.initialValue?.toString() || "0";
  };

  const VariableValues = allVariables.map(VariableDisplay);

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

  const tabs = [
    { id: "visual", label: "Visual & Properties", icon: PhotoIcon },
    { id: "description", label: "Description", icon: DocumentTextIcon },
    { id: "settings", label: "Advanced Settings", icon: Cog6ToothIcon },
  ];

  const handleKeyDown = (
    field: string,
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "z") {
        e.preventDefault();
        const currentDesc = formData.description;
        handleInputChange("description", lastDescription, false);
        setLastDescription(currentDesc);
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

      if (field === "description") {
        setLastDescription(value);
        setLastFormattedText(value);
      }

      handleInputChange(field, newValue, false);

      setTimeout(() => {
        textarea.setSelectionRange(start + 3, start + 3);
      }, 0);
    }
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
                          <div className="space-y-2 mt-3">
                            <InputField
                              value={formData.scale_w?.toString() || "100"}
                              onChange={(e) =>
                                handleNumberChange(
                                  "scale_w",
                                  parseInt(e.target.value)
                                )
                              }
                              placeholder="100"
                              label="Scale Width (%)"
                              type="number"
                              size="sm"
                            />
                            <InputField
                              value={formData.scale_h?.toString() || "100"}
                              onChange={(e) =>
                                handleNumberChange(
                                  "scale_h",
                                  parseInt(e.target.value)
                                )
                              }
                              placeholder="100"
                              label="Scale Height (%)"
                              type="number"
                              size="sm"
                            />
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
                                validationResults.name &&
                                !validationResults.name.isValid
                                  ? validationResults.name.error
                                  : undefined
                              }
                            />
                          </div>
                          <InputField
                            value={formData.objectKey || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "objectKey",
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
                                  <Checkbox
                                    id="perishable_compat_edit"
                                    label="Perishable Compatible"
                                    checked={
                                      formData.perishable_compat !== false
                                    }
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "perishable_compat",
                                        checked
                                      )
                                    }
                                  />
                                  <Checkbox
                                    id="blueprint_compat_edit"
                                    label="Visually Blueprint Compatible"
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
                                <InputDropdown
                                  value={getForcedEditionValue()}
                                  onChange={handleForcedEditionChange}
                                  options={forcedEditionOptions}
                                  separator={true}
                                  label="Force Edition"
                                  placeholder="Select forced edition"
                                />
                              </div>
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Other
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                  <Checkbox
                                    id="ignoreSlotLimit"
                                    label="Ignore Slot Limit When Obtained"
                                    checked={formData.ignoreSlotLimit === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "ignoreSlotLimit",
                                        checked
                                      )
                                    }
                                  />
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
                <InfoDescriptionBox
                  value={formData.description}
                  onChange={(value, shouldAutoFormat) =>
                    handleInputChange("description", value, shouldAutoFormat)
                  }
                  onKeyDown={(e) => handleKeyDown("description", e)}
                  item={formData}
                  itemType="joker"
                  textAreaId="joker-description-edit"
                  autoFormatEnabled={autoFormatEnabled}
                  onAutoFormatToggle={() => {
                    setUserConfig((prevConfig) => ({
                      ...prevConfig,
                      defaultAutoFormat: !autoFormatEnabled,
                    }));
                    setAutoFormatEnabled(!autoFormatEnabled);
                  }}
                  validationResult={validationResults.description}
                  placeholder="Describe your joker's effects using Balatro formatting..."
                  onInsertTag={insertTagSmart}
                />
              )}

              {/* in the future we can add shop appearence (in_pool) rules to this tab */}
              {activeTab === "settings" && (
                <div className="p-6 space-y-6">
                  <PuzzlePieceIcon className="absolute top-4 right-8 h-32 w-32 text-black-lighter/20 -rotate-12 pointer-events-none" />
                  <div className="space-y-6">
                    <h4 className="text-white-light font-medium text-base mb-4 flex items-center gap-2">
                      <LockOpenIcon className="h-5 w-5 text-mint" />
                      Unlock Requirements
                    </h4>
                    {!formData.unlocked && (
                      <>
                        <div className="flex gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                              <div className="col-span-2">
                                <InputDropdown
                                  value={formData.unlockTrigger || ""}
                                  onChange={handleUnlockTrigger}
                                  options={unlockTriggerOptions}
                                  separator={true}
                                  label="Trigger"
                                />
                              </div>
                              <InputDropdown
                                value={formData.unlockOperator || ""}
                                onChange={handleUnlockOperator}
                                options={unlockOperatorOptions}
                                separator={true}
                                label="Operator"
                              />
                              <InputField
                                value={formData.unlockCount?.toString() || "1"}
                                onChange={(e) =>
                                  handleNumberChange(
                                    "unlockCount",
                                    parseInt(e.target.value)
                                  )
                                }
                                placeholder="Amount"
                                separator={true}
                                min={0}
                                type="number"
                                label="Amount"
                              />
                              <div
                                className={
                                  addPropertyHidden ? "hidden" : "col-span-full"
                                }
                              >
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleAddProperty}
                                  icon={<PlusIcon className="h-4 w-4" />}
                                  className="w-full"
                                >
                                  Add Property
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-8">
                              {formData.unlockProperties?.map(
                                (_property, index) =>
                                  formData.unlockTrigger !== "chip_score" && (
                                    <PropertyRule
                                      formData={formData}
                                      index={index}
                                    />
                                  )
                              )}
                            </div>
                            {/* not sure if adding formatting tools is needed, makes it really bloated */}
                            <InputField
                              id={"joker-unlock-edit"}
                              value={formData.unlockDescription || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "unlockDescription",
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) =>
                                handleKeyDown("unlockDescription", e)
                              }
                              multiline={true}
                              height="140px"
                              separator={true}
                              label="Unlock Text"
                              placeholder={
                                "Play a 5 hand card that contains only Gold Cards"
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {formData.unlocked && (
                      <p className="text-xs text-white-darker -mt-2">
                        Joker is Unlocked by Default
                      </p>
                    )}
                    <h4 className="text-white-light font-medium text-base mb-4 flex items-center gap-2">
                      <BuildingStorefrontIcon className="h-5 w-5 text-mint" />
                      Card Appearance
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      <Checkbox
                        id="shop"
                        label="Can appear in Shop"
                        checked={formData.appears_in_shop !== false}
                        onChange={(checked) =>
                          handleCardAppearanceCheckboxChange("shop", checked)
                        }
                      />
                      <Checkbox
                        id="judgement"
                        label="Can appear from Judgement"
                        checked={formData.cardAppearance.jud === true}
                        onChange={(checked) =>
                          handleCardAppearanceCheckboxChange("jud", checked)
                        }
                      />
                      <Checkbox
                        id="buffoon_pack"
                        label="Can appear in a Buffoon Pack"
                        checked={formData.cardAppearance.buf === true}
                        onChange={(checked) =>
                          handleCardAppearanceCheckboxChange("buf", checked)
                        }
                      />
                      <Checkbox
                        id="soul"
                        label="Can appear from The Soul"
                        checked={formData.cardAppearance.sou === true}
                        className={formData.rarity !== 4 ? "hidden" : ""}
                        onChange={(checked) =>
                          handleCardAppearanceCheckboxChange("sou", checked)
                        }
                      />
                      <Checkbox
                        id="wraith"
                        label="Can appear from The Wraith"
                        checked={formData.cardAppearance.wra === true}
                        className={formData.rarity !== 3 ? "hidden" : ""}
                        onChange={(checked) =>
                          handleCardAppearanceCheckboxChange("wra", checked)
                        }
                      />
                      <Checkbox
                        id="riff_raff"
                        label="Can appear from Riff Raff"
                        checked={formData.cardAppearance.rif === true}
                        className={formData.rarity !== 1 ? "hidden" : ""}
                        onChange={(checked) =>
                          handleCardAppearanceCheckboxChange("rif", checked)
                        }
                      />
                      <Checkbox
                        id="rare_tag"
                        label="Can appear from a Rare Tag"
                        checked={formData.cardAppearance.rta === true}
                        className={formData.rarity !== 3 ? "hidden" : ""}
                        onChange={(checked) =>
                          handleCardAppearanceCheckboxChange("rta", checked)
                        }
                      />
                      <Checkbox
                        id="uncommon_tag"
                        label="Can appear from an Uncommon Tag"
                        checked={formData.cardAppearance.uta === true}
                        className={formData.rarity !== 2 ? "hidden" : ""}
                        onChange={(checked) =>
                          handleCardAppearanceCheckboxChange("uta", checked)
                        }
                      />
                    </div>
                    <InputField
                      id={"joker-pool-flags"}
                      value={formData.appearFlags || ""}
                      onChange={(e) =>
                        handleInputChange("appearFlags", e.target.value)
                      }
                      className="col-span-full"
                      height="44px"
                      separator={true}
                      label="Flags Required"
                      placeholder={"custom_flag1, not custom_flag2, ..."}
                    />
                    <h4 className="text-white-light font-medium text-base mb-4 flex items-center gap-2">
                      <PuzzlePieceIcon className="h-5 w-5 text-mint" />
                      Custom Pools
                    </h4>
                    <div className="space-y-4">
                      <InputField
                        value={poolsInput}
                        onChange={(e) => setPoolsInput(e.target.value)}
                        onBlur={() => {
                          // Parse the pools when user finishes editing
                          const pools = poolsInput
                            .split(",")
                            .map((pool) => pool.trim())
                            .filter((pool) => pool.length > 0);

                          setFormData({
                            ...formData,
                            pools: pools.length > 0 ? pools : undefined,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // Parse pools on Enter key
                            const pools = poolsInput
                              .split(",")
                              .map((pool) => pool.trim())
                              .filter((pool) => pool.length > 0);

                            setFormData({
                              ...formData,
                              pools: pools.length > 0 ? pools : undefined,
                            });
                            e.currentTarget.blur();
                          }
                        }}
                        placeholder="pool1, pool2, special_jokers"
                        separator={true}
                        label="Pool Names"
                        size="md"
                      />
                      <p className="text-xs text-white-darker -mt-2">
                        Enter pool names separated by commas. This joker will be
                        available for selection in effects that target these
                        pools.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 p-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              onTouchEnd={handleSave}
              className="flex-1"
            >
              Save Changes
            </Button>
            <Button onClick={handleDelete} variant="danger" className="px-8">
              Delete
            </Button>
          </div>
        </div>

        <div className="flex-shrink-0 relative my-auto pb-40">
          <div className="relative pl-24" style={{ zIndex: 1000 }}>
            <BalatroCard
              type="joker"
              data={{
                id: formData.id,
                name: formData.name,
                description:
                  activeTab === "settings"
                    ? formData.unlockDescription
                    : formData.description,
                imagePreview: formData.imagePreview,
                overlayImagePreview: formData.overlayImagePreview,
                cost: formData.cost,
                rarity: formData.rarity,
                locVars: {
                  vars: VariableValues,
                },
              }}
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
