import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card text-card-foreground rounded-2xl border border-border/50 shadow-lg shadow-black/5 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
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
  variant?: "primary" | "secondary" | "outline" | "destructive" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-2 border-border bg-transparent hover:border-primary hover:text-primary",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/20",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md shadow-accent/20",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg font-semibold",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        "active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
        "flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary",
        "transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Badge({ 
  children, 
  variant = "default",
  className 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
  className?: string;
}) {
  const variants = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/15 text-destructive",
    outline: "border border-border text-foreground"
  };
  
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide", variants[variant], className)}>
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-display font-bold text-foreground">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground text-lg">{subtitle}</p>}
    </div>
  );
}
