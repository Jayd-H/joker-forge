
export const generateJokerFlippedConditionCode = (): string | null => {
    return `(function()
        return G.jokers.highlighted[1].facing == "back" == true
    end)()`
};

