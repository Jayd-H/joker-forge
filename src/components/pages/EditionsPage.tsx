import React, { useState, useMemo, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import {
  PlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import EditionCard from "./editions/EditionCard";
import EditEditionInfo from "./editions/EditEditionInfo";
import { Suspense, lazy } from "react";
const RuleBuilder = lazy(() => import("../ruleBuilder/RuleBuilder"));
import RuleBuilderLoading from "../generic/RuleBuilderLoading";
import Button from "../generic/Button";
import { exportSingleEdition } from "../codeGeneration/GameObjects/CardsIndex";
import type { Rule } from "../ruleBuilder/types";
import { EditionData, slugify } from "../data/BalatroUtils";
import { UserConfigContext } from "../Contexts";
import { updateGameObjectIds, getObjectName } from "../generic/GameObjectOrdering";


interface EditionsPageProps {
  modName: string;
  editions: EditionData[];
  setEditions: React.Dispatch<React.SetStateAction<EditionData[]>>;
  selectedEditionId: string | null;
  setSelectedEditionId: React.Dispatch<React.SetStateAction<string | null>>;
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
  sortFn: (a: EditionData, b: EditionData) => number;
  ascText: string,
  descText: string,
};

const EditionsPage: React.FC<EditionsPageProps> = ({
  modName,
  editions,
  setEditions,
  selectedEditionId,
  setSelectedEditionId,
  modPrefix,
  showConfirmation,
}) => {
  const { userConfig, setUserConfig } = useContext(UserConfigContext);
  const [editingEdition, setEditingEdition] = useState<EditionData | null>(
    null
  );
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentEditionForRules, setCurrentEditionForRules] =
    useState<EditionData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const itemTypes = userConfig.pageData.map(item => item.objectType)
  const [sortBy, setSortBy] = useState(
        userConfig.pageData[itemTypes.indexOf("edition")].filter ?? "id")
  const [sortDirection, setSortDirection] = useState(
      userConfig.pageData[itemTypes.indexOf("edition")].direction ?? "asc")

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const sortButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortDirectionButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);

  const editData = userConfig.pageData[itemTypes.indexOf("edition")].editList
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
        value: "weight",
        label: "Weight",
        sortFn: (a, b) => (a.weight || 0) - (b.weight || 0),
        ascText: "Low to High",
        descText: "High to Low",
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

  const handleAddNewEdition = async () => {
    const newEdition: EditionData = {
      objectType: "edition",
      id: crypto.randomUUID(),
      name: "New Edition",
      description: "A {C:blue}custom{} edition with {C:red}unique{} effects.",
      objectKey: slugify("New Edition"),
      shader: "foil",
      unlocked: true,
      discovered: true,
      rules: [],
      weight: 0,
      sound: "foil1",
      orderValue: editions.length+1,
    };
    newEdition.objectKey = getObjectName(newEdition,editions,newEdition.objectKey)
    setEditions([...editions, newEdition]);
    setEditingEdition(newEdition);
    handleUpdateEdition(newEdition)
  };

  const handleUpdateEdition = (updatedEdition: EditionData, type?: string, oldKey?: string) => {
    setUserConfig((prevConfig) => {
      const config = prevConfig
      const dataList = config.pageData[itemTypes.indexOf("edition")].editList

      if (oldKey && dataList.includes(oldKey)) {
        config.pageData[itemTypes.indexOf("edition")].editList.splice(dataList.indexOf(oldKey))
      }
      if (dataList.includes(updatedEdition.objectKey)) {
        config.pageData[itemTypes.indexOf("edition")].editList.splice(dataList.indexOf(updatedEdition.objectKey ))
      }

      if (type !== "delete"){
        config.pageData[itemTypes.indexOf("edition")].editList.push(updatedEdition.objectKey)
      }

      return ({
      ...config,
      })
    })
  }

  const handleSaveEdition = (updatedEdition: EditionData) => {
    editions.forEach(edition => {
      if (edition.id === updatedEdition.id) {
        handleUpdateEdition(updatedEdition, "change", edition.objectKey ) 
      }
    })

    setEditions((prev) =>
      prev.map((edition) =>
        edition.id === updatedEdition.id ? updatedEdition : edition
      )
    );
  };

  const handleDeleteEdition = (editionId: string) => {
    const removedEdition = editions.filter(edition => edition.id !== editionId)[0]
    setEditions((prev) => prev.filter((edition) => edition.id !== editionId));

    if (selectedEditionId === editionId) {
      const remainingEditions = editions.filter((edition) => edition.id !== editionId);
      setSelectedEditionId(remainingEditions.length > 0 ? remainingEditions[0].id : null);
      editions = updateGameObjectIds(removedEdition, editions, 'remove', removedEdition.orderValue)
      handleUpdateEdition(removedEdition, "delete")
    }};

  const handleDuplicateEdition = async (edition: EditionData) => {
    const dupeName = slugify(getObjectName(edition,editions))
    const duplicatedEdition: EditionData = {
      ...edition,
      id: crypto.randomUUID(),
      name: edition.name,
      objectKey: `${dupeName}`,
      orderValue: edition.orderValue+1,
    };
    setEditions([...editions, duplicatedEdition]);
    editions = updateGameObjectIds(duplicatedEdition, editions, 'insert', duplicatedEdition.orderValue)
    handleUpdateEdition(duplicatedEdition)
  };

  const handleExportEdition = (edition: EditionData) => {
    try {
      exportSingleEdition(edition);
    } catch (error) {
      console.error("Failed to export edition:", error);
    }
  };

  const handleQuickUpdate = (
    edition: EditionData,
    updates: Partial<EditionData>
  ) => {
    const updatedEdition = { ...edition, ...updates };
    handleSaveEdition(updatedEdition);
  };

  const handleEditInfo = (edition: EditionData) => {
    setEditingEdition(edition);
  };

  const handleEditRules = (edition: EditionData) => {
    setCurrentEditionForRules(edition);
    setShowRuleBuilder(true);
  };

  const handleSaveRules = (rules: Rule[]) => {
    if (currentEditionForRules) {
      const updatedEdition = { ...currentEditionForRules, rules };
      handleSaveEdition(updatedEdition);
    }
    setShowRuleBuilder(false);
    setCurrentEditionForRules(null);
  };

  const handleUpdateEditionFromRuleBuilder = (
    updates: Partial<EditionData>
  ) => {
    if (currentEditionForRules) {
      const updatedEdition = { ...currentEditionForRules, ...updates };
      setCurrentEditionForRules(updatedEdition);
      handleSaveEdition(updatedEdition);
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
      config.pageData[itemTypes.indexOf("edition")].direction = direction
      return ({...config})
    })
  }


  const handleSortMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSortMenu(!showSortMenu);
  };

  const filteredAndSortedEditions = useMemo(() => {
    const filtered = editions.filter((edition) => {
      const matchesSearch =
        edition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        edition.objectKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        edition.description.toLowerCase().includes(searchTerm.toLowerCase());

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
  }, [editions, searchTerm, sortBy, sortOptions, sortDirection]);

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
          Editions
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          {modName}
        </h1>
        <div className="flex justify-center mb-2">
          <Button
            variant="primary"
            onClick={handleAddNewEdition}
            icon={<PlusIcon className="h-5 w-5" />}
            size="md"
            className="shadow-lg hover:shadow-2xl transition-shadow"
          >
            Add New Edition
          </Button>
        </div>
        <div className="flex items-center mb-2">
          <div>
            <div className="flex items-center gap-6 text-white-darker text-sm">
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-mint" />
                {modName} • {filteredAndSortedEditions.length} of{" "}
                {editions.length} edition
                {editions.length !== 1 ? "s" : ""}
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
                placeholder="Search editions by name or description..."
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

        {filteredAndSortedEditions.length === 0 && editions.length > 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Editions Found
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                No editions match your current search criteria. Try adjusting
                your search terms.
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
        ) : filteredAndSortedEditions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <DocumentTextIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Editions Yet :(
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                Create your first edition to get started with editing its
                information and defining its custom rules.
              </p>
              <Button
                variant="primary"
                onClick={handleAddNewEdition}
                icon={<PlusIcon className="h-5 w-5" />}
                fullWidth
              >
                Create Your First Edition
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-14">
            {filteredAndSortedEditions.map((edition) => (
              <EditionCard
                key={edition.id}
                edition={edition}
                editions={editions}
                onEditInfo={() => handleEditInfo(edition)}
                onEditRules={() => handleEditRules(edition)}
                onDelete={() => handleDeleteEdition(edition.id)}
                onDuplicate={() => handleDuplicateEdition(edition)}
                onExport={() => handleExportEdition(edition)}
                onQuickUpdate={(updates) => handleQuickUpdate(edition, updates)}
                modPrefix={modPrefix}
                showConfirmation={showConfirmation}
              />
            ))}
          </div>
        )}

        {editingEdition && (
          <EditEditionInfo
            isOpen={!!editingEdition}
            edition={editingEdition}
            editions={editions}
            onClose={() => setEditingEdition(null)}
            onSave={handleSaveEdition}
            onDelete={handleDeleteEdition}
            modPrefix={modPrefix}
            showConfirmation={showConfirmation}
          />
        )}

        {showRuleBuilder && currentEditionForRules && (
          <Suspense fallback={<RuleBuilderLoading />}>
            <RuleBuilder
              isOpen={showRuleBuilder}
              onClose={() => {
                setShowRuleBuilder(false);
                setCurrentEditionForRules(null);
              }}
              onSave={handleSaveRules}
              existingRules={currentEditionForRules.rules || []}
              item={currentEditionForRules}
              onUpdateItem={handleUpdateEditionFromRuleBuilder}
              itemType="card"
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
                        config.pageData[itemTypes.indexOf("edition")].filter = option.value
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

export default EditionsPage;
