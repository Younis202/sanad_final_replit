import React, { useState } from "react";
import { Search, AlertTriangle, Droplet, Pill, FileWarning, PhoneCall, Activity, ChevronRight, Clock } from "lucide-react";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardBody, Input, Button, Badge, PageHeader, StatusDot } from "@/components/shared";
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
      <PageHeader
        title="Emergency Patient Lookup"
        subtitle="Instant access to life-critical patient information for first responders."
      />

      {/* Search Panel */}
      <Card className="mb-6 border-destructive/30">
        <CardBody className="p-5">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                autoFocus
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="Enter National ID number (e.g. 1000000001)"
                className="pl-10 h-10 font-mono text-base"
              />
            </div>
            <Button type="submit" variant="destructive" size="md" className="shrink-0">
              <Search className="w-4 h-4" /> Emergency Lookup
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 ml-1">
            Demo IDs: 1000000001 · 1000000003 · 1000000005 · 1000000023
          </p>
        </CardBody>
      </Card>

      {isLoading && (
        <div className="flex items-center gap-3 text-muted-foreground py-12 justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-destructive" />
          <span className="text-sm font-medium">Retrieving critical patient data...</span>
        </div>
      )}

      {isError && !isLoading && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardBody className="flex items-center gap-4 p-5">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-destructive">Patient Not Found</p>
              <p className="text-sm text-muted-foreground">No record found for National ID: <span className="font-mono">{submittedId}</span>. Please verify and retry.</p>
            </div>
          </CardBody>
        </Card>
      )}

      {patient && (
        <div className="space-y-5">
          {/* Critical Alerts Banner */}
          {patient.criticalAlerts.length > 0 && (
            <div className="bg-destructive text-white rounded-lg p-4 flex items-start gap-3 shadow-lg shadow-destructive/20">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm uppercase tracking-wide mb-1">Critical Medical Alerts</p>
                <ul className="space-y-0.5">
                  {patient.criticalAlerts.map((alert, i) => (
                    <li key={i} className="text-sm text-white/90 flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 shrink-0" /> {alert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Patient Identity Row */}
          <div className="grid grid-cols-12 gap-4">
            {/* Identity card */}
            <Card className="col-span-7">
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Patient Identity</p>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{patient.fullName}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-mono bg-secondary px-2 py-0.5 rounded text-xs">{patient.nationalId}</span>
                    <span>Age {patient.age}</span>
                    <span>·</span>
                    <span>{patient.gender}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <Badge variant={patient.riskLevel === 'critical' ? 'destructive' : patient.riskLevel === 'high' ? 'warning' : 'info'} className="text-xs px-2.5 py-1">
                    {patient.riskLevel?.toUpperCase()} RISK
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Live Data</span>
                    <StatusDot status="active" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Blood type card */}
            <Card className="col-span-2 border-red-200 bg-red-50">
              <CardBody className="flex flex-col items-center justify-center py-6">
                <Droplet className="w-6 h-6 text-red-500 mb-2" />
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Blood Type</p>
                <p className="text-4xl font-bold text-red-700">{patient.bloodType}</p>
              </CardBody>
            </Card>

            {/* Emergency contact card */}
            <Card className="col-span-3">
              <CardBody className="py-5">
                <div className="flex items-center gap-2 mb-3">
                  <PhoneCall className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Emergency Contact</p>
                </div>
                {patient.emergencyContact ? (
                  <>
                    <p className="font-semibold text-foreground">{patient.emergencyContact}</p>
                    <p className="text-lg font-bold text-primary font-mono mt-1">{patient.emergencyPhone}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Not listed</p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Clinical Data Row */}
          <div className="grid grid-cols-12 gap-4">
            {/* Allergies */}
            <Card className="col-span-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-destructive" />
                  <CardTitle>Known Allergies</CardTitle>
                </div>
                <Badge variant="destructive">{patient.allergies.length}</Badge>
              </CardHeader>
              <CardBody>
                {patient.allergies.length > 0 ? (
                  <div className="space-y-2">
                    {patient.allergies.map((allergy, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-destructive/5 border border-destructive/15 rounded-md">
                        <StatusDot status="critical" />
                        <span className="text-sm font-semibold text-destructive">{allergy}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No known allergies on record.</p>
                )}
              </CardBody>
            </Card>

            {/* Chronic Conditions */}
            <Card className="col-span-4">
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
                    {patient.chronicConditions.map((cond, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-secondary rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground">{cond}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No chronic conditions on record.</p>
                )}
              </CardBody>
            </Card>

            {/* Current Medications */}
            <Card className="col-span-4">
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
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-secondary rounded-md">
                        <span className="text-sm font-medium text-foreground">{med}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active medications.</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}
