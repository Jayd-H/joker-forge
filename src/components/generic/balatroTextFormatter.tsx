import React from "react";

interface ParsedSegment {
  text: string;
  textColor?: string;
  backgroundColor?: string;
  scale?: number;
  motion?: number;
  tooltip?: string;
  isMultiplier?: boolean;
  stripWhitespace?: boolean;
}

interface StyleState {
  textColor?: string;
  backgroundColor?: string;
  scale?: number;
  motion?: number;
  tooltip?: string;
  isMultiplier?: boolean;
  stripWhitespace?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  white: "text-balatro-white",
  blue: "text-balatro-blue",
  red: "text-balatro-red",
  orange: "text-balatro-attention",
  green: "text-balatro-green",
  purple: "text-balatro-purple",
  attention: "text-balatro-attention",
  chips: "text-balatro-chips",
  mult: "text-balatro-mult",
  money: "text-balatro-money",
  gold: "text-balatro-gold-new",
  black: "text-balatro-black",
  inactive: "text-balatro-grey",
  spades: "text-balatro-spades",
  hearts: "text-balatro-hearts",
  clubs: "text-balatro-clubs",
  diamonds: "text-balatro-diamonds",
  tarot: "text-balatro-purple",
  planet: "text-balatro-planet",
  spectral: "text-balatro-spectral",
  common: "text-balatro-common",
  uncommon: "text-balatro-uncommon",
  rare: "text-balatro-rare",
  legendary: "text-balatro-legendary",
  enhanced: "text-balatro-enhanced-new",
  default: "text-balatro-default",
  edition: "text-rainbow",
  dark_edition: "text-balatro-dark-edition",
};

const BG_COLOR_MAP: Record<string, string> = {
  white: "bg-white-lighter",
  blue: "bg-balatro-blue",
  red: "bg-balatro-red",
  orange: "bg-balatro-attention",
  green: "bg-balatro-green",
  purple: "bg-balatro-purple",
  attention: "bg-balatro-attention",
  chips: "bg-balatro-chips",
  mult: "bg-balatro-mult",
  money: "bg-balatro-money",
  gold: "bg-balatro-gold-new",
  black: "bg-balatro-black",
  spades: "bg-balatro-spades",
  hearts: "bg-balatro-hearts",
  clubs: "bg-balatro-clubs",
  diamonds: "bg-balatro-diamonds",
  tarot: "bg-balatro-purple",
  planet: "bg-balatro-planet",
  spectral: "bg-balatro-spectral",
  common: "bg-balatro-common",
  uncommon: "bg-balatro-uncommon",
  rare: "bg-balatro-rare",
  legendary: "bg-balatro-legendary",
  enhanced: "bg-balatro-enhanced-new",
  default: "bg-balatro-default",
  edition: "bg-rainbow",
  dark_edition: "bg-dark-rainbow",
};

// eslint-disable-next-line react-refresh/only-export-components
export const parseBalatroText = (
  text: string,
  locVars?: { colours?: string[] }
): ParsedSegment[] => {
  const segments: ParsedSegment[] = [];

  text = text.replace(/\[s\]/g, "\n");

  const parts = text.split(/(\{[^}]*\})/);
  let currentStyle: StyleState = {};

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part.startsWith("{") && part.endsWith("}")) {
      const modifiers = part.slice(1, -1);

      if (modifiers === "") {
        currentStyle = {};
        continue;
      }

      const newStyle: StyleState = {};
      const modifierList = modifiers.split(",");

      for (const mod of modifierList) {
        const [type, value] = mod.split(":");

        switch (type) {
          case "C":
            newStyle.textColor = COLOR_MAP[value] || "text-white-lighter";
            break;
          case "X":
            newStyle.backgroundColor = BG_COLOR_MAP[value] || "bg-black";
            newStyle.stripWhitespace = true;
            if (value === "mult" || value === "chips") {
              newStyle.isMultiplier = true;
            }
            break;
          case "V":
            if (locVars?.colours && locVars.colours[parseInt(value) - 1]) {
              const color = locVars.colours[parseInt(value) - 1];
              if (typeof color === "string" && color.startsWith("#")) {
                newStyle.textColor = `text-[${color}]`;
              }
            }
            break;
          case "B":
            if (locVars?.colours && locVars.colours[parseInt(value) - 1]) {
              const color = locVars.colours[parseInt(value) - 1];
              if (typeof color === "string" && color.startsWith("#")) {
                newStyle.backgroundColor = `bg-[${color}]`;
              }
            }
            break;
          case "E":
            newStyle.motion = parseInt(value);
            break;
          case "T":
            newStyle.tooltip = value;
            break;
          case "s":
            newStyle.scale = parseFloat(value);
            break;
        }
      }

      currentStyle = newStyle;
    } else if (part) {
      let processedText = part;

      if (currentStyle.stripWhitespace) {
        processedText = processedText.replace(/\s/g, "");
      }

      if (processedText) {
        segments.push({
          text: processedText,
          ...currentStyle,
        });
      }
    }
  }

  return segments;
};

interface BalatroTextProps {
  text: string;
  locVars?: { colours?: string[] };
  className?: string;
  noWrap?: boolean;
}

export const BalatroText: React.FC<BalatroTextProps> = ({
  text,
  locVars,
  className = "",
  noWrap = false,
}) => {
  const segments = parseBalatroText(text, locVars);

  const wrapperClass = noWrap ? "whitespace-nowrap" : "";

  return (
    <span className={`${className} ${wrapperClass}`}>
      {segments.map((segment, index) => {
        let classes = segment.textColor || "";

        if (segment.backgroundColor) {
          classes += ` ${segment.backgroundColor} px-1 rounded`;
        }

        if (segment.motion === 1) {
          classes += " animate-float";
        } else if (segment.motion === 2) {
          classes += " animate-bump";
        }

        const inlineStyle: React.CSSProperties = {};
        if (segment.scale && segment.scale !== 1) {
          inlineStyle.fontSize = `${segment.scale}em`;
        }

        let displayText = segment.text;
        if (segment.isMultiplier && segment.text.match(/^[X×]?\d/)) {
          displayText = segment.text.replace(/^X?/, "×");
        }

        if (displayText.includes("\n")) {
          return (
            <span key={index}>
              {displayText.split("\n").map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  <span className={classes.trim()} style={inlineStyle}>
                    {line}
                  </span>
                </React.Fragment>
              ))}
            </span>
          );
        }

        const content = (
          <span className={classes.trim()} style={inlineStyle}>
            {displayText}
          </span>
        );

        if (segment.tooltip) {
          return (
            <span key={index} className="relative group cursor-help">
              {content}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black-darker border border-black-lighter rounded text-xs text-white-light whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {segment.tooltip}
              </span>
            </span>
          );
        }

        return <span key={index}>{content}</span>;
      })}
    </span>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const formatBalatroText = (
  text: string,
  locVars?: { colours?: string[] }
): string => {
  const segments = parseBalatroText(text, locVars);

  return segments
    .map((segment) => {
      let html = segment.text;

      if (segment.textColor) {
        html = `<span class="${segment.textColor}">${html}</span>`;
      }

      if (segment.backgroundColor) {
        const bgClass = segment.backgroundColor;
        const textClass = segment.textColor || "text-white-lighter";
        html = `<span class="${bgClass} ${textClass} px-1 rounded">${html}</span>`;
      }

      if (segment.scale && segment.scale !== 1) {
        html = `<span style="font-size: ${segment.scale}em;">${html}</span>`;
      }

      if (segment.isMultiplier && html.match(/^[X×]?\d/)) {
        html = html.replace(/^X?/, "×");
      }

      return html;
    })
    .join("");
};
