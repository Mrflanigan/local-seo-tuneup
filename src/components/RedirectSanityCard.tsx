import { ArrowRight, CheckCircle2, AlertTriangle, Link as LinkIcon, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { RedirectChainData } from "@/lib/scoring/types";
import { toast } from "sonner";

interface Props {
  data: RedirectChainData;
}

export default function RedirectSanityCard({ data }: Props) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const isClean = data.maxHops <= 2 && data.canonicalMatchesFinal;
  const longestChain = data.chains.reduce((max, c) => c.hops.length > max.hops.length ? c : max, data.chains[0]);
  const finalUrl = longestChain?.finalUrl || "Unknown";
  const finalStatus = longestChain?.finalStatus || 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${isClean ? "bg-green-500/10" : "bg-destructive/10"}`}>
          {isClean ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Redirect & Canonical Sanity
          </h3>
          <p className="text-xs text-muted-foreground">
            {isClean ? "Clean redirect path to a single canonical URL" : "Redirect issues detected"}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{data.maxHops}</p>
          <p className="text-[10px] text-muted-foreground">Max hops</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
          <p className={`text-2xl font-bold ${finalStatus === 200 ? "text-green-500" : "text-destructive"}`}>{finalStatus}</p>
          <p className="text-[10px] text-muted-foreground">Final status</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
          <p className={`text-2xl font-bold ${data.canonicalMatchesFinal ? "text-green-500" : "text-destructive"}`}>
            {data.canonicalMatchesFinal ? "✓" : "✗"}
          </p>
          <p className="text-[10px] text-muted-foreground">Canonical match</p>
        </div>
      </div>

      {/* Final URL */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold text-foreground">Final resolved URL</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-muted-foreground break-all flex-1">{finalUrl}</p>
          <button onClick={() => handleCopy(finalUrl)} className="shrink-0 p-1.5 rounded border border-border/50 bg-muted/50 hover:bg-muted transition-colors">
            {copiedUrl ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Canonical */}
      {data.canonicalUrl && (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3 mb-4">
          <p className="text-xs font-semibold text-foreground mb-1">Canonical URL from page</p>
          <p className="text-xs font-mono text-muted-foreground break-all">{data.canonicalUrl}</p>
          {!data.canonicalMatchesFinal && (
            <p className="text-xs text-destructive mt-1">⚠ Doesn't match the final resolved URL — this can confuse Google about which version to index.</p>
          )}
        </div>
      )}

      {/* Redirect chains */}
      {data.chains.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Redirect chains tested:</p>
          {data.chains.map((chain, i) => (
            <div key={i} className="rounded-lg border border-border/30 bg-background/50 p-2">
              <p className="text-[10px] font-mono text-muted-foreground mb-1">{chain.variant}</p>
              <div className="flex items-center flex-wrap gap-1">
                {chain.hops.map((hop, j) => (
                  <span key={j} className="flex items-center gap-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${hop.status >= 200 && hop.status < 300 ? "bg-green-500/10 text-green-600 dark:text-green-400" : hop.status >= 300 && hop.status < 400 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                      {hop.status}
                    </span>
                    {j < chain.hops.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/50" />}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Owner-friendly explanation */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isClean
            ? "Your site has a clean redirect path — visitors and Google reach your page quickly with no unnecessary detours. Your canonical tag correctly points to the same URL, preventing duplicate content issues."
            : data.maxHops > 2
              ? `Your site takes ${data.maxHops} redirects to reach the final page. Each redirect adds load time and can dilute SEO value. Aim for 2 hops or fewer (e.g., http → https → final URL).`
              : !data.canonicalMatchesFinal
                ? "Your canonical tag points to a different URL than where your redirects actually end up. This sends mixed signals to Google about which URL to index. Make sure your canonical tag matches your final resolved URL."
                : "Your redirects could be cleaner. A shorter redirect chain means faster page loads and clearer signals to Google."}
        </p>
      </div>
    </div>
  );
}
