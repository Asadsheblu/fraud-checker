import { cn } from "@/lib/utils";

export function RiskScoreGauge({ score }: { score: number }) {
  const getColor = () => {
    if (score <= 30) return "text-safe";
    if (score <= 60) return "text-risky";
    return "text-fraud";
  };

  const getTrackColor = () => {
    if (score <= 30) return "stroke-safe";
    if (score <= 60) return "stroke-risky";
    return "stroke-fraud";
  };

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r="40" fill="none" strokeWidth="6" className="stroke-muted" />
        <circle
          cx="48" cy="48" r="40" fill="none" strokeWidth="6"
          strokeLinecap="round"
          className={cn(getTrackColor(), "transition-all duration-700")}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={cn("absolute text-xl font-bold font-mono", getColor())}>{score}</span>
    </div>
  );
}
