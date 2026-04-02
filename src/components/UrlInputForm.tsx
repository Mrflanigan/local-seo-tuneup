import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, MapPin } from "lucide-react";

interface UrlInputFormProps {
  onSubmit: (url: string, city?: string) => void;
  loading?: boolean;
}

export default function UrlInputForm({ onSubmit, loading }: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = url.trim();
    if (cleanUrl && !cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl;
    }
    onSubmit(cleanUrl, city.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-3">
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
          placeholder="City, State (optional — improves local scoring)"
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
