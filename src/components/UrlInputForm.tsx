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
import { Globe, MapPin } from "lucide-react";
import type { BusinessType } from "@/lib/scoring/types";

interface UrlInputFormProps {
  onSubmit: (url: string, city?: string, businessType?: BusinessType) => void;
  loading?: boolean;
  hideBusinessType?: boolean;
}

export default function UrlInputForm({ onSubmit, loading, hideBusinessType }: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">(hideBusinessType ? "local" : "");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      return;
    }
    if (cleanUrl && !cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl;
    }
    onSubmit(cleanUrl, city.trim() || undefined, (businessType || "local") as BusinessType);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-3">
      {!hideBusinessType && (
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1 text-left">
            <p className="text-xs text-foreground/70">Business Type</p>
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
            <p className="text-xs text-foreground/70">Location</p>
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

      <div className="flex gap-2">
        <div className="relative flex-[3]">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="yourbusiness.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10 h-14 text-lg text-foreground placeholder:text-foreground/60"
            disabled={loading}
          />
        </div>
        <Button
          type="button"
          onClick={() => handleSubmit()}
          className="h-14 px-6 text-base font-bold whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-100 disabled:bg-primary disabled:text-primary-foreground italic"
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
