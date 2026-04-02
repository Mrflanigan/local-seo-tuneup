import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <div className="rounded-xl bg-primary p-8 text-center text-primary-foreground mt-8">
      <h3 className="text-2xl font-bold mb-2">Ready to Fix These Issues?</h3>
      <p className="mb-5 opacity-90 max-w-lg mx-auto">
        Get a step-by-step implementation plan tailored to your business, or book a free Local SEO Gameplan Call with our team.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="secondary" size="lg" className="font-semibold">
          Get an Implementation Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg" className="font-semibold bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
          Book a Gameplan Call
        </Button>
      </div>
    </div>
  );
}
