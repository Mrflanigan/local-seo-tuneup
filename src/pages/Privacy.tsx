import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Data &amp; Privacy
          </h1>
        </div>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          SEO Osmosis is built for transparency. Here's exactly what we collect,
          why, and how long we keep it — in plain language.
        </p>

        <section className="space-y-8">
          {/* What we store */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              What we store
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Your website URL</strong> — so we know what site was scanned.
              </li>
              <li>
                <strong className="text-foreground">Scan results</strong> — scores, findings, and category breakdowns.
                We do <em>not</em> store your actual page content.
              </li>
              <li>
                <strong className="text-foreground">City / service area</strong> — if you provided one, to personalise local findings.
              </li>
              <li>
                <strong className="text-foreground">Email address</strong> — only if you choose to submit it for a follow‑up plan.
              </li>
              <li>
                <strong className="text-foreground">Before / After snapshots</strong> — if you save one, we store the score and findings so you can track progress over time.
              </li>
              <li>
                <strong className="text-foreground">IP‑based scan count</strong> — a daily counter to enforce our complimentary scan limit (3 per day). We do not log or store full IP addresses permanently.
              </li>
            </ul>
          </div>

          {/* Why we store it */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Why we store it
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground leading-relaxed">
              <li>To show you your report and let you come back to it.</li>
              <li>To power before/after case studies so you can see real progress.</li>
              <li>To send you a follow‑up implementation plan — only if you asked for one.</li>
              <li>To prevent abuse of the complimentary scanning limit.</li>
            </ul>
          </div>

          {/* How long */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              How long we keep it
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
              <p>
                <strong className="text-foreground">Scan results &amp; snapshots:</strong> Retained
                indefinitely to support progression tracking. We may periodically
                remove scans older than 12 months that have no associated snapshots.
              </p>
              <p>
                <strong className="text-foreground">Email addresses:</strong> Kept until you
                unsubscribe or request deletion.
              </p>
              <p>
                <strong className="text-foreground">Rate‑limit counters:</strong> Reset daily.
                Block records expire automatically.
              </p>
            </div>
          </div>

          {/* What we don't do */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              What we don't do
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground leading-relaxed">
              <li>We don't sell or share your data with third parties.</li>
              <li>We don't use tracking pixels or third‑party ad cookies.</li>
              <li>We don't store your page HTML — only the structured findings our checks produce.</li>
            </ul>
          </div>

          {/* Deletion */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Request deletion
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Want your data removed? Email{" "}
              <a
                href="mailto:privacy@seoosmosis.com"
                className="text-primary hover:underline"
              >
                privacy@seoosmosis.com
              </a>{" "}
              with the URL you scanned and we'll delete all associated records
              within 7 business days.
            </p>
          </div>
        </section>

        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground/60">
            Last updated: April 2025. We'll update this page if our practices change.
          </p>
        </div>
      </div>
    </div>
  );
}
