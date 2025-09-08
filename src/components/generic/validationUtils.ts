export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export const validateJokerName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: "Name cannot be empty" };
  }

  if (name.includes('"') || name.includes("'")) {
    return { isValid: false, error: "Name cannot contain quotation marks" };
  }

  if (name.includes("\\")) {
    return { isValid: false, error: "Name cannot contain backslashes" };
  }

  if (name.includes("\n") || name.includes("\r")) {
    return { isValid: false, error: "Name cannot contain line breaks" };
  }

  if (name.includes("`")) {
    return { isValid: false, error: "Name cannot contain backticks" };
  }

  return { isValid: true };
};

export const validateVariableName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: "Variable name cannot be empty" };
  }

  if (name.includes(" ")) {
    return { isValid: false, error: "Variable name cannot contain spaces" };
  }

  if (name.includes('"') || name.includes("'")) {
    return {
      isValid: false,
      error: "Variable name cannot contain quotation marks",
    };
  }

  if (name.includes("\\")) {
    return {
      isValid: false,
      error: "Variable name cannot contain backslashes",
    };
  }

  if (name.includes("`")) {
    return { isValid: false, error: "Variable name cannot contain backticks" };
  }

  if (/^\d/.test(name)) {
    return {
      isValid: false,
      error: "Variable name cannot start with a number",
    };
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return {
      isValid: false,
      error: "Variable name can only contain letters, numbers, and underscores",
    };
  }

  const reservedWords = [
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "let",
    "new",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
    "true",
    "false",
    "null",
    "undefined",
  ];

  if (reservedWords.includes(name.toLowerCase())) {
    return { isValid: false, error: "Variable name cannot be a reserved word" };
  }

  if (name.length > 30) {
    return {
      isValid: false,
      error: "Variable name must be 30 characters or less",
    };
  }

  return { isValid: true };
};

export const validateDescription = (description: string): ValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for unescaped backslashes
  // if (description.includes("\\") && !description.includes("\\\\")) {
  //   errors.push("Unescaped backslashes may cause code generation issues");
  // }

  // // Check for quotation marks
  // if (description.includes('"')) {
  //   errors.push('Double quotes (") may cause code generation issues');
  // }

  // if (description.includes("'")) {
  //   errors.push("Single quotes (') may cause code generation issues");
  // }

  // Check for raw newlines (not [s] tags)
  const rawNewlinePattern = /(?<!\[s\])\n|(?<!\[s\])\r/;
  if (rawNewlinePattern.test(description)) {
    warnings.push(
      "Raw line breaks detected. Use [s] for line breaks in Balatro text"
    );
  }

  // // Check for backticks
  // if (description.includes("`")) {
  //   errors.push("Backticks (`) may cause code generation issues");
  // }

  // Check for unclosed formatting tags
  const openTags = (description.match(/\{[^}]*$/g) || []).length;
  const closeTags = (description.match(/\{\}/g) || []).length;
  const formatTags = (description.match(/\{[^}]+\}/g) || []).length;

  if (openTags > 0) {
    errors.push("Unclosed formatting tag detected");
  }

  // Check for mismatched formatting
  if (formatTags > closeTags && openTags === 0) {
    warnings.push("Some formatting tags may not be properly closed with {}");
  }

  // Check for invalid characters in tags
  const tagPattern = /\{([^}]+)\}/g;
  let tagMatch;
  while ((tagMatch = tagPattern.exec(description)) !== null) {
    const tagContent = tagMatch[1];

    // Skip empty tags and [s] which is valid
    if (tagContent === "" || tagContent === "s") continue;

    // Check for valid tag patterns (C:color, X:type, s:scale, E:effect, V:variable)
    const validTagPattern = /^(C|X|s|E|V):[a-zA-Z0-9_,.\s]/;
    if (!validTagPattern.test(tagContent)) {
      warnings.push(`Potentially invalid formatting tag: {${tagContent}}`);
    }
  }

  // Check length (reasonable limit)
  if (description.length > 500) {
    warnings.push("Description is quite long and may not display properly");
  }

  // Check for common mistakes
  if (description.includes("#{") && !description.includes("#}")) {
    warnings.push("Variable reference may be malformed. Use #1#, #2#, etc.");
  }

  // Return result
  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join("; "),
    };
  }

  if (warnings.length > 0) {
    return {
      isValid: true,
      warning: warnings.join("; "),
    };
  }

  return { isValid: true };
};

export const validateCustomMessage = (message: string): ValidationResult => {
  if (message.includes('"') || message.includes("'")) {
    return { isValid: false, error: "Message cannot contain quotation marks" };
  }

  if (message.includes("\\") && !message.includes("\\\\")) {
    return { isValid: false, error: "Unescaped backslashes may cause issues" };
  }

  if (message.includes("`")) {
    return { isValid: false, error: "Message cannot contain backticks" };
  }

  if (message.includes("\n") || message.includes("\r")) {
    return { isValid: false, error: "Message cannot contain line breaks" };
  }

  if (message.length > 100) {
    return { isValid: false, error: "Message must be 100 characters or less" };
  }

  return { isValid: true };
};
