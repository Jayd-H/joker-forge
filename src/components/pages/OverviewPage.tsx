import React, { useState } from "react";
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
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { JokerData, ModMetadata } from "../data/BalatroUtils";
import { logAllRuleCards } from "../generic/DebugLogging";

interface OverviewPageProps {
  jokerCount: number;
  jokers: JokerData[];
  modName: string;
  authorName: string;
  metadata: ModMetadata;
  setMetadata: (metadata: ModMetadata) => void;
  onExport: () => void;
  onNavigate: (section: string) => void;
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

const generateModIdFromName = (name: string): string => {
  return (
    name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "")
      .replace(/^[0-9]+/, "") || "custommod"
  );
};

const generatePrefixFromId = (id: string): string => {
  return id.toLowerCase().substring(0, 8);
};

const parseAuthorsString = (authorsString: string): string[] => {
  return authorsString
    .split(",")
    .map((author) => author.trim())
    .filter((author) => author.length > 0);
};

const formatAuthorsString = (authors: string[]): string => {
  return authors.join(", ");
};

const OverviewPage: React.FC<OverviewPageProps> = ({
  metadata,
  setMetadata,
  onExport,
  onNavigate,
  modName,
}) => {
  const [commits, setCommits] = React.useState<ParsedCommit[]>([]);
  const [commitsLoading, setCommitsLoading] = React.useState(true);

  const [editingName, setEditingName] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [editingVersion, setEditingVersion] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const displayName = metadata?.name || "My Custom Mod";
  const displayAuthor =
    metadata?.author && metadata.author.length > 0
      ? formatAuthorsString(metadata.author)
      : "Anonymous";
  const displayVersion = metadata?.version || "1.0.0";
  const displayDescription = metadata?.description || "";

  const [tempName, setTempName] = useState(displayName);
  const [tempAuthor, setTempAuthor] = useState(displayAuthor);
  const [tempVersion, setTempVersion] = useState(displayVersion);
  const [tempDescription, setTempDescription] = useState(displayDescription);

  React.useEffect(() => {
    fetchGitHubCommits().then((fetchedCommits) => {
      setCommits(fetchedCommits);
      setCommitsLoading(false);
    });
  }, []);

  React.useEffect(() => {
    setTempName(displayName);
    setTempAuthor(displayAuthor);
    setTempVersion(displayVersion);
    setTempDescription(displayDescription);
  }, [displayName, displayAuthor, displayVersion, displayDescription]);

  const handleNameSave = () => {
    if (!metadata || !setMetadata) return;

    const newMetadata = { ...metadata, name: tempName };

    if (tempName) {
      const generatedId = generateModIdFromName(tempName);
      const generatedPrefix = generatePrefixFromId(generatedId);
      newMetadata.id = generatedId;
      newMetadata.prefix = generatedPrefix;
      newMetadata.display_name = tempName;
    }

    setMetadata(newMetadata);
    setEditingName(false);
  };

  const handleAuthorSave = () => {
    if (!metadata || !setMetadata) return;

    setMetadata({
      ...metadata,
      author: parseAuthorsString(tempAuthor),
    });
    setEditingAuthor(false);
  };

  const handleVersionSave = () => {
    if (!metadata || !setMetadata) return;

    setMetadata({
      ...metadata,
      version: tempVersion,
    });
    setEditingVersion(false);
  };

  const handleDescriptionSave = () => {
    if (!metadata || !setMetadata) return;

    setMetadata({
      ...metadata,
      description: tempDescription,
    });
    setEditingDescription(false);
  };

  const handleCancel = (field: string) => {
    switch (field) {
      case "name":
        setTempName(displayName);
        setEditingName(false);
        break;
      case "author":
        setTempAuthor(displayAuthor);
        setEditingAuthor(false);
        break;
      case "version":
        setTempVersion(displayVersion);
        setEditingVersion(false);
        break;
      case "description":
        setTempDescription(displayDescription);
        setEditingDescription(false);
        break;
    }
  };

  return (
    <div className="min-h-screen font-lexend max-w-7xl mx-auto">
      <div className="p-8">
        <h1 className="text-3xl text-white-light tracking-widest text-center">
          Mod Overview
        </h1>
        <h1 className="text-xl text-white-dark font-light tracking-widest mb-6 text-center">
          {modName}
        </h1>
        <div className="mb-8">
          <div className="">
            <div className="space-y-6 flex-1">
              <div className="group">
                <button
                  onClick={logAllRuleCards}
                  className="p-1 text-mint hover:text-mint-light"
                >CLICK ME TO LOG ALL RULES</button>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="text-4xl font-bold border-b-2 border-mint text-white-light focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNameSave();
                        if (e.key === "Escape") handleCancel("name");
                      }}
                    />
                    <button
                      onClick={handleNameSave}
                      className="p-1 text-mint hover:text-mint-light"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCancel("name")}
                      className="p-1 text-white-darker hover:text-white-light"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-3 cursor-pointer group/edit"
                    onClick={() => setEditingName(true)}
                  >
                    <div className="text-4xl font-bold text-white-light group-hover/edit:text-mint transition-colors">
                      {displayName}
                    </div>
                    <PencilIcon className="h-5 w-5 text-white-darker group-hover/edit:text-mint transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                )}
              </div>

              <div className="group">
                {editingAuthor ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempAuthor}
                      onChange={(e) => setTempAuthor(e.target.value)}
                      className="text-lg border-b-2 border-mint text-white-darker focus:outline-none"
                      autoFocus
                      placeholder="Author One, Author Two"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAuthorSave();
                        if (e.key === "Escape") handleCancel("author");
                      }}
                    />
                    <button
                      onClick={handleAuthorSave}
                      className="p-1 text-mint hover:text-mint-light"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCancel("author")}
                      className="p-1 text-white-darker hover:text-white-light"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-3 cursor-pointer group/edit"
                    onClick={() => setEditingAuthor(true)}
                  >
                    <div className="text-white-darker text-lg group-hover/edit:text-mint transition-colors">
                      by {displayAuthor}
                    </div>
                    <PencilIcon className="h-4 w-4 text-white-darker group-hover/edit:text-mint transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                )}
              </div>

              <div className="group">
                {editingVersion ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempVersion}
                      onChange={(e) => setTempVersion(e.target.value)}
                      className="border-b-2 border-mint px-3 py-2 text-mint focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleVersionSave();
                        if (e.key === "Escape") handleCancel("version");
                      }}
                    />
                    <button
                      onClick={handleVersionSave}
                      className="p-1 text-mint hover:text-mint-light"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCancel("version")}
                      className="p-1 text-white-darker hover:text-white-light"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="inline-flex items-center gap-2 text-sm text-mint bg-mint/15 border border-mint/30 px-4 py-2 rounded-xl cursor-pointer group/edit"
                    onClick={() => setEditingVersion(true)}
                  >
                    <StarIcon className="h-4 w-4" />
                    <span className="group-hover/edit:text-mint-light transition-colors">
                      v{displayVersion}
                    </span>
                  </div>
                )}
              </div>

              <div className="group">
                {editingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      className="w-full h-16 border-b-2 border-mint text-white-light focus:outline-none resize-none"
                      autoFocus
                      placeholder="Describe your mod..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey)
                          handleDescriptionSave();
                        if (e.key === "Escape") handleCancel("description");
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDescriptionSave}
                        className="px-3 py-1 text-mint hover:text-mint-light text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleCancel("description")}
                        className="px-3 py-1 text-white-darker hover:text-white-light text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer group/edit py-2 transition-all"
                    onClick={() => setEditingDescription(true)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="text-white-light leading-relaxed group-hover/edit:text-mint transition-colors">
                          {displayDescription ||
                            "Click to add a description for your mod..."}
                        </div>
                      </div>
                      <PencilIcon className="h-4 w-4 text-white-darker group-hover/edit:text-mint transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="">
          <div className="flex items-center gap-3 mb-6">
            <WrenchScrewdriverIcon className="h-5 w-5 text-mint" />
            <h3 className="text-xl text-white-light font-medium">
              Quick Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => onNavigate("jokers")}
              className="group flex items-center gap-4 p-6 border border-black-lighter hover:border-mint/50 rounded-xl transition-all cursor-pointer hover:bg-gradient-to-r hover:from-black-darker hover:to-mint/5"
            >
              <div className="p-3 bg-mint/20 rounded-xl group-hover:bg-mint/30 transition-all group-hover:scale-110">
                <PlusIcon className="h-6 w-6 text-mint" />
              </div>
              <div className="text-left">
                <div className="text-white-light font-semibold text-lg mb-1">
                  Create Joker
                </div>
                <div className="text-white-darker text-sm">
                  Design new jokers
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate("metadata")}
              className="group flex items-center gap-4 p-6 border border-black-lighter hover:border-mint/50 rounded-xl transition-all cursor-pointer hover:bg-gradient-to-r hover:from-black-darker hover:to-mint/5"
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

        <div className=" mt-28 pt-8">
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <h2 className="text-2xl text-white-light tracking-widest font-light">
                Track Development
              </h2>
            </div>
          </div>
          <div className="">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CodeBracketSquareIcon className="h-6 w-6 text-mint" />
                <h2 className="text-xl text-white-light tracking-wide">
                  Recent GitHub Commits
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

            <div className="space-y-3 max-h-94 overflow-y-auto custom-scrollbar pr-2">
              {commitsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center gap-3 p-4 rounded-xl">
                        <div className="w-8 h-8 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4  rounded mb-2"></div>
                          <div className="h-3 rounded w-3/4"></div>
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
                    className="block p-4 border border-black-lighter rounded-xl hover:border-mint/30 transition-all group"
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
                          <span className="text-xs text-white-darker font-mono px-2 py-1 rounded">
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
        </div>

        <div className=" mt-28 pt-8">
          <div className="flex justify-center mb-8">
            <h2 className="text-2xl text-white-light tracking-widest font-light mb-6">
              What is Joker Forge?
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xl text-white-light font-medium mb-4">
                Visual Balatro Modding Tool
              </h3>
              <p className="text-white-light leading-relaxed mb-4">
                JokerForge is a visual and intuitively-designed tool for creating Balatro mods 
                using the Steamodded (SMODS) framework. The website enables users to add content to their Balatro game, such as:
                like:
                Jokers,
                Consumables,
                Booster packs,
                Enhancements,
                Seals,
                Editions,
                Vouchers,
                Decks,
                and various other miscellaneous features; all without having to write any Lua code.
                Updates to add new features to the site are frequent, and a community with a variety of different content creators is available on the Discord server.
              </p>
              <p className="text-white-darker leading-relaxed mb-4">
                This is a multi-developer project, and whilst
                the site has still some rough edges, bugs and some missing Features,
                it's been more and more polished ever since new developers have come.
                The goal isn't the most polished generated
                code, but rather a functional, flexible, and easy to use tool for all mod creators.
              </p>
              <p className="text-white-darker leading-relaxed mb-4">
                If you have found any issues, rather with the generated code or
                the user interface, or just have any suggestions, please feel
                free to open an issue on the GitHub Repository or
                create a post in the Joker Forge Discord server under the channels "bug-reports" or "suggestions".
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
              <p className="text-white-darker leading-relaxed">
                <a
                  href="https://discord.gg/eRBByq9AZX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-condition hover:underline text-lg"
                >
                  Join the Discord Server
                </a>
              </p>
            </div>
          </div>

          <div className=" border-black-lighter rounded-xl p-6">
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
