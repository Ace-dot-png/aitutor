interface MasteryPillProps {
  score: number;
  className?: string;
}

export default function MasteryPill({ score, className = "" }: MasteryPillProps) {
  let color: string;
  if (score >= 70) color = "bg-accent-green";
  else if (score >= 40) color = "bg-accent-orange";
  else color = "bg-accent-orange/60";

  return (
    <span className={`mastery-pill text-text-primary ${color} ${className}`}>
      {score}%
    </span>
  );
}
