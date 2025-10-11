import JSZip from "jszip";
import {
  GameObjectData,
  JokerData,
  BoosterData,
  RarityData,
  ConsumableData,
  EnhancementData,
  SealData,
  ModMetadata,
  EditionData,
  VoucherData,
  DeckData,
  isCustomShader,
  getCustomShaderFilepath,
  SoundData,
} from "../data/BalatroUtils";
import { addAtlasToZip } from "./ImageProcessor";
import { generateJokersCode, generateCustomRaritiesCode } from "./Jokers/index";
import { generateConsumablesCode } from "./Consumables/index";
import { generateVouchersCode } from "./Vouchers/index";
import { generateDecksCode } from "./Decks/index";
import { generateBoostersCode } from "./boosters";
import { ConsumableSetData, slugify, getModPrefix } from "../data/BalatroUtils";
import { modToJson } from "../JSONImportExport";
import {
  generateEnhancementsCode,
  generateSealsCode,
  generateEditionsCode,
} from "./Card/index";

// Old Export Method
//
/* const sortForExport = <T extends { id: string; name: string }>(
  items: T[]
): T[] => {
  return [...items].sort((a, b) => {
    const nameA = a.name || "";
    const nameB = b.name || "";
    const idA = a.id || "";
    const idB = b.id || "";

    const nameComparison = nameA.localeCompare(nameB);
    if (nameComparison !== 0) return nameComparison;
    return idA.localeCompare(idB);
  });
};
*/

const sortGameObjectForExport = <GameObjectType extends GameObjectData> (
  items: GameObjectType[]
)=>{
  const sortedItems = [...items].sort((a, b) => 
    a.orderValue - b.orderValue)
  return sortedItems;
};


const collectJokerPools = (jokers: JokerData[]): Record<string, string[]> => {
  const poolsMap: Record<string, string[]> = {};

  // Vanilla food jokers to include in food pool
  const vanillaFoodJokers = [
    "j_gros_michel",
    "j_egg",
    "j_ice_cream",
    "j_cavendish",
    "j_turtle_bean",
    "j_diet_cola",
    "j_popcorn",
    "j_ramen",
    "j_selzer",
  ];

  // Always generate the food pool with vanilla food jokers
  // This ensures it exists even if no custom jokers use the food pool
  // Technically you could systematically search every item that may want to use the pool, then generate it
  // But that is too much effort for something most people will never even see lol
  poolsMap["food"] = [...vanillaFoodJokers];

  jokers.forEach((joker) => {
    if (joker.pools && joker.pools.length > 0) {
      joker.pools.forEach((poolName) => {
        if (!poolsMap[poolName]) {
          poolsMap[poolName] = [];
        }
        const jokerKey = joker.objectKey || slugify(joker.name);
        poolsMap[poolName].push(`j_${getModPrefix()}_${jokerKey}`);
      });
    }
  });

  return poolsMap;
};

const generateObjectTypes = (
  poolsMap: Record<string, string[]>,
  modPrefix: string
): string => {
  if (Object.keys(poolsMap).length === 0) {
    return "";
  }

  let output = "";

  Object.entries(poolsMap).forEach(([poolName, jokerKeys]) => {
    const cardsObject = jokerKeys
      .map((key) => `["${key}"] = true`)
      .join(",\n        ");

    output += `SMODS.ObjectType({
    key = "${modPrefix}_${poolName}",
    cards = {
        ${cardsObject}
    },
})

`;
  });

  return output;
};

const collectCustomShaders = (editions: EditionData[]): string[] => {
  const usedShaders = new Set<string>();

  editions.forEach((edition) => {
    if (typeof edition.shader === "string" && isCustomShader(edition.shader)) {
      usedShaders.add(edition.shader);
    }
  });

  return Array.from(usedShaders);
};

const addCustomShadersToZip = async (
  zip: JSZip,
  customShaders: string[]
): Promise<void> => {
  if (customShaders.length === 0) return;

  const assetsFolder = zip.folder("assets");
  const shadersFolder = assetsFolder!.folder("shaders");

  for (const shaderKey of customShaders) {
    const filepath = getCustomShaderFilepath(shaderKey);
    if (filepath) {
      try {
        const response = await fetch(filepath);
        if (response.ok) {
          const shaderContent = await response.text();
          shadersFolder!.file(`${shaderKey}.fs`, shaderContent);
        } else {
          console.warn(`Failed to fetch shader file: ${filepath}`);
        }
      } catch (error) {
        console.warn(`Error loading shader file ${filepath}:`, error);
      }
    }
  }
};

export const exportModCode = async (
  jokers: JokerData[],
  sounds: SoundData[],
  consumables: ConsumableData[],
  metadata: ModMetadata,
  customRarities: RarityData[] = [],
  consumableSets: ConsumableSetData[] = [],
  boosters: BoosterData[] = [],
  enhancements: EnhancementData[] = [],
  seals: SealData[] = [],
  editions: EditionData[] = [],
  vouchers: VoucherData[] = [],
  decks: DeckData[] = [],
): Promise<boolean> => {
  try {
    console.log("Generating mod code...");

    // Validate metadata before proceeding
    if (
      !metadata.id ||
      !metadata.name ||
      !metadata.author ||
      metadata.author.length === 0
    ) {
      throw new Error("Missing required metadata fields");
    }

    // Filter out items with missing required fields
    const validJokers = jokers.filter((j) => j.id && j.name);
    const validConsumables = consumables.filter((c) => c.id && c.name);
    const validBoosters = boosters.filter((b) => b.id && b.name);
    const validEnhancements = enhancements.filter((e) => e.id && e.name);
    const validSeals = seals.filter((s) => s.id && s.name);
    const validEditions = editions.filter((e) => e.id && e.name);
    const validVouchers = vouchers.filter((v) => v.id && v.name);
    const validDecks = decks.filter((d) => d.id && d.name);

    console.log(
      `Filtered items - Jokers: ${validJokers.length}, Consumables: ${validConsumables.length}, Boosters: ${validBoosters.length}, Enhancements: ${validEnhancements.length}, Seals: ${validSeals.length}, Editions: ${validEditions.length} vouchers: ${validVouchers.length}, Decks: ${validDecks.length}`
    );

    const zip = new JSZip();

    const sortedJokers = sortGameObjectForExport(validJokers);
    const sortedConsumables = sortGameObjectForExport(validConsumables);
    const sortedBoosters = sortGameObjectForExport(validBoosters);
    const sortedEnhancements = sortGameObjectForExport(validEnhancements);
    const sortedSeals = sortGameObjectForExport(validSeals);
    const sortedEditions = sortGameObjectForExport(validEditions);
    const sortedVouchers = sortGameObjectForExport(validVouchers);
    const sortedDecks = sortGameObjectForExport(validDecks);
    const customShaders = collectCustomShaders(sortedEditions);

    const hasModIcon = !!(metadata.hasUserUploadedIcon || metadata.iconImage);
    const hasGameIcon = !!(metadata.hasUserUploadedGameIcon || metadata.gameImage);

    const mainLuaCode = generateMainLuaCode(
      sortedJokers,
      sounds,
      sortedConsumables,
      customRarities,
      sortedBoosters,
      sortedEnhancements,
      sortedSeals,
      sortedEditions,
      sortedVouchers,
      sortedDecks,
      hasModIcon,
      hasGameIcon,
      metadata
    );
    zip.file(metadata.main_file, mainLuaCode);

    const ret = modToJson(
      metadata,
      sortedJokers,
      sounds,
      customRarities,
      sortedConsumables,
      consumableSets,
      sortedBoosters,
      sortedEnhancements,
      sortedSeals,
      sortedEditions,
      sortedVouchers,
      sortedDecks
    );
    zip.file(ret.filename, ret.jsonString);

    if (customRarities.length > 0) {
      const raritiesCode = generateCustomRaritiesCode(customRarities);
      zip.file("rarities.lua", raritiesCode);
    }

    console.log("mod metadata: ", metadata.prefix);

    if (sortedJokers.length > 0) {
      const { jokersCode } = generateJokersCode(
        sortedJokers,
        "CustomJokers",
        metadata.prefix
      );

      const jokersFolder = zip.folder("jokers");
      Object.entries(jokersCode).forEach(([filename, code]) => {
        jokersFolder!.file(filename, code);
      });
    }
    
    if (sounds.length > 0) {
      let soundsCode = ""
      sounds.forEach((sound) => {
        soundsCode += `SMODS.Sound{
    key="${sound.key}",
    path="${sound.key}.ogg",
    pitch=${sound.pitch ?? 0.7},
    volume=${sound.volume ?? 0.6},
    replace="${sound.replace || ""}"
}\n\n`
      })
      zip.file("sounds.lua", soundsCode.trim());
    }

    if (sortedConsumables.length > 0 || consumableSets.length > 0) {
      const { consumablesCode } = generateConsumablesCode(sortedConsumables, {
        modPrefix: metadata.prefix,
        atlasKey: "CustomConsumables",
        consumableSets: consumableSets,
      });

      const consumablesFolder = zip.folder("consumables");
      Object.entries(consumablesCode).forEach(([filename, code]) => {
        consumablesFolder!.file(filename, code);
      });
    }

    if (sortedBoosters.length > 0) {
      const { boostersCode } = generateBoostersCode(
        sortedBoosters,
        metadata.prefix
      );
      zip.file("boosters.lua", boostersCode);
    }

    if (sortedEnhancements.length > 0) {
      const { enhancementsCode } = generateEnhancementsCode(
        sortedEnhancements,
        {
          modPrefix: metadata.prefix,
          atlasKey: "CustomEnhancements",
        }
      );

      const enhancementsFolder = zip.folder("enhancements");
      Object.entries(enhancementsCode).forEach(([filename, code]) => {
        enhancementsFolder!.file(filename, code);
      });
    }

    if (sortedSeals.length > 0) {
      const { sealsCode } = generateSealsCode(sortedSeals, {
        modPrefix: metadata.prefix,
        atlasKey: "CustomSeals",
      });

      const sealsFolder = zip.folder("seals");
      Object.entries(sealsCode).forEach(([filename, code]) => {
        sealsFolder!.file(filename, code);
      });
    }

    if (sortedEditions.length > 0) {
      const { editionsCode } = generateEditionsCode(sortedEditions, {
        modPrefix: metadata.prefix,
      });

      const editionsFolder = zip.folder("editions");
      Object.entries(editionsCode).forEach(([filename, code]) => {
        editionsFolder!.file(filename, code);
      });
    }
    
    if (sortedVouchers.length > 0) {
      const { vouchersCode } = generateVouchersCode(sortedVouchers, {
        modPrefix: metadata.prefix,
        atlasKey: "CustomVouchers",
      });

      const vouchersFolder = zip.folder("vouchers");
      Object.entries(vouchersCode).forEach(([filename, code]) => {
        vouchersFolder!.file(filename, code);
      });
    }

if (sortedDecks.length > 0) {
      const { decksCode } = generateDecksCode(sortedDecks, {
        modPrefix: metadata.prefix,
        atlasKey: "CustomDecks",
      });

      const decksFolder = zip.folder("decks");
      Object.entries(decksCode).forEach(([filename, code]) => {
        decksFolder!.file(filename, code);
      });
    }
    
    zip.file(`${metadata.id}.json`, generateModJson(metadata));

    let modIconData: string | undefined;
    if (metadata.hasUserUploadedIcon && metadata.iconImage) {
      modIconData = metadata.iconImage;
    } else if (!metadata.hasUserUploadedIcon) {
      try {
        const response = await fetch("/images/modicon.png");
        const blob = await response.blob();
        modIconData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch {
        console.log("Default mod icon not available");
        modIconData = undefined;
      }
    }

    let gameIconData: string | undefined;
    if (metadata.hasUserUploadedGameIcon && metadata.gameImage) {
      gameIconData = metadata.gameImage;
    } else if (!metadata.hasUserUploadedGameIcon) {
      try {
        const response = await fetch("/images/balatro.png");
        const blob = await response.blob();
        gameIconData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch {
        console.log("Default game icon not available");
        gameIconData = undefined;
      }
    }

    await addCustomShadersToZip(zip, customShaders);

    await addAtlasToZip(
      zip,
      sortedJokers,
      sortedConsumables,
      sortedBoosters,
      sortedEnhancements,
      sortedSeals,
      sortedVouchers,
      sortedDecks,
      modIconData,
      gameIconData
    );

    if (sounds.length > 0) {
      const soundsFolder = zip.folder("assets")!.folder("sounds");

      sounds.forEach((sound) => {
        const soundData = sound.soundString.replace(/^data:.+\/ogg;base64,/, "");
        soundsFolder!.file(`${sound.key}.ogg`, soundData, { base64: true });
      })
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata.id}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Failed to generate mod:", error);
    throw error;
  }
};

const generateMainLuaCode = (
  jokers: JokerData[],
  sounds: SoundData[],
  consumables: ConsumableData[],
  customRarities: RarityData[],
  boosters: BoosterData[],
  enhancements: EnhancementData[],
  seals: SealData[],
  editions: EditionData[],
  vouchers: VoucherData[],
  decks: DeckData[],
  hasModIcon: boolean,
  hasGameIcon: boolean,
  metadata: ModMetadata): string => {
  let output = "";

  if (hasModIcon) {
    output += `SMODS.Atlas({
    key = "modicon", 
    path = "ModIcon.png", 
    px = 34,
    py = 34,
    atlas_table = "ASSET_ATLAS"
})

`;
  }
  if (hasGameIcon) {
    output += `SMODS.Atlas({
    key = "balatro", 
    path = "balatro.png", 
    px = 333,
    py = 216,
    prefix_config = { key = false },
    atlas_table = "ASSET_ATLAS"
})


`;
  }

  if (jokers.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomJokers", 
    path = "CustomJokers.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
})

`;
  }

  if (consumables.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomConsumables", 
    path = "CustomConsumables.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
})

`;
  }

  if (boosters.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomBoosters", 
    path = "CustomBoosters.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
})

`;
  }

  if (enhancements.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomEnhancements", 
    path = "CustomEnhancements.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
})

`;
  }

  if (seals.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomSeals", 
    path = "CustomSeals.png", 
    px = 62,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
}):register()

`;
  }

  if (vouchers.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomVouchers", 
    path = "CustomVouchers.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
})

`;
  }

  if (decks.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomDecks", 
    path = "CustomDecks.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
})

`;
  }

  output += `local NFS = require("nativefs")
to_big = to_big or function(a) return a end
lenient_bignum = lenient_bignum or function(a) return a end
`;

const createIndexList = (objects : GameObjectData[]) => {
  const alphabetOrder = objects.sort((a,b)=>a.name.localeCompare(b.name))
  const order : Array < Array <number> > = []


  objects.forEach(object=>{
    order.push([alphabetOrder.indexOf(object) + 1 , object.orderValue])
})

  const indexOrder = order.sort((a,b) => a[1] - b[1])
  const indexArray : Array <number> = []

  indexOrder.forEach(step => {
    indexArray.push(step[0])
  })

  return indexArray
}

  if (jokers.length > 0) {
    const indexArray = createIndexList(jokers)
    output += `
local jokerIndexList = {${indexArray}}

local function load_jokers_folder()
    local mod_path = SMODS.current_mod.path
    local jokers_path = mod_path .. "/jokers"
    local files = NFS.getDirectoryItemsInfo(jokers_path)
    for i = 1, #jokerIndexList do
        local file_name = files[jokerIndexList[i]].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("jokers/" .. file_name))()
        end
    end
end

`;
  }

  if (consumables.length > 0) {
    const indexArray = createIndexList(consumables)
    output += `
local consumableIndexList = {${indexArray}}

local function load_consumables_folder()
    local mod_path = SMODS.current_mod.path
    local consumables_path = mod_path .. "/consumables"
    local files = NFS.getDirectoryItemsInfo(consumables_path)
    local set_file_number = #files + 1
    for i = 1, #files do
        if files[i].name == "sets.lua" then
            assert(SMODS.load_file("consumables/sets.lua"))()
            set_file_number = i
        end
    end    
    for i = 1, #consumableIndexList do
        local j = consumableIndexList[i]
        if j >= set_file_number then 
            j = j + 1
        end
        local file_name = files[j].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("consumables/" .. file_name))()
        end
    end
end

`;
  }

  if (enhancements.length > 0) {
    const indexArray= createIndexList(enhancements)
    output += `
local enhancementIndexList = {${indexArray}}

local function load_enhancements_folder()
    local mod_path = SMODS.current_mod.path
    local enhancements_path = mod_path .. "/enhancements"
    local files = NFS.getDirectoryItemsInfo(enhancements_path)
    for i = 1, #enhancementIndexList do
        local file_name = files[enhancementIndexList[i]].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("enhancements/" .. file_name))()
        end
    end
end

`;
  }

  if (seals.length > 0) {
    const indexArray= createIndexList(seals)
    output += `
local sealIndexList = {${indexArray}}

local function load_seals_folder()
    local mod_path = SMODS.current_mod.path
    local seals_path = mod_path .. "/seals"
    local files = NFS.getDirectoryItemsInfo(seals_path)
    for i = 1, #sealIndexList do
        local file_name = files[sealIndexList[i]].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("seals/" .. file_name))()
        end
    end
end

`;
  }
  
  if (editions.length > 0) {
    const indexArray= createIndexList(editions)
    output += `
local editionIndexList = {${indexArray}}

local function load_editions_folder()
    local mod_path = SMODS.current_mod.path
    local editions_path = mod_path .. "/editions"
    local files = NFS.getDirectoryItemsInfo(editions_path)
    for i = 1, #editionIndexList do
        local file_name = files[editionIndexList[i]].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("editions/" .. file_name))()
        end
    end
end

`;
  }

  if (vouchers.length > 0) {
    const indexArray= createIndexList(vouchers)
    output += `
local voucherIndexList = {${indexArray}}

local function load_vouchers_folder()
    local mod_path = SMODS.current_mod.path
    local vouchers_path = mod_path .. "/vouchers"
    local files = NFS.getDirectoryItemsInfo(vouchers_path)
    for i = 1, #voucherIndexList do
        local file_name = files[voucherIndexList[i]].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("vouchers/" .. file_name))()
        end
    end
end

`;
  }

  if (decks.length > 0) {
    const indexArray= createIndexList(decks)
    output += `
local deckIndexList = {${indexArray}}

local function load_decks_folder()
    local mod_path = SMODS.current_mod.path
    local decks_path = mod_path .. "/decks"
    local files = NFS.getDirectoryItemsInfo(decks_path)
    for i = 1, #deckIndexList do
        local file_name = files[deckIndexList[i]].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("decks/" .. file_name))()
        end
    end
end

`;
  }


  if (metadata.disable_vanilla) {
    output += `function SMODS.current_mod.reset_game_globals(run_start)
      local jokerPool = {}
      for k, v in pairs(G.P_CENTERS) do
          if v.set == 'Joker' then
              if (not v.mod) then
                  G.GAME.banned_keys[k] = true
              end
          end
      end
  end

  `;
  }

  if (customRarities.length > 0) {
    output += `local function load_rarities_file()
    local mod_path = SMODS.current_mod.path
    assert(SMODS.load_file("rarities.lua"))()
end

load_rarities_file()
`;
  }

  if (boosters.length > 0) {
    output += `
local function load_boosters_file()
    local mod_path = SMODS.current_mod.path
    assert(SMODS.load_file("boosters.lua"))()
end

load_boosters_file()
`;
  }

  if (sounds.length > 0) {
    output += `assert(SMODS.load_file("sounds.lua"))()\n`;
  }

  if (jokers.length > 0) {
    output += `load_jokers_folder()
`;
  }

  if (consumables.length > 0) {
    output += `load_consumables_folder()
`;
  }

  if (enhancements.length > 0) {
    output += `load_enhancements_folder()
`;
  }

  if (seals.length > 0) {
    output += `load_seals_folder()
`;
  }

  if (editions.length > 0) {
    output += `load_editions_folder()
`;
  }
  
   if (vouchers.length > 0) {
    output += `load_vouchers_folder()
`;
  }

  if (decks.length > 0) {
    output += `load_decks_folder()
`;
  }

  if (jokers.length > 0) {
    const poolsMap = collectJokerPools(jokers);
    const objectTypesCode = generateObjectTypes(poolsMap, metadata.prefix);
    if (objectTypesCode) {
      output += objectTypesCode;
    }
  }

  return output.trim();
};

const generateModJson = (metadata: ModMetadata): string => {
  const modJson: Record<string, unknown> = {
    id: metadata.id,
    name: metadata.name,
    author: metadata.author,
    description: metadata.description,
    prefix: metadata.prefix,
    main_file: metadata.main_file,
    version: metadata.version,
    priority: metadata.priority,
    badge_colour: metadata.badge_colour,
    badge_text_colour: metadata.badge_text_colour,
  };

  if (metadata.display_name && metadata.display_name !== metadata.name) {
    modJson.display_name = metadata.display_name;
  }

  if (metadata.dependencies && metadata.dependencies.length > 0) {
    modJson.dependencies = metadata.dependencies;
  }

  if (metadata.conflicts && metadata.conflicts.length > 0) {
    modJson.conflicts = metadata.conflicts;
  }

  if (metadata.provides && metadata.provides.length > 0) {
    modJson.provides = metadata.provides;
  }

  if (metadata.dump_loc) {
    modJson.dump_loc = metadata.dump_loc;
  }

  return JSON.stringify(modJson, null, 2);
};
