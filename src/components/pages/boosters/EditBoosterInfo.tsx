import React, { useState, useEffect, useRef, useContext } from "react";
import {
  DocumentTextIcon,
  PhotoIcon,
  ArrowPathIcon,
  SparklesIcon,
  BoltIcon,
  Cog6ToothIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import { SketchPicker, ColorResult } from "react-color";
import Button from "../../generic/Button";
import InputField from "../../generic/InputField";
import InputDropdown from "../../generic/InputDropdown";
import BalatroCard from "../../generic/BalatroCard";
import { applyAutoFormatting } from "../../generic/balatroTextFormatter";
import { BoosterData, BoosterType } from "../../data/BalatroUtils";
import { UserConfigContext } from "../../Contexts";

interface EditBoosterInfoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingBooster: BoosterData | null;
  formData: BoosterData;
  onFormDataChange: (updates: Partial<BoosterData>) => void;
}

const EditBoosterInfo: React.FC<EditBoosterInfoProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBooster,
  formData,
  onFormDataChange,
}) => {
  const {userConfig, setUserConfig} = useContext(UserConfigContext)
  const [activeTab, setActiveTab] = useState<
    "visual" | "description" | "settings"
  >("visual");
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lastDescription, setLastDescription] = useState<string>("");
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(userConfig.defaultAutoFormat ?? true);
  const [lastFormattedText, setLastFormattedText] = useState<string>("");
  const [placeholderCredits, setPlaceholderCredits] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const response = await fetch("/images/placeholderboosters/credit.txt");
        const text = await response.text();

        const credits: Record<number, string> = {};
        text.split("\n").forEach((line) => {
          const trimmed = line.trim();
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

  const generateKeyFromName = (name: string): string => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^[0-9]+/, "") || "custom_booster"
    );
  };

  const boosterTypeOptions = [
    { value: "joker", label: "Joker Pack (Add to Jokers)" },
    { value: "consumable", label: "Consumable Pack (Add to Consumables)" },
    { value: "playing_card", label: "Playing Card Pack (Add to Hand)" },
  ];

  const handleColorChange =
    (field: "background_colour" | "special_colour") => (color: ColorResult) => {
      onFormDataChange({
        [field]: color.hex.replace("#", ""),
      });
    };

  const getPreviewColor = (field: "background_colour" | "special_colour") => {
    const color = formData[field] || "666666";
    return color.startsWith("#") ? color : `#${color}`;
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

            onFormDataChange({
              imagePreview: finalImageData,
              hasUserUploadedImage: true,
            });
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

  const getImageCredit = (booster: BoosterData): string | null => {
    if (booster.hasUserUploadedImage) {
      return null;
    }

    if (
      booster.placeholderCreditIndex &&
      placeholderCredits[booster.placeholderCreditIndex]
    ) {
      return placeholderCredits[booster.placeholderCreditIndex];
    }
    return null;
  };

  const toggleUndo = () => {
    const currentDesc = formData.description;
    handleInputChange("description", lastDescription, false);
    setLastDescription(currentDesc);
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
    }

    if (field === "name") {
      onFormDataChange({
        [field]: finalValue,
        boosterKey: generateKeyFromName(finalValue),
      });
    } else {
      onFormDataChange({
        [field]: finalValue,
      });
    }
  };

  const handleNumberChange = (field: string, value: number) => {
    if (field === "extra" || field === "choose") {
      onFormDataChange({
        config: {
          ...formData.config,
          [field]: isNaN(value) ? undefined : value,
        },
      });
    } else {
      onFormDataChange({
        [field]: isNaN(value) ? undefined : value,
      });
    }
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
  ];

  const insertTag = (tag: string, autoClose: boolean = true) => {
    const textArea = document.getElementById(
      "booster-description-edit"
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

    if (selectedText) {
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

  const isEditingExistingBooster =
    editingBooster && formData.id === editingBooster.id;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onSave]);

  if (!isOpen) return null;

  const tabs = [
    { id: "visual", label: "Visual & Settings", icon: PhotoIcon },
    { id: "description", label: "Description", icon: DocumentTextIcon },
    { id: "settings", label: "Advanced Settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="fixed inset-0 flex bg-black-darker/80 backdrop-blur-sm items-center justify-center z-50 font-lexend">
      <div className="flex items-start gap-8 max-h-[90vh]">
        <div
          ref={modalRef}
          className="bg-black-dark border-2 border-black-lighter rounded-lg w-[100vh] h-[90vh] flex flex-col relative overflow-hidden"
        >
          <div className="flex">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as "visual" | "description" | "settings"
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
              {activeTab === "visual" && (
                <div className="p-6 space-y-6">
                  <GiftIcon className="absolute top-4 right-8 h-32 w-32 text-black-lighter/20 -rotate-12 pointer-events-none" />

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
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center border-2 border-mint/30 rounded-lg">
                                <GiftIcon className="h-16 w-16 text-mint opacity-60" />
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
                              value={formData.name || ""}
                              onChange={(e) => {
                                handleInputChange(
                                  "name",
                                  e.target.value,
                                  false
                                );
                              }}
                              placeholder="Enter booster name"
                              separator={true}
                              label="Booster Name"
                              size="md"
                            />
                          </div>
                          <InputField
                            value={formData.boosterKey || ""}
                            onChange={(e) =>
                              onFormDataChange({ boosterKey: e.target.value })
                            }
                            placeholder="Enter booster key"
                            separator={true}
                            label="Booster Key (Code Name)"
                            size="md"
                          />
                          <p className="text-xs text-white-darker -mt-2">
                            Used in code generation. Auto-fills when you type
                            the name.
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <InputDropdown
                              label="Booster Type"
                              value={formData.booster_type || "joker"}
                              onChange={(value) =>
                                onFormDataChange({
                                  booster_type: value as BoosterType,
                                  card_rules: [],
                                })
                              }
                              options={boosterTypeOptions}
                              separator={true}
                            />
                            <InputField
                              value={formData.cost?.toString() || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleNumberChange(
                                  "cost",
                                  value === "" ? NaN : parseInt(value)
                                );
                              }}
                              placeholder="Cost"
                              separator={true}
                              type="number"
                              label="Cost ($)"
                            />
                          </div>

                          <div>
                            <label className="block text-white-light text-sm font-medium mb-2">
                              Weight
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.05"
                                value={formData.weight ?? 1}
                                onChange={(e) =>
                                  onFormDataChange({
                                    weight: parseFloat(e.target.value),
                                  })
                                }
                                className="flex-1 h-2 bg-black-lighter rounded appearance-none cursor-pointer"
                              />
                              <span className="text-mint font-mono w-16 text-sm">
                                {(formData.weight ?? 1).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <InputField
                              label="Cards in Pack"
                              value={formData.config?.extra?.toString() || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleNumberChange(
                                  "extra",
                                  value === "" ? NaN : parseInt(value)
                                );
                              }}
                              type="number"
                            />
                            <InputField
                              label="Cards to Choose"
                              value={formData.config?.choose?.toString() || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleNumberChange(
                                  "choose",
                                  value === "" ? NaN : parseInt(value)
                                );
                              }}
                              type="number"
                            />
                          </div>

                          <div>
                            <h4 className="text-white-light font-medium text-base mb-3 justify-center pt-2 flex tracking-wider items-center gap-2">
                              <BoltIcon className="h-5 w-5 text-mint" />
                              Booster Properties
                            </h4>
                            <div className="space-y-4 rounded-lg border border-black-lighter p-4 bg-black-darker/30">
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Default State
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                  <div className="flex items-center gap-3">
                                    <label
                                      htmlFor="unlocked"
                                      className="text-white-light text-sm"
                                    >
                                      Unlocked by Default
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      id="discovered"
                                      checked={formData.discovered ?? true}
                                      onChange={(e) =>
                                        onFormDataChange({
                                          discovered: e.target.checked,
                                        })
                                      }
                                      className="w-4 h-4 text-mint bg-black-darker border-black-lighter rounded focus:ring-mint focus:ring-2"
                                    />
                                    <label
                                      htmlFor="discovered"
                                      className="text-white-light text-sm"
                                    >
                                      Already Discovered
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium tracking-widest text-white-darker mb-2">
                                  Behavior
                                </p>
                                <div className="grid grid-cols-1 gap-y-2">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      id="draw_hand"
                                      checked={formData.draw_hand || false}
                                      onChange={(e) =>
                                        onFormDataChange({
                                          draw_hand: e.target.checked,
                                        })
                                      }
                                      className="w-4 h-4 text-mint bg-black-darker border-black-lighter rounded focus:ring-mint focus:ring-2"
                                    />
                                    <label
                                      htmlFor="draw_hand"
                                      className="text-white-light text-sm"
                                    >
                                      Draw to Hand When Opened
                                    </label>
                                  </div>
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
                          onClick={() => {
                            setUserConfig(prevConfig => ({
                              ...prevConfig,
                              defaultAutoFormat: !autoFormatEnabled
                            }))
                            setAutoFormatEnabled(!autoFormatEnabled)
                          }}
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
                    <label className="block text-white-light text-sm font-medium mb-2">
                      Description Text
                    </label>
                    <textarea
                      id="booster-description-edit"
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="A {C:purple}custom{} booster pack with {C:blue}unique{} cards."
                      className="w-full h-32 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="p-6 space-y-6">
                  <Cog6ToothIcon className="absolute top-12 right-16 h-28 w-28 text-black-lighter/20 -rotate-6 pointer-events-none" />

                  <div className="space-y-4">
                    <InputField
                      label="Kind"
                      value={formData.kind || ""}
                      onChange={(e) =>
                        onFormDataChange({
                          kind: e.target.value || undefined,
                        })
                      }
                      placeholder="e.g. Ephemeral"
                    />

                    <InputField
                      label="Group Key"
                      value={formData.group_key || ""}
                      onChange={(e) =>
                        onFormDataChange({
                          group_key: e.target.value || undefined,
                        })
                      }
                      placeholder="e.g. k_booster_group_mystical"
                    />

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="hidden"
                        checked={formData.hidden || false}
                        onChange={(e) =>
                          onFormDataChange({ hidden: e.target.checked })
                        }
                        className="w-4 h-4 text-mint bg-black-darker border-black-lighter rounded focus:ring-mint focus:ring-2"
                      />
                      <label
                        htmlFor="hidden"
                        className="text-white-light text-sm"
                      >
                        Hidden from collection
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white-light font-medium mb-4">
                      Pack Colors (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white-light text-sm font-medium mb-2">
                          Background Color
                        </label>
                        <SketchPicker
                          color={getPreviewColor("background_colour")}
                          onChange={handleColorChange("background_colour")}
                          onChangeComplete={handleColorChange(
                            "background_colour"
                          )}
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
                              },
                            },
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-white-light text-sm font-medium mb-2">
                          Special Color
                        </label>
                        <SketchPicker
                          color={getPreviewColor("special_colour")}
                          onChange={handleColorChange("special_colour")}
                          onChangeComplete={handleColorChange("special_colour")}
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
                              },
                            },
                          }}
                        />
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
            <Button variant="primary" onClick={onSave} className="flex-1">
              {isEditingExistingBooster ? "Save Changes" : "Create Booster"}
            </Button>
          </div>
        </div>

        <div className="flex-shrink-0 relative my-auto">
          <div className="relative pl-24" style={{ zIndex: 1000 }}>
            <BalatroCard
              type="booster"
              data={{
                id: formData.id || "preview",
                name: formData.name || "New Booster Pack",
                description:
                  formData.description ||
                  "A custom booster pack with unique cards.",
                imagePreview: formData.imagePreview,
                cost: formData.cost,
                config: {
                  extra: formData.config.extra,
                  choose: formData.config.choose,
                },
                booster_type: formData.booster_type,
              }}
              size="lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBoosterInfo;
