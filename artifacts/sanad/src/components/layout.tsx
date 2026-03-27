import React from "react";
import { Link, useLocation } from "wouter";
import { Activity, ShieldAlert, HeartPulse, Building2, User, ChevronLeft } from "lucide-react";
import { cn } from "./shared";

export function Layout({ children, role }: { children: React.ReactNode; role: "emergency" | "doctor" | "citizen" | "admin" }) {
  const [location] = useLocation();

  const roleConfigs = {
    emergency: { icon: ShieldAlert, color: "text-destructive", label: "Emergency Access" },
    doctor: { icon: HeartPulse, color: "text-primary", label: "Physician Portal" },
    citizen: { icon: User, color: "text-accent", label: "Citizen Dashboard" },
    admin: { icon: Building2, color: "text-foreground", label: "Ministry Admin" }
  };

  const config = roleConfigs[role];
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <img 
                  src={`${import.meta.env.BASE_URL}images/sanad-logo.png`} 
                  alt="Sanad Logo" 
                  className="w-8 h-8 rounded-md bg-primary p-1"
                />
                <span className="font-display font-bold text-xl tracking-tight text-primary">SANAD</span>
              </div>
            </Link>
            <div className="h-6 w-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <Icon className={cn("w-5 h-5", config.color)} />
              <span className="font-semibold text-muted-foreground">{config.label}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Switch Role
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
