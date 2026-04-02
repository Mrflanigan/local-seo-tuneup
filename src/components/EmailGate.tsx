import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface EmailGateProps {
  onUnlock: (email: string) => void;
}

export default function EmailGate({ onUnlock }: EmailGateProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) onUnlock(email);
  };

  return (
    <div className="relative my-8">
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-primary mb-3" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Unlock Your Full Report
        </h3>
        <p className="text-muted-foreground mb-5 max-w-md mx-auto">
          Enter your email to see all 5 category breakdowns with personalized recommendations for your site.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          <Input
            type="email"
            placeholder="you@yourbusiness.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit">Unlock Report</Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">No spam. Just your report and one follow-up.</p>
      </div>
    </div>
  );
}
