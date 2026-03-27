import React, { useState } from "react";
import { Search, AlertTriangle, Droplet, Pill, FileWarning, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { Card, Input, Button, Badge, PageHeader } from "@/components/shared";
import { useEmergencyLookup } from "@workspace/api-client-react";

export default function EmergencyPage() {
  const [nationalId, setNationalId] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const { data: patient, isLoading, isError } = useEmergencyLookup(
    submittedId || "",
    { query: { enabled: !!submittedId, retry: false } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (nationalId.trim()) {
      setSubmittedId(nationalId.trim());
    }
  };

  return (
    <Layout role="emergency">
      <PageHeader 
        title="Emergency Lookup" 
        subtitle="Instantly access life-saving critical patient data."
      />

      <Card className="p-2 mb-8 bg-card border-2 focus-within:border-destructive/50 transition-colors">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
            <Input 
              autoFocus
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="Scan or enter National ID (e.g. 1000000000)" 
              className="pl-14 h-16 text-2xl font-mono tracking-widest border-0 ring-0 focus-visible:ring-0 shadow-none bg-transparent"
            />
          </div>
          <Button type="submit" size="lg" variant="destructive" className="h-16 px-10 text-xl rounded-xl shrink-0">
            LOOKUP
          </Button>
        </form>
      </Card>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-destructive mb-4"></div>
          <p className="text-xl font-medium">Retrieving critical data...</p>
        </div>
      )}

      {isError && (
        <Card className="p-8 border-destructive/20 bg-destructive/5 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-destructive mb-2">Patient Not Found</h3>
          <p className="text-muted-foreground">Please verify the National ID number and try again.</p>
        </Card>
      )}

      {patient && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {patient.criticalAlerts.length > 0 && (
            <div className="bg-destructive text-destructive-foreground p-4 rounded-2xl flex items-start gap-4 shadow-lg shadow-destructive/20 animate-in slide-in-from-top-4">
              <AlertTriangle className="w-8 h-8 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-xl mb-1">CRITICAL ALERTS</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-lg">
                  {patient.criticalAlerts.map((alert, i) => (
                    <li key={i}>{alert}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 md:col-span-2 flex items-center justify-between bg-primary text-primary-foreground border-transparent">
              <div>
                <p className="text-primary-foreground/70 font-medium uppercase tracking-wider mb-1">Patient Name</p>
                <h2 className="text-4xl font-display font-bold">{patient.fullName}</h2>
                <p className="text-primary-foreground/80 mt-2 font-mono">ID: {patient.nationalId}</p>
              </div>
              <div className="text-right">
                <Badge variant={patient.riskLevel === 'critical' ? 'destructive' : 'warning'} className="text-lg px-4 py-1">
                  {patient.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
            </Card>

            <Card className="p-6 flex flex-col items-center justify-center bg-red-50 border-red-100 dark:bg-red-950/20">
              <Droplet className="w-10 h-10 text-red-500 mb-2" />
              <p className="text-muted-foreground font-medium uppercase tracking-wider mb-1">Blood Type</p>
              <h3 className="text-5xl font-display font-bold text-red-600">{patient.bloodType}</h3>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-destructive/20 shadow-destructive/5">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <FileWarning className="w-6 h-6 text-destructive" />
                <h3 className="text-xl font-bold text-foreground">Allergies</h3>
              </div>
              {patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, i) => (
                    <span key={i} className="px-4 py-2 bg-destructive/10 text-destructive rounded-xl font-bold text-lg">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No known allergies.</p>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Activity className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Chronic Conditions</h3>
              </div>
              {patient.chronicConditions.length > 0 ? (
                <ul className="space-y-3">
                  {patient.chronicConditions.map((cond, i) => (
                    <li key={i} className="flex items-center gap-3 text-lg font-medium">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {cond}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No chronic conditions.</p>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Pill className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-bold text-foreground">Current Medications</h3>
              </div>
              {patient.currentMedications.length > 0 ? (
                <ul className="space-y-3">
                  {patient.currentMedications.map((med, i) => (
                    <li key={i} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                      <span className="font-bold">{med}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Not currently taking any medications.</p>
              )}
            </Card>

            <Card className="p-6 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <PhoneCall className="w-6 h-6 text-muted-foreground" />
                <h3 className="text-xl font-bold text-foreground">Emergency Contact</h3>
              </div>
              {patient.emergencyContact ? (
                <div>
                  <p className="text-2xl font-bold mb-1">{patient.emergencyContact}</p>
                  <p className="text-xl text-primary font-mono">{patient.emergencyPhone}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No emergency contact listed.</p>
              )}
            </Card>
          </div>
        </motion.div>
      )}
    </Layout>
  );
}
