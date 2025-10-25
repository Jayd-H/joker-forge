import type { Effect, LoopGroup, RandomGroup } from "../ruleBuilder/types";
import { coordinateVariableConflicts } from "./Jokers/variableUtils";
import {
GameObjectData,
JokerData,
ConsumableData, 
EnhancementData,
SealData,
EditionData,
VoucherData,
DeckData,
getModPrefix,
  } from "../data/BalatroUtils";
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
import { generateShowMessageReturn } from "./Effects/ShowMessageEffect";
import { generateDisableBossBlindReturn } from "./Effects/DisableBossBlindEffect";
import { generateEmitFlagReturn } from "./Effects/EmitFlagEffect";
import { generatePlaySoundReturn } from "./Effects/PlaySoundEffect";
import { generateWinBlindReturn } from "./Effects/WinBlindEffect";
import { generateCrashGameReturn } from "./Effects/CrashGameEffect";
import { generateEditApperanceReturn } from "./Effects/EditCardAppearanceEffect";
import { generateChangeJokerVariableEffectCode } from "./Effects/ChangeJokerVariableEffect";
import { generateChangePokerHandVariableEffectCode } from "./Effects/ChangePokerHandVariableEffect";
import { generateChangeSuitVariableEffectCode } from "./Effects/ChangeSuitVariableEffect";
import { generateChangeRankVariableEffectCode } from "./Effects/ChangeRankVariableEffect";
import { generateConvertAllCardToRankEffectCode } from "./Effects/ConvertAllCardsToRankEffect";
import { generateConvertAllCardsToSuitEffectCode } from "./Effects/ConvertAllCardsToSuitEffect";
import { generateConvertLeftToRightEffectCode } from "./Effects/ConvertLeftToRightEffect";

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
  itemType: string,
  triggerType: string,
  sameTypeCount: number = 0,
  modprefix: string,
  joker?: JokerData,
  consumable?: ConsumableData,
  card?: EnhancementData | EditionData | SealData,
  voucher?: VoucherData,
  deck?: DeckData,
): EffectReturn => {

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
    case "show_message":
      return generateShowMessageReturn(effect, itemType);
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
    // ADD CASES FOR COMBINE RANKS/SUITS & CONSIDERED AS EFFECTS
    case "convert_all_cards_to_rank":
      return generateConvertAllCardToRankEffectCode(effect, itemType)
    case "convert_all_cards_to_suit":
      return generateConvertAllCardsToSuitEffectCode(effect, itemType)
    case "convert_left_to_right":
      return generateConvertLeftToRightEffectCode(effect, itemType)
    case "emit_flag":
      return generateEmitFlagReturn(effect, modprefix);
    case "play_sound":
      return generatePlaySoundReturn(effect, itemType)
    case "win_blind":
      return generateWinBlindReturn(effect, itemType)
    case "edit_card_apperance":
      return generateEditApperanceReturn(effect, itemType);
    case "crash_game":
      return generateCrashGameReturn(effect);

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
};