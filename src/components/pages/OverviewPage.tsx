import React from "react";
import {
  PlusIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BugAntIcon,
  BookOpenIcon,
  CogIcon,
  SwatchIcon,
  ArrowPathIcon,
  BoltIcon,
  CodeBracketSquareIcon,
  StarIcon,
  FireIcon,
  CubeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { JokerData } from "../JokerCard";

interface OverviewPageProps {
  jokerCount: number;
  jokers: JokerData[];
  modName: string;
  authorName: string;
  onExport: () => void;
  onNavigate: (section: string) => void;
}

interface ImplementationStats {
  triggers: { implemented: number; total: number; percentage: number };
  conditions: { implemented: number; total: number; percentage: number };
  effects: { implemented: number; total: number; percentage: number };
  ui: { implemented: number; total: number; percentage: number };
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

interface ParsedCommit {
  sha: string;
  message: string;
  type: CommitType | null;
  author: string;
  date: string;
  url: string;
  avatarUrl?: string;
}

interface CommitType {
  prefix: string;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COMMIT_TYPES: Record<string, CommitType> = {
  feat: {
    prefix: "feat",
    label: "Feature",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    icon: SparklesIcon,
  },
  fix: {
    prefix: "fix",
    label: "Fix",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    icon: BugAntIcon,
  },
  docs: {
    prefix: "docs",
    label: "Docs",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    icon: BookOpenIcon,
  },
  chore: {
    prefix: "chore",
    label: "Chore",
    color: "text-gray-400",
    bgColor: "bg-gray-400/10",
    icon: CogIcon,
  },
  style: {
    prefix: "style",
    label: "Style",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    icon: SwatchIcon,
  },
  refactor: {
    prefix: "refactor",
    label: "Refactor",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    icon: ArrowPathIcon,
  },
  test: {
    prefix: "test",
    label: "Test",
    color: "text-mint",
    bgColor: "bg-mint/10",
    icon: BeakerIcon,
  },
  perf: {
    prefix: "perf",
    label: "Performance",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    icon: BoltIcon,
  },
};

const parseImplementationStats = async (): Promise<ImplementationStats> => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/Jayd-H/joker-forge/main/README.md"
    );
    const readmeContent = await response.text();

    const parseSection = (
      sectionName: string
    ): { implemented: number; total: number } => {
      const sections = readmeContent.split(/^### /m);
      const targetSection = sections.find((section) =>
        section.toLowerCase().startsWith(sectionName.toLowerCase())
      );

      if (!targetSection) {
        return { implemented: 0, total: 0 };
      }

      const implementedMatches = targetSection.match(/- \[x\]/gi) || [];
      const notImplementedMatches = targetSection.match(/- \[ \]/g) || [];

      const implementedCount = implementedMatches.length;
      const notImplementedCount = notImplementedMatches.length;
      const totalCount = implementedCount + notImplementedCount;

      return { implemented: implementedCount, total: totalCount };
    };

    const triggers = parseSection("Triggers");
    const conditions = parseSection("Conditions");
    const effects = parseSection("Effects");
    const ui = parseSection("UI Features");

    return {
      triggers: {
        ...triggers,
        percentage:
          Math.round((triggers.implemented / triggers.total) * 100) || 0,
      },
      conditions: {
        ...conditions,
        percentage:
          Math.round((conditions.implemented / conditions.total) * 100) || 0,
      },
      effects: {
        ...effects,
        percentage:
          Math.round((effects.implemented / effects.total) * 100) || 0,
      },
      ui: {
        ...ui,
        percentage: Math.round((ui.implemented / ui.total) * 100) || 0,
      },
    };
  } catch {
    return {
      triggers: { implemented: 13, total: 21, percentage: 62 },
      conditions: { implemented: 14, total: 19, percentage: 74 },
      effects: { implemented: 15, total: 19, percentage: 79 },
      ui: { implemented: 8, total: 14, percentage: 57 },
    };
  }
};

const fetchGitHubCommits = async (): Promise<ParsedCommit[]> => {
  try {
    const response = await fetch(
      "https://api.github.com/repos/Jayd-H/joker-forge/commits?per_page=8&page=1",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const commits: GitHubCommit[] = await response.json();
    return commits.map(parseCommit);
  } catch {
    return [];
  }
};

const parseCommit = (commit: GitHubCommit): ParsedCommit => {
  const message = commit.commit.message;
  const firstLine = message.split("\n")[0];

  const commitTypeMatch = firstLine.match(/^([a-z]+)(\(.+\))?:\s*(.+)$/i);

  let parsedMessage = firstLine;
  let commitType: CommitType | null = null;

  if (commitTypeMatch) {
    const [, type, , actualMessage] = commitTypeMatch;
    const normalizedType = type.toLowerCase();

    if (COMMIT_TYPES[normalizedType]) {
      commitType = COMMIT_TYPES[normalizedType];
      parsedMessage = actualMessage;
    }
  }

  return {
    sha: commit.sha.substring(0, 7),
    message: parsedMessage,
    type: commitType,
    author: commit.author?.login || commit.commit.author.name,
    date: commit.commit.author.date,
    url: commit.html_url,
    avatarUrl: commit.author?.avatar_url,
  };
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const OverviewPage: React.FC<OverviewPageProps> = ({
  jokerCount,
  jokers,
  modName,
  authorName,
  onExport,
  onNavigate,
}) => {
  const [stats, setStats] = React.useState<ImplementationStats>({
    triggers: { implemented: 13, total: 19, percentage: 68 },
    conditions: { implemented: 14, total: 20, percentage: 70 },
    effects: { implemented: 15, total: 22, percentage: 68 },
    ui: { implemented: 8, total: 14, percentage: 57 },
  });

  const [commits, setCommits] = React.useState<ParsedCommit[]>([]);
  const [commitsLoading, setCommitsLoading] = React.useState(true);

  React.useEffect(() => {
    parseImplementationStats().then(setStats);

    fetchGitHubCommits().then((fetchedCommits) => {
      setCommits(fetchedCommits);
      setCommitsLoading(false);
    });
  }, []);

  const validateJoker = (joker: JokerData) => {
    const issues = [];
    if (!joker.imagePreview) issues.push("Missing image");
    if (!joker.name || joker.name.trim() === "" || joker.name === "New Joker")
      issues.push("Generic or missing name");
    if (!joker.rules || joker.rules.length === 0)
      issues.push("No rules defined");
    return issues;
  };

  const incompleteJokers = jokers.filter(
    (joker) => validateJoker(joker).length > 0
  );
  const completeJokers = jokers.filter(
    (joker) => validateJoker(joker).length === 0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto font-lexend">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl text-white-light font-light tracking-wide mb-3">
            Project Overview
          </h1>
          <div className="flex items-center gap-6 text-white-darker text-sm">
            <div className="flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-2 text-mint" />
              {modName || "Unnamed Mod"} • {jokerCount} joker
              {jokerCount !== 1 ? "s" : ""}
            </div>
            {incompleteJokers.length > 0 && (
              <div className="flex items-center text-balatro-orange">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {incompleteJokers.length} incomplete
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-black-dark border-2 border-black-lighter rounded-xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-8">
          <CubeIcon className="h-6 w-6 text-mint" />
          <h2 className="text-2xl text-white-light font-light">Your Project</h2>
        </div>

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8">
            <div className="mb-6 lg:mb-0">
              <div className="text-4xl font-bold text-white-light mb-3">
                {modName || "Unnamed Mod"}
              </div>
              <div className="text-white-darker text-lg mb-4">
                by {authorName || "Anonymous"}
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-mint bg-mint/15 border border-mint/30 px-4 py-2 rounded-xl">
                <StarIcon className="h-4 w-4" />
                v1.0.0
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-black-darker border border-mint/20 rounded-xl">
                <div className="text-2xl font-bold text-mint mb-1">
                  {jokerCount}
                </div>
                <div className="text-white-darker text-sm">Jokers</div>
              </div>

              <div className="text-center p-4 bg-black-darker border border-green-400/30 rounded-xl">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {completeJokers.length}
                </div>
                <div className="text-white-darker text-sm">Complete</div>
              </div>
              <div className="text-center p-4 bg-black-darker border border-orange-400/30 rounded-xl">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {incompleteJokers.length}
                </div>
                <div className="text-white-darker text-sm">Incomplete</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-black-lighter pt-8">
          <div className="flex items-center gap-3 mb-6">
            <WrenchScrewdriverIcon className="h-5 w-5 text-mint" />
            <h3 className="text-xl text-white-light font-medium">
              Quick Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => onNavigate("jokers")}
              className="group flex items-center gap-4 p-6 bg-black-darker border border-black-lighter hover:border-mint/50 rounded-xl transition-all cursor-pointer hover:bg-gradient-to-r hover:from-black-darker hover:to-mint/5"
            >
              <div className="p-3 bg-mint/20 rounded-xl group-hover:bg-mint/30 transition-all group-hover:scale-110">
                <PlusIcon className="h-6 w-6 text-mint" />
              </div>
              <div className="text-left">
                <div className="text-white-light font-semibold text-lg mb-1">
                  Create Joker
                </div>
                <div className="text-white-darker text-sm">
                  Design new joker cards
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate("metadata")}
              className="group flex items-center gap-4 p-6 bg-black-darker border border-black-lighter hover:border-mint/50 rounded-xl transition-all cursor-pointer hover:bg-gradient-to-r hover:from-black-darker hover:to-mint/5"
            >
              <div className="p-3 bg-mint/20 rounded-xl group-hover:bg-mint/30 transition-all group-hover:scale-110">
                <DocumentTextIcon className="h-6 w-6 text-mint" />
              </div>
              <div className="text-left">
                <div className="text-white-light font-semibold text-lg mb-1">
                  Edit Metadata
                </div>
                <div className="text-white-darker text-sm">
                  Configure mod settings
                </div>
              </div>
            </button>

            <button
              onClick={onExport}
              disabled={jokerCount === 0}
              className="group flex items-center gap-4 p-6 bg-gradient-to-r from-mint/10 to-mint/5 border border-mint/30 hover:border-mint rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-mint/30 hover:from-mint/15 hover:to-mint/10"
            >
              <div className="p-3 bg-mint/30 rounded-xl group-hover:bg-mint/40 transition-all group-hover:scale-110">
                <ArrowUpTrayIcon className="h-6 w-6 text-mint" />
              </div>
              <div className="text-left">
                <div className="text-mint font-semibold text-lg mb-1">
                  Export Mod
                </div>
                <div className="text-mint-light text-sm">
                  Generate mod files
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        <div className="lg:col-span-3 bg-black-dark border-2 border-black-lighter rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CodeBracketSquareIcon className="h-6 w-6 text-mint" />
              <h2 className="text-2xl text-white-light font-light">
                Recent Development
              </h2>
            </div>
            <a
              href="https://github.com/Jayd-H/joker-forge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-mint hover:text-mint-light transition-colors px-3 py-2 bg-mint/10 rounded-lg border border-mint/30 hover:bg-mint/20"
            >
              View on GitHub
            </a>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {commitsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3 p-4 bg-black-darker rounded-xl">
                      <div className="w-8 h-8 bg-black-lighter rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-black-lighter rounded mb-2"></div>
                        <div className="h-3 bg-black-lighter rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : commits.length === 0 ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="h-12 w-12 text-white-darker mx-auto mb-3 opacity-50" />
                <div className="text-white-darker text-sm">
                  Unable to load commits
                </div>
              </div>
            ) : (
              commits.map((commit) => (
                <a
                  key={commit.sha}
                  href={commit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-black-darker border border-black-lighter rounded-xl hover:border-mint/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {commit.type ? (
                        <div
                          className={`p-2 ${commit.type.bgColor} border border-white/10 rounded-lg`}
                        >
                          <commit.type.icon
                            className={`h-4 w-4 ${commit.type.color}`}
                          />
                        </div>
                      ) : (
                        <div className="w-3 h-3 bg-white-darker rounded-full mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {commit.type && (
                          <span
                            className={`text-xs px-2 py-1 ${commit.type.bgColor} ${commit.type.color} rounded font-medium border border-white/10`}
                          >
                            {commit.type.label}
                          </span>
                        )}
                        <span className="text-xs text-white-darker font-mono bg-black px-2 py-1 rounded">
                          {commit.sha}
                        </span>
                      </div>
                      <div className="text-sm text-white-light group-hover:text-mint transition-colors mb-2 leading-relaxed">
                        {commit.message}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white-darker">
                        <span className="font-medium">{commit.author}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(commit.date)}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-black-dark border-2 border-black-lighter rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BeakerIcon className="h-6 w-6 text-mint" />
              <h2 className="text-xl text-white-light font-light">Checklist</h2>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { name: "Triggers", data: stats.triggers, color: "bg-trigger" },
              {
                name: "Conditions",
                data: stats.conditions,
                color: "bg-condition",
              },
              { name: "Effects", data: stats.effects, color: "bg-effect" },
              { name: "UI Features", data: stats.ui, color: "bg-mint" },
            ].map((item) => (
              <div key={item.name} className="p-3 bg-black-darker rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white-light font-medium text-sm">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white-darker">
                      {item.data.implemented}/{item.data.total}
                    </span>
                    <span className="text-white-light font-bold text-sm">
                      {item.data.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-black-light rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${item.data.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-black-lighter">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FireIcon className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-orange-400 font-medium">
                PRE-ALPHA
              </span>
            </div>
            <h1 className="text-sm mb-2 text-white-darker text-center">
              See full checkist in the README
            </h1>
          </div>
          <a href="https://github.com/Jayd-H/joker-forge/blob/main/README.md" target="_blank" rel="noopener noreferrer">
            <h1 className=" text-mint hover:underline text-center">
              View README
            </h1>
          </a>
        </div>
      </div>

      <div className="bg-black-dark border-2 border-black-lighter rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="h-6 w-6 text-mint" />
          <h2 className="text-2xl text-white-light font-light">
            About Joker Forge
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xl text-white-light font-medium mb-4">
                Visual Joker Design Tool
              </h3>
              <p className="text-white-light leading-relaxed mb-4">
                Joker Forge is a visual tool for creating custom Balatro jokers
                using the SMODS framework. Design unique joker behaviors without
                writing Lua code directly.
              </p>
              <p className="text-white-darker leading-relaxed mb-4">
                This is a solo-developer project, in its current state expect
                rough edges and bugs. The goal isn't the most polished generated
                code, but rather a functional and flexible tool for modders.
              </p>
              <p className="text-white-darker leading-relaxed mb-4">
                If you have found any issues, rather with the generated code or
                the user interface, or just have any suggestions, please feel
                free to open an issue on the GitHub Repository.
              </p>
              <p className="text-white-darker leading-relaxed">
                <a
                  href="https://github.com/jayd-h/joker-forge/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint hover:underline text-lg"
                >
                  Open an issue
                </a>
              </p>
            </div>
          </div>

          <div className="bg-black-darker border border-black-lighter rounded-xl p-6">
            <h4 className="text-white-light font-medium mb-6 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-mint" />
              How It Works
            </h4>
            <div className="space-y-4">
              {[
                {
                  num: "1",
                  label: "Choose triggers",
                  desc: "when effects activate",
                  color: "bg-trigger",
                },
                {
                  num: "2",
                  label: "Set conditions",
                  desc: "requirements to check",
                  color: "bg-condition",
                },
                {
                  num: "3",
                  label: "Define effects",
                  desc: "what happens",
                  color: "bg-effect",
                },
                {
                  num: "4",
                  label: "Export mod",
                  desc: "working SMODS files",
                  color: "bg-mint",
                },
              ].map((step) => (
                <div key={step.num} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 ${step.color} text-black text-sm font-bold rounded-lg flex items-center justify-center`}
                  >
                    {step.num}
                  </div>
                  <div>
                    <div className="text-white-light font-medium">
                      {step.label}
                    </div>
                    <div className="text-white-darker text-sm">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
