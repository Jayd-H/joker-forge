import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  BoltIcon,
  PuzzlePieceIcon,
  BeakerIcon,
  PercentBadgeIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";

interface BlockComponentProps {
  label: string;
  type: "trigger" | "condition" | "effect";
  onClick: (e?: React.MouseEvent) => void;
  isSelected?: boolean;
  showTrash?: boolean;
  onDelete?: () => void;
  parameterCount?: number;
  isNegated?: boolean;
  dynamicTitle?: string;
  variableName?: string;
  hasRandomChance?: boolean;
  isDraggable?: boolean;
  dragHandleProps?: Record<string, unknown>;
  variant?: "default" | "palette" | "condition";
}

const BlockComponent: React.FC<BlockComponentProps> = ({
  label,
  type,
  onClick,
  isSelected = false,
  showTrash = false,
  onDelete,
  parameterCount,
  isNegated = false,
  dynamicTitle,
  variableName,
  hasRandomChance = false,
  isDraggable = false,
  dragHandleProps,
  variant = "default",
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case "trigger":
        return {
          borderColor: "border-l-trigger",
          backgroundColor: "bg-black",
          icon: <BoltIcon className="h-6 w-6 text-trigger -mt-4 -ml-1" />,
          typeLabel: "Trigger",
          selectColor: "border-trigger",
          hoverColor: "hover:border-trigger-dark",
        };
      case "condition":
        return {
          borderColor: "border-l-condition",
          backgroundColor: "bg-black",
          icon: <BeakerIcon className="h-6 w-6 text-condition -mt-4 -ml-1" />,
          typeLabel: "Condition",
          selectColor: "border-condition",
          hoverColor: "hover:border-condition-dark",
        };
      case "effect":
        return {
          borderColor: "border-l-effect",
          backgroundColor: "bg-black",
          icon: <PuzzlePieceIcon className="h-6 w-6 text-effect -mt-4 -ml-1" />,
          typeLabel: "Effect",
          selectColor: "border-effect",
          hoverColor: "hover:border-effect-dark",
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "palette":
        return "w-full";
      case "condition":
        return "w-62";
      case "default":
      default:
        return "w-71";
    }
  };

  const config = getTypeConfig();
  const displayTitle = dynamicTitle || label;

  const [hasOverflow, setHasOverflow] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const CheckOverflow = () => {
      if (textRef.current && containerRef.current) {
        const overflowAmount =
          textRef.current.scrollWidth - containerRef.current.clientWidth;
        setHasOverflow(overflowAmount > 10);
      } else {
        setHasOverflow(false);
      }
    };

    const timer = setTimeout(CheckOverflow, 100);
    window.addEventListener("resize", CheckOverflow);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", CheckOverflow);
    };
  }, [displayTitle, variant]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e);
  };

  return (
    <div
      className={`
        relative ${config.backgroundColor} ${
        config.borderColor
      } border-l-4 border-2 
        ${isSelected ? config.selectColor : "border-black-light"} 
        rounded-lg cursor-pointer transition-all ${config.hoverColor} p-3 pt-6
        ${getVariantStyles()}
        ${
          isDraggable
            ? "cursor-grab active:cursor-grabbing hover:shadow-lg"
            : ""
        }
      `}
      onClick={handleClick}
      style={{ pointerEvents: "auto" }}
      {...(isDraggable ? dragHandleProps : {})}
    >
      <div className="absolute top-2 left-11 text-white-darker text-xs font-medium tracking-wider">
        {config.typeLabel}
      </div>

      <div className="absolute top-[2px] right-6 flex items-center gap-2">
        {variableName && (
          <span className="bg-mint/20 text-mint text-xs px-2 py-1 rounded font-medium">
            ${variableName}
          </span>
        )}
        {parameterCount !== undefined && parameterCount > 0 && (
          <span className="text-white-darker text-xs font-medium">
            {parameterCount} Parameter{parameterCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {showTrash && onDelete && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-redshadow">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-full h-full flex items-center rounded justify-center transition-colors hover:bg-balatro-redshadow/50 active:bg-balatro-blackshadow cursor-pointer"
          >
            <TrashIcon className="h-5 w-5 text-balatro-red transition-colors" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">{config.icon}</div>
            {isNegated && (
              <div className="flex-shrink-0 -mr-2">
                <NoSymbolIcon className="h-4 w-4 text-balatro-red" />
              </div>
            )}
            {hasRandomChance && (
              <div className="flex-shrink-0 -mr-2">
                <PercentBadgeIcon className="h-4 w-4 text-mint" />
              </div>
            )}
          </div>
          <div ref={containerRef} className="flex-grow min-w-0 overflow-hidden">
            <motion.div
              ref={textRef}
              className="text-white text-sm tracking-wide whitespace-nowrap"
              animate={{
                x:
                  hasOverflow && textRef.current && containerRef.current
                    ? [
                        0,
                        -(
                          textRef.current.scrollWidth -
                          containerRef.current.clientWidth
                        ),
                      ]
                    : 0,
              }}
              transition={
                hasOverflow
                  ? {
                      x: {
                        repeat: Infinity,
                        repeatType: "mirror",
                        duration: (textRef.current?.scrollWidth || 0) / 75,
                        ease: "linear",
                        delay: 1.5,
                        repeatDelay: 1.5,
                      },
                    }
                  : { duration: 0 }
              }
            >
              {isNegated ? `NOT ${displayTitle}` : displayTitle}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockComponent;
