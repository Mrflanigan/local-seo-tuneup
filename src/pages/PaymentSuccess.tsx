import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-3">
          You're all set.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Payment received. We'll be in touch within 24 hours to kick things off.
          Check your email for a confirmation and next steps.
        </p>
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
