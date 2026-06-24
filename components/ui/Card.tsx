interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`card p-5 ${onClick ? "cursor-pointer hover:border-accent-blue transition-colors" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
