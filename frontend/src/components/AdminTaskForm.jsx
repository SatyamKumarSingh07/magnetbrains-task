// frontend/src/components/AdminTaskForm.jsx
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from '../api/axiosInstance'

export default function AdminTaskForm({ users = [], existingTask = null, onCancel, onSuccess }) {
  // default values shape - ensure fields exist
  const defaults = {
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    assignedTo: ''
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: defaults
  })

  useEffect(() => {
    // normalize incoming existingTask (ensure fields and date format)
    if (existingTask) {
      const normalized = {
        title: existingTask.title || '',
        description: existingTask.description || '',
        priority: existingTask.priority || 'MEDIUM',
        status: existingTask.status || 'PENDING',
        assignedTo: existingTask.assignedTo ? (existingTask.assignedTo._id || existingTask.assignedTo) : '',
        dueDate: ''
      }
      if (existingTask.dueDate) {
        const d = new Date(existingTask.dueDate)
        // format to yyyy-mm-dd for <input type="date">
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        normalized.dueDate = `${yyyy}-${mm}-${dd}`
      }
      reset(normalized)
    } else {
      reset(defaults)
    }
  }, [existingTask, reset])

  async function onSubmit(data) {
    try {
      // backend expects null for empty dueDate
      if (!data.dueDate) data.dueDate = null
      // if admin left assignedTo blank, send null
      if (!data.assignedTo) data.assignedTo = null

      if (existingTask) {
        await axios.put(`/tasks/${existingTask._id}`, data)
      } else {
        await axios.post('/tasks', data)
      }
      onSuccess && onSuccess()
    } catch (err) {
      console.error('admin task save', err)
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white/6 p-4 rounded mb-4 border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm text-slate-200">Title</label>
          <input
            {...register('title', { required: true })}
            className="mt-1 w-full p-2 rounded bg-white/5 border border-white/10 text-white"
          />
          {errors.title && <div className="text-rose-400 text-sm">Title required</div>}
        </div>

        <div>
          <label className="block text-sm text-slate-200">Due date</label>
          <input
            type="date"
            {...register('dueDate')}
            className="mt-1 w-full p-2 rounded bg-white/5 border border-white/10 text-white"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-slate-200">Description</label>
          <textarea
            {...register('description')}
            className="mt-1 w-full p-2 rounded bg-white/5 border border-white/10 text-white"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-200">Priority</label>
          <select {...register('priority')} className="mt-1 w-full p-2 rounded bg-white/5 border border-white/10 text-white">
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-200">Status</label>
          <select {...register('status')} className="mt-1 w-full p-2 rounded bg-white/5 border border-white/10 text-white">
            <option value="PENDING">PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-200">Assign to</label>
          <select {...register('assignedTo')} className="mt-1 w-full p-2 rounded bg-white/5 border border-white/10 text-white">
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>
                {u.name} — {u.email}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-end justify-end md:col-span-3">
          <button type="button" onClick={onCancel} className="px-3 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-500 rounded">Save</button>
        </div>
      </div>
    </form>
  )
}
