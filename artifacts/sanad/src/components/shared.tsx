import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── Card ─────────────────────────────────────────────── */
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between px-5 py-4 border-b border-border", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-bold text-foreground", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

/* ─── Button ────────────────────────────────────────────── */
export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}) {
  const variants = {
    primary:     "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/25",
    secondary:   "bg-secondary text-foreground hover:bg-border",
    outline:     "border border-border bg-card text-foreground hover:bg-secondary",
    destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-sm shadow-destructive/25",
    accent:      "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/25",
    ghost:       "bg-transparent text-foreground hover:bg-secondary",
  };
  const sizes = {
    sm: "h-8 px-3.5 text-xs gap-1.5 rounded-xl",
    md: "h-9 px-4 text-sm gap-2 rounded-xl",
    lg: "h-11 px-6 text-sm font-semibold gap-2 rounded-2xl",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1",
        "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        variants[variant], sizes[size], className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  );
}

/* ─── Input ─────────────────────────────────────────────── */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
        "transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

/* ─── Select ────────────────────────────────────────────── */
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-9 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
        "transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/* ─── Badge ─────────────────────────────────────────────── */
export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "info" | "purple";
  className?: string;
}) {
  const variants = {
    default:     "bg-primary/10 text-primary border-transparent",
    info:        "bg-sky-100 text-sky-700 border-transparent",
    success:     "bg-emerald-100 text-emerald-700 border-transparent",
    warning:     "bg-amber-100 text-amber-700 border-transparent",
    destructive: "bg-red-100 text-red-700 border-transparent",
    outline:     "border-border text-muted-foreground bg-secondary",
    purple:      "bg-violet-100 text-violet-700 border-transparent",
  };
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide",
      variants[variant], className
    )}>
      {children}
    </span>
  );
}

/* ─── PageHeader ────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}

/* ─── KPI Card ──────────────────────────────────────────── */
export function KpiCard({ title, value, sub, icon: Icon, iconBg = "bg-secondary", iconColor = "text-primary", trend }: {
  title: string;
  value: string | number;
  sub?: string;
  icon?: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  trend?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardBody className="p-5">
        <div className="flex items-start justify-between mb-4">
          {Icon && (
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
          )}
          {trend && (
            <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">{trend}</span>
          )}
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{title}</p>
        <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
      </CardBody>
    </Card>
  );
}

/* ─── StatusDot ─────────────────────────────────────────── */
export function StatusDot({ status }: { status: "normal" | "abnormal" | "critical" | "active" | "inactive" }) {
  const colors = {
    normal:   "bg-emerald-500",
    active:   "bg-emerald-500",
    abnormal: "bg-amber-500",
    inactive: "bg-muted-foreground",
    critical: "bg-red-500 animate-pulse",
  };
  return <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", colors[status])} />;
}

/* ─── Tabs ──────────────────────────────────────────────── */
export function Tabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex border-b border-border gap-0 bg-card rounded-t-2xl overflow-hidden">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 -mb-px transition-all",
            active === tab.id
              ? "border-primary text-primary bg-primary/4"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
              active === tab.id
                ? "bg-primary text-white"
                : "bg-secondary text-muted-foreground"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Alert Banner ──────────────────────────────────────── */
export function AlertBanner({ children, variant = "warning" }: {
  children: React.ReactNode;
  variant?: "warning" | "destructive" | "info";
}) {
  const styles = {
    warning:     "bg-amber-50 border-amber-200 text-amber-900",
    destructive: "bg-red-50 border-red-200 text-red-900",
    info:        "bg-blue-50 border-blue-200 text-blue-900",
  };
  return (
    <div className={cn("flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-medium mb-5", styles[variant])}>
      {children}
    </div>
  );
}

/* ─── DataLabel ─────────────────────────────────────────── */
export function DataLabel({ label, children, className }: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      <div className="text-foreground">{children}</div>
    </div>
  );
}
