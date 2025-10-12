import React, { useState, useMemo, useEffect, startTransition, useContext } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  LockOpenIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  PlayIcon,
  UserGroupIcon,
  RectangleStackIcon,
  SparklesIcon as SparklesIconSolid,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { PuzzlePieceIcon } from "@heroicons/react/24/solid";
import { EnhancementData } from "../../data/BalatroUtils";
import { formatBalatroText } from "../../generic/balatroTextFormatter";
import RuleBuilder from "../../ruleBuilder/RuleBuilder";
import { UserConfigContext } from "../../Contexts";
import Button from "../../generic/Button";
import Tooltip from "../../generic/Tooltip";

interface EnhancementsVanillaReforgedPageProps {
  onDuplicateToProject?: (item: EnhancementData) => void;
  onNavigateToEnhancements?: () => void;
}

type SortOption = {
  value: string;
  label: string;
  sortFn: (a: EnhancementData, b: EnhancementData) => number;
  ascText: string;
  descText: string;
};

const useAsyncDataLoader = () => {
  const [vanillaEnhancements, setVanillaEnhancements] = useState<
    EnhancementData[]
  >([]);
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
            setVanillaEnhancements(data.enhancements || []);
            setLoading(false);
          });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error fetching vanilla data:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
          setVanillaEnhancements([]);
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

  return { vanillaEnhancements, loading, error };
};

const EnhancementsVanillaReforgedPage: React.FC<
  EnhancementsVanillaReforgedPageProps
> = ({ onDuplicateToProject, onNavigateToEnhancements }) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext)
  const { vanillaEnhancements, loading } = useAsyncDataLoader();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentItemForRules, setCurrentItemForRules] =
    useState<EnhancementData | null>(null);
    const itemTypes = userConfig.pageData.map(item => item.objectType)
          const [sortBy, setSortBy] = useState(
            userConfig.pageData[itemTypes.indexOf("vanilla_enhancement")].filter ?? "id")
          const [sortDirection, setSortDirection] = useState(
            userConfig.pageData[itemTypes.indexOf("vanilla_enhancement")].direction ?? "asc")
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const sortButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortDirectionButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);

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
        value: "rules",
        label: "Rules",
        sortFn: (a, b) => (a.rules?.length || 0) - (b.rules?.length || 0),
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

  const filteredAndSortedItems = useMemo(() => {
    if (loading || !vanillaEnhancements.length) return [];

    const filtered = vanillaEnhancements.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    const currentSort = sortOptions.find((option) => option.value === sortBy);
    if (currentSort) {
      filtered.sort(currentSort.sortFn);
      if (sortDirection === "asc") {
        filtered.reverse()
      }
    }

    return filtered;
  }, [vanillaEnhancements, searchTerm, sortBy, sortOptions, loading, sortDirection]);

  const handleDuplicateItem = (item: EnhancementData) => {
    if (onDuplicateToProject) {
      const duplicatedItem = {
        ...item,
        id: crypto.randomUUID(),
        name: `${item.name} Copy`,
      };
      onDuplicateToProject(duplicatedItem);
      if (onNavigateToEnhancements) onNavigateToEnhancements();
    }
  };

  const handleViewRules = (item: EnhancementData) => {
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
    let direction = "asc"
    if (sortDirection === "asc") {
      setSortDirection("desc")
      direction = "desc"
    } else setSortDirection("asc")
    
    setUserConfig((prevConfig) => {
      const config = prevConfig
      config.pageData[itemTypes.indexOf("vanilla_enhancement")].direction = direction
      return ({...config})
    })
  }

  const handleSortMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSortMenu(!showSortMenu);
  };

  const currentSortMethod = sortOptions.find((option) => option.value === sortBy) 

  const currentSortLabel =
    currentSortMethod?.label ||
    "Id Value";

  const currentSortDirectionLabel =
    currentSortMethod ? (sortDirection === "asc" ? currentSortMethod.ascText : currentSortMethod.descText) :
    "Least to Most";

  const filterKey = `${searchTerm}-${sortBy}`;

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
          Vanilla Enhancements
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
                  : `${filteredAndSortedItems.length} of ${vanillaEnhancements.length}`}{" "}
                enhancement{vanillaEnhancements.length !== 1 ? "s" : ""}
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
                placeholder="Search vanilla enhancements by name or description..."
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
                  Loading Vanilla Enhancements
                </h3>
                <p className="text-white-darker text-sm leading-relaxed">
                  Fetching the complete vanilla enhancements collection...
                </p>
              </div>
            </motion.div>
          ) : filteredAndSortedItems.length === 0 &&
            vanillaEnhancements.length > 0 ? (
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
                  No Enhancements Found
                </h3>
                <p className="text-white-darker text-sm mb-6 leading-relaxed">
                  No vanilla enhancements match your current search criteria.
                  Try adjusting your search terms.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setSearchTerm("")}
                  fullWidth
                >
                  Clear Search
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
                  No Vanilla Enhancements Available
                </h3>
                <p className="text-white-darker text-sm mb-6 leading-relaxed">
                  Unable to load the vanilla enhancements collection. Please try
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
                  <VanillaEnhancementCard
                    enhancement={item}
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
            itemType="card"
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
                        config.pageData[itemTypes.indexOf("vanilla_enhancement")].filter = option.value
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
    </div>
  );
};

interface VanillaEnhancementCardProps {
  enhancement: EnhancementData;
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

const VanillaEnhancementCard: React.FC<VanillaEnhancementCardProps> = ({
  enhancement,
  onDuplicate,
  onViewRules,
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [tooltipDelayTimeout, setTooltipDelayTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const rulesCount = enhancement.rules?.length || 0;
  const isUnlocked = enhancement.unlocked !== false;
  const isDiscovered = enhancement.discovered !== false;
  const noCollection = enhancement.no_collection === true;
  const anySuit = enhancement.any_suit === true;
  const replaceBaseCard = enhancement.replace_base_card === true;
  const noRank = enhancement.no_rank === true;
  const noSuit = enhancement.no_suit === true;
  const alwaysScores = enhancement.always_scores === true;

  const propertyIcons = [
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
      tooltip: noCollection ? "Hidden from Collection" : "Shows in Collection",
      variant: "special" as const,
      isEnabled: noCollection,
    },
    {
      icon: <PlayIcon className="w-full h-full" />,
      tooltip: anySuit ? "Works with Any Suit" : "Suit-Specific",
      variant: "success" as const,
      isEnabled: anySuit,
    },
    {
      icon: <Cog6ToothIcon className="w-full h-full" />,
      tooltip: replaceBaseCard ? "Replaces Base Card" : "Normal Card",
      variant: "info" as const,
      isEnabled: replaceBaseCard,
    },
    {
      icon: <UserGroupIcon className="w-full h-full" />,
      tooltip: noRank ? "No Rank" : "Has Rank",
      variant: "disabled" as const,
      isEnabled: noRank,
    },
    {
      icon: <RectangleStackIcon className="w-full h-full" />,
      tooltip: noSuit ? "No Suit" : "Has Suit",
      variant: "disabled" as const,
      isEnabled: noSuit,
    },
    {
      icon: <SparklesIconSolid className="w-full h-full" />,
      tooltip: alwaysScores ? "Always Scores" : "Normal Scoring",
      variant: "special" as const,
      isEnabled: alwaysScores,
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
        <div className="w-42 z-10 relative">
          <div className="relative">
            {enhancement.imagePreview && !imageLoadError ? (
              <div className="relative w-full h-full">
                <img
                  src={enhancement.imagePreview}
                  alt={enhancement.name}
                  className="w-full h-full object-contain"
                  draggable="false"
                  onError={() => setImageLoadError(true)}
                />
                <img
                  src="/images/aces/HC_A_hearts.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  draggable="false"
                />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src="/images/placeholder-enhancement.png"
                  alt="Default Enhancement"
                  className="w-full h-full object-contain"
                  draggable="false"
                />
                <img
                  src="/images/aces/HC_A_clubs.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  draggable="false"
                />
              </div>
            )}
          </div>
        </div>

        <div className="relative z-30">
          <div className="px-4 py-1 -mt-6 rounded-md border-2 text-sm tracking-wide font-medium bg-black border-balatro-enhanced text-balatro-enhanced">
            Enhancement
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
                {enhancement.name}
              </h3>
            </div>
             <div
              className="absolute min-w-13 -top-3 right-7 h-8 bg-black-dark border-2 border-balatro-orange rounded-lg p-1 cursor-pointer transition-colors flex items-center justify-center z-10"
            > 
              <span
                className="text-center text-balatro-orange outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              >
                Id:{enhancement.orderValue}
              </span>
            </div>
            <div className="mb-4 h-12 flex items-start overflow-hidden">
              <div
                className="text-white-darker text-sm leading-relaxed w-full line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: formatBalatroText(enhancement.description),
                }}
              />
            </div>

            <div className="flex items-center justify-between mb-4 px-2 h-8 flex-wrap">
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
                    <PuzzlePieceIcon className="h-6 w-6 text-white group-hover:text-mint-lighter transition-colors" />
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

export default EnhancementsVanillaReforgedPage;
