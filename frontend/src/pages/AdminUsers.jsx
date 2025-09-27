// frontend/src/pages/AdminUsers.jsx
import React, { useEffect, useState } from 'react'
import axios from '../api/axiosInstance'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await axios.get('/users')
      setUsers(Array.isArray(res.data) ? res.data : (res.data?.data || res.data || []))
    } catch (err) {
      console.error('load users error', err)
      alert('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createUser(e) {
    e.preventDefault()
    try {
      setSubmitting(true)
      await axios.post('/users', form)
      setForm({ name: '', email: '', password: '', role: 'user' })
      await load()
    } catch (err) {
      console.error('create user error', err)
      alert(err.response?.data?.message || 'Create failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function del(id) {
    if (!confirm('Delete user?')) return
    try {
      await axios.delete(`/users/${id}`)
      await load()
    } catch (err) {
      console.error('delete user error', err)
      alert('Delete failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/6 backdrop-blur rounded-xl p-6 shadow-sm border border-white/10">
        <h2 className="text-xl font-semibold mb-4 text-orange-800">Manage users</h2>

        {/* Form */}
        <form onSubmit={createUser} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm text-white mb-1">Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="w-full p-2 border rounded-md focus:ring-2 text-red-400 focus:ring-indigo-600"
              required
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm text-white mb-1">Email</label>
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              type="email"
              className="w-full p-2 border text-red-400 rounded-md focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm text-white mb-1">Password</label>
            <input
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              type="password"
              className="w-full p-2 border rounded-md text-red-400 focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          <div className="md:col-span-1 flex gap-2">
            <div className="flex-1">
              <label className="block text-sm text-white mb-1">Role</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full p-2 border rounded-md text-red-400"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </form>

        {/* Content */}
        {loading ? (
          <div className="py-8 text-center text-slate-600">Loading users…</div>
        ) : (
          <>
            {/* Desktop/table view */}
            <div className="hidden md:block">
              <div className="overflow-auto rounded-md border">
                <table className="w-full min-w-[640px] bg-white">
                  <thead className="bg-slate-500">
                    <tr>
                      <th className="text-left px-4 py-3 text-md font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-md font-medium">Email</th>
                      <th className="text-left px-4 py-3 text-md font-medium">Role</th>
                      <th className="px-4 py-3 text-sm font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-t">
                        <td className="px-4 py-3">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.role}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => del(u._id)}
                            className="px-3 py-1 bg-rose-500  text-white rounded-md hover:bg-rose-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-500">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/card view */}
            <div className="md:hidden space-y-3">
              {users.map(u => (
                <div key={u._id} className="p-3 bg-white rounded-lg shadow-sm border">
                  {/* Make the card vertically stacked, center text on mobile, button below */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-center">
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-600 mt-1 break-words max-w-full">{u.email}</div>
                      <div className="text-xs text-slate-500 mt-1">Role: <strong>{u.role}</strong></div>
                    </div>

                    <div className="w-full">
                      <button
                        onClick={() => del(u._id)}
                        className="w-full px-3 py-2 bg-rose-500 text-white rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && <div className="text-center text-slate-500 py-6">No users found</div>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
