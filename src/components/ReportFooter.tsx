import { Link } from "react-router-dom";
import { Shield, Clock, Info } from "lucide-react";

interface ReportFooterProps {
  scannedAt?: string; // ISO date string; defaults to now
}

const TOOL_VERSION = "1.0.0";

export default function ReportFooter({ scannedAt }: ReportFooterProps) {
  const date = scannedAt ? new Date(scannedAt) : new Date();
  const formatted = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mt-10 pt-5 border-t border-border/50 text-center space-y-1.5">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Checked on: {formatted}
        </span>
        <span className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          Tool version: {TOOL_VERSION}
        </span>
        <Link
          to="/privacy"
          className="flex items-center gap-1 text-primary/70 hover:text-primary hover:underline"
        >
          <Shield className="h-3 w-3" />
          Data &amp; privacy
        </Link>
      </div>
    </div>
  );
}
