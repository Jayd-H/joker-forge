import React, {
  useState,
  useRef,
  useMemo,
} from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  SwatchIcon,
  ArrowDownTrayIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../generic/Button";
import InputField from "../generic/InputField";
import Modal from "../generic/Modal";
import { validateJokerName } from "../generic/validationUtils";
import { SoundData } from "../data/BalatroUtils";
import { TrashIcon } from "@heroicons/react/24/solid";

interface SoundsPageProps {
  modName: string;
  sounds: SoundData[];
  setSounds: React.Dispatch<React.SetStateAction<SoundData[]>>;
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
interface SoundCardProps {
  sound: SoundData;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onQuickUpdate: (updates: Partial<SoundData>) => void;
}

const SoundCard: React.FC<SoundCardProps> = ({
  sound,
  onEdit,
  onDownload,
  onDelete,
  onDuplicate,
  onQuickUpdate,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [tempKey, setTempKey] = useState(sound.key);

  const handleNameSave = () => {
    const validation = validateJokerName(tempKey);
    if (validation.isValid) {
      onQuickUpdate({ key: tempKey });
      setEditingName(false);
    }
  };

  return (
    <div className=" p-6 relative group">
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 bg-black-dark border-2 border-balatro-red rounded-lg p-2 hover:bg-balatro-redshadow cursor-pointer transition-colors flex items-center justify-center z-10"
      >
        <TrashIcon className="h-4 w-4 text-balatro-red" />
      </button>

      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-[#fff] font-bold text-sm border-2 border-balatro-green bg-balatro-green"
        >
          {sound.key.substring(0, 3).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="mb-2">
            {editingName ? (
              <input
                type="text"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave();
                  if (e.key === "Escape") {
                    setTempKey(sound.key);
                    setEditingName(false);
                  }
                }}
                className="text-xl font-medium text-white-light bg-transparent border-none outline-none border-b-2 border-mint"
                autoFocus
              />
            ) : (
              <h3
                className="text-xl font-medium text-white-light cursor-pointer hover:text-mint transition-colors"
                onClick={() => {
                  setTempKey(sound.key);
                  setEditingName(true);
                }}
              >
                {sound.key}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-white-darker text-sm">Key:</span>
            <span className="text-mint text-sm font-mono">{sound.key}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-black-lighter pt-4">
        <Button
          variant="secondary"
          className="mx-2"
          size="sm"
          onClick={onEdit}
          icon={<PencilIcon className="h-4 w-4" />}
        />
        <Button
          variant="secondary"
          className="mx-2"
          size="sm"
          onClick={onDownload}
          icon={<ArrowDownTrayIcon className="h-4 w-4" />}
        />
        <Button
          variant="secondary"
          className="mx-2"
          size="sm"
          onClick={onDuplicate}
          icon={<DocumentDuplicateIcon className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};

const SoundsPage: React.FC<SoundsPageProps> = ({
  modName,
  sounds,
  setSounds,
  showConfirmation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSound, setEditingSound] = useState<SoundData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<Partial<SoundData>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.name.endsWith('.ogg')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          soundString: reader.result as string
        }))
      };
      reader.readAsDataURL(file);
}};

  const filteredSounds = useMemo(() => {
    return sounds.filter(
      (sound) =>
        sound.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sounds, searchTerm]);

  const handleAddNewSound = () => {
    const newSound: SoundData = {
      id: crypto.randomUUID(),
      key: "new_sound",
      soundString: ""
    };
    setEditingSound(newSound);
    setFormData(newSound);
    setShowEditModal(true);
  };

  const handleEditSound = (sound: SoundData) => {
    setEditingSound(sound);
    setFormData(sound);
    setShowEditModal(true);
  };
  const handleDownloadSound = (sound: SoundData) => {
    const a = document.createElement("a");
    a.href = sound.soundString;
    a.download = "sound.ogg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingSound(null);
    setFormData({});
  };

  const handleSaveSound = () => {
    if (!formData.key?.trim()) return;

    const isEditing =
      editingSound && sounds.find((r) => r.id === editingSound.id);

    const soundToSave: SoundData = {
      id: editingSound?.id || crypto.randomUUID(),
      key: formData.key,
      soundString: formData.soundString || "",
      volume: formData.volume,
      pitch: formData.pitch,
      replace: formData.replace || "",
    };

    if (isEditing) {
      setSounds((prev) =>
        prev.map((r) => (r.id === editingSound.id ? soundToSave : r))
      );
    } else {
      setSounds((prev) => [...prev, soundToSave]);
    }

    closeModal();
  };

  const handleDeleteSound = (sound: SoundData) => {
    showConfirmation({
      type: "danger",
      title: "Delete Custom Sound",
      description: `Are you sure you want to delete the "${sound.key}" Sound? This action cannot be undone.`,
      confirmText: "Delete Sound",
      cancelText: "Keep Sound",
      confirmVariant: "danger",
      onConfirm: () => {
        setSounds((prev) => prev.filter((r) => r.id !== sound.id));
      },
    });
  };

  const handleDuplicateSound = (sound: SoundData) => {
    const duplicated: SoundData = {
      ...sound,
      id: crypto.randomUUID(),
      key: `${sound.key}_copy`,
    };
    setSounds((prev) => [...prev, duplicated]);
  };

  const handleQuickUpdate = (
    sound: SoundData,
    updates: Partial<SoundData>
  ) => {
    const updatedSound = { ...sound, ...updates };
    setSounds((prev) =>
      prev.map((r) => (r.id === sound.id ? updatedSound : r))
    );
  };

  const isEditing =
    editingSound && sounds.find((r) => r.id === editingSound.id);

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Sounds
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          {modName}
        </h1>

        <div className="flex justify-center mb-2">
          <Button
            variant="primary"
            onClick={handleAddNewSound}
            icon={<PlusIcon className="h-5 w-5" />}
            size="md"
            className="shadow-lg hover:shadow-2xl transition-shadow"
          >
            Add New Sound
          </Button>
        </div>

        <div className="flex items-center mb-2">
          <div className="flex items-center gap-6 text-white-darker text-sm">
            <div className="flex items-center">
              <SwatchIcon className="h-4 w-4 mr-2 text-mint" />
              {modName} • {filteredSounds.length} of {sounds.length} sound
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex-1 relative group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white-darker group-focus-within:text-mint transition-colors" />
            <input
              type="text"
              placeholder="Search sounds by name or key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black-darker shadow-2xl border-2 border-black-lighter rounded-lg pl-12 pr-4 py-4 text-white-light tracking-wider placeholder-white-darker focus:outline-none focus:border-mint transition-all duration-200"
            />
          </div>
        </div>

        {filteredSounds.length === 0 && sounds.length > 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <MagnifyingGlassIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Sounds Found
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                No sounds match your current search criteria.
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
        ) : filteredSounds.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="rounded-2xl p-8 max-w-md">
              <SwatchIcon className="h-16 w-16 text-mint opacity-60 mb-4 mx-auto" />
              <h3 className="text-white-light text-xl font-light mb-3">
                No Custom Sounds Yet :(
              </h3>
              <p className="text-white-darker text-sm mb-6 leading-relaxed">
                Create your first custom sound to define sounds to
                in your jokers and consumables.
              </p>
              <Button
                variant="primary"
                onClick={handleAddNewSound}
                icon={<PlusIcon className="h-5 w-5" />}
                fullWidth
              >
                Create Your First Sound
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSounds.map((sound) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                onEdit={() => handleEditSound(sound)}
                onDownload={() => handleDownloadSound(sound)}
                onDelete={() => handleDeleteSound(sound)}
                onDuplicate={() => handleDuplicateSound(sound)}
                onQuickUpdate={(updates) => handleQuickUpdate(sound, updates)}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {showEditModal && (
            <Modal
              isOpen={showEditModal}
              onClose={closeModal}
              title={isEditing ? "Edit Sound" : "Create New Sound"}
              maxWidth="max-w-4xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col lg:flex-row gap-6 p-6">
                  <div className="flex-1 space-y-4">
                    <div className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <audio controls src={`${formData.soundString}`} />
                          <input
                            type="file"
                            accept=".ogg"
                            onChange={handleSoundUpload}
                            className="hidden"
                            ref={fileInputRef}
                          />
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="secondary"
                            className="w-full"
                            size="sm"
                            icon={<MusicalNoteIcon className="h-4 w-4" />}
                          >
                            Upload a Sound
                          </Button>
                          <p className="text-xs text-white-darker ml-97.75 w-40">
                          Only accepts .ogg files                          
                          </p>
                        </div>
                        <InputField
                          label="Sound Key"
                          value={formData.key || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              key: e.target.value,
                            }))
                          }
                          placeholder="e.g. boom"
                        />
                        <p className="text-xs text-white-darker">
                          Unique identifier used in code.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            label="Pitch"
                            value={formData.pitch?.toString() || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                pitch: parseFloat(e.target.value),
                              }))
                            }
                            placeholder="0.7"
                            type="number"
                            size="sm"
                          />
                          <InputField
                            label="Volume"
                            value={formData.volume?.toString() || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                volume: parseFloat(e.target.value),
                              }))
                            }
                            placeholder="0.6"
                            type="number"
                            size="sm"
                          />
                          <InputField
                          label="Replace Sound Key"
                          value={formData.replace || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              replace: e.target.value,
                            }))
                          }
                          placeholder="e.g. win"
                        />
                        <p className="text-xs text-white-darker ml-0 w-50">
                          If you want to replace or add music, add "music" somewhere in the sound key                          
                        </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-4 p-4 bg-black-dark border-t border-black-lighter">
                  <Button
                    variant="secondary"
                    onClick={closeModal}
                    className="mx-auto w-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveSound}
                    className="mx-auto w-full"
                  >
                    {isEditing ? "Save Changes" : "Create Sound"}
                  </Button>
                </div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SoundsPage;
