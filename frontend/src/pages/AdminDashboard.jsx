// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import axios from '../api/axiosInstance'
import AdminTaskForm from '../components/AdminTaskForm'
import { getUser, logout } from '../utils/auth'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const me = getUser()

  useEffect(() => {
    if (!me || me.role !== 'admin') {
      window.location.href = '/admin/login'
    }
  }, [me])

  async function loadAll() {
    setLoading(true)
    try {
      const [uRes, tRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/tasks?limit=200')
      ])
      setUsers(Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || uRes.data || []))
      setTasks(tRes.data?.data || tRes.data || [])
    } catch (err) {
      console.error('admin load error', err)
      alert('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  async function onEditTask(task) {
    try {
      const res = await axios.get(`/tasks/${task._id}`)
      const full = res.data
      if (full.dueDate) {
        const d = new Date(full.dueDate)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        full.dueDate = `${yyyy}-${mm}-${dd}`
      } else full.dueDate = ''
      full.description = full.description || ''
      setEditing(full)
      setShowForm(true)
    } catch (err) {
      console.error('Failed to load full task for edit', err)
      alert('Could not load task details for editing.')
    }
  }

  async function handleDelete(taskId) {
    if (!confirm('Delete this task permanently?')) return
    try {
      await axios.delete(`/tasks/${taskId}`)
      loadAll()
      alert('Deleted')
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-slate-300">Manage users & tasks</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">Signed in as: <strong>{me?.name}</strong></div>
            <button onClick={logout} className="px-3 py-2 bg-white/6 rounded">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users list */}
          <div className="bg-white/5 p-3 md:p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Users</h3>
              <div className="text-sm text-slate-300">{users.length}</div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {users.map(u => (
                <div
                  key={u._id}
                  className="p-3 rounded bg-white/3 flex flex-col items-center md:flex-row md:items-center md:justify-between gap-3"
                >
                  {/* user info centered on mobile, left on md+ */}
                  <div className="min-w-0 text-center md:text-left">
                    <div className="font-medium truncate text-white">{u.name}</div>
                    <div className="text-xs text-slate-300 truncate mt-1 max-w-[28ch]">{u.email}</div>
                    <div className="text-xs text-slate-400 mt-1">Role: <strong className="text-slate-200">{u.role}</strong></div>
                  </div>

                  {/* Delete button: full width on mobile, inline on md+ */}
                  <div className="w-full md:w-auto flex-shrink-0">
                    <button
                      onClick={async () => {
                        if (!confirm('Delete user?')) return
                        try {
                          await axios.delete(`/users/${u._id}`)
                          loadAll()
                        } catch (err) {
                          console.error(err)
                          alert('Delete user failed')
                        }
                      }}
                      className="mt-3 md:mt-0 px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 w-full md:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {users.length === 0 && <div className="text-center text-slate-400 py-6">No users found</div>}
            </div>
          </div>

          {/* Tasks list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">All Tasks</h3>
              <div className="flex gap-2">
                <button onClick={openNew} className="px-3 py-2 bg-emerald-500 rounded">New Task</button>
                <button onClick={loadAll} className="px-3 py-2 border rounded">Refresh</button>
              </div>
            </div>

            {showForm && (
              <AdminTaskForm
                users={users}
                existingTask={editing}
                onCancel={() => { setShowForm(false); setEditing(null) }}
                onSuccess={() => { setShowForm(false); setEditing(null); loadAll() }}
              />
            )}

            <div className="space-y-3 mt-4 max-h-[65vh] overflow-auto">
              {loading ? <div>Loading...</div> : tasks.map(t => (
                <div
                  key={t._id}
                  className="p-4 bg-white/5 rounded flex flex-col items-center md:flex-row md:items-start md:justify-between gap-3"
                >
                  {/* Task info: center on mobile, left on md+ */}
                  <div className="min-w-0 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <div className="font-semibold truncate text-slate-900 max-w-[36ch]">{t.title}</div>
                      <div className="text-xs text-slate-300 whitespace-nowrap">{t.priority} • {t.status}</div>
                    </div>
                    <div className="text-xs text-slate-300 mt-2 truncate max-w-[60ch]">{t.description || '—'}</div>
                    <div className="text-xs text-slate-400 mt-2">
                      Created: {t.createdBy?.name || '—'} • Assigned: {t.assignedTo?.name || (typeof t.assignedTo === 'string' ? t.assignedTo : '—')}
                    </div>
                  </div>

                  {/* Buttons: stacked full-width on mobile, inline on md+ */}
                  <div className="w-full md:w-auto flex flex-col md:flex-row gap-2 flex-shrink-0">
                    <button
                      onClick={() => onEditTask(t)}
                      className="px-3 py-2 bg-amber-400 rounded text-black text-sm w-full md:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="px-3 py-2 bg-rose-500 rounded text-white text-sm w-full md:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && <div className="text-center text-slate-400 py-6">No tasks found</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
