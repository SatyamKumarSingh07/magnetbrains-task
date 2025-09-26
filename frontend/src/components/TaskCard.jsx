import React from 'react'
import { Link } from 'react-router-dom'
import axios from '../api/axiosInstance'

export default function TaskCard({ task, onRefresh }) {
  async function toggleStatus() {
    try {
      await axios.patch(`/tasks/${task._id}/status`, { status: task.status === 'PENDING' ? 'COMPLETED' : 'PENDING' })
      onRefresh && onRefresh()
    } catch (err) {
      console.error(err)
      alert('Could not update status')
    }
  }

  async function deleteTask() {
    if (!confirm('Delete this task?')) return
    try {
      await axios.delete(`/tasks/${task._id}`)
      onRefresh && onRefresh()
    } catch (e) {
      console.error(e)
      alert('Delete failed')
    }
  }

  const priorityStyle =
    task.priority === 'HIGH'
      ? 'bg-red-50 border-red-200'
      : task.priority === 'MEDIUM'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-green-50 border-green-200'

  return (
    <div className={`p-4 rounded-lg border ${priorityStyle} shadow-sm hover:shadow-md transition`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/tasks/${task._id}`} className="block font-semibold text-slate-800">
            {task.title}
          </Link>
          <div className="text-xs text-slate-500 mt-1">
            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Priority</div>
          <div className="text-sm font-medium">{task.priority}</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={toggleStatus} className="text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">
          {task.status === 'PENDING' ? 'Mark done' : 'Mark pending'}
        </button>
        <button onClick={deleteTask} className="text-xs px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>
  )
}
