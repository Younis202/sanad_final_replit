import React from "react";
import { Link } from "wouter";
import { ShieldAlert, HeartPulse, User, Building2, ChevronRight, Globe, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-accent" />
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}images/sanad-logo.png`}
              alt="Sanad"
              className="w-4 h-4 object-contain brightness-0 invert"
            />
          </div>
          <span className="font-bold text-base tracking-wide text-primary">SANAD</span>
          <span className="text-border mx-2">|</span>
          <span className="text-sm text-muted-foreground">Saudi National Health Infrastructure</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="w-3.5 h-3.5" />
          <span>Ministry of Health — Kingdom of Saudi Arabia</span>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto w-full px-8 py-16 flex-1 flex flex-col">
          {/* Title block */}
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-3 py-1.5 text-xs font-semibold text-primary mb-6">
              <Shield className="w-3 h-3" />
              Secure Government Infrastructure — v2.4.1
            </div>
            <h1 className="text-5xl font-bold text-foreground tracking-tight leading-tight mb-4">
              National Digital Health<br />
              <span className="text-primary">Infrastructure Platform</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Sanad is Saudi Arabia's unified national health data backbone — connecting 450+ hospitals,
              34 million citizen records, and AI-powered clinical decision support across the entire Kingdom.
            </p>
          </div>

          {/* Module cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
            <ModuleCard
              href="/emergency"
              icon={ShieldAlert}
              label="Emergency Services"
              description="Instant critical patient data for first responders. Blood type, allergies, medications in under 1 second."
              accent="border-red-200 hover:border-red-400"
              iconBg="bg-red-50"
              iconColor="text-red-600"
              tag="First Responders"
              tagColor="bg-red-50 text-red-600 border-red-200"
            />
            <ModuleCard
              href="/doctor"
              icon={HeartPulse}
              label="Physician Portal"
              description="Full patient history, lab results, AI-assisted drug interaction checking, and e-prescribing."
              accent="border-blue-200 hover:border-blue-400"
              iconBg="bg-blue-50"
              iconColor="text-blue-700"
              tag="Clinical Staff"
              tagColor="bg-blue-50 text-blue-700 border-blue-200"
            />
            <ModuleCard
              href="/citizen"
              icon={User}
              label="Citizen Portal"
              description="Secure access to personal medical records, prescriptions, lab results, and visit history."
              accent="border-amber-200 hover:border-amber-400"
              iconBg="bg-amber-50"
              iconColor="text-amber-700"
              tag="Citizens & Residents"
              tagColor="bg-amber-50 text-amber-700 border-amber-200"
            />
            <ModuleCard
              href="/admin"
              icon={Building2}
              label="Ministry Analytics"
              description="Population health intelligence, regional breakdowns, and national system oversight dashboards."
              accent="border-emerald-200 hover:border-emerald-400"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-700"
              tag="Ministry Officials"
              tagColor="bg-emerald-50 text-emerald-700 border-emerald-200"
            />
          </div>

          {/* Stats footer */}
          <div className="grid grid-cols-4 gap-0 border border-border rounded-lg bg-card overflow-hidden">
            {[
              { value: "34.2M+", label: "Registered Citizens" },
              { value: "450+", label: "Connected Hospitals" },
              { value: "99.99%", label: "System Uptime SLA" },
              { value: "50M SAR", label: "National Investment" },
            ].map((stat, i) => (
              <div key={i} className={`p-6 text-center ${i < 3 ? "border-r border-border" : ""}`}>
                <p className="text-2xl font-bold text-primary tabular-nums mb-1">{stat.value}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-8 py-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">© 2026 Ministry of Health — Kingdom of Saudi Arabia. All rights reserved.</p>
        <p className="text-xs text-muted-foreground font-mono">SANAD Platform v2.4.1 · Classified: RESTRICTED</p>
      </footer>
    </div>
  );
}

function ModuleCard({
  href, icon: Icon, label, description, accent, iconBg, iconColor, tag, tagColor
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  tag: string;
  tagColor: string;
}) {
  return (
    <Link href={href}>
      <div className={`group relative flex flex-col h-full p-5 bg-card border-2 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${accent}`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${tagColor}`}>{tag}</span>
        </div>
        <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{label}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
        <div className={`mt-4 flex items-center gap-1 text-xs font-semibold transition-colors ${iconColor}`}>
          Access Portal <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
