interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "green" | "orange" | "grey";
  className?: string;
}

export default function Badge({ children, variant = "grey", className = "" }: BadgeProps) {
  const colors = {
    blue: "bg-accent-blue/20 text-accent-blue",
    green: "bg-accent-green/20 text-accent-green",
    orange: "bg-accent-orange/20 text-accent-orange",
    grey: "bg-border text-text-muted",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[variant]} ${className}`}>
      {children}
    </span>
  );
}
