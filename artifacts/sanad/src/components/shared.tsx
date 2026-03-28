import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-lg border border-border shadow-sm",
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
    <h3 className={cn("text-sm font-semibold text-foreground", className)} {...props}>
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
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border bg-transparent hover:bg-secondary text-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm",
    ghost: "bg-transparent text-foreground hover:bg-secondary",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-9 px-4 text-sm gap-2",
    lg: "h-11 px-6 text-sm font-semibold gap-2",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
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

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-sm",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
        "transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
        "transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Badge({
  children,
  variant = "default",
  className
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "info";
  className?: string;
}) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    outline: "border-border text-muted-foreground bg-transparent"
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

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
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("border-t border-border", className)} />;
}

export function KpiCard({ title, value, sub, icon: Icon, color = "text-primary", trend }: {
  title: string;
  value: string | number;
  sub?: string;
  icon?: React.ElementType;
  color?: string;
  trend?: string;
}) {
  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            {Icon && (
              <div className="p-2 bg-secondary rounded-md">
                <Icon className={cn("w-4 h-4", color)} />
              </div>
            )}
            {trend && (
              <span className="text-xs font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded">{trend}</span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function StatusDot({ status }: { status: "normal" | "abnormal" | "critical" | "active" | "inactive" }) {
  const colors = {
    normal: "bg-success",
    active: "bg-success",
    abnormal: "bg-warning",
    inactive: "bg-muted-foreground",
    critical: "bg-destructive animate-pulse"
  };
  return <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", colors[status])} />;
}

export function Tabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex border-b border-border gap-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-semibold",
              active === tab.id ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
