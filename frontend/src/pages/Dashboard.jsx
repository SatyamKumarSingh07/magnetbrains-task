// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { logout, getUser } from '../utils/auth'
import TaskForm from '../components/TaskForm'
import PriorityColumn from '../components/PriorityColumn'
import Pagination from '../components/Pagination'

export default function Dashboard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(false)

  const user = getUser()

  // Redirect admin users to admin dashboard — prevents admins from using normal dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [user, navigate])

  async function fetchTasks(p = 1) {
    setLoading(true)
    try {
      const res = await axios.get('/tasks', { params: { page: p, limit: 50 } })
      setTasks(res.data.data || [])
      setTotalPages(res.data.pages || 1)
      setPage(res.data.page || p)
    } catch (err) {
      console.error(err)
      if (err.response?.status === 401) logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // don't fetch if admin (we already redirected) — but keep a guard
    if (user && user.role === 'admin') return
    fetchTasks(1)
  }, [user])

  function onTaskCreated() {
    setShowCreate(false)
    fetchTasks(1)
  }

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length
    const pending = tasks.filter(t => t.status === 'PENDING').length
    const completed = tasks.filter(t => t.status === 'COMPLETED').length
    return { total, pending, completed }
  }, [tasks])

  const visibleTasks = useMemo(() => {
    let list = [...tasks]
    if (q.trim()) {
      const qq = q.toLowerCase()
      list = list.filter(
        t =>
          (t.title || '').toLowerCase().includes(qq) ||
          (t.description || '').toLowerCase().includes(qq)
      )
    }
    if (filter === 'mine') list = list.filter(t => t.createdBy?._id === user?._id)
    if (filter === 'overdue')
      list = list.filter(
        t =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== 'COMPLETED'
      )
    if (sortBy === 'due')
      list.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
    else if (sortBy === 'oldest')
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return list
  }, [tasks, q, filter, sortBy, user])

  const high = visibleTasks.filter(t => t.priority === 'HIGH')
  const medium = visibleTasks.filter(t => t.priority === 'MEDIUM')
  const low = visibleTasks.filter(t => t.priority === 'LOW')

  // If user not set yet, return null (guard). Admins get redirected above.
  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black py-10 text-white rounded-tl-4xl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
            <p className="text-md text-black mt-1">
              Manage tasks — quick overview of priorities, status and upcoming work.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 bg-white/80 border border-slate-400 rounded-lg p-2 shadow-sm">
              <div className="text-xs text-slate-500">Total</div>
              <div className="text-lg font-semibold text-slate-900">{stats.total}</div>

              <div className="ml-2 text-xs text-slate-500">Pending</div>
              <div className="text-lg font-semibold text-amber-600">{stats.pending}</div>

              <div className="ml-2 text-xs text-slate-500">Completed</div>
              <div className="text-lg font-semibold text-emerald-600">{stats.completed}</div>
            </div>

            <button
              onClick={() => setShowCreate(s => !s)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow"
            >
              New Task
            </button>

            <button onClick={logout} className="px-3 py-2 border rounded-lg text-sm">Logout</button>
          </div>
        </div>

        {/* Controls: search / filter / sort */}
        <div className="bg-white rounded-xl border p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <label className="sr-only">Search tasks</label>
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by title or description..."
                  className="w-full rounded-lg border px-4 py-2 pr-10 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border px-3 py-2 bg-white">
                <option value="all">All tasks</option>
                <option value="mine">My tasks</option>
                <option value="overdue">Overdue</option>
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border px-3 py-2 bg-white">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="due">Due date</option>
              </select>

              <button onClick={() => { setQ(''); setFilter('all'); setSortBy('newest') }} className="px-3 py-2 border rounded-lg text-sm">Reset</button>
            </div>
          </div>
        </div>

        {showCreate && <TaskForm onSuccess={onTaskCreated} onCancel={() => setShowCreate(false)} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
              High
              <span className="ml-auto text-sm text-slate-500">{high.length}</span>
            </h2>
            <div className="space-y-4">
              <PriorityColumn title="High" items={high} priorityKey="HIGH" refresh={fetchTasks} />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
              Medium
              <span className="ml-auto text-sm text-slate-500">{medium.length}</span>
            </h2>
            <div className="space-y-4">
              <PriorityColumn title="Medium" items={medium} priorityKey="MEDIUM" refresh={fetchTasks} />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
              Low
              <span className="ml-auto text-sm text-slate-500">{low.length}</span>
            </h2>
            <div className="space-y-4">
              <PriorityColumn title="Low" items={low} priorityKey="LOW" refresh={fetchTasks} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onChange={(p) => fetchTasks(p)} />
        </div>
      </div>
    </div>
  )
}
