import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, X } from "lucide-react";
import { toast } from "sonner";

const FACES = [
  { value: 1, emoji: "😞", label: "Poor" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😍", label: "Love it" },
];

interface FeedbackWidgetProps {
  url: string;
}

export default function FeedbackWidget({ url }: FeedbackWidgetProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSending(true);
    try {
      const { error } = await (supabase as any)
        .from("report_feedback")
        .insert({ url, rating, comment: comment.trim() || null });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Thanks for your feedback!");
    } catch (err) {
      console.error("Feedback error:", err);
      toast.error("Couldn't save feedback — please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) return null;

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Feedback
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-72 rounded-xl border border-border bg-card p-4 shadow-xl animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">
              How was this report?
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Rating faces */}
          <div className="flex justify-between mb-3">
            {FACES.map((f) => (
              <button
                key={f.value}
                onClick={() => setRating(f.value)}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-colors ${
                  rating === f.value
                    ? "bg-primary/15 ring-1 ring-primary/40"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-xl">{f.emoji}</span>
                <span className="text-[10px] text-muted-foreground">
                  {f.label}
                </span>
              </button>
            ))}
          </div>

          {/* Optional comment */}
          <Textarea
            placeholder="Anything else? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="text-sm resize-none mb-3"
          />

          <Button
            size="sm"
            disabled={!rating || sending}
            onClick={handleSubmit}
            className="w-full text-xs font-semibold"
          >
            {sending ? "Sending…" : "Send feedback"}
          </Button>
        </div>
      )}
    </>
  );
}
