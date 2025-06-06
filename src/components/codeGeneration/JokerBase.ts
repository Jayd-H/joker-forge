import { JokerData } from "../JokerCard";
import {
  extractVariablesFromRules,
  generateVariableConfig,
  generateVariableLocVars,
} from "./VariableUtils";

export const generateJokerBaseCode = (
  joker: JokerData,
  index: number,
  atlasKey: string
): string => {
  const x = index % 10;
  const y = Math.floor(index / 10);

  // Extract effect values from joker data and rules
  const effectsConfig = extractEffectsConfig(joker);

  return `SMODS.Joker{ --${joker.name}
    name = "${joker.name}",
    key = "${slugify(joker.name)}",
    config = {
        extra = {
            ${effectsConfig}
        }
    },
    loc_txt = {
        ['name'] = '${joker.name}',
        ['text'] = ${formatJokerDescription(joker)}
    },
    pos = {
        x = ${x},
        y = ${y}
    },
    cost = ${joker.cost !== undefined ? joker.cost : 4},
    rarity = ${joker.rarity},
    blueprint_compat = ${
      joker.blueprint_compat !== undefined ? joker.blueprint_compat : true
    },
    eternal_compat = ${
      joker.eternal_compat !== undefined ? joker.eternal_compat : true
    },
    unlocked = ${joker.unlocked !== undefined ? joker.unlocked : true},
    discovered = ${joker.discovered !== undefined ? joker.discovered : true},
    atlas = '${atlasKey}'`;
};

export const extractEffectsConfig = (joker: JokerData): string => {
  const configItems: string[] = [];
  const variableCount: Record<string, number> = {};

  // Helper function to get a unique variable name
  const getUniqueVariableName = (baseName: string): string => {
    if (variableCount[baseName] === undefined) {
      variableCount[baseName] = 0;
      return baseName;
    } else {
      variableCount[baseName]++;
      return `${baseName}${variableCount[baseName]}`;
    }
  };

  // Extract variables from rules first
  if (joker.rules && joker.rules.length > 0) {
    const variables = extractVariablesFromRules(joker.rules);
    const variableConfig = generateVariableConfig(variables);
    if (variableConfig) {
      configItems.push(variableConfig);
    }

    // Process effects but skip adding config for effects that use variables
    joker.rules.forEach((rule) => {
      rule.effects.forEach((effect) => {
        // Skip effects that use variables as their value source
        if (effect.params.value_source === "variable") {
          return;
        }

        // Only add config for effects with fixed values
        if (
          effect.type === "add_chips" &&
          effect.params.value_source !== "variable"
        ) {
          const varName = getUniqueVariableName("chips");
          configItems.push(`${varName} = ${effect.params.value || 10}`);
        }
        if (
          effect.type === "add_mult" &&
          effect.params.value_source !== "variable"
        ) {
          const varName = getUniqueVariableName("mult");
          configItems.push(`${varName} = ${effect.params.value || 5}`);
        }
        if (
          effect.type === "apply_x_mult" &&
          effect.params.value_source !== "variable"
        ) {
          const varName = getUniqueVariableName("Xmult");
          configItems.push(`${varName} = ${effect.params.value || 1.5}`);
        }
        if (
          effect.type === "add_dollars" &&
          effect.params.value_source !== "variable"
        ) {
          const varName = getUniqueVariableName("dollars");
          configItems.push(`${varName} = ${effect.params.value || 5}`);
        }
        if (effect.type === "retrigger_cards") {
          const varName = getUniqueVariableName("repetitions");
          configItems.push(`${varName} = ${effect.params.repetitions || 1}`);
        }
        if (effect.type === "edit_hand") {
          const varName = getUniqueVariableName("hands");
          configItems.push(`${varName} = ${effect.params.value || 1}`);
        }
        if (effect.type === "edit_discard") {
          const varName = getUniqueVariableName("discards");
          configItems.push(`${varName} = ${effect.params.value || 1}`);
        }
        if (effect.type === "level_up_hand") {
          const varName = getUniqueVariableName("levels");
          configItems.push(`${varName} = ${effect.params.value || 1}`);
        }
      });
    });
  }

  return configItems.join(",\n            ");
};

export const slugify = (text: string): string => {
  return (
    text
      .toLowerCase()
      .replace(/[\s\W_]+/g, "")
      .replace(/^[\d]/, "_$&") ||
    `joker_${Math.random().toString(36).substring(2, 8)}`
  );
};

export const formatJokerDescription = (joker: JokerData): string => {
  const formatted = joker.description.replace(/<br\s*\/?>/gi, "[s]");

  const words = formatted.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    if (line.length + word.length + 1 > 28 || word.includes("[s]")) {
      lines.push(line.trim());
      line = "";
    }
    line += (line ? " " : "") + word.replace("[s]", "");
  });

  if (line) lines.push(line.trim());

  return `{\n${lines
    .map((line, i) => `            [${i + 1}] = '${line.replace(/'/g, "\\'")}'`)
    .join(",\n")}\n        }`;
};

export const generateBasicLocVarsFunction = (joker: JokerData): string => {
  const vars: string[] = [];
  const variableCount: Record<string, number> = {};

  // Add variables from rules
  if (joker.rules && joker.rules.length > 0) {
    const variables = extractVariablesFromRules(joker.rules);
    const variableLocVars = generateVariableLocVars(variables);
    vars.push(...variableLocVars);
  }

  // Helper function to get a unique variable name (same logic as above)
  const getUniqueVariableName = (baseName: string): string => {
    if (variableCount[baseName] === undefined) {
      variableCount[baseName] = 0;
      return baseName;
    } else {
      variableCount[baseName]++;
      return `${baseName}${variableCount[baseName]}`;
    }
  };

  // Check rules for additional vars
  if (joker.rules && joker.rules.length > 0) {
    joker.rules.forEach((rule) => {
      rule.effects.forEach((effect) => {
        if (effect.type === "add_chips") {
          const varName = getUniqueVariableName("chips");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "add_mult") {
          const varName = getUniqueVariableName("mult");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "apply_x_mult") {
          const varName = getUniqueVariableName("Xmult");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "add_dollars") {
          const varName = getUniqueVariableName("dollars");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "retrigger_cards") {
          const varName = getUniqueVariableName("repetitions");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "edit_hand") {
          const varName = getUniqueVariableName("hands");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "edit_discard") {
          const varName = getUniqueVariableName("discards");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "level_up_hand") {
          const varName = getUniqueVariableName("levels");
          vars.push(`card.ability.extra.${varName}`);
        }
      });
    });
  }

  return `loc_vars = function(self, info_queue, card)
        return {vars = {${vars.join(", ")}}}
    end`;
};
