import type { Effect, LoopGroup, RandomGroup } from "../ruleBuilder/types";
import { JokerData, ConsumableData,  EnhancementData, SealData, EditionData, VoucherData, DeckData } from "../data/BalatroUtils";
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
import { generateDrawCardsReturn } from "./Effects/DrawCardsEffect";
import { generateBalanceChipsAndMultEffectCode } from "./Effects/BalanceChipsAndMultEffect";
import { generateSwapChipsAndMultEffectCode } from "./Effects/SwapChipsAndMultEffect";
import { generateShowMessageEffectCode } from "./Effects/ShowMessageEffect";
import { generateDisableBossBlindReturn } from "./Effects/DisableBossBlindEffect";
import { generateEmitFlagEffectCode } from "./Effects/EmitFlagEffect";
import { generatePlaySoundEffectCode } from "./Effects/PlaySoundEffect";
import { generateWinBlindEffectCode } from "./Effects/WinBlindEffect";
import { generateEditApperanceEffectCode } from "./Effects/EditCardAppearanceEffect";
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
  consumable?: ConsumableData,
  card?: EnhancementData | EditionData | SealData,
  voucher?: VoucherData,
  deck?: DeckData,
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
    case "draw_cards":
      return generateDrawCardsReturn(effect, itemType);
    case "balance_chips_mult":
      return generateBalanceChipsAndMultEffectCode(effect)
    case "swap_chips_mult":
      return generateSwapChipsAndMultEffectCode(effect)
    case "disable_boss_blind":
      return generateDisableBossBlindReturn(effect, itemType, triggerType);
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
    // ADD CASES FOR COMBINE RANKS/SUITS & CONSIDERED AS EFFECTS
    case "convert_all_cards_to_rank":
      return generateConvertAllCardToRankEffectCode(effect, itemType)
    case "convert_all_cards_to_suit":
      return generateConvertAllCardsToSuitEffectCode(effect, itemType)
    case "convert_left_to_right":
      return generateConvertLeftToRightEffectCode(effect, itemType)
    // ADD CASES FOR COPY CARD TO DECK/HAND EFFECTS
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
    case "set_ante":
      return generateSetAnteEffectCode(effect, itemType, triggerType, sameTypeCount)
    case "emit_flag":
      return generateEmitFlagEffectCode(effect, modprefix);
    case "win_blind":
      return generateWinBlindEffectCode(effect, itemType)
    case "edit_card_apperance":
      return generateEditApperanceEffectCode(effect, itemType);
    case "unlock_joker":
      return generateUnlockJokerEffectCode(effect)
    case "shuffle_jokers":
      return generateShuffleJokersEffectCode(effect)
    case "show_message":
      return generateShowMessageEffectCode(effect)
    
    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
};

// COPY JOKER ABILITY PASSIVE