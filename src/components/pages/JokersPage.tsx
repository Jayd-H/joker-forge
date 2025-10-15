import React, { useState, useMemo, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import {
  PlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import JokerCard from "./jokers/JokerCard";
import EditJokerInfo from "./jokers/EditJokerInfo";
import { Suspense, lazy } from "react";
const RuleBuilder = lazy(() => import("../ruleBuilder/RuleBuilder"));
import RuleBuilderLoading from "../generic/RuleBuilderLoading";
import Button from "../generic/Button";
import { exportSingleJoker } from "../codeGeneration/Jokers/index";
import type { Rule } from "../ruleBuilder/types";
import { RarityData, JokerData, slugify } from "../data/BalatroUtils";
import { UserConfigContext } from "../Contexts";
import ShowcaseModal from "../generic/ShowcaseModal";
import { updateGameObjectIds, getObjectName } from "../generic/GameObjectOrdering";

interface JokersPageProps {
  modName: string;
  jokers: JokerData[];
  setJokers: React.Dispatch<React.SetStateAction<JokerData[]>>;
  selectedJokerId: string | null;
  setSelectedJokerId: React.Dispatch<React.SetStateAction<string | null>>;
  customRarities?: RarityData[];
  modPrefix: string;
  showConfirmation: (options: {
    type?: "default" | "warning" | "danger" | "success";
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "primary" | "secondary" | "danger";
    icon?: React.ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
}

type SortOption = {
  value: string;
  label: string;
  sortFn: (a: JokerData, b: JokerData) => number;
  ascText: string;
  descText: string;
};

let availablePlaceholders: string[] | null = null;
let upscaledPlaceholders: string[] | null = null;

const upscaleImage = (imageSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width === 71 && img.height === 95) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 142;
        canvas.height = 190;

        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, 142, 190);
        }

        resolve(canvas.toDataURL("image/png"));
      } else {
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

const getRandomPlaceholderJoker = async (): Promise<{
  imageData: string;
  creditIndex?: number;
}> => {
  if (upscaledPlaceholders && upscaledPlaceholders.length > 0) {
    const randomIndex = Math.floor(Math.random() * upscaledPlaceholders.length);
    const imagePath = availablePlaceholders?.[randomIndex];
    console.log(imagePath)
    console.log(availablePlaceholders)
    const match = imagePath?.match(/placeholder-joker-(\d+)\.png/);
    const imageNumber = match ? parseInt(match[1], 10) : randomIndex + 1;

    return {
      imageData: upscaledPlaceholders[randomIndex],
      creditIndex: imageNumber,
    };
  }

  if (availablePlaceholders && availablePlaceholders.length > 0) {
    const upscaled = await Promise.all(
      availablePlaceholders.map((placeholder) => upscaleImage(placeholder))
    );
    upscaledPlaceholders = upscaled;
    const randomIndex = Math.floor(Math.random() * upscaled.length);
    const match = availablePlaceholders[randomIndex].match(
      /placeholder-joker-(\d+)\.png/
    );
    const imageNumber = match ? parseInt(match[1], 10) : 1;

    return {
      imageData: upscaled[randomIndex],
      creditIndex: imageNumber,
    };
  }

  const checkImage = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  };

  const placeholders: string[] = [];
  let counter = 1;
  let keepChecking = true;

  while (keepChecking) {
    const imagePath = `/images/placeholderjokers/placeholder-joker-${counter}.png`;

    if (await checkImage(imagePath)) {
      placeholders.push(imagePath);
      counter++;
    } else {
      keepChecking = false;
    }
  }

  availablePlaceholders = placeholders;

  if (placeholders.length === 0) {
    return { imageData: "/images/placeholder-joker.png" };
  }

  const upscaled = await Promise.all(
    placeholders.map((placeholder) => upscaleImage(placeholder))
  );
  upscaledPlaceholders = upscaled;

  const randomIndex = Math.floor(Math.random() * upscaled.length);
  const match = placeholders[randomIndex].match(/placeholder-joker-(\d+)\.png/);
  const imageNumber = match ? parseInt(match[1], 15) : 1;

  return {
    imageData: upscaled[randomIndex],
    creditIndex: imageNumber,
  };
};

const isPlaceholderJoker = (imagePath: string): boolean => {
  return (
    imagePath.includes("/images/placeholderjokers/") ||
    imagePath.includes("placeholder-joker")
  );
};

const JokersPage: React.FC<JokersPageProps> = ({
  modName,
  jokers,
  setJokers,
  selectedJokerId,
  setSelectedJokerId,
  customRarities = [],
  modPrefix,
  showConfirmation,
}) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext);
  const [editingJoker, setEditingJoker] = useState<JokerData | null>(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentJokerForRules, setCurrentJokerForRules] =
    useState<JokerData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const itemTypes = userConfig.pageData.map(item => item.objectType)
  const [sortBy, setSortBy] = useState(
        userConfig.pageData[itemTypes.indexOf("joker")].filter ?? "id")
  const [sortDirection, setSortDirection] = useState(
    userConfig.pageData[itemTypes.indexOf("joker")].direction ?? "asc")

  const [showSortMenu, setShowSortMenu] = useState(false);
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

  const [showShowcase, setShowShowcase] = useState(false);
  const [showcaseJoker, setShowcaseJoker] = useState<JokerData | null>(null);

  const handleShowcase = (joker: JokerData) => {
    setShowcaseJoker(joker);
    setShowShowcase(true);
  };

  const handleCloseShowcase = () => {
    setShowShowcase(false);
    setShowcaseJoker(null);
  };

  const editData = userConfig.pageData[itemTypes.indexOf("joker")].editList
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
        value: "rarity",
        label: "Rarity",
        sortFn: (a, b) => {
          const aNum = typeof a.rarity === "number" ? a.rarity : 999;
          const bNum = typeof b.rarity === "number" ? b.rarity : 999;
          return aNum - bNum;
        },
        ascText: "Low to High",
        descText: "High to Low",
      },
      {
        value: "cost",
        label: "Cost",
        sortFn: (a, b) => (a.cost || 0) - (b.cost || 0),
        ascText: "Low to High",
        descText: "High to Low",
      },
      {
        value: "rules",
        label: "Rules",
        sortFn: (a, b) => (a.rules?.length || 0) - (b.rules?.length || 0),
        ascText: "Least to Most",
        descText: "Most to Least",
      },
      {
        value: "edit",
        label: "Last Edited",
        sortFn: (a, b) => (editData.indexOf(a.objectKey) || 0) - (editData.indexOf(b.objectKey) || 0),
        ascText: "Oldest to Newest",
        descText: "Newest to Oldest",
      },
    ],
    [editData]
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

  const handleAddNewJoker = async () => {
    const placeholderResult = await getRandomPlaceholderJoker();
    const modPool = modPrefix+'_jokers'
    const newJoker: JokerData = {
      objectType: "joker",
      id: crypto.randomUUID(),
      name: "New Joker",
      description: "A {C:blue}custom{} joker with {C:red}unique{} effects.",
      unlockDescription: "Unlocked by default.",
      imagePreview: placeholderResult.imageData,
      overlayImagePreview: "",
      rarity: 1,
      cost: 4,
      blueprint_compat: true,
      eternal_compat: true,
      unlocked: true,
      discovered: true,
      rules: [],
      orderValue: jokers.length+1,
      placeholderCreditIndex: placeholderResult.creditIndex,
      appears_in_shop: true,
      cardAppearance: {
        buf: true,
        jud: true,
        rif: true,
        rta: true,
        sou: true,
        uta: true,
        wra: true,
      },
      appearFlags: "",
      pools: [modPool],
      objectKey: slugify("New Joker")
    };
    newJoker.objectKey = getObjectName(newJoker,jokers,newJoker.objectKey)
    setJokers([...jokers, newJoker]);
    setEditingJoker(newJoker);
    handleUpdateJoker(newJoker)
  };

  const handleSaveJoker = (updatedJoker: JokerData) => {
    jokers.forEach(joker => {
      if (joker.id === updatedJoker.id) {
        handleUpdateJoker(updatedJoker, "change", joker.objectKey ) 
      }
    })

    setJokers((prev) =>
      prev.map((joker) => (joker.id === updatedJoker.id ? updatedJoker : joker))
    );
  };

  const handleUpdateJoker = (updatedJoker: JokerData, type?: string, oldKey?: string) => {
    setUserConfig((prevConfig) => {
      const config = prevConfig
      const dataList = config.pageData[itemTypes.indexOf("joker")].editList

      if (oldKey && dataList.includes(oldKey)) {
        config.pageData[itemTypes.indexOf("joker")].editList.splice(dataList.indexOf(oldKey))
      }
      if (dataList.includes(updatedJoker.objectKey)) {
        config.pageData[itemTypes.indexOf("joker")].editList.splice(dataList.indexOf(updatedJoker.objectKey ))
      }

      if (type !== "delete"){
        config.pageData[itemTypes.indexOf("joker")].editList.push(updatedJoker.objectKey)
      }

      return ({
      ...config,
      })
    })
  }

  const handleDeleteJoker = (jokerId: string) => {
    const removedJoker = jokers.filter(joker => joker.id !== jokerId)[0]
    setJokers((prev) => prev.filter((joker) => joker.id !== jokerId));
    
    if (selectedJokerId === jokerId) {
      const remainingJokers = jokers.filter((joker) => joker.id !== jokerId);
      setSelectedJokerId(remainingJokers.length > 0 ? remainingJokers[0].id : null);
      jokers = updateGameObjectIds(removedJoker, jokers, 'remove', removedJoker.orderValue)
      handleUpdateJoker(removedJoker, "delete")
  }};

  const handleDuplicateJoker = async (joker: JokerData) => {
    const dupeName = slugify(getObjectName(joker,jokers))
    if (isPlaceholderJoker(joker.imagePreview)) {
      const placeholderResult = await getRandomPlaceholderJoker();
      const duplicatedJoker: JokerData = {
        ...joker,
        id: crypto.randomUUID(),
        name: joker.name,
        imagePreview: placeholderResult.imageData,
        placeholderCreditIndex: placeholderResult.creditIndex,
        orderValue: joker.orderValue+1,
        objectKey: `${dupeName}`,
      };
      setJokers([...jokers, duplicatedJoker]);
      jokers = updateGameObjectIds(duplicatedJoker, jokers, 'insert', duplicatedJoker.orderValue)
      handleUpdateJoker(duplicatedJoker)
    } else {
      const duplicatedJoker: JokerData = {
        ...joker,
        id: crypto.randomUUID(),
        name: `${dupeName}`,
        orderValue: joker.orderValue+1,
      };
      setJokers([...jokers, duplicatedJoker]);
      jokers = updateGameObjectIds(duplicatedJoker, jokers, 'insert', duplicatedJoker.orderValue)
      handleUpdateJoker(duplicatedJoker)
    }
  };

  const handleExportJoker = (joker: JokerData) => {
    try {
      exportSingleJoker(joker);
    } catch (error) {
      console.error("Failed to export joker:", error);
    }
  };

  const handleQuickUpdate = (joker: JokerData, updates: Partial<JokerData>) => {
    const updatedJoker = { ...joker, ...updates };
    handleSaveJoker(updatedJoker);
  };

  const handleEditInfo = (joker: JokerData) => {
    setEditingJoker(joker);
  };

  const handleEditRules = (joker: JokerData) => {
    setCurrentJokerForRules(joker);
    setShowRuleBuilder(true);
  };

  const handleSaveRules = (rules: Rule[]) => {
    if (currentJokerForRules) {
      const updatedJoker = { ...currentJokerForRules, rules };
      handleSaveJoker(updatedJoker);
    }
    setShowRuleBuilder(false);
    setCurrentJokerForRules(null);
  };

  const handleUpdateJokerFromRuleBuilder = (updates: Partial<JokerData>) => {
    if (currentJokerForRules) {
      const updatedJoker = { ...currentJokerForRules, ...updates };
      setCurrentJokerForRules(updatedJoker);
      handleSaveJoker(updatedJoker);
    }
  };

  const handleSortDirectionToggle = () => {
    let direction = "asc"
    if (sortDirection === "asc") {
      setSortDirection("desc")
      direction = "desc"
    } else setSortDirection("asc")
    
    setUserConfig((prevConfig) => {
      const config = prevConfig
      config.pageData[itemTypes.indexOf("joker")].direction = direction
      return ({...config})
    })
  }

  const handleSortMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showFilters) setShowFilters(false);
    setShowSortMenu(!showSortMenu);
  };

  const filteredAndSortedJokers = useMemo(() => {
    const filtered = jokers.filter((joker) => {
      const matchesSearch =
        joker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        joker.description.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesRarity = true;
      if (rarityFilter !== null) {
        if (typeof joker.rarity === "number") {
          matchesRarity = joker.rarity === rarityFilter;
        } else {
          matchesRarity = false;
        }
      }

      return matchesSearch && matchesRarity;
    });

    const currentSort = sortOptions.find((option) => option.value === sortBy);
    if (currentSort) {
      filtered.sort(currentSort.sortFn);
      if (sortDirection === "desc") {
        filtered.reverse()
      }
    }

    return filtered;
  }, [jokers, searchTerm, rarityFilter, sortBy, sortOptions, sortDirection]);

  const rarityOptions = [
    { value: null, label: "All Rarities", count: jokers.length },
    {
      value: 1,
      label: "Common",
      count: jokers.filter((j) => j.rarity === 1).length,
    },
    {
      value: 2,
      label: "Uncommon",
      count: jokers.filter((j) => j.rarity === 2).length,
    },
    {
      value: 3,
      label: "Rare",
      count: jokers.filter((j) => j.rarity === 3).length,
    },
    {
      value: 4,
      label: "Legendary",
      count: jokers.filter((j) => j.rarity === 4).length,
    },
  ];

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

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Jokers
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          {modName}
        </h1>
        <div className="flex justify-center mb-2">
          <Button
            variant="primary"
            onClick={handleAddNewJoker}
            icon={<PlusIcon className="h-5 w-5" />}
            size="md"
            className="shadow-lg hover:shadow-2xl transition-shadow"
          >
            Add New Joker
          </Button>
        </div>
        <div className="flex items-center mb-2">
          <div>
            <div className="flex items-center gap-6 text-white-darker text-sm">
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-mint" />
                {modName} • {filteredAndSortedJokers.length} of {jokers.length}{" "}
                joker{jokers.length !== 1 ? "s" : ""}
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
                placeholder="Search jokers by name or description..."
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

        {filteredAndSortedJokers.length === 0 && jokers.length > 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Jokers Found
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                No jokers match your current search and filter criteria. Try
                adjusting your filters or search terms.
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
          </div>
        ) : filteredAndSortedJokers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <DocumentTextIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Jokers Yet :(
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                Create your first joker to get started with editing its
                information and defining its custom rules.
              </p>
              <Button
                variant="primary"
                onClick={handleAddNewJoker}
                icon={<PlusIcon className="h-5 w-5" />}
                fullWidth
              >
                Create Your First Joker
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-14">
            {filteredAndSortedJokers.map((joker) => (
              <JokerCard
                key={joker.id}
                joker={joker}
                jokers={jokers}
                onEditInfo={() => handleEditInfo(joker)}
                onEditRules={() => handleEditRules(joker)}
                onDelete={() => handleDeleteJoker(joker.id)}
                onDuplicate={() => handleDuplicateJoker(joker)}
                onExport={() => handleExportJoker(joker)}
                onShowcase={() => handleShowcase(joker)}
                onQuickUpdate={(updates) => handleQuickUpdate(joker, updates)}
                customRarities={customRarities}
                modPrefix={modPrefix}
                showConfirmation={showConfirmation}
              />
            ))}
          </div>
        )}

        {editingJoker && (
          <EditJokerInfo
            isOpen={!!editingJoker}
            joker={editingJoker}
            jokers={jokers}
            onClose={() => setEditingJoker(null)}
            onSave={handleSaveJoker}
            onDelete={handleDeleteJoker}
            customRarities={customRarities}
            modPrefix={modPrefix}
            showConfirmation={showConfirmation}
          />
        )}

        {showRuleBuilder && currentJokerForRules && (
          <Suspense fallback={<RuleBuilderLoading />}>
            <RuleBuilder
              isOpen={showRuleBuilder}
              onClose={() => {
                setShowRuleBuilder(false);
                setCurrentJokerForRules(null);
              }}
              onSave={handleSaveRules}
              existingRules={currentJokerForRules.rules || []}
              item={currentJokerForRules}
              onUpdateItem={handleUpdateJokerFromRuleBuilder}
              itemType="joker"
            />
          </Suspense>
        )}

        {showShowcase && showcaseJoker && (
          <ShowcaseModal
            isOpen={showShowcase}
            joker={showcaseJoker}
            onClose={handleCloseShowcase}
            customRarities={customRarities}
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
                        config.pageData[itemTypes.indexOf("joker")].filter = option.value
                        return ({
                        ...config,
                      })});
                      setSortBy(option.value);
                      setSortDirection(sortDirection)
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

export default JokersPage;
