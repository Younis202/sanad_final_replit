import React from "react";
import { Link, useLocation } from "wouter";
import {
  ShieldAlert, HeartPulse, User, Building2,
  LayoutDashboard, ChevronRight, LogOut,
  Bell, Settings, LifeBuoy, Zap
} from "lucide-react";
import { cn } from "./shared";

type Role = "emergency" | "doctor" | "citizen" | "admin";

const roleConfigs: Record<Role, {
  label: string;
  sublabel: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  emergencyColor: string;
  nav: { href: string; icon: React.ElementType; label: string }[];
  user: string;
  userRole: string;
  topTabs: { label: string; active?: boolean }[];
}> = {
  emergency: {
    label: "Sanad",
    sublabel: "EMERGENCY RESPONSE",
    icon: ShieldAlert,
    iconBg: "bg-red-600",
    iconColor: "text-white",
    emergencyColor: "bg-red-50 text-red-600 border-red-200",
    user: "Unit 7 — First Responder",
    userRole: "Emergency Access",
    topTabs: [
      { label: "Dashboard" }, { label: "Active Cases", active: true }, { label: "Resources" }
    ],
    nav: [
      { href: "/emergency", icon: ShieldAlert, label: "Emergency Lookup" },
    ],
  },
  doctor: {
    label: "Sanad",
    sublabel: "HEALTH INTELLIGENCE",
    icon: HeartPulse,
    iconBg: "bg-primary",
    iconColor: "text-white",
    emergencyColor: "bg-red-50 text-red-600 border-red-200",
    user: "Dr. Ahmed Al-Rashidi",
    userRole: "Physician · King Fahd MC",
    topTabs: [
      { label: "Dashboard", active: true }, { label: "Analytics" }, { label: "Reports" }, { label: "Audit" }
    ],
    nav: [
      { href: "/doctor", icon: LayoutDashboard, label: "Patient Dashboard" },
    ],
  },
  citizen: {
    label: "Sanad",
    sublabel: "CITIZEN PORTAL",
    icon: User,
    iconBg: "bg-amber-500",
    iconColor: "text-white",
    emergencyColor: "bg-red-50 text-red-600 border-red-200",
    user: "Citizen Access",
    userRole: "National Health Record",
    topTabs: [
      { label: "My Health", active: true }, { label: "Prescriptions" }, { label: "Visits" }
    ],
    nav: [
      { href: "/citizen", icon: User, label: "My Health Records" },
    ],
  },
  admin: {
    label: "Sanad",
    sublabel: "HEALTH INTELLIGENCE",
    icon: Building2,
    iconBg: "bg-primary",
    iconColor: "text-white",
    emergencyColor: "bg-red-50 text-red-600 border-red-200",
    user: "Ministry Admin",
    userRole: "Population Health",
    topTabs: [
      { label: "Dashboard", active: true }, { label: "Analytics" }, { label: "Population" }, { label: "Resources" }
    ],
    nav: [
      { href: "/admin", icon: LayoutDashboard, label: "Analytics Dashboard" },
    ],
  },
};

export function Layout({ children, role }: { children: React.ReactNode; role: Role }) {
  const [location] = useLocation();
  const config = roleConfigs[role];
  const RoleIcon = config.icon;

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ─── White Sidebar ─── */}
      <aside className="w-56 shrink-0 flex flex-col h-full bg-card border-r border-border">

        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", config.iconBg)}>
            <img
              src={`${import.meta.env.BASE_URL}images/sanad-logo.png`}
              alt="Sanad"
              className="w-5 h-5 object-contain brightness-0 invert"
            />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-foreground text-sm">{config.label}</p>
            <p className="text-[9px] font-semibold text-muted-foreground tracking-widest uppercase">{config.sublabel}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto sidebar-scroll">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">Navigation</p>
          {config.nav.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all",
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}

          <div className="pt-4 pb-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">System</p>
          </div>
          {[
            { icon: Bell, label: "Notifications" },
            { icon: LifeBuoy, label: "Support" },
            { icon: Settings, label: "Settings" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-all">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </nav>

        {/* Emergency Response Pill */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors">
            <Zap className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Emergency Response</span>
          </div>
        </div>

        {/* User + Logout */}
        <div className="border-t border-border px-3 py-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/60">
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold", config.iconBg)}>
              {config.user.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">{config.user}</p>
              <p className="text-[10px] text-muted-foreground leading-tight truncate">{config.userRole}</p>
            </div>
          </div>
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary text-xs font-medium cursor-pointer transition-all">
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Switch Role</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header with tabs */}
        <header className="h-14 shrink-0 bg-card border-b border-border flex items-center justify-between px-8">
          <div className="flex items-center gap-1.5">
            {/* Horizontal tabs */}
            {config.topTabs.map((tab) => (
              <div
                key={tab.label}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold cursor-pointer transition-all",
                  tab.active
                    ? "text-primary border-b-2 border-primary bg-transparent rounded-none"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              System Operational
            </div>
            <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white", config.iconBg)}>
              {config.user.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
