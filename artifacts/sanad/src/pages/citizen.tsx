import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Input, Button, PageHeader, Badge } from "@/components/shared";
import { useGetPatientByNationalId } from "@workspace/api-client-react";
import { Bell, Calendar, FileText, Activity } from "lucide-react";
import { format } from "date-fns";

export default function CitizenPortal() {
  const [loginId, setLoginId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { data: patient, isLoading } = useGetPatientByNationalId(
    loginId,
    { query: { enabled: isLoggedIn, retry: false } }
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(loginId.trim()) setIsLoggedIn(true);
  };

  if (!isLoggedIn || (!patient && !isLoading)) {
    return (
      <Layout role="citizen">
        <div className="max-w-md mx-auto mt-20">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <UserIcon className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Citizen Portal Access</h2>
            <p className="text-muted-foreground mb-8">Secure access to your national health records.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="Enter National ID" 
                className="text-center text-lg"
              />
              <Button type="submit" variant="accent" className="w-full">Secure Login</Button>
            </form>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout role="citizen">
        <div className="py-20 text-center text-muted-foreground">Loading your health records...</div>
      </Layout>
    );
  }

  return (
    <Layout role="citizen">
      <PageHeader 
        title={`Welcome, ${patient?.fullName.split(' ')[0]}`} 
        subtitle="Your consolidated national health dashboard."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Alerts / Insights Column */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-none">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-lg">Health Insights</h3>
            </div>
            <p className="text-primary-foreground/80 text-sm mb-4">
              Based on your recent lab results, your cholesterol levels have improved by 15%. Keep up the good work!
            </p>
            <Button variant="accent" size="sm" className="w-full">View Full Report</Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> My Conditions
            </h3>
            <div className="space-y-2">
              {patient?.chronicConditions?.map((c, i) => (
                <div key={i} className="p-3 bg-secondary rounded-lg font-medium">{c}</div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-border bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Active Prescriptions
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {patient?.medications?.filter(m => m.isActive).map(med => (
                <div key={med.id} className="flex justify-between items-center p-4 border border-border rounded-xl hover:border-primary transition-colors">
                  <div>
                    <h4 className="font-bold text-lg">{med.drugName}</h4>
                    <p className="text-muted-foreground">{med.dosage} • {med.frequency}</p>
                    <p className="text-xs text-muted-foreground mt-1">Prescribed by {med.prescribedBy} at {med.hospital}</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-border bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Recent Visits
              </h3>
            </div>
            <div className="divide-y divide-border">
              {patient?.visits?.slice(0,3).map(visit => (
                <div key={visit.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-foreground">{visit.hospital}</h4>
                      <Badge variant="outline">{visit.visitType}</Badge>
                    </div>
                    <p className="text-muted-foreground">{visit.department} • Dr. {visit.doctor}</p>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full shrink-0">
                    {format(new Date(visit.visitDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </Layout>
  );
}

// Extract small icon for the login view
function UserIcon(props: any) {
  return <User {...props} />;
}
