import React from "react";
import { Link, useLocation } from "wouter";
import {
  ShieldAlert, HeartPulse, User, Building2,
  LayoutDashboard, ChevronRight, LogOut,
  Globe, Bell, Settings
} from "lucide-react";
import { cn } from "./shared";

type Role = "emergency" | "doctor" | "citizen" | "admin";

const roleConfigs: Record<Role, {
  label: string;
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  nav: { href: string; icon: React.ElementType; label: string }[];
  user: string;
  dept: string;
}> = {
  emergency: {
    label: "Emergency Services",
    icon: ShieldAlert,
    accentColor: "text-red-400",
    accentBg: "bg-red-500",
    user: "First Responder Unit 7",
    dept: "Emergency Medical Services",
    nav: [
      { href: "/emergency", icon: ShieldAlert, label: "Emergency Lookup" },
    ],
  },
  doctor: {
    label: "Physician Portal",
    icon: HeartPulse,
    accentColor: "text-sky-400",
    accentBg: "bg-sky-500",
    user: "Dr. Ahmed Al-Rashidi",
    dept: "King Fahd Medical City",
    nav: [
      { href: "/doctor", icon: HeartPulse, label: "Patient Dashboard" },
    ],
  },
  citizen: {
    label: "Citizen Health Portal",
    icon: User,
    accentColor: "text-amber-400",
    accentBg: "bg-amber-500",
    user: "Citizen Access",
    dept: "National Health Record",
    nav: [
      { href: "/citizen", icon: User, label: "My Health Records" },
    ],
  },
  admin: {
    label: "Ministry of Health",
    icon: Building2,
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-500",
    user: "Ministry Admin",
    dept: "Population Health Oversight",
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
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col h-full" style={{ background: 'hsl(var(--sidebar))' }}>
        {/* Logo area */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}images/sanad-logo.png`}
              alt="Sanad"
              className="w-5 h-5 object-contain brightness-0 invert"
            />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight tracking-wide">SANAD</div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest leading-tight">National Health</div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/8 border border-white/10">
            <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", config.accentBg + "/20")}>
              <RoleIcon className={cn("w-4 h-4", config.accentColor)} />
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold leading-tight truncate">{config.label}</div>
              <div className="text-white/40 text-[10px] leading-tight mt-0.5">{config.dept}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto sidebar-scroll pb-4">
          <div className="px-3 pt-3 pb-2">
            <span className="text-white/30 text-[10px] font-semibold uppercase tracking-widest">Navigation</span>
          </div>
          {config.nav.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (location === "/" && item.href === "/");
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all",
                  isActive
                    ? "bg-white/12 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/6"
                )}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
                </div>
              </Link>
            );
          })}

          <div className="px-3 pt-5 pb-2">
            <span className="text-white/30 text-[10px] font-semibold uppercase tracking-widest">System</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/6 cursor-pointer transition-all">
            <Bell className="w-4 h-4 shrink-0" />
            <span>Notifications</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/6 cursor-pointer transition-all">
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </div>
        </nav>

        {/* User section + switch role */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold leading-tight truncate">{config.user}</div>
              <div className="text-white/35 text-[10px] leading-tight mt-0.5">Authenticated Session</div>
            </div>
          </div>
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/6 text-xs font-medium cursor-pointer transition-all">
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Switch Role</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-16 shrink-0 bg-card border-b border-border flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span className="font-medium text-foreground">Sanad</span>
            <ChevronRight className="w-3 h-3" />
            <span>{config.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-success/10 text-success border border-success/20 px-3 py-1.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
              System Operational
            </div>
            <div className="text-xs text-muted-foreground font-mono border border-border rounded px-2 py-1">
              {new Date().toLocaleDateString('en-SA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-background p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
