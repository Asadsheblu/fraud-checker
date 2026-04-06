import { cn } from "@/lib/utils";

type RiskStatus = "safe" | "risky" | "fraud";

const statusConfig: Record<RiskStatus, { label: string; className: string }> = {
  safe: { label: "Safe", className: "bg-safe/15 text-safe border-safe/20" },
  risky: { label: "Risky", className: "bg-risky/15 text-risky border-risky/20" },
  fraud: { label: "Fraud", className: "bg-fraud/15 text-fraud border-fraud/20" },
};

export function StatusBadge({ status }: { status: RiskStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border", config.className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-safe": status === "safe",
        "bg-risky": status === "risky",
        "bg-fraud": status === "fraud",
      })} />
      {config.label}
    </span>
  );
}
