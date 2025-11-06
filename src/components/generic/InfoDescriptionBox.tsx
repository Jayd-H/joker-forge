import React from "react";
import {
  ArrowPathIcon,
  SparklesIcon,
  BoltIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";
import InputField from "./InputField";
import { ValidationResult } from "./validationUtils";
import { getAllVariables } from "../codeGeneration/Libs/userVariableUtils";
import {
  JokerData,
  ConsumableData,
  EnhancementData,
  SealData,
  EditionData,
  VoucherData,
  DeckData
} from "../data/BalatroUtils";

interface InfoDescriptionBoxProps {
  value: string;
  onChange: (value: string, shouldAutoFormat?: boolean) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  item: JokerData | ConsumableData | EnhancementData | SealData | EditionData | VoucherData | DeckData;
  itemType: "joker" | "consumable" | "enhancement" | "seal" | "edition" | "voucher" | "deck";
  textAreaId: string;
  autoFormatEnabled: boolean;
  onAutoFormatToggle: () => void;
  validationResult?: ValidationResult;
  placeholder?: string;
  onInsertTag: (tag: string, autoClose?: boolean) => void;
}

const InfoDescriptionBox: React.FC<InfoDescriptionBoxProps> = ({
  value,
  onChange,
  onKeyDown,
  item,
  textAreaId,
  autoFormatEnabled,
  onAutoFormatToggle,
  validationResult,
  placeholder = "Describe your item's effects using Balatro formatting...",
  onInsertTag,
}) => {
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
      tag: "{X:tarot,C:white}",
      color: "bg-balatro-purple",
      name: "Tarot BG",
    },
    {
      tag: "{X:planet,C:white}",
      color: "bg-balatro-planet",
      name: "Planet BG",
    },
    {
      tag: "{X:spectral,C:white}",
      color: "bg-balatro-spectral",
      name: "Spectral BG",
    },
    {
      tag: "{X:enhanced,C:white}",
      color: "bg-balatro-enhanced-new",
      name: "Enhanced BG",
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

  const variables = getAllVariables(item);

  const insertVariable = (variableIndex: number) => {
    const placeholder = `#${variableIndex}#`;
    onInsertTag(placeholder, false);
  };

  const getValidationMessage = () => {
    if (!validationResult) return null;

    if (!validationResult.isValid && validationResult.error) {
      return {
        type: "error" as const,
        message: validationResult.error,
        icon: ExclamationTriangleIcon,
      };
    }

    if (validationResult.isValid && validationResult.warning) {
      return {
        type: "warning" as const,
        message: validationResult.warning,
        icon: InformationCircleIcon,
      };
    }

    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <DocumentTextIcon className="absolute top-12 right-16 h-28 w-28 text-black-lighter/20 -rotate-6 pointer-events-none" />

      <div className="bg-black-darker border border-black-lighter rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white-light font-medium text-sm flex items-center gap-2">
            <DocumentTextIcon className="h-4 w-4 text-mint" />
            Formatting Tools
          </h4>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white-darker">Ctrl+Z to undo</span>
            <Button
              size="sm"
              variant={autoFormatEnabled ? "primary" : "secondary"}
              onClick={onAutoFormatToggle}
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
                  onClick={() => onInsertTag(item.tag)}
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
                  onClick={() => onInsertTag(item.tag)}
                  title={item.name}
                  className={`w-8 h-8 ${item.color} rounded border-2 border-white-light hover:scale-110 transition-transform`}
                />
              ))}
            </div>
          </div>

          {variables.length > 0 && (
            <div>
              <p className="text-white-light text-sm mb-3 font-medium">
                Variables
              </p>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable, index) => (
                  <button
                    key={variable.id}
                    onClick={() => insertVariable(index + 1)}
                    className="px-3 py-1 bg-mint/20 border border-mint/40 rounded-md text-mint text-xs font-medium hover:bg-mint/30 transition-colors"
                    title={
                      variable.description || `Insert ${variable.name} variable`
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
                onClick={() => onInsertTag("[s]", false)}
                icon={<ArrowPathIcon className="h-3 w-3" />}
              >
                New Line
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onInsertTag("{s:1.1}")}
                icon={<SparklesIcon className="h-3 w-3" />}
              >
                Scale
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onInsertTag("{E:1}")}
                icon={<BoltIcon className="h-3 w-3" />}
              >
                Float
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onInsertTag("{}")}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full -mt-2">
        <InputField
          id={textAreaId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          multiline={true}
          height="140px"
          separator={true}
          label="Description Text"
          placeholder={placeholder}
        />
        {(() => {
          const validationMsg = getValidationMessage();
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
  );
};

export default InfoDescriptionBox;
