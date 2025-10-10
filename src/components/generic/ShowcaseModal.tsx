import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import BalatroCard from "../generic/BalatroCard";
import {
  JokerData,
  getRarityDisplayName,
  getRarityBadgeColor,
  RarityData,
  UserVariable,
} from "../data/BalatroUtils";
import { getAllVariables } from "../codeGeneration/Jokers/variableUtils";
import { toPng } from "html-to-image";

interface ShowcaseModalProps {
  isOpen: boolean;
  joker: JokerData;
  onClose: () => void;
  customRarities?: RarityData[];
}

const isStrInt = function (str: string) {
  const num = Number(str);
  return !isNaN(num) && Number.isInteger(num);
};

const VariableDisplay = (variable: UserVariable) => {
  if (variable.type === "suit") return variable.initialSuit || "Spades";
  if (variable.type === "rank") return variable.initialRank || "Ace";
  if (variable.type === "pokerhand")
    return variable.initialPokerHand || "High Card";
  return variable.initialValue?.toString() || "0";
};

const getVars = function (joker: JokerData): string[] {
  const Varlist: UserVariable[] = getAllVariables(joker);
  const varValues = Varlist.map(VariableDisplay);
  return varValues;
};

const parse_string = function (joker: JokerData) {
  const line = joker.description;
  const listofVars = getVars(joker);
  let parsed_line: string = "";
  let inVar = false;

  for (let i = 0; i < line.length; i++) {
    const char1: string = line.substring(i, i + 1) || "";
    const char2: string = line.substring(i + 1, i + 2) || "";
    const char3: string = line.substring(i + 2, i + 3) || "";

    if (inVar && isStrInt(char1)) {
      // Skip numeric characters when inside variable
    } else if (inVar && char1 == "#") {
      inVar = false;
    } else {
      if (char1 == "#" && isStrInt(char2) && char3 == "#") {
        parsed_line += listofVars[Number(char2) - 1];
        inVar = true;
      } else {
        parsed_line += char1;
      }
    }
  }
  return parsed_line;
};

const ShowcaseModal: React.FC<ShowcaseModalProps> = ({
  isOpen,
  joker,
  onClose,
  customRarities = [],
}) => {
  const showcaseRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = async () => {
    if (!showcaseRef.current) return;
    
    try {

      const dataUrl = await toPng(showcaseRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#1a1a2e",
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `${joker.name.replace(/[^a-z0-9]/gi, "_")}_showcase.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download showcase:", error);
      alert(
        "Screenshot failed. Please use your browser's screenshot feature instead."
      );
    }
  };

  const allVariables = getAllVariables(joker);
  const VariableDisplay = (variable: UserVariable) => {
    if (variable.type === "suit") return variable.initialSuit || "Spades";
    if (variable.type === "rank") return variable.initialRank || "Ace";
    if (variable.type === "pokerhand")
      return variable.initialPokerHand || "High Card";
    return variable.initialValue?.toString() || "0";
  };
  const VariableValues = allVariables.map(VariableDisplay);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-lexend"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="bg-black-dark border-2 border-black-lighter rounded-xl shadow-2xl overflow-hidden w-1/3 h-3/4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b bg-black-darker border-black-lighter/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 bg-black-darker rounded-lg">
                    <CameraIcon className="h-5 w-5 text-mint" />
                  </div>
                  <h2 className="text-xl text-white-light font-medium tracking-wide">
                    {joker.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-mint text-black-dark hover:bg-mint-light font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-white-darker hover:text-white-light hover:bg-black-lighter rounded-lg transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={showcaseRef}
              className="relative flex flex-col justify-center items-center p-8"
              style={{
                backgroundImage: "url('/images/background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: "#1a1a2e",
                height: "calc(100% - 73px)",
                width: "100%",
              }}
            >
              <div className="absolute top-4 left-4 z-20">
                <p className="text-[#fff] text-xs font-mono font-bold">
                  made with jokerforge.jaydchw.com
                </p>
              </div>

              <div className="flex justify-center items-center h-full -mt-32">
                <BalatroCard
                  type="joker"
                  data={{
                    id: joker.id,
                    name: joker.name,
                    description: parse_string(joker),
                    imagePreview: joker.imagePreview,
                    overlayImagePreview: joker.overlayImagePreview,
                    cost: joker.cost,
                    rarity: joker.rarity,
                    locVars: {
                      vars: VariableValues,
                    },
                  }}
                  size="lg"
                  rarityName={getRarityDisplayName(
                    joker.rarity,
                    customRarities
                  )}
                  rarityColor={getRarityBadgeColor(
                    joker.rarity,
                    customRarities
                  )}
                  showCost={true}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShowcaseModal;
