import React, { useState } from "react";
import {
  BeakerIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import Button from "../generic/Button";
import Tooltip from "../generic/Tooltip";

import { EFFECTS } from "../data/Effects.ts";
import { CONDITIONS } from "../data/Conditions.ts";
import { TRIGGERS } from "../data/Triggers.ts";

type HeroiconsSVG = React.ForwardRefExoticComponent<Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
  title?: string;
  titleId?: string;
} & React.RefAttributes<SVGSVGElement>>; // Copied from the LSP tooltip

interface DebugPageProps { }

interface DebugButtons {
  id: string;
  label: string;
  tooltip: string;
  icon: HeroiconsSVG;
  callback: () => void;
}

const DebugPage: React.FC<DebugPageProps> = ({ }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const debugButtons: DebugButtons[] = [
    {
      id: "dump_triggers" as const,
      label: "Dump Triggers",
      tooltip: "Dump every Trigger for every object type into console with the README.md formatting",
      icon: SparklesIcon,
      callback: () => {
        let log_string: Set<string> = new Set();

        log_string.add("\n### Triggers\n");
        TRIGGERS.forEach((value) => {
          Object.keys(value.label).forEach(
            (key) => {
              log_string.add(` - [x] **${value.label[key]}** - ${value.description[key]}\n`);
            }
          )
        })

        console.log([...log_string].join("").replace(/_/g, "\\_"));
      },
    },
    {
      id: "dump_effects" as const,
      label: "Dump Effects",
      tooltip: "Dump every Effect for every object type into the console with the README.md formatting",
      icon: StarIcon,
      callback: () => {
        let log_string = "";

        log_string += "\n### Effects\n";
        EFFECTS.forEach((value) => {
          log_string += ` - [x] **${value.label}** - ${value.description}\n`;
        })

        console.log(log_string.replace(/_/g, "\\_"));
      },
    },
    {
      id: "dump_conditions" as const,
      label: "Dump Conditions",
      tooltip: "Dump every Condition for every object type into the console with the README.md formatting",
      icon: BeakerIcon,
      callback: () => {
        let log_string = "";

        log_string += "\n### Conditions\n";
        CONDITIONS.forEach((value) => {
          log_string += ` - [x] **${value.label}** - ${value.description}\n`;
        })

        console.log(log_string.replace(/_/g, "\\_"));
      },
    },
  ]

  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light tracking-widest text-center mb-10">
          Debug
        </h1>

        <div className="grid lg:grid-cols-3 md:grid-cols-2">
          {debugButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Tooltip
                key={button.id}
                content={button.tooltip}
                show={hoveredButton === button.id}
                position="bottom"
                className="mx-auto"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Icon className="h-5 w-5" />}
                  onMouseEnter={() => setHoveredButton(button.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={button.callback}
                >
                  {button.label}
                </Button>
              </Tooltip>
              // <div key={btn.id} className="min-h-3 min-w-10 bg-amber-700 rounded-2xl flex p-4">
              //   <Icon className="h-5 w-5" />{btn.label}
              // </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
