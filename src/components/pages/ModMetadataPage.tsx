import { useEffect, useState, useCallback, useRef } from "react";
import {
  DocumentTextIcon,
  TagIcon,
  CodeBracketIcon,
  HashtagIcon,
  ClockIcon,
  ShieldCheckIcon,
  CubeIcon,
  PaintBrushIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import InputField from "../generic/InputField";
import Button from "../generic/Button";
import { ModMetadata } from "../data/BalatroUtils";
import Checkbox from "../generic/Checkbox";

interface ModMetadataValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_MOD_METADATA: ModMetadata = {
  id: "mycustommod",
  name: "My Custom Mod",
  author: ["Anonymous"],
  description: "Custom jokers created with Joker Forge",
  prefix: "mycustom",
  main_file: "main.lua",
  version: "1.0.0",
  priority: 0,
  badge_colour: "666665",
  badge_text_colour: "FFFFFF",
  display_name: "My Custom Mod",
  dependencies: ["Steamodded (>=1.0.0~BETA-0711a)"],
  conflicts: [],
  provides: [],
  iconImage: "/images/modicon.png",
  hasUserUploadedIcon: false,
};

const validateModMetadata = (metadata: ModMetadata): ModMetadataValidation => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!metadata.id) {
    errors.id = "Mod ID is required";
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(metadata.id)) {
    errors.id =
      "Mod ID must start with a letter and contain only letters, numbers, and underscores";
  } else if (["Steamodded", "Lovely", "Balatro"].includes(metadata.id)) {
    errors.id = "Mod ID cannot be 'Steamodded', 'Lovely', or 'Balatro'";
  }

  if (!metadata.name || !metadata.name.trim()) {
    errors.name = "Mod name is required";
  }

  if (
    !metadata.author ||
    metadata.author.length === 0 ||
    !metadata.author[0] ||
    !metadata.author[0].trim()
  ) {
    errors.author = "At least one author is required";
  }

  if (!metadata.description || !metadata.description.trim()) {
    errors.description = "Description is required";
  }

  if (!metadata.prefix) {
    errors.prefix = "Prefix is required";
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(metadata.prefix)) {
    errors.prefix =
      "Prefix must start with a letter and contain only letters, numbers, and underscores";
  }

  if (!metadata.main_file) {
    errors.main_file = "Main file is required";
  } else if (!metadata.main_file.endsWith(".lua")) {
    errors.main_file = "Main file must end with .lua extension";
  }

  if (metadata.version && !/^\d+\.\d+\.\d+.*$/.test(metadata.version)) {
    warnings.version = "Version should follow format (major).(minor).(patch)";
  }

  if (
    metadata.badge_colour &&
    !/^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(metadata.badge_colour)
  ) {
    warnings.badge_colour =
      "Badge colour should be a valid hex color (6 or 8 digits)";
  }

  if (
    metadata.badge_text_colour &&
    !/^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(metadata.badge_text_colour)
  ) {
    warnings.badge_text_colour =
      "Badge text colour should be a valid hex color (6 or 8 digits)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

const generateModIdFromName = (name: string): string => {
  return (
    name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "")
      .replace(/^[0-9]+/, "") || "mycustommod"
  );
};

const generatePrefixFromId = (id: string): string => {
  return id.toLowerCase().substring(0, 8);
};

const parseAuthorsString = (authorsString: string): string[] => {
  return authorsString
    .split(",")
    .map((author) => author.trim())
    .filter((author) => author.length > 0);
};

const formatAuthorsString = (authors: string[]): string => {
  return (authors || []).join(", ");
};

const parseDependenciesString = (dependenciesString: string): string[] => {
  return dependenciesString
    .split("\n")
    .map((dep) => dep.trim())
    .filter((dep) => dep.length > 0);
};

const formatDependenciesString = (dependencies: string[]): string => {
  return (dependencies || []).join("\n");
};

interface ModMetadataPageProps {
  metadata: ModMetadata;
  setMetadata: (metadata: ModMetadata) => void;
}

const ModMetadataPage: React.FC<ModMetadataPageProps> = ({
  metadata,
  setMetadata,
}) => {
  const [authorsString, setAuthorsString] = useState(
    formatAuthorsString(metadata.author)
  );
  const [dependenciesString, setDependenciesString] = useState(
    formatDependenciesString(metadata.dependencies)
  );
  const [conflictsString, setConflictsString] = useState(
    formatDependenciesString(metadata.conflicts)
  );
  const [providesString, setProvidesString] = useState(
    formatDependenciesString(metadata.provides)
  );
  const [hasInitialized, setHasInitialized] = useState(false);

  const previousNameRef = useRef(metadata.name);
  const metadataRef = useRef(metadata);

  useEffect(() => {
    metadataRef.current = metadata;
  });

  useEffect(() => {
    if (!hasInitialized) {
      const needsDefaults =
        !metadata.id ||
        !metadata.name ||
        !metadata.author ||
        !Array.isArray(metadata.author) ||
        metadata.author.length === 0 ||
        !metadata.description ||
        !metadata.prefix ||
        !metadata.main_file ||
        !metadata.version ||
        typeof metadata.priority !== "number" ||
        !metadata.badge_colour ||
        !metadata.badge_text_colour ||
        !metadata.display_name ||
        !metadata.dependencies ||
        !Array.isArray(metadata.dependencies) ||
        !metadata.conflicts ||
        !Array.isArray(metadata.conflicts) ||
        !metadata.provides ||
        !Array.isArray(metadata.provides);

      if (needsDefaults) {
        setMetadata({
          id: metadata.id || DEFAULT_MOD_METADATA.id,
          name: metadata.name || DEFAULT_MOD_METADATA.name,
          author:
            Array.isArray(metadata.author) && metadata.author.length > 0
              ? metadata.author
              : DEFAULT_MOD_METADATA.author,
          description: metadata.description || DEFAULT_MOD_METADATA.description,
          prefix: metadata.prefix || DEFAULT_MOD_METADATA.prefix,
          main_file: metadata.main_file || DEFAULT_MOD_METADATA.main_file,
          version: metadata.version || DEFAULT_MOD_METADATA.version,
          priority:
            typeof metadata.priority === "number"
              ? metadata.priority
              : DEFAULT_MOD_METADATA.priority,
          badge_colour:
            metadata.badge_colour || DEFAULT_MOD_METADATA.badge_colour,
          badge_text_colour:
            metadata.badge_text_colour ||
            DEFAULT_MOD_METADATA.badge_text_colour,
          display_name:
            metadata.display_name ||
            metadata.name ||
            DEFAULT_MOD_METADATA.display_name,
          dependencies: Array.isArray(metadata.dependencies)
            ? metadata.dependencies
            : DEFAULT_MOD_METADATA.dependencies,
          conflicts: Array.isArray(metadata.conflicts)
            ? metadata.conflicts
            : DEFAULT_MOD_METADATA.conflicts,
          provides: Array.isArray(metadata.provides)
            ? metadata.provides
            : DEFAULT_MOD_METADATA.provides,
        });
      }
      setHasInitialized(true);
    }
  }, [metadata, setMetadata, hasInitialized]);

  const updateMetadata = useCallback(
    (updates: Partial<ModMetadata>) => {
      setMetadata({ ...metadataRef.current, ...updates });
    },
    [setMetadata]
  );

  useEffect(() => {
    const currentMetadata = metadataRef.current;

    if (
      currentMetadata.name &&
      currentMetadata.name !== DEFAULT_MOD_METADATA.name &&
      currentMetadata.name !== previousNameRef.current
    ) {
      previousNameRef.current = currentMetadata.name;

      const generatedId = generateModIdFromName(currentMetadata.name);
      const generatedPrefix = generatePrefixFromId(generatedId);

      if (
        currentMetadata.id !== generatedId ||
        currentMetadata.prefix !== generatedPrefix ||
        currentMetadata.display_name !== currentMetadata.name
      ) {
        setMetadata({
          ...currentMetadata,
          id: generatedId,
          prefix: generatedPrefix,
          display_name: currentMetadata.name,
        });
      }
    }
  }, [metadata.name, setMetadata]);

  const validation = validateModMetadata(metadata);

  const handleAuthorsChange = (value: string) => {
    setAuthorsString(value);
    updateMetadata({ author: parseAuthorsString(value) });
  };

  const handleDependenciesChange = (value: string) => {
    setDependenciesString(value);
    updateMetadata({ dependencies: parseDependenciesString(value) });
  };

  const handleConflictsChange = (value: string) => {
    setConflictsString(value);
    updateMetadata({ conflicts: parseDependenciesString(value) });
  };

  const handleProvidesChange = (value: string) => {
    setProvidesString(value);
    updateMetadata({ provides: parseDependenciesString(value) });
  };

  const processModIconImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      img.onload = () => {
        canvas.width = 34;
        canvas.height = 34;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, 34, 34);

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const isValidHexColor = (color: string) =>
    /^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(color);

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Mod Metadata
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-8 text-center">
          {metadata.name || ""}
        </h1>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-lg text-white-light font-medium mb-6 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-mint" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputField
                value={metadata.name || ""}
                onChange={(e) => updateMetadata({ name: e.target.value })}
                placeholder="My Custom Mod"
                darkmode={true}
                icon={
                  <DocumentTextIcon className="h-5 w-5 text-mint stroke-2" />
                }
                label="Mod Name"
              />
              {validation.errors.name && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.name}
                </p>
              )}
            </div>

            <div>
              <InputField
                value={metadata.id || ""}
                onChange={(e) => updateMetadata({ id: e.target.value })}
                placeholder="mycustommod"
                darkmode={true}
                icon={<HashtagIcon className="h-5 w-5 text-mint stroke-2" />}
                label="Mod ID"
              />
              {validation.errors.id && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.id}
                </p>
              )}
              <p className="text-white-darker text-xs mt-1">
                Must be unique, start with letter, alphanumeric + underscore
                only
              </p>
            </div>

            <div>
              <InputField
                value={authorsString}
                onChange={(e) => handleAuthorsChange(e.target.value)}
                placeholder="Anonymous"
                darkmode={true}
                label="Authors"
              />
              {validation.errors.author && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.author}
                </p>
              )}
              <p className="text-white-darker text-xs mt-1">
                Separate multiple authors with commas
              </p>
            </div>

            <div>
              <InputField
                value={metadata.prefix || ""}
                onChange={(e) => updateMetadata({ prefix: e.target.value })}
                placeholder="mycustom"
                darkmode={true}
                icon={<TagIcon className="h-5 w-5 text-mint stroke-2" />}
                label="Prefix"
              />
              {validation.errors.prefix && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.prefix}
                </p>
              )}
              <p className="text-white-darker text-xs mt-1">
                Added to all object keys, must be unique
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-white-light text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={metadata.description || ""}
                onChange={(e) =>
                  updateMetadata({ description: e.target.value })
                }
                placeholder="Custom jokers created with Joker Forge"
                className="w-full h-24 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none"
              />
              {validation.errors.description && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.description}
                </p>
              )}
            </div>

            <div>
              <InputField
                value={metadata.main_file || ""}
                onChange={(e) => updateMetadata({ main_file: e.target.value })}
                placeholder="main.lua"
                darkmode={true}
                icon={
                  <CodeBracketIcon className="h-5 w-5 text-mint stroke-2" />
                }
                label="Main File"
              />
              {validation.errors.main_file && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.errors.main_file}
                </p>
              )}
            </div>
          </div>
        </div>
        <div>
          <Checkbox
            id="a"
            label="Disable Vanilla Jokers"
            checked={metadata.disable_vanilla ?? false} // Assuming metadataRef holds the latest state
            onChange={(e) => {
              updateMetadata({ disable_vanilla: e });
            }}
          />
          <p className="text-xs text-white-darker mt-2">
            Jimbo may still appear
          </p>
        </div>

        <div className="border-t border-black-light pt-8">
          <h2 className="text-lg text-white-light font-medium mb-6 flex items-center gap-2">
            <PaintBrushIcon className="h-5 w-5 text-mint" />
            Appearance & Display
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <InputField
                value={metadata.display_name || ""}
                onChange={(e) =>
                  updateMetadata({ display_name: e.target.value })
                }
                placeholder={metadata.name || "Short name for badge"}
                darkmode={true}
                icon={<TagIcon className="h-5 w-5 text-mint stroke-2" />}
                label="Display Name"
              />
              <p className="text-white-darker text-xs mt-1">
                Shown on mod badge, defaults to mod name
              </p>
            </div>

            <div>
              <InputField
                value={metadata.badge_colour || ""}
                onChange={(e) =>
                  updateMetadata({ badge_colour: e.target.value })
                }
                placeholder="666665"
                darkmode={true}
                icon={<span className="text-mint">#</span>}
                label="Badge Color"
              />
              {validation.warnings.badge_colour && (
                <p className="text-yellow-400 text-xs mt-1">
                  {validation.warnings.badge_colour}
                </p>
              )}
              <p className="text-white-darker text-xs mt-1">
                Hex color without #
              </p>
            </div>

            <div>
              <InputField
                value={metadata.badge_text_colour || ""}
                onChange={(e) =>
                  updateMetadata({ badge_text_colour: e.target.value })
                }
                placeholder="FFFFFF"
                darkmode={true}
                icon={<span className="text-mint">#</span>}
                label="Badge Text Color"
              />
              {validation.warnings.badge_text_colour && (
                <p className="text-yellow-400 text-xs mt-1">
                  {validation.warnings.badge_text_colour}
                </p>
              )}
              <p className="text-white-darker text-xs mt-1">
                Hex color without #
              </p>
            </div>
          </div>

          <div className=" p-4">
            <div className="flex justify-center">
              <div
                className="px-3 py-1 rounded text-2xl font-bold border"
                style={{
                  backgroundColor: isValidHexColor(metadata.badge_colour || "")
                    ? `#${metadata.badge_colour}`
                    : "#666665",
                  color: isValidHexColor(metadata.badge_text_colour || "")
                    ? `#${metadata.badge_text_colour}`
                    : "#FFFFFF",
                  borderColor: isValidHexColor(metadata.badge_colour || "")
                    ? `#${metadata.badge_colour}`
                    : "#666665",
                }}
              >
                {metadata.display_name ||
                  (metadata.name && metadata.name.substring(0, 8)) ||
                  "MOD"}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-black-lighter pt-6 mt-6">
          <h4 className="text-white-light font-medium text-sm mb-4 tracking-wider flex items-center gap-2">
            <PhotoIcon className="h-4 w-4 text-mint" />
            MOD ICON (34x34px)
          </h4>
          <div className="flex flex-col items-center">
            <div className="w-34 h-34 rounded-lg flex flex-col items-center justify-center relative">
              {metadata.iconImage ? (
                <img
                  src={metadata.iconImage}
                  alt="Mod Icon"
                  className="w-24 h-24 object-contain rounded"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <>
                  <PhotoIcon className="h-8 w-8 text-white-darker mb-2" />
                  <span className="text-white-darker text-xs text-center">
                    No icon uploaded
                    <br />
                    34x34 recommended
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const processedImage = await processModIconImage(file);
                      updateMetadata({
                        iconImage: processedImage,
                        hasUserUploadedIcon: true,
                      });
                    } catch (error) {
                      console.error("Failed to process mod icon:", error);
                    }
                  }
                  e.target.value = "";
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const fileInput = document.querySelector(
                  'input[type="file"]'
                ) as HTMLInputElement | null;
                if (fileInput) {
                  fileInput.click();
                }
              }}
            >
              Change Icon
            </Button>
          </div>
        </div>

        <div className="border-t border-black-light pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg text-white-light font-medium mb-6 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-mint" />
                Version & Loading
              </h2>
              <div className="space-y-6">
                <div>
                  <InputField
                    value={metadata.version || ""}
                    onChange={(e) =>
                      updateMetadata({ version: e.target.value })
                    }
                    placeholder="1.0.0"
                    darkmode={true}
                    icon={
                      <HashtagIcon className="h-5 w-5 text-mint stroke-2" />
                    }
                    label="Version"
                  />
                  {validation.warnings.version && (
                    <p className="text-yellow-400 text-xs mt-1">
                      {validation.warnings.version}
                    </p>
                  )}
                  <p className="text-white-darker text-xs mt-1">
                    Format: (major).(minor).(patch), use ~ for beta
                  </p>
                </div>

                <div>
                  <InputField
                    value={(metadata.priority || 0).toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === "" ? 0 : parseInt(value);
                      if (!isNaN(numValue)) {
                        updateMetadata({ priority: numValue });
                      }
                    }}
                    placeholder="0"
                    darkmode={true}
                    icon={<CubeIcon className="h-5 w-5 text-mint stroke-2" />}
                    label="Priority"
                  />
                  <p className="text-white-darker text-xs mt-1">
                    Negative values load first, positive load last
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-black-lighter rounded-lg p-4">
              <h4 className="text-white-light font-medium text-sm mb-3 tracking-wider">
                MOD SUMMARY
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white-darker">Name:</span>
                  <span className="text-white-light">
                    {metadata.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white-darker">ID:</span>
                  <span className="text-white-light">
                    {metadata.id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white-darker">Version:</span>
                  <span className="text-white-light">
                    {metadata.version || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white-darker">Author:</span>
                  <span className="text-white-light">
                    {(metadata.author || []).join(", ") || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-black-light pt-8">
          <h2 className="text-lg text-white-light font-medium mb-6 flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-mint" />
            Dependencies & Conflicts
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Dependencies
              </label>
              <textarea
                value={dependenciesString}
                onChange={(e) => handleDependenciesChange(e.target.value)}
                placeholder="Steamodded (>=1.0.0~BETA-0404a)"
                className="w-full h-20 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none"
              />
              <p className="text-white-darker text-xs mt-1">
                One dependency per line, with version constraints (&gt;=, ==,
                &lt;&lt;, etc.)
              </p>
            </div>

            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Conflicts
              </label>
              <textarea
                value={conflictsString}
                onChange={(e) => handleConflictsChange(e.target.value)}
                placeholder="SomeMod (>=1.1) (&lt;&lt;2~)"
                className="w-full h-16 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none"
              />
              <p className="text-white-darker text-xs mt-1">
                Mods that cannot be installed alongside this mod
              </p>
            </div>

            <div>
              <label className="block text-white-light text-sm font-medium mb-2">
                Provides
              </label>
              <textarea
                value={providesString}
                onChange={(e) => handleProvidesChange(e.target.value)}
                placeholder="SomeAPIMod (1.0)"
                className="w-full h-16 px-4 py-3 bg-black-darker border-2 border-black-light rounded-lg text-white-light placeholder-white-darker focus:border-mint focus:outline-none resize-none"
              />
              <p className="text-white-darker text-xs mt-1">
                Alternative mod IDs this mod can fulfill dependencies for
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-black-light pt-8">
          <div className="border border-black-lighter rounded-lg p-4">
            <h4 className="text-white-light font-medium text-sm mb-3 tracking-wider">
              JSON PREVIEW
            </h4>
            <div className="bg-black border border-black-light rounded p-3 max-h-60 overflow-y-auto custom-scrollbar">
              <pre className="text-white-darker text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModMetadataPage;
