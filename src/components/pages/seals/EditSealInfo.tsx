import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import {
  PhotoIcon,
  BoltIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import InputField from "../../generic/InputField";
import Checkbox from "../../generic/Checkbox";
import Button from "../../generic/Button";
import BalatroCard from "../../generic/BalatroCard";
import InfoDescriptionBox from "../../generic/InfoDescriptionBox";
import { SealData, slugify } from "../../data/BalatroUtils";
import {
  validateJokerName,
  validateDescription,
  ValidationResult,
} from "../../generic/validationUtils";
import { applyAutoFormatting } from "../../generic/balatroTextFormatter";
import { UserConfigContext } from "../../Contexts";
import { updateGameObjectIds, getObjectName } from "../../generic/GameObjectOrdering";


interface EditSealInfoProps {
  isOpen: boolean;
  seal: SealData;
  seals: SealData[];
  onClose: () => void;
  onSave: (seal: SealData) => void;
  onDelete: (sealId: string) => void;
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

const predefinedColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#FFB347",
  "#FF69B4",
  "#87CEEB",
  "#98FB98",
  "#F0E68C",
  "#DEB887",
  "#FF4500",
  "#32CD32",
  "#1E90FF",
  "#FF1493",
  "#FFD700",
  "#8A2BE2",
  "#DC143C",
  "#00CED1",
  "#FF6347",
  "#40E0D0",
  "#EE82EE",
  "#90EE90",
];

const EditSealInfo: React.FC<EditSealInfoProps> = ({
  isOpen,
  seal,
  seals,
  onClose,
  onSave,
  onDelete,
  showConfirmation,
}) => {
  const {userConfig, setUserConfig} = useContext(UserConfigContext)
  const [formData, setFormData] = useState<SealData>(seal);
  const [activeTab, setActiveTab] = useState<
    "visual" | "description" | "colour"
  >("visual");
  const [placeholderError, setPlaceholderError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [lastDescription, setLastDescription] = useState<string>("");
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(userConfig.defaultAutoFormat ?? true);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [lastFormattedText, setLastFormattedText] = useState<string>("");

  const [placeholderCredits, setPlaceholderCredits] = useState<
    Record<number, string>
  >({});

  const [validationResults, setValidationResults] = useState<{
    name?: ValidationResult;
    description?: ValidationResult;
  }>({});

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
        const response = await fetch("/images/placeholderseals/credit.txt");
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
        ...seal,
        unlocked: seal.unlocked !== false,
        discovered: seal.discovered !== false,
        no_collection: seal.no_collection === true,
        badge_colour: seal.badge_colour || "#000000",
        sealKey: seal.sealKey || slugify(seal.name),
        hasUserUploadedImage: seal.hasUserUploadedImage || false,
      });
      setPlaceholderError(false);
      setLastDescription(seal.description || "");
      setLastFormattedText("");
      setValidationResults({});
    }
  }, [isOpen, seal]);

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
      value = getObjectName(seal, seals, value)
      setFormData({
        ...formData,
        [field]: value,
        sealKey: slugify(value),
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

  const getImageCredit = (seal: SealData): string | null => {
    if (seal.hasUserUploadedImage) {
      return null;
    }

    if (
      seal.placeholderCreditIndex &&
      placeholderCredits[seal.placeholderCreditIndex]
    ) {
      return placeholderCredits[seal.placeholderCreditIndex];
    }
    return null;
  };

  const handleDelete = () => {
    showConfirmation({
      type: "danger",
      title: "Delete Seal",
      description: `Are you sure you want to delete "${formData.name}"? This action cannot be undone.`,
      confirmText: "Delete Forever",
      cancelText: "Keep It",
      onConfirm: () => {
        onDelete(seal.id);
        onClose();
        seals = updateGameObjectIds(seal, seals, 'remove', seal.orderValue) 
      },
    });
  };

  const insertTagSmart = (tag: string, autoClose: boolean = true) => {
    const textArea = document.getElementById(
      "seal-description-edit"
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
    { id: "colour", label: "Badge", icon: SwatchIcon },
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
                    setActiveTab(tab.id as "visual" | "description" | "colour")
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
                                    ? "/images/placeholderseals/placeholder-seal.png"
                                    : "/images/placeholder-seal.png"
                                }
                                alt="Placeholder Seal"
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
                              placeholder="Enter seal name"
                              separator={true}
                              label="Seal Name"
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
                            value={formData.sealKey || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "sealKey",
                                e.target.value,
                                false
                              )
                            }
                            placeholder="Enter seal key"
                            separator={true}
                            label="Seal Key (Code Name)"
                            size="md"
                          />
                          <p className="text-xs text-white-darker -mt-2">
                            Used in code generation. Auto-fills when you type
                            the name.
                          </p>

                          <div>
                            <h4 className="text-white-light font-medium text-base mb-3 justify-center pt-2 flex tracking-wider items-center gap-2">
                              <BoltIcon className="h-5 w-5 text-mint" />
                              Seal Properties
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
                  itemType="seal"
                  textAreaId="seal-description-edit"
                  autoFormatEnabled={autoFormatEnabled}
                  onAutoFormatToggle={() => {
                    setUserConfig(prevConfig => ({
                      ...prevConfig,
                      defaultAutoFormat: !autoFormatEnabled
                    }))
                    setAutoFormatEnabled(!autoFormatEnabled)
                  }}
                  validationResult={validationResults.description}
                  placeholder="Describe your seal's effects using Balatro formatting..."
                  onInsertTag={insertTagSmart}
                />
              )}

              {activeTab === "colour" && (
                <div className="p-6 space-y-6">
                  <SwatchIcon className="absolute top-4 right-8 h-32 w-32 text-black-lighter/20 -rotate-12 pointer-events-none" />

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-white-light font-medium text-base mb-4 flex items-center gap-2">
                        <SwatchIcon className="h-5 w-5 text-mint" />
                        Badge Appearance
                      </h4>
                      <div className="space-y-6 rounded-lg border border-black-lighter p-6 bg-black-darker/30">
                        <div>
                          <label className="block text-sm font-medium text-white-light mb-3">
                            Badge Color
                          </label>
                          <div className="flex items-center gap-4 mb-4">
                            <input
                              type="color"
                              value={formData.badge_colour || "#000000"}
                              onChange={(e) =>
                                handleInputChange(
                                  "badge_colour",
                                  e.target.value,
                                  false
                                )
                              }
                              className="w-16 h-16 rounded-lg border-2 border-black-lighter bg-black-dark cursor-pointer"
                            />
                            <InputField
                              value={formData.badge_colour || "#000000"}
                              onChange={(e) =>
                                handleInputChange(
                                  "badge_colour",
                                  e.target.value,
                                  false
                                )
                              }
                              placeholder="#000000"
                              size="md"
                              className="flex-1"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white-darker mb-3">
                              Quick Colors
                            </label>
                            <div className="grid grid-cols-8 gap-2">
                              {predefinedColors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() =>
                                    handleInputChange(
                                      "badge_colour",
                                      color,
                                      false
                                    )
                                  }
                                  className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                                    formData.badge_colour === color
                                      ? "border-white-light shadow-lg"
                                      : "border-black-lighter hover:border-white-darker"
                                  }`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="mt-10">
                            <div className="flex items-center justify-center">
                              <div className="relative">
                                <div
                                  className="absolute inset-0 rounded-xl translate-y-1 opacity-60"
                                  style={{
                                    backgroundColor: formData.badge_colour
                                      ? `${formData.badge_colour}80`
                                      : "#000000",
                                  }}
                                />
                                <div
                                  className="rounded-xl text-center text-lg text-white py-2 px-4 relative font-bold"
                                  style={{
                                    backgroundColor:
                                      formData.badge_colour || "#000000",
                                  }}
                                >
                                  <span className="relative text-[#fff]">
                                    {formData.name || "Seal Name"}
                                  </span>
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
              isSeal={true}
              sealBadgeColor={formData.badge_colour}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSealInfo;
