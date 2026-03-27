import React, { useState } from 'react'
import { Sparkles, Search, X, Loader } from 'lucide-react'
import api from '../api/axios'

export default function AISearchBar({ onResults }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsedFilters, setParsedFilters] = useState(null)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/ai/search/', { query })
      setParsedFilters(data.parsed_filters)
      onResults(data)
    } catch (err) {
      setError(err.response?.data?.error ?? 'AI search failed')
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setQuery('')
    setParsedFilters(null)
    setError(null)
    onResults(null)
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Sparkles size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Try: "mining companies in Accra with expired permits"'
            className="w-full bg-dark-800 border border-accent/40 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 bg-accent text-dark-900 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader size={15} className="animate-spin" /> : <Search size={15} />}
          {loading ? 'Thinking...' : 'AI Search'}
        </button>
        {parsedFilters && (
          <button type="button" onClick={clear} className="p-2.5 rounded-xl bg-dark-800 border border-dark-600 text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </form>

      {/* Show what AI parsed */}
      {parsedFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500">AI understood:</span>
          {Object.entries(parsedFilters).map(([k, v]) => v && (
            <span key={k} className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-lg">
              {k.replace(/_/g, ' ')}: {v}
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
