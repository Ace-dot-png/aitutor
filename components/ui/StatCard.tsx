interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: number; positive: boolean };
  className?: string;
}

export default function StatCard({ label, value, delta, className = "" }: StatCardProps) {
  return (
    <div className={`card p-4 ${className}`}>
      <div className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-semibold text-text-primary">{value}</div>
      {delta && (
        <div className={`text-xs mt-1 flex items-center gap-1 ${delta.positive ? "text-accent-green" : "text-accent-orange"}`}>
          {delta.positive ? "▲" : "▼"} {Math.abs(delta.value)}%
        </div>
      )}
    </div>
  );
}
