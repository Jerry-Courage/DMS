import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, ChevronLeft, ChevronRight, X, Building2 } from 'lucide-react'
import api from '../api/axios'
import { format } from 'date-fns'
import AISearchBar from '../components/AISearchBar'

const SECTORS = [
  { value: '', label: 'All Sectors' },
  { value: 'health', label: 'Health' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'mining', label: 'Mining' },
  { value: 'agrochemicals', label: 'Agrochemicals' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'telemast', label: 'Telemast' },
  { value: 'energy', label: 'Energy' },
]

const SECTOR_BADGE = {
  health: 'bg-lime-900/40 text-lime-400',
  agriculture: 'bg-green-900/40 text-green-400',
  mining: 'bg-orange-900/40 text-orange-400',
  agrochemicals: 'bg-blue-900/40 text-blue-400',
  infrastructure: 'bg-pink-900/40 text-pink-400',
  hospitality: 'bg-purple-900/40 text-purple-400',
  telemast: 'bg-teal-900/40 text-teal-400',
  energy: 'bg-yellow-900/40 text-yellow-400',
}

const SECTOR_COLORS = {
  health: '#c8f135', agriculture: '#4ade80', mining: '#fb923c',
  agrochemicals: '#60a5fa', infrastructure: '#f472b6',
  hospitality: '#a78bfa', telemast: '#34d399', energy: '#fbbf24',
}

export default function CompaniesPage() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [aiResults, setAiResults] = useState(null)

  const [filters, setFilters] = useState({ search: '', sector: '', district: '', date_from: '', date_to: '' })
  const [applied, setApplied] = useState(filters)

  const fetchCompanies = useCallback(async () => {
    if (aiResults) return
    setLoading(true)
    try {
      const params = { page, ...applied }
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const { data } = await api.get('/companies/', { params })
      setCompanies(data.results)
      setCount(data.count)
    } finally {
      setLoading(false)
    }
  }, [page, applied, aiResults])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

  const handleAIResults = (data) => {
    if (!data) { setAiResults(null); return }
    setAiResults(data)
    setCompanies(data.results)
    setCount(data.count)
  }

  const applyFilters = () => { setApplied(filters); setPage(1); setShowFilters(false); setAiResults(null) }
  const clearFilters = () => {
    const empty = { search: '', sector: '', district: '', date_from: '', date_to: '' }
    setFilters(empty); setApplied(empty); setPage(1); setAiResults(null)
  }

  const totalPages = Math.ceil(count / 20)
  const hasActiveFilters = applied.sector || applied.district || applied.date_from || applied.date_to

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Companies</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">{count} records</p>
        </div>
        <button
          onClick={() => navigate('/companies/new')}
          className="flex items-center gap-1.5 bg-accent text-dark-900 font-semibold px-3 py-2 rounded-xl text-sm hover:bg-yellow-300 transition-colors"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Add Company</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search + Filter */}
      <div className="space-y-3">
        <AISearchBar onResults={handleAIResults} />
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search name, file no, permit..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm border transition-colors ${
              hasActiveFilters ? 'bg-accent text-dark-900 border-accent font-semibold' : 'bg-dark-800 border-dark-600 text-gray-400 hover:text-white'
            }`}
          >
            <Filter size={15} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && ' •'}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="p-2.5 rounded-xl bg-dark-800 border border-dark-600 text-gray-400 hover:text-red-400 transition-colors">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Sector</label>
            <select value={filters.sector} onChange={e => setFilters({ ...filters, sector: e.target.value })}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
              {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">District</label>
            <input type="text" value={filters.district} onChange={e => setFilters({ ...filters, district: e.target.value })}
              placeholder="e.g. Accra"
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Date From</label>
            <input type="date" value={filters.date_from} onChange={e => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Date To</label>
            <input type="date" value={filters.date_to} onChange={e => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <button onClick={() => setShowFilters(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={applyFilters} className="px-4 py-2 bg-accent text-dark-900 font-semibold rounded-xl text-sm hover:bg-yellow-300 transition-colors">
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Mobile: Card List */}
      <div className="md:hidden space-y-2">
        {loading && <p className="text-center text-gray-600 py-8">Loading...</p>}
        {!loading && companies.length === 0 && <p className="text-center text-gray-600 py-8">No companies found</p>}
        {companies.map(c => (
          <div
            key={c.id}
            onClick={() => navigate(`/companies/${c.id}`)}
            className="bg-dark-800 border border-dark-600 rounded-2xl p-4 cursor-pointer hover:border-accent/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-dark-900 text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: SECTOR_COLORS[c.sector] ?? '#c8f135' }}>
                {c.company_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-white truncate">{c.company_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-medium flex-shrink-0 ${SECTOR_BADGE[c.sector] ?? 'bg-gray-800 text-gray-400'}`}>
                    {c.sector_display}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {c.file_number && <span className="text-xs text-gray-500 font-mono">{c.file_number}</span>}
                  {c.district && <span className="text-xs text-gray-500">{c.district}</span>}
                  {c.permit_number && <span className="text-xs text-gray-500 font-mono">{c.permit_number}</span>}
                </div>
                {c.permit_expiry_date && (
                  <p className="text-xs text-gray-600 mt-1">
                    Expires: {format(new Date(c.permit_expiry_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                {['File No.', 'Company Name', 'Sector', 'District', 'Permit No.', 'Permit Expiry', 'Added'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-600">Loading...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-600">No companies found</td></tr>
              ) : companies.map(c => (
                <tr key={c.id} onClick={() => navigate(`/companies/${c.id}`)}
                  className="border-b border-dark-700 hover:bg-dark-700 cursor-pointer transition-colors group">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.file_number || '—'}</td>
                  <td className="px-4 py-3 text-white font-medium group-hover:text-accent transition-colors">{c.company_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${SECTOR_BADGE[c.sector] ?? 'bg-gray-800 text-gray-400'}`}>
                      {c.sector_display}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{c.district || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.permit_number || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {c.permit_expiry_date ? format(new Date(c.permit_expiry_date), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {c.created_at ? format(new Date(c.created_at), 'MMM d, yyyy') : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-600">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg bg-dark-700 text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-dark-700 text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="md:hidden flex items-center justify-between">
          <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-xl bg-dark-800 border border-dark-600 text-gray-400 hover:text-white disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-xl bg-dark-800 border border-dark-600 text-gray-400 hover:text-white disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
