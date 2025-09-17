import React, { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  GiftIcon,
  PlayIcon,
  EyeIcon,
  EyeSlashIcon,
  CubeIcon,
  RectangleStackIcon,
  UserGroupIcon,
  SparklesIcon as SparklesIconSolid,
  Cog6ToothIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";
import Tooltip from "../../generic/Tooltip";
import { validateJokerName } from "../../generic/validationUtils";
import { formatBalatroText } from "../../generic/balatroTextFormatter";
import { BoosterData, slugify } from "../../data/BalatroUtils";
import { updateGameObjectIds, getObjectName } from "../../generic/GameObjectOrdering";


interface BoosterCardProps {
  booster: BoosterData;
  boosters: BoosterData[];
  onEditInfo: () => void;
  onEditRules: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onQuickUpdate: (updates: Partial<BoosterData>) => void;
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

const BoosterCard: React.FC<BoosterCardProps> = ({
  booster,
  boosters,
  onEditInfo,
  onEditRules,
  onDelete,
  onDuplicate,
  onQuickUpdate,
  showConfirmation,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [editingCost, setEditingCost] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingId, setEditingId] = useState(false);

  const [tempName, setTempName] = useState(booster.name);
  const [tempCost, setTempCost] = useState(booster.cost);
  const [tempId, setTempId] = useState(booster.orderValue);
  const [tempDescription, setTempDescription] = useState(booster.description);
  
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredTrash, setHoveredTrash] = useState(false);
  const [hoveredId, setHoveredId] = useState(false);
  
  const [tooltipDelayTimeout, setTooltipDelayTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleNameSave = () => {
    const validation = validateJokerName(tempName);
    if (validation.isValid) {
      const tempKey = getObjectName(booster, boosters, tempName)
      onQuickUpdate({ name: tempName, objectKey: slugify(tempKey) });
      setEditingName(false)    
  }};

  const handleCostSave = () => {
    onQuickUpdate({ cost: tempCost });
    setEditingCost(false);
  };

  const handleDescriptionSave = () => {
    onQuickUpdate({ description: tempDescription });
    setEditingDescription(false);
  };

  const handleIdSave = () => {
      const priorValue = booster.orderValue
      const newValue = tempId
      onQuickUpdate({ orderValue: Math.max(1,Math.min(tempId,boosters.length)) });
      setEditingId(false);
      const direction = (priorValue>newValue)?'decrease':'increase'
      boosters = updateGameObjectIds(booster, boosters, 'change', newValue, direction, priorValue)
    };

  const handleDeleteClick = () => {
    showConfirmation({
      type: "danger",
      title: "Delete Booster Pack",
      description: `Are you sure you want to delete "${booster.name}"? This action cannot be undone.`,
      confirmText: "Delete Booster",
      cancelText: "Keep Booster",
      confirmVariant: "danger",
      onConfirm: () => {
      onDelete()
      boosters = updateGameObjectIds(booster, boosters, 'remove', booster.orderValue)
      }
    });
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

  const getBoosterTypeIcon = () => {
    switch (booster.booster_type) {
      case "joker":
        return <UserGroupIcon className="w-full h-full" />;
      case "consumable":
        return <SparklesIconSolid className="w-full h-full" />;
      case "playing_card":
        return <RectangleStackIcon className="w-full h-full" />;
      default:
        return <CubeIcon className="w-full h-full" />;
    }
  };

  const getBoosterTypeLabel = () => {
    switch (booster.booster_type) {
      case "joker":
        return "Joker Pack";
      case "consumable":
        return "Consumable Pack";
      case "playing_card":
        return "Playing Card Pack";
      default:
        return "Unknown Pack";
    }
  };

  const getBoosterTypeColor = () => {
    switch (booster.booster_type) {
      case "joker":
        return "text-balatro-purple border-balatro-purple";
      case "consumable":
        return "text-mint border-mint";
      case "playing_card":
        return "text-balatro-blue border-balatro-blue";
      default:
        return "text-balatro-gold-new border-balatro-gold-new";
    }
  };

  const rulesCount = booster.card_rules?.length || 0;
  const isDiscovered = booster.discovered ?? true;
  const drawToHand = booster.draw_hand === true;
  const instantUse = booster.instant_use === true;

  const propertyIcons = [
    {
      icon: getBoosterTypeIcon(),
      tooltip: getBoosterTypeLabel(),
      variant: "info" as const,
      isEnabled: true,
      onClick: () => {},
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
      icon: <HandRaisedIcon className="w-full h-full" />,
      tooltip: drawToHand ? "Draws to Hand" : "Opens Normally",
      variant: "success" as const,
      isEnabled: drawToHand,
      onClick: () => onQuickUpdate({ draw_hand: !drawToHand }),
    },
    {
      icon: <PlayIcon className="w-full h-full" />,
      tooltip: instantUse ? "Instant Use": "Adds to Hand" ,
      variant: "success" as const,
      isEnabled: instantUse,
      onClick: () => onQuickUpdate({ instant_use: !instantUse }),
    },
  ];

  return (
    <div className="flex gap-4 relative">
      <div className="relative flex flex-col items-center">
        <div className="px-4 -mb-6 z-20 py-1 rounded-md border-2 font-bold transition-all bg-black tracking-widest border-balatro-money text-balatro-money w-18 text-center">
          {editingCost ? (
            <input
              type="number"
              value={tempCost}
              onChange={(e) => setTempCost(parseInt(e.target.value))}
              onBlur={handleCostSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCostSave();
                if (e.key === "Escape") {
                  setTempCost(booster.cost);
                  setEditingCost(false);
                }
              }}
              className="w-full bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
          ) : (
            <span
              onClick={() => {
                setTempCost(booster.cost);
                setEditingCost(true);
              }}
            >
              ${booster.cost}
            </span>
          )}
        </div>

        <div className="w-42 z-10 relative">
          <div className="relative rounded-lg overflow-hidden">
            {booster.imagePreview && !imageLoadError ? (
              <img
                src={booster.imagePreview}
                alt={booster.name}
                className="w-full h-full object-contain"
                draggable="false"
                onError={() => setImageLoadError(true)}
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center border-2 border-mint/30 rounded-lg">
                <GiftIcon className="h-16 w-16 text-mint opacity-60" />
              </div>
            )}
          </div>
        </div>
        <div className="relative z-30">
          <div
            className={`px-4 py-1 -mt-6 rounded-md border-2 text-sm tracking-wide font-medium bg-black ${getBoosterTypeColor()}`}
          >
            {getBoosterTypeLabel()}
          </div>
        </div>
      </div>
      <div className="my-auto border-l-2 pl-4 border-black-light relative flex-1 min-h-fit">
        <Tooltip content = "Edit Booster Id"show={hoveredId}>
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
                  setTempId(booster.orderValue);
                  setEditingId(false);
                }
              }}
              className="bg-black-dark text-center text-balatro-orange outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
              />):(
            <span
              className="text-center text-balatro-orange outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onClick={() => {
                setTempId(booster.orderValue);
                setEditingId(true);
              }}
            >
              Id:{booster.orderValue}
            </span>)}
            </div>
        </Tooltip>
        <Tooltip content="Delete Booster" show={hoveredTrash}>
          <div
            className="absolute -top-3 -right-3 bg-black-dark border-2 border-balatro-red rounded-lg p-1 hover:bg-balatro-redshadow cursor-pointer transition-colors flex items-center justify-center z-10"
            onMouseEnter={handleTrashHover}
            onMouseLeave={handleTrashLeave}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick();
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
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSave();
                    if (e.key === "Escape") {
                      setTempName(booster.name);
                      setEditingName(false);
                    }
                  }}
                  className="text-white-lighter text-xl tracking-wide leading-tight bg-transparent border-none outline-none w-full cursor-text"
                  autoFocus
                />
              ) : (
                <h3
                  className="text-white-lighter text-xl tracking-wide leading-tight cursor-pointer line-clamp-1"
                  onClick={() => {
                    setTempName(booster.name);
                    setEditingName(true);
                  }}
                  style={{ lineHeight: "1.75rem" }}
                >
                  {booster.name}
                </h3>
              )}
            </div>

            <div className="mb-4 h-12 flex items-start overflow-hidden">
              {editingDescription ? (
                <textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  onBlur={handleDescriptionSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) handleDescriptionSave();
                    if (e.key === "Escape") {
                      setTempDescription(booster.description);
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
                    setTempDescription(booster.description);
                    setEditingDescription(true);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatBalatroText(booster.description),
                  }}
                />
              )}
            </div>

            <div className="mb-4">
              <div className="text-xs text-white-darker mb-1">
                Configuration:
              </div>
              <div className="text-white-light text-sm">
                {booster.config.extra} cards, choose {booster.config.choose}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 px-8 h-8 flex-wrap">
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

          <div className="flex items-center px-8 justify-between overflow-hidden">
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
                className="flex flex-1 transition-colors cursor-pointer group"
                onClick={onEditRules}
                onMouseEnter={() => handleButtonHover("rules")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <div className="relative">
                    <Cog6ToothIcon className="h-6 w-6 text-white group-hover:text-mint-lighter transition-colors" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoosterCard;
