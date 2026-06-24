interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export default function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`${variant === "primary" ? "btn-primary" : "btn-secondary"} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
