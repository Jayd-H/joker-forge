import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import {
  BoltIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import InputField from "../../generic/InputField";
import InputDropdown from "../../generic/InputDropdown";
import Checkbox from "../../generic/Checkbox";
import Button from "../../generic/Button";
import BalatroCard from "../../generic/BalatroCard";
import InfoDescriptionBox from "../../generic/InfoDescriptionBox";
import {
  CUSTOM_SHADERS,
  EditionData,
  slugify,
  VANILLA_SHADERS,
  SOUNDS
} from "../../data/BalatroUtils";
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

interface EditEditionInfoProps {
  isOpen: boolean;
  edition: EditionData;
  editions: EditionData[];
  onClose: () => void;
  onSave: (edition: EditionData) => void;
  onDelete: (editionId: string) => void;
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

const SoundOptions = [
  ...SOUNDS().map((sound) => ({
    key: sound.key,
    label: sound.label,
  })),
];

const shaderOptions = [
  { value: "", label: "None" },
  ...VANILLA_SHADERS.map((shader) => ({
    value: shader.key,
    label: shader.label,
  })),
  ...CUSTOM_SHADERS.map((shader) => ({
    value: shader.key,
    label: shader.label,
  })),
];

const EditEditionInfo: React.FC<EditEditionInfoProps> = ({
  isOpen,
  edition,
  editions,
  onClose,
  onSave,
  onDelete,
  showConfirmation,
}) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext);
  const [formData, setFormData] = useState<EditionData>(edition);
  const [activeTab, setActiveTab] = useState<
    "properties" | "description" | "advanced"
  >("properties");
  const modalRef = useRef<HTMLDivElement>(null);

  const [lastDescription, setLastDescription] = useState<string>("");
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(
    userConfig.defaultAutoFormat ?? true
  );
  const [lastFormattedText, setLastFormattedText] = useState<string>("");

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
        ...edition,
        unlocked: edition.unlocked !== false,
        discovered: edition.discovered !== false,
        no_collection: edition.no_collection === true,
        in_shop: edition.in_shop === true,
        apply_to_float: edition.apply_to_float === true,
        disable_shadow: edition.disable_shadow === true,
        disable_base_shader: edition.disable_base_shader === true,
        badge_colour: edition.badge_colour || "#FFAA00",
        objectKey: getObjectName(
          edition,
          editions,
          edition.objectKey || slugify(edition.name)
        ),
        sound: edition.sound || "foil1",
      });
      setLastDescription(edition.description || "");
      setLastFormattedText("");
      setValidationResults({});
    }
  }, [isOpen, edition, editions]);

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
      const tempKey = getObjectName(edition, editions, value);
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

  const handleShaderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      shader: value === "" ? false : value,
    }));
  };

  const handleDelete = () => {
    showConfirmation({
      type: "danger",
      title: "Delete Edition",
      description: `Are you sure you want to delete "${formData.name}"? This action cannot be undone.`,
      confirmText: "Delete Forever",
      cancelText: "Keep It",
      onConfirm: () => {
        onDelete(edition.id);
        onClose();
        editions = updateGameObjectIds(
          edition,
          editions,
          "remove",
          edition.orderValue
        );
      },
    });
  };

  const insertTagSmart = (tag: string, autoClose: boolean = true) => {
    const textArea = document.getElementById(
      "edition-description-edit"
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
    { id: "properties", label: "Properties", icon: BoltIcon },
    { id: "description", label: "Description", icon: DocumentTextIcon },
    { id: "advanced", label: "Advanced", icon: CogIcon },
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
                    setActiveTab(
                      tab.id as "properties" | "description" | "advanced"
                    )
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
              {activeTab === "properties" && (
                <div className="p-6 space-y-6">
                  <PuzzlePieceIcon className="absolute top-4 right-8 h-32 w-32 text-black-lighter/20 -rotate-12 pointer-events-none" />

                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div>
                      <h4 className="text-white-light font-medium text-lg mb-6 text-center">
                        Edition Configuration
                      </h4>

                      <div className="space-y-6">
                        <div>
                          <InputField
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value, false)
                            }
                            placeholder="Enter edition name"
                            separator={true}
                            label="Edition Name"
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
                          placeholder="Enter edition key"
                          separator={true}
                          label="Edition Key (Code Name)"
                          size="md"
                        />
                        <p className="text-xs text-white-darker -mt-2">
                          Used in code generation. Auto-fills when you type the
                          name.
                        </p>

                        <InputDropdown
                          label="Shader"
                          value={
                            formData.shader === false
                              ? ""
                              : formData.shader || ""
                          }
                          onChange={handleShaderChange}
                          options={shaderOptions}
                          placeholder="Select a shader"
                          size="md"
                        />

                        <InputField
                          type="number"
                          label="Extra Cost"
                          value={(formData.extra_cost ?? 0).toString()}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              extra_cost: parseInt(e.target.value) || 0,
                            }))
                          }
                          size="md"
                        />

                        <div className="p-4 rounded-lg border border-black-lighter bg-black-darker/30">
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

                        <div className="rounded-lg border border-black-lighter p-4 bg-black-darker/30">
                          <h4 className="text-white-light font-medium text-base mb-3">
                            Basic Properties
                          </h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
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
                                handleCheckboxChange("discovered", checked)
                              }
                            />
                            <Checkbox
                              id="no_collection_edit"
                              label="Hidden from Collection"
                              checked={formData.no_collection === true}
                              onChange={(checked) =>
                                handleCheckboxChange("no_collection", checked)
                              }
                            />
                            <Checkbox
                              id="in_shop_edit"
                              label="Appears in Shop"
                              checked={formData.in_shop === true}
                              onChange={(checked) =>
                                handleCheckboxChange("in_shop", checked)
                              }
                            />
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
                  itemType="edition"
                  textAreaId="edition-description-edit"
                  autoFormatEnabled={autoFormatEnabled}
                  onAutoFormatToggle={() => {
                    setUserConfig((prevConfig) => ({
                      ...prevConfig,
                      defaultAutoFormat: !autoFormatEnabled,
                    }));
                    setAutoFormatEnabled(!autoFormatEnabled);
                  }}
                  validationResult={validationResults.description}
                  placeholder="Describe your edition's effects using Balatro formatting..."
                  onInsertTag={insertTagSmart}
                />
              )}

              {activeTab === "advanced" && (
                <div className="p-6 space-y-6">
                  <CogIcon className="absolute top-4 right-8 h-32 w-32 text-black-lighter/20 -rotate-12 pointer-events-none" />

                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div>
                      <h4 className="text-white-light font-medium text-lg mb-6 text-center">
                        Advanced Properties
                      </h4>

                      <div className="space-y-6">
                        <div className="rounded-lg border border-black-lighter p-4 bg-black-darker/30">
                          <h5 className="text-white-light font-medium text-sm mb-3">
                            Shader Options
                          </h5>
                          <div className="space-y-2">
                            <Checkbox
                              id="apply_to_float_edit"
                              label="Apply to Floating Sprites"
                              checked={formData.apply_to_float === true}
                              onChange={(checked) =>
                                handleCheckboxChange("apply_to_float", checked)
                              }
                            />
                            <Checkbox
                              id="disable_shadow_edit"
                              label="Disable Shadow"
                              checked={formData.disable_shadow === true}
                              onChange={(checked) =>
                                handleCheckboxChange("disable_shadow", checked)
                              }
                            />
                            <Checkbox
                              id="disable_base_shader_edit"
                              label="Disable Base Shader"
                              checked={formData.disable_base_shader === true}
                              onChange={(checked) =>
                                handleCheckboxChange(
                                  "disable_base_shader",
                                  checked
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="rounded-lg border border-black-lighter p-4 bg-black-darker/30">
                          <h5 className="text-white-light font-medium text-sm mb-3">
                            Badge Color
                          </h5>
                          <div className="flex items-center gap-4 mb-4">
                            <input
                              type="color"
                              value={formData.badge_colour || "#FFAA00"}
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
                              value={formData.badge_colour || "#FFAA00"}
                              onChange={(e) =>
                                handleInputChange(
                                  "badge_colour",
                                  e.target.value,
                                  false
                                )
                              }
                              placeholder="#FFAA00"
                              size="sm"
                              className="flex-1"
                            />
                          </div>
                          <div className="grid grid-cols-8 gap-1"></div>
                        </div>

                        <div className="rounded-lg border border-black-lighter p-4 bg-black-darker/30">
                          <h5 className="text-white-light font-medium text-sm mb-3">
                            Sound Settings
                          </h5>
                          <div>
                            <label className="block text-xs font-medium text-white-darker mb-2">
                              Sound
                            </label>
                            <select
                              value={formData.sound || "foil1"}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sound: e.target.value,
                                }))
                              }
                              className="w-full bg-black-darker border border-black-lighter rounded-lg px-3 py-2 text-white-light focus:outline-none focus:border-mint transition-colors text-sm"
                            >
                              {SoundOptions.map((sound) => (
                                <option value={sound.key}>
                                  {sound.label}
                                </option>
                              ))}
                            </select>
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
              type="edition"
              data={{
                id: formData.id,
                name: formData.name,
                description: formData.description,
                shader: formData.shader === false ? undefined : formData.shader,
              }}
              size="lg"
              editionBadgeColor={formData.badge_colour}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEditionInfo;
