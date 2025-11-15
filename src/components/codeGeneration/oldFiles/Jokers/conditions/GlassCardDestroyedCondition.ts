export const generateGlassCardDestroyedConditionCode = (): string | null => {
  return `(function()
    for k, removed_card in ipairs(context.removed) do
        if removed_card.shattered then
            return true
        end
    end
    return false
end)()`;
};
