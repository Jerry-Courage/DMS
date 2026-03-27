import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Phone, FileText, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

const SECTOR_COLORS = {
  health: '#c8f135', agriculture: '#4ade80', mining: '#fb923c',
  agrochemicals: '#60a5fa', infrastructure: '#f472b6',
  hospitality: '#a78bfa', telemast: '#34d399',
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{children}</div>
    </div>
  )
}

export default function CompanyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [company, setCompany] = useState(null)

  useEffect(() => {
    api.get(`/companies/${id}/`).then(({ data }) => setCompany(data))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${company.company_name}"? This cannot be undone.`)) return
    await api.delete(`/companies/${id}/`)
    toast.success('Company deleted')
    navigate('/companies')
  }

  if (!company) return <div className="flex items-center justify-center h-full text-gray-600">Loading...</div>

  const fmt = (d) => d ? format(new Date(d), 'MMM d, yyyy') : '—'
  const accentColor = SECTOR_COLORS[company.sector] ?? '#c8f135'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-dark-800 border border-dark-600 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-dark-900 text-lg font-bold" style={{ backgroundColor: accentColor }}>
              {company.company_name[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{company.company_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-2 py-0.5 rounded-lg font-medium text-dark-900" style={{ backgroundColor: accentColor }}>
                  {company.sector_display}
                </span>
                {company.file_number && (
                  <span className="text-xs text-gray-500 font-mono">{company.file_number}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/companies/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 text-gray-400 hover:text-white rounded-xl text-sm transition-colors"
          >
            <Edit size={15} /> Edit
          </button>
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-red-900/50 text-red-400 hover:bg-red-900/20 rounded-xl text-sm transition-colors"
            >
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Company Info */}
      <Section title="Company Information">
        <DetailRow label="Phone Number" value={company.phone_number} />
        <DetailRow label="Type of Undertaking" value={company.type_of_undertaking} />
        <DetailRow label="Type of Application" value={company.type_of_application} />
        <DetailRow label="Location" value={company.location} />
        <DetailRow label="District" value={company.district} />
      </Section>

      {/* Invoice & Payment */}
      <Section title="Invoice & Payment">
        <DetailRow label="Date of Invoice" value={fmt(company.date_of_invoice)} />
        <DetailRow label="Invoice Number" value={company.invoice_number} />
        <DetailRow label="Payment Amount" value={company.payment_amount ? `GHS ${Number(company.payment_amount).toLocaleString()}` : null} />
      </Section>

      {/* Submission & Permit */}
      <Section title="Submission & Permit">
        <DetailRow label="Date of Submission" value={fmt(company.date_of_submission)} />
        <DetailRow label="Date Received from RG" value={fmt(company.date_received_from_rg)} />
        <DetailRow label="Date Permit Issued" value={fmt(company.date_of_permit_issued)} />
        <DetailRow label="Permit Number" value={company.permit_number} />
        <DetailRow label="Permit Expiry" value={fmt(company.permit_expiry_date)} />
      </Section>

      {/* Remarks */}
      {company.remarks && (
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-2">Remarks</h2>
          <p className="text-sm text-gray-400 whitespace-pre-wrap">{company.remarks}</p>
        </div>
      )}

      {/* Meta */}
      <div className="text-xs text-gray-600 flex gap-4">
        <span>Added {fmt(company.created_at)} {company.created_by_name && `by ${company.created_by_name}`}</span>
        {company.updated_at !== company.created_at && <span>Updated {fmt(company.updated_at)}</span>}
      </div>
    </div>
  )
}
