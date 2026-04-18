import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

export interface SeedExpansion {
  synonyms: string[];
  problem_language: string[];
  colloquial: string[];
  cost_comparison: string[];
  adjacent_services: string[];
}

interface Props {
  description: string;
  expansion: SeedExpansion;
}

const CATEGORY_META: { key: keyof SeedExpansion; label: string; blurb: string }[] = [
  { key: "synonyms",          label: "The other words for what you do", blurb: "what customers call it when they don't know your industry terms" },
  { key: "problem_language",  label: "How they describe the pain",      blurb: "the words people use before they know who to call" },
  { key: "colloquial",        label: "How they actually type it",       blurb: "short, casual, in-a-hurry phrasing" },
  { key: "cost_comparison",   label: "What they search while shopping", blurb: "price, comparison, and decision-stage queries" },
  { key: "adjacent_services", label: "Doors that lead to your door",    blurb: "related searches that bring the right customer your way" },
];

export default function SeedExpansionReveal({ description, expansion }: Props) {
  const [open, setOpen] = useState(false);

  const totalCount = CATEGORY_META.reduce(
    (sum, c) => sum + (expansion[c.key]?.length || 0),
    0,
  );

  if (totalCount === 0) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-sm sm:text-base font-semibold text-white">
            How we widened your net
          </span>
          <span className="text-xs text-white/50 hidden sm:inline">
            — AI expanded your words into {totalCount} customer search angles
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-white/60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-primary/20">
          <div className="pt-3">
            <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-1">
              You said
            </p>
            <p className="text-sm text-white/80 italic">"{description}"</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-2">
              We expanded that into how real customers search
            </p>
            <div className="space-y-3">
              {CATEGORY_META.map(({ key, label, blurb }) => {
                const items = expansion[key] || [];
                if (items.length === 0) return null;
                return (
                  <div key={key}>
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-primary">{label}</span>
                      <span className="text-xs text-white/40">— {blurb}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((phrase, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/85"
                        >
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-white/50 leading-relaxed pt-1 border-t border-white/10">
            We then handed all of those to a real keyword database to see which ones people in your
            area actually search for — and how often. The numbers above are what survived.
          </p>
        </div>
      )}
    </div>
  );
}
