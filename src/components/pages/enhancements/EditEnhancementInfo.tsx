import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import {
  PhotoIcon,
  BoltIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import InputField from "../../generic/InputField";
import Checkbox from "../../generic/Checkbox";
import Button from "../../generic/Button";
import BalatroCard from "../../generic/BalatroCard";
import InfoDescriptionBox from "../../generic/InfoDescriptionBox";
import { EnhancementData, slugify } from "../../data/BalatroUtils";
import {
  validateJokerName,
  validateDescription,
  ValidationResult,
} from "../../generic/validationUtils";
import { applyAutoFormatting } from "../../generic/balatroTextFormatter";
import { UserConfigContext } from "../../Contexts";
import {
  updateGameObjectIds,
  getObjectName,
} from "../../generic/GameObjectOrdering";
import PlaceholderPickerModal from "../../generic/PlaceholderPickerModal";

interface EditEnhancementInfoProps {
  isOpen: boolean;
  enhancement: EnhancementData;
  enhancements: EnhancementData[];
  onClose: () => void;
  onSave: (enhancement: EnhancementData) => void;
  onDelete: (enhancementId: string) => void;
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

const EditEnhancementInfo: React.FC<EditEnhancementInfoProps> = ({
  isOpen,
  enhancement,
  enhancements,
  onClose,
  onSave,
  onDelete,
  showConfirmation,
}) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext);
  const [formData, setFormData] = useState<EnhancementData>(enhancement);
  const [activeTab, setActiveTab] = useState<"visual" | "description">(
    "visual"
  );
  const [placeholderError, setPlaceholderError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [showPlaceholderPicker, setShowPlaceholderPicker] = useState(false);

  const [validationResults, setValidationResults] = useState<{
    name?: ValidationResult;
    description?: ValidationResult;
  }>({});

  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState("");

  const handleWeightClick = () => {
    setWeightInputValue((formData.weight ?? 0).toString());
    setIsEditingWeight(true);
  };

  const handleWeightInputBlur = () => {
    const numValue = parseFloat(weightInputValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 25) {
      setFormData((prev) => ({
        ...prev,
        weight: numValue,
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
        const response = await fetch(
          "/images/placeholderenhancements/credit.txt"
        );
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
        ...enhancement,
        unlocked: enhancement.unlocked !== false,
        discovered: enhancement.discovered !== false,
        no_collection: enhancement.no_collection === true,
        any_suit: enhancement.any_suit === true,
        replace_base_card: enhancement.replace_base_card === true,
        no_rank: enhancement.no_rank === true,
        no_suit: enhancement.no_suit === true,
        always_scores: enhancement.always_scores === true,
        objectKey: getObjectName(
          enhancement,
          enhancements,
          enhancement.objectKey || slugify(enhancement.name)
        ),
        hasUserUploadedImage: enhancement.hasUserUploadedImage || false,
      });
      setPlaceholderError(false);
      setLastDescription(enhancement.description || "");
      setLastFormattedText("");
      setValidationResults({});
    }
  }, [isOpen, enhancement, enhancements]);

  useEffect(() => {
    if (!isOpen || showPlaceholderPicker) return;

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
  }, [isOpen, showPlaceholderPicker, handleSave]);

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
        false
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
      const tempKey = getObjectName(enhancement, enhancements, value);
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

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData({
      ...formData,
      [field]: checked,
    });
  };

  const resizeImage = (
    img: HTMLImageElement,
    width = 142,
    height = 190
  ): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, width, height);
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
          const finalImageData = resizeImage(img, 142, 190);

          setFormData({
            ...formData,
            imagePreview: finalImageData,
            hasUserUploadedImage: true,
          });
          setPlaceholderError(false);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const getImageCredit = (enhancement: EnhancementData): string | null => {
    if (enhancement.hasUserUploadedImage) {
      return null;
    }

    if (
      enhancement.placeholderCreditIndex &&
      placeholderCredits[enhancement.placeholderCreditIndex]
    ) {
      return placeholderCredits[enhancement.placeholderCreditIndex];
    }
    return null;
  };

  const handleDelete = () => {
    showConfirmation({
      type: "danger",
      title: "Delete Enhancement",
      description: `Are you sure you want to delete "${formData.name}"? This action cannot be undone.`,
      confirmText: "Delete Forever",
      cancelText: "Keep It",
      onConfirm: () => {
        onDelete(enhancement.id);
        onClose();
        enhancements = updateGameObjectIds(
          enhancement,
          enhancements,
          "remove",
          enhancement.orderValue
        );
      },
    });
  };

  const insertTagSmart = (tag: string, autoClose: boolean = true) => {
    const textArea = document.getElementById(
      "enhancement-description-edit"
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
  ];

  const handleKeyDown = (
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

      setLastDescription(value);
      setLastFormattedText(value);
      handleInputChange("description", newValue, false);

      setTimeout(() => {
        textarea.setSelectionRange(start + 3, start + 3);
      }, 0);
    }
  };

  return (
    <div className="fixed inset-0 flex bg-black-darker/80 backdrop-blur-sm items-center justify-center z-50 font-lexend">
      <div ref={modalRef} className="flex items-start gap-8 max-h-[90vh]">
        <div className="bg-black-dark border-2 border-black-lighter rounded-lg w-[100vh] h-[90vh] flex flex-col relative overflow-hidden">
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
                          <div className="aspect-[142/190] w-60 rounded-lg overflow-hidden relative group">
                            {formData.imagePreview ? (
                              <img
                                src={formData.imagePreview}
                                alt={formData.name}
                                className="w-full h-full object-cover"
                                draggable="false"
                                onError={() => setPlaceholderError(true)}
                              />
                            ) : !placeholderError ? (
                              <img
                                src={
                                  !fallbackAttempted
                                    ? "/images/placeholderenhancements/placeholder-enhancement.png"
                                    : "/images/placeholder-enhancement.png"
                                }
                                alt="Placeholder Enhancement"
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
                              <div className="w-full h-full flex items-center justify-center">
                                <PhotoIcon className="h-16 w-16 text-white-darker opacity-50" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setShowPlaceholderPicker(true)}
                              title="Choose placeholder"
                              className={[
                                "absolute top-2 right-2 z-20",
                                "w-9 h-9 rounded-full border-2 border-black-lighter",
                                "bg-black/70 backdrop-blur",
                                "flex items-center justify-center",
                                "opacity-0 -translate-y-1 pointer-events-none",
                                "transition-all duration-200 ease-out",
                                "group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto",
                                "group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto",
                                "hover:bg-black/80 active:scale-95",
                                "cursor-pointer",
                              ].join(" ")}
                            >
                              <PhotoIcon className="h-5 w-5 text-white/90" />
                            </button>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            ref={fileInputRef}
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
                                ? "Change Image"
                                : "Upload Image"}
                            </Button>
                          </div>
                          <div className="text-center mt-2">
                            <p className="text-xs text-white-darker">
                              Accepted: 71×95px or 142×190px
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
                              placeholder="Enter enhancement name"
                              separator={true}
                              label="Enhancement Name"
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
                            placeholder="Enter enhancement key"
                            separator={true}
                            label="Enhancement Key (Code Name)"
                            size="md"
                          />
                          <p className="text-xs text-white-darker -mt-2">
                            Used in code generation. Auto-fills when you type
                            the name.
                          </p>
                          <div className=" p-4">
                            <h3 className="text-white-light font-medium mb-4">
                              Appearance Weight
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min="0"
                                  max="20"
                                  step="0.25"
                                  value={formData.weight ?? 0}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      weight: parseFloat(e.target.value) ?? 0,
                                    }))
                                  }
                                  className="flex-1 h-2 bg-black-lighter rounded appearance-none cursor-pointer"
                                />
                                {isEditingWeight ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.25"
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
                                    {(formData.weight || 0).toFixed(3)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white-darker">
                                Higher values appear more frequently. Click the
                                value to edit directly.
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-white-light font-medium text-base mb-3 justify-center pt-2 flex tracking-wider items-center gap-2">
                              <BoltIcon className="h-5 w-5 text-mint" />
                              Enhancement Properties
                            </h4>
                            <div className="space-y-4 rounded-lg border border-black-lighter p-4 bg-black-darker/30">
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
                                  <Checkbox
                                    id="no_collection_edit"
                                    label="Hidden from Collection"
                                    checked={formData.no_collection === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "no_collection",
                                        checked
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Card Properties
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                  <Checkbox
                                    id="any_suit_edit"
                                    label="Works with Any Suit"
                                    checked={formData.any_suit === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange("any_suit", checked)
                                    }
                                  />
                                  <Checkbox
                                    id="replace_base_card_edit"
                                    label="Replaces Base Card"
                                    checked={
                                      formData.replace_base_card === true
                                    }
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "replace_base_card",
                                        checked
                                      )
                                    }
                                  />
                                  <Checkbox
                                    id="always_scores_edit"
                                    label="Always Scores"
                                    checked={formData.always_scores === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange(
                                        "always_scores",
                                        checked
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Rank & Suit Behavior
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                  <Checkbox
                                    id="no_rank_edit"
                                    label="Remove Rank"
                                    checked={formData.no_rank === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange("no_rank", checked)
                                    }
                                  />
                                  <Checkbox
                                    id="no_suit_edit"
                                    label="Remove Suit"
                                    checked={formData.no_suit === true}
                                    onChange={(checked) =>
                                      handleCheckboxChange("no_suit", checked)
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
                  onKeyDown={handleKeyDown}
                  item={formData}
                  itemType="enhancement"
                  textAreaId="enhancement-description-edit"
                  autoFormatEnabled={autoFormatEnabled}
                  onAutoFormatToggle={() => {
                    setUserConfig((prevConfig) => ({
                      ...prevConfig,
                      defaultAutoFormat: !autoFormatEnabled,
                    }));
                    setAutoFormatEnabled(!autoFormatEnabled);
                  }}
                  validationResult={validationResults.description}
                  placeholder="Describe your enhancement's effects using Balatro formatting..."
                  onInsertTag={insertTagSmart}
                />
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
            <Button
              onClick={handleDelete}
              onTouchEnd={handleDelete}
              variant="danger"
              className="px-8"
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="flex-shrink-0 relative my-auto pb-40">
          <div className="relative pl-24" style={{ zIndex: 1000 }}>
            <BalatroCard
              type="card"
              data={{
                id: formData.id,
                name: formData.name,
                description: formData.description,
                imagePreview: formData.imagePreview,
              }}
              size="lg"
              enhancementReplaceBase={formData.replace_base_card === true}
            />
          </div>
        </div>
      </div>
      <PlaceholderPickerModal
        type="enhancement"
        isOpen={showPlaceholderPicker}
        onClose={() => setShowPlaceholderPicker(false)}
        onSelect={(index, src) => {
          setFormData((prev) => ({
            ...prev,
            imagePreview: src,
            hasUserUploadedImage: false,
            placeholderCreditIndex: index,
          }));
          setShowPlaceholderPicker(false);
        }}
      />
    </div>
  );
};

export default EditEnhancementInfo;
