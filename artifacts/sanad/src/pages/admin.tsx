import React from "react";
import { Layout } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardBody, KpiCard, Badge } from "@/components/shared";
import { useGetAdminStats, useGetPopulationHealth } from "@workspace/api-client-react";
import { Users, Activity, ShieldAlert, Building, TrendingUp, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const COLORS = ['#1e3a5f', '#1d4ed8', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: popHealth, isLoading: healthLoading } = useGetPopulationHealth();

  if (statsLoading || healthLoading) {
    return (
      <Layout role="admin">
        <div className="flex items-center gap-3 py-20 justify-center text-muted-foreground">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          <span className="text-sm">Aggregating national health data...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Ministry of Health — Analytics Command Center"
          subtitle="Real-time national infrastructure metrics and population health intelligence."
        />
        <div className="flex items-center gap-2 shrink-0 ml-6">
          <span className="text-xs text-muted-foreground font-medium">Data as of:</span>
          <span className="text-xs font-mono bg-secondary border border-border rounded px-2 py-1">
            {new Date().toLocaleString('en-SA', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard
            title="Registered Patients"
            value={stats.totalPatients.toLocaleString()}
            sub="Active national records"
            icon={Users}
            color="text-primary"
            trend="+2.4%"
          />
          <KpiCard
            title="Visits Today"
            value={stats.totalVisitsToday.toLocaleString()}
            sub="Across all facilities"
            icon={Activity}
            color="text-sky-600"
            trend="+12%"
          />
          <KpiCard
            title="AI Interactions Blocked"
            value={stats.drugInteractionsBlocked.toLocaleString()}
            sub="Drug conflicts prevented"
            icon={ShieldAlert}
            color="text-success"
          />
          <KpiCard
            title="Connected Hospitals"
            value={stats.hospitalsConnected.toLocaleString()}
            sub="Nationwide network"
            icon={Building}
            color="text-primary"
          />
        </div>
      )}

      {/* Alert summary strip */}
      {stats && stats.highRiskPatients > 0 && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-warning/8 border border-warning/25 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <p className="text-sm font-medium text-foreground">
            <span className="font-bold text-warning">{stats.highRiskPatients}</span> patients currently classified as high or critical risk require clinical follow-up.
          </p>
          <Badge variant="warning" className="ml-auto shrink-0">{stats.highRiskPatients} flagged</Badge>
        </div>
      )}

      {/* Charts Grid */}
      {popHealth && (
        <div className="grid grid-cols-12 gap-5">
          {/* Monthly Trend — wide */}
          <Card className="col-span-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <CardTitle>Monthly Visit Trend</CardTitle>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-3 h-0.5 bg-primary inline-block rounded" /> Total Visits
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-3 h-0.5 bg-destructive inline-block rounded" /> Emergency
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={popHealth.monthlyVisitTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '6px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="visits" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="emergency" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2 }} strokeDasharray="5 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Blood Type Pie — narrow */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Blood Type Distribution</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={popHealth.bloodTypeDistribution}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="bloodType"
                    >
                      {popHealth.bloodTypeDistribution.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: 12 }}
                      formatter={(value: any, name: any) => [`${value} patients`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-x-2 gap-y-1.5 mt-2">
                {popHealth.bloodTypeDistribution.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground font-mono">{d.bloodType}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Chronic Conditions Bar — half */}
          <Card className="col-span-6">
            <CardHeader>
              <CardTitle>Top Chronic Conditions</CardTitle>
              <Badge variant="default">{popHealth.conditionBreakdown?.length} conditions tracked</Badge>
            </CardHeader>
            <CardBody>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popHealth.conditionBreakdown}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 140, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="condition"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#374151', fontSize: 11, fontWeight: 500 }}
                      width={130}
                    />
                    <RechartsTooltip
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{ borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="#1e3a5f" radius={[0, 4, 4, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Age Distribution — half */}
          <Card className="col-span-6">
            <CardHeader>
              <CardTitle>Population Age Distribution</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popHealth.ageDistribution} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="ageGroup" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <RechartsTooltip
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{ borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="#1d4ed8" radius={[3, 3, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Regional table */}
          {stats?.regionalStats && stats.regionalStats.length > 0 && (
            <Card className="col-span-12">
              <CardHeader>
                <CardTitle>Regional Health Overview</CardTitle>
                <Badge variant="outline">{stats.regionalStats.length} regions</Badge>
              </CardHeader>
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Total Patients</th>
                    <th>Hospitals</th>
                    <th>High Risk Patients</th>
                    <th>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.regionalStats.map((r: any, i: number) => (
                    <tr key={i}>
                      <td className="font-semibold text-foreground">{r.region}</td>
                      <td className="font-mono tabular-nums">{r.patients?.toLocaleString()}</td>
                      <td className="tabular-nums">{r.hospitals}</td>
                      <td>
                        <span className="font-mono tabular-nums text-warning font-semibold">{r.highRisk ?? '—'}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-1.5 max-w-[80px]">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min((r.hospitals / 80) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{r.coverage ?? '—'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}
    </Layout>
  );
}
