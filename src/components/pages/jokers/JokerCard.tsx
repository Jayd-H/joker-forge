import React, { useState } from "react";
import {
  PencilIcon,
  PuzzlePieceIcon,
  DocumentDuplicateIcon,
  StarIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  LockOpenIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  BuildingStorefrontIcon,
  NoSymbolIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WrenchIcon,
  SparklesIcon,
  CameraIcon,
} from "@heroicons/react/24/solid";

import Tooltip from "../../generic/Tooltip";
import { formatBalatroText } from "../../generic/balatroTextFormatter";
import { validateJokerName } from "../../generic/validationUtils";

import {
  getRarityDisplayName,
  getRarityBadgeColor,
  getAllRarities,
  RarityData,
  type JokerData,
  slugify,
} from "../../data/BalatroUtils";
import { getObjectName } from "../JokersPage";
import { updateGameObjectIds } from "../JokersPage";

interface JokerCardProps {
  joker: JokerData;
  jokers: JokerData[];
  onEditInfo: () => void;
  onEditRules: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onShowcase: () => void;
  onQuickUpdate: (updates: Partial<JokerData>) => void;
  customRarities?: RarityData[];
  modPrefix: string;
  showConfirmation: (options: {
    type?: "default" | "warning" | "danger" | "success";
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "primary" | "secondary" | "danger";
    icon?: React.ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
}

const PropertyIcon: React.FC<{
  icon: React.ReactNode;
  tooltip: string;
  variant: "disabled" | "warning" | "success" | "info" | "special";
  isEnabled: boolean;
  onClick: () => void;
}> = ({ icon, tooltip, variant, isEnabled, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles = {
    disabled: isEnabled
      ? "bg-black-dark border-black-lighter text-white-darker"
      : "bg-black-darker border-black-dark text-black-light opacity-50",
    warning: isEnabled
      ? "bg-balatro-orange/20 border-balatro-orange/40 text-balatro-orange"
      : "bg-black-darker border-black-dark text-black-light opacity-50",
    success: isEnabled
      ? "bg-balatro-green/20 border-balatro-green/40 text-balatro-green"
      : "bg-black-darker border-black-dark text-black-light opacity-50",
    info: isEnabled
      ? "bg-balatro-blue/20 border-balatro-blue/40 text-balatro-blue"
      : "bg-black-darker border-black-dark text-black-light opacity-50",
    special: isEnabled
      ? "bg-balatro-purple/20 border-balatro-purple/40 text-balatro-purple"
      : "bg-black-darker border-black-dark text-black-light opacity-50",
  };

  return (
    <Tooltip content={tooltip} show={isHovered}>
      <div
        className={`flex items-center justify-center w-7 h-7 rounded-lg border-2 transition-all duration-200 cursor-pointer ${variantStyles[variant]}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <div className="w-4 h-4">{icon}</div>
      </div>
    </Tooltip>
  );
};

const JokerCard: React.FC<JokerCardProps> = ({
  joker,
  jokers,
  onEditInfo,
  onEditRules,
  onDelete,
  onDuplicate,
  onExport,
  onQuickUpdate,
  customRarities = [],
  showConfirmation,
  onShowcase,
}) => {
  const [showRarityMenu, setShowRarityMenu] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingCost, setEditingCost] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingId, setEditingId] = useState(false);
  
  const [tempName, setTempName] = useState(joker.name);
  const [tempCost, setTempCost] = useState(joker.cost || 4);
  const [tempId, setTempId] = useState(joker.orderValue);
  const [tempDescription, setTempDescription] = useState(joker.description);

  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredTrash, setHoveredTrash] = useState(false);
  const [hoveredId, setHoveredId] = useState(false);
  const [tooltipDelayTimeout, setTooltipDelayTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const [imageLoadError, setImageLoadError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const safeRarity =
    typeof joker.rarity === "number" && joker.rarity >= 1
      ? joker.rarity
      : typeof joker.rarity === "string"
      ? joker.rarity
      : 1;

  const rarityText = getRarityDisplayName(safeRarity, customRarities);
  const rarityColor = getRarityBadgeColor(safeRarity, customRarities);

  const allRarities = getAllRarities(customRarities);

  const rulesCount = joker.rules?.length || 0;

  const [nameValidationError, setNameValidationError] = useState<string>("");

  const handleNameSave = () => {
    const validation = validateJokerName(tempName);

    if (!validation.isValid) {
      setNameValidationError(validation.error || "Invalid name");
      return;
    }

    const finalName = getObjectName(joker, jokers, tempName)

    onQuickUpdate({ name: finalName, jokerKey: slugify(finalName) });
    setEditingName(false);
    setNameValidationError("");
  };

  const handleCostSave = () => {
    onQuickUpdate({ cost: Math.min(tempCost,999)});
    setEditingCost(false);
  };

  const handleIdSave = () => {
    const priorValue = joker.orderValue
    const newValue = tempId
    onQuickUpdate({ orderValue: Math.max(1,Math.min(tempId,jokers.length)) });
    setEditingId(false);
    const direction = (priorValue>newValue)?'decrease':'increase'
    jokers = updateGameObjectIds(joker, jokers, 'change', newValue, direction, priorValue)
  };

  const handleDescriptionSave = () => {
    onQuickUpdate({ description: tempDescription });
    setEditingDescription(false);
  };

  const handleRarityChange = (value: string) => {
    const parsedValue = parseInt(value, 10);

    // If it's a valid vanilla rarity number (1-4), use as number
    if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 4) {
      onQuickUpdate({ rarity: parsedValue });
    } else {
      // Otherwise it's a custom rarity, use as string
      onQuickUpdate({ rarity: value });
    }

    setShowRarityMenu(false);
  };

  const handleButtonHover = (buttonType: string) => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredButton(buttonType);
    }, 500);
    setTooltipDelayTimeout(timeout);
  };

  const handleButtonLeave = () => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
      setTooltipDelayTimeout(null);
    }
    setHoveredButton(null);
  };

  const handleTrashHover = () => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredTrash(true);
    }, 500);
    setTooltipDelayTimeout(timeout);
  };

  const handleTrashLeave = () => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
      setTooltipDelayTimeout(null);
    }
    setHoveredTrash(false);
  };

  const handleIdHover = () => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredId(true);
    }, 500);
    setTooltipDelayTimeout(timeout);
  };

  const handleIdLeave = () => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
      setTooltipDelayTimeout(null);
    }
    setHoveredId(false);
  };

  const blueprintCompat = joker.blueprint_compat !== false;
  const eternalCompat = joker.eternal_compat !== false;
  const perishableCompat = joker.perishable_compat !== false;
  const isUnlocked = joker.unlocked !== false;
  const isDiscovered = joker.discovered !== false;
  const forceEternal = joker.force_eternal === true;
  const forcePerishable = joker.force_perishable === true;
  const forceRental = joker.force_rental === true;
  const appearsInShop = joker.appears_in_shop !== false;

  const propertyIcons = [
    {
      icon: <WrenchIcon className="w-full h-full" />,
      tooltip: blueprintCompat
        ? "Visually Blueprint Compatbile"
        : "Visually Blueprint Incompatible",
      variant: "disabled" as const,
      isEnabled: blueprintCompat,
      onClick: () => onQuickUpdate({ blueprint_compat: !blueprintCompat }),
    },
    {
      icon: <StarIcon className="w-full h-full" />,
      tooltip: eternalCompat ? "Eternal Compatible" : "Cannot be made Eternal",
      variant: "disabled" as const,
      isEnabled: eternalCompat,
      onClick: () => onQuickUpdate({ eternal_compat: !eternalCompat }),
    },
    {
      icon: <SparklesIcon className="w-full h-full" />,
      tooltip: perishableCompat
        ? "Perishable Compatibility"
        : "Cannot be made Perishable",
      variant: "disabled" as const,
      isEnabled: perishableCompat,
      onClick: () => onQuickUpdate({ perishable_compat: !perishableCompat }),
    },
    {
      icon: isUnlocked ? (
        <LockOpenIcon className="w-full h-full" />
      ) : (
        <LockClosedIcon className="w-full h-full" />
      ),
      tooltip: isUnlocked ? "Unlocked by Default" : "Locked by Default",
      variant: "warning" as const,
      isEnabled: isUnlocked,
      onClick: () => onQuickUpdate({ unlocked: !isUnlocked }),
    },
    {
      icon: isDiscovered ? (
        <EyeIcon className="w-full h-full" />
      ) : (
        <EyeSlashIcon className="w-full h-full" />
      ),
      tooltip: isDiscovered ? "Visible in Collection" : "Hidden in Collection",
      variant: "info" as const,
      isEnabled: isDiscovered,
      onClick: () => onQuickUpdate({ discovered: !isDiscovered }),
    },
    {
      icon: <ExclamationCircleIcon className="w-full h-full" />,
      tooltip: forceEternal
        ? "Always Spawns Eternal"
        : "Normal Eternal Spawning",
      variant: "special" as const,
      isEnabled: forceEternal,
      onClick: () => onQuickUpdate({ force_eternal: !forceEternal }),
    },
    {
      icon: <ClockIcon className="w-full h-full" />,
      tooltip: forcePerishable
        ? "Always Spawns Perishable"
        : "Normal Perishable Spawning",
      variant: "warning" as const,
      isEnabled: forcePerishable,
      onClick: () => onQuickUpdate({ force_perishable: !forcePerishable }),
    },
    {
      icon: <CurrencyDollarIcon className="w-full h-full" />,
      tooltip: forceRental ? "Always Spawns Rental" : "Normal Rental Spawning",
      variant: "info" as const,
      isEnabled: forceRental,
      onClick: () => onQuickUpdate({ force_rental: !forceRental }),
    },
    {
      icon: appearsInShop ? (
        <BuildingStorefrontIcon className="w-full h-full" />
      ) : (
        <NoSymbolIcon className="w-full h-full" />
      ),
      tooltip: appearsInShop
        ? joker.rarity === 4
          ? "Forced Shop Appearance"
          : "Appears in Shop"
        : "Doesn't Appear in Shop",
      variant:
        appearsInShop && joker.rarity === 4
          ? ("special" as const)
          : ("success" as const),
      isEnabled: appearsInShop,
      onClick: () => onQuickUpdate({ appears_in_shop: !appearsInShop }),
    },
  ];

  return (
    <div className="flex gap-4 relative">
      <div className="relative flex flex-col items-center">
        <div className="px-4 -mb-6 z-20 py-1 rounded-md border-2 font-bold cursor-pointer transition-all bg-black  tracking-widest border-balatro-money text-balatro-money w-18 text-center">
          {editingCost ? (
            <input
              type="number"
              value={tempCost}
              onChange={(e) => setTempCost(parseInt(e.target.value))}
              onBlur={handleCostSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCostSave();
                if (e.key === "Escape") {
                  setTempCost(joker.cost || 4);
                  setEditingCost(false);
                }
              }}
              className="w-full bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
          ) : (
            <span
              onClick={() => {
                setTempCost(joker.cost || 4);
                setEditingCost(true);
              }}
            >
              ${joker.cost || 4}
            </span>
          )}
        </div>

        <div className="w-42 z-10 relative">
          <div className="relative">
            {joker.imagePreview && !imageLoadError ? (
              <>
                <img
                  src={joker.imagePreview}
                  alt={joker.name}
                  className="w-full h-full object-contain"
                  draggable="false"
                  onError={() => setImageLoadError(true)}
                />
                {joker.overlayImagePreview && (
                  <img
                    src={joker.overlayImagePreview}
                    alt={`${joker.name} overlay`}
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable="false"
                  />
                )}
              </>
            ) : (
              <img
                src={
                  !fallbackAttempted
                    ? "/images/placeholderjokers/placeholder-joker.png"
                    : "/images/placeholder-joker.png"
                }
                alt="Default Joker"
                className="w-full h-full object-contain"
                draggable="false"
                onError={() => {
                  if (!fallbackAttempted) {
                    setFallbackAttempted(true);
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="relative z-30">
          <div
            className="px-6 py-1 -mt-6 rounded-md border-2 text-sm tracking-wide font-medium cursor-pointer transition-all bg-black"
            style={{
              borderColor: rarityColor,
              color: rarityColor,
            }}
            onClick={() => setShowRarityMenu(!showRarityMenu)}
          >
            {rarityText}
          </div>

          {showRarityMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 border-2 border-black-lighter rounded-lg shadow-lg z-50 overflow-hidden">
              {allRarities.map((rarity) => (
                <div
                  key={rarity.value.toString()}
                  className="px-3 py-1 text-xs font-medium cursor-pointer transition-all hover:bg-opacity-20 bg-black border-b border-black-lighter last:border-b-0"
                  style={{
                    color: getRarityBadgeColor(rarity.value, customRarities),
                  }}
                  onClick={() => handleRarityChange(rarity.value.toString())}
                >
                  {rarity.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="my-auto border-l-2 pl-4 border-black-light relative flex-1 min-h-fit">
        <Tooltip content = "Edit Joker Id"show={hoveredId}>
          <div 
            className="absolute min-w-13 -top-3 right-7 h-8 bg-black-dark border-2 border-balatro-orange rounded-lg p-1 cursor-pointer transition-colors flex items-center justify-center z-10"
            onMouseEnter={handleIdHover}
            onMouseLeave={handleIdLeave}>
            {editingId ? (
            <input 
              type="number"
              value={tempId}
              onChange={(e) => setTempId(parseInt(e.target.value))}
              onBlur={handleIdSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleIdSave();
                if (e.key === "Escape") {
                  setTempId(joker.orderValue);
                  setEditingId(false);
                }
              }}
              className="bg-black-dark text-center text-balatro-orange outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
              />):(
            <span
              className="text-center text-balatro-orange outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onClick={() => {
                setTempId(joker.orderValue);
                setEditingId(true);
              }}
            >
              Id:{joker.orderValue}
            </span>)}
            </div>
        </Tooltip>
        <Tooltip content="Delete Joker" show={hoveredTrash}>
          <div
            className="absolute -top-3 -right-3 h-8 bg-black-dark border-2 border-balatro-red rounded-lg p-1 hover:bg-balatro-redshadow cursor-pointer transition-colors flex items-center justify-center z-10"
            onMouseEnter={handleTrashHover}
            onMouseLeave={handleTrashLeave}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                showConfirmation({
                  type: "danger",
                  title: "Delete Joker",
                  description: `Are you sure you want to delete "${joker.name}"? This action cannot be undone.`,
                  confirmText: "Delete Forever",
                  cancelText: "Keep It",
                  confirmVariant: "danger",
                  onConfirm: () => {onDelete()
                  jokers = updateGameObjectIds(joker, jokers, 'remove', joker.orderValue)}
                  ,
                });
              }}
              className="w-full h-full flex items-center cursor-pointer justify-center"
            >
              <TrashIcon className="h-5 w-5 text-balatro-red" />
            </button>
          </div>
        </Tooltip>

        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="mb-3 h-7 flex items-start overflow-hidden">
              {editingName ? (
                <div className="w-full">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => {
                      setTempName(e.target.value);
                      if (nameValidationError) {
                        const validation = validateJokerName(e.target.value);
                        if (validation.isValid) {
                          setNameValidationError("");
                        }
                      }
                    }}
                    onBlur={() => {
                      if (!nameValidationError) {
                        handleNameSave();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleNameSave();
                      }
                      if (e.key === "Escape") {
                        setTempName(joker.name);
                        setEditingName(false);
                        setNameValidationError("");
                      }
                    }}
                    className={`text-white-lighter text-xl tracking-wide leading-tight bg-transparent border-none outline-none w-full cursor-text ${
                      nameValidationError ? "border-b-2 border-balatro-red" : ""
                    }`}
                    autoFocus
                  />
                </div>
              ) : (
                <h3
                  className="text-white-lighter text-xl tracking-wide leading-tight cursor-pointer line-clamp-1"
                  onClick={() => {
                    setTempName(joker.name);
                    setEditingName(true);
                    setNameValidationError("");
                  }}
                  style={{ lineHeight: "1.75rem" }}
                >
                  {joker.name}
                </h3>
              )}
            </div>

            <div className=" mb-4 h-12 flex items-start overflow-hidden">
              {editingDescription ? (
                <textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  onBlur={handleDescriptionSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) handleDescriptionSave();
                    if (e.key === "Escape") {
                      setTempDescription(joker.description);
                      setEditingDescription(false);
                    }
                  }}
                  className="text-white-darker text-sm leading-relaxed bg-transparent border-none outline-none resize-none w-full cursor-text h-full"
                  autoFocus
                />
              ) : (
                <div
                  className="text-white-darker text-sm leading-relaxed cursor-pointer w-full line-clamp-3"
                  onClick={() => {
                    setTempDescription(joker.description);
                    setEditingDescription(true);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatBalatroText(joker.description),
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between mb-4 h-8 flex-wrap">
              {propertyIcons.map((iconConfig, index) => (
                <PropertyIcon
                  key={index}
                  icon={iconConfig.icon}
                  tooltip={iconConfig.tooltip}
                  variant={iconConfig.variant}
                  isEnabled={iconConfig.isEnabled}
                  onClick={iconConfig.onClick}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between overflow-hidden">
            <Tooltip content="Edit Info" show={hoveredButton === "edit"}>
              <div
                className="flex flex-1 transition-colors cursor-pointer group"
                onClick={onEditInfo}
                onMouseEnter={() => handleButtonHover("edit")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center px-3 py-3">
                  <PencilIcon className="h-6 w-6 text-white group-hover:text-mint-lighter transition-colors" />
                </div>
              </div>
            </Tooltip>
            <div className="w-px bg-black-lighter py-3"></div>
            <Tooltip content="Edit Rules" show={hoveredButton === "rules"}>
              <div
                className="flex flex-1 hover:text-mint-light transition-colors cursor-pointer group"
                onClick={onEditRules}
                onMouseEnter={() => handleButtonHover("rules")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <div className="relative">
                    <PuzzlePieceIcon className="h-6 w-6 group-hover:text-mint-lighter text-white transition-colors" />
                    {rulesCount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-mint text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        {rulesCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Tooltip>
            <div className="w-px bg-black-lighter py-3"></div>
            <Tooltip content="Export Joker" show={hoveredButton === "export"}>
              <div
                className="flex flex-1 transition-colors cursor-pointer group"
                onClick={onExport}
                onMouseEnter={() => handleButtonHover("export")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <ArrowDownTrayIcon className="h-6 w-6 text-white group-hover:text-mint-lighter transition-colors" />
                </div>
              </div>
            </Tooltip>
            <div className="w-px bg-black-lighter py-3"></div>
            <Tooltip content="Duplicate" show={hoveredButton === "duplicate"}>
              <div
                className="flex flex-1 transition-colors cursor-pointer group"
                onClick={onDuplicate}
                onMouseEnter={() => handleButtonHover("duplicate")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <DocumentDuplicateIcon className="h-6 w-6 text-white group-hover:text-mint-lighter transition-colors" />
                </div>
              </div>
            </Tooltip>
            <div className="w-px bg-black-lighter py-3"></div>
            <Tooltip content="Showcase" show={hoveredButton === "showcase"}>
              <div
                className="flex flex-1 transition-colors cursor-pointer group"
                onClick={onShowcase}
                onMouseEnter={() => handleButtonHover("showcase")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <CameraIcon className="h-6 w-6 text-white group-hover:text-mint-lighter transition-colors" />
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JokerCard;
