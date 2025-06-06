import React, { useState, useRef, useEffect } from "react";
import {
  PhotoIcon,
  ArrowPathIcon,
  PuzzlePieceIcon,
  LockOpenIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import InputField from "./generic/InputField";
import InputDropdown from "./generic/InputDropdown";
import Checkbox from "./generic/Checkbox";
import Button from "./generic/Button";
import { JokerData } from "./JokerCard";

interface EditJokerInfoProps {
  isOpen: boolean;
  joker: JokerData;
  onClose: () => void;
  onSave: (joker: JokerData) => void;
  onDelete: (jokerId: string) => void;
}

const EditJokerInfo: React.FC<EditJokerInfoProps> = ({
  isOpen,
  joker,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<JokerData>(joker);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...joker,
        blueprint_compat: joker.blueprint_compat !== false,
        eternal_compat: joker.eternal_compat !== false,
        unlocked: joker.unlocked !== false,
        discovered: joker.discovered !== false,
      });
    }
  }, [isOpen, joker]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
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
    const rarity = parseInt(value, 10);
    setFormData({
      ...formData,
      rarity,
      cost:
        formData.cost === getCostFromRarity(formData.rarity)
          ? getCostFromRarity(rarity)
          : formData.cost,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          if (img.width === 142 && img.height === 190) {
            setFormData({
              ...formData,
              imagePreview: reader.result as string,
            });
          } else {
            alert(
              `Image dimensions must be 142x190 pixels. Your image is ${img.width}x${img.height}.`
            );
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const getCostFromRarity = (rarity: number): number => {
    switch (rarity) {
      case 1:
        return 4;
      case 2:
        return 5;
      case 3:
        return 6;
      case 4:
        return 8;
      default:
        return 5;
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this joker?")) {
      onDelete(joker.id);
      onClose();
    }
  };

  const insertColorTag = (color: string) => {
    const textArea = document.getElementById(
      "joker-description-edit"
    ) as HTMLTextAreaElement;
    if (!textArea) return;

    const startPos = textArea.selectionStart;
    const endPos = textArea.selectionEnd;
    const currentValue = textArea.value;

    const colorTag = `{C:${color}}`;
    const closingTag = `{}`;
    const newText =
      currentValue.substring(0, startPos) +
      colorTag +
      currentValue.substring(startPos, endPos) +
      closingTag +
      currentValue.substring(endPos);

    handleInputChange("description", newText);

    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(
        startPos + colorTag.length + (endPos - startPos) + closingTag.length,
        startPos + colorTag.length + (endPos - startPos) + closingTag.length
      );
    }, 0);
  };

  const addNewLine = () => {
    const textArea = document.getElementById(
      "joker-description-edit"
    ) as HTMLTextAreaElement;
    if (!textArea) return;

    const startPos = textArea.selectionStart;
    const currentValue = textArea.value;

    const newText =
      currentValue.substring(0, startPos) +
      "[s]" +
      currentValue.substring(startPos);

    handleInputChange("description", newText);

    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(startPos + 3, startPos + 3);
    }, 0);
  };

  const rarityOptions = [
    { value: "1", label: "Common" },
    { value: "2", label: "Uncommon" },
    { value: "3", label: "Rare" },
    { value: "4", label: "Legendary" },
  ];

  const spawnPoolOptions = [
    { value: "shop", label: "Shop" },
    { value: "boss", label: "Boss" },
    { value: "ante", label: "Ante" },
    { value: "planet", label: "Planet" },
    { value: "spectral", label: "Spectral" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-black-darker border-2 border-black-lighter rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 font-lexend">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-white-darker font-extralight tracking-widest">
              EDIT JOKER INFO
            </h2>
            <button
              onClick={onClose}
              className="text-white-darker hover:text-white-light transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-wrap gap-8 mb-6">
            <div className="w-auto">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="aspect-[2/3] w-48 overflow-hidden">
                    {formData.imagePreview ? (
                      <img
                        src={formData.imagePreview}
                        alt={formData.name}
                        className="w-full h-full object-contain"
                        draggable="false"
                      />
                    ) : (
                      <img
                        src="/images/placeholder-joker.png"
                        alt="Default Joker"
                        className="w-full h-full object-contain"
                        draggable="false"
                      />
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-8 right-4 bg-black-dark opacity-60 hover:opacity-100 p-2 rounded-xl transition-all"
                    >
                      <PhotoIcon className="h-6 w-6 text-mint cursor-pointer" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <InputField
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter joker name"
                  separator={true}
                  useGameFont={true}
                  label="Joker Name"
                />
              </div>

              <div>
                <div className="relative">
                  <InputField
                    id="joker-description-edit"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    multiline={true}
                    height="100px"
                    separator={true}
                    useGameFont={true}
                    label="Joker Description"
                  />
                </div>

                <div className="flex flex-wrap gap-2 -mt-3 pt-3 rounded-b-lg justify-center p-2 border-black-lighter border-2">
                  <button
                    onClick={() => insertColorTag("red")}
                    className="w-8 h-8 bg-balatro-red rounded-md"
                  ></button>
                  <button
                    onClick={() => insertColorTag("orange")}
                    className="w-8 h-8 bg-balatro-orange rounded-md"
                  ></button>
                  <button
                    onClick={() => insertColorTag("blue")}
                    className="w-8 h-8 bg-balatro-blue rounded-md"
                  ></button>
                  <button
                    onClick={() => insertColorTag("money")}
                    className="w-8 h-8 bg-balatro-money rounded-md"
                  ></button>
                  <button
                    onClick={() => insertColorTag("green")}
                    className="w-8 h-8 bg-balatro-green rounded-md"
                  ></button>
                  <button
                    onClick={() => insertColorTag("purple")}
                    className="w-8 h-8 bg-balatro-purple rounded-md"
                  ></button>
                  <button
                    onClick={() => insertColorTag("attention")}
                    className="w-8 h-8 bg-balatro-planet rounded-md"
                  ></button>
                  <button
                    onClick={() => insertColorTag("chips")}
                    className="w-8 h-8 bg-balatro-chips rounded-md"
                  ></button>
                  <button
                    onClick={() => insertColorTag("mult")}
                    className="w-8 h-8 bg-balatro-mult rounded-md"
                  ></button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={addNewLine}
                    icon={<ArrowPathIcon className="h-4 w-4" />}
                    height="34px"
                  >
                    NL
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 w-3/4 h-[2px] bg-black mx-auto"></div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <InputDropdown
                value={formData.rarity.toString()}
                onChange={handleRarityChange}
                options={rarityOptions}
                separator={true}
                label="Rarity"
              />
            </div>

            <div>
              <InputField
                value={formData.cost?.toString() || "4"}
                onChange={(e) =>
                  handleNumberChange("cost", parseInt(e.target.value))
                }
                placeholder="Cost"
                separator={true}
                type="number"
                min={1}
                label="Cost"
              />
            </div>

            <div>
              <InputDropdown
                value={"shop"}
                onChange={(value) => console.log(value)}
                options={spawnPoolOptions}
                separator={true}
                label="Spawn Pool"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg text-white-light mb-3 flex tracking-wider items-center">
                <PuzzlePieceIcon className="h-5 w-5 mr-2 text-mint" />
                Compatibility
              </h3>
              <div className="space-y-3">
                <Checkbox
                  id="blueprint_compat_edit"
                  label="Blueprint Compatible"
                  checked={formData.blueprint_compat !== false}
                  onChange={(checked) =>
                    handleCheckboxChange("blueprint_compat", checked)
                  }
                />
                <Checkbox
                  id="eternal_compat_edit"
                  label="Eternal Compatible"
                  checked={formData.eternal_compat !== false}
                  onChange={(checked) =>
                    handleCheckboxChange("eternal_compat", checked)
                  }
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg text-white-light mb-3 flex items-center tracking-wider">
                <LockOpenIcon className="h-5 w-5 mr-2 text-mint" />
                Availability
              </h3>
              <div className="space-y-3">
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
                  label="Discovered by Default"
                  checked={formData.discovered !== false}
                  onChange={(checked) =>
                    handleCheckboxChange("discovered", checked)
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>

          <div className="mt-4">
            <Button
              onClick={handleDelete}
              variant="danger"
              fullWidth
              icon={<TrashIcon className="h-5 w-5 mr-2" />}
            >
              Delete Joker
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJokerInfo;
