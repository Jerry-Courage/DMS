import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Building2, TrendingUp, Clock, FileText } from 'lucide-react'
import api from '../api/axios'
import { format } from 'date-fns'
import AIInsightsPanel from '../components/AIInsightsPanel'
import AnomaliesPanel from '../components/AnomaliesPanel'
import PermitAlertsPanel from '../components/PermitAlertsPanel'
import AIReportModal from '../components/AIReportModal'

const SECTOR_COLORS = {
  health: '#c8f135', agriculture: '#4ade80', mining: '#fb923c',
  agrochemicals: '#60a5fa', infrastructure: '#f472b6',
  hospitality: '#a78bfa', telemast: '#34d399', energy: '#fbbf24',
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent ? 'bg-accent' : 'bg-dark-600'}`}>
          <Icon size={16} className={accent ? 'text-dark-900' : 'text-gray-400'} />
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-white">{value ?? '—'}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-xs">
        <p className="text-gray-400">{label}</p>
        <p className="text-accent font-bold">{payload[0].value} companies</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard/').then(r => setData(r.data))
  }, [])

  const totalSectors = data?.sector_counts?.length ?? 0

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Overview of all registered companies</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 bg-dark-800 border border-dark-600 text-gray-300 hover:text-white px-3 py-2 rounded-xl text-xs md:text-sm transition-colors"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Report</span>
          </button>
          <button
            onClick={() => navigate('/companies/new')}
            className="flex items-center gap-1.5 bg-accent text-dark-900 font-semibold px-3 py-2 rounded-xl text-xs md:text-sm hover:bg-yellow-300 transition-colors"
          >
            + <span className="hidden sm:inline">Add Company</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Companies" value={data?.total_companies} icon={Building2} accent />
        <StatCard label="Sectors" value={totalSectors} icon={TrendingUp} />
        <StatCard label="This Month" value={data?.monthly_registrations?.slice(-1)[0]?.count ?? 0} icon={Clock} />
      </div>

      {/* AI Insights */}
      <AIInsightsPanel />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Companies by Sector</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.sector_counts ?? []} barSize={22}>
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {(data?.sector_counts ?? []).map((entry) => (
                  <Cell key={entry.sector} fill={SECTOR_COLORS[entry.sector] ?? '#c8f135'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Registrations Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.monthly_registrations ?? []}>
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#c8f135" strokeWidth={2.5} dot={{ fill: '#c8f135', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Permit Alerts + Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PermitAlertsPanel />
        <AnomaliesPanel />
      </div>

      {/* Recent Companies */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Recently Added</h2>
          <button onClick={() => navigate('/companies')} className="text-xs text-accent hover:underline">View all</button>
        </div>
        <div className="space-y-2">
          {(data?.recent_companies ?? []).map(company => (
            <div
              key={company.id}
              onClick={() => navigate(`/companies/${company.id}`)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-700 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-900 text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: SECTOR_COLORS[company.sector] ?? '#c8f135' }}
                >
                  {company.company_name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium group-hover:text-accent transition-colors truncate">{company.company_name}</p>
                  <p className="text-xs text-gray-500 truncate">{company.sector_display} · {company.district || 'N/A'}</p>
                </div>
              </div>
              <span className="text-xs text-gray-600 flex-shrink-0 ml-2 hidden sm:block">
                {company.created_at ? format(new Date(company.created_at), 'MMM d, yyyy') : ''}
              </span>
            </div>
          ))}
          {!data?.recent_companies?.length && (
            <p className="text-center text-gray-600 text-sm py-6">No companies yet</p>
          )}
        </div>
      </div>

      {showReport && <AIReportModal onClose={() => setShowReport(false)} />}
    </div>
  )
}
