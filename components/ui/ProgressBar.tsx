interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  className?: string;
}

export default function ProgressBar({ value, max = 100, color = "#1cdb19", label, className = "" }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={className}>
      {label && <div className="text-xs text-text-secondary mb-1 flex justify-between"><span>{label}</span><span>{Math.round(pct)}%</span></div>}
      <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
