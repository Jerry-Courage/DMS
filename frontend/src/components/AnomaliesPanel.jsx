import React, { useState } from 'react'
import { AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const TYPE_STYLES = {
  duplicate: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/40',
  missing_data: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  expired_permit: 'bg-red-900/30 text-red-400 border-red-800/40',
  unusual: 'bg-orange-900/30 text-orange-400 border-orange-800/40',
}

const TYPE_LABELS = {
  duplicate: 'Duplicate',
  missing_data: 'Missing Data',
  expired_permit: 'Expired Permit',
  unusual: 'Unusual',
}

export default function AnomaliesPanel() {
  const [anomalies, setAnomalies] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const scan = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/ai/anomalies/')
      setAnomalies(data.anomalies)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" />
          <h2 className="text-sm font-semibold text-white">Data Anomalies</h2>
          {anomalies !== null && (
            <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${anomalies.length > 0 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
              {anomalies.length} found
            </span>
          )}
        </div>
        <button
          onClick={scan}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-yellow-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {anomalies !== null ? 'Re-scan' : 'Scan Now'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
          <RefreshCw size={14} className="animate-spin text-accent" />
          Scanning all records...
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {anomalies !== null && !loading && (
        anomalies.length === 0 ? (
          <p className="text-sm text-green-400 py-2">No anomalies detected. Data looks clean.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {anomalies.map((a, i) => (
              <div
                key={i}
                onClick={() => a.company_id && navigate(`/companies/${a.company_id}`)}
                className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity ${TYPE_STYLES[a.type] ?? TYPE_STYLES.unusual}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                      {TYPE_LABELS[a.type] ?? a.type}
                    </span>
                  </div>
                  <p className="text-xs font-medium truncate">{a.company_name}</p>
                  <p className="text-xs opacity-70 mt-0.5">{a.message}</p>
                </div>
                {a.company_id && <ChevronRight size={14} className="flex-shrink-0 mt-1 opacity-60" />}
              </div>
            ))}
          </div>
        )
      )}

      {anomalies === null && !loading && !error && (
        <p className="text-xs text-gray-600">Run a scan to detect duplicates, missing data, and other issues.</p>
      )}
    </div>
  )
}
