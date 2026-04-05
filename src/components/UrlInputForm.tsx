// Save point — layout stable
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, MapPin, Search } from "lucide-react";
import type { BusinessType } from "@/lib/scoring/types";

interface UrlInputFormProps {
  onSubmit: (url: string, city?: string, businessType?: BusinessType, searchPhrases?: string[], businessName?: string) => void;
  loading?: boolean;
  hideBusinessType?: boolean;
}

export default function UrlInputForm({ onSubmit, loading, hideBusinessType }: UrlInputFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">(hideBusinessType ? "local" : "");
  const [phrase1, setPhrase1] = useState("");
  const [phrase2, setPhrase2] = useState("");

  const name = businessName.trim();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      return;
    }
    if (cleanUrl && !cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl;
    }
    const phrases = [phrase1.trim(), phrase2.trim()].filter(Boolean);
    onSubmit(cleanUrl, city.trim() || undefined, (businessType || "local") as BusinessType, phrases.length > 0 ? phrases : undefined, name || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3" style={{ maxWidth: "100%" }}>
      {!hideBusinessType && (
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1 text-left">
            <p className="text-xs text-foreground/70">How does this business get customers?</p>
            <Select
              value={businessType}
              onValueChange={(value) => setBusinessType(value as BusinessType)}
              disabled={loading}
            >
              <SelectTrigger id="business-type" className="h-12 text-sm text-foreground">
                <SelectValue placeholder="Local or Online?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local (City/Area)</SelectItem>
                <SelectItem value="online">Online (Anywhere)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1 space-y-1">
            <p className="text-xs text-foreground/70">Where are your customers? (Helps us score local signals)</p>
            <MapPin className="absolute left-3 bottom-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={
                businessType === "local"
                  ? "City or ZIP"
                  : businessType === "online"
                    ? "City or ZIP (optional)"
                    : "City or ZIP"
              }
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pl-10 h-12 text-sm text-foreground placeholder:text-foreground/60"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Search phrases — what would someone Google? */}
      {!hideBusinessType && (
        <div className="space-y-1">
          <p className="text-xs text-foreground/70">What would someone Google to find you? (Helps us check your ranking)</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder='e.g. "emergency plumber"'
                value={phrase1}
                onChange={(e) => setPhrase1(e.target.value)}
                className="pl-9 h-12 text-sm text-foreground placeholder:text-foreground/60"
                disabled={loading}
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="2nd phrase (optional)"
                value={phrase2}
                onChange={(e) => setPhrase2(e.target.value)}
                className="pl-9 h-12 text-sm text-foreground placeholder:text-foreground/60"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}

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
