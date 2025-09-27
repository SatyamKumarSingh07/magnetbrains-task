import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from '../api/axiosInstance'

export default function TaskForm({ onSuccess, onCancel, existingTask }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: existingTask || { title: '', description: '', dueDate: '', priority: 'MEDIUM', status: 'PENDING' }
  })

  // Whenever existingTask changes (open edit or switch), reset the form values.
  useEffect(() => {
    reset(existingTask || { title: '', description: '', dueDate: '', priority: 'MEDIUM', status: 'PENDING' })
  }, [existingTask, reset])

  async function onSubmit(data) {
    try {
      // convert empty string dueDate into null so backend gets a clean value
      if (data.dueDate === '') data.dueDate = null

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative bg-white rounded-xl shadow-lg border p-6 mb-6"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-2xl leading-none"
        aria-label="Close form"
      >
        &times;
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600">Title</label>
          <input
            {...register('title', { required: true })}
            className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 border-amber-950 text-black"
            placeholder="Task title"
          />
          {errors.title && (
            <div className="text-red-500 text-sm mt-1">Title required</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-600">Due date</label>
          <input
            type="date"
            {...register('dueDate')}
            className="mt-1 w-full p-2 border rounded border-amber-950 text-black"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-slate-600">Description</label>
        <textarea
          {...register('description')}
          className="mt-1 w-full p-2 border rounded border-amber-950 text-black"
          rows={3}
          placeholder="Write a short description (optional)"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div>
          <label className="block text-sm text-slate-900 mb-1">Priority</label>
          <select {...register('priority')} className="p-2 border rounded text-amber-700">
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-900 mb-1">Status</label>
          <select {...register('status')} className="p-2 border rounded text-amber-800">
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-1 bg-indigo-600 text-white rounded"
          >
            {isSubmitting ? 'Saving...' : existingTask ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}
