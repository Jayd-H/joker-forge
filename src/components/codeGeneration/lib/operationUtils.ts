export const generateOperationCode = (
  operation: string,
  defaultValue: string,
  comparisonValue: string,
  valueCode: string
) => {
  if (!operation) {
    operation = defaultValue
  }
  switch (operation) {
    case "greater_than": 
      return `${comparisonValue} > ${valueCode}`
    case "greater_than_or_equal": case "greater_equals":
      return `${comparisonValue} >= ${valueCode}`
    case "less_than":
      return `${comparisonValue} < ${valueCode}`
    case "less_than_or_equal": case "less_equals":
      return `${comparisonValue} <= ${valueCode}`
    case "not_equals": case "not_equal":
      return `${comparisonValue} ~= ${valueCode}`
    case "equals":
    default:
      return `${comparisonValue} == ${valueCode}`
  }
}