// frontend/src/components/PriorityColumn.jsx
import React from 'react'
import TaskCard from './TaskCard'
import axios from '../api/axiosInstance'

export default function PriorityColumn({ title, items = [], priorityKey, refresh, onEdit, onNotify }) {
  async function changePriority(taskId, toPriority) {
    try {
      await axios.patch(`/tasks/${taskId}/priority`, { priority: toPriority })
      refresh && refresh()
    } catch (e) {
      console.error(e)
      alert('Could not change priority')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border p-4">
      <h3 className="font-semibold text-lg mb-3 text-slate-800">{title} <span className="text-sm text-slate-500">({items.length})</span></h3>

      <div className="space-y-3">
        {items.map((t) => (
          <div key={t._id}>
            <TaskCard task={t} onRefresh={refresh} onEdit={onEdit} onNotify={onNotify} />
            <div className="mt-2 flex flex-wrap gap-2">
              {['HIGH', 'MEDIUM', 'LOW'].filter((p) => p !== priorityKey).map((p) => (
                <button key={p} onClick={() => changePriority(t._id, p)} className="text-xs px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700">
                  Move to {p}
                </button>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-500 italic">No tasks</div>}
      </div>
    </div>
  )
}
