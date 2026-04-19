import { MessageCircle } from "lucide-react";

export default function WhatToDoNextCard() {
  return (
    <div className="mb-8 rounded-xl border border-border/60 bg-card/60 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
          A note on what to do next
        </h3>
      </div>

      <div className="space-y-3 text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
        <p>
          Your first instinct is probably to forward this to whoever built your site and ask{" "}
          <em className="text-foreground/90">"is this real?"</em> That's the right move — but
          here's the honest part: nobody loves having their work critiqued, and your builder may
          push back on some of it. That's human.
        </p>
        <p>
          So before you have that conversation, try this: paste this report into ChatGPT (or any
          AI you trust) and ask <em className="text-foreground/90">"is this fair?"</em> You'll get
          a neutral second opinion in 30 seconds. Then go to your builder with both perspectives
          in hand.
        </p>
        <p>
          One more thing — we work with web builders every day. Many of our best results come from
          collaborating with the team that already knows your site. If your builder wants to talk,
          we'd genuinely enjoy working with them.
        </p>
      </div>

      <p className="mt-4 pt-4 border-t border-border/40 text-xs sm:text-sm italic text-muted-foreground/70 leading-relaxed">
        The world is going AI. SEO-Osmosis™ is SEO, reimagined. Your builder will enjoy using it —
        one day.
      </p>
    </div>
  );
}
