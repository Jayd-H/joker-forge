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
  PlusIcon,
  LockOpenIcon,
  PuzzlePieceIcon,
  TrashIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import InputField from "../../generic/InputField";
import InputDropdown from "../../generic/InputDropdown";
import Checkbox from "../../generic/Checkbox";
import Button from "../../generic/Button";
import BalatroCard from "../../generic/BalatroCard";
import InfoDescriptionBox from "../../generic/InfoDescriptionBox";
import { VoucherData, slugify } from "../../data/BalatroUtils";
import {
  validateJokerName,
  validateDescription,
  ValidationResult,
} from "../../generic/validationUtils";
import { applyAutoFormatting } from "../../generic/balatroTextFormatter";
import {
  vouchersunlockOptions,
  unlockTriggerOptions,
} from "../../codeGeneration/Vouchers/unlockUtils";
import { UserConfigContext } from "../../Contexts";
import {
  updateGameObjectIds,
  getObjectName,
} from "../../generic/GameObjectOrdering";
import PlaceholderPickerModal from "../../generic/PlaceholderPickerModal";

interface EditVoucherInfoProps {
  isOpen: boolean;
  voucher: VoucherData;
  vouchers: VoucherData[];
  onClose: () => void;
  onSave: (voucher: VoucherData) => void;
  onDelete: (voucherId: string) => void;
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

export const generateKeyFromName = (name: string): string => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^[0-9]+/, "") || "custom_voucher"
    );
  };

interface PropertyRuleProps {
  formData: VoucherData;
  index: number;
}

type UnlockTrigger = keyof typeof vouchersunlockOptions;

const EditVoucherInfo: React.FC<EditVoucherInfoProps> = ({
  isOpen,
  voucher,
  vouchers,
  onClose,
  onSave,
  onDelete,
  showConfirmation,
}) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext);
  const [formData, setFormData] = useState<VoucherData>(voucher);
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
  const [showPlaceholderPicker, setShowPlaceholderPicker] = useState(false);

  const [validationResults, setValidationResults] = useState<{
    name?: ValidationResult;
    description?: ValidationResult;
  }>({});

  const unlockOperatorOptions = [
    { value: "equals", label: "equals" },
    { value: "greater_than", label: "greater than" },
    { value: "less_than", label: "less than" },
    { value: "greater_equals", label: "greater than or equal" },
    { value: "less_equals", label: "less than or equal" },
  ];

const PropertyRule: React.FC<PropertyRuleProps> = ({ formData, index }) => {
    const propertyCategoryOptions = useMemo(() => {
      if (!formData.unlockTrigger) return [];
      return vouchersunlockOptions[formData.unlockTrigger]?.categories ?? [];
    }, [formData.unlockTrigger]);

    const selectedPropertyCategory =
      formData.unlockProperties?.[index]?.category;
    const propertyOptions = useMemo(() => {
      if (!formData.unlockTrigger) return [];
      const category = vouchersunlockOptions[formData.unlockTrigger]?.categories?.find(
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
        const response = await fetch(
          "/images/placeholdervouchers/credit.txt"
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
        ...voucher,
        unlocked: voucher.unlocked !== false,
        discovered: voucher.discovered !== false,
        no_collection: voucher.no_collection === true,
        requires: voucher.requires,
        requires_activetor: voucher.requires_activetor || false,
        can_repeat_soul: voucher.can_repeat_soul === true,
        objectKey: getObjectName(
          voucher,
          vouchers,
          voucher.objectKey || slugify(voucher.name)
        ),
        hasUserUploadedImage: voucher.hasUserUploadedImage || false,
      });
      setPlaceholderError(false);
      setLastDescription(voucher.description || "");
      setLastFormattedText("");
      setValidationResults({});
    }
  }, [isOpen, voucher, vouchers]);

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
      const tempKey = getObjectName(voucher, vouchers, value);
      setFormData({
        ...formData,
        [field]: value,
        objectKey: generateKeyFromName(tempKey),
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
    } else
    if (field === "requires_activetor") {
      setFormData({
        ...formData,
        requires_activetor: checked,
      });
    }
    else {
      setFormData({
        ...formData,
        [field]: checked,
      });
    }}

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

  const getImageCredit = (voucher: VoucherData): string | null => {
    if (voucher.hasUserUploadedImage) {
      return null;
    }

    if (
      voucher.placeholderCreditIndex &&
      placeholderCredits[voucher.placeholderCreditIndex]
    ) {
      return placeholderCredits[voucher.placeholderCreditIndex];
    }
    return null;
  };

  const handleDelete = () => {
    showConfirmation({
      type: "danger",
      title: "Delete Voucher",
      description: `Are you sure you want to delete "${formData.name}"? This action cannot be undone.`,
      confirmText: "Delete Forever",
      cancelText: "Keep It",
      onConfirm: () => {
        onDelete(voucher.id);
        onClose();
        vouchers = updateGameObjectIds(
          voucher,
          vouchers,
          "remove",
          voucher.orderValue
        );
      },
    });
  };

  const insertTagSmart = (tag: string, autoClose: boolean = true) => {
    const textArea = document.getElementById(
      "voucher-description-edit"
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
                          <div className="aspect-[142/190] w-60 rounded-lg overflow-hidden relative group">
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
                                alt="Placeholder Voucher"
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
                              placeholder="Enter voucher name"
                              separator={true}
                              label="Voucher Name"
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
                            placeholder="Enter voucher key"
                            separator={true}
                            label="Voucher Key (Code Name)"
                            size="md"
                          />
                          <p className="text-xs text-white-darker -mt-2">
                            Used in code generation. Auto-fills when you type
                            the name.
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <InputField
                              value={formData.cost?.toString() || "10"}
                              onChange={(e) =>
                                handleNumberChange(
                                  "cost",
                                  parseInt(e.target.value)
                                )
                              }
                              placeholder="Cost"
                              separator={true}
                              type="number"
                              label="Cost ($)"
                            />
                            {!formData.requires_activetor == false && (
                              <InputField
                                  id={"require_ted"}
                                  value={formData.requires || "" }
                                  onChange={(e) =>
                                  handleInputChange("requires", e.target.value)
                                   }
                                    className="col-span-full"
                                    height="44px"
                                  separator={false}
                                label="Voucher Required"
                                placeholder={"v_overstock_norm,v_money_tree..."}
                                />
                              )}
                          </div>

                          <div>
                            <h4 className="text-white-light font-medium text-base mb-3 justify-center pt-2 flex tracking-wider items-center gap-2">
                              <BoltIcon className="h-5 w-5 text-mint" />
                              Voucher Properties
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
                                    <Checkbox
                                    id="requires_edit"
                                    label="Requires Voucher"
                                    checked={formData.requires_activetor !== false}
                                    onChange={(checked) =>
                                      handleCheckboxChange("requires_activetor", checked)
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
                  itemType="voucher"
                  textAreaId="voucher-description-edit"
                  autoFormatEnabled={autoFormatEnabled}
                  onAutoFormatToggle={() => {
                    setUserConfig((prevConfig) => ({
                      ...prevConfig,
                      defaultAutoFormat: !autoFormatEnabled,
                    }));
                    setAutoFormatEnabled(!autoFormatEnabled);
                  }}
                  validationResult={validationResults.description}
                  placeholder="Describe your voucher's effects using Balatro formatting..."
                  onInsertTag={insertTagSmart}
                />
              )}

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
                              id={"voucher-unlock-edit"}
                              value={formData.unlockDescription || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "unlockDescription",
                                  e.target.value
                                )
                              }
                              onKeyDown={handleKeyDown}
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
                        Voucher is Unlocked by Default
                      </p>
                    )}
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
              type="voucher"
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
              }}
              size="lg"
            />
          </div>
        </div>
      </div>{" "}
      <PlaceholderPickerModal
        type="voucher"
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

export default EditVoucherInfo;
