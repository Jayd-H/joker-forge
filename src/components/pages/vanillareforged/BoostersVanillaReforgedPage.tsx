import React, { useState, useMemo, useEffect, startTransition, useContext } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  SparklesIcon as SparklesIconSolid,
  RectangleStackIcon,
  PlayIcon,
  GiftIcon,
  CubeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { BoosterData, ConsumableSetData } from "../../data/BalatroUtils";
import { formatBalatroText } from "../../generic/balatroTextFormatter";
import { EditBoosterRulesModal } from "../BoostersPage";
import { UserConfigContext } from "../../Contexts";
import Button from "../../generic/Button";
import Tooltip from "../../generic/Tooltip";

interface BoostersVanillaReforgedPageProps {
  onDuplicateToProject?: (item: BoosterData) => void;
  onNavigateToBoosters?: () => void;
}

type SortOption = {
  value: string;
  label: string;
  sortFn: (a: BoosterData, b: BoosterData) => number;
  ascText: string;
  descText: string;
};

const useAsyncDataLoader = () => {
  const [vanillaBoosters, setVanillaBoosters] = useState<BoosterData[]>([]);
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
            setVanillaBoosters(data.boosters || []);
            setLoading(false);
          });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error fetching vanilla data:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
          setVanillaBoosters([]);
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

  return { vanillaBoosters, loading, error };
};

const BoostersVanillaReforgedPage: React.FC<
  BoostersVanillaReforgedPageProps
> = ({ onDuplicateToProject, onNavigateToBoosters }) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext)
  const { vanillaBoosters, loading } = useAsyncDataLoader();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showBoosterRulesModal, setShowBoosterRulesModal] = useState(false);
  const [currentItemForRules, setCurrentItemForRules] =
    useState<BoosterData | null>(null);
      const itemTypes = userConfig.pageData.map(item => item.objectType)
      const [sortBy, setSortBy] = useState(
        userConfig.pageData[itemTypes.indexOf("vanilla_booster")].filter ?? "id")
      const [sortDirection, setSortDirection] = useState(
        userConfig.pageData[itemTypes.indexOf("vanilla_booster")].direction ?? "asc")
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
        sortFn: (a, b) => a.orderValue - b.orderValue,
        ascText: "Least to Most",
        descText: "Most to Least",
      },
      {
        value: "name",
        label: "Name",
        sortFn: (a, b) => a.name.localeCompare(b.name),
        ascText: "A-Z",
        descText: "Z-A",
      },
      {
        value: "type",
        label: "type",
        sortFn: (a, b) => a.booster_type.localeCompare(b.booster_type),
        ascText: "A-Z",
        descText: "Z-A",
      },
      {
        value: "cost",
        label: "Cost (Low to High)",
        sortFn: (a, b) => (a.cost || 0) - (b.cost || 0),
        ascText: "Low to High",
        descText: "High to Low",
      },
      {
        value: "rules",
        label: "Rules",
        sortFn: (a, b) => {
          const aRules = a.card_rules?.length || 0;
          const bRules = b.card_rules?.length || 0;
          return aRules - bRules;
        },
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
    if (loading || !vanillaBoosters.length) return [];

    const filtered = vanillaBoosters.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = typeFilter === null || item.booster_type === typeFilter;

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
  }, [vanillaBoosters, searchTerm, typeFilter,  sortBy, sortOptions, loading, sortDirection]);

  const typeOptions = useMemo(
    () => [
      { value: null, label: "All Types", count: vanillaBoosters.length },
      {
        value: "joker",
        label: "Joker Packs",
        count: vanillaBoosters.filter((b) => b.booster_type === "joker").length,
      },
      {
        value: "consumable",
        label: "Consumable Packs",
        count: vanillaBoosters.filter((b) => b.booster_type === "consumable")
          .length,
      },
      {
        value: "playing_card",
        label: "Playing Card Packs",
        count: vanillaBoosters.filter((b) => b.booster_type === "playing_card")
          .length,
      },
    ],
    [vanillaBoosters]
  );

  const handleDuplicateItem = (item: BoosterData) => {
    if (onDuplicateToProject) {
      const duplicatedItem = {
        ...item,
        id: crypto.randomUUID(),
        name: `${item.name} Copy`,
      };
      onDuplicateToProject(duplicatedItem);
      if (onNavigateToBoosters) onNavigateToBoosters();
    }
  };

  const handleViewRules = (item: BoosterData) => {
    setCurrentItemForRules(item);
    setShowBoosterRulesModal(true);
  };

  const handleCloseBoosterRulesModal = () => {
    setShowBoosterRulesModal(false);
    setCurrentItemForRules(null);
  };

const handleSortDirectionToggle = () => {
    let direction = "asc"
    if (sortDirection === "asc") {
      setSortDirection("desc")
      direction = "desc"
    } else setSortDirection("asc")
    
    setUserConfig((prevConfig) => {
      const config = prevConfig
      config.pageData[itemTypes.indexOf("vanilla_booster")].direction = direction
      return ({...config})
    })
  }

  const handleSortMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showFilters) setShowFilters(false);
    setShowSortMenu(!showSortMenu);
  };


  const getTypeColor = (type: string | null) => {
    switch (type) {
      case "joker":
        return "text-balatro-purple";
      case "consumable":
        return "text-mint";
      case "playing_card":
        return "text-balatro-blue";
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

  const filterKey = `${searchTerm}-${typeFilter}-${sortBy}`;

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
          Vanilla Boosters
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
                  : `${filteredAndSortedItems.length} of ${vanillaBoosters.length}`}{" "}
                booster{vanillaBoosters.length !== 1 ? "s" : ""}
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
                placeholder="Search vanilla boosters by name or description..."
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
                    onClick={() => {
                      if (showSortMenu) setShowSortMenu(false);
                      setShowFilters(!showFilters);
                    }}
                    className="flex items-center gap-2 bg-black-dark text-white-light px-4 py-4 border-2 border-black-lighter rounded-lg hover:border-mint transition-colors cursor-pointer"
                  >
                    <FunnelIcon className="h-4 w-4" />
                    <span className="whitespace-nowrap">
                      {typeFilter
                        ? typeOptions.find((opt) => opt.value === typeFilter)
                            ?.label
                        : "Filters"}
                    </span>
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
                  Loading Vanilla Boosters
                </h3>
                <p className="text-white-darker text-sm leading-relaxed">
                  Fetching the complete vanilla boosters collection...
                </p>
              </div>
            </motion.div>
          ) : filteredAndSortedItems.length === 0 &&
            vanillaBoosters.length > 0 ? (
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
                  No Boosters Found
                </h3>
                <p className="text-white-darker text-sm mb-6 leading-relaxed">
                  No vanilla boosters match your current search and filter
                  criteria. Try adjusting your filters or search terms.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setTypeFilter(null);
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
                  No Vanilla Boosters Available
                </h3>
                <p className="text-white-darker text-sm mb-6 leading-relaxed">
                  Unable to load the vanilla boosters collection. Please try
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
                  <VanillaBoosterCard
                    booster={item}
                    onDuplicate={() => handleDuplicateItem(item)}
                    onViewRules={() => handleViewRules(item)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {showBoosterRulesModal && currentItemForRules && (
          <EditBoosterRulesModal
            isOpen={showBoosterRulesModal}
            onClose={handleCloseBoosterRulesModal}
            onSave={handleCloseBoosterRulesModal}
            cardRules={currentItemForRules.card_rules || []}
            boosterType={currentItemForRules.booster_type}
            consumableSets={[] as ConsumableSetData[]}
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
                      setUserConfig((prevConfig) => {
                        const config = prevConfig
                        config.pageData[itemTypes.indexOf("vanilla_booster")].filter = option.value
                        return ({
                        ...config,
                      })});
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
                Filter by Type
              </h3>
              <div className="space-y-1">
                {typeOptions.map((option) => (
                  <button
                    key={option.value || "all"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTypeFilter(option.value);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      typeFilter === option.value
                        ? "bg-mint/20 border border-mint text-mint"
                        : "hover:bg-black-lighter"
                    }`}
                  >
                    <span className={getTypeColor(option.value)}>
                      {option.label}
                    </span>
                    <span className="text-white-darker ml-1">
                      ({option.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {(searchTerm || typeFilter !== null) && (
              <div className="p-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                    setTypeFilter(null);
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

interface VanillaBoosterCardProps {
  booster: BoosterData;
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

const VanillaBoosterCard: React.FC<VanillaBoosterCardProps> = ({
  booster,
  onDuplicate,
  onViewRules,
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [tooltipDelayTimeout, setTooltipDelayTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const getBoosterTypeIcon = () => {
    switch (booster.booster_type) {
      case "joker":
        return <UserGroupIcon className="w-full h-full" />;
      case "consumable":
        return <SparklesIconSolid className="w-full h-full" />;
      case "playing_card":
        return <RectangleStackIcon className="w-full h-full" />;
      default:
        return <CubeIcon className="w-full h-full" />;
    }
  };

  const getBoosterTypeLabel = () => {
    switch (booster.booster_type) {
      case "joker":
        return "Joker Pack";
      case "consumable":
        return "Consumable Pack";
      case "playing_card":
        return "Playing Card Pack";
      default:
        return "Unknown Pack";
    }
  };

  const getBoosterTypeColor = () => {
    switch (booster.booster_type) {
      case "joker":
        return "text-balatro-purple border-balatro-purple";
      case "consumable":
        return "text-mint border-mint";
      case "playing_card":
        return "text-balatro-blue border-balatro-blue";
      default:
        return "text-balatro-gold-new border-balatro-gold-new";
    }
  };

  const rulesCount = booster.card_rules?.length || 0;
  const isDiscovered = booster.discovered ?? true;
  const drawToHand = booster.draw_hand === true;

  const propertyIcons = [
    {
      icon: getBoosterTypeIcon(),
      tooltip: getBoosterTypeLabel(),
      variant: "info" as const,
      isEnabled: true,
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
      icon: <PlayIcon className="w-full h-full" />,
      tooltip: drawToHand ? "Draws to Hand" : "Opens Normally",
      variant: "success" as const,
      isEnabled: drawToHand,
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
          ${booster.cost}
        </div>

        <div className="w-42 z-10 relative">
          <div className="relative rounded-lg overflow-hidden">
            {booster.imagePreview && !imageLoadError ? (
              <img
                src={booster.imagePreview}
                alt={booster.name}
                className="w-full h-full object-contain"
                draggable="false"
                onError={() => setImageLoadError(true)}
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center border-2 border-mint/30 rounded-lg">
                <GiftIcon className="h-16 w-16 text-mint opacity-60" />
              </div>
            )}
          </div>
        </div>

        <div className="relative z-30">
          <div
            className={`px-4 py-1 -mt-6 rounded-md border-2 text-sm tracking-wide font-medium bg-black ${getBoosterTypeColor()}`}
          >
            {getBoosterTypeLabel()}
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
                {booster.name}
              </h3>
            </div>
            <div className="mb-4 h-12 flex items-start overflow-hidden">
              <div
                className="text-white-darker text-sm leading-relaxed w-full line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: formatBalatroText(booster.description),
                }}
              />
            </div>

            <div className="mb-4">
              <div className="text-xs text-white-darker mb-1">
                Configuration:
              </div>
              <div className="text-white-light text-sm">
                {booster.config.extra} cards, choose {booster.config.choose}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 px-8 h-8 flex-wrap">
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
                className="flex flex-1 transition-colors cursor-pointer group"
                onClick={onViewRules}
                onMouseEnter={() => handleButtonHover("rules")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <div className="relative">
                    <Cog6ToothIcon className="h-6 w-6 text-white group-hover:text-mint-lighter transition-colors" />
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

export default BoostersVanillaReforgedPage;
