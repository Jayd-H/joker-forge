import React from "react";

export interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  className = "",
  labelClassName = "",
  disabled = false,
  size = "md",
}) => {

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

  return (
    <div className={`flex items-center select-none ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={`mr-2 h-5 w-5 rounded border-black-lighter accent-mint ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      />
      <span className={`text-white-light ${sizeClasses[size].text}`}>
        <label
          htmlFor={id}
          className={`text-white ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${labelClassName}`}
        >
          {label}
        </label>
      </span>
    </div>
    
  );
};

export default Checkbox;
