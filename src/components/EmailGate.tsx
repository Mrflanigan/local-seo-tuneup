import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock } from "lucide-react";

interface EmailGateProps {
  onUnlock: (email: string, wantsGameplan: boolean) => void;
}

export default function EmailGate({ onUnlock }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [wantsGameplan, setWantsGameplan] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) onUnlock(email, wantsGameplan);
  };

  return (
    <div className="relative my-8">
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 sm:p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-primary mb-3" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          See Your Full Google Compatibility Report
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm leading-relaxed">
          Get a detailed breakdown of what's holding you back in local search,
          plus a copy sent to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
          <Input
            type="email"
            placeholder="you@yourbusiness.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
          <div className="flex items-start gap-2 text-left">
            <Checkbox
              id="gameplan"
              checked={wantsGameplan}
              onCheckedChange={(checked) => setWantsGameplan(!!checked)}
              className="mt-0.5"
            />
            <label htmlFor="gameplan" className="text-sm text-muted-foreground cursor-pointer leading-snug">
              Send me a 15-minute Local SEO Gameplan offer
            </label>
          </div>
          <Button type="submit" className="w-full h-11 font-semibold">
            Show Me the Full Report
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">
          No spam. Just your report and one follow-up.
        </p>
      </div>
    </div>
  );
}
