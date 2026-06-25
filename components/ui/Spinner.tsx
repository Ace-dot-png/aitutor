export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-5 h-5 border-2 border-border border-t-accent-blue rounded-full animate-spin" />
    </div>
  );
}

export function DotsSpinner() {
  return (
    <span className="inline-flex gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" />
      <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: "0.2s" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: "0.4s" }} />
    </span>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-3 bg-border rounded w-1/3 mb-3" />
      <div className="h-6 bg-border rounded w-1/2 mb-2" />
      <div className="h-3 bg-border rounded w-2/3" />
    </div>
  );
}
