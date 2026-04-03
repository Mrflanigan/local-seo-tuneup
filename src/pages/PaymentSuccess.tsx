import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Payment received. We're on it.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Your confirmation and next steps are hitting your inbox right now.
          We're already starting on your site.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate("/")} variant="outline">
            Run Another Scan
          </Button>
        </div>
      </div>
    </div>
  );
}
