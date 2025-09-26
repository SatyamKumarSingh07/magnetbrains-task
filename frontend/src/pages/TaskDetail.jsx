import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { logout } from '../utils/auth'

export default function TaskDetail() {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`/tasks/${id}`)
        setTask(res.data)
      } catch (err) {
        if (err.response?.status === 401) logout()
        else if (err.response?.status === 404) navigate('/')
      }
    }
    load()
  }, [id])

  if (!task) return <div className="text-center py-20 text-slate-500">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-2">{task.title}</h2>
      <p className="text-sm text-slate-600 mb-4">Priority: <strong>{task.priority}</strong> • Status: <strong>{task.status}</strong></p>
      <p className="mb-6 text-slate-700">{task.description}</p>
      <div className="flex gap-3">
        <button onClick={() => navigate('/')} className="px-4 py-2 border rounded">Back</button>
      </div>
    </div>
  )
}
