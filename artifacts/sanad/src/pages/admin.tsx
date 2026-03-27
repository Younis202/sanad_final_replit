import React from "react";
import { Layout } from "@/components/layout";
import { PageHeader, Card } from "@/components/shared";
import { useGetAdminStats, useGetPopulationHealth } from "@workspace/api-client-react";
import { Users, Activity, ShieldAlert, Building } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: popHealth, isLoading: healthLoading } = useGetPopulationHealth();

  if (statsLoading || healthLoading) {
    return (
      <Layout role="admin">
        <div className="py-20 text-center text-muted-foreground animate-pulse">Aggregating national health data...</div>
      </Layout>
    );
  }

  const COLORS = ['#0F172A', '#0369A1', '#0EA5E9', '#38BDF8', '#7DD3FC'];

  return (
    <Layout role="admin">
      <PageHeader 
        title="Ministry of Health Analytics" 
        subtitle="Real-time national infrastructure metrics and population health."
      />

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Patients" value={stats.totalPatients.toLocaleString()} icon={Users} trend="+2.4%" />
          <StatCard title="Today's Visits" value={stats.totalVisitsToday.toLocaleString()} icon={Activity} trend="+12%" />
          <StatCard title="AI Interactions Blocked" value={stats.drugInteractionsBlocked.toLocaleString()} icon={ShieldAlert} color="text-success" />
          <StatCard title="Connected Hospitals" value={stats.hospitalsConnected.toLocaleString()} icon={Building} />
        </div>
      )}

      {/* Charts Grid */}
      {popHealth && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6">Monthly Visit Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={popHealth.monthlyVisitTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="visits" stroke="#0F172A" strokeWidth={3} dot={{r:4, strokeWidth:2}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="emergency" stroke="#DC2626" strokeWidth={3} dot={{r:4, strokeWidth:2}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6">Top Chronic Conditions</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popHealth.conditionBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="condition" type="category" axisLine={false} tickLine={false} tick={{fill: '#0F172A', fontWeight: 500}} />
                  <RechartsTooltip cursor={{fill: '#F1F5F9'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="count" fill="#0369A1" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6">Blood Type Distribution</h3>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popHealth.bloodTypeDistribution}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="bloodType"
                  >
                    {popHealth.bloodTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6">Age Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popHealth.ageDistribution} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="ageGroup" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                  <RechartsTooltip cursor={{fill: '#F1F5F9'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="count" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, trend, color = "text-primary" }: any) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-secondary ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && <span className="text-sm font-bold text-success bg-success/10 px-2 py-1 rounded-md">{trend}</span>}
      </div>
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
    </Card>
  );
}
