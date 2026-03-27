import React, { useState } from 'react'
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../api/axios'

export default function AIInsightsPanel() {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [error, setError] = useState(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/ai/insights/')
      setInsight(data.insight)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-800 border border-accent/30 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
            <Sparkles size={13} className="text-dark-900" />
          </div>
          <h2 className="text-sm font-semibold text-white">AI Insights</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-yellow-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {insight ? 'Refresh' : 'Generate'}
          </button>
          {insight && (
            <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-white transition-colors">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
          <RefreshCw size={14} className="animate-spin text-accent" />
          Analyzing your data...
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {insight && expanded && (
        <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
      )}

      {!insight && !loading && !error && (
        <p className="text-xs text-gray-600">Click Generate to get an AI-powered analysis of your data.</p>
      )}
    </div>
  )
}
