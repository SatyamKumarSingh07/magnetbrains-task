// frontend/src/pages/AdminLogin.jsx
import React from 'react'
import { useForm } from 'react-hook-form'
import axios from '../api/axiosInstance'
import { saveAuth } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const navigate = useNavigate()

  async function onSubmit(data) {
    try {
      const res = await axios.post('/auth/login', data)
      // server returns { token, user }
      const { token, user } = res.data
      if (!user || user.role !== 'admin') {
        alert('Access denied — not an admin')
        return
      }
      saveAuth({ token, user })
      navigate('/admin') // go to admin dashboard
    } catch (err) {
      console.error('Admin login error', err)
      const msg = err.response?.data?.message || 'Login failed'
      alert(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md bg-white/6 backdrop-blur border border-white/10 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Admin Sign in</h2>
        <p className="text-sm text-slate-300 mb-4">Admin area — only administrators can sign in here.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300">Email</label>
            <input {...register('email', { required: true })} className="mt-1 w-full p-2 rounded border border-white/10 bg-white/5 text-white" placeholder="admin@example.com" />
            {errors.email && <div className="text-rose-400 text-sm mt-1">Email required</div>}
          </div>

          <div>
            <label className="block text-sm text-slate-300">Password</label>
            <input type="password" {...register('password', { required: true })} className="mt-1 w-full p-2 rounded border border-white/10 bg-white/5 text-white" placeholder="password" />
            {errors.password && <div className="text-rose-400 text-sm mt-1">Password required</div>}
          </div>

          <button disabled={isSubmitting} className="w-full py-2 bg-emerald-500 rounded text-white">
            {isSubmitting ? 'Signing in...' : 'Sign in as Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
