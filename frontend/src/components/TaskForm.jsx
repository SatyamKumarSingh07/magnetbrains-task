import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from '../api/axiosInstance'
import { getUser } from '../utils/auth'

export default function TaskForm({ onSuccess, onCancel, existingTask }) {
  const currentUser = getUser()
  const [users, setUsers] = useState([]) // for admin assign list

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: existingTask || { title: '', description: '', dueDate: '', priority: 'MEDIUM', status: 'PENDING', assignedTo: '' }
  })

  useEffect(() => {
    reset(existingTask || { title: '', description: '', dueDate: '', priority: 'MEDIUM', status: 'PENDING', assignedTo: '' })
  }, [existingTask, reset])

  useEffect(() => {
    // if current user is admin, fetch users to show in assign dropdown
    if (currentUser?.role === 'admin') {
      (async () => {
        try {
          const res = await axios.get('/users') // admin-only
          setUsers(res.data || [])
        } catch (err) {
          console.error('Failed to fetch users for assign', err)
        }
      })()
    }
  }, [currentUser])

  async function onSubmit(data) {
    try {
      if (data.dueDate === '') data.dueDate = null

      // If non-admin, ensure assignedTo is either blank or own id
      if (currentUser?.role !== 'admin') {
        data.assignedTo = currentUser?._id
      } else {
        // admin may leave blank or choose user
        if (!data.assignedTo) data.assignedTo = null
      }

      if (existingTask) {
        await axios.put(`/tasks/${existingTask._id}`, data)
      } else {
        await axios.post('/tasks', data)
      }
      onSuccess && onSuccess()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative bg-white rounded-xl shadow-lg border p-6 mb-6">
      <button type="button" onClick={onCancel} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-2xl">&times;</button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600">Title</label>
          <input {...register('title', { required: true })} className="mt-1 w-full p-2 border rounded" />
          {errors.title && <div className="text-red-500 text-sm mt-1">Title required</div>}
        </div>

        <div>
          <label className="block text-sm text-slate-600">Due date</label>
          <input type="date" {...register('dueDate')} className="mt-1 w-full p-2 border rounded" />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-slate-600">Description</label>
        <textarea {...register('description')} className="mt-1 w-full p-2 border rounded" rows={3} />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div>
          <label className="block text-xs text-slate-600 mb-1">Priority</label>
          <select {...register('priority')} className="p-2 border rounded">
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-600 mb-1">Status</label>
          <select {...register('status')} className="p-2 border rounded">
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="ml-auto">
          <label className="block text-xs text-slate-600 mb-1">Assign to</label>
          { currentUser?.role === 'admin' ? (
            <select {...register('assignedTo')} className="p-2 border rounded">
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} — {u.email}</option>)}
            </select>
          ) : (
            <div className="text-sm text-slate-600 p-2">Assigned to: <strong>{currentUser?.name}</strong></div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-3 py-1 bg-indigo-600 text-white rounded">{isSubmitting ? 'Saving...' : existingTask ? 'Update' : 'Save'}</button>
      </div>
    </form>
  )
}
