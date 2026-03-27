import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import api from '../api/axios'

const SECTORS = [
  { value: 'health', label: 'Health' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'mining', label: 'Mining' },
  { value: 'agrochemicals', label: 'Agrochemicals' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'telemast', label: 'Telemast' },
]

const EMPTY = {
  sector: 'health',
  phone_number: '',
  file_number: '',
  company_name: '',
  type_of_undertaking: '',
  location: '',
  district: '',
  type_of_application: '',
  date_of_invoice: '',
  invoice_number: '',
  payment_amount: '',
  date_of_submission: '',
  date_received_from_rg: '',
  date_of_permit_issued: '',
  permit_number: '',
  permit_expiry_date: '',
  remarks: '',
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"

export default function CompanyFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/companies/${id}/`).then(({ data }) => {
        const cleaned = {}
        Object.keys(EMPTY).forEach(k => { cleaned[k] = data[k] ?? '' })
        setForm(cleaned)
      })
    }
  }, [id, isEdit])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form }
      // Convert empty strings to null for date/number fields
      ;['date_of_invoice', 'date_of_submission', 'date_received_from_rg', 'date_of_permit_issued', 'permit_expiry_date'].forEach(f => {
        if (!payload[f]) payload[f] = null
      })
      if (!payload.payment_amount) payload.payment_amount = null

      if (isEdit) {
        await api.patch(`/companies/${id}/`, payload)
        toast.success('Company updated')
      } else {
        const { data } = await api.post('/companies/', payload)
        toast.success('Company added')
        navigate(`/companies/${data.id}`)
        return
      }
      navigate(`/companies/${id}`)
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-dark-800 border border-dark-600 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{isEdit ? 'Edit Company' : 'Add Company'}</h1>
          <p className="text-gray-500 text-sm">Fill in the company details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sector */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Sector</h2>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm({ ...form, sector: s.value })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  form.sector === s.value
                    ? 'bg-accent text-dark-900'
                    : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-500'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Name" required>
              <input type="text" value={form.company_name} onChange={set('company_name')} required className={inputCls} placeholder="Enter company name" />
            </Field>
            <Field label="File Number">
              <input type="text" value={form.file_number} onChange={set('file_number')} className={inputCls} placeholder="e.g. FILE/2024/001" />
            </Field>
            <Field label="Phone Number">
              <input type="text" value={form.phone_number} onChange={set('phone_number')} className={inputCls} placeholder="+233..." />
            </Field>
            <Field label="Type of Undertaking">
              <input type="text" value={form.type_of_undertaking} onChange={set('type_of_undertaking')} className={inputCls} placeholder="e.g. Manufacturing" />
            </Field>
            <Field label="Location">
              <input type="text" value={form.location} onChange={set('location')} className={inputCls} placeholder="Physical address" />
            </Field>
            <Field label="District">
              <input type="text" value={form.district} onChange={set('district')} className={inputCls} placeholder="e.g. Accra Metropolitan" />
            </Field>
            <Field label="Type of Application">
              <input type="text" value={form.type_of_application} onChange={set('type_of_application')} className={inputCls} placeholder="e.g. New / Renewal" />
            </Field>
          </div>
        </div>

        {/* Invoice & Payment */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Invoice & Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Date of Invoice">
              <input type="date" value={form.date_of_invoice} onChange={set('date_of_invoice')} className={inputCls} />
            </Field>
            <Field label="Invoice Number">
              <input type="text" value={form.invoice_number} onChange={set('invoice_number')} className={inputCls} placeholder="INV-XXXX" />
            </Field>
            <Field label="Payment Amount">
              <input type="number" step="0.01" value={form.payment_amount} onChange={set('payment_amount')} className={inputCls} placeholder="0.00" />
            </Field>
          </div>
        </div>

        {/* Submission & Permit */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Submission & Permit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Date of Submission (Head/RG Office)">
              <input type="date" value={form.date_of_submission} onChange={set('date_of_submission')} className={inputCls} />
            </Field>
            <Field label="Date Received from RG/Head Office">
              <input type="date" value={form.date_received_from_rg} onChange={set('date_received_from_rg')} className={inputCls} />
            </Field>
            <Field label="Date of Permit Issued">
              <input type="date" value={form.date_of_permit_issued} onChange={set('date_of_permit_issued')} className={inputCls} />
            </Field>
            <Field label="Permit Number">
              <input type="text" value={form.permit_number} onChange={set('permit_number')} className={inputCls} placeholder="PERMIT-XXXX" />
            </Field>
            <Field label="Permit Expiry Date">
              <input type="date" value={form.permit_expiry_date} onChange={set('permit_expiry_date')} className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Remarks */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <Field label="Remarks">
            <textarea
              value={form.remarks}
              onChange={set('remarks')}
              rows={3}
              className={inputCls}
              placeholder="Any additional notes..."
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-accent text-dark-900 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-yellow-300 transition-colors disabled:opacity-60"
          >
            <Save size={16} />
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Company'}
          </button>
        </div>
      </form>
    </div>
  )
}
