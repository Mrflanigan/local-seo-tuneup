import { Briefcase, Users, MapPin } from "lucide-react";

export interface InputInterpretation {
  what_you_do: string;
  who_you_serve: string;
  where_you_serve: string;
}

interface Props {
  interpretation: InputInterpretation;
}

export default function InterpretationCard({ interpretation }: Props) {
  const rows = [
    { icon: Briefcase, label: "What you do",    value: interpretation.what_you_do },
    { icon: Users,     label: "Who you serve",  value: interpretation.who_you_serve },
    { icon: MapPin,    label: "Where you serve", value: interpretation.where_you_serve },
  ].filter(r => r.value && r.value.length > 0);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-4 sm:p-5 space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className="text-sm sm:text-base font-semibold text-white">
          Here's how we read what you told us
        </p>
        <p className="text-xs text-white/50 italic">
          (in your customer's words, not yours)
        </p>
      </div>

      <div className="space-y-2.5">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-0.5">
                {label}
              </p>
              <p className="text-sm sm:text-base text-white/90 leading-snug">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/55 leading-relaxed pt-2 border-t border-white/10">
        We use this read of your business to find the searches that lead to you.
        If anything is off, just go back and refine — we'll re-translate.
      </p>
    </div>
  );
}
