import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import api from '../api/axios'

export default function PermitAlertsPanel() {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('expiring')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/ai/permit-alerts/?days=30').then(r => setData(r.data))
  }, [])

  const list = tab === 'expiring' ? data?.expiring_soon : data?.expired
  const expiredCount = data?.expired?.length ?? 0
  const expiringCount = data?.expiring_soon?.length ?? 0

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={16} className={expiredCount > 0 ? 'text-red-400' : 'text-gray-400'} />
        <h2 className="text-sm font-semibold text-white">Permit Alerts</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('expiring')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            tab === 'expiring' ? 'bg-yellow-900/40 text-yellow-400' : 'text-gray-500 hover:text-white'
          }`}
        >
          Expiring Soon
          {expiringCount > 0 && <span className="bg-yellow-400 text-dark-900 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">{expiringCount}</span>}
        </button>
        <button
          onClick={() => setTab('expired')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            tab === 'expired' ? 'bg-red-900/40 text-red-400' : 'text-gray-500 hover:text-white'
          }`}
        >
          Expired
          {expiredCount > 0 && <span className="bg-red-400 text-dark-900 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">{expiredCount}</span>}
        </button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {!data && <p className="text-xs text-gray-600 py-2">Loading...</p>}
        {data && list?.length === 0 && (
          <p className="text-xs text-gray-600 py-2">
            {tab === 'expiring' ? 'No permits expiring in the next 30 days.' : 'No expired permits.'}
          </p>
        )}
        {list?.map(c => {
          const expiry = c.permit_expiry_date ? new Date(c.permit_expiry_date) : null
          const daysLeft = expiry ? differenceInDays(expiry, new Date()) : null
          return (
            <div
              key={c.id}
              onClick={() => navigate(`/companies/${c.id}`)}
              className="flex items-center justify-between p-3 rounded-xl bg-dark-700 hover:bg-dark-600 cursor-pointer transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate group-hover:text-accent transition-colors">{c.company_name}</p>
                <p className="text-xs text-gray-500">{c.sector_display} · {c.district || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {expiry && (
                  <span className={`text-xs font-medium ${daysLeft !== null && daysLeft < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {daysLeft !== null && daysLeft < 0
                      ? `${Math.abs(daysLeft)}d ago`
                      : `${daysLeft}d left`}
                  </span>
                )}
                <ChevronRight size={14} className="text-gray-600" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
