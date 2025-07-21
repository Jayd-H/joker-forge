import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  FolderIcon,
  HeartIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  CodeBracketIcon,
  LinkIcon,
  CakeIcon,
} from "@heroicons/react/24/solid";
import { JokerData } from "./JokerCard";

interface SidebarProps {
  selectedSection?: string;
  onSectionChange?: (section: string) => void;
  projectName?: string;
  onExport?: () => Promise<void>;
  onExportJSON?: () => void;
  onImportJSON?: () => Promise<void>;
  exportLoading?: boolean;
  jokers?: JokerData[];
  modName?: string;
  authorName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedSection = "overview",
  onSectionChange,
  projectName = "mycustommod",
  onExport,
  onExportJSON,
  onImportJSON,
  exportLoading = false,
}) => {
  const isExpanded =
    selectedSection === "overview" ||
    selectedSection === "" ||
    !selectedSection;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleSectionClick = (section: string) => {
    if (section === "github") {
      window.open("https://github.com/Jayd-H/joker-forge", "_blank");
      return;
    }

    if (section === "docs") {
      window.open("https://github.com/Jayd-H/joker-forge/wiki", "_blank");
      return;
    }

    onSectionChange?.(section);
  };

  const handleExport = async () => {
    if (onExport) {
      await onExport();
    }
  };

  const handleExportJSON = () => {
    if (onExportJSON) {
      onExportJSON();
    }
  };

  const handleImportJSON = async () => {
    if (onImportJSON) {
      await onImportJSON();
    }
  };

  const navigationItems = [
    { id: "overview", label: "Overview", icon: HomeIcon },
    { id: "metadata", label: "Mod Metadata", icon: DocumentTextIcon },
    { id: "jokers", label: "Jokers", icon: PuzzlePieceIcon },
    { id: "consumables", label: "Consumables", icon: CakeIcon },
    //{ id: "decks", label: "Decks", icon: RectangleStackIcon },
    //{ id: "editions", label: "Editions", icon: SparklesIcon },
  ];

  const resourceItems = [
    { id: "docs", label: "Docs", icon: DocumentTextIcon },
    { id: "vanilla", label: "Vanilla Reforged", icon: FolderIcon },
    { id: "github", label: "GitHub Repository", icon: LinkIcon },
    { id: "acknowledgements", label: "Acknowledgements", icon: HeartIcon },
  ];

  const actionItems = [
    {
      id: "import",
      label: "Import Mod",
      icon: ArrowDownTrayIcon,
      onClick: handleImportJSON,
      disabled: false,
    },
    {
      id: "save",
      label: "Save Mod",
      icon: BookmarkIcon,
      onClick: handleExportJSON,
      disabled: false,
    },
    {
      id: "export",
      label: exportLoading ? "Exporting..." : "Export Mod",
      icon: ArrowUpTrayIcon,
      onClick: handleExport,
      disabled: exportLoading,
    },
  ];

  if (isExpanded) {
    return (
      <motion.div
        key="expanded"
        initial={{ width: 80 }}
        animate={{ width: 320 }}
        exit={{ width: 80 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40,
          mass: 1,
        }}
        className="w-80 rounded-xl m-4 flex flex-col font-lexend"
      >
        <div className="p-6">
          <div className="flex gap-3 justify-center -ml-6">
            <div className="w-6 h-6 rounded-lg flex items-center my-auto justify-center">
              <CodeBracketIcon className="h-5 w-5 text-white" />
            </div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white font-light tracking-widest"
            >
              Joker Forge
            </motion.h1>
          </div>
        </div>

        <div className="border-b -mt-1 mb-2 border-black-light"></div>

        <div className="flex-1 flex flex-col">
          <nav className="flex-1 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-between py-3"
            >
              <div className="text-xs text-white-darker tracking-wider uppercase">
                Project
              </div>
              <div className="text-xs text-white-dark tracking-widest">
                {projectName}
              </div>
            </motion.div>

            <div className="space-y-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = selectedSection === item.id;

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => handleSectionClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-mint-light text-black-dark font-medium"
                        : "text-white-light hover:bg-black-light hover:text-white-lighter"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm tracking-wide">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-white-darker mb-3 tracking-wider uppercase"
              >
                Resources
              </motion.div>
              <div className="space-y-1">
                {resourceItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = selectedSection === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + 0.05 * index }}
                      onClick={() => handleSectionClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isActive
                          ? "bg-mint-light text-black-dark font-medium"
                          : "text-white-dark hover:text-white-light hover:bg-black-light"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm tracking-wide">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 border-t border-black-light space-y-3"
          >
            <button
              onClick={handleImportJSON}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black-darker border-2 border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors cursor-pointer"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span className="text-sm font-medium tracking-wide">
                Import Mod{" "}
              </span>
              <span className="text-xs">(JSON)</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black-darker border-2 border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors cursor-pointer"
            >
              <BookmarkIcon className="h-4 w-4" />
              <span className="text-sm font-medium tracking-wide">
                Save Mod
              </span>
              <span className="text-xs">(JSON)</span>
            </button>

            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black-darker border-2 border-mint-dark rounded-lg text-mint-light hover:text-black-dark font-medium hover:bg-mint hover:border-mint-darker transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              <span className="text-sm tracking-wide">
                {exportLoading ? "Exporting..." : "Export Mod Files"}
              </span>
            </button>

            <div className="text-center mt-4">
              <span className="text-xs text-mint font-medium tracking-widest">
                v0.2.5
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="collapsed"
      initial={{ width: 320 }}
      animate={{ width: 80 }}
      exit={{ width: 320 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 1,
      }}
      className="w-20 rounded-xl m-4 flex flex-col font-lexend relative"
    >
      <div className="p-4 flex justify-center">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center">
          <CodeBracketIcon className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <nav className="flex-1 px-3">
          <div className="space-y-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = selectedSection === item.id;
              const isHovered = hoveredItem === item.id;

              return (
                <div key={item.id} className="relative">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => handleSectionClick(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`w-full flex items-center justify-center px-3 py-3 rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? "bg-mint-light text-black-dark font-medium"
                        : "text-white-light hover:bg-black-light hover:text-white-lighter"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.button>

                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.9 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 z-50"
                      >
                        <div className="bg-black-dark border border-black-lighter rounded-lg px-3 py-2 shadow-lg">
                          <span className="text-sm text-white-light tracking-wide whitespace-nowrap">
                            {item.label}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <div className="space-y-1">
              {resourceItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = selectedSection === item.id;
                const isHovered = hoveredItem === item.id;

                return (
                  <div key={item.id} className="relative">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + 0.05 * index }}
                      onClick={() => handleSectionClick(item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`w-full flex items-center justify-center px-3 py-3 rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? "bg-mint-light text-black-dark font-medium"
                          : "text-white-dark hover:text-white-light hover:bg-black-light"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.button>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, x: -10, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -10, scale: 0.9 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 z-50"
                        >
                          <div className="bg-black-dark border border-black-lighter rounded-lg px-3 py-2 shadow-lg">
                            <span className="text-sm text-white-light tracking-wide whitespace-nowrap">
                              {item.label}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="px-3 pb-4 border-t border-black-light pt-4 mt-4">
          <div className="space-y-2">
            {actionItems.map((item, index) => {
              const Icon = item.icon;
              const isHovered = hoveredItem === item.id;

              return (
                <div key={item.id} className="relative">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + 0.05 * index }}
                    onClick={item.onClick}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-center px-3 py-3 rounded-lg transition-colors cursor-pointer ${
                      item.disabled
                        ? "text-white-darker opacity-50 cursor-not-allowed"
                        : item.id === "export"
                        ? "text-mint-light hover:bg-mint-dark hover:text-black-darker"
                        : "text-white-light hover:bg-black-light hover:text-white-lighter"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.button>

                  <AnimatePresence>
                    {isHovered && !item.disabled && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.9 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 z-50"
                      >
                        <div className="bg-black-dark border border-black-lighter rounded-lg px-3 py-2 shadow-lg">
                          <span className="text-sm text-white-light tracking-wide whitespace-nowrap">
                            {item.label}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-4"
          >
            <span className="text-xs text-mint font-medium tracking-widest">
              v0.2.5
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
