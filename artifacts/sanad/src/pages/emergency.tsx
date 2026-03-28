import React, { useState } from "react";
import {
  Search, AlertTriangle, Droplet, Pill, FileWarning,
  PhoneCall, Activity, ChevronRight, Clock, Zap
} from "lucide-react";
import { Layout } from "@/components/layout";
import {
  Card, CardHeader, CardTitle, CardBody,
  Input, Button, Badge, PageHeader, StatusDot, DataLabel
} from "@/components/shared";
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
    if (nationalId.trim()) setSubmittedId(nationalId.trim());
  };

  return (
    <Layout role="emergency">
      {/* Emergency Mode Banner — like the red badge in screenshot */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest">
          <Zap className="w-3 h-3" />
          Emergency Mode Active
        </div>
      </div>

      <PageHeader
        title="Emergency Patient Lookup"
        subtitle="Instant access to life-critical patient information. Enter National ID to retrieve records."
      />

      {/* Search */}
      <Card className="mb-6 border-2 border-red-100">
        <CardBody className="p-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                autoFocus
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="Enter National ID number (e.g. 1000000001)"
                className="pl-10 h-10 font-mono text-sm"
              />
            </div>
            <Button type="submit" variant="destructive" size="md" className="shrink-0 bg-red-600 hover:bg-red-700">
              <Search className="w-4 h-4" /> Emergency Lookup
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Demo IDs: <span className="font-mono">1000000001</span> · <span className="font-mono">1000000003</span> · <span className="font-mono">1000000005</span> · <span className="font-mono">1000000023</span>
          </p>
        </CardBody>
      </Card>

      {isLoading && (
        <div className="flex items-center gap-3 text-muted-foreground py-16 justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500" />
          <span className="text-sm font-medium">Retrieving critical patient data...</span>
        </div>
      )}

      {isError && !isLoading && (
        <Card className="border-red-200 bg-red-50">
          <CardBody className="flex items-center gap-4 p-5">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-700">Patient Not Found</p>
              <p className="text-sm text-red-600/80 mt-0.5">No record for <span className="font-mono">{submittedId}</span>. Verify the National ID and retry.</p>
            </div>
          </CardBody>
        </Card>
      )}

      {patient && (
        <div className="space-y-4">
          {/* Critical Alerts — big red rounded card like in the screenshots */}
          {patient.criticalAlerts.length > 0 && (
            <Card className="bg-red-600 border-red-600 text-white">
              <CardBody className="flex items-start gap-4 p-5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Critical Medical Alert</p>
                  <p className="text-lg font-bold mb-2">
                    {patient.criticalAlerts[0]}
                  </p>
                  {patient.criticalAlerts.slice(1).map((a, i) => (
                    <p key={i} className="text-sm text-white/80 flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3" /> {a}
                    </p>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Patient Identity Row */}
          <div className="grid grid-cols-12 gap-4">
            {/* Main Identity */}
            <Card className="col-span-7 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Patient Identity</p>
                  <h2 className="text-3xl font-bold text-foreground leading-tight mb-2">{patient.fullName}</h2>
                  <p className="font-mono text-sm text-muted-foreground bg-secondary rounded-xl px-3 py-1.5 inline-block">
                    PATIENT ID: {patient.nationalId}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={patient.riskLevel === "critical" ? "destructive" : patient.riskLevel === "high" ? "warning" : "info"}
                    className="text-xs px-3 py-1 rounded-full"
                  >
                    {patient.riskLevel?.toUpperCase()} RISK
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Live</span>
                    <StatusDot status="active" />
                  </div>
                </div>
              </div>

              {/* Info grid inside card — like the screenshot's data cells */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-secondary rounded-2xl p-3.5">
                  <DataLabel label="Age / Sex">
                    <p className="text-lg font-bold text-foreground">{patient.age ?? "—"} <span className="text-muted-foreground font-normal text-sm">{patient.gender?.charAt(0)}</span></p>
                  </DataLabel>
                </div>
                <div className="bg-secondary rounded-2xl p-3.5 col-span-2">
                  <DataLabel label="Emergency Contact">
                    {patient.emergencyContact ? (
                      <div>
                        <p className="font-bold text-sm text-foreground">{patient.emergencyContact}</p>
                        <p className="font-mono text-primary font-bold">{patient.emergencyPhone}</p>
                      </div>
                    ) : <p className="text-sm text-muted-foreground">Not listed</p>}
                  </DataLabel>
                </div>
              </div>
            </Card>

            {/* Blood Type — large prominent */}
            <Card className="col-span-2 bg-red-50 border-red-100">
              <CardBody className="flex flex-col items-center justify-center py-8">
                <Droplet className="w-7 h-7 text-red-400 mb-2" />
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Blood Type</p>
                <p className="text-5xl font-bold text-red-600">{patient.bloodType}</p>
                {patient.riskLevel === "critical" && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2">CRITICAL</p>
                )}
              </CardBody>
            </Card>

            {/* Quick PhoneCall */}
            <Card className="col-span-3">
              <CardBody className="flex flex-col justify-center h-full p-5">
                <div className="flex items-center gap-2 mb-3">
                  <PhoneCall className="w-4 h-4 text-muted-foreground" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Emergency Contact</p>
                </div>
                {patient.emergencyContact ? (
                  <>
                    <p className="font-bold text-foreground">{patient.emergencyContact}</p>
                    <p className="text-xl font-bold text-primary font-mono mt-1">{patient.emergencyPhone}</p>
                  </>
                ) : <p className="text-sm text-muted-foreground">Not on record</p>}
              </CardBody>
            </Card>
          </div>

          {/* Clinical Data */}
          <div className="grid grid-cols-3 gap-4">
            {/* Allergies */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-red-500" />
                  <CardTitle>Known Allergies</CardTitle>
                </div>
                <Badge variant="destructive">{patient.allergies.length}</Badge>
              </CardHeader>
              <CardBody>
                {patient.allergies.length > 0 ? (
                  <div className="space-y-2">
                    {patient.allergies.map((a, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-2xl">
                        <StatusDot status="critical" />
                        <span className="text-sm font-bold text-red-700">{a}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No known allergies.</p>}
              </CardBody>
            </Card>

            {/* Conditions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <CardTitle>Chronic Conditions</CardTitle>
                </div>
                <Badge variant="default">{patient.chronicConditions.length}</Badge>
              </CardHeader>
              <CardBody>
                {patient.chronicConditions.length > 0 ? (
                  <div className="space-y-2">
                    {patient.chronicConditions.map((c, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-secondary rounded-2xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-sm font-semibold text-foreground">{c}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">None on record.</p>}
              </CardBody>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-amber-600" />
                  <CardTitle>Active Medications</CardTitle>
                </div>
                <Badge variant="warning">{patient.currentMedications.length}</Badge>
              </CardHeader>
              <CardBody>
                {patient.currentMedications.length > 0 ? (
                  <div className="space-y-2">
                    {patient.currentMedications.map((med, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-secondary rounded-2xl">
                        <span className="text-sm font-semibold text-foreground">{med}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No active medications.</p>}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}
