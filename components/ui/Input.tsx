interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-text-secondary">{label}</label>}
      <input className={`input-field ${error ? "border-accent-orange" : ""} ${className}`} {...props} />
      {error && <span className="text-xs text-accent-orange">{error}</span>}
    </div>
  );
}
