import React, { useState, useMemo, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import {
  PlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import VoucherCard from "./vouchers/VoucherCard";
import EditVoucherInfo from "./vouchers/EditVoucherInfo";
import { Suspense, lazy } from "react";
const RuleBuilder = lazy(() => import("../ruleBuilder/RuleBuilder"));
import RuleBuilderLoading from "../generic/RuleBuilderLoading";
import Button from "../generic/Button";
import { exportSingleVoucher } from "../codeGeneration/Vouchers/index";
import type { Rule } from "../ruleBuilder/types";
import { VoucherData, slugify } from "../data/BalatroUtils";
import { UserConfigContext } from "../Contexts";
import { updateGameObjectIds, getObjectName } from "../generic/GameObjectOrdering";


interface VouchersPageProps {
  modName: string;
  vouchers: VoucherData[];
  setVouchers: React.Dispatch<React.SetStateAction<VoucherData[]>>;
  selectedVoucherId: string | null;
  setSelectedVoucherId: React.Dispatch<React.SetStateAction<string | null>>;
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
  sortFn: (a: VoucherData, b: VoucherData) => number;
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

const getRandomPlaceholderVoucher = async (): Promise<{
  imageData: string;
  creditIndex?: number;
}> => {
  if (upscaledPlaceholders && upscaledPlaceholders.length > 0) {
    const randomIndex = Math.floor(Math.random() * upscaledPlaceholders.length);
    const imagePath = availablePlaceholders?.[randomIndex];
    const match = imagePath?.match(/placeholder-voucher-(\d+)\.png/);
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
      /placeholder-voucher-(\d+)\.png/
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
    const imagePath = `/images/placeholdervouchers/placeholder-voucher-${counter}.png`;

    if (await checkImage(imagePath)) {
      placeholders.push(imagePath);
      counter++;
    } else {
      keepChecking = false;
    }
  }

  availablePlaceholders = placeholders;

  if (placeholders.length === 0) {
    return { imageData: "/images/placeholder-voucher.png" };
  }

  const upscaled = await Promise.all(
    placeholders.map((placeholder) => upscaleImage(placeholder))
  );
  upscaledPlaceholders = upscaled;

  const randomIndex = Math.floor(Math.random() * upscaled.length);
  const match = placeholders[randomIndex].match(/placeholder-voucher-(\d+)\.png/);
  const imageNumber = match ? parseInt(match[1], 15) : 1;

  return {
    imageData: upscaled[randomIndex],
    creditIndex: imageNumber,
  };
};

const isPlaceholderVoucher = (imagePath: string): boolean => {
  return (
    imagePath.includes("/images/placeholdervouchers/") ||
    imagePath.includes("placeholder-voucher")
  );
};

const VouchersPage: React.FC<VouchersPageProps> = ({
  modName,
  vouchers,
  setVouchers,
  selectedVoucherId,
  setSelectedVoucherId,
  modPrefix,
  showConfirmation,
}) => {
  const {userConfig, setUserConfig} = useContext(UserConfigContext) 
  const [editingVoucher, setEditingVoucher] = useState<VoucherData | null>(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentVoucherForRules, setCurrentVoucherForRules] =
    useState<VoucherData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(userConfig.filters.vouchersFilter ?? "name-id-desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const sortButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);

  const sortOptions: SortOption[] = useMemo(
    () => [
      {
        value: "id-desc",
        label: "Id Value (Most to Least)",
        sortFn: (a, b) => b.orderValue - a.orderValue,
      },
      {
        value: "id-asc",
        label: "Id Value (Least to Most)",
        sortFn: (a, b) => a.orderValue - b.orderValue,
      },
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
        value: "rules-desc",
        label: "Rules (Most to Least)",
        sortFn: (a, b) => (b.rules?.length || 0) - (a.rules?.length || 0),
      },
      {
        value: "rules-asc",
        label: "Rules (Least to Most)",
        sortFn: (a, b) => (a.rules?.length || 0) - (b.rules?.length || 0),
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
      {
        value: "rules-desc",
        label: "Rules (Most to Least)",
        sortFn: (a, b) => (b.rules?.length || 0) - (a.rules?.length || 0),
      },
      {
        value: "rules-asc",
        label: "Rules (Least to Most)",
        sortFn: (a, b) => (a.rules?.length || 0) - (b.rules?.length || 0),
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

  const handleAddNewVoucher = async () => {
    const placeholderResult = await getRandomPlaceholderVoucher();

    const newVoucher: VoucherData = {
      objectType: "voucher",
      id: crypto.randomUUID(),
      name: "New Voucher",
      description: "A {C:blue}custom{} voucher with {C:red}unique{} effects.",
      unlockDescription: "Unlocked by default.",
      imagePreview: placeholderResult.imageData,
      objectKey: slugify("New Voucher"),
      unlocked: true,
      discovered: true,
      rules: [],
      placeholderCreditIndex: placeholderResult.creditIndex,
      orderValue: vouchers.length+1,
    };
    newVoucher.objectKey = getObjectName(newVoucher,vouchers,newVoucher.objectKey)
    setVouchers([...vouchers, newVoucher]);
    setEditingVoucher(newVoucher);
  };

  const handleSaveVoucher = (updatedVoucher: VoucherData) => {
    setVouchers((prev) =>
      prev.map((voucher) => (voucher.id === updatedVoucher.id ? updatedVoucher : voucher))
    );
  };

  const handleDeleteVoucher = (voucherId: string) => {
    const removedVoucher = vouchers.filter(voucher => voucher.id !== voucherId)[0]
    setVouchers((prev) => prev.filter((voucher) => voucher.id !== voucherId));

    if (selectedVoucherId === voucherId) {const remainingVouchers = vouchers.filter((voucher) => voucher.id !== voucherId);
      setSelectedVoucherId(remainingVouchers.length > 0 ? remainingVouchers[0].id : null);
    vouchers = updateGameObjectIds(removedVoucher, vouchers, 'remove', removedVoucher.orderValue)
  }};

  const handleDuplicateVoucher = async (voucher: VoucherData) => {
    const dupeName = getObjectName(voucher,vouchers)
    if (isPlaceholderVoucher(voucher.imagePreview)) {
      const placeholderResult = await getRandomPlaceholderVoucher();
      const duplicatedVoucher: VoucherData = {
        ...voucher,
        id: crypto.randomUUID(),
        name: voucher.name,
        imagePreview: placeholderResult.imageData,
        placeholderCreditIndex: placeholderResult.creditIndex,
        objectKey: slugify(`${dupeName}`),
        orderValue: voucher.orderValue +1,
      };
      setVouchers([...vouchers, duplicatedVoucher]);
      vouchers = updateGameObjectIds(duplicatedVoucher, vouchers, 'insert', duplicatedVoucher.orderValue)
    } else {
      const duplicatedVoucher: VoucherData = {
        ...voucher,
        id: crypto.randomUUID(),
        name: `${dupeName}`,
        objectKey: slugify(`${dupeName}`),
        orderValue: voucher.orderValue +1,
      };
      setVouchers([...vouchers, duplicatedVoucher]);
      vouchers = updateGameObjectIds(duplicatedVoucher, vouchers, 'insert', duplicatedVoucher.orderValue)
    }
  };

  const handleExportVoucher = (voucher: VoucherData) => {
    try {
      exportSingleVoucher(voucher);
    } catch (error) {
      console.error("Failed to export voucher:", error);
    }
  };

  const handleQuickUpdate = (voucher: VoucherData, updates: Partial<VoucherData>) => {
    const updatedVoucher = { ...voucher, ...updates };
    handleSaveVoucher(updatedVoucher);
  };

  const handleEditInfo = (voucher: VoucherData) => {
    setEditingVoucher(voucher);
  };

  const handleEditRules = (voucher: VoucherData) => {
    setCurrentVoucherForRules(voucher);
    setShowRuleBuilder(true);
  };

  const handleSaveRules = (rules: Rule[]) => {
    if (currentVoucherForRules) {
      const updatedVoucher = { ...currentVoucherForRules, rules };
      handleSaveVoucher(updatedVoucher);
    }
    setShowRuleBuilder(false);
    setCurrentVoucherForRules(null);
  };

  const handleUpdateVoucherFromRuleBuilder = (updates: Partial<VoucherData>) => {
    if (currentVoucherForRules) {
      const updatedVoucher = { ...currentVoucherForRules, ...updates };
      setCurrentVoucherForRules(updatedVoucher);
      handleSaveVoucher(updatedVoucher);
    }
  };

  const handleSortMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSortMenu(!showSortMenu);
  };

  const filteredAndSortedVouchers = useMemo(() => {
    const filtered = vouchers.filter((voucher) => {
      const matchesSearch =
        voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    const currentSort = sortOptions.find((option) => option.value === sortBy);
    if (currentSort) {
      filtered.sort(currentSort.sortFn);
    }

    return filtered;
  }, [vouchers, searchTerm, sortBy, sortOptions]);

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ||
    "Id Value (Most to Least)";

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Vouchers
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          {modName}
        </h1>
        <div className="flex justify-center mb-2">
          <Button
            variant="primary"
            onClick={handleAddNewVoucher}
            icon={<PlusIcon className="h-5 w-5" />}
            size="md"
            className="shadow-lg hover:shadow-2xl transition-shadow"
          >
            Add New Voucher
          </Button>
        </div>
        <div className="flex items-center mb-2">
          <div>
            <div className="flex items-center gap-6 text-white-darker text-sm">
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-mint" />
                {modName} • {filteredAndSortedVouchers.length} of {vouchers.length}{" "}
                voucher{vouchers.length !== 1 ? "s" : ""}
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
                placeholder="Search vouchers by name or description..."
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
            </div>
          </div>
        </div>

        {filteredAndSortedVouchers.length === 0 && vouchers.length > 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Vouchers Found
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                No vouchers match your current search criteria. Try adjusting your
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
        ) : filteredAndSortedVouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <DocumentTextIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Vouchers Yet :(
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                Create your first voucher to get started with editing its
                information and defining its custom rules.
              </p>
              <Button
                variant="primary"
                onClick={handleAddNewVoucher}
                icon={<PlusIcon className="h-5 w-5" />}
                fullWidth
              >
                Create Your First Voucher
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-14">
            {filteredAndSortedVouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                vouchers={vouchers}
                onEditInfo={() => handleEditInfo(voucher)}
                onEditRules={() => handleEditRules(voucher)}
                onDelete={() => handleDeleteVoucher(voucher.id)}
                onDuplicate={() => handleDuplicateVoucher(voucher)}
                onExport={() => handleExportVoucher(voucher)}
                onQuickUpdate={(updates) => handleQuickUpdate(voucher, updates)}
                showConfirmation={showConfirmation}
              />
            ))}
          </div>
        )}

        {editingVoucher && (
          <EditVoucherInfo
            isOpen={!!editingVoucher}
            voucher={editingVoucher}
            vouchers={vouchers}
            onClose={() => setEditingVoucher(null)}
            onSave={handleSaveVoucher}
            onDelete={handleDeleteVoucher}
            modPrefix={modPrefix}
            showConfirmation={showConfirmation}
          />
        )}

        {showRuleBuilder && currentVoucherForRules && (
          <Suspense fallback={<RuleBuilderLoading />}>
            <RuleBuilder
              isOpen={showRuleBuilder}
              onClose={() => {
                setShowRuleBuilder(false);
                setCurrentVoucherForRules(null);
              }}
              onSave={handleSaveRules}
              existingRules={currentVoucherForRules.rules || []}
              item={currentVoucherForRules}
              onUpdateItem={handleUpdateVoucherFromRuleBuilder as (updates: Partial<any>) => void}
              itemType="voucher"
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
                      setUserConfig(prevConfig => ({
                        ...prevConfig,
                        filters: {
                          ...prevConfig.filters,
                          vouchersFilter: option.value
                        }
                      }))
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

export default VouchersPage;
