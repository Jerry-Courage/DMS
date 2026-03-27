import React, { useState } from 'react'
import { X, FileText, Download, Loader } from 'lucide-react'
import api from '../api/axios'

const SECTORS = [
  { value: '', label: 'All Sectors' },
  { value: 'health', label: 'Health' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'mining', label: 'Mining' },
  { value: 'agrochemicals', label: 'Agrochemicals' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'telemast', label: 'Telemast' },
]

export default function AIReportModal({ onClose }) {
  const [sector, setSector] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/ai/report/', { sector })
      setReport(data)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Report generation failed')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    const blob = new Blob([report.report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DMS_Report_${sector || 'All'}_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-600">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-accent" />
            <h2 className="font-semibold text-white">AI Report Generator</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-5 border-b border-dark-600 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">Sector</label>
            <select
              value={sector}
              onChange={e => setSector(e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 bg-accent text-dark-900 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-yellow-300 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader size={15} className="animate-spin" /> : <FileText size={15} />}
            {loading ? 'Generating...' : 'Generate'}
          </button>
          {report && (
            <button
              onClick={download}
              className="flex items-center gap-2 bg-dark-700 border border-dark-500 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Download size={15} /> Download
            </button>
          )}
        </div>

        {/* Report Output */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader size={16} className="animate-spin text-accent" />
              Generating report for {sector || 'all sectors'}...
            </div>
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {report && !loading && (
            <div>
              <p className="text-xs text-gray-500 mb-3">Based on {report.company_count} companies</p>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{report.report}</pre>
            </div>
          )}
          {!report && !loading && !error && (
            <p className="text-gray-600 text-sm">Select a sector and click Generate to create an AI-powered report.</p>
          )}
        </div>
      </div>
    </div>
  )
}
