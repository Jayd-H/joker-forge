import type { Effect } from "../ruleBuilder/types";
import { JokerData, EnhancementData, SealData, EditionData } from "../data/BalatroUtils";
import { generateAddCardToDeckEffectCode } from "./Effects/AddCardToDeckEffect";
import { generateAddCardToHandEffectCode } from "./Effects/AddCardToHandEffect";
import { generateAddChipsEffectCode } from "./Effects/AddChipsEffect";
import { generateApplyXChipsEffectCode } from "./Effects/ApplyXChipsEffect";
import { generateApplyExpChipsEffectCode } from "./Effects/ApplyExpChipsEffect";
import { generateApplyHyperChipsEffectCode } from "./Effects/ApplyHyperChipsEffect";
import { generateAddMultEffectCode } from "./Effects/AddMultEffect";
import { generateApplyXMultEffectCode } from "./Effects/ApplyXMultEffect";
import { generateApplyExpMultEffectCode } from "./Effects/ApplyExpMultEffect";
import { generateApplyHyperMultEffectCode } from "./Effects/ApplyHyperMultEffect";
import { generateDrawCardsEffectCode } from "./Effects/DrawCardsEffect";
import { generateBalanceChipsAndMultEffectCode } from "./Effects/BalanceChipsAndMultEffect";
import { generateSwapChipsAndMultEffectCode } from "./Effects/SwapChipsAndMultEffect";
import { generateShowMessageEffectCode } from "./Effects/ShowMessageEffect";
import { generateDisableBossBlindEffectCode, generateDisableBossBlindPassiveEffectCode } from "./Effects/DisableBossBlindEffect";
import { generateEmitFlagEffectCode } from "./Effects/EmitFlagEffect";
import { generatePlaySoundEffectCode } from "./Effects/PlaySoundEffect";
import { generateWinBlindEffectCode } from "./Effects/WinBlindEffect";
import { generateEditCardAppearanceEffectCode } from "./Effects/EditCardAppearanceEffect";
import { generateChangeJokerVariableEffectCode } from "./Effects/ChangeJokerVariableEffect";
import { generateChangePokerHandVariableEffectCode } from "./Effects/ChangePokerHandVariableEffect";
import { generateChangeSuitVariableEffectCode } from "./Effects/ChangeSuitVariableEffect";
import { generateChangeRankVariableEffectCode } from "./Effects/ChangeRankVariableEffect";
import { generateConvertAllCardToRankEffectCode } from "./Effects/ConvertAllCardsToRankEffect";
import { generateConvertAllCardsToSuitEffectCode } from "./Effects/ConvertAllCardsToSuitEffect";
import { generateConvertLeftToRightEffectCode } from "./Effects/ConvertLeftToRightEffect";
import { generateCopyConsumableEffectCode } from "./Effects/CopyConsumableEffect";
import { generateCopyJokerEffectCode } from "./Effects/CopyJokerEffect";
import { generateCrashGameEffectCode } from "./Effects/CrashGameEffect";
import { generateCreateConsumableEffectCode } from "./Effects/CreateConsumableEffect";
import { generateCreateJokerEffectCode } from "./Effects/CreateJokerEffect";
import { generateCreateLastPlayedPlanetEffectCode } from "./Effects/CreateLastPlayedPlanetEffect";
import { generateCreateTagEffectCode } from "./Effects/CreateTagEffect";
import { generateUnlockJokerEffectCode } from "./Effects/UnlockJokerEffect";
import { generateShuffleJokersEffectCode } from "./Effects/ShuffleJokersEffect";
import { generateSetSellValueEffectCode } from "./Effects/SetSellValueEffect";
import { generateSetDollarsEffectCode } from "./Effects/SetDollarsEffect";
import { generateSetAnteEffectCode } from "./Effects/SetAnteEffect";
import { generateSavedEffectCode } from "./Effects/SavedEffect";
import { generateRetriggerEffectCode } from "./Effects/RetriggerEffect";
import { generateRedeemVoucherEffectCode } from "./Effects/RedeemVoucherEffect";
import { generatePermaBonusEffectCode } from "./Effects/PermanentBonusEffect";
import { generateModProbabilityEffectCode } from "./Effects/ModProbabilityEffect";
import { generateFixProbabilityEffectCode } from "./Effects/FixProbabilityEffect";
import { generateFlipJokerEffectCode } from "./Effects/FlipJokerEffect";
import { generateForceGameOverEffectCode } from "./Effects/ForceGameOverEffect";
import { generateJuiceUpEffectCode } from "./Effects/JuiceUpEffect";
import { generateLevelUpHandEffectCode } from "./Effects/LevelUpHandEffect";
import { generateModifyBlindRequirementEffectCode } from "./Effects/ModifyBlindRequirementEffect";
import { generateModifyInternalVariableEffectCode } from "./Effects/ModifyInternalVariableEffect";
import { generateFoolEffectCode } from "./Effects/FoolEffect";
import { generateIncrementRankEffectCode } from "./Effects/IncrementRankEffect";
import { generateDestroyCardsEffectCode } from "./Effects/DestroyCardsEffect";
import { generateDestroySelfEffectCode } from "./Effects/DestroySelfEffect";
import { generateDestroyJokerEffectCode } from "./Effects/DestroyJokerEffect";
import { generateDestroyConsumableEffectCode } from "./Effects/DestroyConsumableEffect";
import { generateEditStartingCardsEffectCode } from "./Effects/EditStartingCardsEffect";
import { generateEditStartingSuitsEffectCode } from "./Effects/EditStartingSuitsEffect";
import { generateEditStartingRanksEffectCode } from "./Effects/EditStartingRanksEffect";
import { generateEditJokerEffectCode } from "./Effects/EditJokerEffect";
import { generateEditWinnerAnteEffectCode } from "./Effects/EditWinnerAnteEffect";
import { generateAddStartingCardsEffectCode } from "./Effects/AddStartingCardsEffect";
import { generateRemoveStartingCardsEffectCode } from "./Effects/RemoveStartingCardsEffect";
import { generateDestroyCardEffectCode } from "./Effects/DestroyCardEffect";
import { generateEditCardEffectCode } from "./Effects/EditCardEffect";
import { generateEditCardsEffectCode } from "./Effects/EditCardsEffect";
import { generateAllowDebtPassiveEffectCode } from "./Effects/AllowDebtEffect";
import { generateCopyJokerAbilityPassiveEffectCode } from "./Effects/CopyJokerAbilityEffect";
import { generateEditHandSizeEffectCode, generateEditHandSizePassiveEffectCode } from "./Effects/EditHandSizeEffect";
import { generateEditPlaySizeEffectCode, generateEditPlaySizePassiveEffectCode } from "./Effects/EditPlaySizeEffect";
import { generateEditDiscardSizeEffectCode, generateEditDiscardSizePassiveEffectCode } from "./Effects/EditDiscardSizeEffect";
import { generateEditDiscardsEffectCode, generateEditDiscardsPassiveEffectCode } from "./Effects/EditDiscardsEffect";
import { generateEditHandsEffectCode, generateEditHandsPassiveEffectCode } from "./Effects/EditHandsEffect";
import { generateSplashPassiveEffectCode } from "./Effects/SplashEffect";
import { generateFreeRerollsEffectCode, generateFreeRerollsPassiveEffectCode } from "./Effects/FreeRerollsEffect";
import { generateEditBoosterSlotsEffectCode, generateEditBoosterSlotsPassiveEffectCode } from "./Effects/EditBoosterSlotsEffect";
import { generateEditConsumableSlotsEffectCode, generateEditConsumableSlotsPassiveEffectCode } from "./Effects/EditConsumableSlotsEffect";
import { generateEditJokerSlotsEffectCode, generateEditJokerSlotsPassiveEffectCode } from "./Effects/EditJokerSlotsEffect";
import { generateEditVoucherSlotsEffectCode, generateEditVoucherSlotsPassiveEffectCode } from "./Effects/EditVoucherSlotsEffect";
import { generateDiscountItemsEffectCode, generateDiscountItemsPassiveEffectCode } from "./Effects/DiscountItemsEffect";
import { generateReduceFlushStraightRequirementsPassiveEffectCode } from "./Effects/ReduceFlushStraightRequirementEffect";
import { generateShortcutPassiveEffectCode } from "./Effects/ShortcutEffect";
import { generateShowmanPassiveEffectCode } from "./Effects/ShowmanEffect";
import { generateCombineRanksPassiveEffectCode } from "./Effects/CombineRanksEffect";
import { generateCombineSuitsPassiveEffectCode } from "./Effects/CombineSuitsEffect";
import { generateCreateCopyTriggeredCardEffectCode } from "./Effects/CreateCopyTriggeredCardEffect";
import { generateCreateCopyPlayedCardEffectCode } from "./Effects/CreateCopyPlayedCardEffect";
import { generateEditDiscardsMoneyEffectCode } from "./Effects/EditEndRoundDiscardMoneyEffect";
import { generateEditHandsMoneyEffectCode } from "./Effects/EditEndRoundHandMoneyEffect";
import { generateEditInterestCapEffectCode } from "./Effects/EditInterestCapEffect";
import { generateEditRerollPriceEffectCode } from "./Effects/EditRerollPriceEffect";
import { generateEditBoosterPacksEffectCode } from "./Effects/EditBoosterPacksEffect";
import { generateEditShopCardSlotsEffectCode } from "./Effects/EditShopCardSlotsEffect";
import { generateEditRarityWeightEffectCode } from "./Effects/EditRarityWeightEffect";
import { generateEditItemWeightEffectCode } from "./Effects/EditItemWeightEffect";
import { generateEditCardsInHandEffectCode } from "./Effects/EditCardsInHandEffect";

interface ExtendedEffect extends Effect {
  _isInRandomGroup?: boolean;
  _ruleContext?: string;
  _effectIndex?: number;
}

export interface PassiveEffectResult {
  addToDeck?: string;
  removeFromDeck?: string;
  configVariables?: string[];
  locVars?: string[];
  calculateFunction?: string;
  needsHook?: {
    hookType: string;
    jokerKey: string;
    effectParams: unknown;
  };
}

export interface ConfigExtraVariable {
  name: string;
  value: number | string;
  description?: string;
}

export interface EffectReturn {
  statement: string;
  message?: string;
  colour: string;
  configVariables?: ConfigExtraVariable[] ;
  effectType?: string;
  customCanUse?: string;
}

export interface ReturnStatementResult {
  statement: string;
  colour: string;
  preReturnCode?: string;
  isRandomChance?: boolean;
  configVariables?: ConfigExtraVariable[];
  customCanUse?: string;
}

export interface CalculateFunctionResult {
  code: string;
  configVariables: ConfigExtraVariable[];
}

export const generateSingleEffect = (
  effect: ExtendedEffect,
  cleanItemType: string,
  triggerType: string,
  sameTypeCount: number = 0,
  modprefix: string,
  joker?: JokerData,
  card?: EnhancementData | EditionData | SealData,
): EffectReturn => {
  const itemType = (cleanItemType === 'seal' || cleanItemType === 'edition' || cleanItemType ==='enhancement') 
    ? 'card' : cleanItemType

  switch (effect.type) {
    case "add_card_to_deck":
      return generateAddCardToDeckEffectCode(effect, itemType, triggerType, modprefix, joker)
    case "add_card_to_hand":
      return generateAddCardToHandEffectCode(effect, itemType, triggerType, modprefix, joker)
    case "add_chips":
      return generateAddChipsEffectCode(effect, itemType, sameTypeCount)
    case "apply_x_chips":
      return generateApplyXChipsEffectCode(effect, itemType, sameTypeCount)
    case "apply_exp_chips":
      return generateApplyExpChipsEffectCode(effect, itemType, sameTypeCount)
    case "apply_hyper_chips":
      return generateApplyHyperChipsEffectCode(effect, itemType, sameTypeCount)
    case "add_mult":
      return generateAddMultEffectCode(effect, itemType, sameTypeCount)
    case "apply_x_mult":
      return generateApplyXMultEffectCode(effect, itemType, sameTypeCount)
    case "apply_exp_mult":
      return generateApplyExpMultEffectCode(effect, itemType, sameTypeCount)
    case "apply_hyper_mult":
      return generateApplyHyperMultEffectCode(effect, itemType, sameTypeCount)
    case "balance_chips_mult":
      return generateBalanceChipsAndMultEffectCode(effect)
    case "swap_chips_mult":
      return generateSwapChipsAndMultEffectCode(effect)
    case "change_joker_variable":
      return generateChangeJokerVariableEffectCode(effect)
    case "change_pokerhand_variable":
      return generateChangePokerHandVariableEffectCode(effect)
    case "change_suit_variable":
      return generateChangeSuitVariableEffectCode(effect)
    case "change_rank_variable":
      return generateChangeRankVariableEffectCode(effect)
    case "modify_internal_variable":
      return generateModifyInternalVariableEffectCode(effect, triggerType)
    case "convert_all_cards_to_rank":
      return generateConvertAllCardToRankEffectCode(effect, itemType)
    case "convert_all_cards_to_suit":
      return generateConvertAllCardsToSuitEffectCode(effect, itemType)
    case "convert_left_to_right":
      return generateConvertLeftToRightEffectCode(effect, itemType)
    case "create_copy_triggered_card":
      return generateCreateCopyTriggeredCardEffectCode(effect, itemType, triggerType)
    case "create_copy_played_card":
      return generateCreateCopyPlayedCardEffectCode(effect, itemType, triggerType, joker)
    case "copy_consumable":
      return generateCopyConsumableEffectCode(effect, itemType, triggerType)
    case "copy_joker":
      return generateCopyJokerEffectCode(effect, itemType, triggerType)
    case "crash_game":
      return generateCrashGameEffectCode(effect)
    case "create_consumable":
      return generateCreateConsumableEffectCode(effect, itemType, triggerType)
    case "create_joker":
      return generateCreateJokerEffectCode(effect, itemType, triggerType)
    case "create_last_played_planet":
      return generateCreateLastPlayedPlanetEffectCode(effect, itemType)
    case "create_tag":
      return generateCreateTagEffectCode(effect, triggerType)
    case "destroy_cards":
      return generateDestroyCardsEffectCode(effect, itemType, sameTypeCount)
    case "destroy_card":
      return generateDestroyCardEffectCode(effect, itemType, triggerType)
    case "destroy_self":
      return generateDestroySelfEffectCode(effect, itemType, triggerType)
    case "destroy_joker":
      return generateDestroyJokerEffectCode(effect, itemType, triggerType, sameTypeCount)
    case "destroy_consumable":
      return generateDestroyConsumableEffectCode(effect, itemType, triggerType)
    case "draw_cards":
      return generateDrawCardsEffectCode(effect, itemType, sameTypeCount, card)
    case "disable_boss_blind":
      return generateDisableBossBlindEffectCode(effect, itemType, triggerType)
    case "discount_items":
      return generateDiscountItemsEffectCode(effect, itemType, sameTypeCount)
    case "free_rerolls":
      return generateFreeRerollsEffectCode(effect, itemType, sameTypeCount)
    case "edit_joker":
      return generateEditJokerEffectCode(effect, itemType, modprefix) // NEED TO IMPLEMENT METHODS PROPERLY
    case "edit_win_ante":
      return generateEditWinnerAnteEffectCode(effect, itemType, triggerType, sameTypeCount)
    case "edit_booster_packs":
      return generateEditBoosterPacksEffectCode(effect, itemType, sameTypeCount)
    case "edit_booster_slots":
      return generateEditBoosterSlotsEffectCode(effect, cleanItemType, sameTypeCount)
    case "edit_voucher_slots":
      return generateEditVoucherSlotsEffectCode(effect, cleanItemType, sameTypeCount)
    case "edit_shop_slots":
      return generateEditShopCardSlotsEffectCode(effect, cleanItemType, sameTypeCount) 
    // POSSIBLE MERGE FOR EDIT BOOSTER/VOUCHER/SHOP SLOTS
    case "edit_card":
      return generateEditCardEffectCode(effect, itemType, triggerType, modprefix, joker)
    case "edit_cards":
      return generateEditCardsEffectCode(effect, itemType, modprefix)
    case "edit_cards_in_hand":
      return generateEditCardsInHandEffectCode(effect, itemType, sameTypeCount, modprefix)
    case "edit_joker_slots":
      return generateEditJokerSlotsEffectCode(effect, itemType, sameTypeCount)
    case "edit_consumable_slots":
      return generateEditConsumableSlotsEffectCode(effect, itemType, sameTypeCount)
    case "edit_discards_money":
      return generateEditDiscardsMoneyEffectCode(effect, itemType, sameTypeCount)
    case "edit_hands_money":
      return generateEditHandsMoneyEffectCode(effect, itemType, sameTypeCount)
    case "edit_interest_cap":
      return generateEditInterestCapEffectCode(effect, itemType, sameTypeCount)
    case "edit_reroll_price":
      return generateEditRerollPriceEffectCode(effect, itemType, sameTypeCount)
    case "edit_hands":
      return generateEditHandsEffectCode(effect, itemType, sameTypeCount)
    case "edit_discards":
      return generateEditDiscardsEffectCode(effect, itemType, sameTypeCount)
    case "edit_discard_size":
      return generateEditDiscardSizeEffectCode(effect, cleanItemType, sameTypeCount)
    case "edit_hand_size":
      return generateEditHandSizeEffectCode(effect, cleanItemType, sameTypeCount)
    case "edit_play_size":
      return generateEditPlaySizeEffectCode(effect, cleanItemType, sameTypeCount)
    // POSSIBLE MERGE FOR EDIT DISCARD/HAND/PLAY SIZE 
    case "edit_card_appearance":
      return generateEditCardAppearanceEffectCode(effect)
    case "edit_rarity_weight":
      return generateEditRarityWeightEffectCode(effect, cleanItemType, sameTypeCount)
    case "edit_item_weight":
      return generateEditItemWeightEffectCode(effect, cleanItemType, sameTypeCount)
    // POSSIBLE MERGE FOR EDIT ITEM/RARITY WEIGHT
    case "fool_effect":
      return generateFoolEffectCode(effect, itemType)
    case "increment_rank":
      return generateIncrementRankEffectCode(effect, itemType)
    case "modify_blind_requirement":
      return generateModifyBlindRequirementEffectCode(effect, cleanItemType)
    case "flip_joker":
      return generateFlipJokerEffectCode(effect)
    case "juice_up_joker":
      return generateJuiceUpEffectCode(effect, sameTypeCount, 'joker')
    case "juice_up_card":
      return generateJuiceUpEffectCode(effect, sameTypeCount, 'card')
    case "level_up_hand":
      return generateLevelUpHandEffectCode(effect, itemType, triggerType, sameTypeCount, joker, card)
    case "force_game_over":
      return generateForceGameOverEffectCode(effect)
    case "fix_probability":
      return generateFixProbabilityEffectCode(effect, sameTypeCount)
    case "mod_probability":
      return generateModProbabilityEffectCode(effect, sameTypeCount)
    case "prevent_game_over":
      return generateSavedEffectCode(effect)
    case "permanent_bonus":
      return generatePermaBonusEffectCode(effect, itemType, sameTypeCount)
    case "play_sound":
      return generatePlaySoundEffectCode(effect, itemType)
    case "redeem_voucher":
      return generateRedeemVoucherEffectCode(effect)
    case "retrigger":
      return generateRetriggerEffectCode(effect, itemType, sameTypeCount, card)
    case "set_sell_value":
      return generateSetSellValueEffectCode(effect, itemType, triggerType, sameTypeCount)
    case "set_dollars":
      return generateSetDollarsEffectCode(effect, itemType, sameTypeCount, card)
    // ADD DOLLARS FROM JOKERS EFFECT (OR MERGE INTO SET DOLLARS WITH GAMEVAR FOR SELL VALUE)
    case "set_ante":
      return generateSetAnteEffectCode(effect, itemType, triggerType, sameTypeCount)
    case "emit_flag":
      return generateEmitFlagEffectCode(effect, modprefix);
    case "win_blind":
      return generateWinBlindEffectCode(effect, itemType)
    case "unlock_joker":
      return generateUnlockJokerEffectCode(effect)
    case "shuffle_jokers":
      return generateShuffleJokersEffectCode(effect)
    case "show_message":
      return generateShowMessageEffectCode(effect)

//////////DECK EXCLUSIVE EFFECTS\\\\\\\\\\\\
    case "edit_starting_cards":
      return generateEditStartingCardsEffectCode(effect, modprefix)
    case "edit_starting_suits":
      return generateEditStartingSuitsEffectCode(effect, modprefix)
    case "edit_starting_ranks":
      return generateEditStartingRanksEffectCode(effect, modprefix)
    case "add_starting_cards":
      return generateAddStartingCardsEffectCode(effect, sameTypeCount, modprefix)
    case "remove_starting_cards":
      return generateRemoveStartingCardsEffectCode(effect, sameTypeCount)
    
    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
};


export const processPassiveEffects = (
  joker: JokerData
): PassiveEffectResult[] => {
  const passiveEffects: PassiveEffectResult[] = [];

  if (!joker.rules) return passiveEffects;

  joker.rules
    .filter((rule) => rule.trigger === "passive")
    .forEach((rule) => {
      rule.effects?.forEach((effect) => {
        const passiveResult: PassiveEffectResult | null = generateSinglePassiveEffect(effect, joker.objectKey)

        if (passiveResult) {
          passiveEffects.push(passiveResult);
        }
      });
    });

  return passiveEffects;
};

const generateSinglePassiveEffect = (
  effect: Effect,
  jokerKey: string
): PassiveEffectResult | null => {
  switch (effect.type) {
    case "allow_debt":
      return generateAllowDebtPassiveEffectCode(effect)
    case "combine_ranks":
      return generateCombineRanksPassiveEffectCode(effect, jokerKey)
    case "combine_suits":
      return generateCombineSuitsPassiveEffectCode(effect, jokerKey)
    case "copy_joker_ability":
      return generateCopyJokerAbilityPassiveEffectCode(effect)
    case "discount_items":
      return generateDiscountItemsPassiveEffectCode(effect, jokerKey)
    case "free_rerolls":
      return generateFreeRerollsPassiveEffectCode(effect)
    case "disable_boss_blind":
      return generateDisableBossBlindPassiveEffectCode(effect)
    case "edit_hand_size":
      return generateEditHandSizePassiveEffectCode(effect)
    case "edit_play_size":
      return generateEditPlaySizePassiveEffectCode(effect)
    case "edit_discard_size":
      return generateEditDiscardSizePassiveEffectCode(effect)
    case "edit_discards":
      return generateEditDiscardsPassiveEffectCode(effect)
    case "edit_hands":
      return generateEditHandsPassiveEffectCode(effect)
    case "splash_effect":
      return generateSplashPassiveEffectCode()
    case "edit_booster_slots":
      return generateEditBoosterSlotsPassiveEffectCode(effect)
    case "edit_consumable_slots":
      return generateEditConsumableSlotsPassiveEffectCode(effect)
    case "edit_joker_slots":
      return generateEditJokerSlotsPassiveEffectCode(effect)
    case "edit_voucher_slots":
      return generateEditVoucherSlotsPassiveEffectCode(effect)
    case "shortcut":
      return generateShortcutPassiveEffectCode(jokerKey)
    case "reduce_flush_straight_requirements":
      return generateReduceFlushStraightRequirementsPassiveEffectCode(effect, jokerKey)
    case "showman":
      return generateShowmanPassiveEffectCode(jokerKey)
    default:
      return null
  }
}