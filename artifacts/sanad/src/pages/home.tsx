import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShieldAlert, HeartPulse, User, Building2, Activity, Database, Users } from "lucide-react";
import { Card } from "@/components/shared";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Hero */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Sanad Infrastructure" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-6xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-4 bg-primary rounded-2xl mb-6 shadow-2xl shadow-primary/20">
            <img src={`${import.meta.env.BASE_URL}images/sanad-logo.png`} alt="Sanad" className="w-16 h-16" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground tracking-tight mb-4">
            SANAD
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Saudi Arabia's National Health Infrastructure
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        >
          <RoleCard 
            href="/emergency" 
            icon={ShieldAlert} 
            title="Emergency" 
            desc="Instant critical data lookup for first responders."
            color="text-destructive"
            bg="bg-destructive/10"
            border="hover:border-destructive/50"
          />
          <RoleCard 
            href="/doctor" 
            icon={HeartPulse} 
            title="Physician" 
            desc="Full patient history and AI-assisted prescribing."
            color="text-primary"
            bg="bg-primary/10"
            border="hover:border-primary/50"
          />
          <RoleCard 
            href="/citizen" 
            icon={User} 
            title="Citizen Portal" 
            desc="Access your personal medical records and alerts."
            color="text-accent"
            bg="bg-accent/10"
            border="hover:border-accent/50"
          />
          <RoleCard 
            href="/admin" 
            icon={Building2} 
            title="Ministry Admin" 
            desc="Population health analytics and system oversight."
            color="text-emerald-600"
            bg="bg-emerald-600/10"
            border="hover:border-emerald-600/50"
          />
        </motion.div>

        {/* Live Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl bg-card border border-border/50 rounded-2xl p-8 shadow-xl shadow-black/5"
        >
          <Stat icon={Users} label="Registered Citizens" value="34.2M+" />
          <Stat icon={Activity} label="System Uptime" value="99.99%" />
          <Stat icon={Database} label="Hospitals Connected" value="450+" />
        </motion.div>
      </div>
    </div>
  );
}

function RoleCard({ href, icon: Icon, title, desc, color, bg, border }: any) {
  return (
    <Link href={href} className={`block group`}>
      <Card className={`h-full p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${border} cursor-pointer`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${bg}`}>
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
        <h3 className="text-xl font-bold font-display mb-2 text-foreground group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground">{desc}</p>
      </Card>
    </Link>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="text-3xl font-display font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}
