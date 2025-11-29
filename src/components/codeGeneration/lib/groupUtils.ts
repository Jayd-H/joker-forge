import { RandomGroup } from "../../ruleBuilder";
import { LoopGroup } from "../../ruleBuilder/types";

export const convertRandomGroupsForCodegen = (
  randomGroups: RandomGroup[]
) => {
  return randomGroups.map((group) => ({
    ...group,
    chance_numerator: {
      value: (typeof group.chance_numerator.value === "string") ? 1 : group.chance_numerator.value,
      valueType: group.chance_numerator.valueType
    },
    chance_denominator: {
      value: (typeof group.chance_denominator.value === "string") ? 1 : group.chance_denominator.value,
      valueType: group.chance_denominator.valueType
    }
  }));
};

export const convertLoopGroupsForCodegen = (
  loopGroups: LoopGroup[]
) => {
  return loopGroups.map((group) => ({
    ...group,
    repetitions: {
      value: (typeof group.repetitions.value === "string") ? 1 : group.repetitions.value,
      valueType: group.repetitions.valueType
    }
  }));
};