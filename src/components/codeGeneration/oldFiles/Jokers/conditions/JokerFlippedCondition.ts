
export const generateJokerFlippedConditionCode = (): string | null => {
    return `(function()
        return context.other_joker.facing == "back"
    end)()`
};

export const generateThisJokerFlippedConditionCode = (): string | null => {
    return `(function()
        return card.facing == "back"
    end)()`
};
