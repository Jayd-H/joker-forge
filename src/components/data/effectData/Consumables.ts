import { GlobalEffectTypeDefinition } from "../../ruleBuilder/types";
import { ALL_CONSUMABLES, CONSUMABLE_SETS, CONSUMABLE_TYPES, CUSTOM_CONSUMABLES, PLANET_CARDS, SPECTRAL_CARDS, TAROT_CARDS } from "./../BalatroUtils";
import { GENERIC_TRIGGERS } from "./../Conditions";

  
export const CONSUMABLE_EFFECTS: GlobalEffectTypeDefinition[] = [
  {
    id: "create_consumable",
    label: "Create Consumable",
    description:
      "Create consumable cards and add them to your consumables area",
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
    objectUsers: ["joker", "consumable", "card", "deck"],
    params: [
      {
        id: "set",
        type: "select",
        label: "Consumable Set",
        options: () => [
          { value: "random", label: "Random Consumable" },
          { value: "keyvar", label: "Key Variable" },
          ...CONSUMABLE_SETS(),
        ],
        default: "random",
      },{
        id: "variable",
        type: "select",
        label: "Key Variable",
        options: [],
        showWhen: {
          parameter: "set",
          values: ["keyvar"],
        },
        variableTypes: ["key"]
      },{
        id: "specific_card",
        type: "select",
        label: "Specific Card",
        options: (parentValues: Record<string, unknown>) => {
          const selectedSet = parentValues?.set as string;
          if (!selectedSet || selectedSet === "random") {
            return [{ value: "random", label: "Random from Set" }];
          }
          // Handle vanilla sets
          if (selectedSet === "Tarot") {
            const vanillaCards = TAROT_CARDS

            const customCards = CUSTOM_CONSUMABLES()
              .filter((consumable) => consumable.set === "Tarot")

            return [
              { value: "random", label: "Random from Set" },
              ...vanillaCards,
              ...customCards,
            ];}
          if (selectedSet === "Planet") {
            const vanillaCards = PLANET_CARDS
            const customCards = CUSTOM_CONSUMABLES()
              .filter((consumable) => consumable.set === "Planet")

            return [
              { value: "random", label: "Random from Set" },
              ...vanillaCards,
              ...customCards,
            ];}
          if (selectedSet === "Spectral") {
            const vanillaCards = SPECTRAL_CARDS
            const customCards = CUSTOM_CONSUMABLES()
              .filter((consumable) => consumable.set === "Spectral")

            return [
              { value: "random", label: "Random from Set" },
              ...vanillaCards,
              ...customCards,
            ];
          }
          // Handle custom sets
          // Remove mod prefix to get the actual set key
          const setKey = selectedSet.includes("_")
            ? selectedSet.split("_").slice(1).join("_")
            : selectedSet;
          const customConsumablesInSet = CUSTOM_CONSUMABLES().filter(
            (consumable) =>
              consumable.set === setKey || consumable.set === selectedSet
          );
          return [
            { value: "random", label: "Random from Set" },
            ...customConsumablesInSet,
          ];},
        default: "random",
      },
      {
        id: "soulable",
        type: "select",
        label: "Soulable",
        options: [
          { value: "y", label: "Yes" },
          { value: "n", label: "No" },
        ],
        showWhen: {
          parameter: "specific_card",
          values: ["random"],
        },
        default:"n",
      },
      {
        id: "is_negative",
        type: "select",
        label: "Edition",
        options: [
          { value: "n", label: "No Edition" },
          { value: "y", label: "Negative Edition" },
        ],
        default: "n",
      },
      {
        id: "count",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 1,
        max: 5,
      },
      {
        id: "ignore_slots",
        type: "select",
        label: "Ignore Slots",
        options: [
          { value: "y", label: "True" },
          { value: "n", label: "False" },
        ],
        default:"n",
      },
    ],
    category: "Consumables",
  },
  {
    id: "create_last_played_planet",
    label: "Create Last Played Planet",
    description: "Create a Planet card corresponding to the last hand played (Blue Seal effect)",
    objectUsers: ["card"],
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "is_negative",
        type: "select",
        label: "Edition",
        options: [
          { value: "none", label: "No Edition" },
          { value: "negative", label: "Negative Edition" },
        ],
        default: "none",
      },
    ],
    category: "Consumables",
  },
  {
    id: "fool_effect",
    label: "Create Last Used Consumable",
    description: "Create a copy of the last Tarot or Planet card that was used (like The Fool)",
    objectUsers: ['consumable'],
    applicableTriggers: ["card_used", "held_hand"],
    params: [],
    category: "Consumables",
  },
  {
    id: "copy_consumable",
    label: "Copy Consumable",
    description: "Copy an existing consumable card from your collection",
    applicableTriggers: [...GENERIC_TRIGGERS],
    objectUsers: ["joker", "card"],
    params: [
      {
        id: "consumable_type",
        type: "select",
        label: "Consumable Type",
        options: [
          { value: "random", label: "Random Type" },
          ...CONSUMABLE_TYPES,
        ],
        default: "random",
      },
      {
        id: "specific_card",
        type: "select",
        label: "Specific Card",
        options: [
          { value: "random", label: "Random Card" },
          ...ALL_CONSUMABLES,
        ],
        showWhen: {
          parameter: "consumable_type",
          values: ["tarot", "planet", "spectral"],
        },
      },
      {
        id: "is_negative",
        type: "select",
        label: "Edition",
        options: [
          { value: "none", label: "No Edition" },
          { value: "negative", label: "Negative Edition" },
        ],
        default: "none",
      },
    ],
    category: "Consumables",
  },
  {
    id: "destroy_consumable",
    label: "Destroy Consumable",
    description: "Destroy a consumable card from your collection",
    applicableTriggers: [...GENERIC_TRIGGERS, "card_used"],
    objectUsers: ["joker", "consumable", "card"],
    params: [
      {
        id: "consumable_type",
        type: "select",
        label: "Consumable Type",
        options: [
          { value: "random", label: "Random Type" },
          ...CONSUMABLE_TYPES,
        ],
        default: "random",
      },
      {
        id: "specific_card",
        type: "select",
        label: "Specific Card",
        options: [
          { value: "random", label: "Random Card" },
          ...ALL_CONSUMABLES,
        ],
        showWhen: {
          parameter: "consumable_type",
          values: ["tarot", "planet", "spectral"],
        },
      },
    ],
    category: "Consumables",
  },
]