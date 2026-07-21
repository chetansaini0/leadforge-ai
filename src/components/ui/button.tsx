import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-fg)] hover:brightness-110 shadow-[0_8px_24px_-10px_var(--ring)]",
  outline: "border border-[var(--border)] hover:bg-[var(--surface-2)]",
  ghost: "hover:bg-[var(--surface-2)]",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
  icon: "h-9 w-9",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
