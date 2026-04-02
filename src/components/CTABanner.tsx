import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

export default function CTABanner() {
  return (
    <div className="rounded-xl bg-primary p-6 sm:p-8 text-center text-primary-foreground mt-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-2">
        Want These Fixes Done for You?
      </h3>
      <p className="mb-6 opacity-90 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
        We'll implement the highest-impact changes from this report to get you
        more calls and leads from Google — no guesswork required.
      </p>
      <Button
        variant="secondary"
        size="lg"
        className="font-semibold"
        asChild
      >
        <a href="#book-call">
          <Phone className="mr-2 h-4 w-4" />
          Book a 20-Minute Local SEO Gameplan Call
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
