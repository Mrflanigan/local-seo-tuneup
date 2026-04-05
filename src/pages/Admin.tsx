import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Play, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

type BusinessType = "local" | "online";

interface OutputBlock {
  label: string;
  data: any;
  loading: boolean;
  error: string | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("local");
  const [phrases, setPhrases] = useState("");

  const [outputs, setOutputs] = useState<Record<string, OutputBlock>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const updateOutput = (key: string, partial: Partial<OutputBlock>) => {
    setOutputs((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...partial } as OutputBlock,
    }));
  };

  const getPhraseList = () =>
    phrases.split("\n").map((p) => p.trim()).filter(Boolean);

  const runFullCheckup = async () => {
    const key = "full";
    updateOutput(key, { label: "Full Checkup Raw Output", data: null, loading: true, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("checkup", {
        body: { url, city: city || undefined, businessType, searchPhrases: getPhraseList() },
      });
      if (error) throw error;
      updateOutput(key, { data, loading: false });
    } catch (err: any) {
      updateOutput(key, { loading: false, error: err.message || "Failed" });
    }
  };

  const runOsmosisOnly = async () => {
    const key = "osmosis";
    updateOutput(key, { label: "Osmosis Raw Output (Site Audit subset)", data: null, loading: true, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("checkup", {
        body: { url, city: city || undefined, businessType, searchPhrases: [] },
      });
      if (error) throw error;
      // Extract site audit portion (everything except phraseOptics and pageSpeed)
      const auditData = data?.data
        ? {
            overallScore: data.data.overallScore,
            letterGrade: data.data.letterGrade,
            categories: data.data.categories,
            siteContext: data.data.siteContext,
            businessType: data.data.businessType,
          }
        : data;
      updateOutput(key, { data: auditData, loading: false });
    } catch (err: any) {
      updateOutput(key, { loading: false, error: err.message || "Failed" });
    }
  };

  const runPsiOnly = async () => {
    const key = "psi";
    updateOutput(key, { label: "PSI Raw Output", data: null, loading: true, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("checkup", {
        body: { url, city: city || undefined, businessType, searchPhrases: [] },
      });
      if (error) throw error;
      const psiData = data?.data?.pageSpeed || { note: "No PSI data returned" };
      updateOutput(key, { data: psiData, loading: false });
    } catch (err: any) {
      updateOutput(key, { loading: false, error: err.message || "Failed" });
    }
  };

  const runPhraseOptics = async () => {
    const key = "phrase";
    updateOutput(key, { label: "Phrase Optics / Competitors Raw Output", data: null, loading: true, error: null });
    try {
      const phraseList = getPhraseList();
      // Run checkup with phrases for optics
      const { data, error } = await supabase.functions.invoke("checkup", {
        body: { url, city: city || undefined, businessType, searchPhrases: phraseList },
      });
      if (error) throw error;
      const phraseData = {
        phraseOptics: data?.data?.phraseOptics || null,
        note: phraseList.length === 0 ? "No phrases provided" : undefined,
      };
      updateOutput(key, { data: phraseData, loading: false });
    } catch (err: any) {
      updateOutput(key, { loading: false, error: err.message || "Failed" });
    }
  };

  const openReport = async () => {
    // Run full checkup then navigate to report with result
    try {
      const { data, error } = await supabase.functions.invoke("checkup", {
        body: { url, city: city || undefined, businessType, searchPhrases: getPhraseList() },
      });
      if (error) throw error;
      if (data?.data) {
        navigate("/report", { state: { result: data.data, url, city: city || undefined, businessType } });
      }
    } catch {
      // silently fail
    }
  };

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Warning banner */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-8 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300 font-medium">
            Admin Panel — Internal use only. This runs scans directly and shows raw data.
          </p>
        </div>

        {/* ── Inputs ── */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-foreground">Inputs</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">URL (required)</label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">City (optional)</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Everett WA" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="local">Local</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Search Phrases (one per line)</label>
              <Textarea
                value={phrases}
                onChange={(e) => setPhrases(e.target.value)}
                placeholder={"plumber Everett WA\nemergency plumber near me"}
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* ── Actions ── */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-foreground">Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={runFullCheckup} disabled={!url} className="h-12 justify-start gap-2">
              <Play className="h-4 w-4" /> Run Full Checkup
            </Button>
            <Button onClick={runOsmosisOnly} disabled={!url} variant="outline" className="h-12 justify-start gap-2">
              <Play className="h-4 w-4" /> Run Osmosis Only
            </Button>
            <Button onClick={runPsiOnly} disabled={!url} variant="outline" className="h-12 justify-start gap-2">
              <Play className="h-4 w-4" /> Run PSI Only
            </Button>
            <Button onClick={runPhraseOptics} disabled={!url} variant="outline" className="h-12 justify-start gap-2">
              <Play className="h-4 w-4" /> Run Phrase Optics
            </Button>
          </div>
        </section>

        {/* ── Open Report ── */}
        <section className="mb-8">
          <Button onClick={openReport} disabled={!url} variant="secondary" className="gap-2">
            <ExternalLink className="h-4 w-4" /> Open normal report for this URL
          </Button>
        </section>

        {/* ── Raw Outputs ── */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-foreground">Raw Outputs</h2>
          {Object.entries(outputs).length === 0 && (
            <p className="text-sm text-muted-foreground">Run a scan above to see raw JSON here.</p>
          )}
          {Object.entries(outputs).map(([key, block]) => (
            <div key={key} className="mb-4 rounded-lg border border-border bg-card overflow-hidden">
              <button
                onClick={() => toggleCollapse(key)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-foreground">{block.label}</span>
                <div className="flex items-center gap-2">
                  {block.loading && (
                    <span className="text-xs text-muted-foreground animate-pulse">Running…</span>
                  )}
                  {collapsed[key] ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {!collapsed[key] && (
                <div className="px-4 pb-4">
                  {block.error && (
                    <p className="text-sm text-destructive mb-2">Error: {block.error}</p>
                  )}
                  {block.data && (
                    <pre className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 overflow-auto max-h-96 whitespace-pre-wrap break-words">
                      {JSON.stringify(block.data, null, 2)}
                    </pre>
                  )}
                  {!block.data && !block.loading && !block.error && (
                    <p className="text-xs text-muted-foreground">No data yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
