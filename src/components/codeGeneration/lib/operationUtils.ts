export const generateOperationCode = (
  operation: string,
  comparisonValue: string,
  valueCode: string
) => {
  switch (operation) {
    case "equals":
      return `to_big(${comparisonValue}) == to_big(${valueCode})`
    case "greater_than": 
      return `to_big(${comparisonValue}) > to_big(${valueCode})`
    case "greater_than_or_equal": case "greater_equals":
      return `to_big(${comparisonValue}) >= to_big(${valueCode})`
    case "less_than":
      return `to_big(${comparisonValue}) < to_big(${valueCode})`
    case "less_than_or_equal": case "less_equals":
      return `to_big(${comparisonValue}) <= to_big(${valueCode})`
    case "not_equals": case "not_equal":
      return `to_big(${comparisonValue}) ~= to_big(${valueCode})`
    default:
      return null
  }
}