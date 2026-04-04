import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = url.trim();
    if (cleanUrl && !cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl;
    }
    onSubmit(cleanUrl, city.trim() || undefined, businessType || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-4">
      {!hideBusinessType && (
        <div className="space-y-2 text-left">
          <Label htmlFor="business-type" className="text-sm font-semibold text-foreground">
            What Type of Business Is This?
          </Label>
          <Select
            value={businessType}
            onValueChange={(value) => setBusinessType(value as BusinessType)}
            disabled={loading}
          >
            <SelectTrigger id="business-type" className="h-12 text-base text-foreground">
              <SelectValue placeholder="Select Business Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local Business Serving a City or Area</SelectItem>
              <SelectItem value="online">Online Business Serving Customers Anywhere</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-foreground/80">
            Choose the Option That Best Matches How This Business Gets Customers.
          </p>
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
            className="pl-10 h-12 text-base text-foreground placeholder:text-foreground"
            disabled={loading}
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={
              businessType === "local"
                ? "City or ZIP"
                : businessType === "online"
                  ? "City or ZIP (optional)"
                  : "City or ZIP (if You Serve a Local Area)"
            }
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-10 h-12 text-base text-foreground placeholder:text-foreground"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          className="h-12 px-6 text-base font-bold whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-100 disabled:bg-primary disabled:text-primary-foreground"
          disabled={loading || !url.trim() || (!hideBusinessType && !businessType)}
          size="lg"
        >
          Run My Free Check
        </Button>
      </div>
    </form>
  );
}
