import React, { useState, useMemo, useEffect, startTransition } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  StarIcon,
  LockOpenIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  BuildingStorefrontIcon,
  NoSymbolIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { PuzzlePieceIcon } from "@heroicons/react/24/solid";
import { JokerData } from "../../data/BalatroUtils";
import { formatBalatroText } from "../../generic/balatroTextFormatter";
import RuleBuilder from "../../ruleBuilder/RuleBuilder";
import Button from "../../generic/Button";
import Tooltip from "../../generic/Tooltip";

interface JokersVanillaReforgedPageProps {
  onDuplicateToProject?: (item: JokerData) => void;
  onNavigateToJokers?: () => void;
}

type SortOption = {
  value: string;
  label: string;
  sortFn: (a: JokerData, b: JokerData) => number;
  ascText: string;
  descText: string;
};

const useAsyncDataLoader = () => {
  const [vanillaJokers, setVanillaJokers] = useState<JokerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/vanillareforged.json");
        if (!response.ok) {
          throw new Error("Failed to fetch vanilla data");
        }

        const data = await response.json();

        if (!isCancelled) {
          startTransition(() => {
            setVanillaJokers(data.jokers || []);
            setLoading(false);
          });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error fetching vanilla data:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
          setVanillaJokers([]);
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(loadData, 0);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return { vanillaJokers, loading, error };
};

const JokersVanillaReforgedPage: React.FC<JokersVanillaReforgedPageProps> = ({
  onDuplicateToProject,
  onNavigateToJokers,
}) => {
  const { vanillaJokers, loading } = useAsyncDataLoader();
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [sortBy, setSortBy] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc")

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentItemForRules, setCurrentItemForRules] =
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
  const sortDirectionButtonRef = React.useRef<HTMLButtonElement>(null);
  const filtersButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);
  const filtersMenuRef = React.useRef<HTMLDivElement>(null);

  const sortOptions: SortOption[] = useMemo(
    () => [
      {
        value: "id",
        label: "Id Value",
        sortFn: (a, b) => b.orderValue - a.orderValue,
        ascText: "Least to Most",
        descText: "Most to Least",
      },
      {
        value: "name",
        label: "Name",
        sortFn: (a, b) => b.name.localeCompare(a.name),
        ascText: "A-Z",
        descText: "Z-A",
      },
      {
        value: "rarity",
        label: "Rarity",
        sortFn: (a, b) => {
          const aNum = typeof b.rarity === "number" ? b.rarity : 999;
          const bNum = typeof a.rarity === "number" ? a.rarity : 999;
          return aNum - bNum;
        },
        ascText: "Low to High",
        descText: "High to Low",
      },
      {
        value: "cost",
        label: "Cost",
        sortFn: (a, b) => (b.cost || 0) - (a.cost || 0),
        ascText: "Low to High",
        descText: "High to Low",
      },
      {
        value: "rules",
        label: "Rules",
        sortFn: (a, b) => (b.rules?.length || 0) - (a.rules?.length || 0),
        ascText: "Least to Most",
        descText: "Most to Least",
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

  const filteredAndSortedItems = useMemo(() => {
    if (loading || !vanillaJokers.length) return [];

    const filtered = vanillaJokers.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        rarityFilter === null || item.rarity === rarityFilter;

      return matchesSearch && matchesFilter;
    });

    const currentSort = sortOptions.find((option) => option.value === sortBy);
    if (currentSort) {
      filtered.sort(currentSort.sortFn);
      if (sortDirection === "asc") {
        filtered.reverse()
      }
    }

    return filtered;
  }, [vanillaJokers, searchTerm, rarityFilter, sortBy, sortOptions, loading, sortDirection]);

  const rarityOptions = useMemo(
    () => [
      { value: null, label: "All Rarities", count: vanillaJokers.length },
      {
        value: 1,
        label: "Common",
        count: vanillaJokers.filter((j) => j.rarity === 1).length,
      },
      {
        value: 2,
        label: "Uncommon",
        count: vanillaJokers.filter((j) => j.rarity === 2).length,
      },
      {
        value: 3,
        label: "Rare",
        count: vanillaJokers.filter((j) => j.rarity === 3).length,
      },
      {
        value: 4,
        label: "Legendary",
        count: vanillaJokers.filter((j) => j.rarity === 4).length,
      },
    ],
    [vanillaJokers]
  );

  const handleDuplicateItem = (item: JokerData) => {
    if (onDuplicateToProject) {
      const duplicatedItem = {
        ...item,
        id: crypto.randomUUID(),
        name: `${item.name} Copy`,
      };
      onDuplicateToProject(duplicatedItem);
      if (onNavigateToJokers) onNavigateToJokers();
    }
  };

  const handleViewRules = (item: JokerData) => {
    const rules = item.rules;
    if (rules && rules.length === 1) {
      rules[0].position = { x: 500, y: 100 };
    }
    setCurrentItemForRules(item);
    setShowRuleBuilder(true);
  };

  const handleCloseRuleBuilder = () => {
    setShowRuleBuilder(false);
    setCurrentItemForRules(null);
  };

  const handleSortDirectionToggle = () => {
    if (sortDirection === "asc") {
      setSortDirection("desc")
    } else setSortDirection("asc")  
  }

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

  const currentSortMethod = sortOptions.find((option) => option.value === sortBy) 

  const currentSortLabel =
    currentSortMethod?.label ||
    "Id Value";

  const currentSortDirectionLabel =
    currentSortMethod ? (sortDirection === "asc" ? currentSortMethod.ascText : currentSortMethod.descText) :
    "Least to Most";

  const filterKey = `${searchTerm}-${rarityFilter}-${sortBy}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
      scale: 0.98,
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.4,
        delay: index < 10 ? index * 0.05 : 0,
      },
    }),
  };

  const staticVariants = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Vanilla Jokers
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          Reference Collection
        </h1>

        <div className="flex items-center mb-2">
          <div>
            <div className="flex items-center gap-6 text-white-darker text-sm">
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-mint" />
                Vanilla Collection •{" "}
                {loading
                  ? "Loading..."
                  : `${filteredAndSortedItems.length} of ${vanillaJokers.length}`}{" "}
                joker{vanillaJokers.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white-darker group-focus-within:text-mint transition-colors" />
              <input
                type="text"
                placeholder="Search vanilla jokers by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black-darker shadow-2xl border-2 border-black-lighter rounded-lg pl-12 pr-4 py-4 text-white-light tracking-wider placeholder-white-darker focus:outline-none focus:border-mint transition-all duration-200"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <button
                  ref={sortButtonRef}
                  onClick={handleSortMenuToggle}
                  className="flex items-center gap-2 bg-black-dark text-white-light px-4 py-4 border-2 border-black-lighter rounded-lg hover:border-mint transition-colors cursor-pointer"
                >
                  <ArrowsUpDownIcon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{currentSortLabel}</span>
                </button>
              </div>
              <button
                ref={sortDirectionButtonRef}
                onClick={handleSortDirectionToggle}
                className="flex items-center gap-2 bg-black-dark text-white-light px-4 py-4 border-2 border-black-lighter rounded-lg hover:border-mint transition-colors cursor-pointer"
              >
                <ArrowsUpDownIcon className="h-4 w-4" />
                <span className="whitespace-nowrap">{currentSortDirectionLabel}</span>
              </button>

              <div className="relative">
                <button
                  ref={filtersButtonRef}
                  onClick={handleFiltersToggle}
                  className={`flex items-center gap-2 px-4 py-4 border-2 rounded-lg transition-colors cursor-pointer ${
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
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <div className="rounded-2xl p-8 max-w-md">
                <div className="animate-spin h-16 w-16 border-4 border-mint border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-white-light text-xl font-light mb-3">
                  Loading Vanilla Jokers
                </h3>
                <p className="text-white-darker text-sm leading-relaxed">
                  Fetching the complete vanilla jokers collection...
                </p>
              </div>
            </motion.div>
          ) : filteredAndSortedItems.length === 0 &&
            vanillaJokers.length > 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <div className="rounded-2xl p-8 max-w-md">
                <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
                <h3 className="text-white-light text-xl font-light mb-3">
                  No Jokers Found
                </h3>
                <p className="text-white-darker text-sm mb-6 leading-relaxed">
                  No vanilla jokers match your current search and filter
                  criteria. Try adjusting your filters or search terms.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setRarityFilter(null);
                  }}
                  fullWidth
                >
                  Clear All Filters
                </Button>
              </div>
            </motion.div>
          ) : filteredAndSortedItems.length === 0 ? (
            <motion.div
              key="no-data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <div className="rounded-2xl p-8 max-w-md">
                <DocumentTextIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
                <h3 className="text-white-light text-xl font-light mb-3">
                  No Vanilla Jokers Available
                </h3>
                <p className="text-white-darker text-sm mb-6 leading-relaxed">
                  Unable to load the vanilla jokers collection. Please try
                  refreshing the page.
                </p>
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                  fullWidth
                >
                  Refresh Page
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`content-${filterKey}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid lg:grid-cols-2 md:grid-cols-1 gap-14"
            >
              {filteredAndSortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={index < 10 ? itemVariants : staticVariants}
                  initial={index < 10 ? "hidden" : "visible"}
                  animate="visible"
                  custom={index}
                >
                  <VanillaJokerCard
                    joker={item}
                    onDuplicate={() => handleDuplicateItem(item)}
                    onViewRules={() => handleViewRules(item)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {showRuleBuilder && currentItemForRules && (
          <RuleBuilder
            isOpen={showRuleBuilder}
            onClose={handleCloseRuleBuilder}
            onSave={() => {}}
            existingRules={currentItemForRules.rules || []}
            item={currentItemForRules}
            onUpdateItem={() => {}}
            itemType="joker"
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
                      setSortDirection(sortDirection)
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                    setRarityFilter(null);
                    setShowFilters(false);
                  }}
                  fullWidth
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

interface VanillaJokerCardProps {
  joker: JokerData;
  onDuplicate: () => void;
  onViewRules: () => void;
}

const PropertyIcon: React.FC<{
  icon: React.ReactNode;
  tooltip: string;
  variant: "disabled" | "warning" | "success" | "info" | "special";
  isEnabled: boolean;
}> = ({ icon, tooltip, variant, isEnabled }) => {
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
        className={`flex items-center justify-center w-7 h-7 rounded-lg border-2 transition-all duration-200 ${variantStyles[variant]}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-4 h-4">{icon}</div>
      </div>
    </Tooltip>
  );
};

const VanillaJokerCard: React.FC<VanillaJokerCardProps> = ({
  joker,
  onDuplicate,
  onViewRules,
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [tooltipDelayTimeout, setTooltipDelayTimeout] =
    useState<NodeJS.Timeout | null>(null);

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

  const blueprintCompat = joker.blueprint_compat !== false;
  const eternalCompat = joker.eternal_compat !== false;
  const isUnlocked = joker.unlocked !== false;
  const isDiscovered = joker.discovered !== false;
  const forceEternal = joker.force_eternal === true;
  const forcePerishable = joker.force_perishable === true;
  const forceRental = joker.force_rental === true;
  const appearsInShop = joker.appears_in_shop !== false;

  const propertyIcons = [
    {
      icon: <DocumentTextIcon className="w-full h-full" />,
      tooltip: blueprintCompat
        ? "Blueprint Compatible"
        : "Cannot be copied by Blueprint",
      variant: "disabled" as const,
      isEnabled: blueprintCompat,
    },
    {
      icon: <StarIcon className="w-full h-full" />,
      tooltip: eternalCompat ? "Eternal Compatible" : "Cannot be made Eternal",
      variant: "disabled" as const,
      isEnabled: eternalCompat,
    },
    {
      icon: isUnlocked ? (
        <LockOpenIcon className="w-full h-full" />
      ) : (
        <LockClosedIcon className="w-full h-full" />
      ),
      tooltip: isUnlocked ? "Unlocked by Default" : "Locked by Default",
      variant: "warning" as const,
      isEnabled: isUnlocked,
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
    },
    {
      icon: <ExclamationCircleIcon className="w-full h-full" />,
      tooltip: forceEternal
        ? "Always Spawns Eternal"
        : "Normal Eternal Spawning",
      variant: "special" as const,
      isEnabled: forceEternal,
    },
    {
      icon: <ClockIcon className="w-full h-full" />,
      tooltip: forcePerishable
        ? "Always Spawns Perishable"
        : "Normal Perishable Spawning",
      variant: "warning" as const,
      isEnabled: forcePerishable,
    },
    {
      icon: <CurrencyDollarIcon className="w-full h-full" />,
      tooltip: forceRental ? "Always Spawns Rental" : "Normal Rental Spawning",
      variant: "info" as const,
      isEnabled: forceRental,
    },
    {
      icon: appearsInShop ? (
        <BuildingStorefrontIcon className="w-full h-full" />
      ) : (
        <NoSymbolIcon className="w-full h-full" />
      ),
      tooltip: appearsInShop
        ? joker.rarity === 4
          ? "Forced Shop Appearance"
          : "Appears in Shop"
        : "Doesn't Appear in Shop",
      variant:
        appearsInShop && joker.rarity === 4
          ? ("special" as const)
          : ("success" as const),
      isEnabled: appearsInShop,
    },
  ];

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

  return (
    <div className="flex gap-4 relative">
      <div className="relative flex flex-col items-center">
        <div className="px-4 -mb-6 z-20 py-1 rounded-md border-2 font-bold transition-all bg-black tracking-widest border-balatro-money text-balatro-money w-18 text-center">
          ${joker.cost || 4}
        </div>

        <div className="w-42 z-10 relative">
          <div className="relative">
            {joker.imagePreview && !imageLoadError ? (
              <>
                <img
                  src={joker.imagePreview}
                  alt={joker.name}
                  className="w-full h-full object-contain"
                  draggable="false"
                  onError={() => setImageLoadError(true)}
                />
                {joker.overlayImagePreview && (
                  <img
                    src={joker.overlayImagePreview}
                    alt={`${joker.name} overlay`}
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
                alt="Default Joker"
                className="w-full h-full object-contain"
                draggable="false"
                onError={() => {
                  if (!fallbackAttempted) {
                    setFallbackAttempted(true);
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="relative z-30">
          <div
            className={`px-6 py-1 -mt-6 rounded-md border-2 text-sm tracking-wide font-medium transition-all ${rarityStyles.bg} ${rarityStyles.border} ${rarityStyles.text}`}
          >
            {rarityText}
          </div>
        </div>
      </div>

      <div className="my-auto border-l-2 pl-4 border-black-light relative flex-1 min-h-fit">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="mb-3 h-7 flex items-start overflow-hidden">
              <h3
                className="text-white-lighter text-xl tracking-wide leading-tight line-clamp-1"
                style={{ lineHeight: "1.75rem" }}
              >
                {joker.name}
              </h3>
            </div>
            <div
              className="absolute min-w-13 -top-3 right-7 h-8 bg-black-dark border-2 border-balatro-orange rounded-lg p-1 cursor-pointer transition-colors flex items-center justify-center z-10"
            > 
              <span
                className="text-center text-balatro-orange outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              >
                Id:{joker.orderValue}
              </span>
            </div>
            <div className="mb-4 h-12 flex items-start overflow-hidden">
              <div
                className="text-white-darker text-sm leading-relaxed w-full line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: formatBalatroText(joker.description),
                }}
              />
            </div>

            <div className="flex items-center justify-between mb-4 h-8 flex-wrap">
              {propertyIcons.map((iconConfig, index) => (
                <PropertyIcon
                  key={index}
                  icon={iconConfig.icon}
                  tooltip={iconConfig.tooltip}
                  variant={iconConfig.variant}
                  isEnabled={iconConfig.isEnabled}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center px-12 justify-between overflow-hidden">
            <Tooltip
              content="Duplicate to Project"
              show={hoveredButton === "duplicate"}
            >
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
            <div className="w-px bg-black-lighter py-3"></div>
            <Tooltip content="View Rules" show={hoveredButton === "rules"}>
              <div
                className="flex flex-1 hover:text-mint-light transition-colors cursor-pointer group"
                onClick={onViewRules}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default JokersVanillaReforgedPage;
