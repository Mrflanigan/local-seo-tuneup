import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, MapPin, Building2, Laptop } from "lucide-react";
import type { BusinessType } from "@/lib/scoring/types";

interface UrlInputFormProps {
  onSubmit: (url: string, city?: string, businessType?: BusinessType) => void;
  loading?: boolean;
}

export default function UrlInputForm({ onSubmit, loading }: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("local");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = url.trim();
    if (cleanUrl && !cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl;
    }
    onSubmit(cleanUrl, city.trim() || undefined, businessType);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-3">
      {/* Business Type Selector */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative group">
          <button
            type="button"
            onClick={() => setBusinessType("local")}
            className={`w-full flex items-center justify-center gap-2 h-11 rounded-lg border text-sm font-medium transition-all ${
              businessType === "local"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Local Customers
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 hidden group-hover:block">
            <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg whitespace-nowrap">
              Plumber, dentist, restaurant, retail store, law office…
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            type="button"
            onClick={() => setBusinessType("online")}
            className={`w-full flex items-center justify-center gap-2 h-11 rounded-lg border text-sm font-medium transition-all ${
              businessType === "online"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card/60 text-muted-foreground hover:border-muted-foreground/40"
            }`}
          >
            <Laptop className="h-4 w-4" />
            Mostly Online
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 hidden group-hover:block">
            <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg whitespace-nowrap">
              SaaS, e-commerce, agency, consultant, freelancer…
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="yourbusiness.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="pl-10 h-12 text-base"
          disabled={loading}
        />
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={businessType === "local" ? "City or ZIP code (improves local scoring)" : "City or ZIP (optional)"}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="pl-10 h-12 text-base"
          disabled={loading}
        />
      </div>
      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={loading || !url.trim()}
        size="lg"
      >
        Run My Free Google Compatibility Check
      </Button>
    </form>
  );
}
