import { unlockOptions } from "../codeGeneration/Jokers/unlockUtils";
import { vouchersunlockOptions } from "../codeGeneration/Vouchers/unlockUtils";
import { Rule } from "../ruleBuilder/types";

export const slugify = (text: string): string => {
  return (
    text
      .toLowerCase()
      .replace(/[\s\W_]+/g, "")
      .replace(/^[\d]/, "_$&") ||
    `booster_${Math.random().toString(36).substring(2, 8)}`
  );
};

export interface ModMetadata {
  id: string;
  name: string;
  author: string[];
  description: string;
  prefix: string;
  main_file: string;
  disable_vanilla?: boolean;
  version: string;
  priority: number;
  badge_colour: string;
  badge_text_colour: string;
  display_name: string;
  dependencies: string[];
  conflicts: string[];
  provides: string[];
  dump_loc?: boolean;
  iconImage?: string;
  gameImage?: string;
  hasUserUploadedIcon?: boolean;
  hasUserUploadedGameIcon?: boolean;
}

export interface PageData {
  objectType: string,
  filter: string,
  direction: string,
  editList: string[],
}

export interface UserConfig {
  pageData: PageData[];
  defaultAutoFormat: boolean;
  defaultGridSnap: boolean;
}

// =============================================================================
// DATA REGISTRY INTERFACES
// =============================================================================

export interface UserVariable {
  id: string;
  name: string;
  type?: "number" | "suit" | "rank" | "pokerhand";
  description?: string;
  initialValue?: number;
  initialSuit?: "Spades" | "Hearts" | "Diamonds" | "Clubs";
  initialRank?:
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "Jack"
    | "Queen"
    | "King"
    | "Ace";
  initialPokerHand?:
    | "High Card"
    | "Pair"
    | "Two Pair"
    | "Three of a Kind"
    | "Straight"
    | "Flush"
    | "Full House"
    | "Flush House"
    | "Four of a Kind"
    | "Five of a Kind"
    | "Straight Flush"
    | "Flush House"
    | "Flush Five";
}

export interface GameObjectData {
  id: string;
  name: string;
  objectType: string;
  objectKey: string;
  description: string;
  orderValue: number;
  discovered?: boolean;
}

export interface JokerData extends GameObjectData {
  imagePreview: string;
  overlayImagePreview?: string;
  rarity: number | string;
  cost?: number;
  blueprint_compat?: boolean;
  eternal_compat?: boolean;
  perishable_compat?: boolean;
  unlocked?: boolean;
  force_eternal?: boolean;
  force_perishable?: boolean;
  force_rental?: boolean;
  force_foil?: boolean;
  force_holographic?: boolean;
  force_polychrome?: boolean;
  force_negative?: boolean;
  appears_in_shop?: boolean;
  unlockTrigger?: keyof typeof unlockOptions;
  unlockProperties?: Array<{ category: string; property: string }>;
  unlockOperator?: string;
  unlockCount?: number;
  unlockDescription: string;
  rules?: Rule[];
  userVariables?: UserVariable[];
  placeholderCreditIndex?: number;
  hasUserUploadedImage?: boolean;
  cardAppearance: {
    // this uses the "source keys" as keys
    jud?: boolean; // judgement
    sou?: boolean; // soul
    wra?: boolean; // wraith
    buf?: boolean; // buffoon_pack
    rif?: boolean; // riff raff
    rta?: boolean; // rare tag
    uta?: boolean; // uncommon tag
  };
  appearFlags?: string;
  ignoreSlotLimit?: boolean;
  scale_w?: number;
  scale_h?: number;
  pools?: string[];
  info_queues?: string[];
}

export interface RarityData {
  id: string;
  key: string;
  name: string;
  badge_colour: string;
  default_weight: number;
}

export interface ConsumableData extends GameObjectData{
  imagePreview: string;
  overlayImagePreview?: string;
  set: "Tarot" | "Planet" | "Spectral" | string;
  cost?: number;
  unlocked?: boolean;
  hidden?: boolean;
  can_repeat_soul?: boolean;
  rules?: Rule[];
  placeholderCreditIndex?: number;
  hasUserUploadedImage?: boolean;
}

export interface ConsumableSetData {
  id: string;
  key: string;
  name: string;
  primary_colour: string;
  secondary_colour: string;
  collection_rows: [number, number];
  default_card?: string;
  shop_rate?: number;
  collection_name?: string;
}

export type BoosterType = "joker" | "consumable" | "playing_card" | "voucher";

export interface BoosterCardRule {
  set?: string;
  enhancement?: string;
  edition?: string;
  rarity?: string;
  suit?: string;
  rank?: string;
  seal?: string;
  weight?: number;
  specific_key?: string;
  specific_type?: "consumable" | "joker" | "voucher" | null;
  pool?: string;
}

export interface BoosterData extends GameObjectData{
  imagePreview: string;
  cost: number;
  weight: number;
  draw_hand: boolean;
  instant_use: boolean;
  booster_type: BoosterType;
  kind?: string;
  group_key?: string;
  atlas?: string;
  pos?: { x: number; y: number };
  config: {
    extra: number;
    choose: number;
  };
  card_rules: BoosterCardRule[];
  background_colour?: string;
  special_colour?: string;
  hidden?: boolean;
  placeholderCreditIndex?: number;
  hasUserUploadedImage?: boolean;
}

export interface EnhancementData extends GameObjectData{
  imagePreview: string;
  atlas?: string;
  pos?: { x: number; y: number };
  any_suit?: boolean;
  replace_base_card?: boolean;
  no_rank?: boolean;
  no_suit?: boolean;
  always_scores?: boolean;
  unlocked?: boolean;
  no_collection?: boolean;
  rules?: Rule[];
  weight?: number;
  userVariables?: UserVariable[];
  placeholderCreditIndex?: number;
  hasUserUploadedImage?: boolean;
}

export interface SealData extends GameObjectData{
  imagePreview: string;
  atlas?: string;
  pos?: { x: number; y: number };
  badge_colour?: string;
  unlocked?: boolean;
  no_collection?: boolean;
  sound?: string;
  rules?: Rule[];
  userVariables?: UserVariable[];
  placeholderCreditIndex?: number;
  hasUserUploadedImage?: boolean;
}

export interface EditionData extends GameObjectData{
  shader: string | false;
  unlocked?: boolean;
  no_collection?: boolean;
  in_shop?: boolean;
  weight?: number;
  extra_cost?: number;
  apply_to_float?: boolean;
  badge_colour?: string;
  sound?: string;
  disable_shadow?: boolean;
  disable_base_shader?: boolean;
  rules?: Rule[];
  userVariables?: UserVariable[];
}

export interface SoundData {
  id: string;
  key: string;
  pitch?: number;
  volume?: number;
  soundString: string;
  replace?: string;
}

export interface VoucherData extends GameObjectData {
  imagePreview: string;
  overlayImagePreview?: string;
  cost?: number;
  unlocked?: boolean;
  can_repeat_soul?: boolean;
  no_collection?: boolean;
  requires?: string;
  requires_activetor?: boolean;
  sound?: string;
  unlockTrigger?: keyof typeof vouchersunlockOptions;
  unlockProperties?: Array<{ category: string; property: string }>;
  unlockOperator?: string;
  unlockCount?: number;
  unlockDescription: string;
  rules?: Rule[];
  placeholderCreditIndex?: number;
  hasUserUploadedImage?: boolean;
}

export interface DeckData extends GameObjectData{
  imagePreview: string;
  unlocked?: boolean;
  no_collection?: boolean;
  no_interest?: boolean;
  no_faces?: boolean;
  erratic_deck?: boolean;
  sound?: string;
  rules?: Rule[];
  placeholderCreditIndex?: number;
  hasUserUploadedImage?: boolean;
  Config_vouchers?: string[];
  Config_consumables?: string[];
}

// =============================================================================
// DATA REGISTRY SYSTEM
// =============================================================================

interface RegistryState {
  customRarities: RarityData[];
  consumableSets: ConsumableSetData[];
  consumables: ConsumableData[];
  boosters: BoosterData[];
  enhancements: EnhancementData[];
  seals: SealData[];
  editions: EditionData[];
  vouchers: VoucherData[];
  decks: DeckData[];
  modPrefix: string;
}

let registryState: RegistryState = {
  customRarities: [],
  consumableSets: [],
  consumables: [],
  boosters: [],
  enhancements: [],
  seals: [],
  editions: [],
  vouchers: [],
  decks: [],
  modPrefix: "",
};

const VANILLA_RARITIES_DATA = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "legendary", label: "Legendary" },
];

const VANILLA_CONSUMABLE_SETS = [
  { value: "Tarot", label: "Tarot", key: "tarot" },
  { value: "Planet", label: "Planet", key: "planet" },
  { value: "Spectral", label: "Spectral", key: "spectral" },
];

const VANILLA_VOUCHERS = [
  { key: "v_overstock_norm", value: "v_overstock_norm", label: "Overstock" },
  {key: "v_overstock_plus", value: "v_overstock_plus", label: "Overstock Plus" },
  {key: "v_clearance_sale", value: "v_clearance_sale", label: "Clearance Sale" },
  {key: "v_liquidation", value: "v_liquidation", label: "Liquidation" },
  {key: "v_hone", value: "v_hone", label: "Hone" },
  {key: "v_glow_up", value: "v_glow_up", label: "Glow Up" },
  {key: "v_reroll_surplus", value: "v_reroll_surplus", label: "Reroll Surplus" },
  {key: "v_reroll_glut", value: "v_reroll_glut", label: "Reroll Glut" },
  {key: "v_crystal_ball", value: "v_crystal_ball", label: "Crystal Ball" },
  {key: "v_omen_globe", value: "v_omen_globe", label: "Omen Globe" },
  {key: "v_telescope", value: "v_telescope", label: "Telescope" },
  {key: "v_observatory", value: "v_observatory", label: "Observatory" },
  {key: "v_grabber", value: "v_grabber", label: "Grabber" },
  {key: "v_nacho_tong", value: "v_nacho_tong", label: "Nacho Tong" },
  {key: "v_wasteful", value: "v_wasteful", label: "Wasteful" },
  {key: "v_recyclomancy", value: "v_recyclomancy", label: "Recyclomancy" },
  {key: "v_tarot_merchant", value: "v_tarot_merchant", label: "Tarot Merchant" },
  {key: "v_tarot_tycoon", value: "v_tarot_tycoon", label: "Tarot Tycoon" },
  {key: "v_planet_merchant", value: "v_planet_merchant", label: "Planet Merchant" },
  {key: "v_planet_tycoon", value: "v_planet_tycoon", label: "Planet Tycoon" },
  {key: "v_seed_money", value: "v_seed_money", label: "Seed Money" },
  {key: "v_money_tree", value: "v_money_tree", label: "Money Tree" },
  {key: "v_blank", value: "v_blank", label: "Blank" },
  {key: "v_antimatter", value: "v_antimatter", label: "Antimatter" },
  {key: "v_magic_trick", value: "v_magic_trick", label: "Magic Trick" },
  {key: "v_illusion", value: "v_illusion", label: "Illusion" },
  {key: "v_hieroglyph", value: "v_hieroglyph", label: "Hieroglyph" },
  {key: "v_petroglyph", value: "v_petroglyph", label: "Petroglyph" },
  {key: "v_directors_cut", value: "v_directors_cut", label: "Directors Cut" },
  {key: "v_retcon", value: "v_retcon", label: "Retcon" },
  {key: "v_paint_brush", value: "v_paint_brush", label: "Paint Brush" },
  {key: "v_palette", value: "v_palette", label: "Palette" },
];


const VANILLA_DECKS = [
  {key: "Red Deck", value: "Red Deck", label: "Red Deck" },
  {key: "Blue Deck", value: "Blue Deck", label: "Blue Deck" },
  {key: "Yellow Deck", value: "Yellow Deck", label: "Yellow Deck" },
  {key: "Green Deck", value: "Green Deck", label: "Green Deck" },
  {key: "Black Deck", value: "Black Deck", label: "Black Deck" },
  {key: "Magic Deck", value: "Magic Deck", label: "Magic Deck" },
  {key: "Nebula Deck", value: "Nebula Deck", label: "Nebula Deck" },
  {key: "Ghost Deck", value: "Ghost Deck", label: "Ghost Deck" },
  {key: "Abandoned Deck", value: "Abandoned Deck", label: "Abandoned Deck" },
  {key: "Checkered Deck", value: "Checkered Deck", label: "Checkered Deck" },
  {key: "Zodiac Deck", value: "Zodiac Deck", label: "Zodiac Deck" },
  {key: "Anaglyph Deck", value: "Anaglyph Deck", label: "Anaglyph Deck" },
  {key: "Plasma Deck", value: "Plasma Deck", label: "Plasma Deck" },
  {key: "Erratic Deck", value: "Erratic Deck", label: "Erratic Deck" },
];

const VANILLA_SEALS = [
  { key: "Gold", value: "Gold", label: "Gold" },
  { key: "Red", value: "Red", label: "Red" },
  { key: "Blue", value: "Blue", label: "Blue" },
  { key: "Purple", value: "Purple", label: "Purple" },
];

export const DataRegistry = {
  update: (
    customRarities: RarityData[],
    consumableSets: ConsumableSetData[],
    consumables: ConsumableData[],
    boosters: BoosterData[],
    enhancements: EnhancementData[],
    seals: SealData[],
    editions: EditionData[],
    vouchers: VoucherData[],
    decks: DeckData[],
    modPrefix: string
  ) => {
    registryState = {
      customRarities,
      consumableSets,
      consumables,
      boosters,
      enhancements,
      seals,
      editions,
      vouchers,
      decks,
      modPrefix,
    };
  },

  getRarities: (): Array<{ value: string; label: string }> => {
    const custom = registryState.customRarities.map((rarity) => ({
      value: rarity.key,
      label: rarity.name,
    }));
    return [...VANILLA_RARITIES_DATA, ...custom];
  },

  getConsumableSets: (): Array<{
    value: string;
    label: string;
    key: string;
  }> => {
    const custom = registryState.consumableSets.map((set) => ({
      value: set.key,
      label: set.name,
      key: set.key,
    }));
    return [...VANILLA_CONSUMABLE_SETS, ...custom];
  },

  getConsumables: (): Array<{ value: string; label: string; set: string }> => {
    const custom = registryState.consumables.map((consumable) => ({
      value: `c_${registryState.modPrefix}_${
        consumable.objectKey ||
        (consumable.name
          ? consumable.name.toLowerCase().replace(/\s+/g, "_")
          : "unnamed_consumable")
      }`,
      label: consumable.name || "Unnamed Consumable",
      set: consumable.set,
    }));
    return [...custom];
  },

  getBoosters: (): Array<{
    value: string;
    label: string;
    type: BoosterType;
  }> => {
    const custom = registryState.boosters.map((booster) => ({
      value: `${registryState.modPrefix}_${
        booster.objectKey ||
        (booster.name
          ? booster.name.toLowerCase().replace(/\s+/g, "_")
          : "unnamed_booster")
      }`,
      label: booster.name || "Unnamed Booster",
      type: booster.booster_type,
    }));
    return [...custom];
  },

  getEnhancements: (): Array<{ key: string; value: string; label: string }> => {
    const vanilla = VANILLA_ENHANCEMENTS.map((enhancement) => ({
      key: enhancement.key,
      value: enhancement.value,
      label: enhancement.label,
    }));

    const custom = registryState.enhancements.map((enhancement) => ({
      key: `m_${registryState.modPrefix}_${enhancement.objectKey}`,
      value: `m_${registryState.modPrefix}_${enhancement.objectKey}`,
      label: enhancement.name || "Unnamed Enhancement",
    }));

    return [...vanilla, ...custom];
  },

  getSeals: (): Array<{ key: string; value: string; label: string }> => {
    const vanilla = VANILLA_SEALS.map((seal) => ({
      key: seal.key,
      value: seal.value,
      label: seal.label,
    }));

    const custom = registryState.seals.map((seal) => ({
      key: `${registryState.modPrefix}_${seal.objectKey}`,
      value: `${registryState.modPrefix}_${seal.objectKey}`,
      label: seal.name || "Unnamed Seal",
    }));

    return [...vanilla, ...custom];
  },

  getEditions: (): Array<{ key: string; value: string; label: string }> => {
    const vanilla = VANILLA_EDITIONS.map((edition) => ({
      key: edition.key,
      value: edition.value,
      label: edition.label,
    }));

    const custom = registryState.editions.map((edition) => ({
      key: `e_${registryState.modPrefix}_${edition.objectKey}`,
      value: `${edition.objectKey}`,
      label: edition.name || "Unnamed Edition",
    }));

    return [...vanilla, ...custom];
  },

  getVouchers: (): Array<{ key: string; value: string; label: string }> => {

    const vanilla = VANILLA_VOUCHERS.map((voucher) => ({
      key: voucher.key,
      value: voucher.value,
      label: voucher.label,
    }));

    const custom = registryState.vouchers.map((voucher) => ({
      key: `v_${registryState.modPrefix}_${voucher.objectKey}`,
      value: `v_${registryState.modPrefix}_${voucher.objectKey}`,
      label: voucher.name || "Unnamed Voucher",
    }));

    return [...vanilla, ...custom];
  },
  
  getDecks: (): Array<{ key: string; value: string; label: string }> => {

    const vanilla = VANILLA_DECKS.map((deck) => ({
      key: deck.key,
      value: deck.value,
      label: deck.label,
    }));

    const custom = registryState.decks.map((deck) => ({
      key: `b_${registryState.modPrefix}_${deck.objectKey}`,
      value: `b_${registryState.modPrefix}_${deck.objectKey}`,
      label: deck.name || "Unnamed Deck",
    }));

    return [...vanilla, ...custom];
  },

  getState: () => ({ ...registryState }),
};

export const getModPrefix = () => {
  return registryState.modPrefix;
};

export const updateDataRegistry = (
  customRarities: RarityData[],
  consumableSets: ConsumableSetData[],
  consumables: ConsumableData[],
  boosters: BoosterData[],
  enhancements: EnhancementData[],
  seals: SealData[],
  editions: EditionData[],
  vouchers: VoucherData[],
  decks: DeckData[],
  modPrefix: string
) => {
  DataRegistry.update(
    customRarities,
    consumableSets,
    consumables,
    boosters,
    enhancements,
    seals,
    editions,
    vouchers,
    decks,
    modPrefix
  );
};

// =============================================================================
// SHADERS SECTIONS
// =============================================================================

export const VANILLA_SHADERS = [
  { label: "Foil", key: "foil" },
  { label: "Holo", key: "holo" },
  { label: "Polychrome", key: "polychrome" },
  { label: "Booster", key: "booster" },
  { label: "Debuff", key: "debuff" },
  { label: "Voucher", key: "voucher" },
  { label: "Negative", key: "negative" },
  { label: "Negative Shine", key: "negative_shine" },
];

export const CUSTOM_SHADERS = [
  {
    label: "Anaglyphic (SMODS)",
    key: "anaglyphic",
    filepath: "/shaders/anaglyphic.fs",
  },
  {
    label: "Flipped (stupxd)",
    key: "flipped",
    filepath: "/shaders/flipped.fs",
  },
  {
    label: "Fluorescent (SMODS)",
    key: "fluorescent",
    filepath: "/shaders/fluorescent.fs",
  },
  { label: "Gilded (SMODS)", key: "gilded", filepath: "/shaders/gilded.fs" },
  { label: "Gold (stupxd)", key: "gold", filepath: "/shaders/gold.fs" },
  {
    label: "Greyscale (SMODS)",
    key: "greyscale",
    filepath: "/shaders/greyscale.fs",
  },
  { label: "Ionized (SMODS)", key: "ionized", filepath: "/shaders/ionized.fs" },
  {
    label: "Laminated (SMODS)",
    key: "laminated",
    filepath: "/shaders/laminated.fs",
  },
  {
    label: "Monochrome (SMODS)",
    key: "monochrome",
    filepath: "/shaders/monochrome.fs",
  },
  {
    label: "Overexposed (SMODS)",
    key: "overexposed",
    filepath: "/shaders/overexposed.fs",
  },
  { label: "Sepia (SMODS)", key: "sepia", filepath: "/shaders/sepia.fs" },
] as const;

export const isVanillaShader = (shaderKey: string): boolean => {
  return VANILLA_SHADERS.some((shader) => shader.key === shaderKey);
};

export const isCustomShader = (shaderKey: string): boolean => {
  return CUSTOM_SHADERS.some((shader) => shader.key === shaderKey);
};

export const getCustomShaderFilepath = (
  shaderKey: string
): string | undefined => {
  return CUSTOM_SHADERS.find((shader) => shader.key === shaderKey)?.filepath;
};

// =============================================================================
// EDITIONS SECTIONS
// =============================================================================

export const EDITIONS = () => DataRegistry.getEditions();
export const EDITION_KEYS = () => DataRegistry.getEditions().map((e) => e.key);
export const EDITION_VALUES = () =>
  DataRegistry.getEditions().map((e) => e.value);
export const EDITION_LABELS = () =>
  DataRegistry.getEditions().map((e) => e.label);

export const isCustomEdition = (
  value: string,
  customEditions: EditionData[] = registryState.editions,
  modPrefix: string = registryState.modPrefix
): boolean => {
  return (
    value.includes("_") &&
    customEditions.some((e) => `e_${modPrefix}_${e.objectKey}` === value)
  );
};

export const getEditionByValue = (
  value: string
): { key: string; value: string; label: string } | undefined => {
  return EDITIONS().find((edition) => edition.value === value);
};

export const getEditionByKey = (
  key: string
): { key: string; value: string; label: string } | undefined => {
  return EDITIONS().find((edition) => edition.key === key);
};

// =============================================================================
// SEALS SECTION
// =============================================================================

export const SEALS = () => DataRegistry.getSeals();
export const SEAL_KEYS = () => DataRegistry.getSeals().map((s) => s.key);
export const SEAL_VALUES = () => DataRegistry.getSeals().map((s) => s.value);
export const SEAL_LABELS = () => DataRegistry.getSeals().map((s) => s.label);

export const isCustomSeal = (
  value: string,
  customSeals: SealData[] = registryState.seals,
  modPrefix: string = registryState.modPrefix
): boolean => {
  return (
    value.includes("_") &&
    customSeals.some((s) => `${modPrefix}_${s.objectKey}` === value)
  );
};

export const getSealByValue = (
  value: string
): { key: string; value: string; label: string } | undefined => {
  return SEALS().find((seal) => seal.value === value);
};

export const getSealByKey = (
  key: string
): { key: string; value: string; label: string } | undefined => {
  return SEALS().find((seal) => seal.key === key);
};

// =============================================================================
// VOUCHERS SECTION
// =============================================================================

export const VOUCHERS = () => DataRegistry.getVouchers();
export const VOUCHER_KEYS = () => DataRegistry.getVouchers().map((v) => v.key);
export const VOUCHER_VALUES = () => DataRegistry.getVouchers().map((v) => v.value);
export const VOUCHER_LABELS = () => DataRegistry.getVouchers().map((v) => v.label);

export const isCustomVoucher = (
  value: string,
  customVouchers: VoucherData[] = registryState.vouchers,
  modPrefix: string = registryState.modPrefix
): boolean => {
  return (
    value.includes("_") &&
    customVouchers.some((v) => `${modPrefix}_${v.objectKey}` === value)
  );
};

export const getVoucherByValue = (
  value: string
): { key: string; value: string; label: string } | undefined => {
  return VOUCHERS().find((voucher) => voucher.value === value);
};

export const getVoucherByKey = (
  key: string
): { key: string; value: string; label: string } | undefined => {
  return VOUCHERS().find((voucher) => voucher.key === key);
};

// =============================================================================
// DECKS SECTION
// =============================================================================

export const DECKS = () => DataRegistry.getDecks();
export const DECK_KEYS = () => DataRegistry.getDecks().map((b) => b.key);
export const DECK_VALUES = () => DataRegistry.getDecks().map((b) => b.value);
export const DECK_LABELS = () => DataRegistry.getDecks().map((b) => b.label);

export const isCustomDeck = (
  value: string,
  customDecks: DeckData[] = registryState.decks,
  modPrefix: string = registryState.modPrefix
): boolean => {
  return (
    value.includes("_") &&
    customDecks.some((b) => `${modPrefix}_${b.objectKey}` === value)
  );
};

export const getDeckByValue = (
  value: string
): { key: string; value: string; label: string } | undefined => {
  return DECKS().find((deck) => deck.value === value);
};

export const getDeckByKey = (
  key: string
): { key: string; value: string; label: string } | undefined => {
  return DECKS().find((deck) => deck.key === key);
};

// =============================================================================
// ENHANCEMENTS SECTION
// =============================================================================

const VANILLA_ENHANCEMENTS = [
  { key: "m_gold", value: "m_gold", label: "Gold" },
  { key: "m_steel", value: "m_steel", label: "Steel" },
  { key: "m_glass", value: "m_glass", label: "Glass" },
  { key: "m_wild", value: "m_wild", label: "Wild" },
  { key: "m_mult", value: "m_mult", label: "Mult" },
  { key: "m_lucky", value: "m_lucky", label: "Lucky" },
  { key: "m_stone", value: "m_stone", label: "Stone" },
  { key: "m_bonus", value: "m_bonus", label: "Bonus" },
] as const;

export const ENHANCEMENTS = () => DataRegistry.getEnhancements();
export const ENHANCEMENT_KEYS = () =>
  DataRegistry.getEnhancements().map((e) => e.key);
export const ENHANCEMENT_VALUES = () =>
  DataRegistry.getEnhancements().map((e) => e.value);
export const ENHANCEMENT_LABELS = () =>
  DataRegistry.getEnhancements().map((e) => e.label);

export const isCustomEnhancement = (
  value: string,
  customEnhancements: EnhancementData[] = registryState.enhancements,
  modPrefix: string = registryState.modPrefix
): boolean => {
  return (
    value.includes("_") &&
    customEnhancements.some(
      (e) => `m_${modPrefix}_${e.objectKey}` === value
    )
  );
};

export const getEnhancementByValue = (
  value: string
): { key: string; value: string; label: string } | undefined => {
  return ENHANCEMENTS().find((enhancement) => enhancement.value === value);
};

export const getEnhancementByKey = (
  key: string
): { key: string; value: string; label: string } | undefined => {
  return ENHANCEMENTS().find((enhancement) => enhancement.key === key);
};

// =============================================================================
// BOOSTERS SECTION
// =============================================================================

export const CUSTOM_BOOSTERS = () => DataRegistry.getBoosters();
export const CUSTOM_BOOSTER_VALUES = () =>
  DataRegistry.getBoosters().map((b) => b.value);
export const CUSTOM_BOOSTER_LABELS = () =>
  DataRegistry.getBoosters().map((b) => b.label);

export const getBoostersByType = (
  boosterType: BoosterType,
  customBoosters: BoosterData[] = registryState.boosters
): BoosterData[] => {
  return customBoosters.filter(
    (booster) => booster.booster_type === boosterType
  );
};

export const getBoosterDropdownOptions = (
  customBoosters: BoosterData[] = registryState.boosters
) => {
  return customBoosters.map((booster) => ({
    value: `${registryState.modPrefix}_${
      booster.objectKey ||
      (booster.name
        ? booster.name.toLowerCase().replace(/\s+/g, "_")
        : "unnamed_booster")
    }`,
    label: booster.name || "Unnamed Booster",
  }));
};

export const getBoosterByKey = (
  key: string,
  customBoosters: BoosterData[] = registryState.boosters
): BoosterData | undefined => {
  const searchKey = key.startsWith(`${registryState.modPrefix}_`)
    ? key.substring(`${registryState.modPrefix}_`.length)
    : key;

  return customBoosters.find(
    (booster) =>
      booster.objectKey === searchKey ||
      (booster.name &&
        booster.name.toLowerCase().replace(/\s+/g, "_") === searchKey)
  );
};

export const isCustomBooster = (
  key: string,
  customBoosters: BoosterData[] = registryState.boosters,
  modPrefix: string = registryState.modPrefix
): boolean => {
  return (
    key.includes("_") &&
    customBoosters.some(
      (b) =>
        `${modPrefix}_${
          b.objectKey ||
          (b.name ? b.name.toLowerCase().replace(/\s+/g, "_") : "unnamed")
        }` === key
    )
  );
};

// =============================================================================
// RARITIES SECTION
// =============================================================================

export const RARITIES = () => DataRegistry.getRarities();
export const RARITY_VALUES = () =>
  DataRegistry.getRarities().map((r) => r.value);
export const RARITY_LABELS = () =>
  DataRegistry.getRarities().map((r) => r.label);

export const VANILLA_RARITIES = [
  { value: 1, label: "Common", key: "common" },
  { value: 2, label: "Uncommon", key: "uncommon" },
  { value: 3, label: "Rare", key: "rare" },
  { value: 4, label: "Legendary", key: "legendary" },
] as const;

type VanillaRarity = {
  value: number;
  label: string;
  key: string;
  isCustom: false;
};

type CustomRarityOption = {
  value: string;
  label: string;
  key: string;
  isCustom: true;
  customData: RarityData;
};

type RarityOption = VanillaRarity | CustomRarityOption;

export const getAllRarities = (
  customRarities: RarityData[] = registryState.customRarities
): RarityOption[] => {
  const vanillaRarities: VanillaRarity[] = VANILLA_RARITIES.map(
    (rarity, index) => ({
      value: index + 1,
      label: rarity.label,
      key: rarity.key,
      isCustom: false,
    })
  );

  const customRarityOptions: CustomRarityOption[] = customRarities.map(
    (rarity) => ({
      value: rarity.key,
      label: rarity.name,
      key: rarity.key,
      isCustom: true,
      customData: rarity,
    })
  );

  return [...vanillaRarities, ...customRarityOptions];
};
export const getRarityByValue = (
  value: number | string,
  customRarities: RarityData[] = registryState.customRarities
): RarityOption | undefined => {
  const allRarities = getAllRarities(customRarities);
  return allRarities.find((rarity) => rarity.value === value);
};

export const getRarityByKey = (
  key: string,
  customRarities: RarityData[] = registryState.customRarities
): RarityOption | undefined => {
  const allRarities = getAllRarities(customRarities);
  return allRarities.find((rarity) => rarity.key === key);
};

export const getRarityDisplayName = (
  value: number | string,
  customRarities: RarityData[] = registryState.customRarities
): string => {
  const rarity = getRarityByValue(value, customRarities);
  return rarity?.label || "Unknown";
};

export const getRarityBadgeColor = (
  value: number | string,
  customRarities: RarityData[] = registryState.customRarities
): string => {
  const rarity = getRarityByValue(value, customRarities);

  if (rarity?.isCustom) {
    const color = rarity.customData.badge_colour;
    return color.startsWith("#") ? color : `#${color}`;
  }

  const colorMap: Record<number, string> = {
    1: "#009dff",
    2: "#4BC292",
    3: "#fe5f55",
    4: "#b26cbb",
  };

  return colorMap[value as number] || "#666665";
};

export const getRarityStyles = (
  value: number | string,
  customRarities: RarityData[] = registryState.customRarities
) => {
  const color = getRarityBadgeColor(value, customRarities);

  return {
    text: `text-[${color}]`,
    bg: "bg-black",
    border: `border-[${color}]`,
    bgColor: color,
  };
};

export const isCustomRarity = (
  value: number | string,
  customRarities: RarityData[] = registryState.customRarities,
  modPrefix: string = registryState.modPrefix
): boolean => {
  if (typeof value === "string") {
    return (
      value.includes("_") &&
      customRarities.some((r) => `${modPrefix}_${r.key}` === value)
    );
  }
  return false;
};

export const getCustomRarityData = (
  value: number | string,
  customRarities: RarityData[] = registryState.customRarities
): RarityData | null => {
  const rarity = getRarityByValue(value, customRarities);
  return rarity?.isCustom ? rarity.customData : null;
};

export const getRarityDropdownOptions = (
  customRarities: RarityData[] = registryState.customRarities
) => {
  return getAllRarities(customRarities).map((rarity) => ({
    value: rarity.value.toString(),
    label: rarity.label,
  }));
};

// =============================================================================
// CONSUMABLES SECTION
// =============================================================================

export const CONSUMABLE_SETS = () => DataRegistry.getConsumableSets();
export const CONSUMABLE_SET_VALUES = () =>
  DataRegistry.getConsumableSets().map((s) => s.value);
export const CONSUMABLE_SET_LABELS = () =>
  DataRegistry.getConsumableSets().map((s) => s.label);

export const CUSTOM_CONSUMABLES = () => DataRegistry.getConsumables();
export const CUSTOM_CONSUMABLE_VALUES = () =>
  DataRegistry.getConsumables().map((c) => c.value);
export const CUSTOM_CONSUMABLE_LABELS = () =>
  DataRegistry.getConsumables().map((c) => c.label);

type VanillaConsumableSet = {
  value: string;
  label: string;
  key: string;
  isCustom: false;
};

type CustomConsumableSetOption = {
  value: string;
  label: string;
  key: string;
  isCustom: true;
  customData: ConsumableSetData;
};

type ConsumableSetOption = VanillaConsumableSet | CustomConsumableSetOption;

export const getAllConsumableSets = (
  customSets: ConsumableSetData[] = registryState.consumableSets
): ConsumableSetOption[] => {
  const vanillaSets: VanillaConsumableSet[] = VANILLA_CONSUMABLE_SETS.map(
    (set) => ({
      value: set.value,
      label: set.label,
      key: set.key,
      isCustom: false,
    })
  );

  const customSetOptions: CustomConsumableSetOption[] = customSets.map(
    (set) => ({
      value: set.key,
      label: set.name,
      key: set.key,
      isCustom: true,
      customData: set,
    })
  );

  return [...vanillaSets, ...customSetOptions];
};

export const getConsumableSetByValue = (
  value: string,
  customSets: ConsumableSetData[] = registryState.consumableSets
): ConsumableSetOption | undefined => {
  const allSets = getAllConsumableSets(customSets);
  return allSets.find((set) => set.value === value);
};

export const getConsumableSetByKey = (
  key: string,
  customSets: ConsumableSetData[] = registryState.consumableSets
): ConsumableSetOption | undefined => {
  const allSets = getAllConsumableSets(customSets);
  return allSets.find((set) => set.key === key);
};

export const isCustomConsumableSet = (
  value: string,
  customSets: ConsumableSetData[] = registryState.consumableSets,
  modPrefix: string = registryState.modPrefix
): boolean => {
  return (
    value.includes("_") &&
    customSets.some((s) => `${modPrefix}_${s.key}` === value)
  );
};

export const getCustomConsumableSetData = (
  value: string,
  customSets: ConsumableSetData[] = registryState.consumableSets
): ConsumableSetData | null => {
  const set = getConsumableSetByValue(value, customSets);
  return set?.isCustom ? set.customData : null;
};

export const getConsumablesBySet = (
  setKey: string,
  customConsumables: ConsumableData[] = registryState.consumables
): ConsumableData[] => {
  return customConsumables.filter((consumable) => consumable.set === setKey);
};

export const getConsumableSetDropdownOptions = (
  customSets: ConsumableSetData[] = registryState.consumableSets
) => {
  return getAllConsumableSets(customSets).map((set) => ({
    value: set.value,
    label: set.label,
  }));
};

//* ==== Centralized Balatro game data and utilities ====

export const BOSS_BLINDS = [
  { value: "bl_hook", label: "The Hook" },
  { value: "bl_ox", label: "The Ox" },
  { value: "bl_house", label: "The House" },
  { value: "bl_wall", label: "The Wall" },
  { value: "bl_wheel", label: "The Wheel" },
  { value: "bl_arm", label: "The Arm" },
  { value: "bl_club", label: "The Club" },
  { value: "bl_fish", label: "The Fish" },
  { value: "bl_psychic", label: "The Psychic" },
  { value: "bl_goad", label: "The Goad" },
  { value: "bl_water", label: "The Water" },
  { value: "bl_window", label: "The Window" },
  { value: "bl_manacle", label: "The Manacle" },
  { value: "bl_eye", label: "The Eye" },
  { value: "bl_mouth", label: "The Mouth" },
  { value: "bl_plant", label: "The Plant" },
  { value: "bl_serpent", label: "The Serpent" },
  { value: "bl_pillar", label: "The Pillar" },
  { value: "bl_needle", label: "The Needle" },
  { value: "bl_head", label: "The Head" },
  { value: "bl_tooth", label: "The Tooth" },
  { value: "bl_flint", label: "The Flint" },
  { value: "bl_mark", label: "The Mark" },

  { value: "bl_final_acorn", label: "Amber Acorn (final)" },
  { value: "bl_final_leaf", label: "Verdant Leaf (final)" },
  { value: "bl_final_vessel", label: "Violet Vessel (final)" },
  { value: "bl_final_heart", label: "Crimson Heart (final)" },
  { value: "bl_final_bell", label: "Cerulean Bell (final)" },
];

// VANILLA JOKERS
export const JOKERS = [
  { key: "j_joker", label: "Joker" },
  { key: "j_greedy_joker", label: "Greedy Joker" },
  { key: "j_lusty_joker", label: "Lusty Joker" },
  { key: "j_wrathful_joker", label: "Wrathful Joker" },
  { key: "j_gluttenous_joker", label: "Gluttonous Joker" },
  { key: "j_jolly", label: "Jolly Joker" },
  { key: "j_zany", label: "Zany Joker" },
  { key: "j_mad", label: "Mad Joker" },
  { key: "j_crazy", label: "Crazy Joker" },
  { key: "j_droll", label: "Droll Joker" },
  { key: "j_sly", label: "Sly Joker" },
  { key: "j_wily", label: "Wily Joker" },
  { key: "j_clever", label: "Clever Joker" },
  { key: "j_devious", label: "Devious Joker" },
  { key: "j_crafty", label: "Crafty Joker" },
  { key: "j_half", label: "Half Joker" },
  { key: "j_stencil", label: "Joker Stencil" },
  { key: "j_four_fingers", label: "Four Fingers" },
  { key: "j_mime", label: "Mime" },
  { key: "j_credit_card", label: "Credit Card" },
  { key: "j_ceremonial", label: "Ceremonial Dagger" },
  { key: "j_banner", label: "Banner" },
  { key: "j_mystic_summit", label: "Mystic Summit" },
  { key: "j_marble", label: "Marble Joker" },
  { key: "j_loyalty_card", label: "Loyalty Card" },
  { key: "j_8_ball", label: "8 Ball" },
  { key: "j_misprint", label: "Misprint" },
  { key: "j_dusk", label: "Dusk" },
  { key: "j_raised_fist", label: "Raised Fist" },
  { key: "j_chaos", label: "Chaos the Clown" },
  { key: "j_fibonacci", label: "Fibonacci" },
  { key: "j_steel_joker", label: "Steel Joker" },
  { key: "j_scary_face", label: "Scary Face" },
  { key: "j_abstract", label: "Abstract Joker" },
  { key: "j_delayed_grat", label: "Delayed Gratification" },
  { key: "j_hack", label: "Hack" },
  { key: "j_pareidolia", label: "Pareidolia" },
  { key: "j_gros_michel", label: "Gros Michel" },
  { key: "j_even_steven", label: "Even Steven" },
  { key: "j_odd_todd", label: "Odd Todd" },
  { key: "j_scholar", label: "Scholar" },
  { key: "j_business", label: "Business Card" },
  { key: "j_supernova", label: "Supernova" },
  { key: "j_ride_the_bus", label: "Ride the Bus" },
  { key: "j_space", label: "Space Joker" },
  { key: "j_egg", label: "Egg" },
  { key: "j_burglar", label: "Burglar" },
  { key: "j_blackboard", label: "Blackboard" },
  { key: "j_runner", label: "Runner" },
  { key: "j_ice_cream", label: "Ice Cream" },
  { key: "j_dna", label: "DNA" },
  { key: "j_splash", label: "Splash" },
  { key: "j_blue_joker", label: "Blue Joker" },
  { key: "j_sixth_sense", label: "Sixth Sense" },
  { key: "j_constellation", label: "Constellation" },
  { key: "j_hiker", label: "Hiker" },
  { key: "j_faceless", label: "Faceless Joker" },
  { key: "j_green_joker", label: "Green Joker" },
  { key: "j_superposition", label: "Superposition" },
  { key: "j_todo_list", label: "To Do List" },
  { key: "j_cavendish", label: "Cavendish" },
  { key: "j_card_sharp", label: "Card Sharp" },
  { key: "j_red_card", label: "Red Card" },
  { key: "j_madness", label: "Madness" },
  { key: "j_square_joker", label: "Square Joker" },
  { key: "j_seance", label: "Séance" },
  { key: "j_riff_raff", label: "Riff-Raff" },
  { key: "j_vampire", label: "Vampire" },
  { key: "j_shortcut", label: "Shortcut" },
  { key: "j_hologram", label: "Hologram" },
  { key: "j_vagabond", label: "Vagabond" },
  { key: "j_baron", label: "Baron" },
  { key: "j_cloud_9", label: "Cloud 9" },
  { key: "j_rocket", label: "Rocket" },
  { key: "j_obelisk", label: "Obelisk" },
  { key: "j_midas_mask", label: "Midas Mask" },
  { key: "j_luchador", label: "Luchador" },
  { key: "j_photograph", label: "Photograph" },
  { key: "j_gift", label: "Gift Card" },
  { key: "j_turtle_bean", label: "Turtle Bean" },
  { key: "j_erosion", label: "Erosion" },
  { key: "j_reserved_parking", label: "Reserved Parking" },
  { key: "j_mail", label: "Mail-In Rebate" },
  { key: "j_to_the_moon", label: "To the Moon" },
  { key: "j_hallucination", label: "Hallucination" },
  { key: "j_fortune_teller", label: "Fortune Teller" },
  { key: "j_juggler", label: "Juggler" },
  { key: "j_drunkard", label: "Drunkard" },
  { key: "j_stone", label: "Stone Joker" },
  { key: "j_golden", label: "Golden Joker" },
  { key: "j_lucky_cat", label: "Lucky Cat" },
  { key: "j_baseball", label: "Baseball Card" },
  { key: "j_bull", label: "Bull" },
  { key: "j_diet_cola", label: "Diet Cola" },
  { key: "j_trading", label: "Trading Card" },
  { key: "j_flash", label: "Flash Card" },
  { key: "j_popcorn", label: "Popcorn" },
  { key: "j_trousers", label: "Spare Trousers" },
  { key: "j_ancient", label: "Ancient Joker" },
  { key: "j_ramen", label: "Ramen" },
  { key: "j_walkie_talkie", label: "Walkie Talkie" },
  { key: "j_selzer", label: "Seltzer" },
  { key: "j_castle", label: "Castle" },
  { key: "j_smiley", label: "Smiley Face" },
  { key: "j_campfire", label: "Campfire" },
  { key: "j_golden_ticket", label: "Golden Ticket" },
  { key: "j_mr_bones", label: "Mr. Bones" },
  { key: "j_acrobat", label: "Acrobat" },
  { key: "j_sock_and_buskin", label: "Sock and Buskin" },
  { key: "j_swashbuckler", label: "Swashbuckler" },
  { key: "j_troubadour", label: "Troubadour" },
  { key: "j_certificate", label: "Certificate" },
  { key: "j_smeared", label: "Smeared Joker" },
  { key: "j_throwback", label: "Throwback" },
  { key: "j_hanging_chad", label: "Hanging Chad" },
  { key: "j_rough_gem", label: "Rough Gem" },
  { key: "j_bloodstone", label: "Bloodstone" },
  { key: "j_arrowhead", label: "Arrowhead" },
  { key: "j_onyx_agate", label: "Onyx Agate" },
  { key: "j_glass", label: "Glass Joker" },
  { key: "j_ring_master", label: "Showman" },
  { key: "j_flower_pot", label: "Flower Pot" },
  { key: "j_blueprint", label: "Blueprint" },
  { key: "j_wee", label: "Wee Joker" },
  { key: "j_merry_andy", label: "Merry Andy" },
  { key: "j_oops", label: "Oops! All 6s" },
  { key: "j_idol", label: "The Idol" },
  { key: "j_seeing_double", label: "Seeing Double" },
  { key: "j_matador", label: "Matador" },
  { key: "j_hit_the_road", label: "Hit the Road" },
  { key: "j_duo", label: "The Duo" },
  { key: "j_trio", label: "The Trio" },
  { key: "j_family", label: "The Family" },
  { key: "j_order", label: "The Order" },
  { key: "j_tribe", label: "The Tribe" },
  { key: "j_stuntman", label: "Stuntman" },
  { key: "j_invisible", label: "Invisible Joker" },
  { key: "j_brainstorm", label: "Brainstorm" },
  { key: "j_satellite", label: "Satellite" },
  { key: "j_shoot_the_moon", label: "Shoot the Moon" },
  { key: "j_drivers_license", label: "Driver's License" },
  { key: "j_cartomancer", label: "Cartomancer" },
  { key: "j_astronomer", label: "Astronomer" },
  { key: "j_burnt", label: "Burnt Joker" },
  { key: "j_bootstraps", label: "Bootstraps" },
  { key: "j_caino", label: "Canio" },
  { key: "j_triboulet", label: "Triboulet" },
  { key: "j_yorick", label: "Yorick" },
  { key: "j_chicot", label: "Chicot" },
  { key: "j_perkeo", label: "Perkeo" },
] as const;

export const JOKER_KEYS = JOKERS.map((joker) => joker.key);
export const JOKER_LABELS = JOKERS.map((joker) => joker.label);

// Ranks
export const RANKS = [
  { value: "2", label: "2", id: 2 },
  { value: "3", label: "3", id: 3 },
  { value: "4", label: "4", id: 4 },
  { value: "5", label: "5", id: 5 },
  { value: "6", label: "6", id: 6 },
  { value: "7", label: "7", id: 7 },
  { value: "8", label: "8", id: 8 },
  { value: "9", label: "9", id: 9 },
  { value: "10", label: "10", id: 10 },
  { value: "J", label: "Jack", id: 11 },
  { value: "Q", label: "Queen", id: 12 },
  { value: "K", label: "King", id: 13 },
  { value: "A", label: "Ace", id: 14 },
] as const;

export const RANK_VALUES = RANKS.map((rank) => rank.value);
export const RANK_LABELS = RANKS.map((rank) => rank.label);

export const RANK_GROUPS = [
  { value: "face", label: "Face Card (J,Q,K)" },
  { value: "even", label: "Even Card (2,4,6,8,10)" },
  { value: "odd", label: "Odd Card (A,3,5,7,9)" },
] as const;

export const RANK_GROUP_VALUES = RANK_GROUPS.map((group) => group.value);

// Suits
export const SUITS = [
  { value: "Spades", label: "Spades" },
  { value: "Hearts", label: "Hearts" },
  { value: "Diamonds", label: "Diamonds" },
  { value: "Clubs", label: "Clubs" },
] as const;

export const SUIT_VALUES = SUITS.map((suit) => suit.value);
export const SUIT_LABELS = SUITS.map((suit) => suit.label);

export const SUIT_GROUPS = [
  { value: "red", label: "Red Suit (Hearts, Diamonds)" },
  { value: "black", label: "Black Suit (Spades, Clubs)" },
] as const;

export const SUIT_GROUP_VALUES = SUIT_GROUPS.map((group) => group.value);

// Poker Hands
export const POKER_HANDS = [
  { value: "High Card", label: "High Card" },
  { value: "Pair", label: "Pair" },
  { value: "Two Pair", label: "Two Pair" },
  { value: "Three of a Kind", label: "Three of a Kind" },
  { value: "Straight", label: "Straight" },
  { value: "Flush", label: "Flush" },
  { value: "Full House", label: "Full House" },
  { value: "Four of a Kind", label: "Four of a Kind" },
  { value: "Five of a Kind", label: "Five of a Kind" },
  { value: "Straight Flush", label: "Straight Flush" },
  { value: "Flush House", label: "Flush House" },
  { value: "Flush Five", label: "Flush Five" },
] as const;

export const POKER_HAND_VALUES = POKER_HANDS.map((hand) => hand.value);
export const POKER_HAND_LABELS = POKER_HANDS.map((hand) => hand.label);

// Editions
export const VANILLA_EDITIONS = [
  { key: "e_foil", value: "foil", label: "Foil (+50 Chips)" },
  { key: "e_holo", value: "holo", label: "Holographic (+10 Mult)" },
  {
    key: "e_polychrome",
    value: "polychrome",
    label: "Polychrome (X1.5 Mult)",
  },
  { key: "e_negative", value: "negative", label: "Negative (+1 Joker slot)" },
] as const;

// Sticker
export const STICKERS = [
  { key: "eternal", value: "eternal", label: "Eternal (Can't be sold or destroyed)" },
  { key: "rental", value: "rental", label: "Rental (Lose money at end of round)" },
  { key: "perishable", value: "perishable", label: "Perishable (Debuffed after 3 rounds)" },
] as const;

export const STICKER_KEYS = STICKERS.map((sticker) => sticker.key);
export const STICKER_VALUES = STICKERS.map((sticker) => sticker.value);
export const STICKER_LABELS = STICKERS.map((sticker) => sticker.label);

// Tarot Cards
export const TAROT_CARDS = [
  { key: "c_fool", value: "c_fool", label: "The Fool" },
  { key: "c_magician", value: "c_magician", label: "The Magician" },
  {
    key: "c_high_priestess",
    value: "c_high_priestess",
    label: "The High Priestess",
  },
  { key: "c_empress", value: "c_empress", label: "The Empress" },
  { key: "c_emperor", value: "c_emperor", label: "The Emperor" },
  { key: "c_heirophant", value: "c_heirophant", label: "The Hierophant" },
  { key: "c_lovers", value: "c_lovers", label: "The Lovers" },
  { key: "c_chariot", value: "c_chariot", label: "The Chariot" },
  { key: "c_justice", value: "c_justice", label: "Justice" },
  { key: "c_hermit", value: "c_hermit", label: "The Hermit" },
  {
    key: "c_wheel_of_fortune",
    value: "c_wheel_of_fortune",
    label: "Wheel of Fortune",
  },
  { key: "c_strength", value: "c_strength", label: "Strength" },
  { key: "c_hanged_man", value: "c_hanged_man", label: "The Hanged Man" },
  { key: "c_death", value: "c_death", label: "Death" },
  { key: "c_temperance", value: "c_temperance", label: "Temperance" },
  { key: "c_devil", value: "c_devil", label: "The Devil" },
  { key: "c_tower", value: "c_tower", label: "The Tower" },
  { key: "c_star", value: "c_star", label: "The Star" },
  { key: "c_moon", value: "c_moon", label: "The Moon" },
  { key: "c_sun", value: "c_sun", label: "The Sun" },
  { key: "c_judgement", value: "c_judgement", label: "Judgement" },
  { key: "c_world", value: "c_world", label: "The World" },
] as const;

export const TAROT_CARD_KEYS = TAROT_CARDS.map((card) => card.key);
export const TAROT_CARD_VALUES = TAROT_CARDS.map((card) => card.value);
export const TAROT_CARD_LABELS = TAROT_CARDS.map((card) => card.label);

// Planet Cards
export const PLANET_CARDS = [
  { key: "c_pluto", value: "c_pluto", label: "Pluto" },
  { key: "c_mercury", value: "c_mercury", label: "Mercury" },
  { key: "c_uranus", value: "c_uranus", label: "Uranus" },
  { key: "c_venus", value: "c_venus", label: "Venus" },
  { key: "c_saturn", value: "c_saturn", label: "Saturn" },
  { key: "c_jupiter", value: "c_jupiter", label: "Jupiter" },
  { key: "c_earth", value: "c_earth", label: "Earth" },
  { key: "c_mars", value: "c_mars", label: "Mars" },
  { key: "c_neptune", value: "c_neptune", label: "Neptune" },
  { key: "c_planet_x", value: "c_planet_x", label: "Planet X" },
  { key: "c_ceres", value: "c_ceres", label: "Ceres" },
  { key: "c_eris", value: "c_eris", label: "Eris" },
] as const;

export const PLANET_CARD_KEYS = PLANET_CARDS.map((card) => card.key);
export const PLANET_CARD_VALUES = PLANET_CARDS.map((card) => card.value);
export const PLANET_CARD_LABELS = PLANET_CARDS.map((card) => card.label);

// Spectral Cards
export const SPECTRAL_CARDS = [
  { key: "c_familiar", value: "c_familiar", label: "Familiar" },
  { key: "c_grim", value: "c_grim", label: "Grim" },
  { key: "c_incantation", value: "c_incantation", label: "Incantation" },
  { key: "c_talisman", value: "c_talisman", label: "Talisman" },
  { key: "c_aura", value: "c_aura", label: "Aura" },
  { key: "c_wraith", value: "c_wraith", label: "Wraith" },
  { key: "c_sigil", value: "c_sigil", label: "Sigil" },
  { key: "c_ouija", value: "c_ouija", label: "Ouija" },
  { key: "c_ectoplasm", value: "c_ectoplasm", label: "Ectoplasm" },
  { key: "c_immolate", value: "c_immolate", label: "Immolate" },
  { key: "c_ankh", value: "c_ankh", label: "Ankh" },
  { key: "c_deja_vu", value: "c_deja_vu", label: "Deja Vu" },
  { key: "c_hex", value: "c_hex", label: "Hex" },
  { key: "c_trance", value: "c_trance", label: "Trance" },
  { key: "c_medium", value: "c_medium", label: "Medium" },
  { key: "c_cryptid", value: "c_cryptid", label: "Cryptid" },
  { key: "c_soul", value: "c_soul", label: "The Soul" },
  { key: "c_black_hole", value: "c_black_hole", label: "Black Hole" },
] as const;

export const SPECTRAL_CARD_KEYS = SPECTRAL_CARDS.map((card) => card.key);
export const SPECTRAL_CARD_VALUES = SPECTRAL_CARDS.map((card) => card.value);
export const SPECTRAL_CARD_LABELS = SPECTRAL_CARDS.map((card) => card.label);

// All Consumables Combined
export const ALL_CONSUMABLES = [
  ...TAROT_CARDS,
  ...PLANET_CARDS,
  ...SPECTRAL_CARDS,
] as const;

export const ALL_CONSUMABLE_KEYS = ALL_CONSUMABLES.map((card) => card.key);
export const ALL_CONSUMABLE_VALUES = ALL_CONSUMABLES.map((card) => card.value);
export const ALL_CONSUMABLE_LABELS = ALL_CONSUMABLES.map((card) => card.label);

// Blind Types
export const BLIND_TYPES = [
  { value: "small", label: "Small Blind" },
  { value: "big", label: "Big Blind" },
  { value: "boss", label: "Boss Blind" },
] as const;

export const BLIND_TYPE_VALUES = BLIND_TYPES.map((blind) => blind.value);
export const BLIND_TYPE_LABELS = BLIND_TYPES.map((blind) => blind.label);

// Tags
export const TAGS = [
  {
    value: "uncommon",
    label: "Uncommon Tag - Next shop has free Uncommon Joker",
  },
  { value: "rare", label: "Rare Tag - Next shop has free Rare Joker" },
  {
    value: "negative",
    label: "Negative Tag - Next base Joker becomes Negative (+1 slot) and free",
  },
  {
    value: "foil",
    label: "Foil Tag - Next base Joker becomes Foil (+50 Chips) and free",
  },
  {
    value: "holo",
    label: "Holographic Tag - Next base Joker becomes Holo (+10 Mult) and free",
  },
  {
    value: "polychrome",
    label:
      "Polychrome Tag - Next base Joker becomes Polychrome (X1.5 Mult) and free",
  },
  {
    value: "investment",
    label: "Investment Tag - Gain $25 after defeating next Boss Blind",
  },
  {
    value: "voucher",
    label: "Voucher Tag - Adds a Voucher to next shop",
  },
  { value: "boss", label: "Boss Tag - Re-rolls the next Boss Blind" },
  {
    value: "standard",
    label: "Standard Tag - Immediately open free Mega Standard Pack",
  },
  {
    value: "charm",
    label: "Charm Tag - Immediately open free Mega Arcana Pack",
  },
  {
    value: "meteor",
    label: "Meteor Tag - Immediately open free Mega Celestial Pack",
  },
  {
    value: "buffoon",
    label: "Buffoon Tag - Immediately open free Mega Buffoon Pack",
  },
  {
    value: "handy",
    label: "Handy Tag - Gain $1 for each hand played this run",
  },
  {
    value: "garbage",
    label: "Garbage Tag - Gain $1 for each unused discard this run",
  },
  {
    value: "ethereal",
    label: "Ethereal Tag - Immediately open free Spectral Pack",
  },
  {
    value: "coupon",
    label: "Coupon Tag - Next shop items are free ($0)",
  },
  {
    value: "double",
    label: "Double Tag - Gives copy of next Tag selected",
  },
  {
    value: "juggle",
    label: "Juggle Tag - +3 Hand Size for next round only",
  },
  { value: "d_six", label: "D6 Tag - Next shop rerolls start at $0" },
  {
    value: "top_up",
    label: "Top-up Tag - Create up to 2 Common Jokers",
  },
  {
    value: "speed",
    label: "Speed Tag - Gives $5 for each Blind skipped this run",
  },
  {
    value: "orbital",
    label: "Orbital Tag - Upgrades random Poker Hand by 3 levels",
  },
  {
    value: "economy",
    label: "Economy Tag - Doubles your money (max +$40)",
  },
] as const;

export const TAG_TYPES: Record<string, string> = {
  uncommon: "tag_uncommon",
  rare: "tag_rare",
  negative: "tag_negative",
  foil: "tag_foil",
  holo: "tag_holo",
  polychrome: "tag_polychrome",
  investment: "tag_investment",
  voucher: "tag_voucher",
  boss: "tag_boss",
  standard: "tag_standard",
  charm: "tag_charm",
  meteor: "tag_meteor",
  buffoon: "tag_buffoon",
  handy: "tag_handy",
  garbage: "tag_garbage",
  ethereal: "tag_ethereal",
  coupon: "tag_coupon",
  double: "tag_double",
  juggle: "tag_juggle",
  d_six: "tag_d_six",
  top_up: "tag_top_up",
  speed: "tag_speed",
  orbital: "tag_orbital",
  economy: "tag_economy",
} as const;

// Consumable Types
export const CONSUMABLE_TYPES = [
  { value: "any", label: "Any Consumable" },
  { value: "tarot", label: "Tarot Card" },
  { value: "planet", label: "Planet Card" },
  { value: "spectral", label: "Spectral Card" },
] as const;

export const CONSUMABLE_TYPE_VALUES = CONSUMABLE_TYPES.map(
  (type) => type.value
);
export const CONSUMABLE_TYPE_LABELS = CONSUMABLE_TYPES.map(
  (type) => type.label
);

export const VANILLA_SOUNDS = [
  { value: "ambientFire1", label: "AmbientFire" },
  { value: "ambientFire2", label: "AmbientFire 2" },
  { value: "ambientFire3", label: "AmbientFire 3" },
  { value: "ambientOrgan1", label: "AmbientOrgan" },
  { value: "button", label: "Button" },
  { value: "cancel", label: "Cancel" },
  { value: "card1", label: "Card" },
  { value: "card3", label: "Card 3" },
  { value: "cardFan2", label: "Card Fan 2" },
  { value: "cardSlide1", label: "Card Slide" },
  { value: "cardSlide2", label: "Card Slide 2" },
  { value: "chips1", label: "Chips" },
  { value: "chips2", label: "Chips 2" },
  { value: "coin1", label: "Coin" },
  { value: "coin2", label: "Coin 2" },
  { value: "coin3", label: "Coin 3" },
  { value: "coin4", label: "Coin 4" },
  { value: "coin5", label: "Coin 5" },
  { value: "coin6", label: "Coin 6" },
  { value: "coin7", label: "Coin 7" },
  { value: "crumple1", label: "Crumple" },
  { value: "crumple2", label: "Crumple 2" },
  { value: "crumple3", label: "Crumple 3" },
  { value: "crumple4", label: "Crumple 4" },
  { value: "crumple5", label: "Crumple 5" },
  { value: "crumpleLong1", label: "Crumple Long" },
  { value: "crumpleLong2", label: "Crumple Long 2" },
  { value: "explosion1", label: "Explosion" },
  { value: "explosion_buildup1", label: "Explosion Buildup" },
  { value: "explosion_release1", label: "Explosion Release" },
  { value: "foil1", label: "Foil" },
  { value: "foil2", label: "Foil 2" },
  { value: "generic1", label: "Generic" },
  { value: "glass1", label: "Glass" },
  { value: "glass2", label: "Glass 2" },
  { value: "glass3", label: "Glass 3" },
  { value: "glass4", label: "Glass 4" },
  { value: "glass5", label: "Glass 5" },
  { value: "glass6", label: "Glass 6" },
  { value: "gold_seal", label: "Gold Seal" },
  { value: "gong", label: "Gong" },
  { value: "highlight1", label: "Highlight" },
  { value: "highlight2", label: "Highlight 2" },
  { value: "holo1", label: "Holo" },
  { value: "introPad1", label: "Intro Pad" },
  { value: "magic_crumple", label: "Magic Crumple" },
  { value: "magic_crumple2", label: "Magic Crumple 2" },
  { value: "magic_crumple3", label: "Magic Crumple 3" },
  { value: "multhit1", label: "Mult" },
  { value: "multhit2", label: "Mult 2" },
  { value: "music1", label: "Music (Menu Music)" },
  { value: "music2", label: "Music 2 (Arcana Pack Music)" },
  { value: "music3", label: "Music 3 (Celestial  Pack Music)"},
  { value: "music4", label: "Music 4 (Shop Music)" },
  { value: "music5", label: "Music 5 (Boss Blind Music)" },
  { value: "negative", label: "Negative" },
  { value: "other1", label: "Other" },
  { value: "paper1", label: "Paper" },
  { value: "polychrome1", label: "Polychrome" },
  { value: "slice1", label: "Slice" },
  { value: "splash_buildup", label: "Splash Buildup" },
  { value: "tarot1", label: "Tarot" },
  { value: "tarot2", label: "Tarot 2" },
  { value: "timpani", label: "Timpani" },
  { value: "voice1", label: "Voice" },
  { value: "voice2", label: "Voice 2" },
  { value: "voice3", label: "Voice 3" },
  { value: "voice4", label: "Voice 4" },
  { value: "voice5", label: "Voice 5" },
  { value: "voice6", label: "Voice 6" },
  { value: "voice7", label: "Voice 7" },
  { value: "voice8", label: "Voice 8" },
  { value: "voice9", label: "Voice 9" },
  { value: "voice10", label: "Voice 10" },
  { value: "voice11", label: "Voice 11" },
  { value: "whoosh", label: "Whoosh" },
  { value: "whoosh1", label: "Whoosh 1" },
  { value: "whoosh2", label: "Whoosh 2" },
  { value: "whoosh_long", label: "Whoosh Long" },
  { value: "win", label: "Win" },
] as const;

export const VANILLA_SOUNDS_TYPE_VALUES = VANILLA_SOUNDS.map(
  (sound) => sound.value
);
export const VANILLA_SOUNDS_TYPE_LABELS = VANILLA_SOUNDS.map(
  (sound) => sound.label
);

// Comparison Operators
export const COMPARISON_OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
  { value: "greater_equals", label: "greater than or equal to" },
  { value: "less_equals", label: "less than or equal to" },
] as const;

export const COMPARISON_OPERATOR_VALUES = COMPARISON_OPERATORS.map(
  (op) => op.value
);
export const COMPARISON_OPERATOR_LABELS = COMPARISON_OPERATORS.map(
  (op) => op.label
);

// Card Scope
export const CARD_SCOPES = [
  { value: "scoring", label: "Scoring cards only" },
  { value: "all_played", label: "All played cards" },
] as const;

export const CARD_SCOPE_VALUES = CARD_SCOPES.map((scope) => scope.value);
export const CARD_SCOPE_LABELS = CARD_SCOPES.map((scope) => scope.label);

// Utilities

// Convert a rank string to its numeric ID
export const getRankId = (rank: string): number => {
  const rankData = RANKS.find((r) => r.value === rank || r.label === rank);
  return rankData?.id ?? (rank === "Ace" ? 14 : parseInt(rank) || 14);
};

// Get rank data by value
export const getRankByValue = (value: string) => {
  return RANKS.find((rank) => rank.value === value);
};

// Get rank data by ID
export const getRankById = (id: number) => {
  return RANKS.find((rank) => rank.id === id);
};

// Get suit data by value
export const getSuitByValue = (value: string) => {
  return SUITS.find((suit) => suit.value === value);
};

// Get tarot card data by key
export const getTarotCardByKey = (key: string) => {
  return TAROT_CARDS.find((card) => card.key === key);
};

// Get planet card data by key
export const getPlanetCardByKey = (key: string) => {
  return PLANET_CARDS.find((card) => card.key === key);
};

// Get spectral card data by key
export const getSpectralCardByKey = (key: string) => {
  return SPECTRAL_CARDS.find((card) => card.key === key);
};

// Get any consumable card data by key
export const getConsumableByKey = (key: string) => {
  return ALL_CONSUMABLES.find((card) => card.key === key);
};

// Check if a rank is a face card
export const isFaceCard = (rank: string): boolean => {
  return ["J", "Q", "K", "Jack", "Queen", "King"].includes(rank);
};

// Check if a rank is even
export const isEvenCard = (rank: string): boolean => {
  return ["2", "4", "6", "8", "10"].includes(rank);
};

// Check if a rank is odd
export const isOddCard = (rank: string): boolean => {
  return ["A", "3", "5", "7", "9", "Ace"].includes(rank);
};

// Check if a suit is red
export const isRedSuit = (suit: string): boolean => {
  return ["Hearts", "Diamonds"].includes(suit);
};

// Check if a suit is black
export const isBlackSuit = (suit: string): boolean => {
  return ["Spades", "Clubs"].includes(suit);
};

// Check if a card key is a tarot card
export const isTarotCard = (key: string): boolean => {
  return (TAROT_CARD_KEYS as readonly string[]).includes(key);
};

// Check if a card key is a planet card
export const isPlanetCard = (key: string): boolean => {
  return (PLANET_CARD_KEYS as readonly string[]).includes(key);
};

// Check if a card key is a spectral card
export const isSpectralCard = (key: string): boolean => {
  return (SPECTRAL_CARD_KEYS as readonly string[]).includes(key);
};

// Check if a card key is any consumable
export const isConsumableCard = (key: string): boolean => {
  return (ALL_CONSUMABLE_KEYS as readonly string[]).includes(key);
};
