import React, { useState, useMemo, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { PuzzlePieceIcon } from "@heroicons/react/24/solid";
import { BeakerIcon } from "@heroicons/react/24/solid";
import { JokerData } from "../JokerCard";
import { formatBalatroText } from "../generic/balatroTextFormatter";
import RuleBuilder from "../ruleBuilder/RuleBuilder";

interface ExtraCreditPageProps {
  onDuplicateToProject?: (joker: JokerData) => void;
  onNavigateToJokers?: () => void;
}

type SortOption = {
  value: string;
  label: string;
  sortFn: (a: JokerData, b: JokerData) => number;
};

const ExtraCreditPage: React.FC<ExtraCreditPageProps> = ({
  onDuplicateToProject,
  onNavigateToJokers,
}) => {
  const [extraCreditJokers, setExtraCreditJokers] = useState<JokerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentJokerForRules, setCurrentJokerForRules] =
    useState<JokerData | null>(null);
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [filtersMenuPosition, setFiltersMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const sortButtonRef = React.useRef<HTMLButtonElement>(null);
  const filtersButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);
  const filtersMenuRef = React.useRef<HTMLDivElement>(null);

  const sortOptions: SortOption[] = useMemo(
    () => [
      {
        value: "name-asc",
        label: "Name (A-Z)",
        sortFn: (a, b) => a.name.localeCompare(b.name),
      },
      {
        value: "name-desc",
        label: "Name (Z-A)",
        sortFn: (a, b) => b.name.localeCompare(a.name),
      },
      {
        value: "rarity-asc",
        label: "Rarity (Low to High)",
        sortFn: (a, b) => a.rarity - b.rarity,
      },
      {
        value: "rarity-desc",
        label: "Rarity (High to Low)",
        sortFn: (a, b) => b.rarity - a.rarity,
      },
      {
        value: "cost-asc",
        label: "Cost (Low to High)",
        sortFn: (a, b) => (a.cost || 0) - (b.cost || 0),
      },
      {
        value: "cost-desc",
        label: "Cost (High to Low)",
        sortFn: (a, b) => (b.cost || 0) - (a.cost || 0),
      },
    ],
    []
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortButtonRef.current &&
        !sortButtonRef.current.contains(event.target as Node) &&
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node)
      ) {
        setShowSortMenu(false);
      }
      if (
        filtersButtonRef.current &&
        !filtersButtonRef.current.contains(event.target as Node) &&
        filtersMenuRef.current &&
        !filtersMenuRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showSortMenu && sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setSortMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 224,
        width: 224,
      });
    }
  }, [showSortMenu]);

  useEffect(() => {
    if (showFilters && filtersButtonRef.current) {
      const rect = filtersButtonRef.current.getBoundingClientRect();
      setFiltersMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 256,
        width: 256,
      });
    }
  }, [showFilters]);

  useEffect(() => {
    const fetchExtraCreditJokers = async () => {
      try {
        const response = await fetch("/extracredit.json");
        if (!response.ok) {
          throw new Error("Failed to fetch extra credit jokers data");
        }
        const data = await response.json();
        setExtraCreditJokers(data.jokers || []);
      } catch (error) {
        console.error("Error fetching extra credit jokers:", error);
        setExtraCreditJokers([]);
      }
    };

    fetchExtraCreditJokers();
  }, []);

  const filteredAndSortedJokers = useMemo(() => {
    const filtered = extraCreditJokers.filter((joker) => {
      const matchesSearch =
        joker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        joker.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity =
        rarityFilter === null || joker.rarity === rarityFilter;

      return matchesSearch && matchesRarity;
    });

    const currentSort = sortOptions.find((option) => option.value === sortBy);
    if (currentSort) {
      filtered.sort(currentSort.sortFn);
    }

    return filtered;
  }, [extraCreditJokers, searchTerm, rarityFilter, sortBy, sortOptions]);

  const rarityOptions = [
    { value: null, label: "All Rarities", count: extraCreditJokers.length },
    {
      value: 1,
      label: "Common",
      count: extraCreditJokers.filter((j) => j.rarity === 1).length,
    },
    {
      value: 2,
      label: "Uncommon",
      count: extraCreditJokers.filter((j) => j.rarity === 2).length,
    },
    {
      value: 3,
      label: "Rare",
      count: extraCreditJokers.filter((j) => j.rarity === 3).length,
    },
    {
      value: 4,
      label: "Legendary",
      count: extraCreditJokers.filter((j) => j.rarity === 4).length,
    },
  ];

  const handleDuplicateJoker = (joker: JokerData) => {
    if (onDuplicateToProject) {
      const duplicatedJoker: JokerData = {
        ...joker,
        id: crypto.randomUUID(),
        name: `${joker.name} Copy`,
      };
      onDuplicateToProject(duplicatedJoker);

      if (onNavigateToJokers) {
        onNavigateToJokers();
      }
    }
  };

  const handleViewRules = (joker: JokerData) => {
    if (joker.rules && joker.rules.length === 1) {
      joker.rules[0].position = { x: 500, y: 100 };
    }
    setCurrentJokerForRules(joker);
    setShowRuleBuilder(true);
  };

  const handleCloseRuleBuilder = () => {
    setShowRuleBuilder(false);
    setCurrentJokerForRules(null);
  };

  const handleSortMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showFilters) setShowFilters(false);
    setShowSortMenu(!showSortMenu);
  };

  const handleFiltersToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showSortMenu) setShowSortMenu(false);
    setShowFilters(!showFilters);
  };

  const getRarityColor = (rarity: number | null) => {
    switch (rarity) {
      case 1:
        return "text-balatro-blue";
      case 2:
        return "text-balatro-green";
      case 3:
        return "text-balatro-red";
      case 4:
        return "text-balatro-purple";
      default:
        return "text-white-light";
    }
  };

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ||
    "Name (A-Z)";

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl text-white-light font-light tracking-wide mb-3">
              Extra Credit
            </h1>
            <div className="flex items-center gap-6 text-white-darker text-sm">
              <div className="inline-flex items-center">
                <BeakerIcon className="h-4 w-4 mr-2 text-mint" />
                <span>
                  {filteredAndSortedJokers.length} of {extraCreditJokers.length}{" "}
                  jokers from the{" "}
                  <a
                    href="https://github.com/GuilloryCraft/ExtraCredit" target="_blank" rel="noopener noreferrer"
                    className="text-mint-light hover:text-mint-lighter hover:underline decoration-dashed"
                  >
                    Extra Credit
                  </a>{" "}
                  mod, some of these may still be a bit janky
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-white-light font-medium mb-1">
              Reference Collection
            </div>
            <div className="text-white-darker text-sm">
              Duplicate jokers to your project
            </div>
          </div>
        </div>

        <div className="mb-8 bg-gradient-to-r from-black-dark to-black border-2 border-black-lighter rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white-darker group-focus-within:text-mint transition-colors" />
              <input
                type="text"
                placeholder="Search extra credit jokers by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black-darker border-2 border-black-lighter rounded-xl pl-12 pr-4 py-4 text-white-light placeholder-white-darker focus:outline-none focus:border-mint focus:bg-black transition-all duration-200"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <button
                  ref={sortButtonRef}
                  onClick={handleSortMenuToggle}
                  className="flex items-center gap-2 bg-black-dark text-white-light px-4 py-4 border-2 border-black-lighter rounded-xl hover:border-mint transition-colors cursor-pointer"
                >
                  <ArrowsUpDownIcon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{currentSortLabel}</span>
                </button>
              </div>

              <div className="relative">
                <button
                  ref={filtersButtonRef}
                  onClick={handleFiltersToggle}
                  className={`flex items-center gap-2 px-4 py-4 border-2 rounded-xl transition-colors cursor-pointer ${
                    showFilters
                      ? "bg-mint-dark text-black-darker border-mint"
                      : "bg-black-dark text-white-light border-black-lighter hover:border-mint"
                  }`}
                >
                  <FunnelIcon className="h-4 w-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>

          {(searchTerm || rarityFilter !== null) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <div className="flex items-center gap-2 bg-mint/15 border border-mint/40 rounded-lg px-3 py-1.5 text-sm backdrop-blur-sm">
                  <span className="text-mint">Search: "{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-mint hover:text-mint-light font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}
              {rarityFilter !== null && (
                <div className="flex items-center gap-2 bg-mint/15 border border-mint/40 rounded-lg px-3 py-1.5 text-sm backdrop-blur-sm">
                  <span className="text-mint">
                    Rarity:{" "}
                    {rarityOptions.find((r) => r.value === rarityFilter)?.label}
                  </span>
                  <button
                    onClick={() => setRarityFilter(null)}
                    className="text-mint hover:text-mint-light font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {filteredAndSortedJokers.length === 0 &&
        extraCreditJokers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="bg-gradient-to-br from-black-dark to-black border-2 border-black-lighter rounded-2xl p-8 max-w-md shadow-lg">
              <BeakerIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Extra Credit Jokers Available
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                The extra credit joker collection is currently being built.
                Check back later for community-created jokers!
              </p>
            </div>
          </div>
        ) : filteredAndSortedJokers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="bg-gradient-to-br from-black-dark to-black border-2 border-black-lighter rounded-2xl p-8 max-w-md shadow-lg">
              <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Jokers Found
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                No extra credit jokers match your current search and filter
                criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRarityFilter(null);
                }}
                className="w-full bg-black-dark text-white-light border-2 border-black-lighter rounded-lg px-4 py-2 hover:border-mint transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {filteredAndSortedJokers.map((joker) => (
              <div key={joker.id} className="relative">
                <ExtraCreditJokerCard
                  joker={joker}
                  onDuplicate={() => handleDuplicateJoker(joker)}
                  onViewRules={() => handleViewRules(joker)}
                />
              </div>
            ))}
          </div>
        )}

        {showRuleBuilder && currentJokerForRules && (
          <RuleBuilder
            isOpen={showRuleBuilder}
            onClose={handleCloseRuleBuilder}
            onSave={() => {}}
            existingRules={currentJokerForRules.rules || []}
            joker={currentJokerForRules}
            onUpdateJoker={() => {}}
          />
        )}
      </div>

      {showSortMenu &&
        ReactDOM.createPortal(
          <div
            ref={sortMenuRef}
            className="fixed bg-black-darker border-2 border-black-lighter rounded-xl shadow-xl overflow-hidden"
            style={{
              top: `${sortMenuPosition.top}px`,
              left: `${sortMenuPosition.left}px`,
              width: `${sortMenuPosition.width}px`,
              zIndex: 99999,
            }}
          >
            <div className="p-2">
              <h3 className="text-white-light font-medium text-sm mb-2 px-3 py-1">
                Sort By
              </h3>
              <div className="space-y-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      sortBy === option.value
                        ? "bg-mint/20 border border-mint text-mint"
                        : "hover:bg-black-lighter text-white-darker hover:text-white-light"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      {showFilters &&
        ReactDOM.createPortal(
          <div
            ref={filtersMenuRef}
            className="fixed bg-black-darker border-2 border-black-lighter rounded-xl shadow-xl overflow-hidden"
            style={{
              top: `${filtersMenuPosition.top}px`,
              left: `${filtersMenuPosition.left}px`,
              width: `${filtersMenuPosition.width}px`,
              zIndex: 99999,
            }}
          >
            <div className="p-3 border-b border-black-lighter">
              <h3 className="text-white-light font-medium text-sm mb-3">
                Filter by Rarity
              </h3>
              <div className="space-y-1">
                {rarityOptions.map((option) => (
                  <button
                    key={option.value || "all"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRarityFilter(option.value);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      rarityFilter === option.value
                        ? "bg-mint/20 border border-mint text-mint"
                        : "hover:bg-black-lighter"
                    }`}
                  >
                    <span className={getRarityColor(option.value)}>
                      {option.label}
                    </span>
                    <span className="text-white-darker ml-1">
                      ({option.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {(searchTerm || rarityFilter !== null) && (
              <div className="p-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                    setRarityFilter(null);
                    setShowFilters(false);
                  }}
                  className="w-full bg-black-dark text-white-light border border-black-lighter rounded-lg px-3 py-2 hover:border-mint transition-colors text-sm cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

interface ExtraCreditJokerCardProps {
  joker: JokerData;
  onDuplicate: () => void;
  onViewRules: () => void;
}

const ExtraCreditJokerCard: React.FC<ExtraCreditJokerCardProps> = ({
  joker,
  onDuplicate,
  onViewRules,
}) => {
  const safeRarity =
    typeof joker.rarity === "number" && joker.rarity >= 1 && joker.rarity <= 4
      ? joker.rarity
      : 1;

  const getRarityText = (rarity: number): string => {
    const rarityMap: Record<number, string> = {
      1: "Common",
      2: "Uncommon",
      3: "Rare",
      4: "Legendary",
    };
    return rarityMap[rarity] || "Common";
  };

  const getRarityStyles = (rarity: number) => {
    const styleMap: Record<
      number,
      { text: string; bg: string; border: string }
    > = {
      1: {
        text: "text-balatro-blue",
        bg: "bg-black",
        border: "border-balatro-blue",
      },
      2: {
        text: "text-balatro-green",
        bg: "bg-black",
        border: "border-balatro-green",
      },
      3: {
        text: "text-balatro-red",
        bg: "bg-black",
        border: "border-balatro-red",
      },
      4: {
        text: "text-balatro-purple",
        bg: "bg-black",
        border: "border-balatro-purple",
      },
    };
    return styleMap[rarity] || styleMap[1];
  };

  const rarityText = getRarityText(safeRarity);
  const rarityStyles = getRarityStyles(safeRarity);
  const rulesCount = joker.rules?.length || 0;
  const hasRules = rulesCount > 0;

  return (
    <div className="flex gap-4 relative">
      <div className="relative flex flex-col items-center">
        <div className="px-4 -mb-6 z-20 py-1 rounded-lg border-2 text-xl font-bold transition-all bg-black font-game tracking-widest border-balatro-money text-balatro-money w-20 text-center">
          ${joker.cost || 4}
        </div>

        <div className="w-42 z-10 relative">
          {joker.imagePreview ? (
            <img
              src={joker.imagePreview}
              alt={joker.name}
              className="w-full h-full object-contain"
              draggable="false"
            />
          ) : (
            <img
              src="/images/placeholder-joker.png"
              alt="Default Joker"
              className="w-full h-full object-contain"
              draggable="false"
            />
          )}
        </div>

        <div className="relative z-30">
          <div
            className={`px-6 py-1 -mt-6 rounded-lg border-2 text-xl font-game tracking-wide font-medium transition-all ${rarityStyles.bg} ${rarityStyles.border} ${rarityStyles.text}`}
          >
            {rarityText}
          </div>
        </div>
      </div>

      <div className="my-auto relative bg-black-dark border-2 border-black-lighter rounded-xl p-4 pl-10 -ml-12 flex-1 min-h-fit">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="mb-3 h-7 flex items-start overflow-hidden">
              <h3
                className="text-white-lighter text-xl tracking-wide font-game leading-tight line-clamp-1"
                style={{ lineHeight: "1.75rem" }}
              >
                {joker.name}
              </h3>
            </div>

            <div className="mb-4 h-16 flex items-start overflow-hidden">
              <div
                className="text-white-darker text-sm leading-relaxed font-game w-full line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: formatBalatroText(joker.description),
                }}
              />
            </div>

            {(joker.blueprint_compat === false ||
              joker.eternal_compat === false) && (
              <div className="flex items-center gap-3 mb-4">
                {joker.blueprint_compat === false && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-balatro-red/20 border border-balatro-red/40 rounded-md">
                    <span className="text-balatro-red text-xs font-medium">
                      No Blueprint
                    </span>
                  </div>
                )}

                {joker.eternal_compat === false && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-balatro-red/20 border border-balatro-red/40 rounded-md">
                    <span className="text-balatro-red text-xs font-medium">
                      No Eternal
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden">
            <div
              className="flex flex-1 hover:bg-white/10 transition-colors cursor-pointer group"
              onClick={onDuplicate}
            >
              <div className="flex-1 flex items-center justify-center py-3 px-3">
                <div className="flex items-center gap-2">
                  <DocumentDuplicateIcon className="h-6 w-6 text-white-darker group-hover:text-mint transition-colors" />
                  <span className="text-white-darker group-hover:text-mint transition-colors text-sm font-medium">
                    Duplicate
                  </span>
                </div>
              </div>
            </div>
            <div className="w-px bg-black-lighter py-3"></div>
            <div
              className={`flex flex-1 hover:bg-white/10 transition-colors group ${
                hasRules ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
              onClick={hasRules ? onViewRules : undefined}
            >
              <div className="flex-1 flex items-center justify-center py-3 px-3">
                <div className="relative">
                  <PuzzlePieceIcon
                    className={`h-6 w-6 transition-colors ${
                      hasRules
                        ? "text-white-darker group-hover:text-mint"
                        : "text-white-darker"
                    }`}
                  />
                  {rulesCount > 0 && hasRules && (
                    <div className="absolute -top-2 -right-2 bg-mint text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                      {rulesCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtraCreditPage;
