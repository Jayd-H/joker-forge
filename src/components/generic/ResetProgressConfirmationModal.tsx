import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

interface ResetProgressComfirmationModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onDiscard: () => void;
}

const ResetProgressComfirmationModal: React.FC<ResetProgressComfirmationModalProps> = ({
  isVisible,
  onCancel,
  onDiscard,
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
            className="bg-black-dark border-2 border-black-lighter rounded-xl shadow-2xl min-w-96 max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
           <div className="px-6 py-5 border-b bg-black-darker border-black-lighter/50">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 bg-mint/20 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl text-white-light font-medium tracking-wide">
                    Attention
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-white-darker">
                      You sure you want to create a new mod?
                      you cannot get back to the old save if you do that
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="space-y-3">
                <Button
                  variant="danger"
                  onClick={onDiscard}
                  size="md"
                  className="w-full"
                >
                  Start Fresh
                </Button>
                <Button
                  variant="secondary"
                  onClick={onCancel}
                  size="md"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResetProgressComfirmationModal;
