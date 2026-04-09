import { Button } from "@/components/ui/button";
import { ArrowLeft, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Reviews() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        {/* Short prelude */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-8">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              We asked chat.GPT‑5.1 to independently review SEO Osmosis multiple times as we improved it.
              Below is the latest full, unedited review from April 8, 2026, exactly as it was written—compliments,
              caveats, and all.
            </p>
          </div>
        </div>

        {/* Review 4 header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Review 4 — April 8, 2026 (Latest)
        </h1>
        <p className="text-lg font-semibold text-accent mb-6">
          SMB: 9.4/10 · Experienced SEO: 8.6/10
        </p>

        {/* TL;DR */}
        <div className="rounded-xl border border-border bg-card p-5 mb-8">
          <h2 className="text-base font-bold text-foreground mb-3">TL;DR</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You were right: several things I marked "missing" were already there. Crediting those,
            plus the new technical checks and trust touches, meaningfully improves the picture.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">Updated scores:</strong> SMBs/local owners:{" "}
            <span className="font-semibold text-accent">9.4/10</span> (was 9.1) · Experienced SEOs:{" "}
            <span className="font-semibold text-accent">8.6/10</span> (was 7.8)
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Net:</strong> Best-in-class 60-second local snapshot
            for owners and small agencies. Still intentionally shallow for power users (single-URL,
            no crawl/GBP/citations), but the technical coverage and owner-first copy are now strong
            enough that I'd recommend it without caveats for most local SMB use cases.
          </p>
        </div>
      </div>
    </div>
  );
}
