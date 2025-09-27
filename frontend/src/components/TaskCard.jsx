// frontend/src/components/TaskCard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import axios from '../api/axiosInstance'

export default function TaskCard({ task, onRefresh, onEdit, onNotify }) {
  async function toggleStatus() {
    try {
      const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING'
      await axios.patch(`/tasks/${task._id}/status`, { status: newStatus })
      if (newStatus === 'COMPLETED') {
        onNotify && onNotify('Task completed', 'success')
      } else {
        onNotify && onNotify('Task marked pending', 'info')
      }
      onRefresh && onRefresh()
    } catch (err) {
      console.error(err)
      const code = err.response?.status
      if (code === 403) alert('You are not allowed to change this task.')
      else if (code === 401) alert('Unauthorized — please login again.')
      else alert('Could not update status')
    }
  }

  async function deleteTask() {
    if (!confirm('Delete this task?')) return
    try {
      await axios.delete(`/tasks/${task._id}`)
      onRefresh && onRefresh()
      onNotify && onNotify('Task deleted', 'info')
    } catch (e) {
      console.error(e)
      const status = e.response?.status
      if (status === 403) alert('You are not allowed to delete this task.')
      else alert('Delete failed')
    }
  }

  const priorityStyle =
    task.priority === 'HIGH'
      ? 'bg-red-50 border-red-200'
      : task.priority === 'MEDIUM'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-green-50 border-green-200'

  const completedStyle = task.status === 'COMPLETED' ? 'opacity-70 line-through' : ''

  return (
    <div className={`p-4 rounded-lg border ${priorityStyle} shadow-sm hover:shadow-md transition ${completedStyle}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link to={`/tasks/${task._id}`} className="block font-semibold text-slate-800">{task.title}</Link>
            {task.status === 'COMPLETED' && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">Completed</span>}
          </div>
          <div className="text-xs text-slate-600 mt-1">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Priority</div>
          <div className="text-sm font-medium">{task.priority}</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={toggleStatus} className={`text-xs px-3 py-1 rounded ${task.status === 'PENDING' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white/80 text-slate-800'}`}>
          {task.status === 'PENDING' ? 'Mark done' : 'Mark pending'}
        </button>

        <button onClick={() => onEdit && onEdit(task)} className="text-xs px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600">Edit</button>

        <button onClick={deleteTask} className="text-xs px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
      </div>
    </div>
  )
}
