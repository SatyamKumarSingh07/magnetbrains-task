import React from 'react'
import { useForm } from 'react-hook-form'
import axios from '../api/axiosInstance'

export default function TaskForm({ onSuccess, onCancel, existingTask }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: existingTask || { priority: 'MEDIUM', status: 'PENDING' }
  })

  async function onSubmit(data) {
    try {
      if (existingTask) await axios.put(`/tasks/${existingTask._id}`, data)
      else await axios.post('/tasks', data)
      onSuccess && onSuccess()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg border p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600">Title</label>
          <input {...register('title', { required: true })} className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 border-black" />
          {errors.title && <div className="text-red-500 text-sm mt-1">Title required</div>}
        </div>

        <div>
          <label className="block text-sm text-slate-600">Due date</label>
          <input type="date" {...register('dueDate')} className="mt-1 w-full p-2 border rounded border-black" />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-slate-600">Description</label>
        <textarea {...register('description')} className="mt-1 w-full p-2 border rounded border-black " rows={3} />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <select {...register('priority')} className="p-2 border rounded">
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select {...register('status')} className="p-2 border rounded">
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-3 py-1 bg-indigo-600 text-white rounded">
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}
