import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface DropdownOption {
  value: string;
  label: string;
  type: string;
}

interface InputDropdownProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  useGameFont?: boolean;
  separator?: boolean;
  className?: string;
  placeholder?: string;
  value: string;
  onChange: (item: {value: string, type: string}) => void;
  options: DropdownOption[];
  size?: "sm" | "md" | "lg";
  labelPosition?: "left" | "center" | "right";
}

const InputDropdown: React.FC<InputDropdownProps> = ({
  label,
  icon,
  error,
  useGameFont = false,
  separator = false,
  className = "",
  placeholder = "Select an option",
  value,
  onChange,
  options,
  size = "md",
  labelPosition = "center",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

useEffect(() => {
  if (isOpen && buttonRef.current && dropdownRef.current) {
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    let topPosition = buttonRect.bottom + 4;

    if (spaceBelow < dropdownRect.height && spaceAbove > dropdownRect.height) {
      topPosition = buttonRect.top - dropdownRect.height - 4;
    }
    setDropdownPosition({
      top: topPosition,
      left: buttonRect.left,
      width: buttonRect.width,
    });
  } 
}, [isOpen]);

  const renderIcon = () => {
    if (icon) {
      return icon;
    }
    const iconSizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };
    return (
      <ChevronDownIcon
        className={`${
          iconSizeClasses[size]
        } text-mint stroke-2 transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    );
  };

  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const getSeparatorColor = () => {
    if (error) return "bg-balatro-red";
    if (isFocused || isOpen) return "bg-mint";
    return "bg-black-lighter";
  };

  const sizeClasses = {
    sm: {
      padding: "px-2 py-1",
      text: "text-sm",
      iconPadding: "left-2",
      separatorPadding: "left-8",
      contentPadding: "pl-10",
    },
    md: {
      padding: "px-3 py-2",
      text: "text-base",
      iconPadding: "left-3",
      separatorPadding: "left-11",
      contentPadding: "pl-14",
    },
    lg: {
      padding: "px-3 py-2",
      text: "text-xl",
      iconPadding: "left-3",
      separatorPadding: "left-11",
      contentPadding: "pl-14",
    },
  };

  const getLabelPositionClass = () => {
    switch (labelPosition) {
      case "left":
        return "justify-start pl-2";
      case "right":
        return "justify-end pr-2";
      default:
        return "justify-center";
    }
  };

  return (
    <div className="flex flex-col w-full select-none">
      {label && (
        <div className={`flex ${getLabelPositionClass()}`}>
          <div className="bg-black border-2 border-black-light rounded-md px-4 pb-2 -mb-2 relative">
            <span className={`text-white-light ${sizeClasses[size].text}`}>
              {label}
            </span>
          </div>
        </div>
      )}

      <div className="relative">
        <div
          ref={buttonRef}
          className={`
            relative flex items-center bg-black-dark text-white-light ${
              sizeClasses[size].padding
            }
            ${
              useGameFont ? "font-game" : "font-lexend"
            } tracking-wide font-light ${sizeClasses[size].text}
            focus:outline-none rounded-lg cursor-pointer
            border-2 ${
              error
                ? "border-balatro-red"
                : isOpen
                ? "border-mint"
                : "border-black-lighter"
            } 
            hover:border-mint transition-colors w-full
            ${className}
          `}
          onClick={() => {
            setIsOpen(!isOpen);
            setIsFocused(!isFocused);
          }}
        >
          <div
            className={`absolute ${sizeClasses[size].iconPadding} flex items-center justify-center z-10`}
          >
            {renderIcon()}
          </div>

          {separator && (
            <div
              className={`
                absolute ${sizeClasses[size].separatorPadding} h-[60%] w-px 
                ${getSeparatorColor()}
                transition-colors
              `}
            />
          )}

          <div
            className={`w-full truncate ${
              separator ? sizeClasses[size].contentPadding : "pl-10"
            }`}
          >
            {displayText}
          </div>
        </div>

        {isOpen &&
          ReactDOM.createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                zIndex: 9999,
              }}
              className="bg-black-dark border-2 border-black-lighter rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`
                  ${sizeClasses[size].padding} cursor-pointer 
                  ${
                    useGameFont ? "font-game" : "font-lexend"
                  } text-white-light ${sizeClasses[size].text}
                  ${
                    value === option.value
                      ? "bg-mint-dark"
                      : "hover:bg-black-lighter"
                  }
                  ${value === option.value ? "font-medium" : "font-light"}
                `}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({value: option.value, type: option.type});
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>,
            document.body
          )}
      </div>

      {error && <p className="text-balatro-red text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputDropdown;
