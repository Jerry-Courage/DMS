import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const EMPTY_FORM = { username: '', email: '', first_name: '', last_name: '', password: '', role: 'staff' }

function UserModal({ user, onClose, onSave }) {
  const isEdit = Boolean(user?.id)
  const [form, setForm] = useState(isEdit ? { ...user, password: '' } : EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const set = f => e => setForm({ ...form, [f]: e.target.value })
  const inputCls = "w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form }
      if (isEdit && !payload.password) delete payload.password
      if (isEdit) {
        await api.patch(`/users/${user.id}/`, payload)
        toast.success('User updated')
      } else {
        await api.post('/users/', payload)
        toast.success('User created')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.username?.[0] ?? 'Error saving user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-dark-600">
          <h2 className="font-semibold text-white">{isEdit ? 'Edit User' : 'Add User'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">First Name</label>
              <input type="text" value={form.first_name} onChange={set('first_name')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Last Name</label>
              <input type="text" value={form.last_name} onChange={set('last_name')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Username <span className="text-red-400">*</span></label>
            <input type="text" value={form.username} onChange={set('username')} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Password {isEdit && <span className="text-gray-600">(leave blank to keep)</span>}
              {!isEdit && <span className="text-red-400">*</span>}
            </label>
            <input type="password" value={form.password} onChange={set('password')} required={!isEdit} minLength={6} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Role</label>
            <select value={form.role} onChange={set('role')} className={inputCls}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-accent text-dark-900 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-yellow-300 disabled:opacity-60">
              <Check size={15} /> {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(null) // null | 'new' | user object

  const fetchUsers = () => api.get('/users/').then(({ data }) => setUsers(data.results ?? data))

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.username}"?`)) return
    await api.delete(`/users/${user.id}/`)
    toast.success('User deleted')
    fetchUsers()
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage staff and admin accounts</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 bg-accent text-dark-900 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-yellow-300 transition-colors"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-dark-600">
              {['Name', 'Username', 'Email', 'Role', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-dark-700 hover:bg-dark-700 transition-colors">
                <td className="px-4 py-3 text-white">
                  {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : '—'}
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{u.username}</td>
                <td className="px-4 py-3 text-gray-400">{u.email || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                    u.profile?.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-dark-600 text-gray-400'
                  }`}>
                    {u.profile?.role ?? 'staff'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setModal(u)} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-dark-600 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-dark-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-600">No users found</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {modal && (
        <UserModal
          user={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchUsers() }}
        />
      )}
    </div>
  )
}
