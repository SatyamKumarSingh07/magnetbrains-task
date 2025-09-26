import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from '../api/axiosInstance'
import { saveAuth } from '../utils/auth'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(data) {
    setServerError('')
    try {
      const res = await axios.post('/auth/login', data)
      saveAuth(res.data)
      navigate('/')
    } catch (err) {
      const body = err.response?.data
      const details = body?.errors
      if (Array.isArray(details)) setServerError(body.message + ' — ' + details.map(d => d.msg).join(', '))
      else setServerError(body?.message || 'Login failed')
    }
  }

  return (
    <div className="min-w-fit min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-6">
      <div className="max-w-md w-full">
        {/* Glass card */}
        <div className="relative overflow-hidden rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md shadow-2xl">
          {/* decorative gradient accent */}
          <div aria-hidden className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-40 blur-3xl transform rotate-45"></div>

          <div className="relative p-8">


            {/* Server error */}
            {serverError && (
              <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-800/30 p-3 rounded">
                {serverError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-200 mb-1">Email</label>
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
                  placeholder="you@company.com"
                  className="w-full rounded-xl bg-white/6 border border-white/10 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-200 mb-1">Password</label>
                <input
                  type="password"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/6 border border-white/10 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between text-sm text-slate-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-indigo-400 w-4 h-4 rounded" />
                  <span className="text-slate-300/90">Remember me</span>
                </label>
                <Link to="#" className="text-indigo-200 hover:underline">Forgot?</Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl py-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-95 transition disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <div className="text-xs text-slate-300">or continue with</div>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Social buttons */}
          
            {/* footer */}
            <p className="mt-6 text-center text-sm text-slate-300/80">
              Don't have an account? <Link to="/signup" className="text-indigo-200 hover:underline">Create one</Link>
            </p>
          </div>
        </div>

        {/* small caption below card */}
        <div className="mt-6 text-center text-xs text-slate-300/60">
          Built with ♥ • Taskify
        </div>
      </div>
    </div>
  )
}
