import React from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  RectangleStackIcon,
  SparklesIcon,
  FolderIcon,
  HeartIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  CodeBracketIcon,
  CakeIcon,
  LightBulbIcon,
  LinkIcon,
} from "@heroicons/react/24/solid";
import { JokerData } from "./JokerCard";
import { VersionInfo } from "../App";

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
  version?: string;
  versionInfo?: VersionInfo | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedSection = "overview",
  onSectionChange,
  projectName = "mycustommod",
  onExport,
  onExportJSON,
  onImportJSON,
  exportLoading = false,
  jokers = [],
  version = "0.1.0",
  versionInfo,
}) => {
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

  const formatBuildInfo = () => {
    if (!versionInfo) return null;

    const buildDate = new Date(versionInfo.metadata.buildDate);
    const isToday = buildDate.toDateString() === new Date().toDateString();

    return {
      buildNumber: versionInfo.buildNumber,
      shortSha: versionInfo.commitSha.substring(0, 7),
      timeAgo: isToday ? "today" : buildDate.toLocaleDateString(),
      fullSha: versionInfo.commitSha,
    };
  };

  const buildInfo = formatBuildInfo();

  const navigationItems = [
    { id: "overview", label: "Overview", icon: HomeIcon },
    { id: "metadata", label: "Mod Metadata", icon: DocumentTextIcon },
    { id: "jokers", label: "Jokers", icon: PuzzlePieceIcon },
    { id: "consumables", label: "Consumables", icon: CakeIcon },
    { id: "decks", label: "Decks", icon: RectangleStackIcon },
    { id: "editions", label: "Editions", icon: SparklesIcon },
    { id: "enhancements", label: "Enhancements", icon: LightBulbIcon },
  ];

  const resourceItems = [
    { id: "docs", label: "Docs", icon: DocumentTextIcon },
    { id: "vanilla", label: "Vanilla Remade", icon: FolderIcon },
    { id: "credit", label: "Extra Credit", icon: FolderIcon },
    { id: "github", label: "GitHub Repository", icon: LinkIcon },
    { id: "acknowledgements", label: "Acknowledgements", icon: HeartIcon },
  ];

  return (
    <div className="w-80 bg-black-dark rounded-xl m-4 border-2 border-black-light flex flex-col font-lexend">
      <div className="p-6 border-black-light">
        <div className="flex gap-3 justify-center -ml-6">
          <div className="w-6 h-6 rounded-lg flex items-center my-auto justify-center">
            <CodeBracketIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-white font-light tracking-widest">Joker Forge</h1>
        </div>
      </div>

      <div className="border-b -mt-1 mb-2 border-black-light"> </div>

      <div className="flex-1 flex flex-col">
        <nav className="flex-1 px-4">
          <div className="flex justify-between py-3">
            <div className="text-xs text-white-darker tracking-wider uppercase">
              Project
            </div>
            <div className="text-xs text-white-dark tracking-widest">
              {projectName}
            </div>
          </div>
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-mint-light text-black-dark font-medium"
                      : "text-white-light hover:bg-black-light hover:text-white-lighter"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="text-xs text-white-darker mb-3 tracking-wider uppercase ">
              Resources
            </div>
            <div className="space-y-1">
              {resourceItems.map((item) => {
                const Icon = item.icon;
                const isActive = selectedSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-mint-light text-black-dark font-medium"
                        : "text-white-dark hover:text-white-light hover:bg-black-light"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm tracking-wide">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-black-light space-y-3">
          <button
            onClick={handleImportJSON}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black-darker border-2 border-black-lighter rounded-lg text-white-light hover:border-mint hover:text-mint transition-colors cursor-pointer "
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
            <span className="text-sm font-medium tracking-wide">Save Mod</span>
            <span className="text-xs">(JSON)</span>
          </button>

          <button
            onClick={handleExport}
            disabled={exportLoading || jokers.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black-darker border-2 border-mint-dark rounded-lg text-mint-light hover:text-black-dark font-medium hover:bg-mint hover:border-mint-darker transition-colors cursor-pointer"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            <span className="text-sm tracking-wide">
              {exportLoading ? "Exporting..." : "Export Mod Files"}
            </span>
          </button>

          <div className="text-center mt-4 space-y-1">
            <div className="text-xs text-mint font-medium tracking-widest">
              v{version}
            </div>
            {buildInfo && (
              <div className="text-xs text-white-darker space-y-0.5">
                <div>Build #{buildInfo.buildNumber}</div>
                <div
                  title={`Commit: ${buildInfo.fullSha}`}
                  className="font-mono cursor-help"
                >
                  {buildInfo.shortSha} • {buildInfo.timeAgo}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
