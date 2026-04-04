import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, MapPin } from "lucide-react";
import type { BusinessType } from "@/lib/scoring/types";
import { cn } from "@/lib/utils";

interface UrlInputFormProps {
  onSubmit: (url: string, city?: string, businessType?: BusinessType) => void;
  loading?: boolean;
  hideBusinessType?: boolean;
}

export default function UrlInputForm({ onSubmit, loading, hideBusinessType }: UrlInputFormProps) {
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
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-3">
      {!hideBusinessType && (
      <div className="grid grid-cols-2 gap-2">
        <div className="relative group">
          <button
            type="button"
            onClick={() => setBusinessType("local")}
              className={cn(
                "w-full flex items-center justify-center gap-2 h-11 rounded-lg border text-sm font-semibold transition-all",
                "bg-primary text-white hover:bg-primary/90",
                businessType === "local" ? "border-primary ring-1 ring-primary/50" : "border-primary/60"
              )}
          >
            Local Customers
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 z-50 hidden group-hover:block">
            <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg whitespace-nowrap">
              Plumber, dentist, restaurant, retail store, law office…
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            type="button"
            onClick={() => setBusinessType("online")}
              className={cn(
                "w-full flex items-center justify-center gap-2 h-11 rounded-lg border text-sm font-medium transition-all",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                businessType === "online" ? "border-primary ring-1 ring-primary/50" : "border-primary/60"
              )}
          >
            Mostly Online
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 z-50 hidden group-hover:block">
            <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg whitespace-nowrap">
              SaaS, e-commerce, agency, consultant, freelancer…
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
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
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={businessType === "local" ? "City or ZIP" : "City or ZIP (optional)"}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-10 h-12 text-base"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          className="h-12 px-6 text-base font-semibold whitespace-nowrap"
          disabled={loading || !url.trim()}
          size="lg"
        >
          Run My Free Check
        </Button>
      </div>
    </form>
  );
}
