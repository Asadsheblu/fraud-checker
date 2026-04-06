import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor }: StatCardProps) {
  return (
    <div className="gradient-card border border-border rounded-xl p-5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          {change && (
            <p className={cn("text-xs mt-1 font-medium", {
              "text-safe": changeType === "positive",
              "text-fraud": changeType === "negative",
              "text-muted-foreground": changeType === "neutral",
            })}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg bg-muted", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
