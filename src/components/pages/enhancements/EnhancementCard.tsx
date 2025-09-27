import React, { useState } from "react";
import {
  PencilIcon,
  PuzzlePieceIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  LockOpenIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowDownTrayIcon,
  HeartIcon,
  ShieldCheckIcon,
  XMarkIcon,
  HashtagIcon,
  StarIcon,
  EyeSlashIcon as HiddenIcon,
} from "@heroicons/react/24/solid";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Tooltip from "../../generic/Tooltip";
import { formatBalatroText } from "../../generic/balatroTextFormatter";
import { validateJokerName } from "../../generic/validationUtils";
import { EnhancementData, slugify } from "../../data/BalatroUtils";
import {
  updateGameObjectIds,
  getObjectName,
} from "../../generic/GameObjectOrdering";
import PlaceholderPickerModal from "../../generic/PlaceholderPickerModal";

interface EnhancementCardProps {
  enhancement: EnhancementData;
  enhancements: EnhancementData[];
  onEditInfo: () => void;
  onEditRules: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onQuickUpdate: (updates: Partial<EnhancementData>) => void;
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

const EnhancementCard: React.FC<EnhancementCardProps> = ({
  enhancement,
  enhancements,
  onEditInfo,
  onEditRules,
  onDuplicate,
  onExport,
  onQuickUpdate,
  showConfirmation,
  onDelete,
}) => {
  const rulesCount = enhancement.rules?.length || 0;

  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingId, setEditingId] = useState(false);

  const [tempName, setTempName] = useState(enhancement.name);
  const [tempDescription, setTempDescription] = useState(
    enhancement.description
  );
  const [tempId, setTempId] = useState(enhancement.orderValue);

  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredTrash, setHoveredTrash] = useState(false);
  const [hoveredId, setHoveredId] = useState(false);
  const [tooltipDelayTimeout, setTooltipDelayTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const [imageLoadError, setImageLoadError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [showPlaceholderPicker, setShowPlaceholderPicker] = useState(false);

  const [nameValidationError, setNameValidationError] = useState<string>("");

  const handleEditRules = () => {
    onEditRules();
  };

  const handleNameSave = () => {
    const validation = validateJokerName(tempName);

    if (!validation.isValid) {
      setNameValidationError(validation.error || "Invalid name");
      return;
    }

    const tempKey = getObjectName(enhancement, enhancements, tempName);
    onQuickUpdate({ name: tempName, objectKey: slugify(tempKey) });
    setEditingName(false);
    setNameValidationError("");
  };

  const handleDescriptionSave = () => {
    onQuickUpdate({ description: tempDescription });
    setEditingDescription(false);
  };

  const handleIdSave = () => {
    const priorValue = enhancement.orderValue;
    const newValue = tempId;
    onQuickUpdate({
      orderValue: Math.max(1, Math.min(tempId, enhancements.length)),
    });
    setEditingId(false);
    const direction = priorValue > newValue ? "decrease" : "increase";
    enhancements = updateGameObjectIds(
      enhancement,
      enhancements,
      "change",
      newValue,
      direction,
      priorValue
    );
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

  const isUnlocked = enhancement.unlocked !== false;
  const isDiscovered = enhancement.discovered !== false;
  const noCollection = enhancement.no_collection === true;
  const anySuit = enhancement.any_suit === true;
  const replaceBaseCard = enhancement.replace_base_card === true;
  const noRank = enhancement.no_rank === true;
  const noSuit = enhancement.no_suit === true;
  const alwaysScores = enhancement.always_scores === true;

  const propertyIcons = [
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
      icon: <HiddenIcon className="w-full h-full" />,
      tooltip: noCollection ? "Hidden from Collection" : "Shows in Collection",
      variant: "disabled" as const,
      isEnabled: noCollection,
      onClick: () => onQuickUpdate({ no_collection: !noCollection }),
    },
    {
      icon: <HeartIcon className="w-full h-full" />,
      tooltip: anySuit ? "Works with Any Suit" : "Suit-Specific",
      variant: "special" as const,
      isEnabled: anySuit,
      onClick: () => onQuickUpdate({ any_suit: !anySuit }),
    },
    {
      icon: <ShieldCheckIcon className="w-full h-full" />,
      tooltip: replaceBaseCard ? "Replaces Base Card" : "Normal Card",
      variant: "info" as const,
      isEnabled: replaceBaseCard,
      onClick: () => onQuickUpdate({ replace_base_card: !replaceBaseCard }),
    },
    {
      icon: <HashtagIcon className="w-full h-full" />,
      tooltip: noRank ? "No Rank" : "Has Rank",
      variant: "disabled" as const,
      isEnabled: noRank,
      onClick: () => onQuickUpdate({ no_rank: !noRank }),
    },
    {
      icon: <XMarkIcon className="w-full h-full" />,
      tooltip: noSuit ? "No Suit" : "Has Suit",
      variant: "disabled" as const,
      isEnabled: noSuit,
      onClick: () => onQuickUpdate({ no_suit: !noSuit }),
    },
    {
      icon: <StarIcon className="w-full h-full" />,
      tooltip: alwaysScores ? "Always Scores" : "Normal Scoring",
      variant: "success" as const,
      isEnabled: alwaysScores,
      onClick: () => onQuickUpdate({ always_scores: !alwaysScores }),
    },
  ];

  return (
    <div className="flex gap-4 relative">
      <div className="relative flex flex-col items-center">
        <div className="w-42 z-10 relative group">
          <div className="relative">
            {enhancement.imagePreview && !imageLoadError ? (
              <div className="relative w-full h-full">
                <img
                  src={enhancement.imagePreview}
                  alt={enhancement.name}
                  className="w-full h-full object-contain"
                  draggable="false"
                  onError={() => setImageLoadError(true)}
                />
                {!enhancement.replace_base_card && (
                  <img
                    src="/images/aces/HC_A_hearts.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    draggable="false"
                  />
                )}
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={
                    !fallbackAttempted
                      ? "/images/placeholderenhancements/placeholder-enhancement.png"
                      : "/images/placeholder-enhancement.png"
                  }
                  alt="Default Enhancement"
                  className="w-full h-full object-contain"
                  draggable="false"
                  onError={() => {
                    if (!fallbackAttempted) {
                      setFallbackAttempted(true);
                    }
                  }}
                />
                <img
                  src="/images/aces/HC_A_clubs.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  draggable="false"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowPlaceholderPicker(true)}
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
              title="Choose placeholder"
            >
              <PhotoIcon className="h-4 w-4 text-white-darker" />
            </button>
          </div>
        </div>

        <div className="relative z-30">
          <div className="px-6 py-1 -mt-6 rounded-md border-2 text-sm tracking-wide font-medium bg-black border-balatro-enhanced text-balatro-enhanced">
            Enhancement
          </div>
        </div>
      </div>

      <div className="my-auto border-l-2 pl-4 border-black-light relative flex-1 min-h-fit">
        <Tooltip content="Edit Joker Id" show={hoveredId}>
          <div
            className="absolute min-w-13 -top-3 right-7 h-8 bg-black-dark border-2 border-balatro-orange rounded-lg p-1 cursor-pointer transition-colors flex items-center justify-center z-10"
            onMouseEnter={handleIdHover}
            onMouseLeave={handleIdLeave}
          >
            {editingId ? (
              <input
                type="number"
                value={tempId}
                onChange={(e) => setTempId(parseInt(e.target.value))}
                onBlur={handleIdSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleIdSave();
                  if (e.key === "Escape") {
                    setTempId(enhancement.orderValue);
                    setEditingId(false);
                  }
                }}
                className="bg-black-dark text-center text-balatro-orange outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                autoFocus
              />
            ) : (
              <span
                className="text-center text-balatro-orange outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onClick={() => {
                  setTempId(enhancement.orderValue);
                  setEditingId(true);
                }}
              >
                Id:{enhancement.orderValue}
              </span>
            )}
          </div>
        </Tooltip>
        <Tooltip content="Delete Enhancement" show={hoveredTrash}>
          <div
            className="absolute -top-3 -right-3 bg-black-dark border-2 border-balatro-red rounded-lg p-1 hover:bg-balatro-redshadow cursor-pointer transition-colors flex items-center justify-center z-10"
            onMouseEnter={handleTrashHover}
            onMouseLeave={handleTrashLeave}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                showConfirmation({
                  type: "danger",
                  title: "Delete Enhancement",
                  description: `Are you sure you want to delete "${enhancement.name}"? This action cannot be undone.`,
                  confirmText: "Delete Forever",
                  cancelText: "Keep It",
                  confirmVariant: "danger",
                  onConfirm: () => {
                    onDelete();
                    enhancements = updateGameObjectIds(
                      enhancement,
                      enhancements,
                      "remove",
                      enhancement.orderValue
                    );
                  },
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
                        setTempName(enhancement.name);
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
                    setTempName(enhancement.name);
                    setEditingName(true);
                    setNameValidationError("");
                  }}
                  style={{ lineHeight: "1.75rem" }}
                >
                  {enhancement.name}
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
                      setTempDescription(enhancement.description);
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
                    setTempDescription(enhancement.description);
                    setEditingDescription(true);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatBalatroText(enhancement.description),
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between mb-4 px-4 h-8 flex-wrap">
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

          <div className="flex items-center justify-between px-8 overflow-hidden">
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
                onClick={handleEditRules}
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

            <Tooltip
              content="Export Enhancement"
              show={hoveredButton === "export"}
            >
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
          </div>
        </div>
      </div>
      <PlaceholderPickerModal
        type="enhancement"
        isOpen={showPlaceholderPicker}
        onClose={() => setShowPlaceholderPicker(false)}
        onSelect={(index, src) => {
          onQuickUpdate({
            imagePreview: src,
            hasUserUploadedImage: false,
            placeholderCreditIndex: index,
          });
          setShowPlaceholderPicker(false);
        }}
      />
    </div>
  );
};

export default EnhancementCard;
