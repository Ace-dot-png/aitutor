interface SentimentBadgeProps {
  label: string;
  className?: string;
}

export default function SentimentBadge({ label, className = "" }: SentimentBadgeProps) {
  const colors: Record<string, string> = {
    positive: "bg-accent-green text-text-primary",
    neutral: "bg-border text-text-secondary",
    struggling: "bg-accent-orange text-text-primary",
    disengaged: "bg-accent-orange/60 text-text-secondary",
    POSITIVE: "bg-accent-green text-text-primary",
    NEUTRAL: "bg-border text-text-secondary",
    STRUGGLING: "bg-accent-orange text-text-primary",
    DISENGAGED: "bg-accent-orange/60 text-text-secondary",
  };
  return (
    <span className={`sentiment-badge ${colors[label] || "bg-border text-text-muted"} ${className}`}>
      {label.toLowerCase()}
    </span>
  );
}
