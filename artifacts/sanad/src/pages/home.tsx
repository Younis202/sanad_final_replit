import React from "react";
import { Link } from "wouter";
import { ShieldAlert, HeartPulse, User, Building2, ChevronRight, Shield, Cpu, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}images/sanad-logo.png`}
              alt="Sanad"
              className="w-4.5 h-4.5 brightness-0 invert"
            />
          </div>
          <div>
            <span className="font-bold text-foreground text-sm tracking-wide">Sanad</span>
            <span className="text-muted-foreground text-xs ml-2 font-medium">HEALTH INTELLIGENCE</span>
          </div>
        </div>
        <nav className="flex items-center gap-1">
          {["Dashboard", "Analytics", "Population", "Resources"].map((t, i) => (
            <span key={t} className={`px-4 py-1.5 text-sm font-semibold rounded-full cursor-pointer transition-all ${i === 0 ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              {t}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="w-3.5 h-3.5" />
          <span className="font-medium">Ministry of Health — KSA</span>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-10 py-14 flex flex-col">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary mb-6 uppercase tracking-widest">
            <Shield className="w-3 h-3" />
            Secure Government Infrastructure — v2.4.1
          </div>
          <h1 className="text-[52px] font-bold text-foreground tracking-tight leading-[1.1] mb-5">
            National Digital Health<br />
            <span className="text-primary">Infrastructure Platform</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Sanad is Saudi Arabia's unified national health data backbone — connecting <strong className="text-foreground">450+ hospitals</strong>,{" "}
            <strong className="text-foreground">34 million citizen records</strong>, and AI-powered clinical decision support across the entire Kingdom.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
          <RoleCard
            href="/emergency"
            icon={ShieldAlert}
            label="Emergency Services"
            description="Instant critical patient data for first responders. Blood type, allergies, medications under 1 second."
            iconBg="bg-red-600"
            borderHover="hover:border-red-400 hover:shadow-red-100"
            tag="First Responders"
            tagStyle="bg-red-50 text-red-600"
            linkColor="text-red-600"
          />
          <RoleCard
            href="/doctor"
            icon={HeartPulse}
            label="Physician Portal"
            description="Complete patient history, AI-assisted drug interaction checking, risk scoring, and e-prescribing."
            iconBg="bg-primary"
            borderHover="hover:border-primary/50 hover:shadow-primary/10"
            tag="Clinical Staff"
            tagStyle="bg-primary/10 text-primary"
            linkColor="text-primary"
          />
          <RoleCard
            href="/citizen"
            icon={User}
            label="Citizen Portal"
            description="Secure access to personal medical records, prescriptions, lab results, and full visit history."
            iconBg="bg-amber-500"
            borderHover="hover:border-amber-400 hover:shadow-amber-100"
            tag="Citizens & Residents"
            tagStyle="bg-amber-50 text-amber-700"
            linkColor="text-amber-600"
          />
          <RoleCard
            href="/admin"
            icon={Building2}
            label="Ministry Analytics"
            description="Population health intelligence, regional breakdowns, and national system oversight command center."
            iconBg="bg-emerald-600"
            borderHover="hover:border-emerald-400 hover:shadow-emerald-100"
            tag="Ministry Officials"
            tagStyle="bg-emerald-50 text-emerald-700"
            linkColor="text-emerald-600"
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {[
            { icon: User, value: "34.2M+", label: "Registered Citizens" },
            { icon: Building2, value: "450+", label: "Connected Hospitals" },
            { icon: Cpu, value: "99.99%", label: "System Uptime SLA" },
            { icon: Shield, value: "50M SAR", label: "National Investment" },
          ].map(({ icon: Icon, value, label }, i) => (
            <div key={label} className={`flex flex-col items-center justify-center py-7 text-center ${i < 3 ? "border-r border-border" : ""}`}>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground tabular-nums mb-0.5">{value}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-border bg-card px-10 py-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">© 2026 Ministry of Health — Kingdom of Saudi Arabia. All rights reserved.</p>
        <p className="text-xs text-muted-foreground font-mono">SANAD v2.4.1 · RESTRICTED</p>
      </footer>
    </div>
  );
}

function RoleCard({ href, icon: Icon, label, description, iconBg, borderHover, tag, tagStyle, linkColor }: any) {
  return (
    <Link href={href}>
      <div className={`group relative flex flex-col h-full p-5 bg-card border-2 border-border rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${borderHover}`}>
        <div className="flex items-start justify-between mb-5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${iconBg}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 uppercase tracking-wide ${tagStyle}`}>{tag}</span>
        </div>
        <h3 className="text-base font-bold text-foreground mb-2">{label}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
        <div className={`mt-5 flex items-center gap-1.5 text-xs font-bold ${linkColor}`}>
          Access Portal <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
