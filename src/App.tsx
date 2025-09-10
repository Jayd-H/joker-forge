import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  lazy,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PuzzlePieceIcon,
  SwatchIcon,
  CpuChipIcon,
  CakeIcon,
  StarIcon,
  DocumentTextIcon,
  GiftIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// Pages
import OverviewPage from "./components/pages/OverviewPage";
import ModMetadataPage from "./components/pages/ModMetadataPage";

const JokersPage = lazy(() => import("./components/pages/JokersPage"));
const RaritiesPage = lazy(() => import("./components/pages/RaritiesPage"));
const ConsumablesPage = lazy(
  () => import("./components/pages/ConsumablesPage")
);
const DecksPage = lazy(() => import("./components/pages/DecksPage"));
const EditionsPage = lazy(() => import("./components/pages/EditionsPage"));
const BoostersPage = lazy(() => import("./components/pages/BoostersPage"));
const EnhancementsPage = lazy(
  () => import("./components/pages/EnhancementsPage")
);
const SealsPage = lazy(() => import("./components/pages/SealsPage"));

const JokersVanillaReforgedPage = lazy(
  () => import("./components/pages/vanillareforged/JokersVanillaReforgedPage")
);
const ConsumablesVanillaReforgedPage = lazy(
  () =>
    import("./components/pages/vanillareforged/ConsumablesVanillaReforgedPage")
);
const BoostersVanillaReforgedPage = lazy(
  () => import("./components/pages/vanillareforged/BoostersVanillaReforgedPage")
);
const EnhancementsVanillaReforgedPage = lazy(
  () =>
    import("./components/pages/vanillareforged/EnhancementsVanillaReforgedPage")
);
const SealsVanillaReforgedPage = lazy(
  () => import("./components/pages/vanillareforged/SealsVanillaReforgedPage")
);

const AcknowledgementsPage = lazy(
  () => import("./components/pages/AcknowledgementsPage")
);
const NotFoundPage = lazy(() => import("./components/pages/NotFoundPage"));

const KeysPage = lazy(() => import("./components/pages/KeysPage"));

// Core components
import Sidebar from "./components/Sidebar";

// Data and Utils
import {
  ConsumableData,
  JokerData,
  RarityData,
  ConsumableSetData,
  BoosterData,
  updateDataRegistry,
  EnhancementData,
  SealData,
  ModMetadata,
  EditionData,
  SoundData,
} from "./components/data/BalatroUtils";
import Alert from "./components/generic/Alert";
import ConfirmationPopup from "./components/generic/ConfirmationPopup";
import ExportModal from "./components/generic/ExportModal";
import DonationNotification from "./components/generic/DonationNotification";
import RestoreProgressModal from "./components/generic/RestoreProgressModal";
import { DEFAULT_MOD_METADATA } from "./components/pages/ModMetadataPage";
import SkeletonPage from "./components/pages/SkeletonPage";
import { UserConfigProvider } from "./components/Contexts";
import SoundsPage from "./components/pages/SoundPage";
import { scanGameObjectIds } from "./components/pages/JokersPage";
interface AlertState {
  isVisible: boolean;
  type: "success" | "warning" | "error";
  title: string;
  content: string;
}

interface ConfirmationState {
  isVisible: boolean;
  type: "default" | "warning" | "danger" | "success";
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  confirmVariant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AutoSaveData {
  modMetadata: ModMetadata;
  jokers: JokerData[];
  sounds: SoundData[];
  consumables: ConsumableData[];
  customRarities: RarityData[];
  consumableSets: ConsumableSetData[];
  boosters: BoosterData[];
  enhancements: EnhancementData[];
  seals: SealData[];
  editions: EditionData[];
  timestamp: number;
}

const AUTO_SAVE_KEY = "joker-forge-autosave";
const DONATION_DISMISSED_KEY = "joker-forge-donation-dismissed";
const DONATION_SHOW_DELAY = 1000 * 60 * 5; // 5 minutes

const FloatingTabDock: React.FC<{
  activeTab:
    | "jokers"
    | "rarities"
    | "consumables"
    | "boosters"
    | "enhancements"
    | "seals"
    | "editions";
  onTabChange: (
    tab:
      | "jokers"
      | "rarities"
      | "consumables"
      | "boosters"
      | "enhancements"
      | "seals"
      | "editions"
  ) => void;
  isVanillaMode: boolean;
}> = ({ activeTab, onTabChange, isVanillaMode }) => {
  const regularTabs = [
    {
      id: "jokers" as const,
      icon: PuzzlePieceIcon,
      label: "Jokers",
    },
    {
      id: "rarities" as const,
      icon: SwatchIcon,
      label: "Rarities",
    },
  ];

  const vanillaTabs = [
    {
      id: "jokers" as const,
      icon: DocumentTextIcon,
      label: "Jokers",
    },
    {
      id: "consumables" as const,
      icon: CakeIcon,
      label: "Consumables",
    },
    {
      id: "boosters" as const,
      icon: GiftIcon,
      label: "Boosters",
    },
    {
      id: "enhancements" as const,
      icon: StarIcon,
      label: "Enhancements",
    },
    {
      id: "seals" as const,
      icon: CpuChipIcon,
      label: "Seals",
    },
    {
      id: "editions" as const,
      icon: SparklesIcon,
      label: "Editions",
    },
  ];

  const tabs = isVanillaMode ? vanillaTabs : regularTabs;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black-dark border-2 border-black-lighter rounded-full px-3 py-2 shadow-2xl">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative group p-3 rounded-full transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-mint/20 border-2 border-mint text-mint scale-110"
                      : "bg-black-darker/50 border-2 border-black-lighter text-white-darker hover:border-mint hover:text-mint hover:scale-105"
                  }
                `}
                title={tab.label}
              >
                <Icon className="h-5 w-5" />

                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black-darker border border-black-lighter rounded-lg px-2 py-1 whitespace-nowrap">
                    <span className="text-white-light text-xs font-medium">
                      {tab.label}
                    </span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black-lighter"></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentSection = location.pathname.slice(1) || "overview";
  const isExpanded = currentSection === "overview" || currentSection === "";

  const [boosters, setBoosters] = useState<BoosterData[]>([]);
  const [selectedBoosterId, setSelectedBoosterId] = useState<string | null>(
    null
  );

  const [editions, setEditions] = useState<EditionData[]>([]);
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(
    null
  );

  const [modMetadata, setModMetadata] =
    useState<ModMetadata>(DEFAULT_MOD_METADATA);

  const [jokers, setJokers] = useState<JokerData[]>([]);
  const [sounds, setSounds] = useState<SoundData[]>([]);
  const [consumables, setConsumables] = useState<ConsumableData[]>([]);
  const [customRarities, setCustomRarities] = useState<RarityData[]>([]);
  const [consumableSets, setConsumableSets] = useState<ConsumableSetData[]>([]);
  const [enhancements, setEnhancements] = useState<EnhancementData[]>([]);
  const [selectedEnhancementId, setSelectedEnhancementId] = useState<
    string | null
  >(null);
  const [seals, setSeals] = useState<SealData[]>([]);
  const [selectedSealId, setSelectedSealId] = useState<string | null>(null);

  const [selectedJokerId, setSelectedJokerId] = useState<string | null>(null);
  const [selectedConsumableId, setSelectedConsumableId] = useState<
    string | null
  >(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    isVisible: false,
    type: "success",
    title: "",
    content: "",
  });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isVisible: false,
    type: "default",
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [jokersRaritiesTab, setJokersRaritiesTab] = useState<
    "jokers" | "rarities"
  >("jokers");
  const [showDonationNotification, setShowDonationNotification] =
    useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clearStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const donationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevDataRef = useRef<{
    modMetadata: ModMetadata;
    jokers: JokerData[];
    sounds: SoundData[];
    consumables: ConsumableData[];
    customRarities: RarityData[];
    consumableSets: ConsumableSetData[];
    boosters: BoosterData[];
    enhancements: EnhancementData[];
    seals: SealData[];
    editions: EditionData[];
  } | null>(null);

  const showConfirmation = useCallback(
    (options: {
      type?: "default" | "warning" | "danger" | "success";
      title: string;
      description: string;
      confirmText?: string;
      cancelText?: string;
      confirmVariant?: "primary" | "secondary" | "danger";
      icon?: React.ReactNode;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => {
      setConfirmation({
        isVisible: true,
        type: options.type || "default",
        title: options.title,
        description: options.description,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        confirmVariant: options.confirmVariant,
        icon: options.icon,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      });
    },
    []
  );

  const getVanillaActiveTab = ():
    | "jokers"
    | "consumables"
    | "boosters"
    | "enhancements"
    | "seals"
    | "editions" => {
    const path = location.pathname;
    if (path.includes("/vanilla/consumables")) return "consumables";
    if (path.includes("/vanilla/boosters")) return "boosters";
    if (path.includes("/vanilla/enhancements")) return "enhancements";
    if (path.includes("/vanilla/seals")) return "seals";
    if (path.includes("/vanilla/editions")) return "editions";
    return "jokers";
  };

  const isVanillaMode = location.pathname.startsWith("/vanilla");

  const handleTabChange = (
    tab:
      | "jokers"
      | "rarities"
      | "consumables"
      | "boosters"
      | "enhancements"
      | "seals"
      | "editions"
  ) => {
    if (isVanillaMode) {
      navigate(`/vanilla/${tab}`);
    } else {
      setJokersRaritiesTab(tab as "jokers" | "rarities");
    }
  };

  const getActiveTab = () => {
    if (isVanillaMode) {
      return getVanillaActiveTab();
    }
    return jokersRaritiesTab;
  };

  const showFloatingDock = currentSection === "jokers" || isVanillaMode;

  const hideConfirmation = useCallback(() => {
    setConfirmation((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handleConfirm = () => {
    confirmation.onConfirm();
    hideConfirmation();
  };

  const handleCancel = () => {
    if (confirmation.onCancel) {
      confirmation.onCancel();
    }
    hideConfirmation();
  };

  const saveToLocalStorage = useCallback(
    (
      metadata: ModMetadata,
      jokerData: JokerData[],
      soundData: SoundData[],
      consumableData: ConsumableData[],
      raritiesData: RarityData[],
      setsData: ConsumableSetData[],
      boosterData: BoosterData[],
      enhancementsData: EnhancementData[],
      sealsData: SealData[],
      editionsData: EditionData[]
    ) => {
      try {
        const data: AutoSaveData = {
          modMetadata: metadata,
          jokers: scanGameObjectIds(jokerData),
          sounds: soundData,
          consumables: scanGameObjectIds(consumableData),
          customRarities: raritiesData,
          consumableSets: setsData,
          boosters: scanGameObjectIds(boosterData),
          enhancements: scanGameObjectIds(enhancementsData),
          seals: scanGameObjectIds(sealsData),
          editions: scanGameObjectIds(editionsData),
          timestamp: Date.now(),
        };
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
        console.log("Auto-saved project state");
      } catch (error) {
        console.warn("Failed to auto-save:", error);
      }
    },
    []
  );

  useEffect(() => {
    updateDataRegistry(
      customRarities,
      consumableSets,
      consumables,
      boosters,
      enhancements,
      seals,
      editions,
      modMetadata.prefix || ""
    );
  }, [
    customRarities,
    consumableSets,
    consumables,
    boosters,
    enhancements,
    seals,
    editions,
    modMetadata.prefix,
  ]);

  useEffect(() => {
    const checkDonationDismissal = () => {
      const stored = localStorage.getItem(DONATION_DISMISSED_KEY);
      if (!stored) return false;

      try {
        const dismissData = JSON.parse(stored);
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        return dismissData.timestamp > oneWeekAgo;
      } catch {
        localStorage.removeItem(DONATION_DISMISSED_KEY);
        return false;
      }
    };

    const isDonationDismissed = checkDonationDismissal();

    if (!isDonationDismissed) {
      donationTimerRef.current = setTimeout(() => {
        setShowDonationNotification(true);
      }, DONATION_SHOW_DELAY);
    }

    return () => {
      if (donationTimerRef.current) {
        clearTimeout(donationTimerRef.current);
      }
    };
  }, []);

  const handleDonationClose = () => {
    setShowDonationNotification(false);
  };

  const handleDonationDonate = () => {
    window.open("https://ko-fi.com/jaydchw", "_blank");
    setShowDonationNotification(false);
  };

  const handleDonationDismissTemporarily = () => {
    const dismissData = {
      dismissed: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(DONATION_DISMISSED_KEY, JSON.stringify(dismissData));
    setShowDonationNotification(false);
  };

  const loadFromLocalStorage = useCallback((): {
    modMetadata: ModMetadata;
    jokers: JokerData[];
    sounds: SoundData[];
    consumables: ConsumableData[];
    customRarities: RarityData[];
    consumableSets: ConsumableSetData[];
    boosters: BoosterData[];
    enhancements: EnhancementData[];
    seals: SealData[];
    editions: EditionData[];
  } | null => {
    try {
      const savedData = localStorage.getItem(AUTO_SAVE_KEY);
      if (!savedData) return null;

      const data: AutoSaveData = JSON.parse(savedData);

      if (!data.modMetadata || !Array.isArray(data.jokers)) {
        console.warn("Invalid auto-save data structure");
        localStorage.removeItem(AUTO_SAVE_KEY);
        return null;
      }

      console.log("Loaded auto-saved project state");
      return {
        modMetadata: data.modMetadata,
        jokers: data.jokers,
        sounds: data.sounds,
        consumables: data.consumables || [],
        customRarities: data.customRarities || [],
        consumableSets: data.consumableSets || [],
        boosters: data.boosters || [],
        enhancements: data.enhancements || [],
        editions: data.editions || [],
        seals: data.seals || [],
      };
    } catch (error) {
      console.warn("Failed to load auto-save:", error);
      localStorage.removeItem(AUTO_SAVE_KEY);
      return null;
    }
  }, []);

  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
      console.log("Cleared auto-save data");
    } catch (error) {
      console.warn("Failed to clear auto-save:", error);
    }
  }, []);

  const getAutoSaveMetadata = useCallback((): {
    timestamp: number;
    daysOld: number;
  } | null => {
    try {
      const savedData = localStorage.getItem(AUTO_SAVE_KEY);
      if (!savedData) return null;

      const data: AutoSaveData = JSON.parse(savedData);
      const daysOld = (Date.now() - data.timestamp) / (24 * 60 * 60 * 1000);

      return {
        timestamp: data.timestamp,
        daysOld: Math.floor(daysOld * 10) / 10,
      };
    } catch {
      return null;
    }
  }, []);

  const hasDataChanged = useCallback(
    (
      metadata: ModMetadata,
      jokerData: JokerData[],
      soundData: SoundData[],
      consumableData: ConsumableData[],
      raritiesData: RarityData[],
      setsData: ConsumableSetData[],
      boosterData: BoosterData[],
      enhancementsData: EnhancementData[],
      sealsData: SealData[],
      editionsData: EditionData[]
    ) => {
      if (!prevDataRef.current) return true;

      const prevData = prevDataRef.current;
      return (
        JSON.stringify(prevData.modMetadata) !== JSON.stringify(metadata) ||
        JSON.stringify(prevData.jokers) !== JSON.stringify(jokerData) ||
        JSON.stringify(prevData.sounds) !== JSON.stringify(soundData) ||
        JSON.stringify(prevData.consumables) !==
          JSON.stringify(consumableData) ||
        JSON.stringify(prevData.customRarities) !==
          JSON.stringify(raritiesData) ||
        JSON.stringify(prevData.consumableSets) !== JSON.stringify(setsData) ||
        JSON.stringify(prevData.boosters) !== JSON.stringify(boosterData) ||
        JSON.stringify(prevData.enhancements) !==
          JSON.stringify(enhancementsData) ||
        JSON.stringify(prevData.seals) !== JSON.stringify(sealsData) ||
        JSON.stringify(prevData.editions) !== JSON.stringify(editionsData)
      );
    },
    []
  );

  const isDataDifferentFromDefaults = useCallback(
    (
      metadata: ModMetadata,
      jokerData: JokerData[],
      soundData: SoundData[],
      consumableData: ConsumableData[],
      raritiesData: RarityData[],
      setsData: ConsumableSetData[],
      boosterData: BoosterData[],
      enhancementsData: EnhancementData[],
      sealsData: SealData[],
      editionsData: EditionData[]
    ) => {
      if (
        jokerData.length > 0 ||
        soundData.length > 0 ||
        consumableData.length > 0 ||
        raritiesData.length > 0 ||
        setsData.length > 0 ||
        boosterData.length > 0 ||
        enhancementsData.length > 0 ||
        sealsData.length > 0 ||
        editionsData.length > 0
      )
        return true;

      const defaultMetadata = DEFAULT_MOD_METADATA;

      const significantFields: (keyof ModMetadata)[] = [
        "name",
        "author",
        "description",
        "id",
        "prefix",
      ];

      for (const field of significantFields) {
        if (
          JSON.stringify(metadata[field]) !==
          JSON.stringify(defaultMetadata[field])
        ) {
          return true;
        }
      }

      return false;
    },
    []
  );

  const debouncedSave = useCallback(
    (
      metadata: ModMetadata,
      jokerData: JokerData[],
      soundData: SoundData[],
      consumableData: ConsumableData[],
      raritiesData: RarityData[],
      setsData: ConsumableSetData[],
      boosterData: BoosterData[],
      enhancementsData: EnhancementData[],
      sealsData: SealData[],
      editionsData: EditionData[]
    ) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveToLocalStorage(
          metadata,
          jokerData,
          soundData,
          consumableData,
          raritiesData,
          setsData,
          boosterData,
          enhancementsData,
          sealsData,
          editionsData
        );
      }, 500);
    },
    [saveToLocalStorage]
  );

  useEffect(() => {
    const loadAutoSave = () => {
      const savedData = loadFromLocalStorage();
      if (savedData) {
        setShowRestoreModal(true);
      }
      setHasLoadedInitialData(true);
    };

    loadAutoSave();
  }, [loadFromLocalStorage]);

  useEffect(() => {
    if (!hasLoadedInitialData) return;

    if (
      !isDataDifferentFromDefaults(
        modMetadata,
        jokers,
        sounds,
        consumables,
        customRarities,
        consumableSets,
        boosters,
        enhancements,
        seals,
        editions
      )
    )
      return;

    if (
      !hasDataChanged(
        modMetadata,
        jokers,
        sounds,
        consumables,
        customRarities,
        consumableSets,
        boosters,
        enhancements,
        seals,
        editions
      )
    )
      return;

    prevDataRef.current = {
      modMetadata,
      jokers,
      sounds,
      consumables,
      customRarities,
      consumableSets,
      boosters,
      enhancements,
      seals,
      editions,
    };

    setAutoSaveStatus("saving");

    debouncedSave(
      modMetadata,
      jokers,
      sounds,
      consumables,
      customRarities,
      consumableSets,
      boosters,
      enhancements,
      seals,
      editions
    );

    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    if (clearStatusTimeoutRef.current) {
      clearTimeout(clearStatusTimeoutRef.current);
    }

    statusTimeoutRef.current = setTimeout(() => {
      setAutoSaveStatus("saved");
    }, 400);

    clearStatusTimeoutRef.current = setTimeout(() => {
      setAutoSaveStatus("idle");
    }, 1000);

    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      if (clearStatusTimeoutRef.current) {
        clearTimeout(clearStatusTimeoutRef.current);
      }
    };
  }, [
    modMetadata,
    jokers,
    sounds,
    consumables,
    customRarities,
    consumableSets,
    boosters,
    enhancements,
    seals,
    editions,
    hasLoadedInitialData,
    debouncedSave,
    hasDataChanged,
    isDataDifferentFromDefaults,
  ]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      if (clearStatusTimeoutRef.current) {
        clearTimeout(clearStatusTimeoutRef.current);
      }
      if (donationTimerRef.current) {
        clearTimeout(donationTimerRef.current);
      }
    };
  }, []);

  // this is bad but i am tired
  const handleRestoreAutoSave = async () => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      try {
        // Dynamically import normalization function
        const { normalizeImportedModData } = await import(
          "./components/JSONImportExport"
        );

        const normalizedData = normalizeImportedModData({
          metadata: savedData.modMetadata,
          jokers: savedData.jokers,
          sounds: savedData.sounds,
          consumables: savedData.consumables,
          customRarities: savedData.customRarities,
          consumableSets: savedData.consumableSets,
          boosters: savedData.boosters,
          enhancements: savedData.enhancements,
          seals: savedData.seals,
          editions: savedData.editions,
        });

        setModMetadata(normalizedData.metadata);
        setJokers(normalizedData.jokers);
        setSounds(normalizedData.sounds)
        setConsumables(normalizedData.consumables);
        setCustomRarities(normalizedData.customRarities);
        setConsumableSets(normalizedData.consumableSets);
        setBoosters(normalizedData.boosters);
        setEnhancements(normalizedData.enhancements);
        setSeals(normalizedData.seals);
        setEditions(normalizedData.editions);

        setSelectedJokerId(null);
        setSelectedConsumableId(null);
        setSelectedBoosterId(null);
        setSelectedEnhancementId(null);
        setSelectedSealId(null);
        setSelectedEditionId(null);

        prevDataRef.current = {
          modMetadata: normalizedData.metadata,
          jokers: normalizedData.jokers,
          sounds: normalizedData.sounds,
          consumables: normalizedData.consumables,
          customRarities: normalizedData.customRarities,
          consumableSets: normalizedData.consumableSets,
          boosters: normalizedData.boosters,
          enhancements: normalizedData.enhancements,
          seals: normalizedData.seals,
          editions: normalizedData.editions,
        };

        showAlert(
          "success",
          "Project Restored",
          "Your auto-saved project has been restored successfully!"
        );
      } catch (error) {
        console.error("Failed to restore autosave due to invalid data:", error);
        showAlert(
          "error",
          "Restore Failed",
          "The auto-saved data is corrupted and could not be restored. Starting a fresh project."
        );
        clearAutoSave();
      }
    }
    setShowRestoreModal(false);
  };

  const handleDiscardAutoSave = () => {
    clearAutoSave();
    setShowRestoreModal(false);
  };

  const showAlert = (
    type: "success" | "warning" | "error",
    title: string,
    content: string
  ) => {
    setAlert({
      isVisible: true,
      type,
      title,
      content,
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, isVisible: false }));
  };

  const handleNavigate = (section: string) => {
    navigate(`/${section}`);
  };

  const handleExport = async () => {
    if (
      !modMetadata.author ||
      modMetadata.author.length === 0 ||
      !modMetadata.author[0].trim()
    ) {
      showAlert(
        "error",
        "Export Failed",
        "Please enter an author name before exporting."
      );
      return;
    }

    if (!modMetadata.name.trim()) {
      showAlert(
        "error",
        "Export Failed",
        "Please enter a mod name before exporting."
      );
      return;
    }

    const invalidJokers = jokers.filter((j) => !j.name || !j.id);
    const invalidConsumables = consumables.filter((c) => !c.name || !c.id);
    const invalidBoosters = boosters.filter((b) => !b.name || !b.id);
    const invalidEnhancements = enhancements.filter((e) => !e.name || !e.id);
    const invalidSeals = seals.filter((s) => !s.name || !s.id);
    const invalidEditions = editions.filter((e) => !e.name || !e.id);

    if (
      invalidJokers.length > 0 ||
      invalidConsumables.length > 0 ||
      invalidBoosters.length > 0 ||
      invalidEnhancements.length > 0 ||
      invalidSeals.length > 0 ||
      invalidEditions.length > 0
    ) {
      showAlert(
        "error",
        "Export Failed",
        `Some items are missing required fields (name/id). Please check all items before exporting.`
      );
      return;
    }

    setExportLoading(true);
    try {
      // Dynamically import the export function
      const { exportModCode } = await import(
        "./components/codeGeneration/entry"
      );

      await exportModCode(
        jokers,
        sounds,
        consumables,
        modMetadata,
        customRarities,
        consumableSets,
        boosters,
        enhancements,
        seals,
        editions
      );
      setShowExportModal(true);
    } catch (error) {
      console.error("Export failed:", error);

      let errorMessage = "Failed to export mod files. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Missing required metadata")) {
          errorMessage =
            "Missing required metadata fields. Please check your mod information.";
        } else if (error.message.includes("Cannot read properties")) {
          errorMessage =
            "Some mod items have missing or invalid data. Please check all fields are filled correctly.";
        }
      }

      showAlert("error", "Export Failed", errorMessage);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const { exportModAsJSON } = await import("./components/JSONImportExport");

      exportModAsJSON(
        modMetadata,
        jokers,
        sounds,
        customRarities,
        consumables,
        consumableSets,
        boosters,
        enhancements,
        seals,
        editions
      );
      showAlert(
        "success",
        "Mod Saved",
        "Your mod has been saved as a jokerforge file!"
      );
    } catch (error) {
      console.error("JSON export failed:", error);
      showAlert(
        "error",
        "Save Failed",
        "Failed to save mod as JSON. Please try again."
      );
    }
  };

  const handleImportJSON = async () => {
    try {
      // Dynamically import the import functions
      const { importModFromJSON, normalizeImportedModData } = await import(
        "./components/JSONImportExport"
      );

      const importedData = await importModFromJSON();
      if (importedData) {
        const normalizedData = normalizeImportedModData(importedData);

        setModMetadata(normalizedData.metadata);
        setJokers(normalizedData.jokers);
        setSounds(normalizedData.sounds);
        setConsumables(normalizedData.consumables);
        setCustomRarities(normalizedData.customRarities);
        setConsumableSets(normalizedData.consumableSets);
        setBoosters(normalizedData.boosters);
        setEnhancements(normalizedData.enhancements || []);
        setSeals(normalizedData.seals || []);
        setEditions(normalizedData.editions || []);
        setSounds(normalizedData.sounds)
        setSelectedJokerId(null);
        setSelectedConsumableId(null);
        setSelectedBoosterId(null);
        setSelectedEnhancementId(null);
        setSelectedSealId(null);
        setSelectedEditionId(null);
        prevDataRef.current = {
          modMetadata: normalizedData.metadata,
          jokers: normalizedData.jokers,
          sounds: normalizedData.sounds,
          consumables: normalizedData.consumables,
          customRarities: normalizedData.customRarities,
          consumableSets: normalizedData.consumableSets,
          boosters: normalizedData.boosters,
          enhancements: normalizedData.enhancements || [],
          seals: normalizedData.seals || [],
          editions: normalizedData.editions || [],
        };
        showAlert(
          "success",
          "Mod Imported",
          "Your mod has been imported successfully!"
        );
      }
    } catch (error) {
      console.error("JSON import failed:", error);
      showAlert(
        "error",
        "Import Failed",
        "Failed to import mod. Please check the file format and try again."
      );
    }
  };

  return (
    <div className="h-screen bg-black-darker flex overflow-hidden">
      <Sidebar
        selectedSection={currentSection}
        onSectionChange={handleNavigate}
        projectName={modMetadata.id || "mycustommod"}
        onExport={handleExport}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        exportLoading={exportLoading}
        jokers={jokers}
        modName={modMetadata.name}
        authorName={modMetadata.author.join(", ")}
      />
      <motion.div
        className="flex-1 flex flex-col overflow-y-auto custom-scrollbar"
        animate={{
          marginLeft: isExpanded ? 0 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <OverviewPage
                jokerCount={jokers.length}
                jokers={jokers}
                modName={modMetadata.name}
                authorName={modMetadata.author.join(", ")}
                metadata={modMetadata}
                setMetadata={setModMetadata}
                onExport={handleExport}
                onNavigate={handleNavigate}
              />
            }
          />
          <Route
            path="/overview"
            element={
              <OverviewPage
                jokerCount={jokers.length}
                jokers={jokers}
                modName={modMetadata.name}
                authorName={modMetadata.author.join(", ")}
                metadata={modMetadata}
                setMetadata={setModMetadata}
                onExport={handleExport}
                onNavigate={handleNavigate}
              />
            }
          />
          <Route
            path="/metadata"
            element={
              <Suspense fallback={<SkeletonPage variant="metadata" />}>
                <ModMetadataPage
                  metadata={modMetadata}
                  setMetadata={setModMetadata}
                />
              </Suspense>
            }
          />
          <Route
            path="/jokers"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                {jokersRaritiesTab === "jokers" ? (
                  <JokersPage
                    modName={modMetadata.name}
                    jokers={jokers}
                    setJokers={setJokers}
                    selectedJokerId={selectedJokerId}
                    setSelectedJokerId={setSelectedJokerId}
                    customRarities={customRarities}
                    modPrefix={modMetadata.prefix || ""}
                    showConfirmation={showConfirmation}
                  />
                ) : (
                  <RaritiesPage
                    modName={modMetadata.name}
                    rarities={customRarities}
                    setRarities={setCustomRarities}
                    showConfirmation={showConfirmation}
                  />
                )}
              </Suspense>
            }
          />
          <Route
            path="/sounds"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={false}
                    showFilters={true}
                  />
                }
              >
                <SoundsPage
                  modName={modMetadata.name}
                  sounds={sounds}
                  setSounds={setSounds}
                  showConfirmation={showConfirmation}
                />
              </Suspense>
            }
          />
          <Route
            path="/consumables"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <ConsumablesPage
                  modName={modMetadata.name}
                  consumables={consumables}
                  setConsumables={setConsumables}
                  selectedConsumableId={selectedConsumableId}
                  setSelectedConsumableId={setSelectedConsumableId}
                  modPrefix={modMetadata.prefix || ""}
                  consumableSets={consumableSets}
                  setConsumableSets={setConsumableSets}
                  showConfirmation={showConfirmation}
                />
              </Suspense>
            }
          />
          <Route
            path="/boosters"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <BoostersPage
                  modName={modMetadata.name}
                  boosters={boosters}
                  setBoosters={setBoosters}
                  selectedBoosterId={selectedBoosterId}
                  setSelectedBoosterId={setSelectedBoosterId}
                  modPrefix={modMetadata.prefix || ""}
                  showConfirmation={showConfirmation}
                  consumableSets={consumableSets}
                />
              </Suspense>
            }
          />
          <Route
            path="/enhancements"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <EnhancementsPage
                  modName={modMetadata.name}
                  enhancements={enhancements}
                  setEnhancements={setEnhancements}
                  selectedEnhancementId={selectedEnhancementId}
                  setSelectedEnhancementId={setSelectedEnhancementId}
                  modPrefix={modMetadata.prefix || ""}
                  showConfirmation={showConfirmation}
                />
              </Suspense>
            }
          />
          <Route
            path="/seals"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <SealsPage
                  modName={modMetadata.name}
                  seals={seals}
                  setSeals={setSeals}
                  selectedSealId={selectedSealId}
                  setSelectedSealId={setSelectedSealId}
                  modPrefix={modMetadata.prefix || ""}
                  showConfirmation={showConfirmation}
                />
              </Suspense>
            }
          />
          <Route path="/decks" element={<DecksPage />} />
          <Route
            path="/editions"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <EditionsPage
                  modName={modMetadata.name}
                  editions={editions}
                  setEditions={setEditions}
                  selectedEditionId={selectedEditionId}
                  setSelectedEditionId={setSelectedEditionId}
                  modPrefix={modMetadata.prefix || ""}
                  showConfirmation={showConfirmation}
                />
              </Suspense>
            }
          />
          <Route
            path="/vanilla/jokers"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <JokersVanillaReforgedPage
                  onDuplicateToProject={(item) => {
                    setJokers([...jokers, item as JokerData]);
                  }}
                  onNavigateToJokers={() => {
                    navigate("/jokers");
                  }}
                />
              </Suspense>
            }
          />
          <Route
            path="/vanilla/consumables"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <ConsumablesVanillaReforgedPage
                  onDuplicateToProject={(item) => {
                    setConsumables([...consumables, item as ConsumableData]);
                  }}
                  onNavigateToConsumables={() => {
                    navigate("/consumables");
                  }}
                />
              </Suspense>
            }
          />
          <Route
            path="/vanilla/boosters"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <BoostersVanillaReforgedPage
                  onDuplicateToProject={(item) => {
                    setBoosters([...boosters, item as BoosterData]);
                  }}
                  onNavigateToBoosters={() => {
                    navigate("/boosters");
                  }}
                />
              </Suspense>
            }
          />
          <Route
            path="/vanilla/enhancements"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <EnhancementsVanillaReforgedPage
                  onDuplicateToProject={(item) => {
                    setEnhancements([...enhancements, item as EnhancementData]);
                  }}
                  onNavigateToEnhancements={() => {
                    navigate("/enhancements");
                  }}
                />
              </Suspense>
            }
          />
          <Route
            path="/vanilla/seals"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <SealsVanillaReforgedPage
                  onDuplicateToProject={(item) => {
                    setSeals([...seals, item as SealData]);
                  }}
                  onNavigateToSeals={() => {
                    navigate("/seals");
                  }}
                />
              </Suspense>
            }
          />
          <Route
            path="/vanilla"
            element={
              <Suspense
                fallback={
                  <SkeletonPage
                    variant="grid"
                    showFloatingDock={true}
                    showFilters={true}
                  />
                }
              >
                <JokersVanillaReforgedPage
                  onDuplicateToProject={(item) => {
                    setJokers([...jokers, item as JokerData]);
                  }}
                  onNavigateToJokers={() => {
                    navigate("/jokers");
                  }}
                />
              </Suspense>
            }
          />

          <Route path="/acknowledgements" element={<AcknowledgementsPage />} />
          <Route path="*" element={<NotFoundPage />} />

          <Route
            path="/keys"
            element={
              <Suspense fallback={<SkeletonPage variant="grid" />}>
                <KeysPage />
              </Suspense>
            }
          />
          <Route
            path="/keys/:section"
            element={
              <Suspense fallback={<SkeletonPage variant="grid" />}>
                <KeysPage />
              </Suspense>
            }
          />
        </Routes>
      </motion.div>

      {showFloatingDock && (
        <FloatingTabDock
          activeTab={getActiveTab()}
          onTabChange={handleTabChange}
          isVanillaMode={isVanillaMode}
        />
      )}

      <DonationNotification
        isVisible={showDonationNotification}
        onClose={handleDonationClose}
        onDonate={handleDonationDonate}
        onDismissTemporarily={handleDonationDismissTemporarily}
      />

      <AnimatePresence>
        {autoSaveStatus !== "idle" && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                autoSaveStatus === "saving"
                  ? "bg-mint-darker text-white-light border border-mint-dark"
                  : "bg-mint-light text-black-dark border border-mint-lighter"
              }`}
            >
              {autoSaveStatus === "saving" ? "Auto-saving..." : "Auto-saved"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RestoreProgressModal
        isVisible={showRestoreModal}
        onRestore={handleRestoreAutoSave}
        onDiscard={handleDiscardAutoSave}
        getAutoSaveMetadata={getAutoSaveMetadata}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      <Alert
        isVisible={alert.isVisible}
        type={alert.type}
        title={alert.title}
        content={alert.content}
        onClose={hideAlert}
      />

      <ConfirmationPopup
        isVisible={confirmation.isVisible}
        type={confirmation.type}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        confirmVariant={confirmation.confirmVariant}
        icon={confirmation.icon}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

function App() {
  return (
    <UserConfigProvider>
      <Router>
        <AppContent />
      </Router>
    </UserConfigProvider>
  );
}

export default App;
