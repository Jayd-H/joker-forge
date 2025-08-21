import React, { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import {
  KeyIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  PuzzlePieceIcon,
  CakeIcon,
  StarIcon,
  CpuChipIcon,
  TagIcon,
  BeakerIcon,
  BookOpenIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  JOKERS,
  TAROT_CARDS,
  PLANET_CARDS,
  SPECTRAL_CARDS,
  ENHANCEMENTS,
  SEALS,
  EDITIONS,
  BOSS_BLINDS,
  TAGS,
  VOUCHERS,
} from "../data/BalatroUtils";

interface KeyItemProps {
  itemKey: string;
  label: string;
  onCopy: (key: string) => void;
  copiedKey: string | null;
}

const KeyItem: React.FC<KeyItemProps> = ({
  itemKey,
  label,
  onCopy,
  copiedKey,
}) => {
  const isCopied = copiedKey === itemKey;

  return (
    <div
      onClick={() => onCopy(itemKey)}
      className="flex items-center justify-between p-3 border border-black-lighter rounded-lg hover:border-mint/50 transition-all cursor-pointer group hover:bg-gradient-to-r hover:from-black-darker hover:to-mint/5"
    >
      <div className="flex-1 min-w-0">
        <div className="text-white-light font-medium text-sm mb-1 group-hover:text-mint transition-colors">
          {label}
        </div>
        <div className="text-white-darker text-xs font-mono">{itemKey}</div>
      </div>
      <div className="flex-shrink-0 ml-3">
        {isCopied ? (
          <div className="flex items-center gap-2 text-mint text-sm">
            <CheckIcon className="h-4 w-4" />
            <span>Copied!</span>
          </div>
        ) : (
          <DocumentDuplicateIcon className="h-4 w-4 text-white-darker group-hover:text-mint transition-colors" />
        )}
      </div>
    </div>
  );
};

interface KeySectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ReadonlyArray<{ key: string; label: string }>;
  searchTerm: string;
  onCopy: (key: string) => void;
  copiedKey: string | null;
  color?: string;
}

const KeySection: React.FC<KeySectionProps> = ({
  title,
  icon: Icon,
  items,
  searchTerm,
  onCopy,
  copiedKey,
  color = "text-mint",
}) => {
  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredItems.length === 0 && searchTerm) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`h-6 w-6 ${color}`} />
        <h2 className="text-xl text-white-light font-medium">{title}</h2>
        <span className="text-white-darker text-sm">
          ({filteredItems.length} items)
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map((item) => (
          <KeyItem
            key={item.key}
            itemKey={item.key}
            label={item.label}
            onCopy={onCopy}
            copiedKey={copiedKey}
          />
        ))}
      </div>
    </div>
  );
};

const SECTIONS = {
  jokers: {
    title: "Jokers",
    icon: PuzzlePieceIcon,
    items: JOKERS,
    color: "text-balatro-purple",
  },
  consumables: {
    title: "Consumables",
    icon: CakeIcon,
    items: [...TAROT_CARDS, ...PLANET_CARDS, ...SPECTRAL_CARDS],
    color: "text-mint",
  },
  enhancements: {
    title: "Enhancements",
    icon: StarIcon,
    items: ENHANCEMENTS(),
    color: "text-balatro-enhanced-new",
  },
  seals: {
    title: "Seals",
    icon: CpuChipIcon,
    items: SEALS(),
    color: "text-balatro-blue",
  },
  editions: {
    title: "Editions",
    icon: SparklesIcon,
    items: EDITIONS.map((edition) => ({
      key: edition.key,
      label: edition.label,
    })),
    color: "text-balatro-enhanced",
  },
  boss_blinds: {
    title: "Boss Blinds",
    icon: BeakerIcon,
    items: BOSS_BLINDS.map((blind) => ({
      key: blind.value,
      label: blind.label,
    })),
    color: "text-balatro-red",
  },
  tags: {
    title: "Tags",
    icon: TagIcon,
    items: TAGS.map((tag) => ({ key: tag.value, label: tag.label })),
    color: "text-balatro-orange",
  },
  vouchers: {
    title: "Vouchers",
    icon: BookOpenIcon,
    items: VOUCHERS().map((voucher) => ({
      key: voucher.value,
      label: voucher.label,
    })),
    color: "text-balatro-green",
  },
};

const KeysPage: React.FC = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // If no section is specified, show overview
  if (!section) {
    return (
      <div className="min-h-screen">
        <div className="p-8 font-lexend max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl text-white-light tracking-widest mb-2">
              Balatro Keys Reference
            </h1>
            <p className="text-white-darker text-lg">
              Browse and copy game keys for your mods
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(SECTIONS).map(([key, sectionData]) => {
              const Icon = sectionData.icon;
              return (
                <button
                  key={key}
                  onClick={() => navigate(`/keys/${key}`)}
                  className="group flex items-center gap-4 p-6 border border-black-lighter hover:border-mint/50 rounded-xl transition-all cursor-pointer hover:bg-gradient-to-r hover:from-black-darker hover:to-mint/5"
                >
                  <div
                    className={`p-3 bg-mint/20 rounded-xl group-hover:bg-mint/30 transition-all group-hover:scale-110`}
                  >
                    <Icon className={`h-6 w-6 ${sectionData.color}`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white-light font-semibold text-lg mb-1 group-hover:text-mint transition-colors">
                      {sectionData.title}
                    </div>
                    <div className="text-white-darker text-sm">
                      {sectionData.items.length} keys
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // If section doesn't exist, redirect to overview
  if (!SECTIONS[section as keyof typeof SECTIONS]) {
    return <Navigate to="/keys" replace />;
  }

  const currentSection = SECTIONS[section as keyof typeof SECTIONS];

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/keys")}
            className="text-white-darker hover:text-mint transition-colors cursor-pointer"
          >
            <KeyIcon className="h-6 w-6" />
          </button>
          <div className="text-white-darker">/</div>
          <div className="flex items-center gap-2">
            <currentSection.icon
              className={`h-6 w-6 ${currentSection.color}`}
            />
            <h1 className="text-2xl text-white-light tracking-widest">
              {currentSection.title}
            </h1>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative group max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white-darker group-focus-within:text-mint transition-colors" />
            <input
              type="text"
              placeholder={`Search ${currentSection.title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black-darker border-2 border-black-lighter rounded-lg pl-12 pr-4 py-3 text-white-light tracking-wider placeholder-white-darker focus:outline-none focus:border-mint transition-all duration-200"
            />
          </div>
        </div>

        <KeySection
          title={currentSection.title}
          icon={currentSection.icon}
          items={currentSection.items}
          searchTerm={searchTerm}
          onCopy={handleCopy}
          copiedKey={copiedKey}
          color={currentSection.color}
        />
      </div>
    </div>
  );
};

export default KeysPage;
