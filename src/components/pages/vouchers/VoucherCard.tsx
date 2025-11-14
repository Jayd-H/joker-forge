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
  EyeSlashIcon as HiddenIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
} from "@heroicons/react/24/solid";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Tooltip from "../../generic/Tooltip";
import { formatBalatroText } from "../../generic/balatroTextFormatter";
import { validateJokerName } from "../../generic/validationUtils";
import { VoucherData } from "../../data/BalatroUtils";
import {
  updateGameObjectIds,
  getObjectName,
} from "../../generic/GameObjectOrdering";
import PlaceholderPickerModal from "../../generic/PlaceholderPickerModal";
import { generateKeyFromName } from "./EditVoucherInfo";

interface VoucherCardProps {
  voucher: VoucherData;
  vouchers: VoucherData[];
  onEditInfo: () => void;
  onEditRules: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onQuickUpdate: (updates: Partial<VoucherData>) => void;
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

const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  vouchers,
  onEditInfo,
  onEditRules,
  onDuplicate,
  onExport,
  onQuickUpdate,
  showConfirmation,
  onDelete,
}) => {
  const rulesCount = voucher.rules?.length || 0;

  const [editingName, setEditingName] = useState(false);
  const [editingCost, setEditingCost] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingId, setEditingId] = useState(false);

  const [tempName, setTempName] = useState(voucher.name);
  const [tempCost, setTempCost] = useState(voucher.cost || 3);
  const [tempDescription, setTempDescription] = useState(
    voucher.description
  );
  const [tempId, setTempId] = useState(voucher.orderValue);

  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredTrash, setHoveredTrash] = useState(false);
  const [tooltipDelayTimeout, setTooltipDelayTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [hoveredId, setHoveredId] = useState(false);

  const [imageLoadError, setImageLoadError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [showPlaceholderPicker, setShowPlaceholderPicker] = useState(false);

  const [nameValidationError, setNameValidationError] = useState<string>("");

const getShaderDisplayName = (shader?: string | false) => {
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
  
  const handleEditRules = () => {
    onEditRules();
  };

  const handleNameSave = () => {
    const validation = validateJokerName(tempName);

    if (!validation.isValid) {
      setNameValidationError(validation.error || "Invalid name");
      return;
    }

    const tempKey = getObjectName(voucher, vouchers, tempName);
    onQuickUpdate({ name: tempName, objectKey: generateKeyFromName(tempKey) });
    setEditingName(false);
    setNameValidationError("");
  };

  const handleCostSave = () => {
    onQuickUpdate({ cost: tempCost });
    setEditingCost(false);
  };

  const handleDescriptionSave = () => {
    onQuickUpdate({ description: tempDescription });
    setEditingDescription(false);
  };

  const handleIdSave = () => {
    const priorValue = voucher.orderValue;
    const newValue = tempId;
    onQuickUpdate({
      orderValue: Math.max(1, Math.min(tempId, vouchers.length)),
    });
    setEditingId(false);
    const direction = priorValue > newValue ? "decrease" : "increase";
    vouchers = updateGameObjectIds(
      voucher,
      vouchers,
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

  const isUnlocked = voucher.unlocked !== false;
  const isDiscovered = voucher.discovered !== false;
  const isRequires = voucher.requires_activetor !== false;
  const noCollection = voucher.no_collection === true;
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
      icon: isRequires ? (
        <BookmarkIcon className="w-full h-full" />
      ) : (
        <BookmarkSlashIcon className="w-full h-full" />
      ),
      tooltip: isRequires ? "Requires a Voucher" : "Independent",
      variant: "info" as const,
      isEnabled: isRequires,
      onClick: () => onQuickUpdate({ requires_activetor: !isRequires, }),
    },
    {
      icon: noCollection ? (
        <EyeSlashIcon className="w-full h-full" />
      ) : (
        <HiddenIcon className="w-full h-full" />
      ),
      tooltip: noCollection ? "Hidden from Collection" : "Shows in Collection",
      variant: "disabled" as const,
     isEnabled: noCollection,
      onClick: () => onQuickUpdate({ no_collection: !noCollection }),
    },
  ];

    const shaderName = getShaderDisplayName(voucher.draw_shader_sprite);
  
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
                  setTempCost(voucher.cost || 10);
                  setEditingCost(false);
                }
              }}
              className="w-full bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
          ) : (
            <span
              onClick={() => {
                setTempCost(voucher.cost || 10);
                setEditingCost(true);
              }}
            >
              ${voucher.cost || 10}
            </span>
          )}
          {shaderName && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm font-bold border-2 border-white/50">
                  {shaderName}
                </div>
              </div>
            )}
        </div>

        <div className="w-42 z-10 relative group">
          <div className="relative">
            {voucher.imagePreview && !imageLoadError ? (
              <>
                <img
                  src={voucher.imagePreview}
                  alt={voucher.name}
                  className="w-full h-full object-contain"
                  draggable="false"
                  onError={() => setImageLoadError(true)}
                />
                {voucher.overlayImagePreview && (
                  <img
                    src={voucher.overlayImagePreview}
                    alt={`${voucher.name} overlay`}
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
                alt="Default Voucher"
                className="w-full h-full object-contain"
                draggable="false"
                onError={() => {
                  if (!fallbackAttempted) {
                    setFallbackAttempted(true);
                  }
                }}
              />
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
          <div className="px-6 py-1 -mt-6 rounded-md bg-black-dark border-2 text-sm tracking-wide font-medium text-balatro-voucher">
            Voucher
          </div>
        </div>
      </div>

      <div className="my-auto border-l-2 pl-4 border-black-light relative flex-1 min-h-fit">
        <Tooltip content="Edit Voucher Id" show={hoveredId}>
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
                    setTempId(voucher.orderValue);
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
                  setTempId(voucher.orderValue);
                  setEditingId(true);
                }}
              >
                Id:{voucher.orderValue}
              </span>
            )}
          </div>
        </Tooltip>
        <Tooltip content="Delete Voucher" show={hoveredTrash}>
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
                  title: "Delete Voucher",
                  description: `Are you sure you want to delete "${voucher.name}"? This action cannot be undone.`,
                  confirmText: "Delete Forever",
                  cancelText: "Keep It",
                  confirmVariant: "danger",
                  onConfirm: () => {
                    onDelete();
                    vouchers = updateGameObjectIds(
                      voucher,
                      vouchers,
                      "remove",
                      voucher.orderValue
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
                        setTempName(voucher.name);
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
                    setTempName(voucher.name);
                    setEditingName(true);
                    setNameValidationError("");
                  }}
                  style={{ lineHeight: "1.75rem" }}
                >
                  {voucher.name}
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
                      setTempDescription(voucher.description);
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
                    setTempDescription(voucher.description);
                    setEditingDescription(true);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatBalatroText(voucher.description),
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between mb-4 px-12 h-8 flex-wrap">
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
              content="Export Voucher"
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
        <PlaceholderPickerModal
          type="voucher"
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
    </div>
  );
};

export default VoucherCard;
