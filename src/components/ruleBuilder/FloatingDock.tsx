import React from "react";
import {
  SwatchIcon,
  CommandLineIcon,
  ChartPieIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

interface PanelState {
  id: string;
  isVisible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface FloatingDockProps {
  panels: Record<string, PanelState>;
  onTogglePanel: (panelId: string) => void;
  itemType: "joker" | "consumable" | "card" | "voucher";
}

const FloatingDock: React.FC<FloatingDockProps> = ({
  panels,
  onTogglePanel,
  itemType,
}) => {
  const allDockItems = [
    {
      id: "blockPalette",
      icon: SwatchIcon,
      label: "Block Palette",
      shortcut: "B",
    },
    {
      id: "variables",
      icon: CommandLineIcon,
      label: "Variables",
      shortcut: "V",
    },
    {
      id: "gameVariables",
      icon: CubeIcon,
      label: "Game Variables",
      shortcut: "G",
    },
    {
      id: "inspector",
      icon: ChartPieIcon,
      label: "Inspector",
      shortcut: "P",
    },
  ];

  const dockItems = allDockItems.filter((item) => {
    if (item.id === "variables" && itemType === "consumable") {
      return false;
    }
    return true;
  });

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black-dark/90 backdrop-blur-md border-2 border-black-lighter rounded-full px-3 py-2 shadow-2xl">
        <div className="flex items-center gap-2">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const isActive = panels[item.id]?.isVisible;

            return (
              <button
                key={item.id}
                onClick={() => onTogglePanel(item.id)}
                className={`
                  relative group p-3 rounded-full transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-mint/20 border-2 border-mint text-mint scale-110"
                      : "bg-black-darker/50 border-2 border-black-lighter text-white-darker hover:border-mint hover:text-mint hover:scale-105"
                  }
                `}
                title={`${item.label} (${item.shortcut})`}
              >
                <Icon className="h-5 w-5" />

                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black-darker border border-black-lighter rounded-lg px-2 py-1 whitespace-nowrap">
                    <span className="text-white-light text-xs font-medium">
                      {item.label}
                    </span>
                    <div className="text-white-darker text-xs">
                      Press {item.shortcut}
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black-lighter"></div>
                </div>

                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-mint rounded-full border-2 border-black-dark"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FloatingDock;
