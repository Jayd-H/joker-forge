import React, { useEffect, useMemo, useState } from "react";
import { XMarkIcon, PhotoIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface PlaceholderPickerModalProps {
  type: "joker" | "consumable" | "booster" | "enhancement" | "seal" | "voucher" | "deck";
  isOpen: boolean;
  onClose: () => void;
  onSelect: (index: number, src: string) => void;
}

const TYPES: PlaceholderPickerModalProps["type"][] = [
  "joker",
  "consumable",
  "booster",
  "enhancement",
  "seal",
  "voucher",
  "deck",
];

const DIRS: Record<PlaceholderPickerModalProps["type"], { dir: string; base: string; label: string }> = {
  joker:        { dir: "/images/placeholderjokers",       base: "placeholder-joker",        label: "Jokers" },
  consumable:   { dir: "/images/placeholderconsumables",  base: "placeholder-consumable",   label: "Consumables" },
  booster:      { dir: "/images/placeholderboosters",     base: "placeholder-booster",      label: "Boosters" },
  enhancement:  { dir: "/images/placeholderenhancements", base: "placeholder-enhancement",  label: "Enhancements" },
  seal:         { dir: "/images/placeholderseals",        base: "placeholder-seal",         label: "Seals" },
  voucher:      { dir: "/images/placeholdervouchers",     base: "placeholder-voucher",      label: "Vouchers" },
  deck:        { dir: "/images/placeholderdecks",     base: "placeholder-deck",      label: "Decks" },
};

const PlaceholderPickerModal: React.FC<PlaceholderPickerModalProps> = ({ type, isOpen, onClose, onSelect }) => {
  const [activeType, setActiveType] = useState<PlaceholderPickerModalProps["type"]>(type);
  const [credits, setCredits] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen) setActiveType(type);
  }, [isOpen, type]);

  useEffect(() => {
    const { body } = document;
    const prev = body.style.overflow;
    if (isOpen) body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      try {
        const { dir } = DIRS[activeType];
        const res = await fetch(`${dir}/credit.txt`, { signal: controller.signal });
        const text = await res.text();
        const map: Record<number, string> = {};
        text.split("\n").forEach((line) => {
          const t = line.trim();
          if (!t || !t.includes(":")) return;
          const [idx, name] = t.split(":");
          const n = parseInt((idx || "").trim(), 10);
          if (!Number.isNaN(n)) map[n] = (name || "").trim();
        });
        setCredits(map);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          console.error("Failed to load placeholder credits", e);
          setCredits({});
        }
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [isOpen, activeType]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const { dir, base, } = DIRS[activeType];

  const filteredIndices = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = Object.keys(credits)
      .map((k) => parseInt(k, 10))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);

    if (!q) return all;
    return all.filter((i) => (credits[i] || "").toLowerCase().includes(q) || String(i).includes(q));
  }, [credits, query]);

  return (
    <div
      aria-hidden={!isOpen}
      className={[
        "fixed inset-0 z-[1000] flex items-center justify-center transition-opacity duration-150",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-black/70"  onClick={onClose} />

      <div
      onClick={(e) => e.stopPropagation()}
        className={[
          "relative w-[90vw] max-w-4xl h-[80vh]",
          "bg-black-darker border-2 border-black-light rounded-xl overflow-hidden font-lexend",
          "flex flex-col shadow-xl transition-transform duration-150",
          isOpen ? "translate-y-0" : "translate-y-2"
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-black-light">
          <div className="flex items-center gap-2 text-white-light">
            <PhotoIcon className="h-5 w-5 text-mint" />
            <span>Pick a Placeholder</span>
            <span className="text-white-darker/70 text-xs ml-2"></span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black-light cursor-pointer">
            <XMarkIcon className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-black-light flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={[
                  "px-3 py-1.5 rounded-full border text-sm transition cursor-pointer",
                  t === activeType
                    ? "bg-mint/20 border-mint text-mint"
                    : "bg-black border-black-lighter text-white-darker hover:border-mint/40 hover:text-white"
                ].join(" ")}
              >
                {DIRS[t].label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white-darker" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or #"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-black border border-black-lighter text-white placeholder-white-darker/60 focus:outline-none focus:border-mint"
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="text-white-darker text-sm">Loading…</div>
          ) : filteredIndices.length === 0 ? (
            <div className="text-white-darker text-sm">No placeholders match your search.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredIndices.map((index) => {
                const src = `${dir}/${base}-${index}.png`;
                return (
                  <button
                    key={index}
                    onClick={() => onSelect(index, src)}
                    className="group relative border-2 border-black-lighter rounded-lg overflow-hidden hover:border-mint transition cursor-pointer"
                  >
                    <img
                      src={src}
                      alt={`Placeholder ${index}`}
                      className="w-full h-full object-contain bg-black"
                      draggable="false"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 text-[10px] text-white-darker bg-black/60 px-1 py-1 text-left">
                      {credits[index] || `Placeholder ${index}`}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPickerModal;
