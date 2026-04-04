/**
 * A lightweight teaser shown on the landing page to plant the seed
 * about the different paths to page one before the user even scans.
 */
export default function MountainTeaser() {
  const paths = [
    { emoji: "🥾", label: "Start Climbing", desc: "DIY fixes" },
    { emoji: "🗺️", label: "Get a Map", desc: "Guided monitoring" },
    { emoji: "⛰️", label: "Guided Trip", desc: "Full service" },
    { emoji: "🚁", label: "Helicopter", desc: "Total domination" },
  ];

  return (
    <div className="mt-12 sm:mt-16">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/50 text-center mb-4">
        After your scan — pick your path to the top
      </p>
      <div className="flex items-end justify-center gap-3 sm:gap-5">
        {paths.map((p, i) => (
          <div
            key={p.label}
            className="flex flex-col items-center group"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {/* Elevation pillar */}
            <div
              className="w-1 rounded-full bg-gradient-to-t from-accent/40 to-primary/20 transition-all duration-500 mb-2"
              style={{ height: `${(i + 1) * 14}px` }}
            />
            <span className="text-2xl sm:text-3xl mb-1 group-hover:scale-110 transition-transform duration-200">
              {p.emoji}
            </span>
            <span className="text-[11px] font-semibold text-foreground/70">{p.label}</span>
            <span className="text-[10px] text-muted-foreground/50">{p.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
