import React, { useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { BalatroText } from "./balatroTextFormatter";
import Tooltip from "./Tooltip";

interface BaseCardData {
  id: string;
  name: string;
  description: string;
  imagePreview?: string;
  overlayImagePreview?: string;
  cost?: number;
}

interface JokerCardData extends BaseCardData {
  rarity: number | string;
  locVars?: {
    vars: (string | number)[];
  };
}

interface ConsumableCardData extends BaseCardData {
  set: string;
}


interface BoosterCardData extends BaseCardData {
  config: {
    extra: number;
    choose: number;
  };
  booster_type: string;
}

interface EditionCardData extends BaseCardData {
  shader?: string;
}

interface VoucherCardData extends BaseCardData {
  requires?: string;
  requires_activetor: boolean;
  calculate_function?: boolean;
}


type CardData =
  | JokerCardData
  | ConsumableCardData
  | BoosterCardData
  | BaseCardData
  | EditionCardData
  | VoucherCardData

interface BalatroCardProps {
  type: "joker" | "consumable" | "booster" | "card" | "edition" | "voucher" | "deck";
  data: CardData;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  rarityName?: string;
  rarityColor?: string;
  setName?: string;
  setColor?: string;
  enhancement?: string;
  seal?: string;
  edition?: string;
  isSeal?: boolean;
  sealBadgeColor?: string;
  editionBadgeColor?: string;
  enhancementReplaceBase?: boolean;
  showCost?: boolean;
}

const BalatroCard: React.FC<BalatroCardProps> = ({
  type,
  data,
  onClick,
  className = "",
  size = "md",
  rarityName,
  rarityColor,
  setName,
  setColor,
  enhancement,
  seal,
  edition,
  isSeal = false,
  sealBadgeColor,
  editionBadgeColor,
  enhancementReplaceBase = false,
  showCost = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);
  const [selectedAce, setSelectedAce] = useState("HC_A_hearts");
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const aceOptions = [
    [
      {
        key: "HC_A_hearts",
        name: "♥",
        color: "text-red-500",
      },
      {
        key: "HC_A_diamonds",
        name: "♦",
        color: "text-yellow-400",
      },
      { key: "HC_A_clubs", name: "♣", color: "text-blue-500" },
      { key: "HC_A_spades", name: "♠", color: "text-white-lighter" },
    ],
    [
      { key: "LC_A_hearts", name: "♥", color: "text-red-400" },
      {
        key: "LC_A_diamonds",
        name: "♦",
        color: "text-orange-500",
      },
      {
        key: "LC_A_clubs",
        name: "♣",
        color: "text-gray-600",
      },
      {
        key: "LC_A_spades",
        name: "♠",
        color: "text-white-dark",
      },
    ],
  ];

  const editionAceOptions = [
    [
      {
        key: "HC_A_hearts",
        name: "♥",
        color: "text-red-500",
      },
      {
        key: "HC_A_diamonds",
        name: "♦",
        color: "text-yellow-400",
      },
      { key: "HC_A_clubs", name: "♣", color: "text-blue-500" },
      { key: "HC_A_spades", name: "♠", color: "text-white-lighter" },
    ],
  ];

  const currentAceOptions = type === "edition" ? editionAceOptions : aceOptions;
  const aceImageFolder = type === "edition" ? "acesbg" : "aces";

  useEffect(() => {
    if (type === "edition") {
      setSelectedAce("HC_A_hearts");
    }
  }, [type]);

  useEffect(() => {
    setImageError(false);
  }, [data.imagePreview]);

  const darkenColor = (hexColor: string, amount: number = 0.3): string => {
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

  const getBadgeStyles = () => {
    if (isSeal && sealBadgeColor) {
      const shadowColor = darkenColor(sealBadgeColor, 0.4);
      return {
        bg: shadowColor,
        shadow: sealBadgeColor,
      };
    }
    if (type === "edition" && editionBadgeColor) {
      const shadowColor = darkenColor(editionBadgeColor, 0.4);
      return {
        bg: shadowColor,
        shadow: editionBadgeColor,
      };
    }
    if (enhancement || seal || edition) {
      return {
        bg: "bg-black-darker",
        shadow: "bg-black-lighter",
      };
    }
    if (type === "joker" && rarityColor) {
      const vanillaStyles: Record<string, { bg: string; shadow: string }> = {
        "#009dff": { bg: "bg-balatro-blueshadow", shadow: "bg-balatro-blue" },
        "#4BC292": { bg: "bg-balatro-greenshadow", shadow: "bg-balatro-green" },
        "#fe5f55": { bg: "bg-balatro-redshadow", shadow: "bg-balatro-red" },
        "#b26cbb": {
          bg: "bg-balatro-purpleshadow",
          shadow: "bg-balatro-purple",
        },
      };
      if (vanillaStyles[rarityColor]) {
        return vanillaStyles[rarityColor];
      }
      const shadowColor = darkenColor(rarityColor, 0.4);
      return {
        bg: shadowColor,
        shadow: rarityColor,
      };
    }
    if (type === "consumable" && setColor) {
      const vanillaStyles: Record<string, { bg: string; shadow: string }> = {
        "#b26cbb": {
          bg: "bg-balatro-purpleshadow",
          shadow: "bg-balatro-purple",
        },
        "#13afce": {
          bg: "bg-balatro-planetshadow",
          shadow: "bg-balatro-planet",
        },
        "#4584fa": {
          bg: "bg-balatro-spectralshadow",
          shadow: "bg-balatro-spectral",
        },
      };
      if (vanillaStyles[setColor]) {
        return vanillaStyles[setColor];
      }
      const shadowColor = darkenColor(setColor, 0.4);
      return {
        bg: shadowColor,
        shadow: setColor,
      };
    }
    if (type === "edition") {
      return {
        bg: "bg-balatro-goldshadow",
        shadow: "bg-balatro-gold",
      };
    }
    if (type === "voucher") {
      return {
        bg: "bg-balatro-shadoworange",
        shadow: "bg-balatro-orange",
      };
    }
    return {
      bg: "bg-balatro-greenshadow",
      shadow: "bg-balatro-green",
    };
  };

  const sizeClasses = {
    sm: {
      image: "w-28 h-36",
      infoWidth: "min-w-40",
    },
    md: {
      image: "w-40 h-52",
      infoWidth: "min-w-48",
    },
    lg: {
      image: "w-48 h-64",
      infoWidth: "min-w-56",
    },
  };

  const currentSize = sizeClasses[size];
  const badgeStyles = getBadgeStyles();
  const isVanillaBadge = badgeStyles.bg.startsWith("bg-");

  const handleImageError = () => {
    setImageError(true);
  };

  const getPlaceholderImage = () => {
    switch (type) {
      case "joker":
        return "/images/placeholder-joker.png";
      case "consumable":
        return "/images/placeholder-consumable.png";
      case "booster":
        return "/images/placeholder-booster.png";
      case "card":
        return "/images/placeholder-enhancement.png";
      case "edition":
        return "/images/placeholder-edition.png";
      case "voucher":
        return "/images/placeholder-voucher.png";
      case "deck":
        return "/images/placeholder-deck.png";
      default:
        return "/images/placeholder-joker.png";
    }
  };

  const getBadgeText = () => {
    if (enhancement) {
      return enhancement;
    }
    if (seal) {
      return seal;
    }
    if (edition) {
      return edition;
    }
    if (type === "joker") {
      return rarityName || "Common";
    }
    if (type === "consumable") {
      return setName || "Tarot";
    }
    if (type === "booster") {
      const boosterData = data as BoosterCardData;
      const typeLabel = boosterData.booster_type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return `${typeLabel} Pack`;
    }
    if (type === "card") {
      return data.name || "New Card";
    }
    if (type === "edition") {
      return data.name || "New Edition";
    }
    if (type === "voucher") {
      return data.name || "New Voucher";
    }
    if (type === "deck") {
      return data.name || "New Deck";
    }
    return "";
  };

  const getLocVars = (): { colours?: string[] } | undefined => {
    if (type === "joker") {
      const jokerData = data as JokerCardData;
      if (jokerData.locVars && Array.isArray(jokerData.locVars.vars)) {
        const colours = jokerData.locVars.vars.filter(
          (v) => typeof v === "string"
        ) as string[];
        return colours.length > 0 ? { colours } : undefined;
      }
    }
    return undefined;
  };

  const handleAceSelect = (aceKey: string) => {
    setSelectedAce(aceKey);
  };

  const getTooltipText = (aceKey: string) => {
    const parts = aceKey.split("_");
    const contrast = parts[0] === "HC" ? "High Contrast" : "Low Contrast";
    const suit = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
    return `${contrast} Ace of ${suit}`;
  };

  const getShaderDisplayName = (shader?: string) => {
    if (!shader) return "";
    const shaderNames: Record<string, string> = {
      foil: "Foil",
      holo: "Holographic",
      polychrome: "Polychrome",
      booster: "Booster",
      debuff: "Debuff",
      voucher: "Voucher",
      negative: "Negative",
      negative_shine: "Negative Shine",
    };
    return (
      shaderNames[shader] || shader.charAt(0).toUpperCase() + shader.slice(1)
    );
  };

  const renderCardImage = () => {
    if (type === "edition") {
      const editionData = data as EditionCardData;
      const shaderName = getShaderDisplayName(editionData.shader);
      return (
        <div className="relative w-full h-full">
          <img
            src={`/images/${aceImageFolder}/${selectedAce}.png`}
            alt=""
            className="w-full h-full object-cover pixelated"
            draggable="false"
          />
          {shaderName && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm font-bold border-2 border-white/50">
                {shaderName}
              </div>
            </div>
          )}
        </div>
      );
    } else if (type === "card" && isSeal) {
      return (
        <div className="relative w-full h-full">
          <img
            src="/images/back.png"
            alt="Card back"
            className="absolute inset-0 w-full h-full object-cover pixelated"
            draggable="false"
          />
          <img
            src={`/images/${aceImageFolder}/${selectedAce}.png`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pixelated pointer-events-none"
            draggable="false"
          />
          {!imageError && data.imagePreview && (
            <img
              src={data.imagePreview}
              alt={data.name}
              className="absolute inset-0 w-full h-full object-cover pixelated"
              draggable="false"
              onError={handleImageError}
            />
          )}
          {data.overlayImagePreview && (
            <img
              src={data.overlayImagePreview}
              alt={`${data.name} overlay`}
              className="absolute inset-0 w-full h-full object-cover pixelated"
              draggable="false"
            />
          )}
        </div>
      );
    } else if (type === "card") {
      return (
        <div className="relative w-full h-full">
          {!imageError && data.imagePreview ? (
            <>
              <img
                src={data.imagePreview}
                alt={data.name}
                className="w-full h-full object-cover pixelated"
                draggable="false"
                onError={handleImageError}
              />
              {data.overlayImagePreview && (
                <img
                  src={data.overlayImagePreview}
                  alt={`${data.name} overlay`}
                  className="absolute inset-0 w-full h-full object-cover pixelated"
                  draggable="false"
                />
              )}
            </>
          ) : !placeholderError ? (
            <img
              src={getPlaceholderImage()}
              alt={`Placeholder ${type}`}
              className="w-full h-full"
              draggable="false"
              onError={() => setPlaceholderError(true)}
            />
          ) : (
            <div className="w-full h-full bg-balatro-black flex items-center justify-center">
              <PhotoIcon className="h-16 w-16 text-white-darker" />
            </div>
          )}
          {!enhancementReplaceBase && (
            <img
              src={`/images/aces/${selectedAce}.png`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover pixelated pointer-events-none"
              draggable="false"
            />
          )}
        </div>
      );
    } else {
      return (
        <div className="relative w-full h-full">
          {!imageError && data.imagePreview ? (
            <div className="relative w-full h-full">
              <img
                src={data.imagePreview}
                alt={data.name}
                className="w-full h-full object-cover pixelated"
                draggable="false"
                onError={handleImageError}
              />
              {data.overlayImagePreview && (
                <img
                  src={data.overlayImagePreview}
                  alt={`${data.name} overlay`}
                  className="absolute inset-0 w-full h-full object-cover pixelated"
                  draggable="false"
                />
              )}
            </div>
          ) : !placeholderError ? (
            <img
              src={getPlaceholderImage()}
              alt={`Placeholder ${type}`}
              className="w-full h-full"
              draggable="false"
              onError={() => setPlaceholderError(true)}
            />
          ) : (
            <div className="w-full h-full bg-balatro-black flex items-center justify-center">
              <PhotoIcon className="h-16 w-16 text-white-darker" />
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div
      className={`select-none font-game relative ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        {showCost && data.cost !== undefined && (
          <div className="bg-cost-bg border-4 border-cost-border rounded-t-2xl px-4 py-1 -mb-1 z-10 relative">
            <span className="text-cost-text font-bold text-shadow-cost text-2xl">
              ${data.cost}
            </span>
          </div>
        )}
        {(type === "card" || type === "edition") && (
          <div className="mb-3 space-y-2">
            {currentAceOptions.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 justify-center">
                {row.map((ace) => (
                  <Tooltip
                    key={ace.key}
                    content={getTooltipText(ace.key)}
                    show={hoveredButton === ace.key}
                    position="top"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAceSelect(ace.key);
                      }}
                      onMouseEnter={() => setHoveredButton(ace.key)}
                      onMouseLeave={() => setHoveredButton(null)}
                      className={`w-10 h-10 rounded border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                        selectedAce === ace.key
                          ? `bg-mint border-mint-light text-black-darker shadow-lg transform scale-110`
                          : `bg-black-dark border-black-lighter text-white-light hover:bg-black-darker hover:border-white-darker hover:scale-105 hover:shadow-md`
                      }`}
                    >
                      <span
                        className={
                          selectedAce === ace.key
                            ? "text-black-darker"
                            : ace.color
                        }
                      >
                        {ace.name}
                      </span>
                    </button>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        )}
        <div
          className={`${
            currentSize.image
          } mb-2 flex items-center justify-center overflow-hidden relative z-10 ${
            showCost && data.cost !== undefined ? "rounded-t-none" : ""
          } `}
        >
          {renderCardImage()}
        </div>
        <div
          className={`${currentSize.infoWidth} flex-shrink-0 absolute top-full left-1/2 transform -translate-x-1/2 z-20`}
        >
          <div className="relative m-2">
            <div className="absolute inset-0 bg-balatro-lightgreyshadow rounded-2xl translate-y-1" />
            <div className="relative">
              <div className="bg-balatro-lightgrey rounded-2xl p-1">
                <div className="bg-balatro-black rounded-xl p-3">
                  {type !== "card" && type !== "edition" && (
                    <h3 className="text-2xl mb-2 text-center text-balatro-white text-shadow-pixel">
                      {data.name || `New ${type}`}
                    </h3>
                  )}
                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-balatro-whiteshadow rounded-xl translate-y-1" />
                    <div className="bg-balatro-white text-balatro-black font-thin px-3 py-2 rounded-xl relative overflow-visible">
                      <div className="text-base text-center leading-4 relative z-10">
                        <BalatroText
                          text={
                            data.description ||
                            `A custom ${type} with unique effects.`
                          }
                          locVars={getLocVars()}
                          noWrap={true}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="relative flex justify-center mt-3">
                    {isSeal && sealBadgeColor ? (
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-xl translate-y-1"
                          style={{ backgroundColor: badgeStyles.bg }}
                        />
                        <div
                          className="rounded-xl text-center text-lg py-1 px-12 relative"
                          style={{ backgroundColor: badgeStyles.shadow }}
                        >
                          <span className="relative text-shadow-pixel text-[#fff]">
                            {getBadgeText()}
                          </span>
                        </div>
                      </div>
                    ) : type === "edition" && editionBadgeColor ? (
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-xl translate-y-1"
                          style={{ backgroundColor: badgeStyles.bg }}
                        />
                        <div
                          className="rounded-xl text-center text-lg py-1 px-12 relative"
                          style={{ backgroundColor: badgeStyles.shadow }}
                        >
                          <span className="relative text-shadow-pixel text-[#fff]">
                            {getBadgeText()}
                          </span>
                        </div>
                      </div>
                    ) : type === "card" || type === "edition" ? (
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-xl translate-y-1"
                          style={{ backgroundColor: "#474C8F" }}
                        />
                        <div
                          className="rounded-xl text-center text-lg text-balatro-white py-1 px-12 relative"
                          style={{ backgroundColor: "#757CDC" }}
                        >
                          <span className="relative text-shadow-pixel">
                            {getBadgeText()}
                          </span>
                        </div>
                      </div>
                    ) : isVanillaBadge ? (
                      <div className="relative">
                        <div
                          className={`absolute inset-0 ${badgeStyles.bg} rounded-xl translate-y-1`}
                        />
                        <div
                          className={`${badgeStyles.shadow} rounded-xl text-center text-lg text-balatro-white py-1 px-12 relative`}
                        >
                          <span className="relative text-shadow-pixel">
                            {getBadgeText()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-xl translate-y-1"
                          style={{ backgroundColor: badgeStyles.bg }}
                        />
                        <div
                          className="rounded-xl text-center text-lg text-balatro-white py-1 px-12 relative"
                          style={{ backgroundColor: badgeStyles.shadow }}
                        >
                          <span className="relative text-shadow-pixel">
                            {getBadgeText()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalatroCard;
