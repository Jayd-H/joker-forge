import {
  JokerData,
  ConsumableData,
  ConsumableSetData,
  BoosterData,
  EnhancementData,
  SealData,
  EditionData,
  ModMetadata,
  SoundData,
  VoucherData,
  DeckData
} from "./data/BalatroUtils";
import { RarityData } from "./data/BalatroUtils";

// some of this is pretty bad
export interface ExportedMod {
  metadata: ModMetadata;
  jokers: JokerData[];
  sounds: SoundData[];
  consumables: ConsumableData[];
  customRarities: RarityData[];
  consumableSets: ConsumableSetData[];
  boosters: BoosterData[];
  enhancements: EnhancementData[];
  seals: SealData[];
  editions: EditionData[];
  vouchers: VoucherData[];
  decks: DeckData[];
  version: string;
  exportedAt: string;
}
interface ImportableModData {
  metadata: ModMetadata;
  jokers: JokerData[];
  sounds: SoundData[];
  consumables?: ConsumableData[];
  customRarities?: RarityData[];
  consumableSets?: ConsumableSetData[];
  boosters?: BoosterData[];
  enhancements?: EnhancementData[];
  seals?: SealData[];
  editions?: EditionData[];
  vouchers?: VoucherData[];
  decks?: DeckData[];
}

export const normalizeImportedModData = (data: ImportableModData) => {
  if (!data.metadata) {
    throw new Error("Invalid mod data - missing metadata");
  }

  if (!data.jokers || !Array.isArray(data.jokers)) {
    throw new Error("Invalid mod data - missing or invalid jokers data");
  }
  const normalizedJokers = data.jokers.map(normalizeJokerData);
  const normalizedSounds = (data.sounds || []).map(normalizeSoundData);
  const normalizedConsumables = (data.consumables || []).map(
    normalizeConsumableData
  );
  const normalizedRarities = (data.customRarities || []).map(
    normalizeRarityData
  );
  const normalizedConsumableSets = (data.consumableSets || []).map(
    normalizeConsumableSetData
  );
  const normalizedBoosters = (data.boosters || []).map(normalizeBoosterData);
  const normalizedEnhancements = (data.enhancements || []).map(
    normalizeEnhancementData
  );
  const normalizedSeals = (data.seals || []).map(normalizeSealData);
  const normalizedEditions = (data.editions || []).map(normalizeEditionData);
  const normalizedVouchers = (data.vouchers || []).map(normalizeVoucherData);
  const normalizedDecks = (data.decks || []).map(normalizeDeckData);

  console.log(
    `Successfully processed mod data with ${normalizedJokers.length} jokers, ${normalizedConsumables.length} consumables, ${normalizedBoosters.length} boosters, ${normalizedEnhancements.length} enhancements, ${normalizedSeals.length} seals, ${normalizedEditions.length} editions, ${normalizedVouchers.length} vouchers, ${normalizedDecks.length} decks`
  );

  return {
    metadata: data.metadata,
    jokers: normalizedJokers,
    sounds: normalizedSounds,
    consumables: normalizedConsumables,
    customRarities: normalizedRarities,
    consumableSets: normalizedConsumableSets,
    boosters: normalizedBoosters,
    enhancements: normalizedEnhancements,
    seals: normalizedSeals,
    editions: normalizedEditions,
    vouchers: normalizedVouchers,
    decks: normalizedDecks,
  };
};

const normalizeJokerData = (joker: Partial<JokerData>): JokerData => {
  return {
    //@ts-expect-error: backwards compatibility
    objectKey: joker.jokerKey || joker.objectKey || "",
    id: joker.id || "",
    name: joker.name || "",
    description: joker.description || "",
    imagePreview: joker.imagePreview || "",
    overlayImagePreview: joker.overlayImagePreview,
    rarity: joker.rarity || 1,
    cost: joker.cost,
    blueprint_compat: joker.blueprint_compat,
    eternal_compat: joker.eternal_compat,
    perishable_compat: joker.perishable_compat,
    unlocked: joker.unlocked,
    discovered: joker.discovered,
    force_eternal: joker.force_eternal,
    force_perishable: joker.force_perishable,
    force_rental: joker.force_rental,
    force_foil: joker.force_foil,
    force_holographic: joker.force_holographic,
    force_polychrome: joker.force_polychrome,
    force_negative: joker.force_negative,
    appears_in_shop: joker.appears_in_shop,
    unlockTrigger: joker.unlockTrigger || undefined,
    unlockProperties: joker.unlockProperties || [],
    unlockOperator: joker.unlockOperator || "",
    unlockCount: joker.unlockCount ?? 1,
    unlockDescription: joker.unlockDescription || "",
    rules: joker.rules || [],
    userVariables: joker.userVariables || [],
    placeholderCreditIndex: joker.placeholderCreditIndex,
    hasUserUploadedImage: joker.hasUserUploadedImage || false,
    cardAppearance: joker.cardAppearance || {
      buf: true,
      jud: true,
      rif: true,
      rta: true,
      sou: true,
      uta: true,
      wra: true,
    },
    appearFlags: joker.appearFlags || "",
    ignoreSlotLimit: joker.ignoreSlotLimit || false,
    scale_h: joker.scale_h || 100,
    scale_w: joker.scale_w || 100,
    pools: joker.pools || [],
    orderValue: joker.orderValue || 1,
    objectType: "joker",
    info_queues: joker.info_queues || [],
  };
};

const normalizeSoundData = (sound: Partial<SoundData>): SoundData => {
  return {
    id: sound.id || "",
    key: sound.key || "",
    soundString: sound.soundString || "",
    volume: sound.volume || 0.6,
    pitch: sound.pitch || 0.7,
    replace: sound.replace || "",
  };
};

const normalizeConsumableData = (
  consumable: ConsumableData
): ConsumableData => {
  return {
    //@ts-expect-error: backwards compatibility
    objectKey: consumable.consumableKey || consumable.objectKey || "",
    id: consumable.id || "",
    name: consumable.name || "",
    description: consumable.description || "",
    imagePreview: consumable.imagePreview || "",
    overlayImagePreview: consumable.overlayImagePreview,
    set: consumable.set || "Tarot",
    cost: consumable.cost,
    unlocked: consumable.unlocked,
    discovered: consumable.discovered,
    hidden: consumable.hidden,
    can_repeat_soul: consumable.can_repeat_soul,
    rules: consumable.rules || [],
    placeholderCreditIndex: consumable.placeholderCreditIndex,
    objectType: "consumable",
    hasUserUploadedImage: consumable.hasUserUploadedImage || false,
    orderValue: consumable.orderValue || 1,
  };
};

const normalizeBoosterData = (booster: BoosterData): BoosterData => {
  return {
    //@ts-expect-error: backwards compatibility
    objectKey: booster.boosterKey || booster.objectKey || "",
    objectType: "booster",
    id: booster.id || "",
    name: booster.name || "",
    description: booster.description || "",
    imagePreview: booster.imagePreview || "",
    cost: booster.cost ?? 4,
    weight: booster.weight ?? 1,
    draw_hand: booster.draw_hand || false,
    instant_use: booster.instant_use || false,
    booster_type: booster.booster_type || "joker",
    kind: booster.kind,
    group_key: booster.group_key,
    atlas: booster.atlas,
    pos: booster.pos || { x: 0, y: 0 },
    config: booster.config || { extra: 3, choose: 1 },
    card_rules: booster.card_rules || [],
    background_colour: booster.background_colour,
    special_colour: booster.special_colour,
    discovered: booster.discovered,
    hidden: booster.hidden,
    placeholderCreditIndex: booster.placeholderCreditIndex,
    hasUserUploadedImage: booster.hasUserUploadedImage || false,
    orderValue: booster.orderValue || 1,
  };
};

const normalizeEnhancementData = (
  enhancement: EnhancementData
): EnhancementData => {
  return {
    //@ts-expect-error: backwards compatibility
    objectKey: enhancement.enhancementKey || enhancement.objectKey || "",
    objectType: "enhancement",
    id: enhancement.id || "",
    name: enhancement.name || "",
    description: enhancement.description || "",
    imagePreview: enhancement.imagePreview || "",
    atlas: enhancement.atlas,
    pos: enhancement.pos || { x: 0, y: 0 },
    any_suit: enhancement.any_suit,
    replace_base_card: enhancement.replace_base_card,
    no_rank: enhancement.no_rank,
    no_suit: enhancement.no_suit,
    always_scores: enhancement.always_scores,
    unlocked: enhancement.unlocked,
    discovered: enhancement.discovered,
    no_collection: enhancement.no_collection,
    rules: enhancement.rules || [],
    userVariables: enhancement.userVariables || [],
    placeholderCreditIndex: enhancement.placeholderCreditIndex,
    hasUserUploadedImage: enhancement.hasUserUploadedImage || false,
    weight: enhancement.weight ?? 5,
    orderValue: enhancement.orderValue || 1,
  };
};

const normalizeSealData = (seal: SealData): SealData => {
  return {
    //@ts-expect-error: backwards compatibility
    objectKey: seal.sealKey || seal.objectKey || "",
    objectType: "seal",
    id: seal.id || "",
    name: seal.name || "",
    description: seal.description || "",
    imagePreview: seal.imagePreview || "",
    atlas: seal.atlas,
    pos: seal.pos || { x: 0, y: 0 },
    badge_colour: seal.badge_colour || "#FFFFFF",
    unlocked: seal.unlocked,
    discovered: seal.discovered,
    no_collection: seal.no_collection,
    rules: seal.rules || [],
    userVariables: seal.userVariables || [],
    placeholderCreditIndex: seal.placeholderCreditIndex,
    hasUserUploadedImage: seal.hasUserUploadedImage || false,
    orderValue: seal.orderValue || 1,
  };
};

const normalizeEditionData = (edition: EditionData): EditionData => {
  return {
    //@ts-expect-error: backwards compatibility
    objectKey: edition.editionKey || edition.objectKey || "",
    objectType: "edition",
    id: edition.id || "",
    name: edition.name || "",
    description: edition.description || "",
    shader: edition.shader || false,
    unlocked: edition.unlocked,
    discovered: edition.discovered,
    no_collection: edition.no_collection,
    in_shop: edition.in_shop,
    weight: edition.weight ?? 0,
    extra_cost: edition.extra_cost,
    apply_to_float: edition.apply_to_float,
    badge_colour: edition.badge_colour || "#FFAA00",
    sound: edition.sound || "foil1",
    disable_shadow: edition.disable_shadow,
    disable_base_shader: edition.disable_base_shader,
    rules: edition.rules || [],
    orderValue: edition.orderValue || 1,
  };
};

const normalizeVoucherData = (voucher: VoucherData): VoucherData => {
  return {
    //@ts-expect-error: backwards compatibility
    objectKey: voucher.voucherKey || voucher.objectKey || "",
    objectType: "voucher",
    id: voucher.id || "",
    name: voucher.name || "",
    description: voucher.description || "",
    imagePreview: voucher.imagePreview || "",
    overlayImagePreview: voucher.overlayImagePreview,
    cost: voucher.cost,
    unlocked: voucher.unlocked,
    discovered: voucher.discovered,
    can_repeat_soul: voucher.can_repeat_soul,
    requires: voucher.requires || "",
    requires_activetor: voucher.requires_activetor !== false,
    no_collection: voucher.no_collection,
    unlockTrigger: voucher.unlockTrigger || undefined,
    unlockProperties: voucher.unlockProperties || [],
    unlockOperator: voucher.unlockOperator || "",
    unlockCount: voucher.unlockCount ?? 1,
    unlockDescription: voucher.unlockDescription || "",
    rules: voucher.rules || [],
    placeholderCreditIndex: voucher.placeholderCreditIndex,
    hasUserUploadedImage: voucher.hasUserUploadedImage || false,
    orderValue: voucher.orderValue || 1,
  };
};

const normalizeDeckData = (deck: DeckData): DeckData => {
  return {
    //@ts-expect-error: backwards compatibility
    objectKey: deck.deckKey || deck.objectKey || "",
    objectType: "deck",
    id: deck.id || "",
    name: deck.name || "",
    description: deck.description || "",
    imagePreview: deck.imagePreview || "",
    unlocked: deck.unlocked,
    discovered: deck.discovered,
    no_collection: deck.no_collection,
    no_interest: deck.no_interest,
    no_faces: deck.no_faces,
    erratic_deck: deck.erratic_deck,
    rules: deck.rules || [],
    placeholderCreditIndex: deck.placeholderCreditIndex,
    hasUserUploadedImage: deck.hasUserUploadedImage || false,
    Config_vouchers: deck.Config_vouchers || [],
    Config_consumables: deck.Config_consumables || [],
    orderValue: deck.orderValue || 1,
  };
};

const normalizeRarityData = (rarity: RarityData): RarityData => {
  return {
    id: rarity.id || "",
    key: rarity.key || "",
    name: rarity.name || "",
    badge_colour: rarity.badge_colour || "#666665",
    default_weight: rarity.default_weight ?? 1,
  };
};

const normalizeConsumableSetData = (
  set: ConsumableSetData
): ConsumableSetData => {
  return {
    id: set.id || "",
    key: set.key || "",
    name: set.name || "",
    primary_colour: set.primary_colour || "#ffffff",
    secondary_colour: set.secondary_colour || "#000000",
    collection_rows: set.collection_rows || [5, 5],
    default_card: set.default_card,
    shop_rate: set.shop_rate ?? 1,
    collection_name: set.collection_name,
  };
};

export const modToJson = (
  metadata: ModMetadata,
  jokers: JokerData[],
  sounds: SoundData[],
  customRarities: RarityData[] = [],
  consumables: ConsumableData[] = [],
  consumableSets: ConsumableSetData[] = [],
  boosters: BoosterData[] = [],
  enhancements: EnhancementData[] = [],
  seals: SealData[] = [],
  editions: EditionData[] = [],
  vouchers: VoucherData[] = [],
  decks: DeckData[] = []
): { filename: string; jsonString: string } => {
  const exportData: ExportedMod = {
    metadata,
    jokers,
    sounds,
    consumables,
    customRarities,
    consumableSets,
    boosters,
    enhancements,
    seals,
    editions,
    vouchers,
    decks,
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const filename = `${metadata.id || "custom-mod"}-${new Date()
    .toISOString()
    .slice(0, 10)}.jokerforge`;

  return { filename, jsonString };
};

export const exportModAsJSON = (
  metadata: ModMetadata,
  jokers: JokerData[],
  sounds: SoundData[],
  customRarities: RarityData[] = [],
  consumables: ConsumableData[] = [],
  consumableSets: ConsumableSetData[] = [],
  boosters: BoosterData[] = [],
  enhancements: EnhancementData[] = [],
  seals: SealData[] = [],
  editions: EditionData[] = [],
  vouchers: VoucherData[] = [],
  decks: DeckData[] = []
): void => {
  const ret = modToJson(
    metadata,
    jokers,
    sounds,
    customRarities,
    consumables,
    consumableSets,
    boosters,
    enhancements,
    seals,
    editions,
    vouchers,
    decks,
  );
  const blob = new Blob([ret.jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = ret.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importModFromJSON = (): Promise<{
  metadata: ModMetadata;
  jokers: JokerData[];
  sounds: SoundData[];
  consumables: ConsumableData[];
  customRarities: RarityData[];
  consumableSets: ConsumableSetData[];
  boosters: BoosterData[];
  enhancements: EnhancementData[];
  seals: SealData[];
  editions: EditionData[];
  vouchers: VoucherData[];
  decks: DeckData[];
} | null> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.jokerforge";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const importData: ExportedMod = JSON.parse(jsonString);

          if (!importData.metadata) {
            throw new Error("Invalid mod file format - missing metadata");
          }

          if (!importData.jokers || !Array.isArray(importData.jokers)) {
            throw new Error(
              "Invalid mod file format - missing or invalid jokers data"
            );
          }

          const normalizedJokers = importData.jokers.map(normalizeJokerData);
          const normalizedSounds =
            importData.sounds?.map(normalizeSoundData) || [];
          const normalizedConsumables = (importData.consumables || []).map(
            normalizeConsumableData
          );
          const normalizedRarities = (importData.customRarities || []).map(
            normalizeRarityData
          );
          const normalizedConsumableSets = (
            importData.consumableSets || []
          ).map(normalizeConsumableSetData);
          const normalizedBoosters = (importData.boosters || []).map(
            normalizeBoosterData
          );
          const normalizedEnhancements = (importData.enhancements || []).map(
            normalizeEnhancementData
          );
          const normalizedSeals = (importData.seals || []).map(
            normalizeSealData
          );
          const normalizedEditions = (importData.editions || []).map(
            normalizeEditionData
          );

          const normalizedVouchers = (importData.vouchers || []).map(
            normalizeVoucherData
          );

          const normalizedDecks = (importData.decks || []).map(
            normalizeDeckData
          );
          
          console.log(
            `Successfully imported mod with ${normalizedJokers.length} jokers, ${normalizedConsumables.length} consumables, ${normalizedBoosters.length} boosters, ${normalizedEnhancements.length} enhancements, ${normalizedSeals.length} seals, ${normalizedEditions.length} editions, ${normalizedVouchers.length} vouchers, ${normalizedDecks.length} decks`
          );

          resolve({
            metadata: importData.metadata,
            jokers: normalizedJokers,
            sounds: normalizedSounds,
            consumables: normalizedConsumables,
            customRarities: normalizedRarities,
            consumableSets: normalizedConsumableSets,
            boosters: normalizedBoosters,
            enhancements: normalizedEnhancements,
            seals: normalizedSeals,
            editions: normalizedEditions,
            vouchers: normalizedVouchers,
            decks: normalizedDecks,
          });
        } catch (error) {
          console.error("Error parsing mod file:", error);
          reject(
            new Error(
              `Invalid mod file format: ${
                error instanceof Error
                  ? error.message
                  : "Please check the file and try again."
              }`
            )
          );
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        reject(new Error("Failed to read the selected file."));
      };

      reader.readAsText(file);
    };

    input.oncancel = () => {
      resolve(null);
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
};
