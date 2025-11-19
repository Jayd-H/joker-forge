import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";

interface ErrorPopupProps {
  isVisible: boolean;
  onRetry: () => void;
  onSaveFile: () => void;
  onStartNew: () => void
}

const autoSaveLoadErrorPopup: React.FC<ErrorPopupProps> = ({
  isVisible,
  onRetry,
  onSaveFile,
  onStartNew,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black-darker/60 backdrop-blur-sm flex items-center justify-center z-[9999] font-lexend p-4"
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
            className={`
              bg-black border-balatro-mult
              backdrop-blur-md border-2 rounded-xl shadow-2xl
              p-6 min-w-96 max-w-md w-full
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gap-4 mb-6">
              <div className="flex justify-center">
                <ExclamationTriangleIcon
                  className="
                  h-35 w-35 border-4
                  rounded-lg text-balatro-red 
                  bg-black-darker border-balatro-redshadow"
                />
              </div>
              <div className="mt-6">
                <h3
                  className={`text-balatro-red text-xl text-center tracking-widest mb-3`}
                >
                  Error: Failed to Load Auto Save
                </h3>
                <p
                  className={`text-white text-center font-medium leading-relaxed`}
                >
                  The autosave file for you mod could not be fully processed. 
                  You may either try again, download a copy of the jokerforge file, 
                  or start a new project.
                </p>
              </div>
            </div>

            <div className="py-2 px-4">
              <Button
                variant="secondary"
                onClick={onRetry}
                size="md"
                className="w-full mb-3"
              >
                Retry Loading Save Data
              </Button>
              <Button
                variant="secondary"
                onClick={onSaveFile}
                size="md"
                className="w-full mb-3"
              >
                Download JokerForge File
              </Button>
              <Button
                variant="danger"
                onClick={onStartNew}
                size="md"
                className="w-full"
              >
                Start New Project
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default autoSaveLoadErrorPopup;
