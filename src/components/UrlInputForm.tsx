import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Globe, MapPin } from "lucide-react";
import type { BusinessType } from "@/lib/scoring/types";

const STORAGE_KEY = "seo-form-inputs";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

interface UrlInputFormProps {
  onSubmit: (url: string, city?: string, businessType?: BusinessType, searchPhrases?: string[], businessName?: string, description?: string) => void;
  loading?: boolean;
  hideBusinessType?: boolean;
}

export default function UrlInputForm({ onSubmit, loading, hideBusinessType }: UrlInputFormProps) {
  const saved = loadSaved();
  const [businessName, setBusinessName] = useState(saved.businessName || "");
  const [url, setUrl] = useState(saved.url || "");
  const [city, setCity] = useState(saved.city || "");
  const [description, setDescription] = useState(saved.description || "");

  const name = businessName.trim();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ businessName, url, city, description }));
    } catch { /* storage full */ }
  }, [businessName, url, city, description]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    let cleanUrl = url.trim();
    if (!cleanUrl) return;
    if (!cleanUrl.startsWith("http")) cleanUrl = "https://" + cleanUrl;
    const inferredType: BusinessType = city.trim() ? "local" : "online";
    onSubmit(cleanUrl, city.trim() || undefined, inferredType, undefined, name || undefined, description.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3" style={{ maxWidth: "100%" }}>
      {/* Business name */}
      {!hideBusinessType && (
        <div className="space-y-1 text-left">
          <p className="text-xs text-foreground/70">What's the name of your business?</p>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="e.g. Acme Plumbing"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="pl-10 h-12 text-sm text-foreground placeholder:text-foreground/60"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* City (optional) */}
      {!hideBusinessType && (
        <div className="space-y-1 text-left">
          <p className="text-xs text-foreground/70">
            {name ? `Where are ${name}'s customers?` : "Where are your customers? (optional)"}
          </p>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="City or ZIP (optional)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pl-10 h-12 text-sm text-foreground placeholder:text-foreground/60"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Describe what you do */}
      {!hideBusinessType && (
        <div className="space-y-1 text-left">
          <p className="text-xs text-foreground/70">
            {name ? `Describe what ${name} does` : "Describe what your business does"}
          </p>
          <Textarea
            placeholder="e.g. We do residential and commercial lawn care, landscaping, moss removal, and seasonal cleanups"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] text-sm text-foreground placeholder:text-foreground/60 resize-none"
            disabled={loading}
            spellCheck={true}
            autoCorrect="on"
            autoCapitalize="sentences"
          />
        </div>
      )}

      {/* URL + submit */}
      <div className="flex gap-3" style={{ width: "100%", maxWidth: "100%" }}>
        <div className="relative" style={{ flex: "1 1 70%", minWidth: 0 }}>
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="your domain or URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-12 h-14 text-lg text-foreground placeholder:text-foreground/60"
            style={{ width: "100%" }}
            disabled={loading}
          />
        </div>
        <Button
          type="button"
          onClick={() => handleSubmit()}
          className="h-14 px-8 text-base font-bold whitespace-nowrap shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-100 disabled:bg-primary disabled:text-primary-foreground italic"
          disabled={loading}
          size="lg"
          style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
        >
          Run SEO Osmosis
        </Button>
      </div>
    </form>
  );
}
