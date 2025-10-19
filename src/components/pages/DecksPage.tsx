import React, { useState, useMemo, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import {
  PlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import DeckCard from "./decks/DeckCard";
import EditDeckInfo from "./decks/EditDeckInfo";
import { Suspense, lazy } from "react";
const RuleBuilder = lazy(() => import("../ruleBuilder/RuleBuilder"));
import RuleBuilderLoading from "../generic/RuleBuilderLoading";
import Button from "../generic/Button";
import { exportSingleDeck } from "../codeGeneration/Decks/index";
import type { Rule } from "../ruleBuilder/types";
import { DeckData, slugify } from "../data/BalatroUtils";
import { UserConfigContext } from "../Contexts";
import { updateGameObjectIds, getObjectName } from "../generic/GameObjectOrdering";


interface DecksPageProps {
  modName: string;
  decks: DeckData[];
  setDecks: React.Dispatch<React.SetStateAction<DeckData[]>>;
  selectedDeckId: string | null;
  setSelectedDeckId: React.Dispatch<React.SetStateAction<string | null>>;
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
  sortFn: (a: DeckData, b: DeckData) => number;
  ascText: string,
  descText: string,
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

const getRandomPlaceholderDeck = async (): Promise<{
  imageData: string;
  creditIndex?: number;
}> => {
  if (upscaledPlaceholders && upscaledPlaceholders.length > 0) {
    const randomIndex = Math.floor(Math.random() * upscaledPlaceholders.length);
    const imagePath = availablePlaceholders?.[randomIndex];
    const match = imagePath?.match(/placeholder-deck-(\d+)\.png/);
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
      /placeholder-deck-(\d+)\.png/
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
    const imagePath = `/images/placeholderdecks/placeholder-deck-${counter}.png`;

    if (await checkImage(imagePath)) {
      placeholders.push(imagePath);
      counter++;
    } else {
      keepChecking = false;
    }
  }

  availablePlaceholders = placeholders;

  if (placeholders.length === 0) {
    return { imageData: "/images/placeholder-deck.png" };
  }

  const upscaled = await Promise.all(
    placeholders.map((placeholder) => upscaleImage(placeholder))
  );
  upscaledPlaceholders = upscaled;

  const randomIndex = Math.floor(Math.random() * upscaled.length);
  const match = placeholders[randomIndex].match(/placeholder-deck-(\d+)\.png/);
  const imageNumber = match ? parseInt(match[1], 15) : 1;

  return {
    imageData: upscaled[randomIndex],
    creditIndex: imageNumber,
  };
};

const isPlaceholderDeck = (imagePath: string): boolean => {
  return (
    imagePath.includes("/images/placeholderdecks/") ||
    imagePath.includes("placeholder-deck")
  );
};

const DecksPage: React.FC<DecksPageProps> = ({
  modName,
  decks,
  setDecks,
  selectedDeckId,
  setSelectedDeckId,
  modPrefix,
  showConfirmation,
}) => {
  const {userConfig, setUserConfig} = useContext(UserConfigContext) 
  const [editingDeck, setEditingDeck] = useState<DeckData | null>(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentDeckForRules, setCurrentDeckForRules] =
    useState<DeckData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
    const itemTypes = userConfig.pageData.map(item => item.objectType)
    const [sortBy, setSortBy] = useState(
          userConfig.pageData[itemTypes.indexOf("deck")].filter ?? "id")
    const [sortDirection, setSortDirection] = useState(
        userConfig.pageData[itemTypes.indexOf("deck")].direction ?? "asc")
    
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [sortMenuPosition, setSortMenuPosition] = useState({
      top: 0,
      left: 0,
      width: 0,
    });

  const sortButtonRef = React.useRef<HTMLButtonElement>(null);
    const sortDirectionButtonRef = React.useRef<HTMLButtonElement>(null);
    const sortMenuRef = React.useRef<HTMLDivElement>(null);
  
    const editData = userConfig.pageData[itemTypes.indexOf("deck")].editList
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

  const handleAddNewDeck = async () => {
    const placeholderResult = await getRandomPlaceholderDeck();

    const newDeck: DeckData = {
      objectType: "deck",
      id: crypto.randomUUID(),
      name: "New Deck",
      description: "A {C:blue}custom{} deck with[s]{C:red}unique{} effects.",
      imagePreview: placeholderResult.imageData,
      objectKey: slugify("New Deck"),
      unlocked: true,
      discovered: true,
      rules: [],
      placeholderCreditIndex: placeholderResult.creditIndex,
      orderValue: decks.length+1,
    };
    newDeck.objectKey = getObjectName(newDeck,decks,newDeck.objectKey)
    setDecks([...decks, newDeck]);
    setEditingDeck(newDeck);
  };

  const handleSaveDeck = (updatedDeck: DeckData) => {
    setDecks((prev) =>
      prev.map((deck) => (deck.id === updatedDeck.id ? updatedDeck : deck))
    );
  };

  const handleDeleteDeck = (deckId: string) => {
    const removedDeck = decks.filter(deck => deck.id !== deckId)[0]
    setDecks((prev) => prev.filter((deck) => deck.id !== deckId));

    if (selectedDeckId === deckId) {const remainingDecks = decks.filter((deck) => deck.id !== deckId);
      setSelectedDeckId(remainingDecks.length > 0 ? remainingDecks[0].id : null);
    decks = updateGameObjectIds(removedDeck, decks, 'remove', removedDeck.orderValue)
  }};

  const handleDuplicateDeck = async (deck: DeckData) => {
    const dupeName = getObjectName(deck,decks)
    if (isPlaceholderDeck(deck.imagePreview)) {
      const placeholderResult = await getRandomPlaceholderDeck();
      const duplicatedDeck: DeckData = {
        ...deck,
        id: crypto.randomUUID(),
        name: deck.name,
        imagePreview: placeholderResult.imageData,
        placeholderCreditIndex: placeholderResult.creditIndex,
        objectKey: slugify(`${dupeName}`),
        Config_consumables: deck.Config_consumables,
        Config_vouchers: deck.Config_vouchers,
        orderValue: deck.orderValue +1,
      };
      setDecks([...decks, duplicatedDeck]);
      decks = updateGameObjectIds(duplicatedDeck, decks, 'insert', duplicatedDeck.orderValue)
    } else {
      const duplicatedDeck: DeckData = {
        ...deck,
        id: crypto.randomUUID(),
        name: `${dupeName}`,
        objectKey: slugify(`${dupeName}`),
        orderValue: deck.orderValue +1,
      };
      setDecks([...decks, duplicatedDeck]);
      decks = updateGameObjectIds(duplicatedDeck, decks, 'insert', duplicatedDeck.orderValue)
    }
  };

  const handleExportDeck = (deck: DeckData) => {
    try {
      exportSingleDeck(deck);
    } catch (error) {
      console.error("Failed to export deck:", error);
    }
  };

  const handleQuickUpdate = (deck: DeckData, updates: Partial<DeckData>) => {
    const updatedDeck = { ...deck, ...updates };
    handleSaveDeck(updatedDeck);
  };

  const handleEditInfo = (deck: DeckData) => {
    setEditingDeck(deck);
  };

  const handleEditRules = (deck: DeckData) => {
    setCurrentDeckForRules(deck);
    setShowRuleBuilder(true);
  };

  const handleSaveRules = (rules: Rule[]) => {
    if (currentDeckForRules) {
      const updatedDeck = { ...currentDeckForRules, rules };
      handleSaveDeck(updatedDeck);
    }
    setShowRuleBuilder(false);
    setCurrentDeckForRules(null);
  };

  const handleUpdateDeckFromRuleBuilder = (updates: Partial<DeckData>) => {
    if (currentDeckForRules) {
      const updatedDeck = { ...currentDeckForRules, ...updates };
      setCurrentDeckForRules(updatedDeck);
      handleSaveDeck(updatedDeck);
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
      config.pageData[itemTypes.indexOf("deck")].direction = direction
      return ({...config})
    })
  }

  const handleSortMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSortMenu(!showSortMenu);
  };

  const filteredAndSortedDecks = useMemo(() => {
    const filtered = decks.filter((deck) => {
      const matchesSearch =
        deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.objectKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.description.toLowerCase().includes(searchTerm.toLowerCase());
 
       return matchesSearch;
     });
 
     const currentSort = sortOptions.find((option) => option.value === sortBy);
     if (currentSort) {
       filtered.sort(currentSort.sortFn);
       if (sortDirection === "desc") {
         filtered.reverse()
       }
     }
 
     return filtered;
   }, [decks, searchTerm, sortBy, sortOptions, sortDirection]);
 
   const currentSortMethod = sortOptions.find((option) => option.value === sortBy) 
 
   const currentSortLabel =
     sortOptions.find((option) => option.value === sortBy)?.label ||
     "Id Value (Most to Least)";
 
   const currentSortDirectionLabel =
     currentSortMethod ? (sortDirection === "asc" ? currentSortMethod.ascText : currentSortMethod.descText) :
     "Least to Most";
     
  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Decks
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          {modName}
        </h1>
        <div className="flex justify-center mb-2">
          <Button
            variant="primary"
            onClick={handleAddNewDeck}
            icon={<PlusIcon className="h-5 w-5" />}
            size="md"
            className="shadow-lg hover:shadow-2xl transition-shadow"
          >
            Add New Deck
          </Button>
        </div>
        <div className="flex items-center mb-2">
          <div>
            <div className="flex items-center gap-6 text-white-darker text-sm">
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-mint" />
                {modName} • {filteredAndSortedDecks.length} of {decks.length}{" "}
                deck{decks.length !== 1 ? "s" : ""}
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
                placeholder="Search decks by name or description..."
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

        {filteredAndSortedDecks.length === 0 && decks.length > 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Decks Found
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                No decks match your current search criteria. Try adjusting your
                search terms.
              </p>
              <Button
                variant="secondary"
                onClick={() => setSearchTerm("")}
                fullWidth
              >
                Clear Search
              </Button>
            </div>
          </div>
        ) : filteredAndSortedDecks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <DocumentTextIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Decks Yet :(
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                Create your first deck to get started with editing its
                information and defining its custom rules.
              </p>
              <Button
                variant="primary"
                onClick={handleAddNewDeck}
                icon={<PlusIcon className="h-5 w-5" />}
                fullWidth
              >
                Create Your First Deck
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-14">
            {filteredAndSortedDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                decks={decks}
                onEditInfo={() => handleEditInfo(deck)}
                onEditRules={() => handleEditRules(deck)}
                onDelete={() => handleDeleteDeck(deck.id)}
                onDuplicate={() => handleDuplicateDeck(deck)}
                onExport={() => handleExportDeck(deck)}
                onQuickUpdate={(updates) => handleQuickUpdate(deck, updates)}
                showConfirmation={showConfirmation}
              />
            ))}
          </div>
        )}

        {editingDeck && (
          <EditDeckInfo
            isOpen={!!editingDeck}
            deck={editingDeck}
            decks={decks}
            onClose={() => setEditingDeck(null)}
            onSave={handleSaveDeck}
            onDelete={handleDeleteDeck}
            modPrefix={modPrefix}
            showConfirmation={showConfirmation}
          />
        )}

        {showRuleBuilder && currentDeckForRules && (
          <Suspense fallback={<RuleBuilderLoading />}>
            <RuleBuilder
              isOpen={showRuleBuilder}
              onClose={() => {
                setShowRuleBuilder(false);
                setCurrentDeckForRules(null);
              }}
              onSave={handleSaveRules}
              existingRules={currentDeckForRules.rules || []}
              item={currentDeckForRules}
              onUpdateItem={handleUpdateDeckFromRuleBuilder as (updates: Partial<any>) => void}
              itemType="deck"
            />
          </Suspense>
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
                        config.pageData[itemTypes.indexOf("deck")].filter = option.value
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

export default DecksPage;

