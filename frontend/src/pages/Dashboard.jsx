// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react'
import axios from '../api/axiosInstance'
import { logout, getUser } from '../utils/auth'
import TaskForm from '../components/TaskForm'
import PriorityColumn from '../components/PriorityColumn'
import Pagination from '../components/Pagination'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(false)

  const user = getUser()

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
    fetchTasks(1)
  }, [])

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

  // Visible tasks with filters
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black py-10 text-white rounded-tl-4xl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back{user?.name ? `, ${user.name}` : ''}! Here’s your task
              overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 bg-white/10 backdrop-blur border border-white/20 rounded-lg p-2 shadow-sm">
              <span className="text-xs text-slate-300">Total</span>
              <span className="text-lg font-semibold">{stats.total}</span>
              <span className="ml-2 text-xs text-slate-300">Pending</span>
              <span className="text-lg font-semibold text-amber-400">
                {stats.pending}
              </span>
              <span className="ml-2 text-xs text-slate-300">Completed</span>
              <span className="text-lg font-semibold text-emerald-400">
                {stats.completed}
              </span>
            </div>

            <button
              onClick={() => setShowCreate(s => !s)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>

            <button
              onClick={logout}
              className="px-3 py-2 border rounded-lg text-sm hover:bg-white/10 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/10 backdrop-blur rounded-xl border border-white/20 p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search tasks..."
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="rounded-lg border border-blac/40 bg-black/40 px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="mine">My tasks</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-lg border border-black/40 bg-black/40 px-3 py-2 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="due">Due date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create Task Form */}
        {showCreate && (
          <div className="mb-6">
            <TaskForm
              onSuccess={onTaskCreated}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        )}

        {/* Priority Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* High */}
          <div className="bg-gradient-to-br from-red-600/70 to-red-800/80 p-5 rounded-xl shadow-lg backdrop-blur hover:scale-[1.01] transition">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              🚨 High Priority
              <span className="ml-auto text-sm bg-white/20 px-2 py-0.5 rounded-full">
                {high.length}
              </span>
            </h2>
            <PriorityColumn
              title="High"
              items={high}
              priorityKey="HIGH"
              refresh={fetchTasks}
            />
          </div>

          {/* Medium */}
          <div className="bg-gradient-to-br from-amber-500/70 to-orange-600/80 p-5 rounded-xl shadow-lg backdrop-blur hover:scale-[1.01] transition">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              ⚡ Medium Priority
              <span className="ml-auto text-sm bg-white/20 px-2 py-0.5 rounded-full">
                {medium.length}
              </span>
            </h2>
            <PriorityColumn
              title="Medium"
              items={medium}
              priorityKey="MEDIUM"
              refresh={fetchTasks}
            />
          </div>

          {/* Low */}
          <div className="bg-gradient-to-br from-emerald-500/70 to-teal-700/80 p-5 rounded-xl shadow-lg backdrop-blur hover:scale-[1.01] transition">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              ✅ Low Priority
              <span className="ml-auto text-sm bg-white/20 px-2 py-0.5 rounded-full">
                {low.length}
              </span>
            </h2>
            <PriorityColumn
              title="Low"
              items={low}
              priorityKey="LOW"
              refresh={fetchTasks}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-between text-white text-sm">
          <span>{loading ? 'Loading...' : `Showing ${tasks.length} tasks`}</span>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={p => fetchTasks(p)}
          />
        </div>
      </div>
    </div>
  )
}
